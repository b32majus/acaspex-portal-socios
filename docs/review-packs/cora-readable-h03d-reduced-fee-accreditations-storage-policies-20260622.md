# Review Pack H0.3d — Storage policies reduced fee accreditations

**Status:** approved
**Fecha:** 2026-06-22
**Archivo creado:** `supabase/migrations/2026062200016_016_acaspex_storage_reduced_fee_accreditations_policies.sql`

## Policies creadas

| Policy | Operación | Condición |
|--------|-----------|-----------|
| `accreditations_select_admin` | SELECT | `bucket_id = 'acaspex-reduced-fee-accreditations' AND public.is_admin()` |
| `accreditations_insert_admin` | INSERT | `bucket_id = 'acaspex-reduced-fee-accreditations' AND public.is_admin()` |
| `accreditations_update_admin` | UPDATE | `bucket_id = 'acaspex-reduced-fee-accreditations' AND public.is_admin()` |
| `accreditations_delete_admin` | DELETE | `bucket_id = 'acaspex-reduced-fee-accreditations' AND public.is_admin()` |

## Acceso resultante

| Operación | Anónimo | Socio / Junta | Administrador |
|-----------|---------|---------------|---------------|
| SELECT | ❌ | ❌ | ✅ |
| INSERT | ❌ | ❌ | ✅ |
| UPDATE | ❌ | ❌ | ✅ |
| DELETE | ❌ | ❌ | ✅ |

## Nota

No se abre upload público de acreditaciones en esta tanda. Si en el futuro se necesita que la persona suba su acreditación durante el alta, se creará una policy separada similar a H0.3b con prefijo controlado.

## Reviewer H0.3d — Verificación

| Check | Resultado |
|-------|-----------|
| Solo bucket `acaspex-reduced-fee-accreditations` | ✅ |
| 4 policies admin-only | ✅ |
| Sin upload público | ✅ |
| Sin `USING (true)` | ✅ |
| Sin `WITH CHECK (true)` genérico | ✅ |
| Sin datos reales | ✅ |
| Sin secrets | ✅ |

## Veredicto

`reduced_fee_accreditations_storage_policies_approved_for_next_step`
