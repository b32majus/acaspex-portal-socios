# Orden de ejecución manual Supabase staging — ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## Instrucción principal

Ejecutar las migraciones **estrictamente en orden ascendente 001 → 018**. No saltar, no reordenar.

## Bloques de ejecución

### Bloque 1 — Schema base

| Orden | Archivo | Qué crea |
|-------|---------|----------|
| 001 | `2026062200001_001_acaspex_schema.sql` | Extensiones, tipos enum, función `set_updated_at`, 9 tablas |

**Por qué primero:** Las 17 migraciones restantes dependen de que las tablas, tipos y extensiones existan. Sin 001, cualquier `create policy on public.X` o `create function` falla.

**Error típico si se salta:** `relation "public.members" does not exist`

---

### Bloque 2 — RLS baseline y policies de tablas

| Orden | Archivo | Qué crea |
|-------|---------|----------|
| 002 | `2026062200002_002_acaspex_rls_baseline.sql` | 4 funciones de rol, RLS activado en 9 tablas |
| 003 | `2026062200003_003_acaspex_profiles_policies.sql` | 3 policies sobre `profiles` |
| 004 | `2026062200004_004_acaspex_members_policies.sql` | 3 policies sobre `members` |
| 005 | `2026062200005_005_acaspex_signup_requests_policies.sql` | 3 policies sobre `signup_requests` |
| 006 | `2026062200006_006_acaspex_payments_policies.sql` | 3 policies sobre `payments` |
| 007 | `2026062200007_007_acaspex_membership_periods_policies.sql` | 3 policies sobre `membership_periods` |
| 008 | `2026062200008_008_acaspex_resource_categories_policies.sql` | 3 policies sobre `resource_categories` |
| 009 | `2026062200009_009_acaspex_resource_access_helpers.sql` | 1 función helper (`can_access_resource_by_visibility`) |
| 010 | `2026062200010_010_acaspex_resources_policies.sql` | 3 policies sobre `resources` |
| 011 | `2026062200011_011_acaspex_resource_visibility_policies.sql` | 4 policies sobre `resource_visibility` |
| 012 | `2026062200012_012_acaspex_audit_log_policies.sql` | 1 policy sobre `audit_log` |

**Por qué este orden dentro del bloque:**
- 002 debe ir antes de cualquier policy: crea las funciones `is_admin()`, `is_junta_or_admin()`, `is_socio_or_higher()` y activa RLS. Si una policy las invoca sin que existan, falla.
- 003–008 son independientes entre sí (distintas tablas). Pueden ir en cualquier orden dentro del bloque, pero se mantiene el orden numérico por simplicidad.
- 009 debe ir antes de 010: `resources_select_by_role` invoca `can_access_resource_by_visibility()`.
- 010 es independiente de 011 y 012.
- 011 y 012 son independientes entre sí.

**Error típico si se desordena:** `function public.is_admin() does not exist`

---

### Bloque 3 — Storage buckets y policies

| Orden | Archivo | Qué crea |
|-------|---------|----------|
| 013 | `2026062200013_013_acaspex_storage_buckets.sql` | 3 buckets privados |
| 014 | `2026062200014_014_acaspex_storage_payment_receipts_public_upload_policy.sql` | Upload público controlado de justificantes |
| 015 | `2026062200015_015_acaspex_storage_payment_receipts_admin_policies.sql` | Admin policies para justificantes |
| 016 | `2026062200016_016_acaspex_storage_reduced_fee_accreditations_policies.sql` | Admin policies para acreditaciones |
| 017 | `2026062200017_017_acaspex_storage_resource_file_helpers.sql` | Helper `can_access_resource_file_object` |
| 018 | `2026062200018_018_acaspex_storage_resource_files_policies.sql` | Storage policies para resource files |

**Por qué este orden:**
- 013 debe ir primero: crea los buckets. Las policies 014–018 referencian `bucket_id` que deben existir.
- 014 y 015 son independientes entre sí (ambas sobre `payment-receipts`, distintas operaciones).
- 016 es independiente (otro bucket).
- 017 debe ir antes de 018: la policy SELECT de 018 invoca `can_access_resource_file_object()`.
- Las policies de Storage (014–018) pueden necesitar `is_admin()` (de 002) para las condiciones admin.

**Error típico si se desordena:** `bucket "acaspex-payment-receipts" does not exist`

---

## Notas importantes

1. **Ejecutar en Supabase staging**, no en producción. Confirmar proyecto antes de empezar (ver H0.4c).
2. **No pegar secrets** en el SQL Editor.
3. **No introducir datos reales** todavía.
4. **Si una migración falla, parar.** No ejecutar la siguiente. Guardar el mensaje de error. Consultar H0.4f para decidir cómo proceder.
5. **Tras 001–018**, ejecutar queries de verificación de H0.4d para confirmar que todo está correcto.
6. **Los buckets de Storage (013) son idempotentes.** Si se re-ejecuta 013, fuerza `public = false` y restaura límites y MIME types.

---

*Status: pending_review*
