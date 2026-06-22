# Review Pack H0.3a — Buckets privados Storage ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Creado el script de registro de buckets privados:

- `supabase/migrations/2026062200013_013_acaspex_storage_buckets.sql`

## Buckets definidos

| Bucket | Uso | Público | Límite | MIME types |
|--------|-----|---------|--------|------------|
| `acaspex-payment-receipts` | Justificantes de transferencia | `false` | 10 MB | PDF, JPG, PNG |
| `acaspex-reduced-fee-accreditations` | Acreditaciones de cuota reducida | `false` | 10 MB | PDF, JPG, PNG |
| `acaspex-resource-files` | Archivos del Centro de Conocimiento | `false` | 50 MB | PDF, DOCX, PPTX, XLSX |

Los tres buckets son privados. Ninguno permite acceso público. El acceso a objetos dentro de cada bucket se controlará con policies en H0.3b, H0.3c y H0.3d.

## Decisiones aplicadas

- **Idempotente**: `insert ... on conflict (id) do nothing`. Si el bucket ya existe no se modifica.
- **Límites de archivo**: 10 MB para documentos personales/acreditaciones; 50 MB para recursos (presentaciones, PDFs grandes).
- **MIME types acotados**: solo los tipos de archivo declarados en el contrato de storage. No se aceptan ejecutables, archivos comprimidos ni formatos no documentados.
- **Sin policies todavía**: este script no concede acceso. Las policies sobre `storage.objects` se crearán en H0.3b (receipts), H0.3c (accreditations) y H0.3d (resource-files).

## Verificación rápida

- [x] Contiene `acaspex-payment-receipts`
- [x] Contiene `acaspex-reduced-fee-accreditations`
- [x] Contiene `acaspex-resource-files`
- [x] Los tres buckets tienen `public = false`
- [x] No contiene `create policy`
- [x] No contiene `alter table`
- [x] No contiene `insert into public.`
- [x] No contiene objetos reales ni rutas de socio
- [x] No contiene datos reales ni secrets

## Veredicto

`storage_buckets_ready_for_review`

---

*Status: pending_review*
