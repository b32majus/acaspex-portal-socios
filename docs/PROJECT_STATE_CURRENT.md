# ACASPEX Portal Socios — Estado actual vigente

Última actualización: 2026-06-26  
Estado de referencia: H0.9D — alta pública real conectada a Supabase  
Repo VPS: `/srv/kairos-lab/projects/acaspex/portal-socios/repo-main`  
Rama operativa: `main`  
Último commit funcional: `970a395` — feat: connect admin signup request detail

---

## 1. Qué es este proyecto

Portal privado de socios para ACASPEX — Asociación Extremeña de Calidad Asistencial y Seguridad de Pacientes.

La web pública institucional sigue existiendo fuera de este portal. Este repositorio desarrolla la capa privada/operativa:

- alta de socios;
- validación administrativa;
- acceso privado para socios;
- área de recursos/documentación;
- área de proyectos;
- cuenta del socio;
- panel admin;
- futura conexión real con Supabase.

---

## 2. Estado técnico actual

### Frontend

Stack actual:

- Vite + React + TypeScript;
- Tailwind v4;
- shadcn/ui base;
- react-router-dom;
- Supabase JS client `@supabase/supabase-js`;
- pnpm;
- GitHub Pages como demo actual.

URL pública actual de demo:

`https://b32majus.github.io/acaspex-portal-socios/`

Rutas principales:

- `/#/login`
- `/#/socios`
- `/#/socios/recursos`
- `/#/socios/proyectos`
- `/#/socios/mi-cuenta`
- `/#/hazte-socio`
- `/#/admin`
- `/#/admin/socios`
- `/#/admin/socios/:memberId`
- `/#/admin/recursos`
- `/#/admin/recursos/:resourceId`
- `/#/admin/recursos/nuevo`
- `/#/admin/renovaciones`
- `/#/admin/solicitudes`
- `/#/admin/solicitudes/:signupId`

Estado frontend:

- mock/demo funcional existente;
- **login real** con Supabase Auth (`signInWithPassword`, email + contraseña) — H0.7b;
- **session shell**: `AuthProvider` + `useAuth` hook + logout en MemberLayout y AdminLayout — H0.7c;
- **route gates**: `RequireAuth` protege todas las rutas privadas (`/socios`, `/admin`) — H0.7d;
- cliente centralizado en `src/lib/supabaseClient.ts`;
- health check no destructivo en `src/lib/supabaseHealth.ts`;
- H0.6.1 verificado: `configured: true, authReachable: true, session: false, errors: []`.
- build validado tras H0.7d.
- `VITE_SUPABASE_ANON_KEY` real configurado en `.env.local` (no commiteado).

### Backend / Supabase staging

Proyecto Supabase staging:

- nombre: `acaspex-portal-staging`;
- project ref: `oxbsbvbrljzvfqpdozgl`;
- URL pública: `https://oxbsbvbrljzvfqpdozgl.supabase.co`;
- región: `eu-west-1` / West EU Ireland.

Estado validado H0.5:

- 18/18 migraciones aplicadas y alineadas local/remoto;
- 9 tablas públicas;
- 10 enums;
- RLS activado en 9 tablas;
- 26 policies públicas;
- 13 Storage policies;
- 6 helpers security definer;
- 3 buckets privados.

Resultados de verificación manual ejecutados por Sil en Supabase SQL Editor:

- `public_tables`: 9
- `public_enums`: 10
- `rls_enabled_tables`: 9
- `public_table_policies`: 26
- `helper_functions`: 6
- `security_definer_helpers`: 6
- `acaspex_storage_buckets`: 3
- `private_acaspex_storage_buckets`: 3
- `acaspex_storage_policies`: 13

Estado final H0.5:

`h05_staging_verified_ready_for_h06`

Estado final H0.6:

`h06_frontend_supabase_connection_committed_and_pushed`

Estado final H0.6.1:

`h061_local_supabase_health_verified_ready_for_h07_auth_contract`

Estado final H0.7:

`h07_commits_pushed_ready_for_h07f`

Commits H0.7:

```text
0fba32e — docs: add h07 auth and identity contracts
8ec8b5b — feat: add auth session, login UI, and route gates
836d4b1 — docs: clean project state after h07 auth foundation
```

Estados finales H0.7:

```text
h07_commits_pushed_ready_for_h07f
h07_doc_cleanup_pushed_ready_for_h07f
h07f_identity_read_hook_pushed_ready_for_next_step
h07g_synthetic_users_design_pushed_ready_for_h07h
h07j_pages_supabase_env_configured_ready_for_u1_password_rotation
h07l_admin_global_access_ready_for_validation
h07m_identity_profile_member_split_ready_for_public_validation
h07n_identity_read_grants_applied_ready_for_public_validation
h07p_demo_junta_socio_created_ready_for_permission_section
h07q_material_corporativo_unified_and_permissions_validated
h08a_resource_flow_designed_ready_for_first_upload
h08b_fix1_permission_grants_applied
h08b_fix2_real_resource_detail_preview_ready_for_validation
h08b_fix3_resource_types_and_preview_behavior_ready_for_validation
h08c_admin_resource_management_ready_for_validation
h08c_fix2_docx_preview_and_admin_view_mode_ready_for_validation
h08r_resource_module_refactor_ready_for_validation
h08r2_resource_module_extracted_ready_for_validation
h08s_resource_sections_model_validated
h08t_resource_subsections_admin_validated
h08t_fix1_resource_subsections_admin_fix_ready_for_validation
```


### H0.8T — Administración de subsecciones e iconos ✅ VALIDADO

Estado: cierre validado H0.8T — 2026-06-24.

Veredictos validados:

- `h08t_resource_subsections_admin_validated`
- `h08t_resource_categories_unique_by_section_validated`
- `h08t_resource_category_icons_validated`

Alcance validado por Sil:

- Subsecciones aparece como entrada propia en el sidebar admin.
- Crear subsecciones funciona.
- Duplicados controlados por `section + slug` funcionan.
- Los mensajes de duplicado son amigables.
- Activar/desactivar funciona.
- Reordenar funciona y el orden se refleja en el portal del socio.
- Las subsecciones nuevas se reflejan en el portal del socio.
- El portal lee `resource_categories` reales.
- `U2` junta y `U3` socio mantienen el comportamiento correcto.
- `icon_key` funciona.
- El icono configurado se refleja en el sidebar.
- `IconPicker` visual funciona correctamente.

Decisiones cerradas:

- Material Corporativo no tendrá subsecciones por ahora.
- Centro de Conocimiento y Banco de Proyectos sí tienen subsecciones administrables.
- No se permite crear secciones principales nuevas en esta fase.
- No se permite eliminar subsecciones, solo activar/desactivar.
- Los iconos son configurables mediante catálogo cerrado.
- No se permiten iconos personalizados subidos por archivo.
- El fallback de icono es `folder`.

Deuda aceptada:

- La reordenación se resuelve en frontend con updates secuenciales y reversión básica.
- No hay todavía RPC/transacción para reordenación.
- No hay eliminación definitiva de subsecciones.
- No hay creación dinámica de secciones principales.

Commits asociados al bloque:

- `2ac0edd` — `fix: complete resource subsections admin flow`
- `9af92cc` — `fix: scope resource category uniqueness by section`
- `4b2039b` — `feat: add configurable resource category icons`
- `f70b038` — `feat: add visual icon picker for resource categories`


### H0.8U — Correcciones finales del módulo de recursos ✅ VALIDADO

Estado: cierre validado H0.8U — 2026-06-24.

Subsecciones Material Corporativo: Materiales, Actas y documentos gestionables en admin.
Portadas opcionales: subida por archivo o pegado de portapapeles para Word/PPTX.
PDF: visor embebido en detalle, miniaturas automáticas en cards con PDF.js.
Archivos: sustitución desde editor admin con rollback.
Eliminación definitiva: solo archivados, con confirmación, cascade en DB.
Tipo de recurso: auto-detectado desde archivo en alta y edición.
Preview Office: icono limpio sin mensaje de error.
Cards corporativas: muestran subsección real (Materiales / Actas y documentos).

Decisiones cerradas:
- `cover_image_path` como columna para portada editorial.
- PDF.js integrado con dynamic import (estable, code-split 421 KB).
- Delete policy RLS `resources_delete_admin_archived` (admin-only, solo archivados).
- Tipo de recurso no editable manualmente desde FIX2.

Deuda aceptada:
- PDF.js v6 requiere worker ESM. Compatible con navegadores modernos.
- Clipart paste no funciona en Safari (limitación del navegador).

Commits del bloque:
- `6c5ba39` — `fix: clean resource detail previews`
- `467ef4c` — `feat: add corporate material subsections`
- `2ba7539` — `feat: allow admin resource file replacement`
- `fc87648` — `feat: add optional resource cover images`
- `4f20986` — `feat: embed pdf resource preview`
- `692688c` — `feat: render pdf card thumbnails with pdfjs-dist`
- `6e8bfd8` — `feat: allow archived resource deletion`
- `0f46be0` — `fix: rely on cascade when deleting archived resources`
- `938a9b8` — `fix: allow deleting archived resources from admin list`
- `57ea77a` — `fix: expose corporate material subsections in admin`
- `2e28ee7` — `fix: show corporate resource subsection labels`
- `0920954` — `fix: detect resource type from uploaded file`
- `70f5b19` — `fix: render pdf thumbnails after loading`
- `83cb29c` — `fix: keep corporate context when showing subsection labels`
- `4af438d` — `fix: show corporate subsection in resource detail`

Migraciones nuevas: 028 (subsecciones corporativas), 029 (cover_image_path), 030 (delete policy).


## 9. Estado de staging (post H0.7q)

Usuarios demo en staging:

| Usuario | Email | Role | Member |
|---------|-------|------|--------|
| U1 | `acaspex.admin.demo@example.com` | administrador | null |
| U2 | `acaspex.junta.demo@example.com` | junta_directiva | active, paid_until 2027-06-23 |
| U3 | `acaspex.socio.demo@example.com` | socio | active, paid_until 2027-06-23 |

H0.7 cerrado funcionalmente:

- Login público conectado a Supabase staging.
- Roles demo activos con identidad resuelta (useIdentity).
- Admin demo: acceso global al portal.
- Junta demo: área socios + Material Corporativo.
- Socio demo: área socios estándar.
- Material Corporativo unificado como sección específica Junta/Admin.
- Ruta directa protegida por RequireBoardOrAdmin.

### H0.9B — Gestión administrativa real de socios ✅ pending_validation

Estado: implementado, pendiente de validación — 2026-06-25.

Implementado:
- Listado real de socios con filtros (estado, perfil, organización, categoría, búsqueda libre).
- Detalle real con todos los campos de ficha: identificación, documento, contacto, perfil profesional, membresía, consentimientos, notas, legacy.
- Formulario reutilizable `MemberForm` con todos los campos del alta + admin.
- Edición completa de ficha desde detalle.
- Alta manual completa desde `/admin/socios/nuevo` (sin crear login).
- Dashboard admin con conteos reales de members.
- `member_number` ACX-XXXX autogenerado por trigger DB.
- `membership_start` y `paid_until` calculados por trigger DB al activar.
- Migraciones: 031 (grants), 032 (member_number trigger), 033 (activation dates trigger).

No incluye:
- auth.users / profiles (no se crea login).
- Formulario público `/hazte-socio` real.
- Pagos, renovaciones, solicitudes reales.
- Aplicación de migraciones en staging.

Commits del bloque:
- `9470904` — docs: align H0.9A audit with full member form
- `b738926` — docs: define canonical member form contract
- `6036638` — feat: add shared member form options
- `8f25601` — refactor: reuse shared member form options in signup
- `023a151` — feat: add member form model and mappers
- `759d4dd` — fix: align member form mappers with database schema
- `fd32e7c` — feat: grant admin member writes through RLS
- `0e1fcb7` — feat: generate ACASPEX member numbers
- `024be0a` — feat: calculate member activation dates
- `19aeb16` — fix: harden member triggers before UI integration
- `0bb6834` — feat: connect admin members list to Supabase
- `75252aa` — feat: connect admin member detail to Supabase
- `f059ae3` — fix: polish read-only member admin views
- `35d2a4a` — feat: add member form and allow full admin editing
- `90050c9` — fix: preserve member notes and sync fee with profile
- `69ea19d` — feat: add manual member creation
- `799453d` — feat: use real member stats in admin dashboard

## 10. Siguiente fase

H0.9C — Acceso / invitación Auth (vínculo member → profile → auth.users).

### H0.8a — Diseño

Ver: `docs/h08a-resource-flow-design-20260623.md`. Estado: `h08a_resource_flow_designed_ready_for_first_upload`.

### H0.8b — Implementación y fixes

**H0.8b-FIX1** — Permisos: GRANT INSERT/UPDATE/DELETE en `resources` y `resource_visibility` para `authenticated`. Migración 020 aplicada en staging.

**H0.8b-FIX2** — Detalle, preview y tipos reales:
- `MemberResourceDetailPage` consulta Supabase real (fallback a mocks).
- Preview de imágenes con signed URLs desde Storage.
- Tipos ampliados: Imagen, Logo, Fondo Teams, Documento, Enlace externo.
- Etiquetas corregidas: visibilidad (Junta Directiva), fecha (dd/mm/aaaa), tipo (label humano).
- Botón Descargar para archivos reales.

**H0.8b-FIX3** — Enum `resource_type` y preview por formato:
- Migración 021 añadida al DB enum: `image`, `logo`, `teams_background`, `external_link`.
- Antes el INSERT con tipo `logo` fallaba con `invalid input value for enum resource_type: "logo"`.
- Helpers de clasificación: `isImageResource`, `isPdfResource`, `isOfficeResource`, `isExternalLinkResource`, `isPreviewableResource`, `isDownloadOnlyResource`.
- DOCX/PPTX ahora muestran placeholder "Documento descargable" + aviso "Vista previa no disponible" en detalle.
- PDF con placeholder y botón "Abrir PDF".
- Imágenes: preview real con signed URL.
- Enlace externo: placeholder + botón "Abrir recurso".
- Verificado: sin archivos huérfanos del intento fallido de Logo (limpieza automática funcionó).

Ver: `docs/h08b-admin-resource-upload-flow-20260623.md`. Estado: `h08b_fix3_resource_types_and_preview_behavior_ready_for_validation`.

Primer recurso real: "Fondo TEAMs ACASPEX" (Sil, PNG, Material Corporativo, 2026-06-23).

### H0.8c — Panel admin real y preview en cards

**AdminResourcesPage** — conectada a Supabase:
- Tabla con recursos reales (punto verde) + demo.
- Columnas: Título, Sección, Tipo, Estado, Visibilidad, Fecha, Acciones.
- Acciones contextuales: Archivar (published), Desarchivar (archived), Publicar (draft).

**AdminResourceEditorPage** — edición real:
- Carga recurso desde Supabase, formulario editable.
- UPDATE de title, description, resource_type, status, external_url.
- Muestra file_path (solo lectura). Aviso para sustitución de archivo.
- Recursos demo: warning + sin guardado.

**Card preview corregida:**
- `ResourceCardImage` ahora genera signed URL si el archivo tiene extensión de imagen (.png, .jpg, etc.), aunque el tipo no sea `image`.
- El recurso "Fondo TEAMs ACASPEX" (tipo `document`, archivo `.png`) ahora muestra preview en card.

Ver: `docs/h08c-admin-resource-management-20260623.md`. Estado: `h08c_admin_resource_management_ready_for_validation`.

### H0.8c-FIX2 — DOCX preview, modo vista y estados

**Preview DOCX experimental:**
- `docx-preview` (dynamic import, code-split → 170 KB)
- `src/components/resources/DocxPreview.tsx` con loading/error/ready
- Solo en detalle (no en cards)
- PPTX mantiene placeholder premium

**Modo vista admin:**
- Hook `usePreviewRole()` en `src/lib/previewRole.ts` con localStorage
- Selector en `MemberLayout` solo visible para admin: Administrador / Junta Directiva / Socio estándar
- Afecta enlaces visibles y rol mostrado sin modificar permisos reales
- `RequireBoardOrAdmin` respeta el preview role

**Estados mejorados:**
- Published → Archivar
- Archived → Publicar de nuevo + Restaurar borrador
- Draft → Publicar + Archivar

Ver: `docs/h08c-admin-resource-management-20260623.md`. Estado: `h08c_fix2_docx_preview_and_admin_view_mode_ready_for_validation`.

### H0.8R — Refactor recursos y modelo sección/subsección

**Rollbacks:**
- `docx-preview` eliminado (no funcionó en validación). DOCX/PPTX vuelven a placeholder premium.
- `previewRole` eliminado. Reemplazado por navegación real admin↔portal (botones "Panel admin" y "Ver portal de socios").

**Refactor:**
- Helpers extraídos a `src/lib/resourceHelpers.ts`: `typeLabel`, `categoryLabel`, `typeIconMap`, clasificación de recursos, etc.

**Formulario rediseñado:**
- Campos: Título, Sección, Subsección, Tipo, Estado, Visibilidad, Enlace externo, Descripción, Archivo.
- Secciones: Material Corporativo (sin subsección), Centro de Conocimiento, Banco de Proyectos.
- Subsecciones contextuales según sección.
- Visibilidad y storage path basados en sección.

**Inspección DB:**
- `resources` tiene `category_id` (uuid → resource_categories) pero sin `section`.
- `resource_categories` sin columna `section`.
- Migración pendiente documentada, no aplicada en esta WO.

Ver: `docs/h08c-admin-resource-management-20260623.md`. Estado: `h08r_resource_module_refactor_ready_for_validation`.

### H0.8R2 — Extracción real del módulo de recursos

Componentes extraídos de `placeholderPages.tsx`:

| Archivo | Líneas |
|---------|--------|
| `src/components/resources/MockCover.tsx` | 157 |
| `src/components/resources/MemberResourceDetailPage.tsx` | 305 |
| `src/components/resources/AdminResourcesPage.tsx` | 283 |
| `src/components/resources/AdminResourceEditorPage.tsx` | 318 |
| `src/components/resources/AdminResourceNewPage.tsx` | 343 |

`placeholderPages.tsx`: 4881 → 3547 líneas (-27%, -1334 líneas).
`AppRouter.tsx`: actualizado para importar de los nuevos módulos.

Ver: `docs/h08c-admin-resource-management-20260623.md`. Estado: `h08r2_resource_module_extracted_ready_for_validation`.

### H0.8S — Migración sección/subsección

**DB (migración 022):**
- Enum `resource_section`: `knowledge_center`, `project_bank`, `corporate_material`.
- Columnas `section` en `resources` y `resource_categories`.
- 3 recursos existentes migrados a `corporate_material`.
- 11 categorías seed: 5 knowledge_center + 6 project_bank.
- RLS policies intactas (10 policies en resources/resource_categories/resource_visibility).

**Frontend:**
- `AdminResourceNewPage`: persiste `section` y `category_id` (resuelto por slug desde DB).
- `AdminResourcesPage`: lee `section` y deriva label UI.
- `MaterialCorporativoPage`: filtra por `section = 'corporate_material'`.
- `MemberResourceDetailPage`: lee `section` para derivar categoría mostrada.

Ver: `docs/h08c-admin-resource-management-20260623.md`. Estado: `h08s_resource_sections_model_validated`.

### H0.8T — Gestión de subsecciones desde panel admin

- `AdminResourceCategoriesPage` → `/admin/recursos/subsecciones` (listar, crear, editar, activar/desactivar).
- `AdminResourceNewPage` carga categorías desde DB (ya no hardcodeadas).
- `AdminResourcesPage` incluye enlace "Gestionar subsecciones".
- Slug automático desde el nombre. Sin migración adicional (columnas ya existían).

Ver: `docs/h08c-admin-resource-management-20260623.md`. Estado: `h08t_resource_subsections_admin_ready_for_validation`.

### H0.8T-FIX1 — Corrección de permisos, navegación y orden de subsecciones

Problemas corregidos:
- "Gestionar subsecciones" movido de botón en Recursos a entrada propia en sidebar admin.
- GRANT INSERT, UPDATE en `resource_categories` para `authenticated` (migración 024).
- Campo Orden eliminado del formulario de creación. Auto-cálculo `max + 1` por sección.
- Botones Subir/Bajar para reordenación visual en la tabla.
- Decisión: no crear nuevas secciones principales dinámicas por ahora (requiere H0.9).

Estado: `h08t_fix1_resource_subsections_admin_fix_ready_for_validation`.

Documentos H0.7 creados:

```text
docs/h07-auth-contract-20260623.md
docs/h07e-identity-read-model-20260623.md
```

Archivos frontend H0.7 creados:

```text
src/lib/authContext.tsx
src/components/RequireAuth.tsx
```

---

## 3. Migraciones Supabase vigentes

Las migraciones vigentes usan versiones únicas compatibles con Supabase CLI:

- `20260622000001_001_acaspex_schema.sql`
- `20260622000002_002_acaspex_rls_baseline.sql`
- `20260622000003_003_acaspex_profiles_policies.sql`
- `20260622000004_004_acaspex_members_policies.sql`
- `20260622000005_005_acaspex_signup_requests_policies.sql`
- `20260622000006_006_acaspex_payments_policies.sql`
- `20260622000007_007_acaspex_membership_periods_policies.sql`
- `20260622000008_008_acaspex_resource_categories_policies.sql`
- `20260622000009_009_acaspex_resource_access_helpers.sql`
- `20260622000010_010_acaspex_resources_policies.sql`
- `20260622000011_011_acaspex_resource_visibility_policies.sql`
- `20260622000012_012_acaspex_audit_log_policies.sql`
- `20260622000013_013_acaspex_storage_buckets.sql`
- `20260622000014_014_acaspex_storage_payment_receipts_public_upload_policy.sql`
- `20260622000015_015_acaspex_storage_payment_receipts_admin_policies.sql`
- `20260622000016_016_acaspex_storage_reduced_fee_accreditations_policies.sql`
- `20260622000017_017_acaspex_storage_resource_file_helpers.sql`
- `20260622000018_018_acaspex_storage_resource_files_policies.sql`

Incidencias resueltas durante H0.5:

1. Colisión inicial de versiones por prefijo común `20260622`.
2. Repair remoto del historial:
   - `20260622` marcado como reverted;
   - `20260622000001` marcado como applied.
3. Retirada de `COMMENT ON POLICY` en Storage porque fallaba por ownership sobre `storage.objects`.
4. Corrección del conteo real de policies públicas: 26, no 31.

---

## 4. Decisiones funcionales vigentes

### Alta de socios

Flujo funcional:

`alta socio → pago/justificante → revisión admin → activación → acceso área privada → renovación`

Ruta pública de alta:

`/#/hazte-socio`

No usar como ruta principal:

`/#/socios/alta`

Estado inicial de una solicitud:

`pending_review`

No usar como estado principal:

`pending_payment`

### Pago y justificante

- Cuota general: 50 €/año.
- Cuota reducida: 30 €/año.
- Pago por transferencia manual.
- El justificante de pago **entra ya** en el flujo público de alta.
- Bucket de justificantes: `acaspex-payment-receipts`.
- Bucket privado.
- Upload público controlado solo en ruta:
  `signup-requests/{uuid}/payment-receipt.{pdf|jpg|jpeg|png}`
- Lectura/update/delete de justificantes: solo admin.

### Acreditaciones de cuota reducida

- Bucket: `acaspex-reduced-fee-accreditations`.
- Bucket privado.
- Estado actual de Storage: admin-only.
- No abrir upload público de acreditaciones salvo decisión explícita posterior.

### Recursos privados

- Bucket: `acaspex-resource-files`.
- Bucket privado.
- SELECT por visibilidad:
  - admin ve todo;
  - junta ve `socio` y `junta_directiva` si recurso publicado;
  - socio ve `socio` si recurso publicado.

### Roles

- `socio`
- `junta_directiva`
- `administrador`

Fundesalud no tiene rol operativo dentro del portal.

---

## 5. Seguridad y límites activos

Reglas críticas:

- Nunca usar `service_role` en frontend.
- Nunca commitear `.env`, `.env.local`, `.env.production` ni secretos.
- `VITE_SUPABASE_ANON_KEY` real solo en `.env.local` o variables del hosting.
- `.env.example` puede contener placeholders y URL pública, nunca keys reales.
- No introducir datos reales todavía.
- No ejecutar seeds sin WO explícita.
- No tocar RLS/policies/migraciones sin WO específica y reviewer.
- No ejecutar `supabase db reset`, `migration repair`, `db push`, `db pull` o `db dump` sin autorización explícita y micro-WO.

La CLI de Supabase en el VPS está autenticada y linkeada al proyecto staging. Eso significa que KairOS puede tocar remoto si se le autoriza. Cualquier acción remota requiere WO explícita, dry-run cuando aplique y revisión posterior.

---

## 6. Documentos que deben leerse al iniciar una nueva conversación

Lectura mínima obligatoria antes de seguir:

1. `docs/PROJECT_STATE_CURRENT.md`
2. `docs/decisions.md`
3. `docs/backlog.md`
4. `docs/h07-auth-contract-20260623.md`
5. `docs/h07e-identity-read-model-20260623.md`
6. `docs/work-order-splitting-policy.md`
7. `docs/h08a-resource-flow-design-20260623.md`
8. `docs/h08b-admin-resource-upload-flow-20260623.md`
9. `docs/h08c-admin-resource-management-20260623.md`
10. `docs/PRD.md`
11. `docs/architecture.md`

Leer también, solo si la tarea lo requiere:

- `supabase/docs/h04d-post-execution-verification-queries-20260622.sql`
- `supabase/docs/h05-fix1-migration-versioning-20260622.md`
- `supabase/docs/h05-fix3-storage-policy-comments-20260622.md`
- migraciones SQL concretas afectadas;
- archivos concretos de frontend afectados.

No leer por defecto:

- todo `docs/review-packs/`;
- todo `outbox/reports/`;
- `outbox/workorders/`;
- `.herenow/`;
- `.opencode/`;
- `supabase/.temp/`;
- documentos históricos no citados.

---

## 7. Forma de trabajo con KairOS

Regla operativa consolidada:

**Una WO = una tarea atómica = un output revisable.**

Para tandas complejas:

- usar tanda secuencial de micro-WOs;
- cada micro-WO debe tener objetivo único;
- cada micro-WO debe tener reviewer;
- si reviewer no aprueba, detener tanda;
- no continuar a la siguiente micro-WO si hay duda;
- no confiar en el veredicto de KairOS sin auditoría de Cora;
- Cora debe revisar archivos reales/diffs/lógica funcional antes de aprobar;
- no usar `git add .`;
- commits siempre selectivos;
- commit/push siempre en WO separada cuando sea posible.

Formato recomendado para micro-WO:

- objetivo único;
- contexto mínimo;
- archivos permitidos;
- prohibido;
- permitido;
- pasos;
- criterios de aceptación;
- validación;
- reporte esperado;
- veredicto esperado.

Regla de seguridad:

- KairOS puede operar en VPS/repo;
- KairOS puede hacer CLI remoto solo con autorización explícita;
- KairOS no debe recibir ni imprimir passwords, tokens, connection strings completas o service_role;
- si aparece secreto en salida, debe redactarse.

---

## 8. H0.9C — Gestión de acceso e invitaciones ✅ CERRADO FUNCIONALMENTE

HEAD funcional: `2815207` — docs: close H0.9C functional access block.

### H0.9C-A — Cerrado
- HEAD: 6329e7d. Validado por Sil.
- Estado de acceso visible en ficha administrativa.
- Helper read-only `fetchMemberAccessProfile()`.
- Borrado seguro: trigger `deactivate_profiles_before_member_delete`.
- ACX no reutilizable: secuencia monotónica `members_member_number_seq`.

### H0.9C-B — Cerrado funcionalmente; B4 y SMTP-final diferidos por D033
- **B1** ✓ Edge Function `create-member-access`. Crea auth user + profile via backend seguro.
- **B2** ✓ Botón UI "Crear acceso / Enviar invitación" en ficha administrativa.
- **B2-FIX1** ✓ Migración 041: GRANT INSERT, UPDATE sobre `public.profiles` TO authenticated. Soluciona `permission denied for table profiles`.
- **B3** ✓ Bloquear/desbloquear acceso al portal. Toggle `profiles.is_active` sin modificar ficha administrativa. Guard anti-bloqueo de perfiles admin.
- **B5** ✓ `last_seen_at` registrado mediante RPC `touch_own_profile_last_seen()` (SECURITY DEFINER, throttle 15 min). No abre UPDATE general sobre profiles.
- **B4** Diferido hasta SMTP-final (D033). Requiere correo corporativo, templates, redirect URLs y validación con Ana T.
- **SMTP-final** Diferido por D033. Correo corporativo acaspex@outlook.es pendiente de configuración.

### Migraciones H0.9C
- 034: members notes column
- 035: members admin delete
- 036: members payment receipt
- 037: deactivate profile before member delete
- 038: member number sequence no reuse
- 041: profiles admin write grants (INSERT, UPDATE)
- 042: RPC touch_own_profile_last_seen

### Commits del bloque H0.9C-B
- `461f312` — feat: add member access invitation function
- `646651a` — feat: connect member access invitation action
- `d67fd9c` — fix: grant admin profile write permissions
- `87d1610` — feat: add member portal access blocking toggle
- `00ce50f` — feat: add secure last seen profile touch function
- `9621d15` — feat: record last seen on authenticated access
- `2815207` — docs: close H0.9C functional access block

## 10. Siguiente fase

Tras el cierre funcional de H0.9C, la siguiente fase prioritaria es:

**H0.9D — Flujo público de alta real (`/hazte-socio`)**
- Conectar formulario público a Supabase (actualmente mock/demo).
- Subida de justificante de pago a Storage.
- Subida de acreditación de cuota reducida a Storage.
- Crear `signup_request` con estado `pending_review`.
- Validación admin de solicitudes.

**Pendientes diferidos:**
- B4 (reenviar invitación / reset password): diferido hasta SMTP-final (D033).
- SMTP-final: correo corporativo acaspex@outlook.es, templates, redirect URLs — con Ana T.

## 11. Estado de este documento

status: current
owner: Sil / Cora
uso: entrada principal para humanos y agentes
no sustituye a la auditoría real de archivos antes de mutar código o remoto
