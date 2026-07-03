-- ACASPEX Portal Socios — RPC transaccional de renovación de pago
-- H0.9I-D
-- Resuelve D-H09G-002 (operación no transaccional en registerValidatedPaymentForRenewal).
-- Una sola transacción atómica: INSERT payments + UPDATE members.paid_until.
-- Solo administradores. No automatiza validación de justificantes.
-- No toca membership_start, member_profile, fee_amount, membership_periods.
-- No hace DELETE. No concede grants a anon.

create or replace function public.register_validated_renewal_payment(
  p_member_id uuid,
  p_amount numeric default null,
  p_receipt_file_path text default null,
  p_notes text default null
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_member public.members%rowtype;
  v_paid_until date;
  v_new_period_start date;
  v_new_period_end date;
  v_amount numeric(10,2);
  v_new_payment public.payments%rowtype;
begin
  if v_caller is null then
    raise exception 'No hay sesión activa'
      using errcode = '28000', detail = 'no_session';
  end if;

  if not public.is_admin() then
    raise exception 'No tienes permisos de administración'
      using errcode = '42501', detail = 'forbidden_not_admin';
  end if;

  select *
    into v_member
  from public.members
  where id = p_member_id
  for update;

  if not found then
    raise exception 'Socio no encontrado'
      using errcode = 'P0002', detail = 'member_not_found';
  end if;

  if v_member.status not in ('active', 'expired') then
    raise exception 'Solo se puede renovar la cuota de un socio en estado activo o vencido'
      using errcode = 'P0001', detail = 'member_status_invalid';
  end if;

  v_paid_until := v_member.paid_until;

  if v_paid_until is null then
    raise exception 'El socio no tiene paid_until definido'
      using errcode = 'P0001', detail = 'member_missing_dates';
  end if;

  v_new_period_start := (v_paid_until + interval '1 day')::date;
  v_new_period_end := (v_paid_until + interval '12 months')::date;

  v_amount := coalesce(p_amount, v_member.fee_amount);

  if v_amount is null then
    v_amount := case v_member.member_profile
      when 'general' then 50
      when 'residente' then 30
      when 'estudiante' then 30
      when 'jubilado' then 30
      else 50
    end;
  end if;

  if v_amount <= 0 then
    raise exception 'El importe debe ser mayor que cero'
      using errcode = 'P0001', detail = 'invalid_amount';
  end if;

  insert into public.payments (
    member_id,
    signup_request_id,
    amount,
    payment_method,
    payment_status,
    payment_period_start,
    payment_period_end,
    paid_until,
    receipt_file_path,
    validated_by,
    validated_at,
    notes
  ) values (
    p_member_id,
    null,
    v_amount,
    'bank_transfer',
    'validated',
    v_new_period_start,
    v_new_period_end,
    v_new_period_end,
    p_receipt_file_path,
    v_caller,
    now(),
    p_notes
  )
  returning * into v_new_payment;

  update public.members
  set
    paid_until = v_new_period_end,
    status = case
      when v_member.status = 'expired' then 'active'::public.member_status
      else v_member.status
    end
  where id = p_member_id;

  return v_new_payment;
end;
$$;

comment on function public.register_validated_renewal_payment(uuid, numeric, text, text) is
  'H0.9I-D: registra un pago validado de renovación y actualiza paid_until en una sola transacción atómica. Solo administradores. Resuelve D-H09G-002.';

revoke all on function public.register_validated_renewal_payment(uuid, numeric, text, text) from public;
grant execute on function public.register_validated_renewal_payment(uuid, numeric, text, text) to authenticated;
