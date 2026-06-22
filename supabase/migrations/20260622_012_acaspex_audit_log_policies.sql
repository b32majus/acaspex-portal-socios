-- ACASPEX Portal Socios — Policy RLS para audit_log
-- H0.2k: crea la policy mínima de lectura sobre public.audit_log.
-- La inserción desde cliente está bloqueada intencionadamente.
-- La escritura de auditoría se resolverá después con función segura,
-- trigger o service role.
-- Depende de las funciones auxiliares de H0.2a.
-- No crea policies para ninguna otra tabla.
-- Ejecutar solo tras revisión explícita.

-- ═══════════════════════════════════════════════════════════════════
-- SELECT — solo administradores
-- ═══════════════════════════════════════════════════════════════════
-- Solo administradores pueden leer la auditoría.
-- La auditoría refleja actividad administrativa y cambios del
-- sistema. No se expone a socios ni a Junta Directiva.

create policy "audit_log_select_admin"
  on public.audit_log
  for select
  using (
    public.is_admin()
  );

comment on policy "audit_log_select_admin" on public.audit_log is
  'Solo administradores pueden leer la auditoría del sistema.';

-- ═══════════════════════════════════════════════════════════════════
-- INSERT — sin policy
-- ═══════════════════════════════════════════════════════════════════
-- No se crea policy de INSERT.
-- Motivo: evitar que un cliente, incluso un admin desde la UI,
-- pueda insertar registros de auditoría directamente. La escritura
-- de auditoría se implementará mediante función segura (security
-- definer), trigger o service role en una fase posterior.

-- ═══════════════════════════════════════════════════════════════════
-- UPDATE — sin policy
-- ═══════════════════════════════════════════════════════════════════
-- La auditoría es append-only. No se edita desde cliente.

-- ═══════════════════════════════════════════════════════════════════
-- DELETE — sin policy
-- ═══════════════════════════════════════════════════════════════════
-- La auditoría no se borra desde cliente. Cualquier retención o
-- limpieza futura debe ser un proceso controlado.

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en H0.2k
-- ═══════════════════════════════════════════════════════════════════
-- - Policies de INSERT, UPDATE o DELETE sobre audit_log
-- - Funciones de auditoría, triggers
-- - Policies para otras tablas
-- - Storage, buckets, seed, datos sintéticos
