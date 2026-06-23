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

**Veredicto:** `h07h_u1_admin_operator_created_and_validated`

U1 (administrador operativo sin ficha de socio) creado y verificado.

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

- Auth user: creado vía Auth Admin API (`POST /auth/v1/admin/users`) con service_role.
- Profile: creado vía Management API (`POST /v1/projects/{ref}/database/query`) tras `GRANT INSERT ON public.profiles TO service_role`.

No se modificaron migraciones, RLS, policies ni Storage.

## 7. Pendiente

Prueba funcional manual por Sil en `https://b32majus.github.io/acaspex-portal-socios/`:
- Login con `acaspex.admin.demo@example.com`
- `/admin` debe ser accesible
- `/socios` debe ser denegado (admin sin socio)
- Logout funcional

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
