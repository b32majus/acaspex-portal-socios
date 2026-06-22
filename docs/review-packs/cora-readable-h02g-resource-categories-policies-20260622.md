# Review Pack H0.2g — Policies RLS para resource_categories ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creadas las policies RLS mínimas para `public.resource_categories`:

- `supabase/migrations/2026062200008_008_acaspex_resource_categories_policies.sql`

## Policies creadas

| Policy | Operación | Condición | Notas |
|--------|-----------|-----------|-------|
| `resource_categories_select_authenticated` | SELECT | `is_admin() OR (is_active AND is_socio_or_higher())` | Admin ve todo; socios/junta solo activas |
| `resource_categories_insert_admin` | INSERT | `is_admin()` (WITH CHECK) | Sin autoservicio |
| `resource_categories_update_admin` | UPDATE | `is_admin()` (USING + WITH CHECK) | Gestión admin |
| DELETE | — | Sin policy | Desactivación vía `is_active` |

## Decisiones aplicadas

- **SELECT con visibilidad por rol**: `is_admin()` ve todas las categorías (activas e inactivas) para gestión. Socios y Junta Directiva solo ven categorías con `is_active = true`. Sin acceso anónimo.
- **INSERT y UPDATE solo admin**: coherencia con el resto de tablas de gestión.
- **Sin DELETE**: las categorías se desactivan con `is_active = false`, no se borran desde cliente.
- **Sin funciones nuevas**: se reutiliza `is_socio_or_higher()` e `is_admin()` de H0.2a.

## Verificación rápida

- [x] Contiene `create policy`
- [x] Solo crea policies sobre `public.resource_categories`
- [x] No contiene `insert into`
- [x] No contiene `storage`
- [x] No contiene `create bucket`
- [x] No contiene datos reales ni secrets
- [x] No contiene policies para otras tablas
- [x] Sin acceso anónimo

## Veredicto

`resource_categories_policies_ready_for_h02h`

---

*Status: pending_review*
