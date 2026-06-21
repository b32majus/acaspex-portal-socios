---
title: Session Persistence Decision — ACASPEX Portal Socios
created: 2026-06-21
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# Session Persistence Decision — ACASPEX Portal Socios

## Decision

El portal debe permitir persistencia de sesion para que el socio no tenga que autenticarse continuamente.

## Technical interpretation

```text
SI: mantener sesion iniciada mediante el sistema de autenticacion elegido.
NO: guardar contrasena cruda en almacenamiento local de la app.
```

## Future implementation

Cuando exista auth real, la persistencia debe gestionarse por el proveedor de autenticacion, previsiblemente Supabase Auth u otro sistema equivalente.

El navegador puede ofrecer guardar credenciales mediante su propio gestor de contrasenas, pero la app no debe almacenar la contrasena manualmente.

## MVP mock

En fase mock solo se permite:

```text
logout mock
estado visual de sesion ficticia
sin credenciales reales
sin persistencia real
```

Status: active-draft
