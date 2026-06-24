-- ACASPEX Portal Socios — H0.8U: Portada editorial opcional para recursos
-- Añade columna cover_image_path y actualiza el helper de Storage
-- para que también conceda acceso a archivos de portada.

-- 1. Añadir columna cover_image_path
alter table public.resources
add column if not exists cover_image_path text;

comment on column public.resources.cover_image_path is
'Ruta privada opcional en Storage para imagen de portada editorial del recurso.';

-- 2. Actualizar helper can_access_resource_file_object
-- para que también verifique cover_image_path, no solo file_path.
create or replace function public.can_access_resource_file_object(p_object_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role app_role;
begin
  if auth.uid() is null then
    return false;
  end if;

  select p.role into v_role
  from public.profiles p
  where p.id = auth.uid() and p.is_active = true;

  if v_role is null then
    return false;
  end if;

  if v_role = 'administrador' then
    return true;
  end if;

  return exists (
    select 1
    from public.resources r
    where (r.file_path = p_object_name or r.cover_image_path = p_object_name)
      and r.status = 'published'
      and public.can_access_resource_by_visibility(r.id)
  );
end;
$$;

comment on function public.can_access_resource_file_object(text) is
  'Helper para Storage policies de acaspex-resource-files. Admin ve todo; socio y Junta solo ven archivos (file_path o cover_image_path) de recursos publicados con visibilidad asignada.';
