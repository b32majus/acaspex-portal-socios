---
title: Design System Contract — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# Design System Contract — ACASPEX Portal Socios

## 1. Propósito

Definir el sistema visual mínimo para Fase 1, evitando que el Builder invente estilo, componentes o patrones visuales.

Este contrato no busca diseño final de marca. Busca una interfaz sobria, clara y profesional para prototipo navegable.

## 2. Stack visual decidido

```text
Tailwind v4
shadcn/ui
React + Vite + TypeScript
```

## 3. Principios visuales

La interfaz debe sentirse:

```text
institucional
sanitaria
clara
sobria
profesional
moderna sin parecer SaaS agresivo
```

No debe sentirse:

```text
futurista
neón
demasiado tecnológica
infantil
corporativa genérica sin alma
sobrecargada
```

## 4. Componentes shadcn/ui permitidos en Fase 1

Usar solo estos componentes si están disponibles/configurados:

```text
Button
Card
Badge
Table
Tabs
Input
Textarea
Select
Dialog
Separator
Sidebar opcional
```

No añadir componentes nuevos sin actualizar este contrato.

## 5. Patrón de layout

### Layout socio

Estructura:

```text
Header superior
Navegación horizontal o compacta
Contenido principal centrado
Cards de resumen
Biblioteca en grid/lista
```

### Layout admin

Estructura:

```text
Sidebar lateral en desktop
Navegación superior/compacta en móvil si aplica
Contenido principal amplio
Tablas y cards operativas
Badges de estado
```

## 6. Tipografía

Usar tipografía del sistema, sin instalar fuentes externas en Fase 1.

Preferencia CSS:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Si Inter no está disponible, usar fallback del sistema.

No descargar ni incluir archivos de fuente.

## 7. Paleta conceptual

No fijar aún una paleta de marca final. Usar tokens sobrios:

```text
fondo principal: claro cálido o gris muy suave
texto principal: gris muy oscuro
acento principal: azul/teal sanitario sobrio
acento secundario: verde suave para estados positivos
alerta: ámbar para pendiente/revisión
error/vencido: rojo suave no agresivo
bordes: gris claro
cards: blanco o casi blanco
```

Evitar:

```text
azul eléctrico
neones
fondos oscuros dominantes
degradados excesivos
sombras fuertes
```

## 8. Estados visuales

Mapeo obligatorio de estados de socio:

```text
pending_review → badge "Pendiente revisión" → tono ámbar
active → badge "Activo" → tono verde/teal
expired → badge "Expirado" → tono rojo suave
inactive → badge "Inactivo" → tono gris
cancelled → badge "Cancelado" → tono gris/rojo discreto
```

No mostrar estados técnicos en inglés al usuario final.

## 9. Labels de usuario

Usar textos en español.

Ejemplos:

```text
Socios
Recursos
Renovaciones
Mi cuenta
Biblioteca
Estado de cuota
Válido hasta
Pendiente revisión
Activo
Expirado
```

No usar labels internos como `member`, `resourceId`, `pending_review` en UI visible.

## 10. Densidad visual

Preferir:

```text
espaciado suficiente
cards limpias
tablas legibles
máximo 3-4 métricas por dashboard inicial
botones claros
jerarquía visual simple
```

Evitar:

```text
tablas gigantes sin filtro
muchos KPIs falsos
menús con demasiadas opciones
microcopy inventado excesivo
```

## 11. Componentes por tipo de pantalla

### Home socio

Usar:

```text
Card para estado de membresía
Card para últimos recursos
Card o bloque para mensaje institucional
Button para ir a biblioteca
Badge para estado
```

### Biblioteca socio

Usar:

```text
Cards de recurso
Badge de categoría
Tabs o Select para filtro si se implementa
Button/Link para ver recurso
```

### Mi cuenta

Usar:

```text
Card de datos personales mock
Card de estado de cuota
Badge de estado
```

### Admin socios

Usar:

```text
Table
Badge estado
Input búsqueda mock si aplica
Cards resumen
```

### Admin recursos

Usar:

```text
Table o cards compactas
Badge estado recurso
Button crear/editar mock
```

## 12. Responsive mínimo

Fase 1 debe ser usable en desktop y razonablemente visible en móvil.

No exigir perfección responsive avanzada.

Criterio mínimo:

```text
sin overflow horizontal evidente
cards apilables en móvil
tablas pueden simplificarse o hacer scroll horizontal controlado
navegación usable
```

## 13. Prohibiciones Fase 1

```text
No instalar librerías visuales adicionales.
No añadir animaciones complejas.
No usar gráficos/charts si no están especificados.
No crear dark mode.
No crear theme switcher.
No usar iconografía externa si no está ya disponible.
No crear sistema de diseño completo más allá de este contrato.
```

## 14. Criterios de aceptación del contrato

Este contrato está listo cuando una WO pueda decir:

```text
Implementar la pantalla X usando solo componentes y reglas definidos en docs/design-system-contract.md.
No inventar paleta, componentes ni layout alternativo.
```
