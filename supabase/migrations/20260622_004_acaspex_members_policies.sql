-- ACASPEX Portal Socios — Policies RLS para members
-- H0.2c: crea las policies mínimas de lectura, inserción y
-- actualización sobre public.members.
-- Depende de las funciones auxiliares de H0.2a y de la existencia
-- de public.profiles con member_id enlazado para la policy de
-- lectura del propio socio.
-- No crea policies para ninguna otra tabla.
-- Ejecutar solo tras revisión explícita.

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — propio socio + admin global
-- ═══════════════════════════════════════════════════════════════════
-- El socio autenticado lee únicamente su propia ficha de miembro
-- (a través de profiles.member_id = members.id con perfil activo).
-- El administrador lee todos los miembros.
-- Junta Directiva NO tiene acceso global a datos personales de
-- socios salvo que también tenga rol administrador.

create policy "members_select_own_or_admin"
  on public.members
  for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.member_id = members.id
        and p.is_active = true
    )
    or
    public.is_admin()
  );

comment on policy "members_select_own_or_admin" on public.members is
  'El socio ve su propia ficha de miembro; el administrador ve todos. Junta Directiva sin acceso global a datos personales.';

-- ═══════════════════════════════════════════════════════════════════
-- INSERT — solo administradores desde cliente
-- ═══════════════════════════════════════════════════════════════════
-- La creación de miembros está reservada a administradores.
-- El alta de socio se gestiona desde el flujo admin, no desde
-- autoservicio.

create policy "members_insert_admin"
  on public.members
  for insert
  with check (
    public.is_admin()
  );

comment on policy "members_insert_admin" on public.members is
  'Solo administradores crean miembros. El alta se gestiona desde el flujo admin.';

-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — solo administradores desde cliente
-- ═══════════════════════════════════════════════════════════════════
-- Members contiene datos personales, de contacto, documento, cuota y
-- estado. La autogestión del socio sobre su ficha, si llega a ser
-- necesaria, se implementará en WO posterior con política o función
-- específica de campos acotados.

create policy "members_update_admin"
  on public.members
  for update
  using (
    public.is_admin()
  )
  with check (
    public.is_admin()
  );

comment on policy "members_update_admin" on public.members is
  'Solo administradores actualizan miembros. Autogestión del socio pendiente de WO posterior si se requiere.';

-- ═══════════════════════════════════════════════════════════════════
-- DELETE — sin policy
-- ═══════════════════════════════════════════════════════════════════
-- En MVP los miembros no se borran desde cliente. Se gestionan
-- mediante el campo status (active, inactive, cancelled, etc.).
-- No se crea policy de DELETE.

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.2c
-- ═══════════════════════════════════════════════════════════════════
-- - Policies para otras tablas (signup_requests, payments, etc.)
-- - Policy de DELETE sobre members
-- - Autogestión de ficha por el socio
-- - Acceso de Junta Directiva a datos de otros socios
-- - Storage, buckets, seed, datos sintéticos
-- - Funciones nuevas (se usan las auxiliares de H0.2a)
