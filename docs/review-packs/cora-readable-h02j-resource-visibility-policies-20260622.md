# Review Pack H0.2j — Policies RLS para resource_visibility ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creadas las policies RLS mínimas para `public.resource_visibility`:

- `supabase/migrations/20260622_011_acaspex_resource_visibility_policies.sql`

## Policies creadas

| Policy | Operación | Condición | Notas |
|--------|-----------|-----------|-------|
| `resource_visibility_select_admin` | SELECT | `is_admin()` | Sin lectura directa por socios/junta |
| `resource_visibility_insert_admin` | INSERT | `is_admin()` (WITH CHECK) | Asignación de visibilidad |
| `resource_visibility_update_admin` | UPDATE | `is_admin()` (USING + WITH CHECK) | Modificación de reglas |
| `resource_visibility_delete_admin` | DELETE | `is_admin()` | Excepción justificada — retirar visibilidad |

## Decisiones aplicadas

- **Admin-only en todas las operaciones**: resource_visibility es una tabla de configuración interna. Los socios y Junta no necesitan leerla directamente; la visibilidad se aplica a través de `resources` + `can_access_resource_by_visibility`.
- **DELETE admin-only (excepción justificada)**: a diferencia de otras tablas del MVP, `resource_visibility` no tiene campo `status` ni `is_active`. Eliminar una fila es la forma natural de retirar visibilidad de un recurso a un rol. Es la única tabla del MVP con policy de DELETE.
- **Sin funciones nuevas**: se reutiliza `is_admin()` de H0.2a.

## Verificación rápida

- [x] Contiene `create policy`
- [x] Solo crea policies sobre `public.resource_visibility`
- [x] SELECT admin-only
- [x] INSERT admin-only
- [x] UPDATE admin-only
- [x] DELETE admin-only
- [x] No contiene `USING (true)` ni `WITH CHECK (true)`
- [x] No contiene `insert into`
- [x] No contiene `storage.buckets`
- [x] No contiene datos reales ni secrets

## Veredicto

`resource_visibility_policies_ready_for_review`

---

*Status: pending_review*
