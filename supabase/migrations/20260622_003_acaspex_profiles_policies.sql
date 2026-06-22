-- ACASPEX Portal Socios — Policies RLS para profiles
-- H0.2b: crea las policies mínimas de lectura, inserción y
-- actualización sobre public.profiles.
-- Depende de las funciones auxiliares creadas en H0.2a
-- (20260622_002_acaspex_rls_baseline.sql).
-- No crea policies para ninguna otra tabla.
-- Ejecutar solo tras revisión explícita.

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — lectura del propio perfil + lectura admin global
-- ═══════════════════════════════════════════════════════════════════
-- Cada usuario autenticado puede leer su propio profile.
-- Los administradores pueden leer todos los profiles.
-- Se usa una policy combinada para evitar duplicación.

create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  using (
    auth.uid() = id
    or
    public.is_admin()
  );

comment on policy "profiles_select_own_or_admin" on public.profiles is
  'El usuario ve su propio perfil; los administradores ven todos.';

-- ═══════════════════════════════════════════════════════════════════
-- INSERT — solo administradores desde cliente
-- ═══════════════════════════════════════════════════════════════════
-- La inserción de perfiles está reservada a administradores.
-- El primer administrador se crea por SQL manual o service role
-- durante el setup inicial; esta WO no resuelve bootstrap.
-- Service role y SQL Editor de Supabase pueden bypass RLS para
-- setup controlado.

create policy "profiles_insert_admin"
  on public.profiles
  for insert
  with check (
    public.is_admin()
  );

comment on policy "profiles_insert_admin" on public.profiles is
  'Solo administradores crean perfiles. Bootstrap del primer admin por service role / SQL manual.';

-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — solo administradores desde cliente
-- ═══════════════════════════════════════════════════════════════════
-- Profiles contiene campos sensibles (role, is_active, member_id,
-- email_normalized). La autogestión por parte del socio, si llega a
-- ser necesaria, se implementará en una WO posterior con una policy
-- o función específica de campos acotados.

create policy "profiles_update_admin"
  on public.profiles
  for update
  using (
    public.is_admin()
  )
  with check (
    public.is_admin()
  );

comment on policy "profiles_update_admin" on public.profiles is
  'Solo administradores actualizan perfiles. La autogestión del socio (campos acotados) queda pendiente de WO posterior si se requiere.';

-- ═══════════════════════════════════════════════════════════════════
-- DELETE — sin policy
-- ═══════════════════════════════════════════════════════════════════
-- En MVP los perfiles no se borran desde cliente. Se desactivan
-- mediante is_active = false. No se crea policy de DELETE.

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.2b
-- ═══════════════════════════════════════════════════════════════════
-- - Policies para otras tablas (members, signup_requests, etc.)
-- - Policy de DELETE sobre profiles
-- - Autogestión de perfil por parte del socio
-- - Bootstrap automático del primer administrador
-- - Storage, buckets, seed, datos sintéticos
