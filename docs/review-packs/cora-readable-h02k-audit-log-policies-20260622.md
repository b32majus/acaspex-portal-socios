# Review Pack H0.2k — Policy RLS para audit_log ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creada una única policy RLS para `public.audit_log`:

- `supabase/migrations/20260622_012_acaspex_audit_log_policies.sql`

## Policy creada

| Policy | Operación | Condición | Notas |
|--------|-----------|-----------|-------|
| `audit_log_select_admin` | SELECT | `is_admin()` | Lectura admin exclusiva |

| Operación | Policy | Justificación |
|-----------|--------|---------------|
| INSERT | Sin policy | Evitar falsificación directa desde cliente; se implementará con función segura/trigger/service role |
| UPDATE | Sin policy | Append-only; la auditoría no se edita desde cliente |
| DELETE | Sin policy | La auditoría no se borra desde cliente; limpieza futura solo por proceso controlado |

## Decisiones aplicadas

- **Solo lectura admin**: la auditoría contiene actividad administrativa y cambios del sistema. No se expone a socios ni Junta.
- **INSERT bloqueado a propósito**: aunque el admin podría técnicamente insertar, se evita que código cliente (incluso admin) escriba auditoría directamente. Esto previene falsificación y asegura que toda entrada de audit_log pase por un mecanismo controlado del lado servidor (función `security definer`, trigger o service role).
- **Sin UPDATE/DELETE desde cliente**: append-only por diseño.
- **Sin funciones nuevas ni triggers en esta WO**: solo la policy.

## Verificación rápida

- [x] Contiene exactamente una `create policy`
- [x] Policy sobre `public.audit_log`
- [x] Policy `for select`
- [x] Usa `public.is_admin()`
- [x] No contiene `for insert`
- [x] No contiene `for update`
- [x] No contiene `for delete`
- [x] No contiene `insert into`
- [x] No contiene `create trigger`
- [x] No contiene funciones nuevas
- [x] No contiene `storage.buckets`
- [x] No contiene `USING (true)` ni `WITH CHECK (true)`
- [x] No contiene datos reales ni secrets

## Veredicto

`audit_log_policies_ready_for_review`

---

*Status: pending_review*
