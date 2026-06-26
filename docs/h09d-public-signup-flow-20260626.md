# H0.9D — Flujo público de alta real

Última actualización: 2026-06-26
Status: active — H0.9D-H (aprobación) completado

## Objetivo

Conectar el formulario público `/hazte-socio` a Supabase para crear solicitudes reales en `signup_requests`, incluyendo subida opcional del justificante de pago a Storage. Conectar la bandeja admin a datos reales.

## Estado

### H0.9D-A — Auditoría ✓
- Grants faltaban para anon/authenticated sobre signup_requests.
- Policies RLS existentes y correctas: insert_public (with check), select_admin, update_admin.
- Storage policy `payment_receipts_public_upload` operativa para upload público.
- Acreditación reducida: upload público cerrado (admin-only). Consistente con D016.

### H0.9D-B — Grants ✓
- Migración 043: `GRANT INSERT TO anon, authenticated` + `GRANT SELECT, UPDATE TO authenticated`.
- Aplicada en staging. Sin DELETE.

### H0.9D-C — Modelo y mapper ✓
- `src/lib/signupRequestModel.ts`: SignupFormState, SignupRequestInsertPayload, helpers.
- Normalización: email (lower), documento (upper). Cuota: 50€ general, 30€ reducida.

### H0.9D-D — Envío real ✓
- `src/lib/signupRequestActions.ts`: submitSignupRequest() — upload a Storage + insert en signup_requests.
- Justificante: PDF/JPG/PNG, máx 10 MB, ruta `signup-requests/{uuid}/payment-receipt.{ext}`.
- Acreditación: no se sube públicamente (microcopy informativo).
- UX: estados de carga, error y confirmación.

### H0.9D-E — Bandeja admin ✓
- `src/lib/signupRequestQueries.ts`: fetchSignupRequests(), fetchSignupRequestById().
- `/admin/solicitudes` conectada a Supabase real.
- Filtros: pending_review, needs_info, approved, rejected, todas.

### H0.9D-F — Detalle admin ✓
- `/admin/solicitudes/:signupId` conectada a Supabase real.
- Justificante: signed URL desde Storage si existe.
- Datos completos: identificación, contacto, perfil profesional, cuota, documentación.

### H0.9D-FIX1 — Hardening envío ✓
- `validateSignupForm()` en `signupRequestModel.ts`: nombre, apellido, email, email confirmation, privacidad, member_profile.
- `submitSignupRequest()` refactorizado: valida antes de subir archivo, usa `mapSignupFormToInsertPayload()`.
- Validación de extensión de archivo añadida a `validateReceiptFile()`.
- Riesgo de justificante huérfano mitigado: la validación ocurre antes del upload. Si el upload falla, no se inserta. Si el upload OK y el insert falla, el archivo queda huérfano en Storage (riesgo aceptado: bucket privado, sin acceso hasta que admin revise; limpieza futura pendiente).

### H0.9D-H — Aprobación de solicitud ✓
- **H-A**: Auditoría — `go`. Member.status = active, sin payments, sin RPC (dos operaciones frontend).
- **H-B**: `signupApprovalModel.ts` — mapper `mapSignupRequestToMemberCreatePayload()`.
- **H-C**: `signupApprovalActions.ts` — `approveSignupRequest()` con validación, duplicate check, insert member + update signup.
- **H-D**: UI en detalle admin — botón "Crear socio y aprobar solicitud". Confirmación, estados, enlace a ficha.
- **H-E**: Validación — build OK, security clean, grants verificados.
- El admin puede convertir una solicitud en ficha administrativa de socio. El trigger 033 establece membership_start y paid_until automáticamente (12 meses desde aprobación).
- No se crea acceso Auth/profile. No se envían emails. No se crea payment.

## Qué queda fuera de H0.9D

- Aprobar/rechazar solicitud (pendiente de WO futura).
- Crear member desde solicitud aprobada.
- Crear payment / validar pago.
- Crear acceso al portal (auth user + profile).
- Emails / notificaciones.
- SMTP-final.
- Acreditación pública (D016: admin-only hasta decisión explícita).

## Migraciones nuevas

- 043: grants INSERT/SELECT/UPDATE sobre signup_requests.

## Archivos creados

- `src/lib/signupRequestModel.ts`
- `src/lib/signupRequestActions.ts`
- `src/lib/signupRequestQueries.ts`

## Archivos modificados

- `src/routes/placeholderPages.tsx` — SignupPage, AdminSignupRequestsPage, AdminSignupDetailPage.
