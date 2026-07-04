-- ACASPEX Portal Socios — Añadir rol comite_cientifico a app_role
-- B10: añade el valor 'comite_cientifico' al enum app_role.
-- Depende de: migración 001 (creación del enum app_role).
-- No crea policies (ya creadas en B05).
-- No crea bucket (ya creado en B04-BACKEND).
-- Ejecutar solo tras revisión explícita.
-- No contiene datos reales ni secretos.

-- ═══════════════════════════════════════════════════════════════════
-- Añadir 'comite_cientifico' al enum app_role
-- ═══════════════════════════════════════════════════════════════════
-- PostgreSQL no permite eliminar valores de un enum, pero sí añadir.
-- ADD VALUE IF NOT EXISTS es idempotente: no falla si ya existe.
-- El nuevo valor se añade al final del enum (después de 'administrador').

alter type public.app_role add value if not exists 'comite_cientifico';

-- ═══════════════════════════════════════════════════════════════════
-- Contexto: enum app_role resultante
-- ═══════════════════════════════════════════════════════════════════
-- 'socio'
-- 'junta_directiva'
-- 'administrador'
-- 'comite_cientifico'  ← nuevo

-- ═══════════════════════════════════════════════════════════════════
-- Uso previsto
-- ═══════════════════════════════════════════════════════════════════
-- El rol comite_cientifico se asignará a evaluadores del comité
-- científico de jornadas ACASPEX. Permite:
-- - Acceder a la vista anonimizada de submissions (B05-BIS)
-- - Gestionar asignaciones de evaluación (B05 policies)
-- - Insertar/actualizar reviews científicas (B05 policies)
-- - No accede a datos de autoría, archivos ni configuración admin

-- ═══════════════════════════════════════════════════════════════════
-- NO creado en B10
-- ═══════════════════════════════════════════════════════════════════
-- - Asignación del rol a usuarios específicos (gestión manual o futura WO)
-- - Policies RLS (ya creadas en B05)
-- - Vista SQL anonimizada (va en B05-BIS)
-- - Storage policies (van en B06)
-- - Bucket (ya creado en B04-BACKEND)
-- - Datos reales
-- - Secrets, credenciales, .env
