-- ACASPEX Portal Socios — III Jornada role and third-review hardening
-- Depende de: 047–061.
--
-- Refuerza dos decisiones funcionales aprobadas:
-- 1) el panel científico v2 solo es accesible a presidenta/vicepresidenta;
-- 2) la tercera ronda solo puede asignarse a presidenta/vicepresidenta.
-- No contiene identidades, correos ni datos reales.

create or replace function public.set_conference_assignment_round()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_first_total numeric(5,2);
  v_second_total numeric(5,2);
  v_threshold numeric(5,2);
  v_event_id uuid;
begin
  select s.event_id
    into v_event_id
  from public.conference_submissions s
  where s.id = new.submission_id
  for update;

  if v_event_id is null then
    raise exception 'submission_not_found';
  end if;

  if new.evaluation_round is null then
    select candidate.evaluation_round
      into new.evaluation_round
    from (
      values
        ('first'::public.conference_assignment_round, 1),
        ('second'::public.conference_assignment_round, 2),
        ('third'::public.conference_assignment_round, 3)
    ) as candidate(evaluation_round, ordinal)
    where not exists (
      select 1
      from public.conference_submission_assignments a
      where a.submission_id = new.submission_id
        and a.evaluation_round = candidate.evaluation_round
    )
    order by candidate.ordinal
    limit 1;
  end if;

  if new.evaluation_round is null then
    raise exception 'all_evaluation_rounds_assigned';
  end if;

  if new.evaluation_round = 'second'
     and not exists (
       select 1
       from public.conference_submission_assignments a
       where a.submission_id = new.submission_id
         and a.evaluation_round = 'first'
     ) then
    raise exception 'first_evaluation_round_required';
  end if;

  if new.evaluation_round = 'third' then
    select
      max(r.weighted_total) filter (where r.evaluation_round = 'first'),
      max(r.weighted_total) filter (where r.evaluation_round = 'second'),
      e.discrepancy_threshold
      into v_first_total, v_second_total, v_threshold
    from public.conference_submissions s
    join public.conference_events e on e.id = s.event_id
    left join public.conference_submission_reviews r
      on r.submission_id = s.id
    where s.id = new.submission_id
    group by e.discrepancy_threshold;

    if v_first_total is null or v_second_total is null then
      raise exception 'two_completed_reviews_required';
    end if;

    if abs(v_first_total - v_second_total) < v_threshold then
      raise exception 'third_review_not_required';
    end if;

    if not exists (
      select 1
      from public.conference_event_committee_members m
      join public.conference_reviewers r on r.id = m.reviewer_id
      where m.event_id = v_event_id
        and m.reviewer_id = new.reviewer_id
        and m.committee_role in ('president', 'vice_president')
        and m.is_active
        and r.is_active
    ) then
      raise exception 'third_reviewer_must_be_presidency';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.set_conference_assignment_round()
  from public, anon, authenticated;

create or replace function public.get_conference_evaluation_summary(
  p_event_id uuid
)
returns table (
  submission_id uuid,
  completed_reviews bigint,
  minimum_total numeric(5,2),
  maximum_total numeric(5,2),
  first_two_difference numeric(5,2),
  third_review_required boolean,
  final_median_total numeric(5,2)
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_conference_event_role(
    p_event_id,
    array['president','vice_president']::public.conference_event_role[]
  ) then
    raise exception 'not_authorized';
  end if;

  return query
  with scores as (
    select
      s.id as submission_id,
      e.discrepancy_threshold,
      count(r.id) filter (where r.weighted_total is not null) as completed_reviews,
      min(r.weighted_total) filter (where r.weighted_total is not null) as minimum_total,
      max(r.weighted_total) filter (where r.weighted_total is not null) as maximum_total,
      max(r.weighted_total) filter (where r.evaluation_round = 'first') as first_total,
      max(r.weighted_total) filter (where r.evaluation_round = 'second') as second_total,
      max(r.weighted_total) filter (where r.evaluation_round = 'third') as third_total
    from public.conference_submissions s
    join public.conference_events e on e.id = s.event_id
    left join public.conference_submission_reviews r on r.submission_id = s.id
    where s.event_id = p_event_id
    group by s.id, e.discrepancy_threshold
  )
  select
    scores.submission_id,
    scores.completed_reviews,
    scores.minimum_total,
    scores.maximum_total,
    case
      when scores.first_total is not null and scores.second_total is not null
        then abs(scores.first_total - scores.second_total)
      else null
    end::numeric(5,2),
    case
      when scores.first_total is not null and scores.second_total is not null
        then abs(scores.first_total - scores.second_total) >= scores.discrepancy_threshold
      else false
    end,
    case
      when scores.first_total is not null
       and scores.second_total is not null
       and scores.third_total is not null
        then round((
          scores.first_total + scores.second_total + scores.third_total
          - greatest(scores.first_total, scores.second_total, scores.third_total)
          - least(scores.first_total, scores.second_total, scores.third_total)
        )::numeric, 2)
      when scores.first_total is not null
       and scores.second_total is not null
       and abs(scores.first_total - scores.second_total) < scores.discrepancy_threshold
        then round(((scores.first_total + scores.second_total) / 2)::numeric, 2)
      else null
    end::numeric(5,2)
  from scores;
end;
$$;

revoke all on function public.get_conference_evaluation_summary(uuid)
  from public, anon, authenticated;
grant execute on function public.get_conference_evaluation_summary(uuid)
  to authenticated;

create or replace function public.get_conference_committee_dashboard_v2(
  p_event_slug text
)
returns table (
  event_id uuid,
  event_status public.conference_event_status,
  total_submissions bigint,
  scientific_count bigint,
  experience_count bigint,
  member_count bigint,
  completed_assignments bigint,
  total_assignments bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_event_id uuid;
begin
  select e.id into v_event_id
  from public.conference_events e
  where e.slug = nullif(btrim(p_event_slug), '');

  if v_event_id is null then
    raise exception 'event_not_found';
  end if;

  if not public.has_conference_event_role(
    v_event_id,
    array['president','vice_president']::public.conference_event_role[]
  ) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    e.id,
    e.status,
    count(distinct s.id),
    count(distinct s.id) filter (where s.submission_type = 'scientific_work'),
    count(distinct s.id) filter (where s.submission_type = 'improvement_experience'),
    count(distinct s.id) filter (where s.main_author_is_member),
    count(distinct a.id) filter (where a.status = 'completed'),
    count(distinct a.id)
  from public.conference_events e
  left join public.conference_submissions s on s.event_id = e.id
  left join public.conference_submission_assignments a on a.submission_id = s.id
  where e.id = v_event_id
  group by e.id, e.status;
end;
$$;

revoke all on function public.get_conference_committee_dashboard_v2(text)
  from public, anon, authenticated;
grant execute on function public.get_conference_committee_dashboard_v2(text)
  to authenticated;

create or replace function public.get_conference_committee_submissions_v2(
  p_event_id uuid
)
returns table (
  submission_id uuid,
  submission_code text,
  title text,
  submission_type public.conference_submission_type,
  status public.conference_submission_status,
  first_total numeric,
  second_total numeric,
  third_total numeric,
  third_review_required boolean,
  final_median_total numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_conference_event_role(
    p_event_id,
    array['president','vice_president']::public.conference_event_role[]
  ) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    s.id,
    s.submission_code,
    s.title,
    s.submission_type,
    s.status,
    max(r.weighted_total) filter (where r.evaluation_round = 'first'),
    max(r.weighted_total) filter (where r.evaluation_round = 'second'),
    max(r.weighted_total) filter (where r.evaluation_round = 'third'),
    summary.third_review_required,
    summary.final_median_total
  from public.conference_submissions s
  left join public.conference_submission_reviews r on r.submission_id = s.id
  left join public.get_conference_evaluation_summary(p_event_id) summary
    on summary.submission_id = s.id
  where s.event_id = p_event_id
  group by s.id, s.submission_code, s.title, s.submission_type, s.status,
    summary.third_review_required, summary.final_median_total
  order by s.created_at, s.submission_code;
end;
$$;

revoke all on function public.get_conference_committee_submissions_v2(uuid)
  from public, anon, authenticated;
grant execute on function public.get_conference_committee_submissions_v2(uuid)
  to authenticated;

