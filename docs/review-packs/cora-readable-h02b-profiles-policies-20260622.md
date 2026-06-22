# Review Pack H0.2b — Policies RLS para profiles ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creadas las policies RLS mínimas para `public.profiles`:

- `supabase/migrations/20260622_003_acaspex_profiles_policies.sql`

## Policies creadas

| Policy | Operación | Condición | Notas |
|--------|-----------|-----------|-------|
| `profiles_select_own_or_admin` | SELECT | `auth.uid() = id OR is_admin()` | Propio perfil + admin global |
| `profiles_insert_admin` | INSERT | `is_admin()` (WITH CHECK) | Bootstrap del primer admin por service role |
| `profiles_update_admin` | UPDATE | `is_admin()` (USING + WITH CHECK) | Sin autogestión de socio todavía |
| DELETE | — | Sin policy | Se desactiva con `is_active = false` en MVP |

## Decisiones aplicadas

- **SELECT combinado**: una sola policy para legibilidad (`auth.uid() = id OR is_admin()`).
- **INSERT restringido**: solo admins. El primer administrador se crea por service role / SQL manual durante setup.
- **UPDATE solo admin**: `profiles` contiene campos sensibles (`role`, `is_active`, `member_id`, `email_normalized`). La autogestión del socio queda pendiente de WO posterior si se requiere.
- **DELETE sin policy**: en MVP los perfiles no se borran desde cliente. Se desactivan con `is_active = false`.
- **No policies para otras tablas**: solo `public.profiles`.

## Verificación rápida

- [x] Contiene `create policy`
- [x] Solo menciona `public.profiles` como tabla objetivo de policies
- [x] No contiene `insert into`
- [x] No contiene `storage`
- [x] No contiene `create bucket`
- [x] No contiene datos reales ni secrets
- [x] No toca otras migraciones

## Veredicto

`profiles_policies_ready_for_review`

---

*Status: pending_review*
