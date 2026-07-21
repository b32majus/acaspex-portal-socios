-- ACASPEX Portal Socios — III Jornada scientific model v2
-- Depende de: 047–058.
--
-- Amplía el módulo v1 sin eliminar ni renombrar objetos existentes.
-- No contiene datos, no abre acceso anónimo y no sustituye todavía la RPC v1.

-- ── Tipos ─────────────────────────────────────────────────────────

do $$ begin
  create type public.conference_submission_type as enum (
    'scientific_work', 'improvement_experience'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.conference_assignment_round as enum (
    'first', 'second', 'third'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.conference_event_role as enum (
    'president', 'vice_president', 'scientific_secretary', 'reviewer'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.conference_finalist_slot as enum (
    'scientific_1', 'scientific_2',
    'experience_1', 'experience_2', 'best_remaining'
  );
exception when duplicate_object then null;
end $$;

-- ── Configuración por evento y ampliación de comunicaciones ──────

alter table public.conference_events
  add column if not exists submission_code_prefix text not null default 'P',
  add column if not exists discrepancy_threshold numeric(5,2) not null default 30,
  add column if not exists max_authors smallint not null default 6,
  add column if not exists max_references smallint not null default 3;

alter table public.conference_events
  drop constraint if exists conference_events_code_prefix_check,
  add constraint conference_events_code_prefix_check
    check (submission_code_prefix ~ '^[A-Z0-9]{1,10}$'),
  drop constraint if exists conference_events_discrepancy_threshold_check,
  add constraint conference_events_discrepancy_threshold_check
    check (discrepancy_threshold between 0 and 100),
  drop constraint if exists conference_events_max_authors_check,
  add constraint conference_events_max_authors_check
    check (max_authors between 1 and 6),
  drop constraint if exists conference_events_max_references_check,
  add constraint conference_events_max_references_check
    check (max_references between 1 and 3);

alter table public.conference_submissions
  add column if not exists submission_type public.conference_submission_type,
  add column if not exists definitive_submitted_at timestamptz,
  add column if not exists no_identifying_data_confirmed_at timestamptz;

-- ── Contenido estructurado, autoría y bibliografía ───────────────

create table public.conference_submission_sections (
  submission_id uuid primary key
    references public.conference_submissions(id) on delete cascade,
  introduction text not null,
  objectives text not null,
  methodology_or_intervention text not null,
  results text not null,
  conclusions text not null,
  ethical_considerations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conference_sections_nonblank_check check (
    btrim(introduction) <> '' and btrim(objectives) <> '' and
    btrim(methodology_or_intervention) <> '' and btrim(results) <> '' and
    btrim(conclusions) <> ''
  )
);

create table public.conference_submission_authors (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null
    references public.conference_submissions(id) on delete cascade,
  author_order smallint not null check (author_order between 1 and 6),
  full_name text not null check (btrim(full_name) <> ''),
  institution text,
  center text,
  service_unit text,
  province text,
  email text,
  phone text,
  is_main_author boolean not null default false,
  is_presenting_author boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id, author_order)
);

create unique index conference_authors_one_main_per_submission
  on public.conference_submission_authors(submission_id)
  where is_main_author;
create unique index conference_authors_one_presenter_per_submission
  on public.conference_submission_authors(submission_id)
  where is_presenting_author;

create table public.conference_submission_references (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null
    references public.conference_submissions(id) on delete cascade,
  reference_order smallint not null check (reference_order between 1 and 3),
  reference_text text not null check (btrim(reference_text) <> ''),
  created_at timestamptz not null default now(),
  unique (submission_id, reference_order)
);

create index conference_authors_submission_idx
  on public.conference_submission_authors(submission_id);
create index conference_references_submission_idx
  on public.conference_submission_references(submission_id);

create trigger set_conference_sections_updated_at
before update on public.conference_submission_sections
for each row execute function public.set_updated_at();

create trigger set_conference_authors_updated_at
before update on public.conference_submission_authors
for each row execute function public.set_updated_at();

-- ── Roles del comité, siempre acotados al evento ─────────────────

create table public.conference_event_committee_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.conference_events(id) on delete cascade,
  reviewer_id uuid not null references public.conference_reviewers(id) on delete cascade,
  committee_role public.conference_event_role not null default 'reviewer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, reviewer_id, committee_role)
);

create unique index conference_one_active_president_per_event
  on public.conference_event_committee_members(event_id)
  where committee_role = 'president' and is_active;
create unique index conference_one_active_vice_president_per_event
  on public.conference_event_committee_members(event_id)
  where committee_role = 'vice_president' and is_active;
create index conference_committee_reviewer_idx
  on public.conference_event_committee_members(reviewer_id, event_id);

create trigger set_conference_committee_updated_at
before update on public.conference_event_committee_members
for each row execute function public.set_updated_at();

create or replace function public.has_conference_event_role(
  p_event_id uuid,
  p_roles public.conference_event_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.conference_event_committee_members m
    join public.conference_reviewers r on r.id = m.reviewer_id
    where m.event_id = p_event_id
      and m.committee_role = any(p_roles)
      and m.is_active
      and r.is_active
      and r.profile_id = (select auth.uid())
  );
$$;

revoke all on function public.has_conference_event_role(
  uuid, public.conference_event_role[]
) from public, anon, authenticated;
grant execute on function public.has_conference_event_role(
  uuid, public.conference_event_role[]
) to authenticated;

-- ── Dos evaluaciones + tercera por discrepancia ──────────────────

alter table public.conference_submission_assignments
  add column if not exists evaluation_round public.conference_assignment_round;

update public.conference_submission_assignments a
set evaluation_round = case
  when a.id = (
    select a2.id from public.conference_submission_assignments a2
    where a2.submission_id = a.submission_id
    order by a2.assigned_at, a2.id limit 1
  ) then 'first'::public.conference_assignment_round
  else 'second'::public.conference_assignment_round
end
where evaluation_round is null;

alter table public.conference_submission_assignments
  alter column evaluation_round set not null;

create unique index conference_assignment_one_round_per_submission
  on public.conference_submission_assignments(submission_id, evaluation_round);

alter table public.conference_submission_reviews
  add column if not exists evaluation_round public.conference_assignment_round,
  add column if not exists score_intro_objectives integer
    check (score_intro_objectives between 1 and 5),
  add column if not exists score_results integer
    check (score_results between 1 and 5),
  add column if not exists score_conclusions_applicability integer
    check (score_conclusions_applicability between 1 and 5),
  add column if not exists author_recommendations text,
  add column if not exists confidential_committee_comment text;

update public.conference_submission_reviews r
set evaluation_round = a.evaluation_round
from public.conference_submission_assignments a
where a.submission_id = r.submission_id
  and a.reviewer_id = r.reviewer_id
  and r.evaluation_round is null;

alter table public.conference_submission_reviews
  alter column evaluation_round set not null;

alter table public.conference_submission_reviews
  add column weighted_total numeric(5,2) generated always as (
    round((
      score_relevance * 10 +
      score_intro_objectives * 15 +
      score_methodology * 25 +
      score_results * 25 +
      score_conclusions_applicability * 15 +
      score_clarity * 10
    )::numeric / 5, 2)
  ) stored;

alter table public.conference_submission_reviews
  add constraint conference_reviews_v2_complete_check check (
    (score_intro_objectives is null and score_results is null and
     score_conclusions_applicability is null and author_recommendations is null and
     confidential_committee_comment is null)
    or
    (score_relevance is not null and score_intro_objectives is not null and
     score_methodology is not null and score_results is not null and
     score_conclusions_applicability is not null and score_clarity is not null and
     nullif(btrim(author_recommendations), '') is not null and
     nullif(btrim(confidential_committee_comment), '') is not null)
  );

-- Presidencia puede consultar las evaluaciones del evento, pero la autoría
-- continúa en tablas separadas sin ninguna policy para evaluadores.
create policy conference_reviews_presidency_select
  on public.conference_submission_reviews for select to authenticated
  using (exists (
    select 1
    from public.conference_submissions s
    where s.id = submission_id
      and public.has_conference_event_role(
        s.event_id,
        array['president','vice_president']::public.conference_event_role[]
      )
  ));

create view public.conference_submission_evaluation_summary
with (security_invoker = true)
as
select
  s.id as submission_id,
  s.event_id,
  count(r.id) filter (where r.weighted_total is not null) as completed_reviews,
  min(r.weighted_total) filter (where r.weighted_total is not null) as minimum_total,
  max(r.weighted_total) filter (where r.weighted_total is not null) as maximum_total,
  case
    when count(r.id) filter (where r.weighted_total is not null) = 2
      then max(r.weighted_total) - min(r.weighted_total)
    else null
  end as first_two_difference,
  case
    when count(r.id) filter (where r.weighted_total is not null) = 2
      then max(r.weighted_total) - min(r.weighted_total) >= e.discrepancy_threshold
    else false
  end as third_review_required,
  case
    when count(r.id) filter (where r.weighted_total is not null) in (2, 3)
      then percentile_cont(0.5) within group (order by r.weighted_total)
        filter (where r.weighted_total is not null)
    else null
  end::numeric(5,2) as final_median_total
from public.conference_submissions s
join public.conference_events e on e.id = s.event_id
left join public.conference_submission_reviews r on r.submission_id = s.id
group by s.id, s.event_id, e.discrepancy_threshold;

comment on view public.conference_submission_evaluation_summary is
  'Resumen sin autoría: diferencia entre las dos primeras evaluaciones, activación de tercera revisión y mediana final de 2 o 3 totales ponderados.';

grant select on public.conference_submission_evaluation_summary to authenticated;
revoke all on public.conference_submission_evaluation_summary from anon;

-- ── Finalistas y premio (defensa 70 %, diseño 30 %) ──────────────

create table public.conference_finalists (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.conference_events(id) on delete cascade,
  submission_id uuid not null references public.conference_submissions(id) on delete cascade,
  finalist_slot public.conference_finalist_slot not null,
  selected_by uuid references public.profiles(id) on delete set null,
  selected_at timestamptz not null default now(),
  notes text,
  unique (event_id, finalist_slot),
  unique (event_id, submission_id)
);

create table public.conference_final_scores (
  id uuid primary key default gen_random_uuid(),
  finalist_id uuid not null references public.conference_finalists(id) on delete cascade,
  juror_profile_id uuid not null references public.profiles(id) on delete restrict,
  defense_score numeric(4,2) not null check (defense_score between 0 and 10),
  design_score numeric(4,2) not null check (design_score between 0 and 10),
  weighted_total numeric(4,2) generated always as
    (round((defense_score * 0.70 + design_score * 0.30)::numeric, 2)) stored,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (finalist_id, juror_profile_id)
);

create trigger set_conference_final_scores_updated_at
before update on public.conference_final_scores
for each row execute function public.set_updated_at();

-- ── Auditoría ────────────────────────────────────────────────────

create table public.conference_audit_events (
  id bigint generated always as identity primary key,
  event_id uuid references public.conference_events(id) on delete set null,
  submission_id uuid references public.conference_submissions(id) on delete set null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null check (btrim(action) <> ''),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index conference_audit_event_created_idx
  on public.conference_audit_events(event_id, created_at desc);
create index conference_audit_submission_created_idx
  on public.conference_audit_events(submission_id, created_at desc);

-- ── RLS: identidad nunca visible para evaluadores ────────────────

alter table public.conference_submission_sections enable row level security;
alter table public.conference_submission_authors enable row level security;
alter table public.conference_submission_references enable row level security;
alter table public.conference_event_committee_members enable row level security;
alter table public.conference_finalists enable row level security;
alter table public.conference_final_scores enable row level security;
alter table public.conference_audit_events enable row level security;

create policy conference_sections_admin_all
  on public.conference_submission_sections for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy conference_authors_admin_all
  on public.conference_submission_authors for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy conference_references_admin_all
  on public.conference_submission_references for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy conference_committee_admin_all
  on public.conference_event_committee_members for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy conference_committee_own_select
  on public.conference_event_committee_members for select to authenticated
  using (exists (
    select 1 from public.conference_reviewers r
    where r.id = reviewer_id and r.profile_id = (select auth.uid())
  ));

create policy conference_finalists_presidency_all
  on public.conference_finalists for all to authenticated
  using (public.is_admin() or public.has_conference_event_role(
    event_id, array['president','vice_president']::public.conference_event_role[]
  ))
  with check (public.is_admin() or public.has_conference_event_role(
    event_id, array['president','vice_president']::public.conference_event_role[]
  ));

create policy conference_final_scores_jury_select
  on public.conference_final_scores for select to authenticated
  using (public.is_admin() or (
    juror_profile_id = (select auth.uid())
    and exists (
      select 1 from public.conference_finalists f
      where f.id = finalist_id
        and public.has_conference_event_role(
          f.event_id,
          array['president','vice_president','scientific_secretary','reviewer']::public.conference_event_role[]
        )
    )
  ));
create policy conference_final_scores_jury_insert
  on public.conference_final_scores for insert to authenticated
  with check (public.is_admin() or (
    juror_profile_id = (select auth.uid())
    and exists (
      select 1 from public.conference_finalists f
      where f.id = finalist_id
        and public.has_conference_event_role(
          f.event_id,
          array['president','vice_president','scientific_secretary','reviewer']::public.conference_event_role[]
        )
    )
  ));
create policy conference_final_scores_jury_update
  on public.conference_final_scores for update to authenticated
  using (public.is_admin() or (
    juror_profile_id = (select auth.uid())
    and exists (
      select 1 from public.conference_finalists f
      where f.id = finalist_id
        and public.has_conference_event_role(
          f.event_id,
          array['president','vice_president','scientific_secretary','reviewer']::public.conference_event_role[]
        )
    )
  ))
  with check (public.is_admin() or (
    juror_profile_id = (select auth.uid())
    and exists (
      select 1 from public.conference_finalists f
      where f.id = finalist_id
        and public.has_conference_event_role(
          f.event_id,
          array['president','vice_president','scientific_secretary','reviewer']::public.conference_event_role[]
        )
    )
  ));

create policy conference_audit_admin_or_presidency_select
  on public.conference_audit_events for select to authenticated
  using (public.is_admin() or public.has_conference_event_role(
    event_id, array['president','vice_president']::public.conference_event_role[]
  ));

-- Grants are deliberately narrower than RLS capabilities.
grant select, insert, update, delete on
  public.conference_submission_sections,
  public.conference_submission_authors,
  public.conference_submission_references,
  public.conference_event_committee_members,
  public.conference_finalists,
  public.conference_final_scores
to authenticated;
grant select on public.conference_audit_events to authenticated;

-- No direct table access for anonymous users. Public submissions continue
-- through the Edge Function, which will be upgraded in a later migration.
revoke all on
  public.conference_submission_sections,
  public.conference_submission_authors,
  public.conference_submission_references,
  public.conference_event_committee_members,
  public.conference_finalists,
  public.conference_final_scores,
  public.conference_audit_events
from anon;
