-- III Jornada ACASPEX — Modelo científico definitivo (BORRADOR, NO APLICADO)
-- Amplía el módulo existente sin modificar tablas del portal de socios.

create type public.conference_submission_type as enum ('scientific', 'improvement_experience');
create type public.conference_center_type as enum ('public', 'private', 'concerted', 'university', 'other');
create type public.conference_poster_status as enum ('pending', 'uploaded', 'incident', 'validated', 'replaced');

alter table public.conference_submissions
  add column submission_type public.conference_submission_type,
  add column health_area text,
  add column center_type public.conference_center_type,
  add column definitive_submitted_at timestamptz,
  add column definitive_confirmed boolean not null default false,
  add column patient_data_absent_confirmed boolean not null default false,
  add column poster_format_confirmed boolean not null default false;

comment on column public.conference_submissions.submission_type is
  'Tipo definitivo: trabajo científico o experiencia de mejora.';
comment on column public.conference_submissions.definitive_submitted_at is
  'Marca temporal del envío definitivo. El autor no puede corregirlo posteriormente.';

create table public.conference_submission_sections (
  submission_id uuid primary key references public.conference_submissions(id) on delete cascade,
  introduction text,
  objectives text,
  methodology_ethics text,
  results text,
  conclusions text,
  problem_context text,
  intervention text,
  implementation_participation text,
  lessons_applicability_sustainability text,
  total_word_count integer not null check (total_word_count between 1 and 400),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conference_submission_references (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.conference_submissions(id) on delete cascade,
  reference_order smallint not null check (reference_order between 1 and 3),
  reference_text text not null check (btrim(reference_text) <> ''),
  created_at timestamptz not null default now(),
  unique (submission_id, reference_order)
);

create table public.conference_submission_authors (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.conference_submissions(id) on delete cascade,
  author_order smallint not null check (author_order between 1 and 6),
  full_name text not null check (btrim(full_name) <> ''),
  email text,
  institution text not null,
  center_type public.conference_center_type not null,
  province text not null,
  health_area text,
  service_unit text,
  is_acaspex_member boolean not null default false,
  is_main_author boolean not null default false,
  is_presenting_author boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id, author_order)
);

create unique index conference_authors_one_main_per_submission
  on public.conference_submission_authors(submission_id) where is_main_author;
create unique index conference_authors_one_presenter_per_submission
  on public.conference_submission_authors(submission_id) where is_presenting_author;

create table public.conference_poster_versions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.conference_submissions(id) on delete cascade,
  version_number smallint not null check (version_number >= 1),
  file_path text not null,
  original_name text not null,
  mime_type text not null check (mime_type = 'application/pdf'),
  file_size integer not null check (file_size > 0),
  status public.conference_poster_status not null default 'uploaded',
  incident_description text,
  replacement_authorized_by uuid references public.profiles(id) on delete set null,
  replacement_authorized_at timestamptz,
  uploaded_at timestamptz not null default now(),
  unique (submission_id, version_number)
);

create index conference_sections_submission_idx on public.conference_submission_sections(submission_id);
create index conference_references_submission_idx on public.conference_submission_references(submission_id);
create index conference_authors_submission_idx on public.conference_submission_authors(submission_id);
create index conference_posters_submission_idx on public.conference_poster_versions(submission_id);

create trigger set_conference_sections_updated_at before update on public.conference_submission_sections
for each row execute function public.set_updated_at();
create trigger set_conference_authors_updated_at before update on public.conference_submission_authors
for each row execute function public.set_updated_at();

create or replace function public.validate_conference_submission_payload(p_submission_id uuid)
returns boolean language plpgsql security invoker set search_path = public as $$
declare
  v_type public.conference_submission_type;
  v_title text;
  v_sections public.conference_submission_sections%rowtype;
  v_author_count integer;
  v_main_count integer;
  v_presenter_count integer;
  v_reference_count integer;
begin
  select submission_type, title into v_type, v_title
  from public.conference_submissions where id = p_submission_id;
  if v_type is null or coalesce(array_length(regexp_split_to_array(btrim(v_title), '\s+'), 1), 0) > 15 then
    return false;
  end if;

  select * into v_sections from public.conference_submission_sections where submission_id = p_submission_id;
  if not found or v_sections.total_word_count > 400 then return false; end if;

  if v_type = 'scientific' and (
    nullif(btrim(v_sections.introduction), '') is null or
    nullif(btrim(v_sections.objectives), '') is null or
    nullif(btrim(v_sections.methodology_ethics), '') is null or
    nullif(btrim(v_sections.results), '') is null or
    nullif(btrim(v_sections.conclusions), '') is null
  ) then return false; end if;

  if v_type = 'improvement_experience' and (
    nullif(btrim(v_sections.problem_context), '') is null or
    nullif(btrim(v_sections.objectives), '') is null or
    nullif(btrim(v_sections.intervention), '') is null or
    nullif(btrim(v_sections.implementation_participation), '') is null or
    nullif(btrim(v_sections.results), '') is null or
    nullif(btrim(v_sections.lessons_applicability_sustainability), '') is null
  ) then return false; end if;

  select count(*), count(*) filter (where is_main_author), count(*) filter (where is_presenting_author)
    into v_author_count, v_main_count, v_presenter_count
  from public.conference_submission_authors where submission_id = p_submission_id;
  if v_author_count not between 2 and 6 or v_main_count <> 1 or v_presenter_count <> 1 then return false; end if;

  select count(*) into v_reference_count from public.conference_submission_references where submission_id = p_submission_id;
  if v_type = 'scientific' and v_reference_count not between 1 and 3 then return false; end if;
  if v_type = 'improvement_experience' and v_reference_count > 3 then return false; end if;
  return true;
end;
$$;

-- Nuevo formato atómico ACX26-001. Conserva el contador existente por evento.
create or replace function public.set_conference_submission_code()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_next integer;
begin
  insert into public.conference_event_counters(event_id, next_code) values (new.event_id, 1)
  on conflict (event_id) do nothing;
  update public.conference_event_counters set next_code = next_code + 1
  where event_id = new.event_id returning next_code - 1 into v_next;
  new.submission_code := 'ACX26-' || lpad(v_next::text, 3, '0');
  return new;
end;
$$;
