# Review Pack H0.2d — Policies RLS para signup_requests ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creadas las policies RLS mínimas para `public.signup_requests`:

- `supabase/migrations/20260622_005_acaspex_signup_requests_policies.sql`

## Policies creadas

| Policy | Operación | Condición | Notas |
|--------|-----------|-----------|-------|
| `signup_requests_insert_public` | INSERT | `status = 'pending_review'` + campos admin a null (WITH CHECK) | Formulario público restringido |
| `signup_requests_select_admin` | SELECT | `is_admin()` | Sin consulta pública de solicitudes |
| `signup_requests_update_admin` | UPDATE | `is_admin()` (USING + WITH CHECK) | Revisión admin completa |
| DELETE | — | Sin policy | Gestión por estado |

## Detalle del INSERT público

La policy `signup_requests_insert_public` permite inserción desde el formulario público pero exige vía `WITH CHECK`:

- `status = 'pending_review'`
- `approved_member_id is null`
- `reviewed_by is null`
- `reviewed_at is null`
- `admin_notes is null`
- `review_reason is null`

Esto impide que un usuario malicioso cree una solicitud ya aprobada, se auto-asigne como miembro aprobado o escriba en campos administrativos.

## Decisiones aplicadas

- **Sin `pending_payment`**: decisión cerrada. El pago se valida dentro de `pending_review`.
- **Sin consulta pública**: los solicitantes no leen su solicitud desde BD. La confirmación va por email.
- **Sin DELETE**: las solicitudes se gestionan por estado, no se borran desde cliente.
- **Sin funciones nuevas**: se reutilizan `is_admin()` de H0.2a.

## Verificación rápida

- [x] Contiene `create policy`
- [x] Solo crea policies sobre `public.signup_requests`
- [x] INSERT público usa `WITH CHECK`
- [x] INSERT público exige `status = 'pending_review'`
- [x] No contiene `pending_payment`
- [x] No contiene `insert into`
- [x] No contiene `storage`
- [x] No contiene `create bucket`
- [x] No contiene datos reales ni secrets
- [x] No contiene policies para otras tablas

## Veredicto

`signup_requests_policies_ready_for_review`

---

*Status: pending_review*
