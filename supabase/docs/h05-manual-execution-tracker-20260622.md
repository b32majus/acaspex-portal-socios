# H0.5 — Tracking de ejecución manual Supabase staging ACASPEX

**Status:** `h05_staging_verified_ready_for_h06`
**Fecha inicio:** 2026-06-22
**Fecha fin:** 2026-06-23

---

## Aviso inicial

- Este documento es solo un tracker. **No ejecuta SQL.**
- La ejecución la realiza **Sil manualmente** en Supabase SQL Editor.
- KairOS no ejecuta SQL, no recibe credenciales, no se conecta a Supabase.
- No se introducen datos reales en esta fase.

---

## Preflight manual

| # | Ítem | ✅ |
|---|------|----|
| 1 | Estoy en el proyecto Supabase **staging** correcto | ✅ |
| 2 | No estoy en producción | ✅ |
| 3 | No hay datos reales cargados en la base de datos | ✅ |
| 4 | Tengo abiertas las migraciones 001–018 (carpeta `supabase/migrations/`) | ✅ |
| 5 | Tengo abierta la guía `h04e-sil-manual-sql-editor-guide-20260622.md` | ✅ |
| 6 | Tengo abiertas las queries de verificación `h04d-post-execution-verification-queries-20260622.sql` | ✅ |
| 7 | Si una migración falla, **paro.** No ejecuto la siguiente | ✅ |
| 8 | Si algo falla, pego el error completo en la conversación con Cora | ✅ |

---

## Tracking de migraciones 001–018

| # | Archivo | Bloque | Estado | Fecha-hora | Resultado (pegado por Sil) | Acción siguiente | Notas Cora |
|---|---------|--------|--------|------------|---------------------------|------------------|------------|
| 001 | `001_acaspex_schema.sql` | Schema base | ✅ OK | 2026-06-22 | Aplicada vía CLI (KairOS) | | |
| 002 | `002_acaspex_rls_baseline.sql` | RLS baseline | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 003 | `003_acaspex_profiles_policies.sql` | RLS profiles | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 004 | `004_acaspex_members_policies.sql` | RLS members | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 005 | `005_acaspex_signup_requests_policies.sql` | RLS signup_requests | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 006 | `006_acaspex_payments_policies.sql` | RLS payments | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 007 | `007_acaspex_membership_periods_policies.sql` | RLS membership_periods | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 008 | `008_acaspex_resource_categories_policies.sql` | RLS resource_categories | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 009 | `009_acaspex_resource_access_helpers.sql` | Helper | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 010 | `010_acaspex_resources_policies.sql` | RLS resources | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 011 | `011_acaspex_resource_visibility_policies.sql` | RLS resource_visibility | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 012 | `012_acaspex_audit_log_policies.sql` | RLS audit_log | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 013 | `013_acaspex_storage_buckets.sql` | Storage buckets | ✅ OK | 2026-06-22 | Aplicada vía CLI | | |
| 014 | `014_acaspex_storage_payment_receipts_public_upload_policy.sql` | Storage upload público | ✅ OK | 2026-06-23 | Aplicada vía CLI (H0.5-remote-apply-v3) | | Fix3: retirado COMMENT ON POLICY |
| 015 | `015_acaspex_storage_payment_receipts_admin_policies.sql` | Storage admin receipts | ✅ OK | 2026-06-23 | Aplicada vía CLI (H0.5-remote-apply-v3) | | |
| 016 | `016_acaspex_storage_reduced_fee_accreditations_policies.sql` | Storage acreditaciones | ✅ OK | 2026-06-23 | Aplicada vía CLI (H0.5-remote-apply-v3) | | |
| 017 | `017_acaspex_storage_resource_file_helpers.sql` | Helper | ✅ OK | 2026-06-23 | Aplicada vía CLI (H0.5-remote-apply-v3) | | |
| 018 | `018_acaspex_storage_resource_files_policies.sql` | Storage resource files | ✅ OK | 2026-06-23 | Aplicada vía CLI (H0.5-remote-apply-v3) | | |

**Leyenda:** ⬜ pendiente | ✅ OK | ❌ error | ⏭️ omitida (dependencia previa falló)

---

## Tracking de verificación post-ejecución

| Bloque verificado | Query H0.4d | Estado | Resultado observado | Incidencias | Notas Cora |
|-------------------|-------------|--------|---------------------|-------------|------------|
| Tablas creadas (9) | Bloque 1 | ✅ | 9 public tables | — | |
| Enums/tipos | Bloque 2 | ✅ | 10 public enums | — | |
| RLS activado (9 tablas) | Bloque 3 | ✅ | 9 rls_enabled_tables | — | |
| Policies de tablas | Bloques 4, 4a | ✅ | 26 public table policies | Corregido: conteo real 26, no 31 | profiles:3, members:3, signup_requests:3, payments:3, membership_periods:3, resource_categories:3, resources:3, resource_visibility:4, audit_log:1 |
| Funciones auxiliares (6) | Bloques 5, 5a | ✅ | 6 helper_functions, 6 security_definer | — | |
| Buckets Storage (3) | Bloque 6 | ✅ | 3 acaspex_storage_buckets | — | |
| Buckets privados | Bloque 6a | ✅ | 3 private_acaspex_storage_buckets | — | |
| Policies Storage | Bloques 7, 7a | ✅ | 13 acaspex_storage_policies | — | |

---

## Protocolo de parada

Si aparece **cualquier error** en una migración:

1. **Parar inmediatamente.** No ejecutar la siguiente migración.
2. **Copiar el mensaje de error completo** (todo el texto rojo del SQL Editor).
3. **Pegarlo en conversación con Cora** (ChatGPT o Telegram).
4. **No corregir SQL manualmente** sobre la marcha.
5. **No borrar nada manualmente** (`drop table`, `drop policy`, etc.).
6. **No recrear staging** sin decidirlo explícitamente con Cora.
7. **Consultar `h04f-staging-rollback-plan-20260622.md`** para orientación.

---

## Estados posibles del documento

| Estado | Significado |
|--------|-------------|
| `h05_pending_manual_execution` | Sil aún no ha empezado |
| `h05_partially_executed` | Algunas migraciones ejecutadas, pendiente continuar |
| `h05_partially_executed_pending_error_review` | Fallo en alguna migración, bloqueado |
| `h05_executed_pending_verification` | 001–018 ejecutadas, pendiente queries de verificación |
| `h05_verified_ready_for_h06` | Verificación completada, listo para conectar frontend |

---

*Status actual:* `h05_staging_verified_ready_for_h06`
