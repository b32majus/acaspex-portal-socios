-- ACASPEX Portal Socios — Storage policies para acreditaciones de cuota reducida
-- H0.3d: crea policies admin-only para el bucket
-- acaspex-reduced-fee-accreditations. Este bucket contiene
-- documentación acreditativa para perfiles residente, estudiante
-- y jubilado, y debe ser privado y visible solo para administración.
-- En esta tanda no se abre upload público de acreditaciones.
-- Depende de las funciones auxiliares de H0.2a.
-- No contiene datos reales ni secretos.

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — solo administradores
-- ═══════════════════════════════════════════════════════════════════

create policy "accreditations_select_admin"
  on storage.objects
  for select
  using (
    bucket_id = 'acaspex-reduced-fee-accreditations'
    and public.is_admin()
  );


-- ═══════════════════════════════════════════════════════════════════
-- INSERT — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- No se permite upload público de acreditaciones en esta tanda.

create policy "accreditations_insert_admin"
  on storage.objects
  for insert
  with check (
    bucket_id = 'acaspex-reduced-fee-accreditations'
    and public.is_admin()
  );


-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — solo administradores
-- ═══════════════════════════════════════════════════════════════════

create policy "accreditations_update_admin"
  on storage.objects
  for update
  using (
    bucket_id = 'acaspex-reduced-fee-accreditations'
    and public.is_admin()
  )
  with check (
    bucket_id = 'acaspex-reduced-fee-accreditations'
    and public.is_admin()
  );


-- ═══════════════════════════════════════════════════════════════════
-- DELETE — solo administradores
-- ═══════════════════════════════════════════════════════════════════

create policy "accreditations_delete_admin"
  on storage.objects
  for delete
  using (
    bucket_id = 'acaspex-reduced-fee-accreditations'
    and public.is_admin()
  );


-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.3d
-- ═══════════════════════════════════════════════════════════════════
-- - Upload público de acreditaciones (no se abre en esta tanda)
-- - Policies para otros buckets
-- - Objetos o archivos dentro del bucket
-- - Datos reales, secrets, .env
