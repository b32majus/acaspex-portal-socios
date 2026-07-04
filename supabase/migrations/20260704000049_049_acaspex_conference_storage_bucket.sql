-- ACASPEX Portal Socios — Bucket privado de Supabase Storage para comunicaciones de jornadas
-- B04-BACKEND: registra el bucket acaspex-conference-submissions.
-- No crea policies sobre storage.objects (van en B06).
-- No crea tablas, enums, funciones ni triggers (ya existen en 039/040).
-- Ejecutar solo tras revisión explícita.
-- No contiene datos reales ni secretos.
-- FIX1: timestamp corregido a 043 (041 ya existe en main para profiles admin grants).

-- ═══════════════════════════════════════════════════════════════════
-- acaspex-conference-submissions
-- ═══════════════════════════════════════════════════════════════════
-- Archivos asociados a comunicaciones enviadas a jornadas ACASPEX.
-- Bucket privado. Solo accesible via URLs firmadas.
-- Estructura esperada dentro del bucket:
--   {event_id}/{submission_code}/abstract.{pdf|docx}
--   {event_id}/{submission_code}/poster.{ext}  (fase posterior — ver nota)
-- Tipos de archivo: PDF, DOCX. Tamaño máximo: 10 MB.
-- Política de conservación: los abstracts se mantienen durante el ciclo
-- del evento. Los pósters definitivos sustituyen o complementan el abstract.
-- Relación con conference_submissions:
--   - file_path → ruta del abstract en el bucket
--   - poster_file_path → ruta del póster definitivo (fase posterior)
--   - poster_original_name → nombre original del póster
--   - poster_uploaded_at → fecha de subida del póster
--   - poster_status → estado del póster (pending, received, etc.)
--
-- NOTA SOBRE PÓSTER:
-- Los pósters definitivos se subirán en una fase posterior (B13).
-- Los allowed_mime_types se ampliarán entonces para incluir JPG/PNG
-- si el comité lo requiere. Por ahora solo se permiten PDF y DOCX
-- para los abstracts originales.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'acaspex-conference-submissions',
  'acaspex-conference-submissions',
  false,
  10485760,       -- 10 MB
  array['application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en B04-BACKEND
-- ═══════════════════════════════════════════════════════════════════
-- - Policies sobre storage.objects (van en B06)
-- - Policies sobre storage.buckets
-- - Objeto insert o upload real
-- - Bucket público
-- - Datos reales
-- - Rutas de submission reales
-- - Secrets, credenciales, .env
