-- ACASPEX Portal Socios — III Jornada scientific API v2
-- Depende de: 047–059.
--
-- Mantiene intactos los endpoints v1 y añade contratos separados para:
--   1) recepción pública estructurada y atómica;
--   2) evaluación ciega con la rúbrica ponderada aprobada;
--   3) panel agregado de presidencia/vicepresidencia sin exponer autoría.

-- ── Campos funcionales que ya recoge el formulario v2 ───────────

alter table public.conference_submissions
  add column if not exists main_author_is_member boolean not null default false,
  add column if not exists center_type text,
  add column if not exists health_area text,
  add column if not exists presenter_commitment_at timestamptz;

alter table public.conference_submissions
  drop constraint if exists conference_submissions_center_type_check,
  add constraint conference_submissions_center_type_check check (
    center_type is null or center_type in (
      'public', 'private', 'charter', 'university', 'other'
    )
  ),
  drop constraint if exists conference_submissions_health_area_check,
  add constraint conference_submissions_health_area_check check (
    health_area is null or health_area in (
      'badajoz', 'merida', 'don-benito-villanueva', 'llerena-zafra',
      'caceres', 'coria', 'navalmoral-de-la-mata', 'plasencia'
    )
  );

alter table public.conference_submission_sections
  add column if not exists implementation_participation text;

-- ── Helper interno de límites de palabras ───────────────────────

create or replace function public.conference_v2_word_count(p_value text)
returns integer
language sql
immutable
security invoker
set search_path = ''
as $$
  select case
    when nullif(btrim(coalesce(p_value, '')), '') is null then 0
    else cardinality(regexp_split_to_array(btrim(p_value), E'\\s+'))
  end;
$$;

revoke all on function public.conference_v2_word_count(text)
  from public, anon, authenticated;

-- ── Recepción pública estructurada (solo Edge Function v2) ──────

create or replace function public.submit_conference_submission_v2(
  p_event_slug text,
  p_submission_type public.conference_submission_type,
  p_title text,
  p_sections jsonb,
  p_authors jsonb,
  p_references jsonb,
  p_center_type text,
  p_health_area text,
  p_main_author_is_member boolean,
  p_presenter_commitment boolean,
  p_no_identifying_data_confirmed boolean,
  p_privacy_accepted boolean,
  p_definitive_confirmed boolean
)
returns table (
  submission_id uuid,
  submission_code text,
  received_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.conference_events%rowtype;
  v_now timestamptz := now();
  v_submission_id uuid;
  v_submission_code text;
  v_author_count integer;
  v_reference_count integer;
  v_section_words integer;
  v_main_author jsonb;
  v_authors_text text;
  v_introduction text;
  v_objectives text;
  v_methodology text;
  v_results text;
  v_conclusions text;
  v_implementation text;
begin
  select * into v_event
  from public.conference_events e
  where e.slug = nullif(btrim(p_event_slug), '');

  if v_event.id is null then
    raise exception 'event_not_found';
  end if;
  if v_event.status <> 'open' then
    raise exception 'submissions_closed';
  end if;
  if v_event.submission_open_at is not null and v_now < v_event.submission_open_at then
    raise exception 'submissions_not_yet_open';
  end if;
  if v_event.submission_close_at is not null and v_now > v_event.submission_close_at then
    raise exception 'submissions_expired';
  end if;

  if public.conference_v2_word_count(p_title) not between 1 and 15
     or length(p_title) > 250 then
    raise exception 'invalid_title_length';
  end if;
  if p_sections is null or jsonb_typeof(p_sections) <> 'object' then
    raise exception 'invalid_sections';
  end if;
  if p_authors is null or jsonb_typeof(p_authors) <> 'array' then
    raise exception 'invalid_authors';
  end if;
  if jsonb_typeof(coalesce(p_references, '[]'::jsonb)) <> 'array' then
    raise exception 'invalid_references';
  end if;

  v_author_count := jsonb_array_length(p_authors);
  v_reference_count := jsonb_array_length(coalesce(p_references, '[]'::jsonb));

  if v_author_count < 1 or v_author_count > v_event.max_authors then
    raise exception 'invalid_author_count';
  end if;
  if v_reference_count > v_event.max_references then
    raise exception 'invalid_reference_count';
  end if;
  if p_submission_type = 'scientific_work' and v_reference_count < 1 then
    raise exception 'references_required';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_authors) author
    where jsonb_typeof(author) <> 'object'
       or nullif(btrim(author->>'full_name'), '') is null
       or length(author->>'full_name') > 200
       or length(coalesce(author->>'email', '')) > 320
       or length(coalesce(author->>'institution', '')) > 250
       or length(coalesce(author->>'service_unit', '')) > 250
       or length(coalesce(author->>'province', '')) > 120
  ) then
    raise exception 'invalid_author';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(coalesce(p_references, '[]'::jsonb)) reference
    where jsonb_typeof(reference) <> 'string'
       or nullif(btrim(reference #>> '{}'), '') is null
       or length(reference #>> '{}') > 2000
  ) then
    raise exception 'invalid_reference';
  end if;

  v_main_author := p_authors->0;
  if nullif(btrim(v_main_author->>'email'), '') is null
     or (v_main_author->>'email') !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid_main_author_email';
  end if;
  if nullif(btrim(v_main_author->>'institution'), '') is null
     or nullif(btrim(v_main_author->>'province'), '') is null
     or nullif(btrim(v_main_author->>'service_unit'), '') is null then
    raise exception 'missing_main_author_context';
  end if;

  if p_center_type not in ('public', 'private', 'charter', 'university', 'other') then
    raise exception 'invalid_center_type';
  end if;
  if p_health_area not in (
    'badajoz', 'merida', 'don-benito-villanueva', 'llerena-zafra',
    'caceres', 'coria', 'navalmoral-de-la-mata', 'plasencia'
  ) then
    raise exception 'invalid_health_area';
  end if;
  if not coalesce(p_presenter_commitment, false) then
    raise exception 'presenter_commitment_required';
  end if;
  if not coalesce(p_no_identifying_data_confirmed, false) then
    raise exception 'no_identifying_data_confirmation_required';
  end if;
  if not coalesce(p_privacy_accepted, false) then
    raise exception 'privacy_acceptance_required';
  end if;
  if not coalesce(p_definitive_confirmed, false) then
    raise exception 'definitive_confirmation_required';
  end if;

  if p_submission_type = 'scientific_work' then
    v_introduction := nullif(btrim(p_sections->>'introduction'), '');
    v_objectives := nullif(btrim(p_sections->>'objectives'), '');
    v_methodology := nullif(btrim(p_sections->>'methodology'), '');
    v_results := nullif(btrim(p_sections->>'results'), '');
    v_conclusions := nullif(btrim(p_sections->>'conclusions'), '');
    v_implementation := null;
  else
    v_introduction := nullif(btrim(p_sections->>'context'), '');
    v_objectives := nullif(btrim(p_sections->>'objective'), '');
    v_methodology := nullif(btrim(p_sections->>'intervention'), '');
    v_implementation := nullif(btrim(p_sections->>'implementation'), '');
    v_results := nullif(btrim(p_sections->>'results'), '');
    v_conclusions := nullif(btrim(p_sections->>'lessons'), '');
  end if;

  if v_introduction is null or v_objectives is null or v_methodology is null
     or v_results is null or v_conclusions is null
     or (p_submission_type = 'improvement_experience' and v_implementation is null) then
    raise exception 'incomplete_sections';
  end if;

  select coalesce(sum(public.conference_v2_word_count(value)), 0)::integer
    into v_section_words
  from jsonb_each_text(p_sections);

  if v_section_words < 1 or v_section_words > 400 then
    raise exception 'invalid_abstract_length';
  end if;
  if exists (
    select 1 from jsonb_each_text(p_sections)
    where length(value) > 5000
  ) then
    raise exception 'invalid_section_length';
  end if;

  select string_agg(btrim(author->>'full_name'), '; ' order by ordinal)
    into v_authors_text
  from jsonb_array_elements(p_authors) with ordinality as a(author, ordinal);

  insert into public.conference_submissions (
    event_id,
    status,
    title,
    modality,
    topic_area,
    abstract_text,
    authors_text,
    main_author_name,
    main_author_email,
    main_author_phone,
    center,
    center_type,
    service_unit,
    province,
    health_area,
    main_author_is_member,
    privacy_accepted_at,
    communication_consent,
    submission_type,
    definitive_submitted_at,
    no_identifying_data_confirmed_at,
    presenter_commitment_at
  ) values (
    v_event.id,
    'received',
    btrim(p_title),
    'poster',
    null,
    concat_ws(E'\n\n', v_introduction, v_objectives, v_methodology,
      v_implementation, v_results, v_conclusions),
    v_authors_text,
    btrim(v_main_author->>'full_name'),
    lower(btrim(v_main_author->>'email')),
    nullif(btrim(v_main_author->>'phone'), ''),
    btrim(v_main_author->>'institution'),
    p_center_type,
    btrim(v_main_author->>'service_unit'),
    btrim(v_main_author->>'province'),
    p_health_area,
    coalesce(p_main_author_is_member, false),
    v_now,
    false,
    p_submission_type,
    v_now,
    v_now,
    v_now
  )
  returning id, conference_submissions.submission_code
    into v_submission_id, v_submission_code;

  insert into public.conference_submission_sections (
    submission_id,
    introduction,
    objectives,
    methodology_or_intervention,
    implementation_participation,
    results,
    conclusions,
    ethical_considerations
  ) values (
    v_submission_id,
    v_introduction,
    v_objectives,
    v_methodology,
    v_implementation,
    v_results,
    v_conclusions,
    case when p_submission_type = 'scientific_work'
      then nullif(btrim(p_sections->>'ethical_considerations'), '')
      else null
    end
  );

  insert into public.conference_submission_authors (
    submission_id,
    author_order,
    full_name,
    institution,
    center,
    service_unit,
    province,
    email,
    phone,
    is_main_author,
    is_presenting_author
  )
  select
    v_submission_id,
    ordinal::smallint,
    btrim(author->>'full_name'),
    nullif(btrim(author->>'institution'), ''),
    nullif(btrim(author->>'center'), ''),
    nullif(btrim(author->>'service_unit'), ''),
    nullif(btrim(author->>'province'), ''),
    nullif(lower(btrim(author->>'email')), ''),
    nullif(btrim(author->>'phone'), ''),
    ordinal = 1,
    ordinal = 1
  from jsonb_array_elements(p_authors) with ordinality as a(author, ordinal);

  insert into public.conference_submission_references (
    submission_id,
    reference_order,
    reference_text
  )
  select
    v_submission_id,
    ordinal::smallint,
    btrim(reference #>> '{}')
  from jsonb_array_elements(coalesce(p_references, '[]'::jsonb))
    with ordinality as r(reference, ordinal);

  insert into public.conference_audit_events (
    event_id, submission_id, actor_profile_id, action, details
  ) values (
    v_event.id,
    v_submission_id,
    null,
    'submission_received_v2',
    jsonb_build_object(
      'submission_type', p_submission_type,
      'author_count', v_author_count,
      'reference_count', v_reference_count,
      'word_count', v_section_words
    )
  );

  return query select v_submission_id, v_submission_code, v_now;
end;
$$;

comment on function public.submit_conference_submission_v2(
  text, public.conference_submission_type, text, jsonb, jsonb, jsonb,
  text, text, boolean, boolean, boolean, boolean, boolean
) is
  'Recepción v2 atómica. Solo invocable por service_role desde la Edge Function v2.';

revoke all on function public.submit_conference_submission_v2(
  text, public.conference_submission_type, text, jsonb, jsonb, jsonb,
  text, text, boolean, boolean, boolean, boolean, boolean
) from public, anon, authenticated;
grant execute on function public.submit_conference_submission_v2(
  text, public.conference_submission_type, text, jsonb, jsonb, jsonb,
  text, text, boolean, boolean, boolean, boolean, boolean
) to service_role;

-- ── Lectura ciega y evaluación ponderada v2 ────────────────────

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
  if (select auth.uid()) is null
     or public.is_comite_cientifico() is distinct from true then
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
  where r.profile_id = (select auth.uid())
    and r.is_active
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
  if (select auth.uid()) is null
     or public.is_comite_cientifico() is distinct from true
     or public.is_reviewer_for_submission(p_submission_id) is distinct from true then
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
  join public.conference_submission_sections sec on sec.submission_id = s.id
  where s.id = p_submission_id
    and r.profile_id = (select auth.uid())
    and r.is_active;
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
  if (select auth.uid()) is null
     or public.is_comite_cientifico() is distinct from true then
    raise exception 'not_authorized';
  end if;

  select r.id, s.event_id
    into v_reviewer_id, v_event_id
  from public.conference_reviewers r
  join public.conference_submission_assignments a on a.reviewer_id = r.id
  join public.conference_submissions s on s.id = a.submission_id
  where r.profile_id = (select auth.uid())
    and r.is_active
    and a.submission_id = p_submission_id
  limit 1;

  if v_reviewer_id is null then
    raise exception 'not_assigned_reviewer';
  end if;
  if exists (
    select 1 from public.conference_submission_reviews r
    where r.submission_id = p_submission_id
      and r.reviewer_id = v_reviewer_id
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
revoke all on function public.submit_conference_review_v2(
  uuid, integer, integer, integer, integer, integer, integer, text, text
) from public, anon, authenticated;

grant execute on function public.get_assigned_submissions_v2_for_reviewer()
  to authenticated;
grant execute on function public.get_conference_submission_v2_for_reviewer(uuid)
  to authenticated;
grant execute on function public.submit_conference_review_v2(
  uuid, integer, integer, integer, integer, integer, integer, text, text
) to authenticated;

-- ── Panel ciego del comité científico ───────────────────────────

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
  if not (
    public.is_admin()
    or public.has_conference_event_role(
      v_event_id,
      array['president','vice_president']::public.conference_event_role[]
    )
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

create or replace function public.get_conference_committee_submissions_v2(
  p_event_id uuid
)
returns table (
  submission_id uuid,
  submission_code text,
  title text,
  submission_type public.conference_submission_type,
  status public.conference_submission_status,
  first_total numeric(5,2),
  second_total numeric(5,2),
  third_total numeric(5,2),
  third_review_required boolean,
  final_median_total numeric(5,2)
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (
    public.is_admin()
    or public.has_conference_event_role(
      p_event_id,
      array['president','vice_president']::public.conference_event_role[]
    )
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

revoke all on function public.get_conference_committee_dashboard_v2(text)
  from public, anon, authenticated;
revoke all on function public.get_conference_committee_submissions_v2(uuid)
  from public, anon, authenticated;
grant execute on function public.get_conference_committee_dashboard_v2(text)
  to authenticated;
grant execute on function public.get_conference_committee_submissions_v2(uuid)
  to authenticated;
