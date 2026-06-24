-- ACASPEX Portal Socios — Grants de escritura admin sobre resource_categories
-- H0.8T-FIX1: Permite a administradores activos INSERT y UPDATE en resource_categories.
-- No se añade DELETE. SELECT ya fue concedido en migración 020.

grant insert, update on public.resource_categories to authenticated;
