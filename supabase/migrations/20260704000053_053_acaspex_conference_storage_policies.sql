-- ACASPEX Portal Socios — RLS policies para Storage de comunicaciones
-- B06: crea policies sobre storage.objects para el bucket
-- acaspex-conference-submissions.
-- Depende de: B04-BACKEND (bucket creado), B05 (funciones auxiliares de rol).
-- No crea bucket (ya creado en B04-BACKEND).
-- No crea policies de tablas (ya creadas en B05).
-- Ejecutar solo tras revisión explícita.
-- No contiene datos reales ni secretos.

-- ═══════════════════════════════════════════════════════════════════
-- MATRIZ DE PERMISOS STORAGE (resumen ejecutivo)
-- ═══════════════════════════════════════════════════════════════════
-- ┌─────────────────────┬────────┬────────┬─────────────────────┐
-- │ Operación           │ anon   │ admin  │ comite_cientifico   │
-- │                     │ /pub   │ /secr  │ /evaluador          │
-- ├─────────────────────┼────────┼────────┼─────────────────────┤
-- │ INSERT (upload)     │ SI (1) │ SI (2) │ NO                  │
-- │ SELECT (download)   │ NO     │ SI     │ NO (3)              │
-- │ UPDATE              │ NO     │ SI     │ NO                  │
-- │ DELETE              │ NO     │ SI     │ NO                  │
-- └─────────────────────┴────────┴────────┴─────────────────────┘
-- (1) Upload público controlado: solo abstracts, ruta validada.
-- (2) Admin también puede subir (carga administrativa).
-- (3) Evaluadores NO descargan archivos (decisión Sil).

-- ═══════════════════════════════════════════════════════════════════
-- 1. INSERT — upload público controlado (autor envía abstract)
-- ═══════════════════════════════════════════════════════════════════
-- Ruta obligatoria: {event_id}/{submission_code}/abstract.{ext}
-- event_id: UUID (formato hex con guiones)
-- submission_code: P001, P002, etc. (generado por trigger)
-- ext: pdf o docx (validado por allowed_mime_types del bucket)
-- Solo se permite subir abstracts iniciales.
-- Nota: lower(name) convierte P001 a p001; regex usa p minúscula.
-- B08 debe cerrar la asociación real submission↔file_path;
-- B08 debe generar/controlar la ruta y no confiar ciegamente en input del cliente.

create policy "conference_submissions_public_upload"
  on storage.objects
  for insert
  with check (
    bucket_id = 'acaspex-conference-submissions'
    and lower(name) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/p[0-9]{3}/abstract\.(pdf|docx)$'
  );

comment on policy "conference_submissions_public_upload" on storage.objects is
  'Upload público controlado: solo abstracts en ruta {event_id}/{submission_code}/abstract.{ext}. Regex valida p minúscula (lower(name)). B08 cierra asociación real.';

-- ═══════════════════════════════════════════════════════════════════
-- 2. INSERT — admin upload (carga administrativa)
-- ═══════════════════════════════════════════════════════════════════
-- Admin puede subir archivos sin restricción de prefijo.
-- Útil para carga administrativa de abstracts o pósters.

create policy "conference_submissions_admin_upload"
  on storage.objects
  for insert
  with check (
    bucket_id = 'acaspex-conference-submissions'
    and public.is_admin()
  );

comment on policy "conference_submissions_admin_upload" on storage.objects is
  'Admin puede subir archivos sin restricción de ruta (carga administrativa).';

-- ═══════════════════════════════════════════════════════════════════
-- 3. SELECT — solo admin (secretaría/comité descarga)
-- ═══════════════════════════════════════════════════════════════════
-- Solo administradores pueden descargar archivos.
-- Evaluadores NO descargan archivos (decisión Sil/Cora).
-- Autores NO pueden descargar desde el cliente (no hay policy de SELECT
-- para anon; el archivo se entrega post-insert via RPC en B08).

create policy "conference_submissions_select_admin"
  on storage.objects
  for select
  using (
    bucket_id = 'acaspex-conference-submissions'
    and public.is_admin()
  );

comment on policy "conference_submissions_select_admin" on storage.objects is
  'Solo admin descarga archivos. Evaluadores y autores no tienen acceso de lectura.';

-- ═══════════════════════════════════════════════════════════════════
-- 4. UPDATE — solo admin
-- ═══════════════════════════════════════════════════════════════════
-- Admin puede renombrar o mover archivos si es necesario.

create policy "conference_submissions_update_admin"
  on storage.objects
  for update
  using (
    bucket_id = 'acaspex-conference-submissions'
    and public.is_admin()
  )
  with check (
    bucket_id = 'acaspex-conference-submissions'
    and public.is_admin()
  );

comment on policy "conference_submissions_update_admin" on storage.objects is
  'Admin puede actualizar metadatos de archivos.';

-- ═══════════════════════════════════════════════════════════════════
-- 5. DELETE — solo admin
-- ═══════════════════════════════════════════════════════════════════
-- Admin puede eliminar archivos si es necesario.

create policy "conference_submissions_delete_admin"
  on storage.objects
  for delete
  using (
    bucket_id = 'acaspex-conference-submissions'
    and public.is_admin()
  );

comment on policy "conference_submissions_delete_admin" on storage.objects is
  'Admin puede eliminar archivos del bucket.';

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en B06
-- ═══════════════════════════════════════════════════════════════════
-- - Bucket (ya creado en B04-BACKEND)
-- - Policies de tablas conference_* (ya creadas en B05)
-- - Funciones security definer (ya creadas en B05-BIS)
-- - RPC/Edge Function para upload + return P001 (va en B08)
-- - Datos reales
-- - Secrets, credenciales, .env
