-- ACASPEX Portal Socios — Policies RLS para signup_requests
-- H0.2d: crea las policies mínimas de inserción, lectura y
-- actualización sobre public.signup_requests.
-- Depende de las funciones auxiliares de H0.2a.
-- No crea policies para ninguna otra tabla.
-- Ejecutar solo tras revisión explícita.

-- ═══════════════════════════════════════════════════════════════════
-- INSERT — formulario público con restricciones
-- ═══════════════════════════════════════════════════════════════════
-- Permitir inserción anónima/pública de nuevas solicitudes desde el
-- formulario /hazte-socio.
-- Restricciones vía WITH CHECK:
--   - status solo puede ser 'pending_review'
--   - campos administrativos deben llegar nulos
--   - no se puede auto-asignar approved_member_id, reviewed_by, etc.
-- Sin restricciones de USING porque INSERT no evalúa filas existentes.

create policy "signup_requests_insert_public"
  on public.signup_requests
  for insert
  with check (
    status = 'pending_review'
    and approved_member_id is null
    and reviewed_by is null
    and reviewed_at is null
    and admin_notes is null
    and review_reason is null
  );

comment on policy "signup_requests_insert_public" on public.signup_requests is
  'Inserción pública desde formulario. Fuerza pending_review y bloquea campos de administración.';

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- Las solicitudes contienen datos personales completos.
-- Solo los administradores pueden leerlas.
-- Los solicitantes no consultan su solicitud directamente desde BD;
-- la confirmación se comunica por email o página de estado local.

create policy "signup_requests_select_admin"
  on public.signup_requests
  for select
  using (
    public.is_admin()
  );

comment on policy "signup_requests_select_admin" on public.signup_requests is
  'Solo administradores leen solicitudes. Los solicitantes reciben confirmación por email.';

-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- Solo administradores pueden revisar, aprobar, rechazar o pedir
-- subsanación de solicitudes. Esto incluye la escritura de
-- admin_notes, review_reason, reviewed_by, reviewed_at,
-- approved_member_id y cambios de status.

create policy "signup_requests_update_admin"
  on public.signup_requests
  for update
  using (
    public.is_admin()
  )
  with check (
    public.is_admin()
  );

comment on policy "signup_requests_update_admin" on public.signup_requests is
  'Solo administradores actualizan solicitudes (revisar, aprobar, rechazar, subsanar).';

-- ═══════════════════════════════════════════════════════════════════
-- DELETE — sin policy
-- ═══════════════════════════════════════════════════════════════════
-- En MVP las solicitudes no se borran desde cliente. Se gestionan
-- por estado (pending_review, approved, rejected, needs_info).
-- No se crea policy de DELETE.

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.2d
-- ═══════════════════════════════════════════════════════════════════
-- - Policies para otras tablas
-- - Policy de DELETE sobre signup_requests
-- - Consulta pública de estado de solicitud por el solicitante
-- - Estado pending_payment (decisión cerrada: no se usa en MVP)
-- - Storage, buckets, seed, datos sintéticos
-- - Funciones nuevas (se usan las auxiliares de H0.2a)
