-- III Jornada ACASPEX — Evaluación, discrepancias, finalistas y premios (BORRADOR)

create type public.conference_assignment_round as enum ('first', 'second', 'third');
create type public.conference_finalist_slot as enum ('scientific_1', 'scientific_2', 'experience_1', 'experience_2', 'global_5');

alter table public.conference_submission_assignments
  add column evaluation_round public.conference_assignment_round;

update public.conference_submission_assignments a set evaluation_round = case
  when a.id = (select a2.id from public.conference_submission_assignments a2 where a2.submission_id = a.submission_id order by a2.assigned_at, a2.id limit 1) then 'first'::public.conference_assignment_round
  else 'second'::public.conference_assignment_round end
where evaluation_round is null;

alter table public.conference_submission_assignments
  alter column evaluation_round set not null;

create unique index conference_assignments_one_round_per_submission
  on public.conference_submission_assignments(submission_id, evaluation_round);

alter table public.conference_submission_reviews
  add column evaluation_round public.conference_assignment_round,
  add column score_objectives numeric(5,2) check (score_objectives between 0 and 100),
  add column score_results numeric(5,2) check (score_results between 0 and 100),
  add column score_conclusions numeric(5,2) check (score_conclusions between 0 and 100),
  add column total_score numeric(5,2) check (total_score between 0 and 100),
  add column author_recommendations text,
  add column confidential_comment text;

create table public.conference_finalists (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.conference_events(id) on delete cascade,
  submission_id uuid not null references public.conference_submissions(id) on delete cascade,
  finalist_slot public.conference_finalist_slot not null,
  scientific_score numeric(5,2) not null,
  tie_break_results_score numeric(5,2),
  tie_break_method_score numeric(5,2),
  presidency_decision text,
  selected_by uuid references public.profiles(id) on delete set null,
  selected_at timestamptz not null default now(),
  unique (event_id, finalist_slot),
  unique (event_id, submission_id)
);

create table public.conference_final_scores (
  id uuid primary key default gen_random_uuid(),
  finalist_id uuid not null unique references public.conference_finalists(id) on delete cascade,
  defense_score numeric(5,2) not null check (defense_score between 0 and 100),
  design_score numeric(5,2) not null check (design_score between 0 and 100),
  final_score numeric(5,2) generated always as (round(defense_score * 0.70 + design_score * 0.30, 2)) stored,
  jury_notes text,
  recorded_by uuid references public.profiles(id) on delete set null,
  recorded_at timestamptz not null default now()
);

create or replace view public.conference_submission_evaluation_summary
with (security_invoker = true) as
select
  s.id as submission_id,
  s.event_id,
  count(r.id) filter (where r.total_score is not null) as completed_reviews,
  min(r.total_score) as minimum_score,
  max(r.total_score) as maximum_score,
  max(r.total_score) - min(r.total_score) as score_difference,
  case when count(r.id) filter (where r.total_score is not null) = 2
         and max(r.total_score) - min(r.total_score) >= 30 then true else false end as requires_third_review,
  percentile_cont(0.5) within group (order by r.total_score)
    filter (where r.total_score is not null) as median_score
from public.conference_submissions s
left join public.conference_submission_reviews r on r.submission_id = s.id
group by s.id, s.event_id;

comment on view public.conference_submission_evaluation_summary is
  'Detecta discrepancias >=30 y calcula la mediana de las evaluaciones disponibles.';
