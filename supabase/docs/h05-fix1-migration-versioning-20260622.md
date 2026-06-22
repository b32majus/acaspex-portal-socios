# H0.5-fix1 — Corrección de versiones de migraciones Supabase

**Status:** pending_review
**Fecha:** 2026-06-22

## Causa del fallo

`supabase db push` falló en la migración 002 con:

```
ERROR: duplicate key value violates unique constraint "schema_migrations_pkey"
Key (version)=(20260622) already exists.
```

Supabase extrae el **prefijo numérico antes del primer `_`** del nombre de archivo como clave `version` en la tabla `schema_migrations`. Las 18 migraciones compartían el prefijo `20260622`, causando colisión tras la primera.

## Corrección aplicada

Cada migración renombrada con prefijo único de 14 dígitos (`YYYYMMDDHHmmss`):

| Antes | Ahora |
|-------|-------|
| `20260622_001_acaspex_schema.sql` | `20260622000001_001_acaspex_schema.sql` |
| `20260622_002_acaspex_rls_baseline.sql` | `20260622000002_002_acaspex_rls_baseline.sql` |
| ... | ... |
| `20260622_018_acaspex_storage_resource_files_policies.sql` | `20260622000018_018_acaspex_storage_resource_files_policies.sql` |

## Archivos afectados

| Grupo | Archivos | Cambio |
|-------|----------|--------|
| Migraciones | 18 archivos SQL | `git mv` con nuevo prefijo |
| Docs operativos | `h04a`, `h04b`, `h04e`, `h05-tracker` | Referencias actualizadas |
| Review packs | Todos los `h01`, `h02*`, `h03*` | Referencias actualizadas |
| Comentario SQL | `003_profiles_policies.sql` | 1 comentario corregido |

## Contenido SQL

No se modificó ninguna línea de SQL funcional. El cambio es exclusivamente de nombres de archivo y referencias documentales.

## Validaciones

- [x] 18 migraciones con 18 prefijos únicos
- [x] 0 archivos con prefijo `20260622_` antiguo
- [x] 0 referencias antiguas en docs operativos
- [x] 0 referencias antiguas en review packs
- [x] Sin modificación de SQL funcional
- [x] Sin `supabase db push`
- [x] Sin `supabase db reset`
- [x] Sin `supabase migration repair`
- [x] Sin remoto
- [x] Sin secrets / `.env`

## Próximo paso recomendado

`H0.5-fix2` — Reparar/revertir el remoto parcial (migración 001 ya aplicada) y re-ejecutar dry-run con los nuevos nombres.
