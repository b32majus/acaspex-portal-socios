-- ACASPEX Portal Socios — III Jornada reviewer access and own review history (063).
-- Depends on migrations 047-062.
--
-- Fixes two gaps in the connected v2 workflow:
-- 1) event-scoped committee members can use reviewer RPCs without changing
--    their global portal role;
-- 2) a reviewer can read their own completed evaluation for an assigned
--    submission. No reviewer can read another review or any author identity.

create or replace function public.get_assigned_submissions_v2_for_reviewer()
returns table (
  id uuid,
  submission_code text,
  title text,
  submission_type public.conference_submission_type,
  assignment_status public.conference_assignment_status,
  evaluation_round public.conference_assignment_round,
  assigned_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return;
  end if;

  return query
  select
    s.id,
    s.submission_code,
    s.title,
    s.submission_type,
    a.status,
    a.evaluation_round,
    a.assigned_at
  from public.conference_submissions s
  join public.conference_submission_assignments a on a.submission_id = s.id
  join public.conference_reviewers r on r.id = a.reviewer_id
  join public.conference_event_committee_members m
    on m.event_id = s.event_id
   and m.reviewer_id = r.id
  where r.profile_id = (select auth.uid())
    and r.is_active
    and m.is_active
  order by a.assigned_at, s.submission_code;
end;
$$;

create or replace function public.get_conference_submission_v2_for_reviewer(
  p_submission_id uuid
)
returns table (
  submission_code text,
  title text,
  submission_type public.conference_submission_type,
  evaluation_round public.conference_assignment_round,
  sections jsonb,
  reference_list jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return;
  end if;

  return query
  select
    s.submission_code,
    s.title,
    s.submission_type,
    a.evaluation_round,
    jsonb_strip_nulls(jsonb_build_object(
      'introduction', sec.introduction,
      'objectives', sec.objectives,
      'methodology_or_intervention', sec.methodology_or_intervention,
      'implementation_participation', sec.implementation_participation,
      'results', sec.results,
      'conclusions', sec.conclusions,
      'ethical_considerations', sec.ethical_considerations
    )),
    coalesce((
      select jsonb_agg(ref.reference_text order by ref.reference_order)
      from public.conference_submission_references ref
      where ref.submission_id = s.id
    ), '[]'::jsonb)
  from public.conference_submissions s
  join public.conference_submission_assignments a
    on a.submission_id = s.id
  join public.conference_reviewers r on r.id = a.reviewer_id
  join public.conference_event_committee_members m
    on m.event_id = s.event_id
   and m.reviewer_id = r.id
  join public.conference_submission_sections sec on sec.submission_id = s.id
  where s.id = p_submission_id
    and r.profile_id = (select auth.uid())
    and r.is_active
    and m.is_active;
end;
$$;

create or replace function public.get_own_conference_review_v2(
  p_submission_id uuid
)
returns table (
  score_relevance integer,
  score_intro_objectives integer,
  score_methodology integer,
  score_results integer,
  score_conclusions_applicability integer,
  score_clarity integer,
  author_recommendations text,
  confidential_committee_comment text,
  weighted_total numeric,
  evaluation_round public.conference_assignment_round,
  submitted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return;
  end if;

  return query
  select
    review.score_relevance,
    review.score_intro_objectives,
    review.score_methodology,
    review.score_results,
    review.score_conclusions_applicability,
    review.score_clarity,
    review.author_recommendations,
    review.confidential_committee_comment,
    review.weighted_total,
    review.evaluation_round,
    review.created_at
  from public.conference_submission_reviews review
  join public.conference_submission_assignments a
    on a.submission_id = review.submission_id
   and a.reviewer_id = review.reviewer_id
  join public.conference_submissions s on s.id = review.submission_id
  join public.conference_reviewers reviewer on reviewer.id = review.reviewer_id
  join public.conference_event_committee_members m
    on m.event_id = s.event_id
   and m.reviewer_id = reviewer.id
  where review.submission_id = p_submission_id
    and reviewer.profile_id = (select auth.uid())
    and reviewer.is_active
    and m.is_active;
end;
$$;

create or replace function public.submit_conference_review_v2(
  p_submission_id uuid,
  p_score_relevance integer,
  p_score_intro_objectives integer,
  p_score_methodology integer,
  p_score_results integer,
  p_score_conclusions_applicability integer,
  p_score_clarity integer,
  p_author_recommendations text,
  p_confidential_committee_comment text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reviewer_id uuid;
  v_review_id uuid;
  v_event_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authorized';
  end if;

  select reviewer.id, submission.event_id
    into v_reviewer_id, v_event_id
  from public.conference_reviewers reviewer
  join public.conference_submission_assignments assignment
    on assignment.reviewer_id = reviewer.id
  join public.conference_submissions submission
    on submission.id = assignment.submission_id
  join public.conference_event_committee_members member
    on member.event_id = submission.event_id
   and member.reviewer_id = reviewer.id
  where reviewer.profile_id = (select auth.uid())
    and reviewer.is_active
    and member.is_active
    and assignment.submission_id = p_submission_id
  limit 1;

  if v_reviewer_id is null then
    raise exception 'not_assigned_reviewer';
  end if;
  if exists (
    select 1
    from public.conference_submission_reviews review
    where review.submission_id = p_submission_id
      and review.reviewer_id = v_reviewer_id
  ) then
    raise exception 'review_already_submitted';
  end if;
  if p_score_relevance not between 1 and 5
     or p_score_intro_objectives not between 1 and 5
     or p_score_methodology not between 1 and 5
     or p_score_results not between 1 and 5
     or p_score_conclusions_applicability not between 1 and 5
     or p_score_clarity not between 1 and 5 then
    raise exception 'invalid_score';
  end if;
  if nullif(btrim(p_author_recommendations), '') is null
     or nullif(btrim(p_confidential_committee_comment), '') is null then
    raise exception 'comments_required';
  end if;

  insert into public.conference_submission_reviews (
    submission_id,
    reviewer_id,
    score_relevance,
    score_methodology,
    score_impact,
    score_clarity,
    comments,
    recommendation,
    score_intro_objectives,
    score_results,
    score_conclusions_applicability,
    author_recommendations,
    confidential_committee_comment
  ) values (
    p_submission_id,
    v_reviewer_id,
    p_score_relevance,
    p_score_methodology,
    null,
    p_score_clarity,
    p_author_recommendations,
    null,
    p_score_intro_objectives,
    p_score_results,
    p_score_conclusions_applicability,
    btrim(p_author_recommendations),
    btrim(p_confidential_committee_comment)
  ) returning id into v_review_id;

  update public.conference_submission_assignments
  set status = 'completed', updated_at = now()
  where submission_id = p_submission_id
    and reviewer_id = v_reviewer_id;

  if not found then
    raise exception 'assignment_not_found';
  end if;

  insert into public.conference_audit_events (
    event_id, submission_id, actor_profile_id, action, details
  ) values (
    v_event_id,
    p_submission_id,
    (select auth.uid()),
    'review_submitted_v2',
    jsonb_build_object('review_id', v_review_id)
  );

  return v_review_id;
exception
  when unique_violation then
    raise exception 'review_already_submitted';
end;
$$;

revoke all on function public.get_assigned_submissions_v2_for_reviewer()
  from public, anon, authenticated;
revoke all on function public.get_conference_submission_v2_for_reviewer(uuid)
  from public, anon, authenticated;
revoke all on function public.get_own_conference_review_v2(uuid)
  from public, anon, authenticated;
revoke all on function public.submit_conference_review_v2(
  uuid, integer, integer, integer, integer, integer, integer, text, text
) from public, anon, authenticated;

grant execute on function public.get_assigned_submissions_v2_for_reviewer()
  to authenticated;
grant execute on function public.get_conference_submission_v2_for_reviewer(uuid)
  to authenticated;
grant execute on function public.get_own_conference_review_v2(uuid)
  to authenticated;
grant execute on function public.submit_conference_review_v2(
  uuid, integer, integer, integer, integer, integer, integer, text, text
) to authenticated;

comment on function public.get_own_conference_review_v2(uuid) is
  'Returns only the authenticated reviewer own completed v2 evaluation for an assigned submission. Never exposes other reviewers or author identity.';
