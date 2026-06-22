-- ACASPEX Portal Socios — Helper de acceso a archivos de recursos
-- H0.3e: crea la función auxiliar can_access_resource_file_object
-- para decidir si un usuario puede leer un objeto del bucket
-- acaspex-resource-files según el recurso asociado en public.resources.
-- Se usará en las Storage policies de H0.3f.
-- Depende de H0.2a (funciones de rol) y H0.2h-b
-- (can_access_resource_by_visibility).
-- No contiene datos reales ni secretos.

create or replace function public.can_access_resource_file_object(p_object_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role app_role;
begin
  -- Sin usuario autenticado o perfil activo → false.
  if auth.uid() is null then
    return false;
  end if;

  select p.role into v_role
  from public.profiles p
  where p.id = auth.uid() and p.is_active = true;

  if v_role is null then
    return false;
  end if;

  -- Administrador puede acceder a todos los archivos de recursos.
  if v_role = 'administrador' then
    return true;
  end if;

  -- No-administrador: buscar un recurso published con file_path
  -- coincidente y visibilidad asignada al rol del usuario.
  return exists (
    select 1
    from public.resources r
    where r.file_path = p_object_name
      and r.status = 'published'
      and public.can_access_resource_by_visibility(r.id)
  );
end;
$$;

comment on function public.can_access_resource_file_object(text) is
  'Helper para Storage policies de acaspex-resource-files. Admin ve todo; socio y Junta solo ven archivos de recursos publicados con visibilidad asignada. Sin usuario autenticado → false.';
