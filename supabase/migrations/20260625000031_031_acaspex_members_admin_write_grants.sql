-- ACASPEX Portal Socios — Grants admin para gestión de members
-- H0.9B: permite a usuarios autenticados ejecutar operaciones sobre members.
-- RLS policies members_insert_admin y members_update_admin restringen a public.is_admin().
-- No concede delete.

grant select, insert, update on public.members to authenticated;
