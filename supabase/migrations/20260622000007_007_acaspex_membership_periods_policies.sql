-- ACASPEX Portal Socios — Policies RLS para membership_periods
-- H0.2f: crea las policies mínimas de lectura, inserción y
-- actualización sobre public.membership_periods.
-- Depende de las funciones auxiliares de H0.2a.
-- No crea policies para ninguna otra tabla.
-- Ejecutar solo tras revisión explícita.

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — propio periodo + admin global
-- ═══════════════════════════════════════════════════════════════════
-- El socio autenticado lee únicamente sus propios periodos de
-- membresía (a través de profiles.member_id con perfil activo).
-- El administrador lee todos los periodos.
-- Junta Directiva NO tiene acceso global a periodos de otros socios
-- salvo que también tenga rol administrador.

create policy "membership_periods_select_own_or_admin"
  on public.membership_periods
  for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.member_id = membership_periods.member_id
        and p.is_active = true
    )
    or
    public.is_admin()
  );

comment on policy "membership_periods_select_own_or_admin" on public.membership_periods is
  'El socio ve sus propios periodos de membresía; el administrador ve todos. Junta Directiva sin acceso global.';

-- ═══════════════════════════════════════════════════════════════════
-- INSERT — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- La creación de periodos de membresía está reservada a
-- administradores. Los periodos se crean como parte del flujo de
-- alta o renovación gestionado por admin.

create policy "membership_periods_insert_admin"
  on public.membership_periods
  for insert
  with check (
    public.is_admin()
  );

comment on policy "membership_periods_insert_admin" on public.membership_periods is
  'Solo administradores crean periodos de membresía.';

-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- Solo administradores pueden modificar periodos (cambiar estado,
-- ajustar fechas, añadir notas). No se permite autogestión del socio
-- sobre sus periodos.

create policy "membership_periods_update_admin"
  on public.membership_periods
  for update
  using (
    public.is_admin()
  )
  with check (
    public.is_admin()
  );

comment on policy "membership_periods_update_admin" on public.membership_periods is
  'Solo administradores actualizan periodos de membresía.';

-- ═══════════════════════════════════════════════════════════════════
-- DELETE — sin policy
-- ═══════════════════════════════════════════════════════════════════
-- En MVP los periodos no se borran desde cliente. Se gestionan por
-- estado (active, expired, cancelled) o corrección administrativa
-- controlada. No se crea policy de DELETE.

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.2f
-- ═══════════════════════════════════════════════════════════════════
-- - Policies para otras tablas
-- - Policy de DELETE sobre membership_periods
-- - Acceso global para Junta Directiva
-- - Autogestión de periodos por el socio
-- - Exposición de pagos o justificantes vía payment_id
-- - Storage, buckets, seed, datos sintéticos
-- - Funciones nuevas (se usan las auxiliares de H0.2a)
