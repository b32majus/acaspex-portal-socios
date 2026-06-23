---
title: H0.7q — Material Corporativo unificado y validado
status: validated
created: 2026-06-23
owner: Sil / Cora
---

# H0.7q — Material Corporativo

## Veredicto final

```
h07q_material_corporativo_unified_and_permissions_validated
```

Validado por Sil en web pública.

## Iteraciones

| WO | Objetivo | Resultado |
|----|----------|-----------|
| H0.7q-FIX | Restringir acceso a admin/junta | `c14fa47` — RequireBoardOrAdmin creado, ruta protegida |
| H0.7q-FIX2 | Eliminar duplicidad sidebar | `995b253` — corporativo fuera de la biblioteca |
| H0.7q-FIX3 | Usar vista de recursos real | `7545237` — ResourceCard en vez de placeholder |

## Comportamiento validado

| Usuario | Ve Material Corporativo | Accede por URL directa |
|---------|------------------------|----------------------|
| U1 admin | Sí (barra superior) | Sí |
| U2 junta | Sí (barra superior) | Sí |
| U3 socio | No | Bloqueado |

## Sección unificada

- Punto único de acceso: barra superior `/socios/material-corporativo`
- Vista: tarjetas de recursos con estilo ResourceCard (el mismo que el Centro de conocimiento)
- Protegida por `RequireBoardOrAdmin`
- Sin duplicidad en sidebar de Centro de conocimiento

## Próximo paso

H0.8 — Primer flujo real de recursos: subida, previsualización y descarga de Material Corporativo.
