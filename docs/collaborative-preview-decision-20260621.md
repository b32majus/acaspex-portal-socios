---
title: Collaborative Preview Decision — ACASPEX Portal Socios
created: 2026-06-21
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# Collaborative Preview Decision — ACASPEX Portal Socios

## Decisión

Para esta fase, Sil necesita un acceso informal de trabajo compartido con la persona que colabora en comunicación/web de ACASPEX.

No se trata de una demo formal para toda la Junta Directiva ni de una propuesta institucional cerrada.

## Marco correcto

El objetivo es trabajar en modo taller:

```text
ver cambios en tiempo casi real
comentar diseño y comunicación
iterar de forma informal
trabajar como equipo cercano, no como proveedor/cliente
```

## Implicación para hosting temporal

GitHub Pages puede ser una opción válida para esta fase si:

```text
no hay datos reales
no hay auth real
no hay Supabase conectado
no hay pagos
no hay secretos
la colaboradora ya conoce ese modo de acceso
```

## Matiz técnico pendiente

La app usa routing tipo SPA. Si se publica en GitHub Pages, hay que decidir una de estas opciones:

```text
usar HashRouter para evitar problemas de refresh en rutas internas
configurar fallback de SPA para GitHub Pages
mantener la preview solo en ruta raíz durante taller
```

Para taller rápido, HashRouter puede ser la opción más sencilla aunque la URL tenga `#`.

## No confundir con producción

Esta decisión no sustituye la decisión futura de hosting estable.

Producción o demo formal podrán valorarse después con:

```text
Netlify
GitHub Pages
otro hosting estático
portal vinculado a dominio/subdominio ACASPEX
```

## Estado

Apta como decisión de taller informal. Pendiente de implementación técnica si Sil decide activar GitHub Pages.
