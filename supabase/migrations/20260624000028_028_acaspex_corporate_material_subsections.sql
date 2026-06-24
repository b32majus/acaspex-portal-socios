-- ACASPEX Portal Socios — H0.8U: Subsecciones internas para Material Corporativo
-- Seed idempotente: dos subsecciones fijas para clasificación admin.
-- Sin sidebar visible en portal por ahora.

insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Materiales', 'materiales', 'Materiales corporativos de uso interno.', 1, true, 'corporate_material'
where not exists (select 1 from public.resource_categories where section = 'corporate_material' and slug = 'materiales');

insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Actas y documentos', 'actas-y-documentos', 'Actas y documentos oficiales de la asociación.', 2, true, 'corporate_material'
where not exists (select 1 from public.resource_categories where section = 'corporate_material' and slug = 'actas-y-documentos');
