---
title: H0.7n — Diagnóstico y corrección de GRANT SELECT para identity read
status: pending_review
created: 2026-06-23
owner: Sil / Cora
---

# H0.7n — Diagnóstico y corrección de GRANT SELECT

## 1. Diagnóstico

### Síntoma

Login U1 funciona. La app muestra:

```
No hemos podido comprobar los permisos de tu cuenta.
Inténtalo de nuevo o contacta con administración.
```

### Causa raíz

El rol `authenticated` no tenía `SELECT` sobre `public.profiles` ni `public.members`.

```sql
-- Antes:
authenticated_can_select_profiles = false
authenticated_can_select_members = false
```

Supabase no otorga SELECT automáticamente a `authenticated` al crear tablas con `CREATE TABLE`. Las políticas RLS existían pero sin permisos base de lectura.

### Verificación previa

| Check | Antes |
|-------|-------|
| `authenticated` USAGE on public schema | true |
| `authenticated` SELECT on profiles | **false** |
| `authenticated` SELECT on members | **false** |
| RLS enabled on profiles | true |
| RLS enabled on members | true |

## 2. Corrección

```sql
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.members TO authenticated;
```

Aplicado en staging vía Management API.

## 3. Verificación post-GRANT

| Check | Después |
|-------|---------|
| `authenticated` SELECT on profiles | true |
| `authenticated` SELECT on members | true |

## 4. Migración

Creada: `supabase/migrations/20260623000019_019_acaspex_authenticated_identity_read_grants.sql`

Aplicada en staging. No se tocó RLS, policies ni Storage.

## 5. Pendiente

Validación pública por Sil en `https://b32majus.github.io/acaspex-portal-socios/` con U1 (`acaspex.admin.demo@example.com`):

- Pantalla post-login: "Ir al panel de administración" + "Ver área de socios"
- `/admin` accesible
- `/socios` accesible con nota "Supervisión administrativa"
