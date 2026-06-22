# Review Pack H0.2c — Policies RLS para members ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creadas las policies RLS mínimas para `public.members`:

- `supabase/migrations/20260622_004_acaspex_members_policies.sql`

## Policies creadas

| Policy | Operación | Condición | Notas |
|--------|-----------|-----------|-------|
| `members_select_own_or_admin` | SELECT | `profiles.member_id = members.id AND is_active` OR `is_admin()` | Propio socio + admin global |
| `members_insert_admin` | INSERT | `is_admin()` (WITH CHECK) | Sin autoservicio de alta |
| `members_update_admin` | UPDATE | `is_admin()` (USING + WITH CHECK) | Sin autogestión de socio |
| DELETE | — | Sin policy | Se gestiona con `status` |

## Decisiones aplicadas

- **SELECT restrictivo**: el socio solo ve su propia ficha, verificada mediante `profiles.member_id = members.id` con perfil activo.
- **Junta Directiva sin acceso global**: no puede leer datos personales de otros socios. Si un miembro de Junta es también administrador, accede vía `is_admin()`.
- **INSERT y UPDATE solo admin**: sin autoservicio ni autogestión del socio en MVP.
- **DELETE sin policy**: miembros no se borran desde cliente; se usa `status` para activos/inactivos/cancelados.
- **Sin funciones nuevas**: se reutilizan las auxiliares de H0.2a (`is_admin`).

## Verificación rápida

- [x] Contiene `create policy`
- [x] Solo crea policies sobre `public.members`
- [x] No contiene `insert into`
- [x] No contiene `storage`
- [x] No contiene `create bucket`
- [x] No contiene datos reales ni secrets
- [x] No contiene policies para otras tablas
- [x] Sin acceso global para junta_directiva

## Veredicto

`members_policies_ready_for_review`

---

*Status: pending_review*
