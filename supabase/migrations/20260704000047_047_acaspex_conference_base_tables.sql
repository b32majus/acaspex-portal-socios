-- ACASPEX Portal Socios — Migración base para gestión científica de jornadas
-- B02: crea enums, tablas, relaciones, constraints, índices y triggers updated_at.
-- No crea RLS, policies, bucket Storage, triggers de código P001 ni Edge Functions.
-- Ejecutar solo tras revisión explícita. No contiene datos reales ni secretos.
-- FIX1: correcciones post-revisión Cora (email unique, CHECKs inline, updated_at en assignments, recount índices).

-- ═══════════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════════

do $$
begin
  create type public.conference_event_status as enum (
    'draft', 'open', 'closed', 'reviewing', 'completed', 'archived'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.conference_submission_status as enum (
    'received', 'under_review', 'accepted', 'rejected',
    'needs_info', 'poster_pending', 'poster_received', 'archived'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.conference_submission_modality as enum (
    'oral', 'poster', 'communication'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.conference_assignment_status as enum (
    'assigned', 'in_progress', 'completed'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.conference_review_recommendation as enum (
    'accept', 'reject', 'needs_discussion'
  );
exception
  when duplicate_object then null;
end
$$;

-- ═══════════════════════════════════════════════════════════════════
-- TABLA: conference_events
-- ═══════════════════════════════════════════════════════════════════
-- Representa una edición concreta de una jornada ACASPEX.
-- Cada evento contiene múltiples comunicaciones enviadas por autores.

create table if not exists public.conference_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  edition_label text not null,
  year integer not null check (year > 2000),
  description text,
  submission_open_at timestamptz,
  submission_close_at timestamptz,
  poster_deadline_at timestamptz,
  status public.conference_event_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.conference_events is 'Ediciones de jornadas ACASPEX. Cada registro representa una jornada concreta (ej: III Jornada ACASPEX).';
comment on column public.conference_events.slug is 'Identificador URL-friendly, único. Ejemplo: iii-jornada-acaspex.';
comment on column public.conference_events.status is 'Estado del evento: draft → open → closed → reviewing → completed → archived.';
comment on column public.conference_events.submission_open_at is 'Fecha/hora de apertura del periodo de envío de comunicaciones.';
comment on column public.conference_events.submission_close_at is 'Fecha/hora de cierre del periodo de envío de comunicaciones.';
comment on column public.conference_events.poster_deadline_at is 'Fecha/hora límite para subir póster definitivo de comunicaciones aceptadas.';

-- ═══════════════════════════════════════════════════════════════════
-- TABLA: conference_submissions
-- ═══════════════════════════════════════════════════════════════════
-- Comunicación enviada por un autor a un evento concreto.
-- Contiene datos identificativos del autor y contenido evaluable.

create table if not exists public.conference_submissions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.conference_events(id) on delete cascade,
  submission_code text not null,
  status public.conference_submission_status not null default 'received',
  title text not null,
  modality public.conference_submission_modality not null default 'poster',
  topic_area text,
  abstract_text text not null,
  authors_text text not null,
  main_author_name text not null,
  main_author_email text not null,
  main_author_phone text,
  center text,
  service_unit text,
  province text,
  file_path text,
  file_original_name text,
  file_mime_type text,
  file_size integer check (file_size is null or file_size >= 0),
  poster_file_path text,
  poster_original_name text,
  poster_uploaded_at timestamptz,
  poster_status text,
  privacy_accepted_at timestamptz not null,
  communication_consent boolean not null default false,
  admin_notes text,
  review_notes text,
  resolution_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conference_submissions_event_code_unique unique (event_id, submission_code)
);

comment on table public.conference_submissions is 'Comunicaciones enviadas a jornadas ACASPEX. Cada registro es un envío con código único por evento.';
comment on column public.conference_submissions.submission_code is 'Código generado automáticamente: P001, P002, etc. Único por evento.';
comment on column public.conference_submissions.status is 'Estado: received → under_review → accepted/rejected. Póster: poster_pending → poster_received.';
comment on column public.conference_submissions.authors_text is 'Lista completa de autores en texto libre. Datos identificativos, no visible para evaluadores.';
comment on column public.conference_submissions.main_author_name is 'Nombre del autor principal. Dato identificativo, no visible para evaluadores.';
comment on column public.conference_submissions.main_author_email is 'Email del autor principal. Dato identificativo, no visible para evaluadores.';
comment on column public.conference_submissions.file_path is 'Ruta en bucket Storage del abstract original subido por el autor.';
comment on column public.conference_submissions.privacy_accepted_at is 'Fecha y hora en que el autor aceptó la política de privacidad.';
comment on column public.conference_submissions.admin_notes is 'Notas internas de administración. No visible para autores ni evaluadores.';
comment on column public.conference_submissions.review_notes is 'Notas del proceso de evaluación. Visible para admin.';

-- ═══════════════════════════════════════════════════════════════════
-- TABLA: conference_reviewers
-- ═══════════════════════════════════════════════════════════════════
-- Persona del comité científico. No es obligatoriamente socio ni junta.
-- profile_id es nullable porque evaluadores externos pueden no tener cuenta.
-- Unicidad de email: índice único case-insensitive via lower(email).

create table if not exists public.conference_reviewers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  institution text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.conference_reviewers is 'Evaluadores del comité científico. Pueden ser internos (con profile) o externos (sin profile).';
comment on column public.conference_reviewers.profile_id is 'Referencia a profiles si el evaluador tiene cuenta en el portal. Null si es externo.';
comment on column public.conference_reviewers.email is 'Email del evaluador. Único (case-insensitive via lower(email)).';
comment on column public.conference_reviewers.is_active is 'Si el evaluador está activo para recibir asignaciones de evaluación.';

-- ═══════════════════════════════════════════════════════════════════
-- TABLA: conference_submission_assignments
-- ═══════════════════════════════════════════════════════════════════
-- Vincula una comunicación con un evaluador para evaluación ciega.
-- updated_at incluido porque status cambia: assigned → in_progress → completed.

create table if not exists public.conference_submission_assignments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.conference_submissions(id) on delete cascade,
  reviewer_id uuid not null references public.conference_reviewers(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles(id) on delete set null,
  status public.conference_assignment_status not null default 'assigned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conference_assignments_submission_reviewer_unique unique (submission_id, reviewer_id)
);

comment on table public.conference_submission_assignments is 'Asignaciones de comunicaciones a evaluadores. Cada asignación vincula una submission con un reviewer.';
comment on column public.conference_submission_assignments.assigned_by is 'Administrador que realizó la asignación.';
comment on column public.conference_submission_assignments.status is 'Estado: assigned → in_progress → completed.';

-- ═══════════════════════════════════════════════════════════════════
-- TABLA: conference_submission_reviews
-- ═══════════════════════════════════════════════════════════════════
-- Evaluación científica realizada por un evaluador sobre una comunicación.

create table if not exists public.conference_submission_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.conference_submissions(id) on delete cascade,
  reviewer_id uuid not null references public.conference_reviewers(id) on delete cascade,
  score_relevance integer check (score_relevance between 1 and 5),
  score_methodology integer check (score_methodology between 1 and 5),
  score_impact integer check (score_impact between 1 and 5),
  score_clarity integer check (score_clarity between 1 and 5),
  comments text,
  recommendation public.conference_review_recommendation,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conference_reviews_submission_reviewer_unique unique (submission_id, reviewer_id)
);

comment on table public.conference_submission_reviews is 'Evaluaciones científicas. Cada evaluador puede hacer un solo review por comunicación.';
comment on column public.conference_submission_reviews.score_relevance is 'Puntuación de relevancia: 1 (baja) a 5 (muy alta).';
comment on column public.conference_submission_reviews.score_methodology is 'Puntuación de metodología: 1 (baja) a 5 (muy alta).';
comment on column public.conference_submission_reviews.score_impact is 'Puntuación de impacto: 1 (bajo) a 5 (muy alto).';
comment on column public.conference_submission_reviews.score_clarity is 'Puntuación de claridad: 1 (baja) a 5 (muy alta).';
comment on column public.conference_submission_reviews.recommendation is 'Recomendación del evaluador: accept, reject o needs_discussion.';

-- ═══════════════════════════════════════════════════════════════════
-- TABLA: conference_event_counters
-- ═══════════════════════════════════════════════════════════════════
-- Contador de códigos de comunicación por evento.
-- Se usa para generar P001, P002, etc. de forma segura y atómica.

create table if not exists public.conference_event_counters (
  event_id uuid primary key references public.conference_events(id) on delete cascade,
  next_code integer not null default 1 check (next_code >= 1),
  updated_at timestamptz not null default now()
);

comment on table public.conference_event_counters is 'Contador de códigos de comunicación por evento. Usado para generar P001, P002, etc.';
comment on column public.conference_event_counters.next_code is 'Siguiente código a asignar. Empieza en 1 (P001). Se incrementa atómicamente.';

-- ═══════════════════════════════════════════════════════════════════
-- ÍNDICES
-- ═══════════════════════════════════════════════════════════════════

-- conference_events (3)
create index if not exists idx_conference_events_slug on public.conference_events(slug);
create index if not exists idx_conference_events_status on public.conference_events(status);
create index if not exists idx_conference_events_year on public.conference_events(year);

-- conference_submissions (5)
create index if not exists idx_conference_submissions_event_id on public.conference_submissions(event_id);
create index if not exists idx_conference_submissions_submission_code on public.conference_submissions(submission_code);
create index if not exists idx_conference_submissions_status on public.conference_submissions(status);
create index if not exists idx_conference_submissions_modality on public.conference_submissions(modality);
create index if not exists idx_conference_submissions_created_at on public.conference_submissions(created_at);

-- conference_reviewers (3: 1 unique case-insensitive + 2 non-unique)
create unique index if not exists idx_conference_reviewers_email_unique
  on public.conference_reviewers (lower(email));
create index if not exists idx_conference_reviewers_profile_id on public.conference_reviewers(profile_id);
create index if not exists idx_conference_reviewers_is_active on public.conference_reviewers(is_active);

-- conference_submission_assignments (3)
create index if not exists idx_conference_assignments_submission_id on public.conference_submission_assignments(submission_id);
create index if not exists idx_conference_assignments_reviewer_id on public.conference_submission_assignments(reviewer_id);
create index if not exists idx_conference_assignments_status on public.conference_submission_assignments(status);

-- conference_submission_reviews (2)
create index if not exists idx_conference_reviews_submission_id on public.conference_submission_reviews(submission_id);
create index if not exists idx_conference_reviews_reviewer_id on public.conference_submission_reviews(reviewer_id);

-- ═══════════════════════════════════════════════════════════════════
-- TRIGGERS updated_at
-- ═══════════════════════════════════════════════════════════════════
-- La función public.set_updated_at() ya existe (migración 001).
-- Solo se crean los triggers para las nuevas tablas.

drop trigger if exists set_conference_events_updated_at on public.conference_events;
create trigger set_conference_events_updated_at
before update on public.conference_events
for each row execute function public.set_updated_at();

drop trigger if exists set_conference_submissions_updated_at on public.conference_submissions;
create trigger set_conference_submissions_updated_at
before update on public.conference_submissions
for each row execute function public.set_updated_at();

drop trigger if exists set_conference_reviewers_updated_at on public.conference_reviewers;
create trigger set_conference_reviewers_updated_at
before update on public.conference_reviewers
for each row execute function public.set_updated_at();

drop trigger if exists set_conference_submission_assignments_updated_at on public.conference_submission_assignments;
create trigger set_conference_submission_assignments_updated_at
before update on public.conference_submission_assignments
for each row execute function public.set_updated_at();

drop trigger if exists set_conference_submission_reviews_updated_at on public.conference_submission_reviews;
create trigger set_conference_submission_reviews_updated_at
before update on public.conference_submission_reviews
for each row execute function public.set_updated_at();

drop trigger if exists set_conference_event_counters_updated_at on public.conference_event_counters;
create trigger set_conference_event_counters_updated_at
before update on public.conference_event_counters
for each row execute function public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en B02
-- ═══════════════════════════════════════════════════════════════════
-- - RLS policies (van en B05)
-- - RLS enabled (van en B05)
-- - Storage bucket (va en B04)
-- - Storage policies (van en B06)
-- - Función/trigger de generación código P001 (va en B03)
-- - Edge Functions (van en B09)
-- - Rol comite_cientifico (va en B10)
-- - Datos reales
-- - Secrets, tokens, service_role
