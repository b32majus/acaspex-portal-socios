# Review Pack H0.2a — RLS baseline + funciones auxiliares ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creada la capa de seguridad base para Supabase staging del Portal Socios ACASPEX:

- `supabase/migrations/2026062200002_002_acaspex_rls_baseline.sql`

## Funciones auxiliares creadas

| Función | Retorno | Descripción |
|---------|---------|-------------|
| `public.current_app_role()` | `app_role` | Rol lógico del usuario autenticado desde `profiles`. Null si no hay sesión o perfil inactivo. |
| `public.is_admin()` | `boolean` | True si `current_app_role() = 'administrador'` |
| `public.is_junta_or_admin()` | `boolean` | True si rol es `junta_directiva` o `administrador` |
| `public.is_socio_or_higher()` | `boolean` | True si rol es `socio`, `junta_directiva` o `administrador` |

**Seguridad:**
- Todas las funciones usan `security definer` con `search_path = public`.
- No exponen datos personales. Solo devuelven rol propio o booleanos.
- No permiten listar perfiles ajenos.
- Comentarios SQL indican que se usarán en policies posteriores.

## Tablas con RLS activado

| # | Tabla |
|---|-------|
| 1 | `public.profiles` |
| 2 | `public.members` |
| 3 | `public.signup_requests` |
| 4 | `public.payments` |
| 5 | `public.membership_periods` |
| 6 | `public.resource_categories` |
| 7 | `public.resources` |
| 8 | `public.resource_visibility` |
| 9 | `public.audit_log` |

RLS está activado en las 9 tablas. Sin policies funcionales, cualquier consulta desde cliente devuelve cero filas (denegación por defecto).

## No incluido

- Policies de lectura/escritura (H0.2b, H0.2c, H0.2d)
- Storage policies (H0.3)
- Buckets
- Seed/datos sintéticos
- Inserts de prueba
- Triggers de auditoría
- Conexión frontend
- `.env`, secrets ni credenciales

## Verificación rápida

- [x] Contiene `enable row level security`
- [x] No contiene `create policy`
- [x] No contiene `insert into`
- [x] No contiene `create bucket`
- [x] No contiene datos reales ni secrets

## Veredicto

`rls_baseline_ready_for_review`

## Revisión sugerida

- Confirmar que las funciones `security definer` con `search_path = public` son la aproximación correcta para el modelo de roles de ACASPEX.
- Las funciones booleanas wrapper (`is_admin`, `is_junta_or_admin`, `is_socio_or_higher`) son plpgsql para consistencia; podrían migrarse a `language sql` si se prefiere.
- `current_app_role()` consulta `profiles` con `is_active = true`; los perfiles inactivos devuelven null aunque auth.uid() exista. ¿Es el comportamiento deseado?

---

*Status: pending_review*
