-- ACASPEX Portal Socios — grants de acceso sobre payments
-- H0.9E-B
-- Concede SELECT, INSERT y UPDATE a authenticated para gestión admin de pagos.
-- Las RLS existentes limitan el acceso real a administradores.
-- No concede DELETE sobre payments.

grant select, insert, update on public.payments to authenticated;

comment on table public.payments is
  'Pagos y validaciones económicas de cuotas. Acceso desde cliente authenticated gobernado por RLS admin-only.';
