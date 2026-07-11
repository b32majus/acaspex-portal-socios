-- ACASPEX Portal Socios — B19: conference grants for authenticated role
-- Corrige permission denied for table conference_submissions (42501).
-- RLS no basta sin permisos de tabla base para el rol authenticated.
-- Ejecutar después de 047–056. No toca policies RLS.

-- ═══════════════════════════════════════════════════════════════════
-- 1. Schema usage
-- ═══════════════════════════════════════════════════════════════════

grant usage on schema public to authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- 2. Table grants — conference tables
-- ═══════════════════════════════════════════════════════════════════
-- conference_events: admin lee/escribe; evaluador lee evento asignado.
grant select, insert, update on public.conference_events to authenticated;

-- conference_submissions: admin lee/escribe; autor/envío via Edge Function.
grant select, insert, update on public.conference_submissions to authenticated;

-- conference_reviewers: admin gestiona evaluadores; evaluador lee su perfil.
grant select, insert, update on public.conference_reviewers to authenticated;

-- conference_submission_assignments: admin asigna; evaluador lee/marca completed.
grant select, insert, update, delete on public.conference_submission_assignments to authenticated;

-- conference_submission_reviews: evaluador inserta review; admin lee.
grant select, insert, update on public.conference_submission_reviews to authenticated;

-- conference_event_counters: solo lectura (contadores derivados).
grant select on public.conference_event_counters to authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- 3. Function grants — funciones sin grant previo
-- ═══════════════════════════════════════════════════════════════════
-- is_comite_cientifico() — usada por RLS policies y panel admin.
grant execute on function public.is_comite_cientifico() to authenticated;

-- is_reviewer_for_submission(uuid) — usada por RLS policies de evaluador.
grant execute on function public.is_reviewer_for_submission(uuid) to authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- 4. Funciones YA con grant en migraciones anteriores (NO repetir)
-- ═══════════════════════════════════════════════════════════════════
-- submit_conference_review — grant en 056
-- get_assigned_submissions_for_reviewer() — grant en 052
-- get_submission_for_reviewer(uuid) — grant en 052
-- get_reviewer_stats() — grant en 052

-- ═══════════════════════════════════════════════════════════════════
-- 5. No anon grants en este PR
-- ═══════════════════════════════════════════════════════════════════
-- El flujo público de envío va por Edge Function submit-conference-submission
-- (service_role), no por insert directo desde frontend anon.
