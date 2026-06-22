-- ACASPEX Portal Socios — Storage policies para resource files
-- H0.3f: crea policies sobre storage.objects para el bucket
-- acaspex-resource-files. La lectura se decide dinámicamente
-- mediante el helper can_access_resource_file_object (H0.3e).
-- La gestión (INSERT/UPDATE/DELETE) es exclusiva de administradores.
-- No contiene datos reales ni secretos.

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — según recurso published + visibilidad asignada
-- ═══════════════════════════════════════════════════════════════════
-- can_access_resource_file_object comprueba autenticación, rol,
-- estado del recurso y visibilidad. Administradores acceden a todo;
-- socios y Junta solo a recursos publicados con visibilidad.

create policy "resource_files_select_by_visibility"
  on storage.objects
  for select
  using (
    bucket_id = 'acaspex-resource-files'
    and public.can_access_resource_file_object(name)
  );

comment on policy "resource_files_select_by_visibility" on storage.objects is
  'Acceso dinámico: administrador ve todo; socio y Junta solo archivos de recursos publicados con visibilidad asignada. Sin acceso anónimo.';

-- ═══════════════════════════════════════════════════════════════════
-- INSERT — solo administradores
-- ═══════════════════════════════════════════════════════════════════

create policy "resource_files_insert_admin"
  on storage.objects
  for insert
  with check (
    bucket_id = 'acaspex-resource-files'
    and public.is_admin()
  );

comment on policy "resource_files_insert_admin" on storage.objects is
  'Solo administradores suben archivos de recursos.';

-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — solo administradores
-- ═══════════════════════════════════════════════════════════════════

create policy "resource_files_update_admin"
  on storage.objects
  for update
  using (
    bucket_id = 'acaspex-resource-files'
    and public.is_admin()
  )
  with check (
    bucket_id = 'acaspex-resource-files'
    and public.is_admin()
  );

comment on policy "resource_files_update_admin" on storage.objects is
  'Solo administradores actualizan archivos de recursos.';

-- ═══════════════════════════════════════════════════════════════════
-- DELETE — solo administradores
-- ═══════════════════════════════════════════════════════════════════

create policy "resource_files_delete_admin"
  on storage.objects
  for delete
  using (
    bucket_id = 'acaspex-resource-files'
    and public.is_admin()
  );

comment on policy "resource_files_delete_admin" on storage.objects is
  'Solo administradores eliminan archivos de recursos.';

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.3f
-- ═══════════════════════════════════════════════════════════════════
-- - Policies para otros buckets
-- - Objetos o archivos dentro del bucket
-- - Acceso anónimo (bloqueado por can_access_resource_file_object)
-- - Datos reales, secrets, .env
