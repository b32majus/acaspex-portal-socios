# Review Pack H0.2f — Policies RLS para membership_periods ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creadas las policies RLS mínimas para `public.membership_periods`:

- `supabase/migrations/2026062200007_007_acaspex_membership_periods_policies.sql`

## Policies creadas

| Policy | Operación | Condición | Notas |
|--------|-----------|-----------|-------|
| `membership_periods_select_own_or_admin` | SELECT | `profiles.member_id = membership_periods.member_id AND is_active` OR `is_admin()` | Propio periodo + admin global |
| `membership_periods_insert_admin` | INSERT | `is_admin()` (WITH CHECK) | Sin autoservicio |
| `membership_periods_update_admin` | UPDATE | `is_admin()` (USING + WITH CHECK) | Sin autogestión |
| DELETE | — | Sin policy | Gestión por estado |

## Decisiones aplicadas

- **SELECT con visibilidad propia**: el socio ve sus periodos via `profiles.member_id`. Esto permite mostrar estado de membresía sin exponer la tabla `payments`.
- **Junta Directiva sin acceso global**: si un miembro de Junta necesita ver periodos de otros socios, debe tener también rol `administrador`.
- **INSERT y UPDATE solo admin**: los periodos se crean/modifican como parte del flujo administrativo de alta/renovación.
- **Sin DELETE**: gestión por `status` (active, expired, cancelled).
- **Sin funciones nuevas**: se reutiliza `is_admin()` de H0.2a.

## Verificación rápida

- [x] Contiene `create policy`
- [x] Solo crea policies sobre `public.membership_periods`
- [x] No contiene `insert into`
- [x] No contiene `storage`
- [x] No contiene `create bucket`
- [x] No contiene datos reales ni secrets
- [x] No contiene policies para otras tablas

## Veredicto

`membership_periods_policies_ready_for_review`

---

*Status: pending_review*
