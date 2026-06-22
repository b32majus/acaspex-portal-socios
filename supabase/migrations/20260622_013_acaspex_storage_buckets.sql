-- ACASPEX Portal Socios — Buckets privados de Supabase Storage
-- H0.3a: registra los buckets de almacenamiento privado. No crea
-- policies sobre storage.objects. Las policies se crean en:
--   H0.3b — upload público controlado de justificantes
--   H0.3c — admin policies justificantes
--   H0.3d — acreditaciones cuota reducida
--   H0.3e — helper de acceso a resource files
--   H0.3f — storage policies resource files
-- Endurecido en H0.3-fix1 (on conflict do update) y H0.3-fix2 (comentarios).
-- Ejecutar solo tras revisión explícita.
-- No contiene datos reales ni secretos.

-- ═══════════════════════════════════════════════════════════════════
-- acaspex-payment-receipts
-- ═══════════════════════════════════════════════════════════════════
-- Justificantes de transferencia bancaria para cuotas.
-- Bucket privado. Upload público controlado solo durante el alta,
-- restringido a la ruta (H0.3b + H0.3-fix1):
--   signup-requests/{uuid}/payment-receipt.{pdf|jpg|jpeg|png}
-- Lectura, update y delete: solo administradores (H0.3c).
-- La asociación con signup_requests.receipt_file_path se resuelve
-- en una WO posterior de flujo frontend/backend.
-- Tipos de archivo: PDF, JPG, PNG. Tamaño máximo: 10 MB.
-- Política de conservación: mantener solo el justificante del ciclo
-- vigente; sustituir o archivar el anterior.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'acaspex-payment-receipts',
  'acaspex-payment-receipts',
  false,
  10485760,       -- 10 MB
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ═══════════════════════════════════════════════════════════════════
-- acaspex-reduced-fee-accreditations
-- ═══════════════════════════════════════════════════════════════════
-- Documentos de acreditación para perfiles con cuota reducida:
-- residente, estudiante y jubilado.
-- Acceso futuro: solo administradores (policies en H0.3c).
-- Estructura esperada dentro del bucket:
--   {member_id}/accreditation.pdf
-- Tipos de archivo previstos: PDF, JPG, PNG. Tamaño máximo: 10 MB.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'acaspex-reduced-fee-accreditations',
  'acaspex-reduced-fee-accreditations',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ═══════════════════════════════════════════════════════════════════
-- acaspex-resource-files
-- ═══════════════════════════════════════════════════════════════════
-- Archivos asociados a recursos del Centro de Conocimiento y
-- materiales internos (PDFs, presentaciones, plantillas).
-- Acceso futuro: según resource_visibility + policies específicas
-- (policies en H0.3d).
-- El bucket es privado. La lectura desde aplicación se hará via
-- URLs firmadas. El acceso directo sin firma no está permitido.
-- Estructura esperada dentro del bucket:
--   {resource_id}/{filename}
-- Tipos de archivo previstos: PDF, DOCX, PPTX, XLSX. Máx.: 50 MB.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'acaspex-resource-files',
  'acaspex-resource-files',
  false,
  52428800,       -- 50 MB
  array['application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.3a
-- ═══════════════════════════════════════════════════════════════════
-- - Policies sobre storage.objects (H0.3b, H0.3c, H0.3d, H0.3f)
-- - Policies sobre storage.buckets
-- - Objetos o archivos dentro de los buckets
-- - Buckets públicos
-- - Datos reales
-- - Rutas de socio reales
-- - Secrets, credenciales, .env
