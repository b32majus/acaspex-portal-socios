# Review Pack H0.3c — Admin policies payment receipts

**Status:** approved
**Fecha:** 2026-06-22
**Archivo creado:** `supabase/migrations/20260622_015_acaspex_storage_payment_receipts_admin_policies.sql`

## Policies creadas

| Policy | Operación | Condición |
|--------|-----------|-----------|
| `payment_receipts_select_admin` | SELECT | `bucket_id = 'acaspex-payment-receipts' AND public.is_admin()` |
| `payment_receipts_insert_admin` | INSERT | `bucket_id = 'acaspex-payment-receipts' AND public.is_admin()` |
| `payment_receipts_update_admin` | UPDATE | `bucket_id = 'acaspex-payment-receipts' AND public.is_admin()` (USING + WITH CHECK) |
| `payment_receipts_delete_admin` | DELETE | `bucket_id = 'acaspex-payment-receipts' AND public.is_admin()` |

## Coexistencia con H0.3b

La policy pública de INSERT (`payment_receipts_public_upload`) de H0.3b sigue vigente. Esta migración añade políticas admin sin modificarla ni eliminarla. El bucket tendrá:
- INSERT permitido para anónimos bajo `signup-requests/` (H0.3b)
- INSERT permitido para administradores sin restricción de prefijo (H0.3c)
- SELECT/UPDATE/DELETE solo para administradores (H0.3c)

## Reviewer H0.3c — Verificación

| Check | Resultado |
|-------|-----------|
| Solo bucket `acaspex-payment-receipts` | ✅ |
| SELECT admin-only | ✅ |
| UPDATE admin-only | ✅ |
| DELETE admin-only | ✅ |
| INSERT admin-only | ✅ |
| Sin SELECT público | ✅ |
| Sin UPDATE público | ✅ |
| Sin DELETE público | ✅ |
| Sin `USING (true)` | ✅ |
| Sin `WITH CHECK (true)` genérico | ✅ |
| Sin datos reales | ✅ |
| Sin secrets | ✅ |

## Veredicto

`payment_receipts_admin_policies_approved_for_next_step`
