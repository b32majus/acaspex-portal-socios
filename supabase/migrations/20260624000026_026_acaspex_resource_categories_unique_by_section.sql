-- ACASPEX Portal Socios — H0.8T-FIX3 category uniqueness by section
-- Permite nombres/slugs repetidos en secciones distintas.
-- Mantiene unicidad estable dentro de cada sección por (section, slug).

alter table public.resource_categories
drop constraint if exists resource_categories_name_key;

alter table public.resource_categories
drop constraint if exists resource_categories_slug_key;

create unique index if not exists resource_categories_section_slug_key
on public.resource_categories (section, slug);
