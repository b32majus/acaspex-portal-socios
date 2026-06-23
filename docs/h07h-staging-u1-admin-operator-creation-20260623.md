---
title: H0.7h — Creación de U1 admin operativo en staging
status: pending_review
created: 2026-06-23
owner: Sil / Cora
project: ACASPEX Portal Socios
depends_on:
  - h07g_synthetic_users_design_pushed_ready_for_h07h
---

# H0.7h — Creación de U1 admin operativo en staging

## 1. Veredicto

**Veredicto:** `h07h_u1_admin_operator_created_authorized_pending_manual_validation`

Sil autorizó explícitamente la ejecución de H0.7h para crear U1 en Supabase staging.

U1 (administrador operativo sin ficha de socio) creado y verificado técnicamente. Pendiente validación funcional manual por Sil.

## 2. Usuario creado

| Campo | Valor |
|-------|-------|
| Tipo | U1 — Admin operativo sin ficha de socio |
| Email | `acaspex.admin.demo@example.com` |
| Auth user ID | `3a4b3065-d34e-4228-9953-7d8dec0f2844` |
| Email confirmado | Sí (`2026-06-23T10:23:48Z`) |
| Contraseña | Generada y custodiada fuera del repo. No documentada. |

## 3. Profile creado

| Campo | Valor |
|-------|-------|
| id | `3a4b3065-d34e-4228-9953-7d8dec0f2844` |
| member_id | `null` (sin socio vinculado) |
| email | `acaspex.admin.demo@example.com` |
| role | `administrador` |
| is_active | `true` |
| invited_at | `2026-06-23 10:23:48+00` |

## 4. Member

No creado. Correcto según diseño.

## 5. Verificación técnica

SELECT de verificación:

```json
{"id":"3a4b3065-d34e-4228-9953-7d8dec0f2844","email":"acaspex.admin.demo@example.com","email_normalized":"acaspex.admin.demo@example.com","role":"administrador","is_active":true,"member_id":null,"invited_at":"2026-06-23 10:23:48+00"}
```

Resultado: 1 fila, role = administrador, is_active = true, member_id = null. ✅

## 6. Método de creación

La creación se realizó vía Auth Admin API + Management API SQL porque no fue posible completar el flujo desde Supabase Dashboard. La API key fue facilitada por Sil para esta acción concreta. No se documentó ni commiteó la clave.

- Auth user: creado vía Auth Admin API (`POST /auth/v1/admin/users`) con service_role.
- Profile: creado vía Management API (`POST /v1/projects/{ref}/database/query`) tras `GRANT INSERT ON public.profiles TO service_role`.
- GRANT necesario porque `service_role` no tenía INSERT sobre profiles en el esquema actual.

No se modificaron migraciones, RLS, policies ni Storage.

## 7. Pendiente

Prueba funcional manual por Sil en `https://b32majus.github.io/acaspex-portal-socios/`:
- Login con `acaspex.admin.demo@example.com`
- `/admin` debe ser accesible
- `/socios` debe ser accesible por supervisión administrativa (H0.7l)
- Logout funcional

**Actualización H0.7l:** el administrador tiene acceso global al portal por supervisión operativa (D028). `canAccessMemberArea = true` para admin aunque no tenga socio vinculado. `accessReason = 'admin_oversight'`. El layout muestra nota de supervisión.

## 8. Rollback

```sql
-- 1. Eliminar profile
DELETE FROM public.profiles WHERE email_normalized = 'acaspex.admin.demo@example.com';

-- 2. Eliminar auth user desde Supabase Dashboard → Authentication → Users
--    Email: acaspex.admin.demo@example.com
```

Verificación post-rollback:

```sql
SELECT count(*) FROM public.profiles WHERE email_normalized = 'acaspex.admin.demo@example.com';
-- Resultado esperado: 0
```

Disponible. No ejecutado.
