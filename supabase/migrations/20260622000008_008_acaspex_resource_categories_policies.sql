-- ACASPEX Portal Socios — Policies RLS para resource_categories
-- H0.2g: crea las policies mínimas de lectura, inserción y
-- actualización sobre public.resource_categories.
-- Depende de las funciones auxiliares de H0.2a.
-- No crea policies para ninguna otra tabla.
-- Ejecutar solo tras revisión explícita.

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — según rol y estado de categoría
-- ═══════════════════════════════════════════════════════════════════
-- Administradores ven todas las categorías (activas e inactivas)
-- para poder gestionarlas.
-- Socios y Junta Directiva solo ven categorías activas.
-- No se permite lectura anónima.

create policy "resource_categories_select_authenticated"
  on public.resource_categories
  for select
  using (
    public.is_admin()
    or (
      is_active = true
      and public.is_socio_or_higher()
    )
  );

comment on policy "resource_categories_select_authenticated" on public.resource_categories is
  'Admins ven todas las categorías; socios y Junta Directiva solo las activas. Sin acceso anónimo.';

-- ═══════════════════════════════════════════════════════════════════
-- INSERT — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- La creación de categorías está reservada a administradores.

create policy "resource_categories_insert_admin"
  on public.resource_categories
  for insert
  with check (
    public.is_admin()
  );

comment on policy "resource_categories_insert_admin" on public.resource_categories is
  'Solo administradores crean categorías de recursos.';

-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- Solo administradores pueden modificar categorías (nombre, orden,
-- activación).

create policy "resource_categories_update_admin"
  on public.resource_categories
  for update
  using (
    public.is_admin()
  )
  with check (
    public.is_admin()
  );

comment on policy "resource_categories_update_admin" on public.resource_categories is
  'Solo administradores actualizan categorías de recursos.';

-- ═══════════════════════════════════════════════════════════════════
-- DELETE — sin policy
-- ═══════════════════════════════════════════════════════════════════
-- En MVP las categorías no se borran desde cliente. Se podrán
-- desactivar con is_active = false o gestionar por SQL/admin
-- controlado más adelante. No se crea policy de DELETE.

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.2g
-- ═══════════════════════════════════════════════════════════════════
-- - Policies para otras tablas
-- - Policy de DELETE sobre resource_categories
-- - Acceso anónimo a categorías
-- - Storage, buckets, seed, datos sintéticos
-- - Funciones nuevas (se usan las auxiliares de H0.2a)
