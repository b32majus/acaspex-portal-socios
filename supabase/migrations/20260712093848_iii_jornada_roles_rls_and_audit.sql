-- III Jornada ACASPEX — Roles científicos, conflictos, auditoría y RLS (BORRADOR)

create type public.conference_committee_role as enum ('president', 'vice_president', 'reviewer');
create type public.conference_conflict_type as enum ('author', 'institution', 'service_unit', 'declared_other');

alter table public.conference_reviewers
  add column committee_role public.conference_committee_role not null default 'reviewer';

create table public.conference_reviewer_conflicts (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.conference_reviewers(id) on delete cascade,
  submission_id uuid references public.conference_submissions(id) on delete cascade,
  conflict_type public.conference_conflict_type not null,
  conflict_value text,
  reason text not null,
  declared_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.conference_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.conference_events(id) on delete cascade,
  submission_id uuid references public.conference_submissions(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index conference_conflicts_reviewer_idx on public.conference_reviewer_conflicts(reviewer_id);
create index conference_conflicts_submission_idx on public.conference_reviewer_conflicts(submission_id);
create index conference_audit_submission_idx on public.conference_audit_events(submission_id, created_at desc);

create or replace function public.is_conference_presidency()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.conference_reviewers r
    where r.profile_id = auth.uid() and r.is_active
      and r.committee_role in ('president', 'vice_president')
  );
$$;

revoke all on function public.is_conference_presidency() from public;
grant execute on function public.is_conference_presidency() to authenticated;

alter table public.conference_submission_sections enable row level security;
alter table public.conference_submission_references enable row level security;
alter table public.conference_submission_authors enable row level security;
alter table public.conference_poster_versions enable row level security;
alter table public.conference_finalists enable row level security;
alter table public.conference_final_scores enable row level security;
alter table public.conference_reviewer_conflicts enable row level security;
alter table public.conference_audit_events enable row level security;

create policy conference_sections_presidency_all on public.conference_submission_sections
  for all to authenticated using (public.is_admin() or public.is_conference_presidency())
  with check (public.is_admin() or public.is_conference_presidency());
create policy conference_references_presidency_all on public.conference_submission_references
  for all to authenticated using (public.is_admin() or public.is_conference_presidency())
  with check (public.is_admin() or public.is_conference_presidency());
create policy conference_authors_presidency_all on public.conference_submission_authors
  for all to authenticated using (public.is_admin() or public.is_conference_presidency())
  with check (public.is_admin() or public.is_conference_presidency());
create policy conference_posters_presidency_all on public.conference_poster_versions
  for all to authenticated using (public.is_admin() or public.is_conference_presidency())
  with check (public.is_admin() or public.is_conference_presidency());
create policy conference_finalists_presidency_all on public.conference_finalists
  for all to authenticated using (public.is_admin() or public.is_conference_presidency())
  with check (public.is_admin() or public.is_conference_presidency());
create policy conference_final_scores_presidency_all on public.conference_final_scores
  for all to authenticated using (public.is_admin() or public.is_conference_presidency())
  with check (public.is_admin() or public.is_conference_presidency());
create policy conference_conflicts_presidency_all on public.conference_reviewer_conflicts
  for all to authenticated using (public.is_admin() or public.is_conference_presidency())
  with check (public.is_admin() or public.is_conference_presidency());
create policy conference_audit_presidency_select on public.conference_audit_events
  for select to authenticated using (public.is_admin() or public.is_conference_presidency());
create policy conference_audit_presidency_insert on public.conference_audit_events
  for insert to authenticated with check (public.is_admin() or public.is_conference_presidency());

grant select, insert, update, delete on public.conference_submission_sections,
  public.conference_submission_references, public.conference_submission_authors,
  public.conference_poster_versions, public.conference_finalists,
  public.conference_final_scores, public.conference_reviewer_conflicts,
  public.conference_audit_events to authenticated;

grant select on public.conference_submission_evaluation_summary to authenticated;
