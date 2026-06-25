-- ACASPEX Portal Socios — grants de escritura admin sobre profiles
-- H0.9C-B2-FIX1
-- Permite que las policies RLS existentes profiles_insert_admin y profiles_update_admin
-- puedan evaluarse para usuarios autenticados. No concede DELETE.

grant insert, update on public.profiles to authenticated;

comment on table public.profiles is
  'Perfiles de acceso al portal. INSERT/UPDATE para authenticated quedan gobernados por RLS admin policies.';
