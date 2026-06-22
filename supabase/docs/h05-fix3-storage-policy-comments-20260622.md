# H0.5-fix3 — Retirar COMMENT ON POLICY de migraciones Storage

**Status:** pending_review
**Fecha:** 2026-06-22

## Causa del fallo

`supabase db push` falló en migración 014 con:

```
ERROR: must be owner of relation objects (SQLSTATE 42501)
comment on policy "payment_receipts_public_upload" on storage.objects is ...
```

La tabla `storage.objects` pertenece a `supabase_storage_admin`. El rol de migración puede crear policies sobre ella (`create policy`), pero no puede añadir comentarios (`comment on policy`), ya que estos requieren ownership de la relación.

Las migraciones 014, 015, 016 y 018 contenían `comment on policy` decorativos que fallaban por permisos.

## Corrección

Retirados los `comment on policy` de las 4 migraciones Storage afectadas.

| Migración | `comment on policy` retirados | `create policy` conservados |
|-----------|------------------------------|----------------------------|
| 014 | 1 | 1 |
| 015 | 4 | 4 |
| 016 | 4 | 4 |
| 017 | 0 (helper, sin comments) | 1 función |
| 018 | 4 | 4 |
| **Total** | **13** | **13 policies + 1 función** |

Las migraciones 001–013 no fueron tocadas.

## Dry-run tras fix

```
Would push these migrations:
 • 20260622000014_014_...public_upload_policy.sql
 • 20260622000015_015_...admin_policies.sql
 • 20260622000016_016_...accreditations_policies.sql
 • 20260622000017_017_...resource_file_helpers.sql
 • 20260622000018_018_...resource_files_policies.sql
```

**5 migraciones, 0 errores, 0 warnings.**

## Próximo paso

`H0.5-remote-apply-v3` — aplicar 014–018.
