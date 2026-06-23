---
title: H0.7e — Identity read model design
status: pending_review
created: 2026-06-23
owner: Sil / Cora
project: ACASPEX Portal Socios
depends_on:
  - h07d_route_gates_approved_ready_for_h07e_identity_read_model_design
feedstock:
  - docs/h07-auth-contract-20260623.md
  - docs/backlog.md
  - docs/decisions.md
  - docs/PRD.md
  - supabase/migrations/20260622000001_001_acaspex_schema.sql
  - supabase/migrations/20260622000002_002_acaspex_rls_baseline.sql
  - supabase/migrations/20260622000003_003_acaspex_profiles_policies.sql
  - supabase/migrations/20260622000004_004_acaspex_members_policies.sql
  - supabase/migrations/20260622000009_009_acaspex_resource_access_helpers.sql
---

# H0.7e — Identity read model design

## 1. Veredicto inicial

**Veredicto:** `h07e_identity_read_model_ready_for_review`

El diseño define el modelo de lectura de identidad/autorización usando exclusivamente el esquema existente en staging. No se necesitan nuevas columnas, tablas ni migraciones. Las capas están separadas correctamente: `auth.users` (sesión) → `profiles` (rol + vínculo) → `members` (estado de socio + vigencia).

No hay bloqueantes para diseñar H0.7f (implementación) tras revisión de Cora/Sil.

---

## 2. Modelo conceptual

| Concepto | Significado funcional |
|----------|----------------------|
| **Cuenta** | Permite iniciar sesión. Vive en `auth.users`. Tiene email y contraseña. No implica pertenencia a la asociación. |
| **Perfil** | Vincula la cuenta con una persona dentro del portal. Vive en `public.profiles`. Contiene `role` e `is_active`. |
| **Socio** | Determina si la persona pertenece a ACASPEX y en qué estado. Vive en `public.members`. Contiene `status` y `paid_until`. |
| **Rol** | Determina qué permisos operativos tiene dentro del portal: `socio`, `junta_directiva` o `administrador`. |
| **Cuota / vigencia** | Determina si la persona mantiene acceso como socio. `members.paid_until >= today` + `members.status = 'active'`. |

Regla fundamental:

> Una cuenta permite identificarse. Un perfil activo con rol habilita funciones. Un socio activo con cuota vigente permite acceso a contenidos privados. Las tres capas son independientes.

---

## 3. Modelo técnico

### 3.1 Cadena de identidad (esquema real)

```text
auth.users.id  =  profiles.id                    (FK, ON DELETE CASCADE)
profiles.member_id  →  members.id                (FK, ON DELETE SET NULL)
profiles.role  =  app_role                       (socio | junta_directiva | administrador)
profiles.is_active  =  boolean                   (default true)
members.status  =  member_status                 (pending_review | active | expired | inactive | cancelled)
members.paid_until  =  date | null
```

### 3.2 Significado de cada FK

| FK | Significado |
|----|-------------|
| `profiles.id → auth.users.id` | Quién eres en Auth. Sin `auth.users`, no hay `profiles`. |
| `profiles.member_id → members.id` | A qué socio estás vinculado. Puede ser null (cuenta sin socio). |

### 3.3 Consulta canónica esperada en H0.7f

Para obtener la identidad completa del usuario autenticado, la consulta en frontend debe ser:

```sql
-- conceptual, no ejecutar
SELECT
  profiles.id,
  profiles.role,
  profiles.is_active,
  profiles.member_id,
  members.status,
  members.paid_until,
  members.email,
  members.first_name,
  members.last_name_1
FROM profiles
LEFT JOIN members ON members.id = profiles.member_id
WHERE profiles.id = auth.uid()
  AND profiles.is_active = true
```

El `LEFT JOIN` es necesario porque un perfil puede existir sin miembro vinculado (caso: admin sin ficha de socio).

### 3.4 Helpers existentes de RLS

| Helper | Qué comprueba | Qué NO comprueba |
|--------|--------------|------------------|
| `current_app_role()` | `profiles.id = auth.uid()` AND `profiles.is_active = true` | `members.status`, `members.paid_until` |
| `is_admin()` | `current_app_role() = 'administrador'` | — |
| `is_junta_or_admin()` | `current_app_role() IN ('junta_directiva', 'administrador')` | — |
| `is_socio_or_higher()` | `current_app_role() IN ('socio', 'junta_directiva', 'administrador')` | — |
| `can_access_resource_by_visibility(id)` | `current_app_role()` + `resource_visibility` por rol | `resources.status`, `members.status`, `members.paid_until` |

---

## 4. Estados de acceso

El frontend debe poder distinguir los siguientes estados tras resolver la identidad:

| Estado | Condiciones | Significado para UI |
|--------|------------|---------------------|
| `loading` | `AuthProvider.loading = true` | Mostrar spinner / "Comprobando sesión..." |
| `not_authenticated` | Sin sesión en `auth.users` | Mostrar login. Redirigir rutas privadas. |
| `authenticated_no_profile` | Sesión activa pero `profiles` no existe o `profiles.is_active = false` | Mostrar "Sin acceso. Contacta con administración." |
| `authenticated_no_member` | Sesión + perfil activo, pero `profiles.member_id IS NULL` | Si `profiles.role = 'administrador'`: acceso al panel admin como administrador operativo. Si el rol no es `administrador`: mostrar "Sin acceso. Contacta con administración." |
| `member_inactive` | `members.status IN ('inactive', 'cancelled')` | Mostrar "Tu membresía no está activa." Sin acceso a área privada. |
| `member_expired` | `members.status = 'expired'` OR (`members.status = 'active'` AND `paid_until < today`) | Mostrar "Tu cuota ha vencido. Contacta con administración para renovar." |
| `member_active` | `members.status = 'active'` AND `paid_until >= today` | Acceso completo a área de socio. |
| `board_member` | `member_active` + `profiles.role = 'junta_directiva'` | Acceso de socio + panel admin de recursos. Sin acceso a datos de otros socios. |
| `admin` | `profiles.role = 'administrador'` | Acceso al panel admin completo (socios, solicitudes, recursos, renovaciones). Puede existir sin ficha de socio vinculada (`authenticated_no_member`). Si además es `member_active`, también accede al área de socio. |
| `error` | Fallo en la consulta a `profiles` o `members` | Mostrar error controlado. No crashear. |

### Notas

- En el MVP se permite la existencia de administradores operativos sin ficha de socio, especialmente para personas designadas para configurar, mantener o gestionar el portal. Este rol no equivale a socio ni a junta directiva, y no crea una figura de superadmin.
- El acceso al área de socios sigue requiriendo ficha de socio activa y cuota vigente. El acceso al área admin requiere perfil activo con rol `administrador`, con independencia de que exista o no ficha de socio vinculada.
- Un usuario con rol `administrador` podría no estar vinculado a `members` (admin operativo sin ficha de socio). El estado `authenticated_no_member` para admin es válido y permite acceso al panel admin, pero no al área de socio.
- `member_inactive` y `member_expired` son estados excluyentes de `member_active`. Si `members.status = 'active'` pero `paid_until < today`, se considera `member_expired` aunque el status diga `'active'`.
- `board_member` y `admin` son subestados de `member_active` (o `authenticated_no_member` para admin). No existen sin perfil activo.

---

## 5. Matriz de acceso por zonas

### 5.1 Condiciones por zona

| Zona | Rutas | Sin sesión | Con sesión | Perfil activo | Socio activo | Cuota vigente | Rol junta | Rol admin |
|------|-------|-----------|------------|-------------|-------------|-------------|-----------|-----------|
| **Pública** | `/login`, `/hazte-socio` | Acceso | Acceso | — | — | — | — | — |
| **Login** | `/login` | Ver form | Ver "Sesión iniciada" | — | — | — | — | — |
| **Socio** | `/socios`, `/socios/*` | Redirigir | Redirigir si no perfil | Redirigir si no socio activo | Requerido | Requerido | — | — |
| **Junta** | `/admin/recursos`, `/admin/recursos/*` | Redirigir | Redirigir | Requerido | Requerido | Requerido | Requerido | Requerido |
| **Admin** | `/admin`, `/admin/socios`, `/admin/solicitudes`, `/admin/renovaciones` | Redirigir | Redirigir | Requerido | — (puede ser admin sin socio) | — | — | Requerido |

### 5.2 Notas sobre la matriz

- H0.7d ya protege todas las rutas privadas por sesión.
- H0.7f debe añadir protección por `profiles.role` para `/admin/socios`, `/admin/solicitudes`, `/admin/renovaciones`.
- `/admin/recursos/*` requiere `is_junta_or_admin()` (rol junta_directiva o administrador).
- La diferencia entre junta y admin en recursos es solo a nivel RLS: junta ve recursos con visibilidad `socio` o `junta_directiva`; admin ve todos.
- La zona "Socio" requiere además `members.status = 'active'` y `paid_until >= today`.

---

## 6. Lectura mínima necesaria (H0.7f)

En H0.7f, el frontend necesita leer del usuario autenticado:

| Dato | Tabla | Columna |
|------|-------|---------|
| ID del perfil | `profiles` | `id` |
| Rol operativo | `profiles` | `role` |
| Perfil activo | `profiles` | `is_active` |
| ID del socio vinculado | `profiles` | `member_id` |
| Estado del socio | `members` | `status` |
| Vigencia de cuota | `members` | `paid_until` |
| Email del socio | `members` | `email` |
| Nombre del socio | `members` | `first_name`, `last_name_1` |

La consulta debe hacerse usando el cliente Supabase estándar con anon key. La RLS de `profiles` permite SELECT del propio perfil (`auth.uid() = id`). La RLS de `members` permite SELECT solo del miembro vinculado al perfil (`profiles.member_id = members.id` con perfil activo).

Propuesta de implementación: un hook `useIdentity()` o similar que devuelva el estado completo del modelo de acceso definido en la sección 4.

---

## 7. Separación: autorización visual vs seguridad real

El frontend puede y debe:
- Ocultar rutas/pantallas según el estado de acceso resuelto.
- Redirigir a `/login` si no hay sesión.
- Mostrar mensajes de "sin acceso" según el estado.

El frontend **no** debe:
- Asumir que ocultar una ruta impide el acceso real a los datos.
- Usar el rol frontend como fuente de verdad para autorización de datos.
- Confiar en que `members.status` frontend bloquea accesos; la RLS es la última barrera.

**Regla:** la seguridad real de datos privados depende de RLS + helpers en Supabase. El frontend aplica UX, no seguridad.

---

## 8. Deuda RLS detectada

### 8.1 Lo que las helpers actuales SÍ refuerzan

| Condición | Helper que la cubre |
|-----------|-------------------|
| Usuario autenticado | `auth.uid()` implícito en todas las policies |
| Perfil activo | `current_app_role()` → `profiles.is_active = true` |
| Rol (admin, junta, socio) | `current_app_role()`, `is_admin()`, `is_junta_or_admin()`, `is_socio_or_higher()` |
| Visibilidad de recurso por rol | `can_access_resource_by_visibility(resource_id)` |
| Recurso publicado (no draft) | **Cubierta por resource policies** que combinan `status = 'published'` con el helper de visibilidad |

### 8.2 Lo que las helpers actuales NO refuerzan

| Condición | Estado |
|-----------|--------|
| `members.status = 'active'` | **NO reforzado por RLS.** Las policies de `members` solo comprueban `profiles.member_id = members.id` para SELECT propio. No validan `status`. |
| `members.paid_until >= today` | **NO reforzado por RLS.** Ninguna policy ni helper comprueba vigencia de cuota. |
| Bloqueo de recursos por cuota vencida | **NO reforzado.** La visibilidad por rol (`can_access_resource_by_visibility`) no comprueba cuota. |

### 8.3 Consecuencia

Un usuario con `profiles.role = 'socio'` y `profiles.is_active = true` pero `members.status = 'expired'` y `paid_until < today`:

- **Puede** leer su propio `members` (RLS lo permite).
- **Puede** acceder a recursos con visibilidad `socio` (RLS no bloquea por cuota).
- **No debería** acceder al área privada si el frontend aplica la comprobación.

### 8.4 Recomendación

La comprobación de `members.status = 'active'` y `paid_until >= today` puede aplicarse inicialmente en frontend (H0.7f) para UX, pero la deuda real de backend/RLS debe resolverse con WO específica antes de producción con datos reales. Esta deuda ya está registrada como P-H07-006 en el backlog.

---

## 9. Implicación para /admin

### Estado actual (H0.7d)

`/admin` y todas sus subrutas están protegidas solo por sesión (`RequireAuth`). Cualquier persona con sesión válida puede ver el panel admin.

### Estado objetivo (H0.7f/H0.7g)

`/admin/socios`, `/admin/solicitudes`, `/admin/renovaciones` deben requerir `profiles.role = 'administrador'`.

`/admin/recursos`, `/admin/recursos/*` deben requerir `profiles.role IN ('junta_directiva', 'administrador')`.

### Implementación recomendada

Crear un componente `RequireRole` que envuelva rutas específicas o un `RequireAdmin` + `RequireBoardOrAdmin`.

Ejemplo de firma:

```text
<RequireRole roles={['administrador']}> → bloquea si no tiene el rol
<RequireRole roles={['junta_directiva', 'administrador']}> → bloquea si no es junta ni admin
```

---

## 10. Implicación para junta directiva

- Una persona con rol `junta_directiva` debe ser socio activo (`member_active`) con cuota vigente.
- `junta_directiva` accede a área de socio + panel admin de recursos (no a datos de otros socios ni solicitudes).
- No toda persona de junta es administradora.
- Todo administrador es una persona expresamente designada por la junta.
- No hay superadmin en el MVP.

La UI debe reflejar esta diferencia: el panel admin de una persona con rol `junta_directiva` solo debe mostrar la sección de recursos.

---

## 11. Usuarios sintéticos necesarios para pruebas

Para validar H0.7f completamente, harán falta usuarios de prueba con distintos estados. No se crean ahora:

| Tipo | `profiles.role` | `members.status` | `members.paid_until` | Propósito |
|------|----------------|-----------------|---------------------|-----------|
| Socio activo | `socio` | `active` | futuro (+1 año) | Validar flujo completo |
| Junta activa | `junta_directiva` | `active` | futuro (+1 año) | Validar acceso a recursos admin |
| Admin | `administrador` | `active` | futuro (+1 año) | Validar panel admin completo |
| Socio expirado | `socio` | `active` | pasado (-1 mes) | Validar bloqueo por cuota vencida |
| Socio inactivo | `socio` | `inactive` | — | Validar mensaje de membresía no activa |

La creación de estos usuarios requiere:
- Insertar en `auth.users` (requiere `service_role` o dashboard de Supabase).
- Insertar en `profiles` (requiere `is_admin()` → bootstrap inicial con `service_role`).
- Insertar en `members` (requiere `is_admin()`).
- WO separada con autorización explícita de Sil.
- No usar datos reales.

---

## 12. Alcance recomendado H0.7f

```
H0.7f — Identity read hook: leer profile/member/role del usuario autenticado
```

**Incluye:**
- Hook `useIdentity()` que devuelva el estado de acceso (sección 4).
- Consulta a `profiles` + `members` vía cliente Supabase centralizado.
- Sin panel admin funcional.
- Sin edición de datos.
- Sin datos reales.

**No incluye:**
- Crear usuarios de prueba (WO separada).
- Protección por rol en rutas (H0.7g).
- Panel admin.
- Lectura de recursos.
- Subida/lectura de Storage.

**Prerrequisito recomendado:** usuario sintético autorizado (WO separada) para validación funcional real.

---

## 13. Fuera de alcance

Queda explícitamente fuera del alcance de H0.7e y H0.7f:

- Crear usuarios.
- Crear seeds.
- Tocar RLS.
- Tocar migraciones.
- Panel admin funcional.
- Subida/lectura de recursos.
- Edición de socios.
- Renovaciones.
- Datos reales.
- Stripe / pagos.
- Emails.
- Storage.

---

## Validación

- [x] Documento creado en `docs/h07e-identity-read-model-20260623.md`
- [x] Distingue sesión, socio, cuota y rol
- [x] 10 estados de acceso definidos
- [x] Matriz de acceso por zonas (5 zonas)
- [x] Deuda RLS documentada (3 gaps)
- [x] Implicaciones para /admin y junta directiva
- [x] Usuarios sintéticos listados (no creados)
- [x] Propuesta H0.7f atómica
- [x] No modifica código
- [x] No toca Supabase remoto
- [x] No expone secretos
- [x] `Status: pending_review`
