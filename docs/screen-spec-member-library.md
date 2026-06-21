---
title: Screen Spec — Member Library
created: 2026-06-20
updated: 2026-06-20
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
route: /socios/recursos
component: MemberLibraryPage
---

# Screen Spec — Member Library

## Propósito

Definir la pantalla `MemberLibraryPage` sin que el Builder invente estructura ni comportamiento.

## Ruta y componente

```text
Ruta: /socios/recursos
Componente: MemberLibraryPage
Layout: MemberLayout
Datos: mockResources
```

## Objetivo

Mostrar al socio una biblioteca simple con recursos publicados.

## Datos usados

```text
mockResources
mostrar solo status = published
ordenar por publishedAt descendente
```

## Estructura exacta

1. Cabecera de pantalla.
2. Resumen de recursos publicados.
3. Grid/listado de recursos publicados.
4. Estado vacío si no hay publicados.

## Cabecera

Título exacto:

```text
Biblioteca de recursos
```

Subtítulo exacto:

```text
Consulta guías, plantillas, grabaciones y materiales disponibles para socios.
```

## Resumen

Mostrar una card o bloque compacto con:

```text
Recursos disponibles: <numero de recursos publicados>
```

No mostrar recursos draft en el conteo.

## Card de recurso

Cada recurso publicado debe mostrar:

```text
title
subtitle
category visible en español
type visible en español
fileLabel si existe
botón Ver recurso -> /socios/recursos/:resourceId
```

Mapeo categoría:

```text
formacion -> Formación
guias -> Guías
herramientas -> Herramientas
jornadas -> Jornadas
plantillas -> Plantillas
```

Mapeo tipo:

```text
pdf -> PDF
video -> Vídeo
template -> Plantilla
link -> Enlace
presentation -> Presentación
```

## Estado vacío

Texto exacto:

```text
Aún no hay recursos publicados. Próximamente encontrarás aquí materiales para socios.
```

## Fuera de alcance

```text
no filtros avanzados
no búsqueda
no descarga real
no subida de archivos
no Supabase
no auth real
no mostrar drafts
```

## Criterios de aceptación

```text
/socios/recursos muestra MemberLibraryPage
usa mockResources
muestra solo recursos published
no muestra res-004 porque es draft
cada recurso tiene enlace a /socios/recursos/:id
pnpm build pasa
```
