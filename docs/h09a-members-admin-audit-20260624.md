# H0.9A — Auditoría de gestión de socios por parte del administrador

Status: pending_review  
Fecha: 2026-06-24  
Repo: `/srv/kairos-lab/projects/acaspex/portal-socios/repo`  
HEAD inicial auditado: `ce5ea4e — docs: archive legacy review packs`

---

## 1. Objetivo

Auditar el estado real del módulo de socios antes de implementar la gestión administrativa.

Esta auditoría no implementa funcionalidad nueva, no crea usuarios, no toca Auth y no modifica RLS.

La pregunta principal es separar tres capas que no deben mezclarse:

| Capa | Qué representa | Tabla / sistema |
|---|---|---|
| Socio administrativo | Persona, cuota, datos profesionales, estado asociativo | `public.members` |
| Identidad de aplicación | Rol lógico, vínculo con socio, perfil activo | `public.profiles` |
| Cuenta de login | Usuario real de Supabase Auth, email/password | `auth.users` |

---

## 2. Preflight

Resultado:

```text
branch: main
HEAD: ce5ea4e
working tree: clean
untracked: 0
```

H0.8V dejó el repo limpio. Los contratos históricos de socios ya no viven en `docs/` como fuente activa; están archivados en:

```text
/srv/kairos-lab/state/coding-workshop/archive/acaspex/repo-docs-archive-20260624/
```

Docs activos leídos:

- `docs/PROJECT_STATE_CURRENT.md`
- `docs/backlog.md`
- `docs/WO_DEFAULTS.md`
- `docs/repo-hygiene-index-20260624.md`
- `docs/h07-auth-contract-20260623.md`
- `docs/h07e-identity-read-model-20260623.md`

Docs históricos localizados en archivo externo, usados solo como referencia secundaria:

- `member-signup-flow-contract-20260621.md`
- `member-account-credential-contract-20260621.md`
- `current-membership-form-source-20260621.md`
- `email-flow-acaspex-20260622.md`
- `supabase-data-model-draft-20260622.md`
- `backend-supabase-mvp-architecture-20260622.md`

---

## 3. Rutas y componentes actuales

### 3.1 Rutas públicas

Definidas en `src/routes/AppRouter.tsx`:

```text
/login
/hazte-socio
```

Estado:

- `/login`: login real con Supabase Auth `signInWithPassword`.
- `/hazte-socio`: formulario visual/mock; no inserta todavía en `signup_requests` ni sube archivos reales.

### 3.2 Rutas privadas de socio

Protegidas por `RequireMember`:

```text
/socios
/socios/recursos
/socios/recursos/:resourceId
/socios/proyectos
/socios/proyectos/:projectId
/socios/mi-cuenta
```

Estado:

- Gate frontend real mediante `IdentityProvider`.
- Home socio y cuenta usan todavía `mockMembers` / `mockSocioDashboard`.
- Recursos y proyectos tienen parte real ya implementada por H0.8.

### 3.3 Ruta Material Corporativo

Protegida por `RequireBoardOrAdmin`:

```text
/socios/material-corporativo
```

Estado:

- Funciona con recursos reales y subsecciones corporativas tras H0.8U.
- Requiere Junta o administración desde frontend.

### 3.4 Rutas admin

Protegidas por `RequireAdmin`:

```text
/admin
/admin/socios
/admin/socios/:memberId
/admin/solicitudes
/admin/solicitudes/:signupId
/admin/recursos
/admin/recursos/nuevo
/admin/recursos/subsecciones
/admin/recursos/:resourceId
/admin/renovaciones
```

Estado del bloque socios:

| Ruta | Componente | Estado |
|---|---|---|
| `/admin` | `AdminDashboardPage` en `placeholderPages.tsx` | Mock para socios/renovaciones; recursos aparte ya reales |
| `/admin/socios` | `AdminMembersPage` | Mock, lee `mockMembers` |
| `/admin/socios/:memberId` | `AdminMemberDetailPage` | Mock, lee `mockMembers` |
| `/admin/solicitudes` | `AdminSignupRequestsPage` | Mock, lee `mockSignupRequests` |
| `/admin/solicitudes/:signupId` | `AdminSignupDetailPage` | Mock, simula activación |
| `/admin/renovaciones` | `AdminRenewalsPage` | Mock, lee `mockRenewals` |

Conclusión: la navegación admin ya existe, pero la gestión de socios todavía no está conectada a Supabase.

---

## 4. Datos mock actuales

### 4.1 `src/data/mockMembers.ts`

Modelo mock:

```text
id
firstName
lastName1
lastName2
email
phone
professionalCategory
jobTitle
organization
qualitySafetyLink
membershipType: general | reduced
reducedFeeReason: resident | student | retired | null
status: pending_review | active | expired | inactive | cancelled
joinedAt
paidUntil
lastPaymentAmount
lastPaymentDate
communicationConsent
notes
```

Diferencias frente a DB:

- Mock usa camelCase; DB usa snake_case.
- Mock simplifica `membershipType` a `general|reduced`; DB usa `member_profile` con `general|residente|estudiante|jubilado`.
- Mock mezcla estado de cuota y último pago; DB separa `members`, `payments` y `membership_periods`.

### 4.2 `src/data/mockSignup.ts`

Modelo mock de solicitud:

```text
status: pending_review | active | expired | inactive | cancelled
```

Diferencia importante:

DB usa `signup_request_status`:

```text
pending_review | needs_info | approved | rejected
```

Por tanto, antes de conectar solicitudes reales hay que alinear tipos y labels. El mock actual de solicitudes no refleja exactamente el enum real de `signup_requests`.

---

## 5. Modelo DB real

Definido principalmente en `supabase/migrations/20260622000001_001_acaspex_schema.sql`.

### 5.1 Enums principales

```text
app_role: socio | junta_directiva | administrador
member_profile: general | residente | estudiante | jubilado
member_status: pending_review | active | expired | inactive | cancelled
signup_request_status: pending_review | needs_info | approved | rejected
payment_method: bank_transfer
payment_status: pending | validated | rejected
membership_period_status: active | expired | cancelled
```

### 5.2 `public.members`

Representa la ficha administrativa del socio.

Campos clave:

```text
id
member_number
first_name
last_name_1
last_name_2
document_type
document_number
document_number_normalized
address_line
postal_code
city
province
email
email_normalized
phone
professional_category
job_title
organization
quality_safety_link
member_profile
reduced_fee_accreditation_file_path
status
fee_amount
membership_start
paid_until
communication_consent
privacy_accepted_at
legacy_* fields
notes
created_at
updated_at
```

Observaciones:

- Puede existir socio sin login.
- `paid_until` vive directamente en `members` para lectura rápida.
- El detalle de pagos vive en `payments`.
- Las cuotas reducidas se modelan mediante `member_profile` + `reduced_fee_accreditation_file_path`.
- No hay policy de DELETE; el ciclo de vida debe ir por `status`.

### 5.3 `public.profiles`

Representa la identidad de aplicación vinculada a Supabase Auth.

Campos clave:

```text
id = auth.users.id
member_id nullable
email
email_normalized
role
is_active
invited_at
last_seen_at
created_at
updated_at
```

Observaciones:

- Un admin puede existir sin `member_id`.
- Un socio/junta debería tener `member_id` para acceder al área privada como socio.
- `profiles.role` controla permisos lógicos.
- `profiles.is_active` puede desactivar acceso sin borrar Auth.

### 5.4 `public.signup_requests`

Representa solicitudes públicas de alta.

Campos clave:

```text
id
first_name
last_name_1
last_name_2
document_type
document_number
document_number_normalized
address_line
postal_code
city
province
email
email_normalized
phone
professional_category
job_title
organization
quality_safety_link
member_profile
requested_fee_amount
receipt_file_path
accreditation_file_path
privacy_accepted_at
communication_consent
status
admin_notes
review_reason
reviewed_by
reviewed_at
approved_member_id
created_at
updated_at
```

Observaciones:

- El estado inicial correcto es `pending_review`.
- No existe `pending_payment` en el MVP.
- La solicitud puede acabar vinculada a `approved_member_id`.

### 5.5 `public.payments`

Representa pagos por transferencia.

Campos clave:

```text
member_id
signup_request_id
amount
payment_method
payment_status
payment_period_start
payment_period_end
paid_until
receipt_file_path
validated_by
validated_at
notes
```

Observaciones:

- Se permite pago asociado a `member` o a `signup_request`.
- `payment_status = validated` exige `validated_by` y `validated_at`.
- No hay DELETE cliente.

### 5.6 `public.membership_periods`

Representa periodos de vigencia.

Campos clave:

```text
member_id
payment_id
period_start
period_end
status
notes
```

Observaciones:

- Permite histórico de ciclos de membresía.
- El acceso rápido usa `members.paid_until`.

---

## 6. RLS, grants y permisos reales

### 6.1 Helpers actuales

`20260622000002_002_acaspex_rls_baseline.sql` define:

```text
current_app_role()
is_admin()
is_junta_or_admin()
is_socio_or_higher()
```

`current_app_role()` solo mira `profiles.role` e `is_active`. No valida `members.status` ni `paid_until`.

### 6.2 Policies `profiles`

Archivo: `20260622000003_003_acaspex_profiles_policies.sql`

Permite:

- usuario autenticado lee su propio profile;
- admin lee todos los profiles;
- admin inserta profiles;
- admin actualiza profiles;
- no DELETE.

Pero grants actuales:

```text
grant select on public.profiles to authenticated
```

No hay grants `insert/update` sobre `profiles` para `authenticated` en las migraciones actuales. Aunque exista RLS admin insert/update, el frontend admin puede necesitar una migración de grants antes de crear/editar profiles desde cliente.

### 6.3 Policies `members`

Archivo: `20260622000004_004_acaspex_members_policies.sql`

Permite:

- socio lee su propia ficha si `profiles.member_id = members.id` y perfil activo;
- admin lee todos;
- admin inserta members;
- admin actualiza members;
- no DELETE.

Grants actuales:

```text
grant select on public.members to authenticated
```

No hay grants `insert/update` sobre `members` para `authenticated` en las migraciones actuales. Esto bloquea H0.9B si se pretende crear/editar socios desde frontend admin usando anon key + sesión admin.

### 6.4 Policies `signup_requests`

Archivo: `20260622000005_005_acaspex_signup_requests_policies.sql`

Permite por RLS:

- insert público con `status = pending_review` y campos admin nulos;
- select admin;
- update admin;
- no DELETE.

Pero no se han encontrado grants explícitos sobre `signup_requests` para `anon` o `authenticated`.

Implicación:

- El formulario público real puede necesitar `grant insert on public.signup_requests to anon, authenticated`.
- El panel admin de solicitudes puede necesitar `grant select, update on public.signup_requests to authenticated`.

### 6.5 Policies `payments`

Archivo: `20260622000006_006_acaspex_payments_policies.sql`

Permite por RLS:

- select admin;
- insert admin;
- update admin;
- no DELETE.

No se han encontrado grants explícitos sobre `payments` para `authenticated`.

### 6.6 Policies `membership_periods`

Archivo: `20260622000007_007_acaspex_membership_periods_policies.sql`

Permite por RLS:

- socio lee sus propios periodos;
- admin lee todos;
- admin inserta;
- admin actualiza;
- no DELETE.

No se han encontrado grants explícitos sobre `membership_periods` para `authenticated`.

### 6.7 Deuda de seguridad ya confirmada

La deuda documentada sigue siendo cierta:

```text
Las policies actuales de recursos privados validan profile activo y rol,
pero no validan members.status = active ni members.paid_until >= today.
```

El frontend sí usa `IdentityProvider` para bloquear visualmente acceso si cuota no vigente, pero RLS de recursos privados no incorpora todavía un helper tipo:

```text
is_active_member_with_valid_quota()
```

Esta deuda no bloquea H0.9B administrativo, pero debe resolverse antes de considerar cerrado el acceso privado a nivel backend.

---

## 7. Storage asociado a altas/pagos

Buckets definidos en migraciones:

| Bucket | Uso | Estado policy |
|---|---|---|
| `acaspex-payment-receipts` | justificantes de transferencia | upload público controlado + gestión admin |
| `acaspex-reduced-fee-accreditations` | acreditaciones cuota reducida | admin-only; no upload público |

Observación importante:

- El formulario `/hazte-socio` actual no sube archivos reales.
- La policy de justificantes permite ruta pública controlada:

```text
signup-requests/{uuid}/payment-receipt.{pdf|jpg|jpeg|png}
```

- Para acreditaciones no existe upload público en H0.3d; si el formulario público debe subir acreditación reducida, hará falta decidir si abrir upload público controlado o cargar acreditación solo desde admin.

---

## 8. Auth e invitación

### 8.1 Estado actual

Login real:

```text
supabase.auth.signInWithPassword({ email, password })
```

No existe en frontend:

- `signUp`;
- `inviteUserByEmail`;
- `auth.admin.createUser`;
- `resetPassword`;
- magic link como vía principal.

### 8.2 Creación de usuarios real

Crear usuarios en `auth.users` requiere:

- Supabase Dashboard;
- Management API / Auth Admin API con service_role;
- Edge Function segura;
- script operativo autorizado fuera del frontend.

Regla vigente:

```text
No usar service_role en frontend.
```

Por tanto, H0.9B no debe crear login. H0.9C debe diseñar una vía segura separada.

---

## 9. Respuestas a preguntas clave

### 1. ¿Qué significa hoy un `member`?

Una ficha administrativa de socio ACASPEX: datos personales/profesionales, estado, cuota, vigencia y notas. Puede existir sin cuenta de login.

### 2. ¿Qué significa hoy un `profile`?

Un perfil de aplicación vinculado 1:1 a `auth.users.id`, con rol lógico y posible `member_id`. Controla permisos en frontend y en RLS.

### 3. ¿Puede existir un admin sin `member`?

Sí. El modelo y `IdentityProvider` lo contemplan. Admin sin `member_id` tiene `status = admin`, `canAccessAdmin = true` y `accessReason = admin_oversight`.

### 4. ¿Puede existir un socio sin login?

Sí. `members` no depende de `auth.users`. Esto es deseable para H0.9B: primero censo administrativo; login después.

### 5. ¿Puede existir login sin socio?

Sí. Sería `authenticated_no_member` salvo que role = `administrador`. No debería tener acceso socio si no es admin.

### 6. ¿Junta/socio requieren `member` activo?

Frontend: sí, para `RequireMember` y `RequireBoardOrAdmin` mediante `IdentityProvider`.

Backend/RLS de recursos: no todavía; las policies se basan en `profiles.role` e `is_active`, no en cuota vigente.

### 7. ¿Cómo se modela cuota/vigencia?

- Estado rápido en `members.status` + `members.paid_until`.
- Pagos en `payments`.
- Historial de vigencias en `membership_periods`.

### 8. ¿Puede admin gestionar members desde frontend ahora mismo?

No completamente. RLS tiene policies admin, pero faltan grants `insert/update` sobre `members` y probablemente sobre tablas relacionadas. Además, las pantallas admin actuales son mock.

### 9. ¿Puede admin crear cuenta de login desde frontend ahora mismo?

No y no debe. Crear `auth.users` requiere backend seguro/service_role fuera del frontend.

### 10. ¿Qué debe implementarse primero?

Primero H0.9B: gestión administrativa de `members` sin crear login. Después H0.9C: invitación/acceso Auth.

---

## 10. Gaps y riesgos

### G1 — Admin socios sigue mock

`AdminMembersPage`, `AdminMemberDetailPage`, `AdminRenewalsPage`, `AdminSignupRequestsPage` y `AdminSignupDetailPage` siguen en `placeholderPages.tsx` usando mocks.

### G2 — Tipos mock no coinciden con DB

Especialmente solicitudes:

- mock `SignupStatus`: `pending_review | active | expired | inactive | cancelled`;
- DB `signup_request_status`: `pending_review | needs_info | approved | rejected`.

### G3 — Faltan grants para mutación admin en socios

Hay policies RLS para admin insert/update, pero grants actuales solo dan `select` sobre `profiles` y `members`. Para H0.9B harán falta grants controlados, análogos a H0.8 recursos.

### G4 — Public signup real no está conectado

`SignupPage` valida email y cambia a estado `submitted`, pero no inserta en `signup_requests` ni sube archivos reales.

### G5 — Acreditación reducida no tiene upload público

El bucket de acreditaciones es admin-only. Si el alta pública debe recibir acreditación, hay que decidir y abrir policy controlada.

### G6 — RLS de recursos no valida cuota vigente

Acceso backend a recursos sigue basado en rol/perfil activo. Requiere helper nuevo si se quiere blindaje real por `members.status` y `paid_until`.

### G7 — Auth/invitación requiere fase separada

No se debe mezclar alta administrativa de socio con creación de `auth.users`.

---

## 11. Propuesta de fases siguientes

### H0.9B — Gestión administrativa de `members` sin login

Objetivo: sustituir mocks de `/admin/socios` y `/admin/socios/:memberId` por datos reales de `public.members`.

Incluye:

- migración grants admin para `members`;
- listado real;
- búsqueda/filtros en frontend;
- detalle real;
- edición de datos administrativos;
- cambio de estado;
- actualización de `paid_until`, `fee_amount`, `member_profile`, `notes`;
- sin crear `auth.users`;
- sin tocar `profiles` salvo lectura futura si se quiere mostrar “tiene acceso / no tiene acceso”.

Micro-WOs recomendadas:

1. H0.9B-A: grants mínimos admin para `members`.
2. H0.9B-B: crear helper/types frontend `memberMappers`.
3. H0.9B-C: conectar `/admin/socios` a Supabase read-only.
4. H0.9B-D: conectar detalle `/admin/socios/:memberId` read-only.
5. H0.9B-E: edición limitada de `members`.
6. H0.9B-F: dashboard admin usa conteos reales de `members`.

### H0.9C — Acceso / invitación Auth

Objetivo: diseñar y luego implementar vínculo seguro `member` → `profile` → `auth.users`.

Incluye:

- decidir flujo: invitación por email, contraseña temporal, dashboard/manual, o Edge Function;
- nunca usar service_role en frontend;
- crear/actualizar `profiles.member_id`, `role`, `is_active`;
- mostrar en admin si el socio tiene acceso al portal;
- posible botón “crear acceso / reenviar invitación”.

Requiere backend/Edge Function o proceso operativo seguro.

### H0.9D — Solicitudes, pagos y renovaciones

Objetivo: conectar `/hazte-socio`, solicitudes admin y renovaciones.

Incluye:

- insert real en `signup_requests`;
- upload real de justificante;
- decisión sobre acreditación reducida pública;
- revisión admin de solicitudes;
- creación de `member` desde solicitud aprobada;
- creación de `payment` y `membership_period`;
- actualización de `members.paid_until`;
- renovación de socios existentes.

---

## 12. Recomendación ejecutiva

No empezar H0.9 creando usuarios ni tocando Auth.

Orden recomendado:

```text
1. H0.9B — censo administrativo real de socios.
2. H0.9C — acceso/invitación Auth.
3. H0.9D — solicitudes, pagos y renovaciones.
4. H0.9E — blindaje backend de cuota vigente para recursos privados.
```

Razón:

- `members` ya está modelado.
- Admin puede gestionar socios sin necesidad de `auth.users`.
- Crear login requiere backend seguro y no debe mezclarse con CRUD administrativo.
- Solicitudes/pagos tienen más acoplamiento y deben venir después de estabilizar el censo.

---

## 13. Decisiones que necesita Sil/Cora antes de H0.9B

1. ¿H0.9B debe permitir crear socio administrativo manual desde cero, o solo listar/editar existentes?
2. ¿Campos obligatorios mínimos para crear socio manual?
3. ¿`member_profile` se mostrará como `General / Residente / Estudiante / Jubilado` o como `General / Reducida` con motivo?
4. ¿Se permite editar `paid_until` manualmente en H0.9B?
5. ¿Se permite cambiar rol (`socio`/`junta_directiva`) desde H0.9B o se reserva para H0.9C porque afecta a `profiles`?

Recomendación inicial:

- H0.9B debe incluir crear/editar socio administrativo manual.
- No tocar roles de acceso todavía.
- Mostrar estado de acceso como “pendiente de H0.9C”.
