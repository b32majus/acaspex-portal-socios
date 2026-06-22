# Review Pack H0.3b — Public upload controlado payment receipts

**Status:** approved
**Fecha:** 2026-06-22
**Archivo creado:** `supabase/migrations/20260622_014_acaspex_storage_payment_receipts_public_upload_policy.sql`

## Policy creada

| Policy | Operación | Bucket | Condición |
|--------|-----------|--------|-----------|
| `payment_receipts_public_upload` | INSERT | `acaspex-payment-receipts` | `bucket_id = 'acaspex-payment-receipts' AND lower(name) ~ '^signup-requests/[0-9a-f]{8}-.../payment-receipt\\.(pdf|jpg|jpeg|png)$'` |

## Lógica

- Cualquier rol (incluyendo anónimo) puede subir archivos al bucket SOLO bajo el formato estricto: `signup-requests/{uuid}/payment-receipt.{pdf|jpg|jpeg|png}`.
- Se usa `lower(name) ~` para aceptar extensiones en mayúsculas sin abrir más rutas.
- No se permiten nombres libres de archivo ni subdirectorios arbitrarios.
- El bucket sigue siendo privado (`public = false` en 013, reforzado con `on conflict do update` en H0.3-fix1).
- Esta policy solo permite INSERT — no permite leer, modificar ni eliminar objetos.
- La lectura y gestión admin se definirán en H0.3c.
- Endurecido en H0.3-fix1 (antes: `name like 'signup-requests/%'`).

## Reviewer H0.3b — Verificación (post H0.3-fix1)

| Check | Resultado |
|-------|-----------|
| Exactamente 1 policy de INSERT | ✅ |
| Sobre `storage.objects` | ✅ |
| `bucket_id = 'acaspex-payment-receipts'` | ✅ |
| Regex estricto `signup-requests/{uuid}/payment-receipt.{ext}` | ✅ |
| Sin `name like 'signup-requests/%'` (patrón débil corregido) | ✅ |
| Sin SELECT | ✅ |
| Sin UPDATE | ✅ |
| Sin DELETE | ✅ |
| Sin `USING (true)` | ✅ |
| Sin `WITH CHECK (true)` genérico | ✅ |
| Sin datos reales | ✅ |
| Sin secrets | ✅ |

## Veredicto

`payment_receipts_public_upload_approved_for_next_step`
