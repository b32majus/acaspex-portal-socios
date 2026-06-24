alter table public.resource_categories
add column if not exists icon_key text;

update public.resource_categories
set icon_key = 'activity'
where slug = 'calidad-asistencial'
  and icon_key is null;

update public.resource_categories
set icon_key = 'shield'
where slug = 'seguridad-del-paciente'
  and section = 'knowledge_center'
  and icon_key is null;

update public.resource_categories
set icon_key = 'book-open'
where slug = 'investigacion'
  and icon_key is null;

update public.resource_categories
set icon_key = 'graduation-cap'
where slug = 'formacion'
  and icon_key is null;

update public.resource_categories
set icon_key = 'wrench'
where slug = 'herramientas'
  and icon_key is null;

update public.resource_categories
set icon_key = 'shield'
where slug = 'seguridad-del-paciente-proyectos'
  and section = 'project_bank'
  and icon_key is null;

update public.resource_categories
set icon_key = 'activity'
where slug = 'mejora-de-procesos'
  and icon_key is null;

update public.resource_categories
set icon_key = 'heart-pulse'
where slug = 'experiencia-del-paciente'
  and icon_key is null;

update public.resource_categories
set icon_key = 'route'
where slug = 'continuidad-asistencial'
  and icon_key is null;

update public.resource_categories
set icon_key = 'users'
where slug = 'humanizacion'
  and icon_key is null;

update public.resource_categories
set icon_key = 'building'
where slug = 'gestion-clinica'
  and icon_key is null;
