-- ACASPEX Portal Socios — Helper de acceso a recursos por visibilidad
-- H0.2h-b: renombra la función de H0.2h a
-- can_access_resource_by_visibility para reflejar que evalúa
-- visibilidad por rol, no comprueba status de publicación.
-- Depende de H0.2a (current_app_role).
-- No crea policies. Ejecutar solo tras revisión explícita.

-- ═══════════════════════════════════════════════════════════════════
-- can_access_resource_by_visibility(p_resource_id uuid)
-- ═══════════════════════════════════════════════════════════════════
-- Evalúa si el usuario autenticado con perfil activo puede acceder
-- a un recurso según su rol y las filas en resource_visibility.
--
-- IMPORTANTE: esta función NO comprueba resources.status (draft,
-- published, archived). La futura policy de public.resources deberá
-- combinar:
--   - admin puede gestionar todos los estados;
--   - no-admin solo puede acceder si status = 'published' y esta
--     función devuelve true.
--
-- Lógica por rol:
--   - Sin sesión o perfil inactivo  → false
--   - administrador                 → true
--   - junta_directiva               → true si resource_visibility
--                                      tiene role 'socio' o
--                                      'junta_directiva'
--   - socio                         → true solo si role 'socio'
--   - cualquier otro                → false
--
-- Seguridad: security definer con search_path = public para evaluar
-- resource_visibility sin depender de RLS sobre esa tabla.
-- No devuelve datos del recurso ni listas; solo boolean.

create or replace function public.can_access_resource_by_visibility(p_resource_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.app_role;
begin
  v_role := public.current_app_role();

  if v_role is null then
    return false;
  end if;

  if v_role = 'administrador' then
    return true;
  end if;

  if v_role = 'junta_directiva' then
    return exists (
      select 1
      from public.resource_visibility rv
      where rv.resource_id = p_resource_id
        and rv.role in ('socio', 'junta_directiva')
    );
  end if;

  if v_role = 'socio' then
    return exists (
      select 1
      from public.resource_visibility rv
      where rv.resource_id = p_resource_id
        and rv.role = 'socio'
    );
  end if;

  return false;
end;
$$;

comment on function public.can_access_resource_by_visibility(uuid) is
  'Evalúa visibilidad de recurso por rol vía resource_visibility. NO comprueba status. La policy de resources combinará esto con status = published para no-admins.';

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.2h
-- ═══════════════════════════════════════════════════════════════════
-- - Policies (ninguna)
-- - Otras funciones auxiliares
-- - Consultas a datos personales
-- - Storage, buckets, seed, datos sintéticos
-- - La policy SELECT de resources se creará en H0.2i usando esta
--   función como building block
