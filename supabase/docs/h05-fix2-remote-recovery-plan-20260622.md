# H0.5-fix2 — Plan de recuperación de Supabase staging parcial

**Status:** pending_review
**Fecha:** 2026-06-22

---

## Estado actual

| Campo | Valor |
|-------|-------|
| Proyecto | `acaspex-portal-staging` |
| Project ref | `oxbsbvbrljzvfqpdozgl` |
| Migraciones remotas aplicadas | 1 (001 antigua, versión `20260622`) |
| Estado de la base remota | Schema base creado. Sin RLS, policies ni Storage |
| Migraciones locales | 18 con versiones únicas (`20260622000001`–`20260622000018`) |
| Datos reales en staging | No |
| Causa del fallo | Versiones duplicadas (`20260622`) en nombres antiguos — ya corregido |

---

## Decisión recomendada: Opción A — Reset/recrear staging limpio

**Ventajas:**
- Staging no tiene datos reales. No hay nada que perder.
- Es la vía más rápida y segura.
- No requiere SQL manual ni operaciones quirúrgicas.
- Deja la base y el migration history completamente limpios.
- El `db push` posterior aplicará las 18 migraciones con versiones únicas sin conflicto.

**Desventajas:**
- Si se recrea el proyecto (no solo se resetea), el `project ref` cambiará y habrá que relinkear el repo local.

---

## Opción B — Limpieza remota controlada

Solo si la Opción A no es viable (ej.: no se puede resetear/recrear el proyecto desde Dashboard).

Consiste en:
- Crear una WO específica para generar SQL de limpieza del migration history remoto.
- Revisar y autorizar ese SQL por separado.
- No ejecutar directamente sin revisión.

**No recomendada como primera opción.** Añade complejidad innecesaria para staging sin datos.

---

## Checklist para Sil — Opción A

| # | Paso | ✅ |
|---|------|----|
| 1 | Confirmar que el proyecto abierto es `acaspex-portal-staging` (NO producción) | ☐ |
| 2 | Confirmar que no hay datos reales (la base está vacía salvo schema) | ☐ |
| 3 | Ir a Supabase Dashboard → Settings → Database | ☐ |
| 4 | Ejecutar "Reset database" (borra schema y migration history) | ☐ |
| 5 | Confirmar que el reset se completó | ☐ |
| 6 | **Si el project ref cambió:** anotar el nuevo ref | ☐ |
| 7 | **Si el project ref se mantiene:** confirmar que es `oxbsbvbrljzvfqpdozgl` | ☐ |
| 8 | No tocar producción | ☐ |
| 9 | No introducir datos reales | ☐ |
| 10 | Avisar a KairOS para ejecutar `H0.5-remote-dry-run-v2` | ☐ |

---

## Después de reset/recreación

Próximo paso: `H0.5-remote-dry-run-v2`

1. Confirmar project ref actual.
2. Relinkear si cambió: `supabase link --project-ref <nuevo-ref>`.
3. Confirmar 18 migraciones locales con versiones únicas.
4. Ejecutar `supabase db push --dry-run`.
5. Esperar ver 18 migraciones pendientes, 0 errores, 0 warnings.
6. Si el dry-run es limpio → proceder a `supabase db push` real.

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Project ref cambia al recrear | Relinkear con `supabase link --project-ref <nuevo>` |
| Migration history no se limpia al resetear | Verificar con `supabase migration list` que remoto queda vacío |
| Queda la versión antigua `20260622` en remoto | NO hacer push hasta que remoto esté limpio |
| Confundir staging con producción | Verificar nombre del proyecto en Dashboard antes de cada acción |

---

*Status: pending_review*
