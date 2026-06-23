# ACASPEX Portal Socios — Estado actual vigente

Última actualización: 2026-06-23  
Estado de referencia: tras cierre y push de H0.7 (auth foundation completa)  
Repo VPS: `/srv/kairos-lab/projects/acaspex/portal-socios/repo`  
Rama operativa: `main`  
Último commit: `8ec8b5b — feat: add auth session, login UI, and route gates`

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
```

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
7. `docs/PRD.md`
8. `docs/architecture.md`

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

## 8. Siguiente fase

H0.7f — Identity read hook (`useIdentity`):

- Leer `profiles` y `members` del usuario autenticado.
- Resolver estado de acceso (10 estados definidos en el identity read model).
- Aplicar gates visuales según zona (socio, junta, admin).
- Requiere usuario sintético de prueba (WO separada).

Deuda pendiente:

- P-H07-005 — Lectura de perfil/socio/rol (diseñado, falta implementar).
- P-H07-006 — Bloqueo real por socio activo/cuota vigente (deuda RLS).
- P-H07-007 — Usuario sintético/autorizado para pruebas.
- P-H07-009 — Edición posterior de socios y roles.
- P-H07-010 — Gobernanza admin/junta sin superadmin.

---

## 9. Estado de este documento

status: current
owner: Sil / Cora
uso: entrada principal para humanos y agentes
no sustituye a la auditoría real de archivos antes de mutar código o remoto
