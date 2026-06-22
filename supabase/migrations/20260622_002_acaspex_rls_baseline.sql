-- ACASPEX Portal Socios — RLS baseline + helper functions
-- H0.2a: activa Row Level Security en todas las tablas y define funciones
-- auxiliares de rol para policies posteriores.
-- No crea policies funcionales, storage, seed ni datos.
-- Ejecutar solo tras revisión explícita.

-- ═══════════════════════════════════════════════════════════════════
-- 1. Funciones auxiliares de rol
-- ═══════════════════════════════════════════════════════════════════
-- Estas funciones se usarán como building blocks en las policies
-- de los siguientes micro-WOs (H0.2b, H0.2c, H0.2d). No crean
-- accesos por sí mismas.

-- 1.1  current_app_role() — rol lógico del usuario autenticado
--      Devuelve el rol desde public.profiles para auth.uid().
--      Retorna null si no hay usuario autenticado o el perfil no
--      está activo.

create or replace function public.current_app_role()
returns public.app_role
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.app_role;
begin
  select role into v_role
  from public.profiles
  where id = auth.uid()
    and is_active = true;
  return v_role;
end;
$$;

comment on function public.current_app_role() is
  'Rol lógico ACASPEX del usuario autenticado. Null si no hay sesión o perfil inactivo. Se usa en policies RLS posteriores.';

-- 1.2  is_admin() — true si el rol es administrador

create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.current_app_role() = 'administrador';
end;
$$;

comment on function public.is_admin() is
  'True si current_app_role() = administrador. Se usará en policies RLS de escritura/gestión.';

-- 1.3  is_junta_or_admin() — true si el rol es junta_directiva o administrador

create or replace function public.is_junta_or_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.current_app_role() in ('junta_directiva', 'administrador');
end;
$$;

comment on function public.is_junta_or_admin() is
  'True si el rol es junta_directiva o administrador. Se usará en policies de lectura de recursos exclusivos.';

-- 1.4  is_socio_or_higher() — true si el rol es socio, junta_directiva o administrador

create or replace function public.is_socio_or_higher()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.current_app_role() in ('socio', 'junta_directiva', 'administrador');
end;
$$;

comment on function public.is_socio_or_higher() is
  'True si current_app_role() es socio, junta_directiva o administrador. Se usará como guarda base de acceso al portal.';

-- ═══════════════════════════════════════════════════════════════════
-- 2. Activar Row Level Security
-- ═══════════════════════════════════════════════════════════════════
-- RLS queda activado en todas las tablas. Sin policies funcionales,
-- el acceso desde clientes queda cerrado por defecto.
-- Las policies reales se crearán en micro-WOs posteriores:
--   H0.2b  profiles / members / signup_requests / payments
--   H0.2c  resources / resource_visibility
--   H0.2d  audit_log
--   H0.3   storage

alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.signup_requests enable row level security;
alter table public.payments enable row level security;
alter table public.membership_periods enable row level security;
alter table public.resource_categories enable row level security;
alter table public.resources enable row level security;
alter table public.resource_visibility enable row level security;
alter table public.audit_log enable row level security;

-- ═══════════════════════════════════════════════════════════════════
-- Advertencias
-- ═══════════════════════════════════════════════════════════════════
-- * RLS está ACTIVADO en todas las tablas.
-- * NO hay policies funcionales creadas todavía → todas las consultas
--   desde clientes autenticados devolverán cero filas (denegación por
--   defecto de PostgreSQL RLS).
-- * La ejecución de este script DEBE ir seguida de la creación de
--   policies en H0.2b, H0.2c y H0.2d antes de conectar el frontend.
-- * Sin policies de lectura, ni siquiera los administradores podrán
--   ver datos desde el cliente Supabase.

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.2a (se crearán en micro-WOs posteriores)
-- ═══════════════════════════════════════════════════════════════════
-- - Policies de lectura/escritura por tabla (H0.2b, H0.2c, H0.2d)
-- - Storage policies (H0.3)
-- - Buckets de Supabase Storage
-- - Seed / datos sintéticos
-- - Inserts de prueba
-- - Triggers de auditoría
-- - Funciones de inserción de audit_log
-- - Conexión con frontend
