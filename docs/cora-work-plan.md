---
title: Cora Work Plan — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: active
owner: Cora + Sil
project: ACASPEX Portal Socios
---

# Cora Work Plan — ACASPEX Portal Socios

## Propósito

Mantener un plan de trabajo vivo para que Cora y Sil no pierdan el hilo durante la definición del Portal de Socios ACASPEX.

Este archivo no sustituye al PRD, al blueprint técnico ni a las work orders. Sirve como mapa de navegación de la conversación estratégica: qué estamos decidiendo, qué está pendiente y cuándo convertir una decisión en documentación o en work order atómica.

## Principio operativo

```text
Sil + Cora piensan y deciden aquí.
Cora documenta decisiones maduras en KairOS.
Solo se crean work orders cuando hay una tarea técnica atómica, ejecutable y revisable.
```

## Estado actual

Proyecto abierto como taller documental en:

```text
/srv/kairos-lab/projects/acaspex/portal-socios/repo/
```

Ficha wiki:

```text
/srv/kairos-lab/wiki/projects/acaspex-portal-socios.md
```

No se ha activado todavía:

```text
Supabase real
Stripe/pasarela de pago
Dominio/subdominio
deploy público
datos reales de socios
auth productiva
.env o secretos
```

## Decisiones ya orientadas

### D-001 — Mantener Google Sites como web pública

Google Sites seguirá siendo escaparate institucional público de ACASPEX.

Motivo: facilidad de edición y mantenimiento por personas no técnicas o semitécnicas.

### D-002 — Crear portal privado independiente

El área de socios debe vivir fuera de Google Sites, probablemente en un subdominio propio.

Motivo: Google Sites no resuelve bien login, membresía, control de acceso, pagos ni base de datos de socios.

### D-003 — Enfoque Supabase-first

Supabase se perfila como backend del sistema: base de datos de socios, Auth, Storage, recursos y estados.

Motivo: evita depender de Cloudflare Access, que se vuelve problemático al superar 50 usuarios, y permite controlar altas, pagos, renovaciones y acceso.

### D-004 — Portal, no solo microsite

El producto debe tratarse como portal mínimo de socios, no como simple web escondida.

Incluye al menos: socios, estado de pago, acceso privado, biblioteca de recursos y backoffice básico.

### D-005 — Videos fuera de Supabase Storage

Los vídeos irán inicialmente en YouTube oculto u otra plataforma externa.

Motivo: evitar consumo de storage/ancho de banda y complejidad innecesaria.

### D-006 — Documentos privados ligeros en Supabase Storage

PDFs, plantillas y documentos ligeros pueden alojarse en Supabase Storage, asociados a fichas de recurso en base de datos.

### D-007 — GitHub no será el hosting principal por defecto

GitHub se usará preferentemente como versionado/repositorio. Hosting pendiente entre Cloudflare Pages y Netlify.

## Decisiones pendientes principales

### P-001 — Campos reales del alta de socio

Fuente actual indicada por Sil:

```text
https://sites.google.com/view/acaspex/hazte-socio?authuser=0
```

Nota: la página pública muestra la sección Hazte Socio y el correo de contacto, pero el formulario Microsoft Forms embebido no es legible desde la extracción textual disponible para Cora. Pendiente obtener campos mediante captura, copia manual del formulario o Excel actual.

### P-002 — Modelo de pago MVP

Opciones a ordenar:

```text
transferencia + justificante
Stripe Checkout pago único anual
renovación anual por enlace
suscripción recurrente futura
SEPA futuro si compensa
```

### P-003 — Hosting frontend

Opciones:

```text
Cloudflare Pages
Netlify
```

Pendiente decidir según facilidad de despliegue, funciones serverless, dominio, integración con Supabase y mantenimiento futuro.

### P-004 — Stack frontend

Opciones:

```text
React + Vite
Astro + React islands
shadcn/ui o sistema visual propio
```

Decisión probable: React + Vite para panel/admin, con diseño cuidado para que el portal parezca web institucional.

### P-005 — Orden de MVP

Pendiente cerrar si Stripe entra en MVP v0.1 o v0.2.

## Plan de trabajo por fases

### Fase 0 — Estrategia y definición funcional

Objetivo: cerrar qué problema resuelve, usuarios, flujos y alcance MVP.

Entregables:

```text
PRD.md v0.1
decisions.md actualizado
backlog.md inicial
```

Preguntas clave:

```text
Qué tipos de socios existen
Qué datos se piden actualmente
Cómo se valida el alta
Qué método de pago se usa ahora
Qué debe pasar tras pagar
Qué contenido privado se quiere ofrecer
Quién administra socios
Quién sube contenidos
Qué pasa al vencer una cuota
Qué datos NO se deben pedir
```

### Fase 1 — PRD vivo v0.1

Documento madre de producto.

Debe incluir:

```text
contexto
problema actual
objetivo
usuarios/roles
flujos funcionales
MVP
fuera de alcance
riesgos
métricas de éxito
decisiones pendientes
```

### Fase 2 — Blueprint técnico v0.1

Definir arquitectura suficiente para no construir piezas contradictorias.

Entregables:

```text
architecture.md actualizado
data-model.md v0.1
security.md actualizado
```

Debe cubrir:

```text
frontend
hosting
auth
base de datos
storage
pagos
emails
roles
RLS conceptual
entornos dev/prod
```

### Fase 3 — Backlog funcional

Convertir el PRD en módulos candidatos, todavía no work orders.

Módulos candidatos:

```text
alta de socio
gestión admin de socios
login y validación de socio activo
portal privado
biblioteca de recursos
admin de recursos
pagos y justificantes
renovaciones y alertas
emails
importación de datos actuales desde Excel
```

### Fase 4 — Diseño visual/UX

Solo pedir diseño a Open Design o equivalente cuando estén definidas las pantallas mínimas.

Pantallas candidatas:

```text
login
home socios
biblioteca
ficha de recurso
mi cuenta
admin socios
admin recursos
alta socio
renovaciones próximas
```

### Fase 5 — Work orders atómicas

Solo crear work orders cuando haya tareas ejecutables y revisables.

Ejemplos futuros:

```text
WO-001: crear data-model.md con esquema inicial members/resources/payments
WO-002: generar SQL inicial para Supabase dev
WO-003: crear app React/Vite base con rutas mock
WO-004: implementar login Supabase en entorno dev
WO-005: crear biblioteca con datos mock
WO-006: crear admin recursos con subida a Supabase Storage
WO-007: integrar transferencia + justificante
WO-008: integrar Stripe Checkout en sandbox
```

## Reglas de continuidad para Cora

Al retomar el proyecto, Cora debe:

```text
1. Leer este archivo.
2. Leer PRD.md si ya existe.
3. Leer decisions.md.
4. Leer architecture.md y security.md.
5. Identificar la fase actual.
6. No crear work orders si todavía estamos pensando producto/arquitectura.
7. Registrar decisiones maduras, no todos los comentarios sueltos.
8. Marcar dudas abiertas como pendientes.
```

## Próximo paso conversacional

Extraer o reconstruir los campos actuales del alta de socio y convertirlos en:

```text
modelo de datos preliminar
formulario propio v0.1
campos obligatorios/opcionales
campos a eliminar si no son necesarios
campos nuevos para pagos, renovaciones y acceso
```

## Nota de control

Este plan debe actualizarse cuando:

```text
se cierre una decisión importante
se cambie el alcance del MVP
se avance de fase
se cree una work order real
se detecte un riesgo nuevo
```
