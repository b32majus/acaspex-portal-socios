-- ACASPEX Portal Socios — Modelo de sección/subsección para recursos
-- H0.8S: Añade enum resource_section, columnas section en resources y resource_categories,
--        seed de categorías iniciales y migración de recursos existentes.

-- 1. Crear enum resource_section (idempotente)
do $$
begin
  create type public.resource_section as enum (
    'knowledge_center',
    'project_bank',
    'corporate_material'
  );
exception
  when duplicate_object then null;
end
$$;

comment on type public.resource_section is 'Sección a la que pertenece un recurso: knowledge_center, project_bank o corporate_material.';

-- 2. Añadir columna section a resources
alter table public.resources
add column if not exists section public.resource_section;

comment on column public.resources.section is 'Sección del recurso. Nulo solo en recursos legacy anteriores a H0.8S.';

-- 3. Añadir columna section a resource_categories
alter table public.resource_categories
add column if not exists section public.resource_section;

comment on column public.resource_categories.section is 'Sección a la que pertenece la categoría. Nulo solo en categorías legacy.';

-- 4. Migrar recursos existentes a corporate_material
-- Todos los recursos actuales pertenecen a Material Corporativo.
update public.resources
set section = 'corporate_material'
where section is null;

-- 5. Seed de categorías — Knowledge Center
insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Calidad Asistencial', 'calidad-asistencial', 'Recursos sobre calidad asistencial y mejora continua.', 1, true, 'knowledge_center'
where not exists (select 1 from public.resource_categories where slug = 'calidad-asistencial');

insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Seguridad del Paciente', 'seguridad-del-paciente', 'Recursos sobre seguridad del paciente y prevención de eventos adversos.', 2, true, 'knowledge_center'
where not exists (select 1 from public.resource_categories where slug = 'seguridad-del-paciente');

insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Investigación', 'investigacion', 'Recursos sobre investigación y publicaciones científicas.', 3, true, 'knowledge_center'
where not exists (select 1 from public.resource_categories where slug = 'investigacion');

insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Formación', 'formacion', 'Recursos formativos y material didáctico.', 4, true, 'knowledge_center'
where not exists (select 1 from public.resource_categories where slug = 'formacion');

insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Herramientas', 'herramientas', 'Plantillas, checklists y herramientas prácticas.', 5, true, 'knowledge_center'
where not exists (select 1 from public.resource_categories where slug = 'herramientas');

-- 6. Seed de categorías — Project Bank
insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Seguridad del paciente', 'seguridad-del-paciente-proyectos', 'Proyectos de mejora en seguridad del paciente.', 1, true, 'project_bank'
where not exists (select 1 from public.resource_categories where slug = 'seguridad-del-paciente-proyectos');

insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Mejora de procesos', 'mejora-de-procesos', 'Proyectos de optimización de procesos asistenciales.', 2, true, 'project_bank'
where not exists (select 1 from public.resource_categories where slug = 'mejora-de-procesos');

insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Experiencia del paciente', 'experiencia-del-paciente', 'Proyectos centrados en la experiencia del paciente.', 3, true, 'project_bank'
where not exists (select 1 from public.resource_categories where slug = 'experiencia-del-paciente');

insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Continuidad asistencial', 'continuidad-asistencial', 'Proyectos de continuidad y coordinación asistencial.', 4, true, 'project_bank'
where not exists (select 1 from public.resource_categories where slug = 'continuidad-asistencial');

insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Humanización', 'humanizacion', 'Proyectos de humanización de la atención sanitaria.', 5, true, 'project_bank'
where not exists (select 1 from public.resource_categories where slug = 'humanizacion');

insert into public.resource_categories (name, slug, description, sort_order, is_active, section)
select 'Gestión Clínica', 'gestion-clinica', 'Proyectos de gestión clínica y organización.', 6, true, 'project_bank'
where not exists (select 1 from public.resource_categories where slug = 'gestion-clinica');
