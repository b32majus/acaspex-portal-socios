# Review Pack H0.2h-b — Helper de acceso a recursos por visibilidad ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creada función auxiliar segura para evaluar visibilidad de recursos por rol (H0.2h-b renombra desde `can_access_published_resource`):

- `supabase/migrations/2026062200009_009_acaspex_resource_access_helpers.sql`

## Función creada

| Función | Retorno | Parámetro | Descripción |
|---------|---------|-----------|-------------|
| `can_access_resource_by_visibility` | `boolean` | `p_resource_id uuid` | Evalúa si el usuario autenticado puede ver un recurso según `resource_visibility`. NO comprueba `status`. |

## Lógica por rol

| Rol | Condición | Resultado |
|-----|-----------|-----------|
| Sin sesión / inactivo | — | `false` |
| `administrador` | — | `true` |
| `junta_directiva` | `resource_visibility` tiene role `'socio'` o `'junta_directiva'` | `true` si existe |
| `socio` | `resource_visibility` tiene role `'socio'` | `true` si existe |
| Otro | — | `false` |

## Decisiones aplicadas

- **`security definer` con `search_path = public`**: la función consulta `resource_visibility` sin depender del RLS de esa tabla, evitando recursión en la futura policy de `resources`.
- **Junta hereda visibilidad de socio**: ve tanto recursos marcados `socio` como `junta_directiva`. Los recursos de Junta son adicionales, no sustitutivos.
- **Admin siempre `true`**: la policy de `resources` decidirá después si el admin también ve drafts/archivados. Esta función se centra en visibilidad por rol, no en `status`.
- **NO comprueba `resources.status`**: la futura policy de `resources` deberá combinar `can_access_resource_by_visibility` con `status = 'published'` para no-admins.
- **Solo consulta `resource_visibility`**: no accede a datos personales, members ni profiles.
- **No devuelve datos**: solo `boolean`. Sin listados ni leaks.

## Verificación rápida

- [x] Contiene `create or replace function public.can_access_resource_by_visibility`
- [x] Contiene `security definer`
- [x] Contiene `set search_path = public`
- [x] Contiene `resource_visibility`
- [x] No contiene `create policy`
- [x] No contiene `insert into`
- [x] No contiene `storage`
- [x] No contiene `create bucket`
- [x] No contiene datos reales ni secrets

## Veredicto

`resource_access_helper_ready_for_h02i`

---

*Status: pending_review*
