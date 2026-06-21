---
title: Overnight Work Order Queue — ACASPEX Portal Socios
created: 2026-06-20
status: pending_execution
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# Overnight Work Order Queue — ACASPEX Portal Socios

## Objetivo

Dejar una cola corta y cerrada de WOs para KairOS PM -> OpenCode CLI Builder.

## Orden de ejecución

1. `/srv/kairos-lab/inbox/workorders/wo-acaspex-004-member-home-page-20260620.md`
2. `/srv/kairos-lab/inbox/workorders/wo-acaspex-005-member-library-page-20260620.md`
3. `/srv/kairos-lab/inbox/workorders/wo-acaspex-006-member-resource-detail-page-20260620.md`
4. `/srv/kairos-lab/inbox/workorders/wo-acaspex-007-member-account-page-20260620.md`
5. `/srv/kairos-lab/inbox/workorders/wo-acaspex-008-member-area-qa-20260620.md`

## Regla de parada

Si cualquier WO falla en `pnpm build`, detener la cola, guardar reporte pending_review con error exacto y no continuar.

## Límite de alcance

Solo área socio mock ya especificada.

No ejecutar todavía:

```text
admin socios
admin recursos
renovaciones admin
formularios
Supabase
auth real
pagos
deploy
GitHub
```

Esas decisiones se revisan con Sil/Cora mañana.
