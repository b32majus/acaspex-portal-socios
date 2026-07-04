-- ACASPEX Portal Socios — B14C-BACKEND
-- RPC atómica para enviar evaluación científica y completar la asignación.
-- No acepta reviewer_id desde frontend: lo resuelve desde auth.uid() + assignment real.

-- ═══════════════════════════════════════════════════════════════════
-- submit_conference_review
-- ═══════════════════════════════════════════════════════════════════
-- Reglas:
-- - Solo authenticated con rol comite_cientifico.
-- - El usuario debe tener un reviewer activo asignado a p_submission_id.
-- - Inserta una review para submission_id + reviewer_id.
-- - Marca SOLO esa assignment como completed.
-- - Todo ocurre en una única transacción de función.
-- - No expone autoría, archivos ni notas admin.

create or replace function public.submit_conference_review(
  p_submission_id uuid,
  p_score_relevance integer,
  p_score_methodology integer,
  p_score_impact integer,
  p_score_clarity integer,
  p_comments text,
  p_recommendation public.conference_review_recommendation
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reviewer_id uuid;
  v_review_id uuid;
begin
  -- Debe ser usuario autenticado del comité científico.
  if auth.uid() is null or public.is_comite_cientifico() is distinct from true then
    raise exception 'not_authorized';
  end if;

  -- Resolver reviewer_id desde la assignment real del usuario actual.
  -- Importante: no se acepta reviewer_id desde frontend.
  select r.id
    into v_reviewer_id
  from public.conference_reviewers as r
  join public.conference_submission_assignments as a
    on a.reviewer_id = r.id
  where r.profile_id = auth.uid()
    and r.is_active = true
    and a.submission_id = p_submission_id
  order by a.assigned_at asc
  limit 1;

  if v_reviewer_id is null then
    raise exception 'not_assigned_reviewer';
  end if;

  -- Evitar doble envío explícitamente antes del INSERT.
  if exists (
    select 1
    from public.conference_submission_reviews as existing
    where existing.submission_id = p_submission_id
      and existing.reviewer_id = v_reviewer_id
  ) then
    raise exception 'review_already_submitted';
  end if;

  -- Validación defensiva de scores. Los CHECK constraints de la tabla también protegen.
  if (p_score_relevance is not null and (p_score_relevance < 1 or p_score_relevance > 5))
    or (p_score_methodology is not null and (p_score_methodology < 1 or p_score_methodology > 5))
    or (p_score_impact is not null and (p_score_impact < 1 or p_score_impact > 5))
    or (p_score_clarity is not null and (p_score_clarity < 1 or p_score_clarity > 5)) then
    raise exception 'invalid_score';
  end if;

  -- Insertar review del reviewer actual.
  insert into public.conference_submission_reviews (
    submission_id,
    reviewer_id,
    score_relevance,
    score_methodology,
    score_impact,
    score_clarity,
    comments,
    recommendation
  ) values (
    p_submission_id,
    v_reviewer_id,
    p_score_relevance,
    p_score_methodology,
    p_score_impact,
    p_score_clarity,
    nullif(btrim(p_comments), ''),
    p_recommendation
  )
  returning id into v_review_id;

  -- Marcar como completed SOLO la assignment propia.
  update public.conference_submission_assignments
  set status = 'completed',
      updated_at = now()
  where submission_id = p_submission_id
    and reviewer_id = v_reviewer_id;

  if not found then
    raise exception 'assignment_not_found';
  end if;

  return v_review_id;
exception
  when unique_violation then
    raise exception 'review_already_submitted';
end;
$$;

comment on function public.submit_conference_review(
  uuid,
  integer,
  integer,
  integer,
  integer,
  text,
  public.conference_review_recommendation
) is
  'B14C-BACKEND: inserta evaluación científica del evaluador autenticado y marca su assignment como completed de forma atómica. No acepta reviewer_id desde frontend.';

-- Harden execution permissions: no PUBLIC/anon; solo authenticated.
revoke all on function public.submit_conference_review(
  uuid,
  integer,
  integer,
  integer,
  integer,
  text,
  public.conference_review_recommendation
) from public;

grant execute on function public.submit_conference_review(
  uuid,
  integer,
  integer,
  integer,
  integer,
  text,
  public.conference_review_recommendation
) to authenticated;
