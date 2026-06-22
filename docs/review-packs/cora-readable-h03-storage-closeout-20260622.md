# H0.3 Storage — Cierre documental

**Status:** pending_review
**Fecha:** 2026-06-22

---

## Scripts H0.3 creados

| Migración | Archivo | Contenido |
|-----------|---------|-----------|
| `013` | `2026062200013_013_acaspex_storage_buckets.sql` | 3 buckets privados (idempotente con `do update`, H0.3-fix1) |
| `014` | `2026062200014_014_acaspex_storage_payment_receipts_public_upload_policy.sql` | Upload público controlado con regex estricto (H0.3-fix1) |
| `015` | `2026062200015_015_acaspex_storage_payment_receipts_admin_policies.sql` | Admin policies para justificantes |
| `016` | `2026062200016_016_acaspex_storage_reduced_fee_accreditations_policies.sql` | Admin policies para acreditaciones |
| `017` | `2026062200017_017_acaspex_storage_resource_file_helpers.sql` | Helper de acceso a resource files |
| `018` | `2026062200018_018_acaspex_storage_resource_files_policies.sql` | Storage policies para resource files |

---

## Resumen de buckets

### `acaspex-payment-receipts`

| Operación | Anónimo | Socio / Junta | Admin |
|-----------|---------|---------------|-------|
| INSERT | ✅ bajo `signup-requests/` | ❌ | ✅ sin restricción |
| SELECT | ❌ | ❌ | ✅ |
| UPDATE | ❌ | ❌ | ✅ |
| DELETE | ❌ | ❌ | ✅ |

Bucket privado. Upload público controlado solo para alta con prefijo `signup-requests/`. Lectura y gestión exclusiva de administradores.

### `acaspex-reduced-fee-accreditations`

| Operación | Anónimo | Socio / Junta | Admin |
|-----------|---------|---------------|-------|
| SELECT | ❌ | ❌ | ✅ |
| INSERT | ❌ | ❌ | ✅ |
| UPDATE | ❌ | ❌ | ✅ |
| DELETE | ❌ | ❌ | ✅ |

Bucket privado. Acceso exclusivo de administradores. No se abre upload público en esta tanda.

### `acaspex-resource-files`

| Operación | Anónimo | Socio / Junta | Admin |
|-----------|---------|---------------|-------|
| SELECT | ❌ | ✅ publicados con visibilidad | ✅ todo |
| INSERT | ❌ | ❌ | ✅ |
| UPDATE | ❌ | ❌ | ✅ |
| DELETE | ❌ | ❌ | ✅ |

Bucket privado. La lectura se decide dinámicamente mediante `can_access_resource_file_object(name)` que comprueba autenticación, estado del recurso (`published`) y visibilidad (`resource_visibility`). Solo admin gestiona archivos.

---

## Decisiones de seguridad

1. **No buckets públicos**: los tres buckets son `public = false`, forzado con `on conflict do update` (H0.3-fix1) incluso si el bucket ya existía.
2. **No lectura pública de justificantes**: ni anónimos ni socios/Junta pueden leer justificantes.
3. **No update/delete público de justificantes**: solo administradores.
4. **No acceso de socios/Junta a justificantes**: la lectura de `payment-receipts` y `reduced-fee-accreditations` es admin-only.
5. **Upload público de justificantes con patrón estricto**: solo INSERT, solo bucket `payment-receipts`, solo ruta `signup-requests/{uuid}/payment-receipt.{pdf|jpg|jpeg|png}` con regex validado (H0.3-fix1).
6. **Recursos protegidos por metadata + helper + policy**: tres capas coordinadas: `resources.status`, `resource_visibility`, `can_access_resource_file_object`.

---

## Pendientes

1. **Estrategia anti-abuso para subida pública**:
   - Límite de tamaño ya configurado a nivel de bucket (10 MB).
   - Tipos MIME ya acotados (PDF, JPG, PNG).
   - Naming seguro ya forzado por regex en H0.3-fix1 (`signup-requests/{uuid}/payment-receipt.{ext}`).
- Queda pendiente: captcha o rate limiting a nivel de aplicación; limpieza de huérfanos (archivos subidos sin solicitud asociada).
2. **Revisar si se abre upload público de acreditaciones** de cuota reducida en tanda futura.
3. **Ejecutar SQL en Supabase staging** solo tras revisión de Cora/Sil.
4. **Commit/push** en WO separada tras revisión externa.

---

*Status: pending_review*
