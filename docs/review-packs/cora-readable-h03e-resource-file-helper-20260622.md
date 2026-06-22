# Review Pack H0.3e — Helper de acceso a resource files

**Status:** approved
**Fecha:** 2026-06-22
**Archivo creado:** `supabase/migrations/20260622_017_acaspex_storage_resource_file_helpers.sql`

## Función creada

`public.can_access_resource_file_object(p_object_name text) → boolean`

## Lógica de decisión

```
auth.uid() IS NULL
  → false

Perfil no activo (is_active = false o no existe)
  → false

Rol = 'administrador'
  → true

Otro rol:
  → existe recurso con file_path = p_object_name
    AND status = 'published'
    AND can_access_resource_by_visibility(r.id) = true
```

## Propiedades

| Propiedad | Valor |
|-----------|-------|
| `security definer` | ✅ |
| `search_path = public` | ✅ |
| Language | plpgsql |
| Returns | boolean |
| Usa `auth.uid()` | ✅ |
| Usa `profiles.is_active` | ✅ |
| Usa `resources.status` | ✅ |
| Usa `can_access_resource_by_visibility` | ✅ |

## Reviewer H0.3e — Verificación

| Check | Resultado |
|-------|-----------|
| `can_access_resource_file_object` existe | ✅ |
| `security definer` | ✅ |
| `search_path = public` | ✅ |
| `status = 'published'` para no-admins | ✅ |
| Usa `can_access_resource_by_visibility` | ✅ |
| Admin puede acceder | ✅ |
| Sin `create policy` | ✅ |
| Sin datos reales | ✅ |
| Sin secrets | ✅ |

## Veredicto

`resource_file_helper_approved_for_next_step`
