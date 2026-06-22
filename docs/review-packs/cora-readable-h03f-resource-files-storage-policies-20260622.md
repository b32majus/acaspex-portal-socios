# Review Pack H0.3f — Storage policies resource files

**Status:** approved
**Fecha:** 2026-06-22
**Archivo creado:** `supabase/migrations/2026062200018_018_acaspex_storage_resource_files_policies.sql`

## Policies creadas

| Policy | Operación | Condición |
|--------|-----------|-----------|
| `resource_files_select_by_visibility` | SELECT | `bucket_id = 'acaspex-resource-files' AND public.can_access_resource_file_object(name)` |
| `resource_files_insert_admin` | INSERT | `bucket_id = 'acaspex-resource-files' AND public.is_admin()` |
| `resource_files_update_admin` | UPDATE | `bucket_id = 'acaspex-resource-files' AND public.is_admin()` |
| `resource_files_delete_admin` | DELETE | `bucket_id = 'acaspex-resource-files' AND public.is_admin()` |

## Lógica de SELECT

`can_access_resource_file_object(name)` decide dinámicamente:
- Anónimo → false
- Sin perfil activo → false
- Admin → true
- Socio/Junta → true solo si recurso published + visibilidad asignada

## Acceso resultante

| Operación | Anónimo | Socio / Junta | Administrador |
|-----------|---------|---------------|---------------|
| SELECT | ❌ | ✅ solo recursos con visibilidad | ✅ todo |
| INSERT | ❌ | ❌ | ✅ |
| UPDATE | ❌ | ❌ | ✅ |
| DELETE | ❌ | ❌ | ✅ |

## Reviewer H0.3f — Verificación

| Check | Resultado |
|-------|-----------|
| Solo bucket `acaspex-resource-files` | ✅ |
| SELECT usa `can_access_resource_file_object` | ✅ |
| INSERT/UPDATE/DELETE admin-only | ✅ |
| Sin `USING (true)` | ✅ |
| Sin `WITH CHECK (true)` genérico | ✅ |
| Sin datos reales | ✅ |
| Sin secrets | ✅ |

## Veredicto

`resource_files_storage_policies_approved_for_next_step`
