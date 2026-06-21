---
title: Screen Spec — Member Resource Detail
created: 2026-06-20
updated: 2026-06-20
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
route: /socios/recursos/:resourceId
component: MemberResourceDetailPage
---

# Screen Spec — Member Resource Detail

## Propósito

Definir la pantalla `MemberResourceDetailPage` sin inventar estructura ni comportamiento.

## Ruta y componente

```text
Ruta: /socios/recursos/:resourceId
Componente: MemberResourceDetailPage
Layout: MemberLayout
Datos: mockResources
```

## Objetivo

Mostrar el detalle de un recurso concreto publicado.

## Datos usados

```text
resourceId desde useParams
buscar en mockResources por id
mostrar solo si status = published
```

Si el recurso no existe o no está publicado, mostrar estado no encontrado.

## Estructura exacta

1. Enlace volver a biblioteca.
2. Cabecera del recurso.
3. Metadatos del recurso.
4. Descripción.
5. Acción mock.
6. Estado no encontrado si aplica.

## Cabecera

Debe mostrar:

```text
title
subtitle
```

## Metadatos

Mostrar:

```text
Categoría: <categoria visible>
Tipo: <tipo visible>
Publicado: <publishedAt o No publicado>
Tiempo estimado: <estimatedReadMinutes> min, si existe
```

## Descripción

Mostrar `description`.

## Acción mock

Si `externalUrl` existe, mostrar botón/enlace visual:

```text
Abrir recurso externo
```

Si `fileLabel` existe y no hay `externalUrl`, mostrar botón visual no funcional:

```text
Acceder al recurso
```

No implementar descarga real.

## Estado no encontrado

Texto exacto:

```text
Recurso no disponible
Este recurso no existe o todavía no está publicado.
```

Debe incluir enlace:

```text
Volver a biblioteca -> /socios/recursos
```

## Fuera de alcance

```text
no descarga real
no streaming video
no permisos reales
no Supabase
no auth real
no edición
```

## Criterios de aceptación

```text
/socios/recursos/res-001 muestra detalle del recurso
/socios/recursos/res-004 muestra no disponible porque es draft
/socios/recursos/no-existe muestra no disponible
hay enlace de vuelta a /socios/recursos
pnpm build pasa
```
