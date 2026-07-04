-- ACASPEX Portal Socios — Vista anonimizada para evaluadores (B05-BIS)
-- Crea funciones security definer que exponen solo contenido científico
-- a evaluadores del comité, ocultando autoría, email, centro, archivos.
-- Depende de: B05 (is_comite_cientifico, is_reviewer_for_submission),
--   B10 (rol comite_cientifico en app_role).
-- No crea policies. No crea bucket. No crea Storage policies.
-- Ejecutar solo tras revisión explícita.
-- No contiene datos reales ni secretos.
-- FIX1: Añadidos REVOKE all ... FROM public y GRANT execute ... TO authenticated
--   para las 3 funciones security definer (hardening de permisos).

-- ═══════════════════════════════════════════════════════════════════
-- RESTRICCIONES DE EVALUACIÓN CIEGA (confirmadas por Sil)
-- ═══════════════════════════════════════════════════════════════════
-- ✅ Evaluadores ven SOLO: submission_code, title, abstract_text,
--    topic_area, modality
-- ✅ Evaluadores NO ven: authors_text, main_author_name,
--    main_author_email, main_author_phone, center, service_unit,
--    province, file_path, admin_notes, review_notes, poster_*,
--    resolution_sent_at
-- ✅ Evaluadores NO acceden a archivos (file_path oculto)
-- ✅ Doble condición: is_comite_cientifico() + is_reviewer_for_submission()

-- ═══════════════════════════════════════════════════════════════════
-- 1. get_assigned_submissions_for_reviewer()
-- ═══════════════════════════════════════════════════════════════════
-- Devuelve la lista de comunicaciones asignadas al evaluador actual.
-- Solo devuelve submissions donde el usuario es evaluador activo asignado.
-- Columnas expuestas: id, submission_code, title, topic_area, modality,
--   assignment_status, assigned_at.
-- NO expone: autoría, email, centro, archivos, notas admin.

create or replace function public.get_assigned_submissions_for_reviewer()
returns table (
  id uuid,
  submission_code text,
  title text,
  topic_area text,
  modality public.conference_submission_modality,
  assignment_status public.conference_assignment_status,
  assigned_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo evaluadores del comité científico
  if not public.is_comite_cientifico() then
    return;
  end if;

  return query
  select
    cs.id,
    cs.submission_code,
    cs.title,
    cs.topic_area,
    cs.modality,
    a.status as assignment_status,
    a.assigned_at
  from public.conference_submissions cs
  join public.conference_submission_assignments a on a.submission_id = cs.id
  join public.conference_reviewers r on r.id = a.reviewer_id
  where r.profile_id = auth.uid()
    and r.is_active = true
  order by a.assigned_at;
end;
$$;

comment on function public.get_assigned_submissions_for_reviewer() is
  'Devuelve comunicaciones asignadas al evaluador actual. Solo contenido científico. Sin autoría, email, centro ni archivos. Requiere rol comite_cientifico.';

-- ═══════════════════════════════════════════════════════════════════
-- 2. get_submission_for_reviewer(p_submission_id uuid)
-- ═══════════════════════════════════════════════════════════════════
-- Devuelve el contenido científico completo de una submission específica.
-- Verifica doble condición: is_comite_cientifico + is_reviewer_for_submission.
-- Columnas expuestas: submission_code, title, abstract_text, topic_area,
--   modality.
-- NO expone: autoría, email, centro, archivos, notas admin.
-- Retorna vacío si no se cumplen las condiciones.

create or replace function public.get_submission_for_reviewer(p_submission_id uuid)
returns table (
  submission_code text,
  title text,
  abstract_text text,
  topic_area text,
  modality public.conference_submission_modality
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Doble condición: comité CIENTÍFICO + asignado a esta submission
  if not (public.is_comite_cientifico() and public.is_reviewer_for_submission(p_submission_id)) then
    return;
  end if;

  return query
  select
    cs.submission_code,
    cs.title,
    cs.abstract_text,
    cs.topic_area,
    cs.modality
  from public.conference_submissions cs
  where cs.id = p_submission_id;
end;
$$;

comment on function public.get_submission_for_reviewer(uuid) is
  'Devuelve contenido científico de una submission para evaluación ciega. Solo submission_code, title, abstract_text, topic_area, modality. Verifica doble condición. Retorna vacío si no accede.';

-- ═══════════════════════════════════════════════════════════════════
-- 3. get_reviewer_stats()
-- ═══════════════════════════════════════════════════════════════════
-- Devuelve estadísticas del evaluador: total asignadas, completadas,
-- pendientes. Útil para el panel del evaluador.

create or replace function public.get_reviewer_stats()
returns table (
  total_assigned bigint,
  completed bigint,
  pending bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_comite_cientifico() then
    return;
  end if;

  return query
  select
    count(*) as total_assigned,
    count(*) filter (where a.status = 'completed') as completed,
    count(*) filter (where a.status != 'completed') as pending
  from public.conference_submission_assignments a
  join public.conference_reviewers r on r.id = a.reviewer_id
  where r.profile_id = auth.uid()
    and r.is_active = true;
end;
$$;

comment on function public.get_reviewer_stats() is
  'Estadísticas del evaluador: total asignadas, completadas, pendientes. Requiere rol comite_cientifico.';

-- ═══════════════════════════════════════════════════════════════════
-- 4. Permisos de ejecución (HARDENING)
-- ═══════════════════════════════════════════════════════════════════
-- Revocar ejecución de PUBLIC/anon y otorgar solo a authenticated.
-- Evita que funciones security definer queden invocables por cualquier
-- usuario anónimo por defecto.

revoke all on function public.get_assigned_submissions_for_reviewer() from public;
revoke all on function public.get_submission_for_reviewer(uuid) from public;
revoke all on function public.get_reviewer_stats() from public;

grant execute on function public.get_assigned_submissions_for_reviewer() to authenticated;
grant execute on function public.get_submission_for_reviewer(uuid) to authenticated;
grant execute on function public.get_reviewer_stats() to authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en B05-BIS
-- ═══════════════════════════════════════════════════════════════════
-- - Policies RLS (ya creadas en B05)
-- - Storage policies (van en B06)
-- - Bucket (ya creado en B04-BACKEND)
-- - Funciones de inserción de reviews (el evaluador usa el cliente
--   Supabase directamente con la policy de INSERT en B05)
-- - Datos reales
-- - Secrets, credenciales, .env
