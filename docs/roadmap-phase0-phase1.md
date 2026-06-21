---
title: Roadmap Fase 0 / Fase 1 — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: living-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# Roadmap Fase 0 / Fase 1 — ACASPEX Portal Socios

## 1. Reencuadre

El formulario de alta es solo un subflujo del producto. No debe ocupar el centro de la conversación.

El objetivo principal es crear una herramienta operativa para ACASPEX que combine:

```text
gestión de socios
control de cuotas/estado
portal privado
biblioteca de recursos
backoffice admin
base de datos operativa
futura automatización de pagos/renovaciones
```

## 2. Principio de trabajo

```text
Fase 0 = decidir lo mínimo imprescindible para construir bien.
Fase 1 = crear una primera base visible y técnica con datos mock/dev, sin producción real.
```

No esperar a tener todo cerrado. Pero tampoco empezar a construir sin columna vertebral.

Regla crítica:

```text
Una work order no puede ser una épica.
Una work order = una tarea atómica = un output revisable.
Si una WO contiene más de 1-2 pantallas o mezcla setup + UI + datos + QA, está mal troceada.
```

## 3. Fase 0 — Decisiones mínimas antes de construir

Objetivo: cerrar una versión suficiente de producto y arquitectura para empezar construcción/prototipo sin contradicciones.

### 3.1 Decisiones de producto mínimas

1. Nombre funcional del producto.
2. Qué módulos entran en MVP v0.1.
3. Qué módulos quedan para v0.2.
4. Roles de usuario mínimos.
5. Estados de socio.
6. Vista mínima del socio.
7. Vista mínima del admin.
8. Qué significa socio activo.
9. Qué contenido privado tendrá sentido desde el inicio.
10. Qué no se construye todavía.

### 3.2 Decisiones técnicas mínimas

1. Stack frontend inicial.
2. Hosting candidato para dev/prototipo.
3. Supabase como backend dev, no en primera WO si no hace falta.
4. Auth por email/magic link en fase posterior.
5. Storage privado para documentos en fase posterior.
6. YouTube oculto para vídeos.
7. No pagos reales en Fase 1.
8. No datos reales en Fase 1.
9. No dominio real en Fase 1.
10. Workflows con datos mock o dev.

### 3.3 Decisiones de flujo mínimas

1. Alta de socio como subflujo, no centro del producto.
2. Gestión admin como núcleo operativo.
3. Acceso privado condicionado por estado activo.
4. Biblioteca como propuesta de valor visible.
5. Renovaciones como control administrativo, aunque no automatizadas al inicio.

## 4. Decisiones ya cerradas

### Stack inicial

```text
React + Vite + TypeScript
Tailwind v4
shadcn/ui usado de forma sobria
```

### Roles MVP

```text
socio
administrador
```

No crear rol editor en v0.1. El administrador gestiona también recursos.

### Estados MVP

```text
pending_review
active
expired
inactive
cancelled
```

No usar `pending_payment` de inicio si todo pago requiere revisión administrativa.

### Datos de Fase 1

```text
datos mock/hardcodeados
sin backend real
sin Supabase conectado
sin datos reales
sin pagos reales
sin secretos
```

### Hosting preview

Netlify preview o URL temporal equivalente para revisión. Si se comparte fuera del entorno de trabajo, proteger acceso. Una URL difícil no debe tratarse como seguridad real.

## 5. Fase 1 — Construcción inicial por micro-WOs

Objetivo: crear base visible y técnica sin convertir una sola WO en un monstruo.

La Fase 1 se divide en micro-WOs. No se entrega al builder una orden tipo “crear todo el prototipo”.

## 6. Secuencia de micro-WOs candidata

### WO-001 — Scaffold técnico mínimo

Objetivo: crear la base del proyecto frontend, sin pantallas funcionales completas.

Output único:

```text
app React/Vite/TS arranca
Tailwind/shadcn inicial configurado
estructura de carpetas mínima
README de ejecución
sin backend
sin datos reales
```

Criterios de aceptación:

```text
npm install / pnpm install documentado
app arranca localmente
pantalla placeholder inicial
sin Supabase
sin variables secretas
sin rutas complejas
```

### WO-002 — Shell de navegación y layout base

Objetivo: crear la estructura visual navegable mínima.

Output único:

```text
layout base
navegación socio/admin
rutas placeholder
```

Rutas placeholder candidatas:

```text
/login
/socios
/socios/recursos
/socios/mi-cuenta
/admin
/admin/socios
/admin/recursos
/admin/renovaciones
```

Criterios de aceptación:

```text
se puede navegar entre rutas
cada ruta muestra placeholder claro
no hay lógica de negocio
no hay datos reales
```

### WO-003 — Mock data contract

Objetivo: crear datos ficticios y tipos TypeScript base.

Output único:

```text
tipos Member, Resource, PaymentSummary opcional
mockMembers
mockResources
mockRenewals
```

Criterios de aceptación:

```text
sin datos reales
nombres ficticios
estados cubiertos
recursos de ejemplo
mock centralizado en /src/data o similar
```

### WO-004 — Portal socio básico

Objetivo: crear solo la parte socio usando mock data.

Pantallas:

```text
home socios
biblioteca recursos
ficha recurso socio
mi cuenta
```

Criterios de aceptación:

```text
home muestra resumen del socio mock
biblioteca lista recursos mock
ficha recurso muestra detalle mock
mi cuenta muestra estado/validez mock
sin admin
sin backend
```

### WO-005 — Admin socios básico

Objetivo: crear solo administración de socios usando mock data.

Pantallas:

```text
admin dashboard/listado socios
ficha socio admin
renovaciones próximas
```

Criterios de aceptación:

```text
listado con filtros visuales simples
ficha socio con datos y estado mock
renovaciones muestra próximos/vencidos mock
no edita datos reales
no persiste cambios
```

### WO-006 — Admin recursos básico

Objetivo: crear solo administración visual de recursos usando mock data.

Pantallas:

```text
listado recursos admin
ficha/editor recurso mock
```

Criterios de aceptación:

```text
listado recursos mock
formulario visual no persistente
campos título/categoría/tipo/estado/descripción
no subida real de archivos
no Supabase Storage
```

### WO-007 — QA estático y revisión de prototipo

Objetivo: ejecutar comprobaciones y generar reporte pending_review.

Output único:

```text
build/lint si aplica
revisión rutas
capturas o descripción de pantallas si aplica
reporte pending_review
```

Criterios de aceptación:

```text
app compila
sin errores evidentes
rutas principales revisadas
limitaciones documentadas
```

## 7. Qué NO entra en estas primeras WOs

```text
Supabase real
Auth real
Storage real
subida de archivos real
Stripe
emails
importación Excel
formulario propio funcional
datos reales de socios
dominio real
deploy público productivo
```

## 8. Plan de mañana recomendado

### Bloque 1 — Cerrar alcance de micro-WO inicial

Decidir si mañana empezamos por:

```text
WO-001 scaffold técnico mínimo
```

o si agrupamos, como máximo:

```text
WO-001 scaffold técnico mínimo + WO-002 shell navegación
```

Recomendación: empezar con WO-001 sola si va a Builder con modelo no top-tier. Si se usa PM fuerte para trocear y auditar, podría lanzar WO-001 y WO-002 separadas, nunca fusionadas como “prototipo entero”.

### Bloque 2 — Crear work order atómica

Output:

```text
work order concreta con objetivo, rutas, salida, criterios de aceptación, restricciones y auditoría
```

### Bloque 3 — Ejecutar con Builder

Usar builder para la tarea acotada.

### Bloque 4 — Revisar con Sil/Cora

No pasar a la siguiente WO sin revisar output.

## 9. Regla de foco

Si la conversación se desvía a formulario, Stripe, RGPD, diseño fino o automatizaciones, volver a esta pregunta:

```text
¿Esto bloquea la siguiente micro-WO atómica?
```

Si no bloquea, se registra como pendiente y se sigue.
