-- ACASPEX Portal Socios — prevent duplicate validated payments per member period
-- H0.9E-HARD1
-- 1) Limpia un duplicado introducido en validación funcional H0.9E-F2.
-- 2) Crea unique index parcial para impedir nuevos duplicados de payments validados.

delete from public.payments
where id = 'a3057487-06df-4051-a533-fbff8be82d73';

create unique index if not exists payments_validated_member_period_uidx
on public.payments (
  member_id,
  payment_period_start,
  payment_period_end
)
where payment_status = 'validated';

comment on index public.payments_validated_member_period_uidx is
  'H0.9E-HARD1: impide más de un payment validated por socio y periodo. Mantiene permitidos otros estados si existieran en el futuro.';
