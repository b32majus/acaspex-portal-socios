---
title: H0.7a — Contrato de autenticación y roles ACASPEX
status: pending_review
created: 2026-06-23
owner: Sil / Cora
project: ACASPEX Portal Socios
repo: /srv/kairos-lab/projects/acaspex/portal-socios/repo
depends_on:
  - h06_frontend_supabase_connection_committed_and_pushed
  - h061_local_supabase_health_verified_ready_for_h07_auth_contract
feedstock:
  - docs/PROJECT_STATE_CURRENT.md
  - docs/decisions.md
  - docs/PRD.md
  - docs/architecture.md
  - docs/frontend-supabase-connection-contract-20260622.md
  - docs/review-packs/cora-readable-h06-frontend-supabase-connection-20260622.md
  - docs/work-order-splitting-policy.md
  - supabase/migrations/20260622000001_001_acaspex_schema.sql
  - supabase/migrations/20260622000002_002_acaspex_rls_baseline.sql
  - supabase/migrations/20260622000003_003_acaspex_profiles_policies.sql
  - supabase/migrations/20260622000004_004_acaspex_members_policies.sql
  - supabase/migrations/20260622000005_005_acaspex_signup_requests_policies.sql
  - src/lib/supabaseClient.ts
  - src/lib/supabaseHealth.ts
  - src/routes/AppRouter.tsx
---

# H0.7a — Contrato de autenticación y roles ACASPEX

## 1. Veredicto de H0.7a

**Veredicto:** `h07a_auth_contract_corrected_ready_for_h07b_design`

El contrato ha sido corregido para alinear el modelo de identidad con el esquema real de Supabase (`auth.users.id = profiles.id`, `profiles.member_id → members.id`), el orden de creación tras aprobación (`members → auth.users → profiles`), y registra explícitamente la deuda RLS sobre `members.status = 'active'` y `paid_until`. No hay bloqueantes técnicos detectados.

Este documento no autoriza implementación. La implementación solo puede comenzar tras revisión explícita y aprobación de Cora/Sil.

---

## 2. Decisión de autenticación MVP

Las decisiones vigentes proceden de `docs/decisions.md` (D008, D018) y del estado actual (`docs/PROJECT_STATE_CURRENT.md`):

| Decisión | Detalle |
|----------|---------|
| Método principal | **Email + contraseña propia** |
| Magic link | Fuera del MVP principal. No bloquear el diseño para que sea posible como opción futura, pero no implementar en H0.7 ni dedicarle rutas ni UI. |
| Recuperación de contraseña | **No en H0.7.** Queda como siguiente iteración (H0.7.x o H0.8). Supabase Auth proporciona el flujo nativo de password reset; se activará cuando se necesite pero no se implementa ahora. |
| Creación de cuenta | **Por invitación/admin, tras solicitud aprobada.** El flujo completo es: (1) persona rellena formulario público `/hazte-socio` → (2) solicitud queda en `pending_review` → (3) admin revisa, valida pago, aprueba → (4) admin crea `members` → (5) admin crea/invita usuario en `auth.users` → (6) admin crea `profiles` con `id = auth.users.id` y `member_id = members.id` → (7) el socio recibe invitación/email para establecer contraseña → (8) el socio accede con email + contraseña. `profiles` no puede existir antes de `auth.users` porque `profiles.id` referencia `auth.users(id)`. No hay registro público autoservicio directo a `auth.users`. |
| Fase futura | Tras MVP, evaluar si la creación de `auth.users` se automatiza (p.ej., vía Edge Function al aprobar solicitud) o si se mantiene manual/admin. |

---

## 3. Modelo de identidad

### 3.1 Cadena de identidad

```text
auth.users.id = profiles.id          (FK: profiles.id → auth.users.id)
profiles.member_id → members.id      (FK: profiles.member_id → members.id)
profiles.role = rol efectivo
members.status + members.paid_until = elegibilidad de acceso como socio
```

### 3.2 Qué representa cada capa

| Capa | Tabla | Qué representa |
|------|-------|----------------|
| **auth.users** | `auth.users` (Supabase interno) | Identidad de autenticación. Email, contraseña cifrada, último login, metadatos de Supabase Auth. **No es fuente de verdad para datos personales, estado de socio ni rol.** |
| **profiles** | `public.profiles` | Perfil de aplicación. Enlace entre `auth.users` y `members` vía `profiles.member_id`. Contiene `role` (app_role) y `is_active`. **Fuente de verdad para rol efectivo.** |
| **members** | `public.members` | Socio ACASPEX. Datos personales completos, documento, email, perfil profesional, `status` (member_status), `paid_until`, `fee_amount`. **Fuente de verdad para datos personales y estado de socio.** |
| **signup_requests** | `public.signup_requests` | Solicitudes de alta desde formulario público. Contiene los mismos datos personales que `members` pero en estado `pending_review`. Al aprobarse, se crea `members` y se enlaza con `signup_requests.approved_member_id`. **Nunca da acceso al portal por sí misma.** |

### 3.3 Fuentes de verdad

| Dato | Fuente de verdad |
|------|-----------------|
| Datos personales (nombre, documento, email, teléfono, etc.) | `public.members` |
| Estado de socio (active, expired, inactive, cancelled) | `public.members.status` |
| Vigencia de cuota | `public.members.paid_until` |
| Rol efectivo (socio, junta_directiva, administrador) | `public.profiles.role` |
| Usuario activo/inactivo en plataforma | `public.profiles.is_active` |
| Autenticación (login/password) | `auth.users` (gestionado por Supabase) |

### 3.4 Cómo se evita mezclar solicitud pública con cuenta activa

1. `signup_requests` y `members` son tablas independientes.
2. Una `signup_request` solo se vincula a `members` mediante `approved_member_id` **después** de que el admin aprueba y crea el `member`.
3. Tras crear `members`, el admin crea/invita el usuario en `auth.users` (vía Supabase Auth admin API o dashboard).
4. `profiles` solo se crea **después** de que existe `auth.users`, porque `profiles.id` es FK a `auth.users(id)`.
5. No hay camino automático de `signup_request` → `auth.users`. El admin es el gatekeeper.
6. El estado `pending_review` en `signup_requests` **no** es lo mismo que `pending_review` en `members.status`. Son flujos distintos.
7. La RLS de `signup_requests` solo permite INSERT público (con restricciones) y SELECT/UPDATE solo para admin. Nadie puede promocionar su propia solicitud a miembro.

---

## 4. Estados relevantes

### 4.1 Estados del ciclo de vida

| Estado | Dónde vive | Significado |
|--------|-----------|-------------|
| **Solicitud de alta** | `signup_requests.status = 'pending_review'` | Persona ha rellenado el formulario público. Pendiente de revisión administrativa. No tiene acceso al portal. |
| **Solicitud aprobada** | `signup_requests.status = 'approved'` | Admin ha aprobado la solicitud y creado `members` → `auth.users` → `profiles` en ese orden. |
| **Socio activo** | `members.status = 'active'` | Socio con membresía vigente. Puede acceder al portal si además `profiles.is_active = true` y `paid_until >= today`. |
| **Socio inactivo** | `members.status = 'inactive'` o `'expired'` o `'cancelled'` | Socio que no debe acceder al portal. Puede ser por cuota vencida, baja voluntaria o cancelación. |
| **Usuario autenticado** | `auth.users` + sesión Supabase válida | Persona con sesión activa en Supabase Auth. **No implica** acceso al portal, socio activo ni rol. |
| **Usuario autorizado** | `profiles.is_active = true` + `profiles.role` definido | Usuario autenticado cuyo perfil de aplicación está activo y tiene un rol asignado. **Sí implica** acceso según el rol. |
| **Rol administrativo** | `profiles.role IN ('junta_directiva', 'administrador')` | Usuario con permisos elevados. `administrador` tiene acceso completo; `junta_directiva` tiene acceso ampliado a recursos pero no a datos personales de otros socios. |

### 4.2 Notas sobre estados

- `pending_review` en `members` **no** es el mismo concepto que `pending_review` en `signup_requests`. En `members` podría usarse para miembros en proceso de validación administrativa (ej. importación de Excel), pero el flujo principal de alta pasa por `signup_requests`.
- `pending_payment` no existe como estado en el MVP. Decisión cerrada en D018.
- La validación de acceso combina: `auth.users` (sesión) + `profiles.is_active` + `profiles.role` + `members.status = 'active'` + `members.paid_until >= today`.
- Un usuario autenticado sin `profiles` activo (o sin `profiles` en absoluto) **no** es un usuario autorizado. El frontend debe redirigir a una pantalla de "sin acceso" o al login.
- **Deuda RLS:** Las helpers/RLS actuales validan rol y perfil activo (`current_app_role()` comprueba `profiles.is_active = true`), pero no todas refuerzan `members.status = 'active'` ni `paid_until >= today`. La protección visual de rutas puede comprobarlo en frontend, pero el bloqueo real de acceso a recursos privados por cuota vencida requiere una WO backend específica si se quiere aplicar a nivel RLS/Storage. Esta deuda no bloquea H0.7b.

### 4.3 Gobernanza admin / junta directiva

En el MVP no se define una figura separada de superadmin. El rol `administrador` representa a personas muy seleccionadas de la junta directiva con delegación operativa para gestionar el portal.

La junta directiva y administración no son equivalentes:

- **`junta_directiva`:** socio activo con permisos ampliados sobre contenidos/recursos.
- **`administrador`:** persona seleccionada de la junta con permisos completos sobre solicitudes, socios, renovaciones, contenidos y configuración operativa del portal.

No toda persona de junta es administradora. Todo administrador debe ser una persona expresamente designada por la junta.

La asignación o retirada del rol `junta_directiva` y `administrador` debe hacerse desde gestión administrativa controlada, nunca por autoservicio del socio ni desde el frontend público.

---

## 5. Protección de rutas

### 5.1 Matriz de rutas

Rutas actuales del frontend (`src/routes/AppRouter.tsx`) y su protección esperada:

| Ruta | Pública | Requiere sesión | Requiere socio activo | Requiere junta directiva | Requiere administrador |
|------|---------|-----------------|----------------------|-------------------------|------------------------|
| `/#/` | — | — | — | — | — |
| `/#/login` | Sí | No | No | No | No |
| `/#/hazte-socio` | Sí | No | No | No | No |
| `/#/socios` | No | Sí | Sí | — | — |
| `/#/socios/recursos` | No | Sí | Sí | — | — |
| `/#/socios/recursos/:resourceId` | No | Sí | Sí | — | — |
| `/#/socios/proyectos` | No | Sí | Sí | — | — |
| `/#/socios/proyectos/:projectId` | No | Sí | Sí | — | — |
| `/#/socios/mi-cuenta` | No | Sí | Sí | — | — |
| `/#/admin` | No | Sí | — | — | Sí |
| `/#/admin/socios` | No | Sí | — | — | Sí |
| `/#/admin/socios/:memberId` | No | Sí | — | — | Sí |
| `/#/admin/solicitudes` | No | Sí | — | — | Sí |
| `/#/admin/solicitudes/:signupId` | No | Sí | — | — | Sí |
| `/#/admin/recursos` | No | Sí | — | Sí | Sí |
| `/#/admin/recursos/nuevo` | No | Sí | — | Sí | Sí |
| `/#/admin/recursos/:resourceId` | No | Sí | — | Sí | Sí |
| `/#/admin/renovaciones` | No | Sí | — | — | Sí |

### 5.2 Notas sobre la matriz

- **Junta directiva** (`junta_directiva`) comparte panel admin para recursos (crear, editar, publicar). En el MVP `admin/recursos/*` requiere `junta_directiva` o superior. `admin/socios`, `admin/solicitudes` y `admin/renovaciones` requieren `administrador` (no junta).
- La ruta `/#/` redirige a `/#/login`. Cuando haya sesión, redirigirá al área correspondiente según rol.
- Las rutas de socio requieren `members.status = 'active'` además de sesión y rol. Un usuario autenticado con `profiles.role = 'socio'` pero `members.status = 'expired'` **no** debe acceder al área privada.

---

## 6. UX mínima de login

### 6.1 Comportamiento esperado por estado

| Situación | Comportamiento |
|-----------|---------------|
| Usuario no autenticado visita ruta protegida | Redirigir a `/#/login`. |
| Usuario no autenticado visita `/#/login` | Mostrar formulario de login (email + contraseña). |
| Credenciales incorrectas | Mostrar error: "Email o contraseña incorrectos". No revelar si el email existe o no. |
| Usuario autenticado sin `profiles` (o `profiles.is_active = false`) | Mostrar pantalla de "Sin acceso. Contacta con administración." — no redirigir en bucle al login. |
| Usuario autenticado con rol `socio` pero `members.status != 'active'` | Mostrar pantalla de "Tu membresía no está activa. Contacta con administración para renovar." — no mostrar área privada. |
| Usuario autenticado con rol `socio` y `members.status = 'active'` | Acceso completo a área privada: home, biblioteca, proyectos, mi cuenta. |
| Usuario autenticado con rol `junta_directiva` | Acceso a área privada de socio + panel admin de recursos (crear, editar, publicar). Sin acceso a datos personales de otros socios ni a solicitudes. |
| Usuario autenticado con rol `administrador` | Acceso completo: área privada + panel admin completo (socios, solicitudes, recursos, renovaciones). |
| Cierre de sesión | `supabase.auth.signOut()`. Redirigir a `/#/login`. Limpiar estado local de sesión. |

### 6.2 Estados de la UI de login

```
[Inicial]  → Email vacío, contraseña vacía, botón "Iniciar sesión"
[Enviando] → Botón deshabilitado, spinner o texto "Iniciando sesión..."
[Error]    → Mensaje de error bajo el formulario, campos habilitados para reintentar
[Éxito]    → Redirección al área correspondiente según rol
```

### 6.3 Restricciones de login

- Sin "recordarme" en MVP (persistSession ya está configurado en `supabaseClient.ts` con `autoRefreshToken: true`).
- Sin registro desde login.
- Sin enlace de "olvidé mi contraseña" en MVP.
- Sin login social (Google, GitHub, etc.).
- Sin captcha en MVP (evaluar antes de producción real).

---

## 7. Reglas de seguridad frontend

### 7.1 Principios inamovibles

1. **El frontend nunca usa `service_role`.** Solo se usa la anon/publishable key (`VITE_SUPABASE_ANON_KEY`). Cualquier operación que requiera `service_role` debe hacerse desde backend (Edge Functions, SQL Editor admin, o script autorizado).
2. **El frontend solo usa anon key.** El cliente Supabase inicializado en `src/lib/supabaseClient.ts` usa exclusivamente la anon key. No hay forma de que el frontend escale privilegios.
3. **La autorización real depende de RLS + helpers.** El frontend puede leer `profiles.role` para decidir qué UI mostrar, pero el acceso real a datos lo imponen las políticas RLS de Postgres y las funciones helper (`current_app_role()`, `is_admin()`, `is_junta_or_admin()`, `is_socio_or_higher()`). Si el frontend muestra un botón de admin a un usuario sin rol admin, la RLS denegará la operación.
4. **El frontend no debe asumir permisos solo por estado visual.** Mostrar/ocultar UI según rol es una conveniencia, no una capa de seguridad. La fuente de verdad del permiso es la respuesta de Supabase (que aplica RLS).
5. **No se deben exponer buckets privados directamente.** Las URLs firmadas de Storage deben generarse desde el backend o mediante RLS que verifique el rol antes de devolver la URL. Nunca exponer URLs públicas a buckets privados.
6. **No se deben commitear claves.** `.env.local` está en `.gitignore`. Las variables de entorno con secretos solo se configuran en el entorno de despliegue.

### 7.2 Validación de sesión en frontend

El frontend debe:

1. Al cargar, verificar `supabase.auth.getSession()` para detectar sesión existente.
2. Si hay sesión, cargar `profiles` y `members` para determinar rol y estado.
3. Suscribirse a `supabase.auth.onAuthStateChange()` para reaccionar a cambios de sesión (login, logout, token refresh, expiración).
4. Nunca almacenar el rol en `localStorage` como fuente de verdad. Siempre consultar `profiles` desde Supabase.
5. No hacer bypass del estado `members.status` mirando solo `profiles.role`.

### 7.3 Qué no debe hacer el frontend

- No crear usuarios en `auth.users` directamente (requiere `service_role` o invitación admin).
- No insertar en `profiles` (RLS solo permite INSERT a admin).
- No modificar `profiles.role` o `profiles.is_active` (RLS solo permite UPDATE a admin).
- No leer `signup_requests` salvo que el usuario sea admin (RLS lo bloquea).
- No leer datos de otros `members` salvo que el usuario sea admin (RLS lo bloquea).

---

## 8. Alcance de H0.7b

Se propone una micro-WO atómica para la siguiente fase:

```
H0.7b — Login UI real con Supabase Auth
```

Objetivo: implementar exclusivamente el formulario de login funcional (email + contraseña) conectado a Supabase Auth, sin proteger rutas todavía.

Incluye:

- Componente `LoginPage` funcional (sustituyendo el placeholder actual).
- Llamada real a `supabase.auth.signInWithPassword({ email, password })`.
- Manejo de estados: inicial, enviando, error, éxito.
- Redirección tras login exitoso a `/#/socios` (sin verificar rol ni estado de socio todavía).
- Sin protección de rutas (eso sería H0.7c).
- Sin consulta a `profiles` ni `members` (eso sería H0.7d).
- Sin logout (eso va con protección de rutas).

**No incluye:** protección de rutas, consulta de perfil/rol, comprobación de membresía activa, redirección por rol, panel admin funcional, ni logout.

### 8.1 Limitación sin usuario sintético

H0.7b puede implementar login UI y `signInWithPassword`, pero sin un usuario real en `auth.users` la validación funcional será limitada. Resultado esperado de H0.7b sin usuario sintético/autorizado:

- formulario renderiza correctamente;
- credenciales inválidas muestran error controlado de Supabase (`Invalid login credentials`);
- no crashea;
- no consulta tablas (`profiles`, `members`, etc.);
- no toca Storage;
- no usa datos reales.

La creación de un usuario sintético de prueba en `auth.users` + `profiles` + `members` requeriría una WO separada con autorización explícita (implica insertar datos en staging). H0.7b puede ejecutarse sin ese usuario y quedar pendiente de validación funcional completa hasta que exista.

---

## 9. Fuera de alcance

Queda explícitamente fuera del alcance de H0.7 (tanto H0.7a como H0.7b y sucesivas inmediatas):

- Registro automático completo de usuarios.
- Alta real de usuarios (creación de `auth.users` desde frontend).
- Datos reales de socios.
- Panel admin funcional con datos reales.
- Lectura de recursos privados desde Supabase.
- Subida/lectura de justificantes desde área privada.
- Cambios en RLS o policies.
- Seeds o datos sintéticos en Supabase.
- Cambios en migraciones.
- Cambios en Storage o buckets.
- Magic link.
- Recuperación de contraseña.
- Login social.
- Envío de emails (invitaciones, confirmaciones, etc.).
- Edge Functions.
- Stripe o pasarela de pago.
- Captcha.
- "Recordarme".
- Perfil de usuario editable por el propio socio.

---

## 10. Deuda documental detectada

Los siguientes documentos contienen información que contradice decisiones vigentes o el estado actual del proyecto. No se corrigen en esta WO. Se registran para revisión posterior.

| Documento | Problema detectado | Decisión vigente que lo contradice |
|-----------|-------------------|-----------------------------------|
| `docs/architecture.md` (línea 38) | Dice "Supabase Auth: autenticación por email/magic link" | D008: contraseña propia como método principal. Magic link fuera del MVP. |
| `docs/architecture.md` (líneas 51-52) | Menciona `pending_payment` como estado del flujo de alta | D018: `pending_review` como estado inicial. `pending_payment` no existe en MVP. |
| `docs/PRD.md` (sección 9.3, líneas 207-209) | Describe acceso al portal vía magic link/código de Supabase Auth | D008 + este contrato: login por email + contraseña propia. |
| `docs/PRD.md` (sección 9.1, línea 184) | Menciona `pending_payment` como estado posible de solicitud | D018: no se usa `pending_payment` en MVP. |
| `docs/PRD.md` (sección 12, línea 285) | Lista `pending_payment` como estado candidato | D018: cerrado. No se usa. |
| `docs/PRD.md` (sección 5.4) | Menciona a "Sil/Hermes" como responsable técnico inicial dentro del PRD de producto | Menor. No afecta a la implementación. |

**Recomendación:** Abrir una WO documental específica (`docs-correction-pass`) después de H0.7 para alinear `architecture.md` y `PRD.md` con las decisiones cerradas en `decisions.md` y este contrato.

---

## Validación

- [x] Documento creado en `docs/h07-auth-contract-20260623.md`
- [x] Cierra decisión de email + contraseña como vía MVP
- [x] Describe `auth.users → profiles → members → role`
- [x] Diferencia sesión, socio activo y rol
- [x] Incluye matriz de rutas con permisos
- [x] Incluye UX mínima de login
- [x] Incluye reglas de seguridad frontend
- [x] Propone H0.7b atómica
- [x] No modifica código
- [x] No modifica backend
- [x] No ejecuta comandos Supabase remotos
- [x] No expone claves
- [x] No hace commit
- [x] `Status: pending_review`
