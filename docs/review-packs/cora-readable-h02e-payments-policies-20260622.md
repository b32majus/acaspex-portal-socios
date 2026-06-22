# Review Pack H0.2e — Policies RLS para payments ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creadas las policies RLS mínimas para `public.payments`:

- `supabase/migrations/20260622_006_acaspex_payments_policies.sql`

## Policies creadas

| Policy | Operación | Condición | Notas |
|--------|-----------|-----------|-------|
| `payments_select_admin` | SELECT | `is_admin()` | Sin acceso a socios ni junta |
| `payments_insert_admin` | INSERT | `is_admin()` (WITH CHECK) | Sin autoservicio de pagos |
| `payments_update_admin` | UPDATE | `is_admin()` (USING + WITH CHECK) | Validación admin completa |
| DELETE | — | Sin policy | Correcciones por estado/notas |

## Decisiones aplicadas

- **Acceso restringido a administradores**: payments contiene datos financieros y paths privados de justificantes. Ni socios ni Junta Directiva pueden leer esta tabla.
- **El socio ve su estado por `members.paid_until`**: no necesita acceso directo a payments para conocer su situación de membresía.
- **Sin DELETE**: correcciones vía `payment_status = rejected` y notas administrativas, no borrado desde cliente.
- **Sin funciones nuevas**: se reutiliza `is_admin()` de H0.2a.

## Verificación rápida

- [x] Contiene `create policy`
- [x] Solo crea policies sobre `public.payments`
- [x] No contiene `insert into`
- [x] No contiene `storage`
- [x] No contiene `create bucket`
- [x] No contiene datos reales ni secrets
- [x] No contiene policies para otras tablas
- [x] Sin acceso para junta_directiva ni socio

## Veredicto

`payments_policies_ready_for_review`

---

*Status: pending_review*
