-- ACASPEX Portal Socios — Grants de escritura admin sobre recursos
-- H0.8b-FIX1: Permite que usuarios autenticados ejecuten SELECT, INSERT, UPDATE y DELETE
-- sobre resources y resource_visibility. RLS sigue controlando qué operaciones se permiten
-- según rol. Solo administradores pueden insertar/actualizar/borrar.
-- También habilita SELECT en resource_categories para poblar desplegables.

grant select, insert, update, delete on public.resources to authenticated;
grant select, insert, update, delete on public.resource_visibility to authenticated;
grant select on public.resource_categories to authenticated;
