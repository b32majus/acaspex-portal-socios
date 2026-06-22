-- ACASPEX Portal Socios — Policies RLS para resources
-- H0.2i: crea las policies mínimas de lectura, inserción y
-- actualización sobre public.resources.
-- Depende de H0.2a (funciones de rol) y H0.2h-b
-- (can_access_resource_by_visibility).
-- No crea policies para ninguna otra tabla.
-- Ejecutar solo tras revisión explícita.

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — admin ve todo, no-admin solo publicados con visibilidad
-- ═══════════════════════════════════════════════════════════════════
-- Administradores leen recursos en cualquier estado (draft,
-- published, archived) para gestión completa.
-- Socios y Junta Directiva solo pueden leer recursos publicados
-- para los que can_access_resource_by_visibility(id) sea true.
-- Sin acceso anónimo.
-- file_path es un metadato de ruta privada; el acceso real al
-- archivo lo controlarán las Storage policies en H0.3.

create policy "resources_select_by_role"
  on public.resources
  for select
  using (
    public.is_admin()
    or (
      status = 'published'
      and public.can_access_resource_by_visibility(id)
    )
  );

comment on policy "resources_select_by_role" on public.resources is
  'Admin ve todos los estados; socio y Junta ven solo publicados con visibilidad asignada. Sin acceso anónimo.';

-- ═══════════════════════════════════════════════════════════════════
-- INSERT — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- La creación de recursos está reservada a administradores.
-- Solo admin puede crear drafts, asignar categorías, tipos y paths.

create policy "resources_insert_admin"
  on public.resources
  for insert
  with check (
    public.is_admin()
  );

comment on policy "resources_insert_admin" on public.resources is
  'Solo administradores crean recursos.';

-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- Solo administradores pueden editar recursos (contenido, estado,
-- categoría, path, etc.).

create policy "resources_update_admin"
  on public.resources
  for update
  using (
    public.is_admin()
  )
  with check (
    public.is_admin()
  );

comment on policy "resources_update_admin" on public.resources is
  'Solo administradores actualizan recursos.';

-- ═══════════════════════════════════════════════════════════════════
-- DELETE — sin policy
-- ═══════════════════════════════════════════════════════════════════
-- En MVP los recursos no se borran desde cliente. Se gestionan
-- mediante status = 'archived'. No se crea policy de DELETE.

-- ═══════════════════════════════════════════════════════════════════
-- Control de archivos asociados
-- ═══════════════════════════════════════════════════════════════════
-- Esta policy controla solo metadatos de la tabla resources.
-- El campo file_path contiene rutas privadas de Storage. El acceso
-- real a los archivos se protegerá con Storage policies en H0.3.
-- Ver resources con file_path != null no implica acceso al archivo.

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.2i
-- ═══════════════════════════════════════════════════════════════════
-- - Policies para resource_visibility, resource_categories u otras tablas
-- - Policy de DELETE sobre resources
-- - Storage policies (H0.3)
-- - Buckets
-- - Seed / datos sintéticos
-- - Funciones nuevas (se usan las auxiliares de H0.2a y H0.2h-b)
