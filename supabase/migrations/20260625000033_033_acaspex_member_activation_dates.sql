-- ACASPEX Portal Socios — Cálculo automático de vigencia al activar
-- H0.9B: trigger before insert/update que asigna membership_start y paid_until
-- cuando un socio pasa a status = 'active'.

create or replace function public.set_member_activation_dates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' then
    if tg_op = 'INSERT' or old.status != 'active' then
      if new.membership_start is null then
        new.membership_start := current_date;
      end if;

      if new.paid_until is null then
        new.paid_until := (new.membership_start + interval '12 months')::date;
      end if;
    end if;
  end if;

  return new;
end;
$$;

comment on function public.set_member_activation_dates() is
  'Al activar un socio (status = active), asigna membership_start = current_date si está vacío y paid_until = membership_start + 12 meses si está vacío. No sobrescribe valores existentes.';

create trigger trg_members_activation_dates
  before insert or update on public.members
  for each row
  execute function public.set_member_activation_dates();
