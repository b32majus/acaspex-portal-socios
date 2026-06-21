---
title: UX Quick Pass Queue — ACASPEX Portal Socios
created: 2026-06-21
status: pending_execution
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# UX Quick Pass Queue — ACASPEX Portal Socios

## Objetivo

Ejecutar un bloque corto y seguro mientras Sil esta fuera.

## Orden

1. `/srv/kairos-lab/inbox/workorders/wo-acaspex-009-login-socio-limpio-20260621.md`
2. `/srv/kairos-lab/inbox/workorders/wo-acaspex-010-admin-sidebar-flush-20260621.md`
3. `/srv/kairos-lab/inbox/workorders/wo-acaspex-011-member-header-avatar-logout-20260621.md`
4. `/srv/kairos-lab/inbox/workorders/wo-acaspex-012-ux-quick-pass-qa-20260621.md`

## Regla de parada

Si falla `pnpm build` en cualquier WO, detener la cola y guardar error exacto en reporte pending_review.

## No ejecutar ahora

```text
Supabase
auth real
persistencia de sesion real
admin real
biblioteca por categorias
previews visuales
comunidad/contacto
pagos
deploy
GitHub
```
