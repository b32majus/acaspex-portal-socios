-- ACASPEX Portal Socios — H0.8U: DELETE definitivo de recursos archivados
-- Solo administradores pueden eliminar recursos con status = 'archived'.
-- No permite eliminar recursos publicados ni en borrador.

create policy "resources_delete_admin_archived"
  on public.resources
  for delete
  using (
    public.is_admin()
    and status = 'archived'
  );

comment on policy "resources_delete_admin_archived" on public.resources is
  'Solo administradores pueden eliminar recursos archivados de forma definitiva.';
