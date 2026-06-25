-- ACASPEX Portal Socios — Desactivar acceso antes de borrar socio
-- Si se elimina un member, cualquier profile vinculado queda inactivo antes
-- de que la FK profiles.member_id ON DELETE SET NULL deje el profile sin ficha.

create or replace function public.deactivate_profiles_before_member_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    is_active = false,
    updated_at = now()
  where member_id = old.id
    and is_active = true;

  return old;
end;
$$;

comment on function public.deactivate_profiles_before_member_delete() is
  'Desactiva perfiles vinculados antes de borrar un socio. Evita que quede un usuario activo sin ficha de socio.';

drop trigger if exists trg_members_deactivate_profiles_before_delete on public.members;

create trigger trg_members_deactivate_profiles_before_delete
before delete on public.members
for each row
execute function public.deactivate_profiles_before_member_delete();
