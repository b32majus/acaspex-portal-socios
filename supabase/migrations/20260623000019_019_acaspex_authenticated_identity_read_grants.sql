-- ACASPEX Portal Socios — Grants mínimos para lectura de identidad frontend
-- H0.7n: Permite que usuarios autenticados ejecuten SELECT sobre profiles y members.
-- RLS sigue siendo la capa que restringe qué filas puede ver cada usuario.
-- Necesario para useIdentity(): leer profiles propio y member vinculado.

grant select on public.profiles to authenticated;
grant select on public.members to authenticated;
