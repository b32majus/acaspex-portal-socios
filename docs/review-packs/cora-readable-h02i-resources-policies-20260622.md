# Review Pack H0.2i — Policies RLS para resources ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creadas las policies RLS mínimas para `public.resources`:

- `supabase/migrations/2026062200010_010_acaspex_resources_policies.sql`

## Policies creadas

| Policy | Operación | Condición | Notas |
|--------|-----------|-----------|-------|
| `resources_select_by_role` | SELECT | `is_admin() OR (status='published' AND can_access_resource_by_visibility(id))` | Admin ve todo; socio/junta solo publicados con visibilidad |
| `resources_insert_admin` | INSERT | `is_admin()` (WITH CHECK) | Sin autoservicio |
| `resources_update_admin` | UPDATE | `is_admin()` (USING + WITH CHECK) | Gestión admin completa |
| DELETE | — | Sin policy | Archivado vía `status = 'archived'` |

## Lógica SELECT detallada

| Rol | Condición | Ve drafts | Ve published | Ve archived |
|-----|-----------|-----------|--------------|-------------|
| `administrador` | `is_admin()` | ✅ | ✅ | ✅ |
| `junta_directiva` | `status='published'` + visibilidad para socio o junta | ❌ | ✅ (con visibilidad) | ❌ |
| `socio` | `status='published'` + visibilidad para socio | ❌ | ✅ (con visibilidad) | ❌ |
| Anónimo | — | ❌ | ❌ | ❌ |

## Decisiones aplicadas

- **Admin sin restricciones**: ve todos los estados para poder gestionar drafts y archivados.
- **No-admin requiere published + visibilidad**: la policy combina `status = 'published'` con `can_access_resource_by_visibility(id)`. La función H0.2h-b no comprueba status; la policy lo hace explícitamente.
- **file_path no implica acceso al archivo**: el campo es un metadato de ruta privada. Las Storage policies (H0.3) controlarán el acceso real a los archivos.
- **Sin DELETE**: archivado por `status`.
- **Sin funciones nuevas**: reutiliza H0.2a y H0.2h-b.

## Verificación rápida

- [x] Contiene `create policy`
- [x] Solo crea policies sobre `public.resources`
- [x] SELECT contiene `status = 'published'`
- [x] SELECT contiene `can_access_resource_by_visibility`
- [x] SELECT contiene `is_admin()`
- [x] No contiene `USING (true)` ni `WITH CHECK (true)`
- [x] No contiene `insert into`
- [x] No contiene `storage.buckets`
- [x] No contiene datos reales ni secrets

## Veredicto

`resources_policies_ready_for_review`

---

*Status: pending_review*
