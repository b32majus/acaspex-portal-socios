-- ACASPEX Portal Socios — Policies RLS para payments
-- H0.2e: crea las policies mínimas de lectura, inserción y
-- actualización sobre public.payments.
-- Depende de las funciones auxiliares de H0.2a.
-- No crea policies para ninguna otra tabla.
-- Ejecutar solo tras revisión explícita.

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- La tabla payments contiene datos financieros, paths privados de
-- justificantes y notas administrativas.
-- Solo los administradores pueden leer pagos.
-- Socios y Junta Directiva NO tienen acceso a esta tabla.
-- El socio conoce su estado de membresía vía members.paid_until, no
-- desde payments.

create policy "payments_select_admin"
  on public.payments
  for select
  using (
    public.is_admin()
  );

comment on policy "payments_select_admin" on public.payments is
  'Solo administradores leen pagos. Socios y Junta Directiva sin acceso a datos financieros.';

-- ═══════════════════════════════════════════════════════════════════
-- INSERT — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- La creación de registros de pago está reservada a administradores.
-- El alta de socio puede generar un payment como parte del flujo
-- admin; no hay autoservicio de pagos.

create policy "payments_insert_admin"
  on public.payments
  for insert
  with check (
    public.is_admin()
  );

comment on policy "payments_insert_admin" on public.payments is
  'Solo administradores crean registros de pago.';

-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- Solo administradores pueden validar pagos, cambiar estado, asignar
-- validated_by/validated_at o modificar cualquier campo de la tabla.

create policy "payments_update_admin"
  on public.payments
  for update
  using (
    public.is_admin()
  )
  with check (
    public.is_admin()
  );

comment on policy "payments_update_admin" on public.payments is
  'Solo administradores actualizan pagos (validar, rechazar, modificar).';

-- ═══════════════════════════════════════════════════════════════════
-- DELETE — sin policy
-- ═══════════════════════════════════════════════════════════════════
-- En MVP no se borran pagos desde cliente. Las correcciones se
-- gestionan por estado (payment_status = rejected) y notas
-- administrativas. No se crea policy de DELETE.

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.2e
-- ═══════════════════════════════════════════════════════════════════
-- - Policies para otras tablas
-- - Policy de DELETE sobre payments
-- - Acceso a pagos por socios o Junta Directiva
-- - Acceso a justificantes (rutas privadas en receipt_file_path)
-- - Storage, buckets, seed, datos sintéticos
-- - Funciones nuevas (se usan las auxiliares de H0.2a)
