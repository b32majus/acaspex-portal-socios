-- ACASPEX Portal Socios — Ampliación enum resource_type
-- H0.8b-FIX3: Añade valores al enum para alinear con el frontend.
-- Frontend: pdf, video, template, link, presentation, image, logo,
--           teams_background, document, external_link
-- DB actual: pdf, video, presentation, template, link, document, other
-- Faltan: image, logo, teams_background, external_link
-- 'other' se mantiene en la DB aunque no se use en frontend.

-- Valores a añadir (idempotente; PostgreSQL 9.6+ soporta IF NOT EXISTS).
alter type public.resource_type add value if not exists 'image';
alter type public.resource_type add value if not exists 'logo';
alter type public.resource_type add value if not exists 'teams_background';
alter type public.resource_type add value if not exists 'external_link';

comment on type public.resource_type is 'Tipos válidos de recurso. A partir de H0.8b-FIX3 incluye image, logo, teams_background y external_link además de los valores legacy.';
