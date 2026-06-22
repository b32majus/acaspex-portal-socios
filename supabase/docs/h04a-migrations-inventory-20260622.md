# Inventario de migraciones Supabase ACASPEX 001–018

**Status:** pending_review
**Fecha:** 2026-06-22

> Este documento no ejecuta nada. No contiene datos reales ni secrets. Solo sirve para preparar ejecución manual.

## Tabla de migraciones

| Orden | Archivo | Bloque funcional | Qué crea/modifica | Dependencias previas | Riesgo si se ejecuta fuera de orden | Estado esperado |
|-------|---------|------------------|-------------------|---------------------|-------------------------------------|-----------------|
| 001 | `2026062200001_001_acaspex_schema.sql` | Schema base | Extensiones pgcrypto, 10 tipos enum, función `set_updated_at()`, tablas: members, profiles, signup_requests, payments, membership_periods, resource_categories, resources, resource_visibility, audit_log | Ninguna | Error: tipos o tablas no existen al crear policies | Creado |
| 002 | `2026062200002_002_acaspex_rls_baseline.sql` | RLS baseline + helpers | 4 funciones de rol (`current_app_role`, `is_admin`, `is_junta_or_admin`, `is_socio_or_higher`), RLS activado en 9 tablas | 001 | Error: funciones no disponibles para policies | Creado |
| 003 | `2026062200003_003_acaspex_profiles_policies.sql` | RLS policies | 3 policies sobre `profiles`: SELECT own-or-admin, INSERT/UPDATE admin-only | 001, 002 | Policies ignoran roles no existentes | Creado |
| 004 | `2026062200004_004_acaspex_members_policies.sql` | RLS policies | 3 policies sobre `members`: SELECT own-or-admin, INSERT/UPDATE admin-only | 001, 002 | Sin acceso a datos de socio | Creado |
| 005 | `2026062200005_005_acaspex_signup_requests_policies.sql` | RLS policies | 3 policies sobre `signup_requests`: INSERT público con `WITH CHECK` restrictivo, SELECT/UPDATE admin-only | 001, 002 | Formulario público no puede insertar solicitudes | Creado |
| 006 | `2026062200006_006_acaspex_payments_policies.sql` | RLS policies | 3 policies sobre `payments`: todas admin-only | 001, 002 | Sin acceso a datos de pago | Creado |
| 007 | `2026062200007_007_acaspex_membership_periods_policies.sql` | RLS policies | 3 policies sobre `membership_periods`: SELECT own-or-admin, INSERT/UPDATE admin-only | 001, 002 | Sin acceso a períodos de membresía | Creado |
| 008 | `2026062200008_008_acaspex_resource_categories_policies.sql` | RLS policies | 3 policies sobre `resource_categories`: SELECT autenticado (admin ve todo, socio/junta solo activas), INSERT/UPDATE admin-only | 001, 002 | Categorías inaccesibles | Creado |
| 009 | `2026062200009_009_acaspex_resource_access_helpers.sql` | Helper | Función `can_access_resource_by_visibility(p_resource_id uuid)` — security definer | 001, 002 | Error en policies de resources (010) y resource files (018) | Creado |
| 010 | `2026062200010_010_acaspex_resources_policies.sql` | RLS policies | 3 policies sobre `resources`: SELECT admin-all o published+visibilidad, INSERT/UPDATE admin-only | 001, 002, 009 | Recursos inaccesibles para socios | Creado |
| 011 | `2026062200011_011_acaspex_resource_visibility_policies.sql` | RLS policies | 4 policies sobre `resource_visibility`: todas admin-only (incluye DELETE) | 001, 002 | Tabla de visibilidad expuesta | Creado |
| 012 | `2026062200012_012_acaspex_audit_log_policies.sql` | RLS policies | 1 policy sobre `audit_log`: SELECT admin-only. Sin INSERT/UPDATE/DELETE | 001, 002 | Auditoría expuesta (solo si hay datos) | Creado |
| 013 | `2026062200013_013_acaspex_storage_buckets.sql` | Storage buckets | 3 buckets privados: `acaspex-payment-receipts`, `acaspex-reduced-fee-accreditations`, `acaspex-resource-files`. Idempotente con `on conflict do update` | Ninguna (Storage interno Supabase) | Buckets no disponibles para Storage policies | Creado |
| 014 | `2026062200014_014_acaspex_storage_payment_receipts_public_upload_policy.sql` | Storage policy | 1 policy INSERT público sobre `storage.objects` para bucket `acaspex-payment-receipts` con regex estricto de ruta | 013 | No se puede subir justificante durante el alta | Creado |
| 015 | `2026062200015_015_acaspex_storage_payment_receipts_admin_policies.sql` | Storage policies | 4 policies admin-only sobre `storage.objects` para bucket `acaspex-payment-receipts` | 013, 002 (funciones) | Admin no puede gestionar justificantes | Creado |
| 016 | `2026062200016_016_acaspex_storage_reduced_fee_accreditations_policies.sql` | Storage policies | 4 policies admin-only sobre `storage.objects` para bucket `acaspex-reduced-fee-accreditations` | 013, 002 | Admin no puede gestionar acreditaciones | Creado |
| 017 | `2026062200017_017_acaspex_storage_resource_file_helpers.sql` | Helper | Función `can_access_resource_file_object(p_object_name text)` — security definer | 001, 002, 009 | Error en policies de resource files (018) | Creado |
| 018 | `2026062200018_018_acaspex_storage_resource_files_policies.sql` | Storage policies | 4 policies sobre `storage.objects` para bucket `acaspex-resource-files`. SELECT con helper de visibilidad, INSERT/UPDATE/DELETE admin-only | 013, 002, 017 | Archivos de recursos inaccesibles | Creado |

## Resumen por bloques

| Bloque | Migraciones | Contenido |
|--------|-------------|-----------|
| 1 — Schema | 001 | Tipos, tablas, extensiones |
| 2 — RLS | 002–012 | Funciones de rol, RLS activation, policies por tabla |
| 3 — Storage | 013–018 | Buckets, helpers, Storage policies |

---

*Status: pending_review*
