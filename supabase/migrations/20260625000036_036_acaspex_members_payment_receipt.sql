-- ACASPEX Portal Socios — Justificante de pago en ficha de socio
-- H0.9B-STAGING-FIX5: almacena el comprobante de transferencia bancaria en la ficha.

alter table public.members
add column if not exists payment_receipt_file_path text;

comment on column public.members.payment_receipt_file_path is
  'Ruta privada en Storage para el justificante de pago por transferencia bancaria.';
