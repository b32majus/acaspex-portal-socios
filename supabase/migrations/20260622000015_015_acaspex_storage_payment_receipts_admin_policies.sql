-- ACASPEX Portal Socios — Policies admin para justificantes de pago
-- H0.3c: crea policies admin-only para lectura y gestión de objetos
-- del bucket acaspex-payment-receipts. No modifica ni elimina la
-- policy de upload público creada en H0.3b.
-- Depende de las funciones auxiliares de H0.2a.
-- No contiene datos reales ni secretos.

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- Solo administradores pueden leer justificantes de pago.
-- Socios y Junta Directiva no tienen acceso de lectura.

create policy "payment_receipts_select_admin"
  on storage.objects
  for select
  using (
    bucket_id = 'acaspex-payment-receipts'
    and public.is_admin()
  );


-- ═══════════════════════════════════════════════════════════════════
-- INSERT — administradores (carga administrativa manual)
-- ═══════════════════════════════════════════════════════════════════
-- Los administradores también pueden subir justificantes para carga
-- administrativa manual, sin restricción de prefijo.
-- La subida pública controlada sigue vigente vía H0.3b.

create policy "payment_receipts_insert_admin"
  on storage.objects
  for insert
  with check (
    bucket_id = 'acaspex-payment-receipts'
    and public.is_admin()
  );


-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — solo administradores
-- ═══════════════════════════════════════════════════════════════════

create policy "payment_receipts_update_admin"
  on storage.objects
  for update
  using (
    bucket_id = 'acaspex-payment-receipts'
    and public.is_admin()
  )
  with check (
    bucket_id = 'acaspex-payment-receipts'
    and public.is_admin()
  );


-- ═══════════════════════════════════════════════════════════════════
-- DELETE — solo administradores
-- ═══════════════════════════════════════════════════════════════════

create policy "payment_receipts_delete_admin"
  on storage.objects
  for delete
  using (
    bucket_id = 'acaspex-payment-receipts'
    and public.is_admin()
  );


-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.3c
-- ═══════════════════════════════════════════════════════════════════
-- - La policy de upload público (H0.3b) no se modifica ni elimina
-- - Policies para otros buckets
-- - Objetos o archivos dentro del bucket
-- - Datos reales, secrets, .env
