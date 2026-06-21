---
title: GitHub Pages Preview Decision — ACASPEX Portal Socios
created: 2026-06-21
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# GitHub Pages Preview Decision — ACASPEX Portal Socios

## Decision

Crear un repositorio GitHub independiente y publico para este proyecto:

```text
acaspex-portal-socios
```

## Purpose

Usarlo como preview informal de taller con la persona que co-desarrolla web y comunicacion con Sil.

No es una demo formal para Junta completa ni entorno productivo.

## Working model

```text
/srv/kairos-lab/projects/acaspex/portal-socios/repo
-> GitHub repo: acaspex-portal-socios
-> GitHub Pages publico
-> enlace informal para feedback rapido
```

## Constraints

```text
repo publico solo con datos ficticios
sin credenciales
sin datos reales de socios
sin pacientes
sin Supabase real
sin auth real
sin pagos reales
```

## Routing decision

Para GitHub Pages preview informal, preferir `HashRouter` para evitar problemas al refrescar rutas internas.

Rutas esperadas:

```text
/#/login
/#/socios
/#/socios/recursos
/#/socios/mi-cuenta
```

Status: active-draft
