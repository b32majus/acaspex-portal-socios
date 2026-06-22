-- ACASPEX Portal Socios — schema base Supabase staging
-- H0.1: estructura inicial sin RLS, sin policies, sin buckets y sin seed data.
-- Ejecutar solo tras revisión explícita. No contiene datos reales.

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('socio', 'junta_directiva', 'administrador');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.document_type as enum ('DNI', 'NIE', 'Pasaporte');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.member_profile as enum ('general', 'residente', 'estudiante', 'jubilado');
exception
  when duplicate_object then null;
end
$$;


do $$
begin
  create type public.member_status as enum ('pending_review', 'active', 'expired', 'inactive', 'cancelled');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.signup_request_status as enum ('pending_review', 'needs_info', 'approved', 'rejected');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_method as enum ('bank_transfer');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_status as enum ('pending', 'validated', 'rejected');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.membership_period_status as enum ('active', 'expired', 'cancelled');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.resource_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.resource_type as enum ('pdf', 'video', 'presentation', 'template', 'link', 'document', 'other');
exception
  when duplicate_object then null;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  member_number text unique,
  first_name text not null,
  last_name_1 text not null,
  last_name_2 text,
  document_type public.document_type,
  document_number text,
  document_number_normalized text,
  address_line text,
  postal_code text,
  city text,
  province text,
  email text not null,
  email_normalized text not null,
  phone text,
  professional_category text,
  job_title text,
  organization text,
  quality_safety_link text,
  member_profile public.member_profile not null default 'general',
  reduced_fee_accreditation_file_path text,
  status public.member_status not null default 'pending_review',
  fee_amount numeric(10,2),
  membership_start date,
  paid_until date,
  communication_consent boolean not null default false,
  privacy_accepted_at timestamptz,
  legacy_member_number text,
  legacy_source text,
  legacy_import_batch text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_email_normalized_lower_chk check (email_normalized = lower(btrim(email_normalized))),
  constraint members_document_number_normalized_upper_chk check (
    document_number_normalized is null or document_number_normalized = upper(btrim(document_number_normalized))
  ),
  constraint members_fee_amount_non_negative_chk check (fee_amount is null or fee_amount >= 0)
);

comment on table public.members is 'Socios ACASPEX. Preparada para datos sintéticos en staging y migración futura desde Excel real solo en proyecto final.';
comment on column public.members.document_number_normalized is 'Identificador fuerte normalizado para detección de duplicidades; conflictos sensibles se revisan por administración.';
comment on column public.members.email_normalized is 'Identificador secundario normalizado para búsquedas y detección de duplicidades.';
comment on column public.members.member_profile is 'Perfil de socio: general implica cuota general; residente, estudiante y jubilado implican cuota reducida y acreditación en fase lógica posterior.';
comment on column public.members.fee_amount is 'Importe de cuota aplicable derivado del member_profile y validado por administración.';
comment on column public.members.reduced_fee_accreditation_file_path is 'Ruta privada en Storage para acreditación de perfiles residente, estudiante o jubilado; bucket/policies se definen en H0.2 o posterior.';

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  email text not null,
  email_normalized text not null,
  role public.app_role not null default 'socio',
  is_active boolean not null default true,
  invited_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_normalized_lower_chk check (email_normalized = lower(btrim(email_normalized)))
);

comment on table public.profiles is 'Perfil de aplicación compatible con Supabase Auth. profiles.id referencia auth.users.id; no crea roles Postgres separados.';
comment on column public.profiles.role is 'Rol lógico ACASPEX: socio, junta_directiva o administrador.';

create table if not exists public.signup_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name_1 text not null,
  last_name_2 text,
  document_type public.document_type,
  document_number text,
  document_number_normalized text,
  address_line text,
  postal_code text,
  city text,
  province text,
  email text not null,
  email_normalized text not null,
  phone text,
  professional_category text,
  job_title text,
  organization text,
  quality_safety_link text,
  member_profile public.member_profile not null default 'general',
  requested_fee_amount numeric(10,2),
  receipt_file_path text,
  accreditation_file_path text,
  privacy_accepted_at timestamptz,
  communication_consent boolean not null default false,
  status public.signup_request_status not null default 'pending_review',
  admin_notes text,
  review_reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  approved_member_id uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint signup_requests_email_normalized_lower_chk check (email_normalized = lower(btrim(email_normalized))),
  constraint signup_requests_document_number_normalized_upper_chk check (
    document_number_normalized is null or document_number_normalized = upper(btrim(document_number_normalized))
  ),
  constraint signup_requests_requested_fee_amount_non_negative_chk check (
    requested_fee_amount is null or requested_fee_amount >= 0
  )
);

comment on table public.signup_requests is 'Solicitudes completas del formulario público. El MVP usa pending_review; no existe estado pending_payment.';
comment on column public.signup_requests.approved_member_id is 'Relación opcional con el socio creado al aprobar la solicitud.';
comment on column public.signup_requests.member_profile is 'Perfil solicitado: general implica cuota general; residente, estudiante y jubilado implican cuota reducida y acreditación en fase lógica posterior.';
comment on column public.signup_requests.requested_fee_amount is 'Importe de cuota solicitado/esperado, derivado del member_profile y revisable por administración.';
comment on column public.signup_requests.receipt_file_path is 'Ruta privada al justificante aportado durante el alta; Storage y policies no se crean en este archivo.';
comment on column public.signup_requests.accreditation_file_path is 'Ruta privada a la acreditación requerida para perfiles residente, estudiante o jubilado.';

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  signup_request_id uuid references public.signup_requests(id) on delete set null,
  amount numeric(10,2) not null,
  payment_method public.payment_method not null default 'bank_transfer',
  payment_status public.payment_status not null default 'pending',
  payment_period_start date not null,
  payment_period_end date not null,
  paid_until date not null,
  receipt_file_path text,
  validated_by uuid references public.profiles(id) on delete set null,
  validated_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_member_or_signup_request_chk check (
    member_id is not null or signup_request_id is not null
  ),
  constraint payments_amount_positive_chk check (amount > 0),
  constraint payments_period_order_chk check (payment_period_end >= payment_period_start),
  constraint payments_validated_metadata_chk check (
    payment_status <> 'validated' or (validated_by is not null and validated_at is not null)
  )
);

comment on table public.payments is 'Pagos por transferencia bancaria validados por administración. El MVP solo define bank_transfer; Stripe y Redsys quedan como evolución futura fuera de este schema base.';
comment on column public.payments.receipt_file_path is 'Ruta privada del justificante en Storage; visible solo para administradores cuando existan policies.';

create table if not exists public.membership_periods (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  period_start date not null,
  period_end date not null,
  status public.membership_period_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_periods_period_order_chk check (period_end >= period_start)
);

comment on table public.membership_periods is 'Ciclos de membresía/renovación de socios, vinculables opcionalmente a un pago validado.';

create table if not exists public.resource_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.resource_categories is 'Categorías del Centro de Conocimiento y Banco de Proyectos.';

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.resource_categories(id) on delete set null,
  title text not null,
  subtitle text,
  description text,
  body_text text,
  resource_type public.resource_type not null,
  status public.resource_status not null default 'draft',
  external_url text,
  file_path text,
  created_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resources_publication_metadata_chk check (
    status <> 'published' or published_at is not null
  )
);

comment on table public.resources is 'Recursos gestionados por administración. La visibilidad por rol vive en resource_visibility.';
comment on column public.resources.file_path is 'Ruta privada opcional en Storage resource-files; buckets y policies quedan fuera de H0.1.';

create table if not exists public.resource_visibility (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (resource_id, role)
);

comment on table public.resource_visibility is 'Roles lógicos que pueden ver cada recurso publicado: socio, junta_directiva y/o administrador. Sin policies en H0.1.';

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_log is 'Estructura base de auditoría. Sin policies ni triggers automáticos en H0.1; la inserción segura se definirá después.';
comment on column public.audit_log.metadata is 'JSONB para datos no sensibles de auditoría. No usar para secretos ni datos reales innecesarios.';

create index if not exists idx_members_status on public.members(status);
create index if not exists idx_members_email_normalized on public.members(email_normalized);
create index if not exists idx_members_document_number_normalized on public.members(document_number_normalized);
create index if not exists idx_members_paid_until on public.members(paid_until);
create index if not exists idx_members_legacy_import_batch on public.members(legacy_import_batch);

create index if not exists idx_profiles_member_id on public.profiles(member_id);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email_normalized on public.profiles(email_normalized);

create index if not exists idx_signup_requests_status on public.signup_requests(status);
create index if not exists idx_signup_requests_email_normalized on public.signup_requests(email_normalized);
create index if not exists idx_signup_requests_document_number_normalized on public.signup_requests(document_number_normalized);
create index if not exists idx_signup_requests_reviewed_by on public.signup_requests(reviewed_by);
create index if not exists idx_signup_requests_approved_member_id on public.signup_requests(approved_member_id);

create index if not exists idx_payments_member_id on public.payments(member_id);
create index if not exists idx_payments_signup_request_id on public.payments(signup_request_id);
create index if not exists idx_payments_payment_status on public.payments(payment_status);
create index if not exists idx_payments_paid_until on public.payments(paid_until);
create index if not exists idx_payments_validated_by on public.payments(validated_by);

create index if not exists idx_membership_periods_member_id on public.membership_periods(member_id);
create index if not exists idx_membership_periods_payment_id on public.membership_periods(payment_id);
create index if not exists idx_membership_periods_status on public.membership_periods(status);
create index if not exists idx_membership_periods_period_end on public.membership_periods(period_end);

create index if not exists idx_resource_categories_slug on public.resource_categories(slug);
create index if not exists idx_resource_categories_sort_order on public.resource_categories(sort_order);

create index if not exists idx_resources_category_id on public.resources(category_id);
create index if not exists idx_resources_status on public.resources(status);
create index if not exists idx_resources_resource_type on public.resources(resource_type);
create index if not exists idx_resources_published_at on public.resources(published_at);
create index if not exists idx_resources_created_by on public.resources(created_by);

create index if not exists idx_resource_visibility_resource_id on public.resource_visibility(resource_id);
create index if not exists idx_resource_visibility_role on public.resource_visibility(role);

create index if not exists idx_audit_log_actor_id on public.audit_log(actor_id);
create index if not exists idx_audit_log_entity on public.audit_log(entity);
create index if not exists idx_audit_log_entity_id on public.audit_log(entity_id);
create index if not exists idx_audit_log_created_at on public.audit_log(created_at);

drop trigger if exists set_members_updated_at on public.members;
create trigger set_members_updated_at
before update on public.members
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_signup_requests_updated_at on public.signup_requests;
create trigger set_signup_requests_updated_at
before update on public.signup_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists set_membership_periods_updated_at on public.membership_periods;
create trigger set_membership_periods_updated_at
before update on public.membership_periods
for each row execute function public.set_updated_at();

drop trigger if exists set_resource_categories_updated_at on public.resource_categories;
create trigger set_resource_categories_updated_at
before update on public.resource_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
before update on public.resources
for each row execute function public.set_updated_at();
