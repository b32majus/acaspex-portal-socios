# Checklist pre-ejecución Supabase staging — ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

> Si todos los puntos están marcados, pasar a H0.5 ejecución manual.

## Checklist de proyecto

| # | Ítem | ✅ |
|---|------|----|
| 1 | Estoy en Supabase Dashboard | ☐ |
| 2 | El proyecto es **staging** (NO producción) | ☐ |
| 3 | Nombre del proyecto confirmado como staging (`acaspex-portal-staging` o similar) | ☐ |
| 4 | Región del proyecto confirmada | ☐ |
| 5 | No hay datos reales de socios en la base de datos | ☐ |
| 6 | No voy a usar `service_role` en frontend | ☐ |
| 7 | No voy a pegar tokens, secrets ni contraseñas en documentos o repo | ☐ |
| 8 | Tengo las 18 migraciones accesibles en local | ☐ |

## Checklist técnica

| # | Ítem | ✅ |
|---|------|----|
| 9 | SQL Editor abierto en Supabase Dashboard | ☐ |
| 10 | Migración `001_acaspex_schema.sql` abierta y lista para copiar | ☐ |
| 11 | El resto de migraciones 002–018 accesibles en orden | ☐ |
| 12 | Entiendo que debo ejecutar una por una, en orden 001 → 018 | ☐ |
| 13 | Entiendo que si una migración falla, debo PARAR | ☐ |
| 14 | Entiendo que NO debo saltar migraciones | ☐ |
| 15 | Entiendo que NO debo reordenar migraciones | ☐ |
| 16 | Tengo a mano `h04b-manual-run-order` para consultar dependencias | ☐ |
| 17 | Tengo a mano `h04d-post-execution-verification-queries.sql` para verificar después | ☐ |

## Checklist de seguridad

| # | Ítem | ✅ |
|---|------|----|
| 18 | Los buckets de Storage quedarán privados (`public = false`) | ☐ |
| 19 | El upload público solo aplica a justificantes y solo con ruta controlada | ☐ |
| 20 | No habrá lectura pública de justificantes | ☐ |
| 21 | Ni socios ni Junta Directiva podrán leer justificantes | ☐ |
| 22 | No se introducirán datos reales hasta que Sil lo autorice | ☐ |
| 23 | No se compartirá la `anon key` fuera del equipo | ☐ |
| 24 | No se usará `service_role key` en ningún cliente ni frontend | ☐ |

## Checklist de entorno

| # | Ítem | ✅ |
|---|------|----|
| 25 | No hay `ANON_KEY` ni `SUPABASE_URL` visibles en capturas de pantalla que vaya a compartir | ☐ |
| 26 | Si comparto error, solo copio el mensaje, no la URL del proyecto | ☐ |
| 27 | Sé que KairOS no tiene acceso a Supabase y no puede ejecutar por mí | ☐ |

## Resultado

- [ ] Todos los puntos marcados → **proceder a H0.5 ejecución manual.**
- [ ] Algún punto sin marcar → **resolver antes de ejecutar.**

---

*Status: pending_review*
