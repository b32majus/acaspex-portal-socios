-- ACASPEX Portal Socios — Policies RLS para resource_visibility
-- H0.2j: crea las policies mínimas de lectura, inserción,
-- actualización y borrado sobre public.resource_visibility.
-- Depende de las funciones auxiliares de H0.2a.
-- No crea policies para ninguna otra tabla.
-- Ejecutar solo tras revisión explícita.

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- Solo administradores pueden leer las reglas de visibilidad.
-- Socios y Junta Directiva no acceden directamente a esta tabla;
-- la visibilidad efectiva se aplica a través de
-- public.resources + can_access_resource_by_visibility(id).

create policy "resource_visibility_select_admin"
  on public.resource_visibility
  for select
  using (
    public.is_admin()
  );

comment on policy "resource_visibility_select_admin" on public.resource_visibility is
  'Solo administradores leen reglas de visibilidad. Socios y Junta acceden vía resources + helper.';

-- ═══════════════════════════════════════════════════════════════════
-- INSERT — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- Solo administradores pueden asignar visibilidad de un recurso a
-- un rol.

create policy "resource_visibility_insert_admin"
  on public.resource_visibility
  for insert
  with check (
    public.is_admin()
  );

comment on policy "resource_visibility_insert_admin" on public.resource_visibility is
  'Solo administradores asignan visibilidad de recursos a roles.';

-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- Solo administradores pueden cambiar la visibilidad de un recurso
-- (modificar el rol asignado a una fila existente).

create policy "resource_visibility_update_admin"
  on public.resource_visibility
  for update
  using (
    public.is_admin()
  )
  with check (
    public.is_admin()
  );

comment on policy "resource_visibility_update_admin" on public.resource_visibility is
  'Solo administradores modifican reglas de visibilidad existentes.';

-- ═══════════════════════════════════════════════════════════════════
-- DELETE — solo administradores (excepción justificada)
-- ═══════════════════════════════════════════════════════════════════
-- resource_visibility no tiene campo status ni is_active.
-- Eliminar una fila es la forma natural de retirar visibilidad de
-- un recurso a un rol. Esta es una excepción justificada frente a
-- otras tablas del MVP donde evitamos DELETE.

create policy "resource_visibility_delete_admin"
  on public.resource_visibility
  for delete
  using (
    public.is_admin()
  );

comment on policy "resource_visibility_delete_admin" on public.resource_visibility is
  'Solo administradores eliminan reglas de visibilidad. DELETE es la forma natural de retirar acceso a un rol (sin campo status).';

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.2j
-- ═══════════════════════════════════════════════════════════════════
-- - Policies para otras tablas
-- - Acceso directo a resource_visibility por socios o Junta
-- - Funciones nuevas (se usa is_admin de H0.2a)
-- - Storage, buckets, seed, datos sintéticos
