-- ACASPEX Portal Socios — B19: conference grants for authenticated role
-- Corrige permission denied for table conference_submissions (42501).
-- RLS no basta sin permisos de tabla base para el rol authenticated.
-- Ejecutar después de 047–056. No toca policies RLS.
-- FIX1: añade EXECUTE explícito para todas las RPCs, retira INSERT innecesario.

-- ═══════════════════════════════════════════════════════════════════
-- 1. Schema usage
-- ═══════════════════════════════════════════════════════════════════

grant usage on schema public to authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- 2. Table grants — conference tables
-- ═══════════════════════════════════════════════════════════════════
-- conference_events: admin lee/escribe; evaluador lee evento asignado.
grant select, insert, update on public.conference_events to authenticated;

-- conference_submissions: solo SELECT/UPDATE desde admin.
-- INSERT no se usa desde frontend autenticado; el envío público va
-- por Edge Function submit-conference-submission (service_role).
grant select, update on public.conference_submissions to authenticated;

-- conference_reviewers: admin gestiona evaluadores; evaluador lee su perfil.
grant select, insert, update on public.conference_reviewers to authenticated;

-- conference_submission_assignments: admin asigna; evaluador lee/marca completed.
grant select, insert, update, delete on public.conference_submission_assignments to authenticated;

-- conference_submission_reviews: evaluador inserta review (via RPC); admin lee.
-- INSERT directo no se usa; submit_conference_review es security definer.
grant select on public.conference_submission_reviews to authenticated;

-- conference_event_counters: solo lectura (contadores derivados).
grant select on public.conference_event_counters to authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- 3. Function grants — todas las RPCs de conference
-- ═══════════════════════════════════════════════════════════════════

-- Helpers de verificación de rol (usados por RLS y panel admin).
grant execute on function public.is_comite_cientifico() to authenticated;
grant execute on function public.is_reviewer_for_submission(uuid) to authenticated;

-- RPCs de evaluador (lectura de comunicaciones asignadas).
grant execute on function public.get_assigned_submissions_for_reviewer() to authenticated;
grant execute on function public.get_submission_for_reviewer(uuid) to authenticated;
grant execute on function public.get_reviewer_stats() to authenticated;

-- RPC write: envío de evaluación científica (security definer).
grant execute on function public.submit_conference_review(
  uuid, integer, integer, integer, integer, text, public.conference_review_recommendation
) to authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- 4. No anon grants en este PR
-- ═══════════════════════════════════════════════════════════════════
-- El flujo público de envío va por Edge Function submit-conference-submission
-- (service_role), no por insert directo desde frontend anon.
