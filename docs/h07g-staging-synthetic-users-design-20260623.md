---
title: H0.7g — Diseño de usuarios sintéticos de staging
status: pending_review
created: 2026-06-23
owner: Sil / Cora
project: ACASPEX Portal Socios
depends_on:
  - h07f_identity_read_hook_pushed_ready_for_next_step
feedstock:
  - docs/h07-auth-contract-20260623.md
  - docs/h07e-identity-read-model-20260623.md
  - docs/backlog.md
  - docs/decisions.md
  - supabase/migrations/20260622000001_001_acaspex_schema.sql
---

# H0.7g — Diseño de usuarios sintéticos de staging

## 1. Veredicto inicial

**Veredicto:** `h07g_synthetic_users_design_ready_for_cora_review`

El diseño define 6 usuarios sintéticos mínimos para cubrir todos los estados de identidad implementados en H0.7f. No hay bloqueantes técnicos para la creación en staging siempre que se haga mediante WO separada con autorización explícita de Sil.

Este documento no autoriza la creación de usuarios.

---

## 2. Principios

- Usuarios **ficticios**, sin datos personales reales.
- Emails de prueba en dominio `@example.com` (reservado para documentación, nunca email real).
- Contraseñas: generarlas y custodiarlas fuera del repo. No documentarlas.
- Entorno **staging únicamente** (`oxbsbvbrljzvfqpdozgl.supabase.co`). No producción.
- No usar `service_role` en frontend. La creación de `auth.users` requiere `service_role` o Supabase Dashboard.
- Creación mediante WO separada con autorización explícita de Sil.
- Rollback documentado por si hay que eliminar usuarios sintéticos.

---

## 3. Usuarios sintéticos mínimos

### U1 — Administrador operativo sin ficha de socio

**Objetivo:** validar que un admin sin socio puede acceder a `/admin` pero no a `/socios`.

| Capa | Campo | Valor |
|------|-------|-------|
| Auth | email | `acaspex.admin.demo@example.com` |
| Profile | role | `administrador` |
| Profile | is_active | `true` |
| Profile | member_id | `NULL` |
| Member | — | (no se crea) |

**Validaciones esperadas:**
- Login exitoso.
- `useIdentity().status` = `admin`.
- `canAccessAdmin` = `true`.
- `canAccessMemberArea` = `false`.
- `/admin` accesible.
- `/socios` denegado con mensaje de admin sin socio.

---

### U2 — Socio activo con cuota vigente

**Objetivo:** validar acceso completo al área de socios.

| Capa | Campo | Valor |
|------|-------|-------|
| Auth | email | `acaspex.socio.demo@example.com` |
| Profile | role | `socio` |
| Profile | is_active | `true` |
| Profile | member_id | → `members.id` |
| Member | first_name | `Socio` |
| Member | last_name_1 | `Demo` |
| Member | email | `acaspex.socio.demo@example.com` |
| Member | email_normalized | `acaspex.socio.demo@example.com` |
| Member | status | `active` |
| Member | paid_until | `2027-06-23` (futuro) |
| Member | fee_amount | `50.00` |
| Member | member_profile | `general` |

**Validaciones esperadas:**
- Login exitoso.
- `useIdentity().status` = `member_active`.
- `canAccessMemberArea` = `true`.
- `canAccessAdmin` = `false`.
- `/socios` accesible.
- `/admin` denegado.

---

### U3 — Socio con cuota vencida

**Objetivo:** validar bloqueo visual por cuota vencida.

| Capa | Campo | Valor |
|------|-------|-------|
| Auth | email | `acaspex.expirado.demo@example.com` |
| Profile | role | `socio` |
| Profile | is_active | `true` |
| Profile | member_id | → `members.id` |
| Member | first_name | `Expirado` |
| Member | last_name_1 | `Demo` |
| Member | email | `acaspex.expirado.demo@example.com` |
| Member | email_normalized | `acaspex.expirado.demo@example.com` |
| Member | status | `active` |
| Member | paid_until | `2026-01-01` (pasado) |
| Member | fee_amount | `50.00` |
| Member | member_profile | `general` |

**Validaciones esperadas:**
- Login exitoso.
- `useIdentity().status` = `member_expired`.
- `canAccessMemberArea` = `false`.
- `canAccessAdmin` = `false`.
- `/socios` denegado con mensaje de cuota no vigente.
- `/admin` denegado.

---

### U4 — Junta directiva activa

**Objetivo:** validar rol `junta_directiva` como socio activo con permisos ampliados futuros.

| Capa | Campo | Valor |
|------|-------|-------|
| Auth | email | `acaspex.junta.demo@example.com` |
| Profile | role | `junta_directiva` |
| Profile | is_active | `true` |
| Profile | member_id | → `members.id` |
| Member | first_name | `Junta` |
| Member | last_name_1 | `Demo` |
| Member | email | `acaspex.junta.demo@example.com` |
| Member | email_normalized | `acaspex.junta.demo@example.com` |
| Member | status | `active` |
| Member | paid_until | `2027-06-23` (futuro) |
| Member | fee_amount | `50.00` |
| Member | member_profile | `general` |

**Validaciones esperadas:**
- Login exitoso.
- `useIdentity().status` = `board_member`.
- `canAccessMemberArea` = `true`.
- `canAccessBoardArea` = `true`.
- `canAccessAdmin` = `false`.
- `/socios` accesible.
- `/admin` denegado (salvo rutas de recursos en fase futura).

---

### U5 — Usuario autenticado sin perfil

**Objetivo:** validar estado `authenticated_no_profile`.

| Capa | Campo | Valor |
|------|-------|-------|
| Auth | email | `acaspex.noprofile.demo@example.com` |
| Profile | — | (no se crea) |
| Member | — | (no se crea) |

**Validaciones esperadas:**
- Login exitoso.
- `useIdentity().status` = `authenticated_no_profile`.
- `canAccessMemberArea` = `false`.
- `canAccessAdmin` = `false`.
- `/socios` denegado con mensaje "sin perfil vinculado".
- `/admin` denegado.

---

### U6 — Perfil activo sin socio y sin rol admin

**Objetivo:** validar estado `authenticated_no_member` sin autorización.

| Capa | Campo | Valor |
|------|-------|-------|
| Auth | email | `acaspex.nomember.demo@example.com` |
| Profile | role | `socio` |
| Profile | is_active | `true` |
| Profile | member_id | `NULL` |
| Member | — | (no se crea) |

**Validaciones esperadas:**
- Login exitoso.
- `useIdentity().status` = `authenticated_no_member`.
- `canAccessMemberArea` = `false`.
- `canAccessAdmin` = `false`.
- `/socios` denegado con mensaje "sin ficha de socio".
- `/admin` denegado.

---

## 4. Priorización

Fases recomendadas para creación progresiva:

| Fase | Usuarios | Prioridad | Motivo |
|------|----------|-----------|--------|
| 1 | U1 (admin sin socio) | Crítica | Validar el caso más complejo y el gate de admin |
| 2 | U2 (socio activo) | Crítica | Validar el flujo completo de socio |
| 3 | U3 (cuota vencida) | Alta | Validar bloqueo por cuota |
| 4 | U4 (junta directiva) | Alta | Validar rol junta |
| 5 | U5 (sin perfil) | Media | Validar estado anómalo |
| 6 | U6 (sin socio, rol no admin) | Media | Validar estado anómalo |

Las fases 1 y 2 son las mínimas para validar la arquitectura completa. Las fases 3-6 son deseables pero no bloqueantes para continuar.

---

## 5. Datos ficticios propuestos

| Usuario | Email | Nombre en members |
|---------|-------|------------------|
| U1 | `acaspex.admin.demo@example.com` | — |
| U2 | `acaspex.socio.demo@example.com` | Socio Demo |
| U3 | `acaspex.expirado.demo@example.com` | Expirado Demo |
| U4 | `acaspex.junta.demo@example.com` | Junta Demo |
| U5 | `acaspex.noprofile.demo@example.com` | — |
| U6 | `acaspex.nomember.demo@example.com` | — |

Las contraseñas **no se documentan aquí**. Deben generarse fuera del repo y configurarse al crear los `auth.users`. Se recomienda usar contraseñas de prueba simples pero únicas (ej. generadas por gestor de contraseñas, no reutilizadas).

---

## 6. Forma de creación recomendada

Cada usuario sintético requiere el siguiente procedimiento en orden:

### Para usuarios con member (U2, U3, U4):

```
1. Crear member en public.members via Supabase Dashboard SQL Editor
     INSERT INTO public.members (first_name, last_name_1, email, email_normalized, status, paid_until, fee_amount, member_profile)
     VALUES (...)

2. Crear auth.users via Supabase Dashboard → Authentication → Add user
     Email: <email>
     Password: <generada fuera del repo>
     Require email confirmation: NO

3. Crear profile en public.profiles vinculado
     INSERT INTO public.profiles (id, member_id, email, email_normalized, role, is_active)
     VALUES (<auth.user.id>, <member.id>, <email>, <email>, <role>, true)
```

### Para usuarios sin member (U1, U5, U6):

```
1. Si tiene profile (U1, U6):
   a. Crear auth.users via Supabase Dashboard
   b. INSERT INTO public.profiles (id, email, email_normalized, role, is_active)

2. Si no tiene profile (U5):
   a. Crear auth.users via Supabase Dashboard
   b. No crear profile
```

### Notas

- `profiles.id` debe coincidir exactamente con `auth.users.id`.
- `service_role` o Supabase Dashboard son necesarios para crear `auth.users`.
- Las políticas RLS bloquearán la creación de `profiles` y `members` desde cliente con anon key.
- Recomendado: ejecutar inserts directamente en Supabase SQL Editor (bypassea RLS).

---

## 7. Rollback

Para eliminar usuarios sintéticos de forma limpia y sin datos huérfanos:

```sql
-- Orden correcto (respeta FKs):
-- 1. Primero profiles (FK → auth.users CASCADE, FK → members SET NULL)
DELETE FROM public.profiles WHERE email_normalized LIKE '%acaspex.%@example.com';

-- 2. Luego members (ya sin referencias desde profiles)
DELETE FROM public.members WHERE email_normalized LIKE '%acaspex.%@example.com';

-- 3. Finalmente auth.users (debe hacerse desde Dashboard o API admin)
--    Supabase Dashboard → Authentication → Delete user
--    O vía Supabase Management API con service_role
```

Verificación post-rollback:

```sql
SELECT 'profiles' AS tabla, count(*) FROM public.profiles WHERE email_normalized LIKE '%acaspex.%@example.com'
UNION ALL
SELECT 'members', count(*) FROM public.members WHERE email_normalized LIKE '%acaspex.%@example.com';
```

Ambos conteos deben ser 0.

---

## 8. Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Crear usuarios con emails reales por error | Usar exclusivamente `@example.com`. |
| Dejar contraseñas en docs o logs | No documentar contraseñas. Generar fuera del repo. |
| Romper RLS al insertar desde cliente | Usar SQL Editor de Supabase (bypassea RLS). |
| Confundir staging con producción | Verificar project ref: `oxbsbvbrljzvfqpdozgl`. |
| Crear datos huérfanos | Seguir siempre el orden de creación: member → auth.user → profile. |
| Usar service_role incorrectamente | Solo usar service_role en Dashboard/SQL Editor. Nunca en frontend. |
| Dejar usuarios sintéticos tras pruebas | Eliminar con el rollback documentado al terminar. |

---

## 9. Recomendación de siguiente WO

```
H0.7h — Crear usuario sintético U1 (admin operativo sin ficha de socio) en staging
```

**Objetivo:** crear el primer usuario sintético en Supabase staging y validar el flujo de admin.

**Requisitos previos:**
- Autorización explícita de Sil.
- Acceso al Supabase Dashboard del proyecto `acaspex-portal-staging`.
- Contraseña de prueba generada fuera del repo.

**H0.7h SÍ tocaría Supabase staging.** Requiere WO separada con dry-run y procedimiento documentado.

---

## 10. Fuera de alcance

Queda explícitamente fuera de este diseño:

- Crear usuarios reales.
- Crear contraseñas y documentarlas.
- Tocar producción.
- Modificar RLS, policies o migraciones.
- Crear seeds permanentes.
- Datos reales de socios.
- Panel admin funcional.
- Automatizar la creación de usuarios sintéticos.
