---
title: Backlog vivo — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: living-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# Backlog vivo — ACASPEX Portal Socios

## 1. Propósito

Mantener un backlog funcional vivo antes de convertir tareas en work orders técnicas.

Este documento recoge módulos, prioridades, dependencias y futuras unidades ejecutables. No es todavía una lista de work orders.

## 2. Regla operativa

```text
Backlog = qué queremos construir y en qué orden probable.
Work order = una tarea técnica atómica, ejecutable y revisable.
```

No crear work orders hasta que el módulo esté suficientemente definido.

## 3. Fases macro

```text
Fase 0 — Definición funcional y PRD
Fase 1 — Modelo de datos y arquitectura
Fase 2 — Estrategia Microsoft Forms/Excel → Supabase
Fase 3 — Prototipo visual con datos mock
Fase 4 — Supabase dev
Fase 5 — Portal socios MVP
Fase 6 — Admin MVP
Fase 7 — Pagos manuales ordenados
Fase 8 — Stripe sandbox
Fase 9 — Renovaciones/emails
Fase 10 — Importación histórico
Fase 11 — Preparación producción
```

## 4. Módulos candidatos

### M01 — Transición Forms actual → formulario propio

Objetivo: mantener Microsoft Forms como fallback inicial y sustituirlo por un formulario propio solo cuando esté probado dentro/enlazado desde Google Sites y escriba correctamente en Supabase.

Incluye:

- conservar Microsoft Forms público mientras se prueba el nuevo flujo;
- mantener Google Sites como punto público de entrada;
- construir formulario propio en entorno dev;
- probar embed/enlace desde Google Sites;
- escribir directamente en Supabase;
- permitir subida de justificante de transferencia;
- permitir subida de acreditación para cuota reducida;
- crear solicitud con estado operativo;
- mantener Excel de Microsoft Forms como fuente transitoria/fallback;
- retirar o dejar Forms solo como fallback cuando el nuevo formulario esté validado.

Estado: candidato MVP v0.1 con transición controlada.

Dependencias:

- acceso controlado al Excel actual;
- definición de estrategia de importación/sincronización;
- data-model validado;
- decisión sobre cómo se valida pago y cuota reducida.

### M02 — Gestión de socios admin

Objetivo: permitir a administración ver y gestionar socios.

Incluye:

- listado de socios;
- búsqueda;
- filtros por estado;
- crear/editar socio;
- cambiar estado;
- ver paid_until;
- notas internas.

Estado: candidato MVP v0.1.

### M03 — Validación de pago manual

Objetivo: ordenar el flujo actual de transferencia.

Incluye:

- registrar método de pago transferencia;
- subir/ver justificante si se decide;
- marcar pago como validado;
- calcular periodo de membresía;
- activar socio.

Estado: candidato MVP v0.1.

Duda clave: si los justificantes viven en Supabase Storage o siguen temporalmente por email.

### M04 — Login y acceso de socios

Objetivo: permitir acceso al portal solo a socios activos.

Incluye:

- login por email/magic link;
- validación de estado;
- pantalla de acceso denegado/no activo;
- enlace de soporte.

Estado: candidato MVP v0.1.

Dependencia: Supabase Auth + policies.

### M05 — Portal privado socios

Objetivo: ofrecer una experiencia de web privada normal, no panel técnico.

Incluye:

- home socios;
- últimos recursos;
- accesos rápidos;
- mensaje institucional;
- estado básico de membresía.

Estado: candidato MVP v0.1.

### M06 — Biblioteca de recursos

Objetivo: publicar recursos exclusivos para socios.

Incluye:

- categorías;
- buscador/filtros;
- tarjetas de recursos;
- ficha de recurso;
- enlaces a vídeos;
- documentos descargables;
- previsualización PDF si procede.

Estado: candidato MVP v0.1.

### M07 — Admin de recursos

Objetivo: permitir subir/publicar materiales sin tocar código.

Incluye:

- crear recurso;
- editar recurso;
- publicar/despublicar;
- subir archivo;
- pegar enlace YouTube;
- añadir texto de presentación;
- asociar categoría.

Estado: candidato MVP v0.1/v0.2 según complejidad.

### M08 — Renovaciones y vencimientos

Objetivo: evitar que la sociedad dependa de memoria humana para renovar cuotas.

Incluye:

- paid_until;
- socios próximos a vencer;
- socios vencidos;
- filtros/admin;
- posible generación manual de aviso.

Estado: candidato MVP v0.1 como vista admin simple; emails en v0.2.

### M09 — Stripe Checkout

Objetivo: permitir pago online de alta/renovación.

Incluye:

- sesión de pago;
- checkout;
- webhook;
- actualización automática de payment_status y member.status;
- registro de provider_payment_id.

Estado: candidato v0.2 o MVP ampliado.

No activar pagos reales sin autorización explícita.

### M10 — Emails automáticos

Objetivo: enviar comunicaciones transaccionales.

Incluye:

- bienvenida;
- pago recibido;
- renovación próxima;
- acceso/soporte.

Estado: fase posterior.

### M11 — Importación desde Excel histórico

Objetivo: migrar socios actuales desde el Excel de Microsoft Forms.

Incluye:

- plantilla de importación;
- normalización de campos;
- detección de duplicados;
- carga controlada en Supabase;
- reporte de errores.

Estado: fase posterior, requiere autorización para datos reales.

### M12 — Diseño visual/UX

Objetivo: definir una interfaz institucional, clara y mantenible.

Incluye:

- login;
- home socios;
- biblioteca;
- ficha recurso;
- admin socios;
- admin recursos;
- alta socio;
- renovaciones.

Estado: pedir diseño solo cuando flujos/pantallas estén definidos.

## 5. Prioridad inicial propuesta

```text
P0 — Documentación viva
P1 — PRD + modelo de datos
P2 — prototipo con datos mock
P3 — Supabase dev sin datos reales
P4 — login + socios mock/dev
P5 — portal/biblioteca
P6 — admin socios/recursos
P7 — pagos manuales ordenados
P8 — Stripe sandbox
```

## 6. Futuras work orders candidatas

No crear todavía. Lista orientativa:

```text
WO-candidate-001 — Crear esquema SQL dev para members/payments/resources
WO-candidate-002 — Crear app React/Vite base con rutas mock
WO-candidate-003 — Crear diseño mock de portal socios
WO-candidate-004 — Implementar login Supabase dev
WO-candidate-005 — Implementar biblioteca con datos mock
WO-candidate-006 — Implementar panel admin socios mock
WO-candidate-007 — Implementar subida de recurso a Supabase Storage dev
WO-candidate-008 — Implementar flujo transferencia + validación admin
WO-candidate-009 — Implementar Stripe Checkout sandbox
WO-candidate-010 — Crear importador CSV desde Excel histórico
```

## 7. Bloqueantes antes de construir

1. Confirmar campos obligatorios/opcionales.
2. Confirmar modelo de cuota.
3. Confirmar año natural vs 12 meses desde alta.
4. Confirmar método de pago MVP.
5. Confirmar stack frontend.
6. Confirmar hosting frontend.
7. Confirmar roles internos.
8. Confirmar criterio de almacenamiento de justificantes/acreditaciones.
9. Confirmar texto de privacidad.
10. Confirmar qué datos reales se pueden usar y cuándo.

## 8. Siguiente paso recomendado

Trabajar con Sil sobre:

```text
formulario propio v0.1
campos obligatorios/opcionales
modelo de cuota
flujo de pago MVP
```

Después actualizar:

```text
PRD.md
data-model.md
security.md
decisions.md
```
