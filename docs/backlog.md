---
title: Backlog vivo — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-23
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

- login por email + contraseña propia;
- sesión activa y cierre de sesión;
- validación posterior de estado de socio;
- pantalla de acceso denegado/no activo;
- enlace de soporte.

Estado: candidato MVP v0.1.

Dependencia: Supabase Auth + policies.

Nota 2026-06-23: magic link queda fuera de la vía principal del MVP. El login MVP se implementa con email + contraseña propia.

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

## 9. Pendientes detectados durante H0.7 — Auth/login/sesión

Esta sección registra decisiones, deudas e implementaciones pendientes detectadas durante las micro-WOs H0.6.1–H0.7e para evitar que se pierdan entre tandas.

### P-H07-001 — Redirección post-login

Estado: pendiente.

H0.7b redirige técnicamente a `/socios` tras login correcto. Antes de cerrar el flujo real hay que decidir la ruta final de entrada tras autenticación:

```text
/socios
/area-privada
/dashboard
/admin según rol
```

No resolver hasta que exista lectura de sesión, perfil, socio activo y rol.

### P-H07-002 — Acceso visible/oculto a administración

Estado: pendiente.

La pantalla de login conserva un acceso discreto hacia `/admin`. No bloquea H0.7b, pero antes de publicar con usuarios reales debe decidirse si:

- se mantiene como acceso operativo para personas administradoras;
- se reubica dentro del área privada;
- se oculta de la pantalla pública;
- se protege con sesión + rol administrador.

No dejar `/admin` como acceso funcional sin protección real.

### P-H07-003 — Session shell + logout

Estado: **completado — 2026-06-23 (H0.7c).**

Implementado en H0.7c:
- `src/lib/authContext.tsx` — AuthProvider + useAuth hook con `getSession` + `onAuthStateChange` + `signOut`.
- `src/App.tsx` — envuelto en `<AuthProvider>`.
- `src/components/layout/MemberLayout.tsx` — email real en avatar, botón "Cerrar sesión" funcional.
- `src/components/layout/AdminLayout.tsx` — email + botón "Cerrar sesión" en sidebar.
- `src/routes/placeholderPages.tsx` LoginPage — muestra "Sesión iniciada" con opciones si ya hay sesión.

Limitaciones:
- Sin lectura de perfil/socio/rol/cuota.
- Sin protección real de rutas.
- Sin verificación de socio activo.

### P-H07-004 — Protección visual de rutas

Estado: **completado — 2026-06-23 (H0.7d).**

Implementado en H0.7d:
- `src/components/RequireAuth.tsx` — gate de sesión con loading / sin sesión / con sesión.
- `src/routes/AppRouter.tsx` — rutas privadas de socios y admin envueltas en `<RequireAuth>`.

Rutas protegidas: `/socios`, `/socios/*`, `/admin`, `/admin/*`.
Rutas públicas: `/login`, `/hazte-socio`.

**Importante:** `/admin` queda protegido solo por sesión. La protección por rol (`administrador`) sigue pendiente (P-H07-004b).

### P-H07-005 — Lectura de perfil/socio/rol

Estado: **completado — 2026-06-23 (H0.7f, corregido H0.7f.1).**

Implementado en H0.7f:
- `src/lib/identityContext.tsx` — IdentityProvider + useIdentity hook. Lee `profiles` + `members` vía RLS.
- 10 estados de acceso resueltos: loading, not_authenticated, authenticated_no_profile, authenticated_no_member, member_inactive, member_expired, member_active, board_member, admin, error.
- Permisos visuales: `canAccessMemberArea`, `canAccessBoardArea`, `canAccessAdmin`.
- `src/components/RequireMember.tsx` — gate para área socio (requiere sesión + perfil + socio activo + cuota vigente).
- `src/components/RequireAdmin.tsx` — gate para área admin (requiere sesión + perfil + rol administrador, sin ficha de socio necesaria).

Admin sin ficha de socio: tratado como operador admin (`status = 'admin'`, `canAccessAdmin = true`, `canAccessMemberArea = false`).

Limitación: validación funcional completa requiere usuario sintético (P-H07-007).

### P-H07-006 — Bloqueo real por socio activo/cuota vigente

Estado: deuda backend/RLS pendiente. Revisado en H0.7e.

Confirmado en `docs/h07e-identity-read-model-20260623.md` sección 8:

- Las helpers actuales validan `profiles.is_active` y rol (`current_app_role()`).
- **NO** validan `members.status = 'active'` ni `members.paid_until >= today`.
- Las policies de recursos visibles (`can_access_resource_by_visibility`) **NO** comprueban cuota.
- Un socio con rol `socio` y perfil activo pero cuota vencida **puede** técnicamente acceder a recursos vía RLS.

El frontend puede aplicar comprobación visual, pero el bloqueo real requiere:
- Nuevo helper `is_active_member_with_valid_quota()` o similar.
- Policies RLS que lo incorporen para recursos privados.
- WO backend específica con reviewer y autorización explícita.

### P-H07-007 — Usuario sintético/autorizado para pruebas

Estado: **U1 creado en staging — 2026-06-23 (H0.7h).**

Documentos:
- Diseño: `docs/h07g-staging-synthetic-users-design-20260623.md`
- Creación U1: `docs/h07h-staging-u1-admin-operator-creation-20260623.md`

U1 (admin operativo sin socio) creado y verificado técnicamente:
- Auth user: `acaspex.admin.demo@example.com`
- Profile: role `administrador`, is_active `true`, member_id `null`
- Email confirmado. Sin member.
- Pendiente validación funcional manual por Sil.

Pendientes U2-U6 según fases del diseño.

No crear usuarios reales ni seeds sin WO explícita.

### P-H07-008 — Orden correcto alta → socio → cuenta → perfil

Estado: decidido en contrato, pendiente de implementación futura.

El flujo aprobado es:

```text
solicitud aprobada
→ ficha de socio
→ cuenta de acceso
→ perfil vinculado
```

No construir automatismos que den acceso desde la solicitud pública sin revisión admin.

### P-H07-009 — Edición posterior de socios y roles

Estado: pendiente para panel admin.

Los roles no quedan fijados solo en el alta. Administración debe poder editar socios posteriormente porque puede cambiar:

- socio normal ↔ junta directiva;
- junta directiva ↔ administrador operativo;
- socio activo/inactivo;
- cuota/vigencia;
- estado de renovación.

No permitir autoservicio para asignación o retirada de roles.

### P-H07-010 — Gobernanza admin/junta sin superadmin

Estado: decidido en contrato, pendiente de implementación futura.

No habrá superadmin en el MVP. Los administradores serán personas muy seleccionadas de la junta directiva con delegación operativa.

Regla funcional:

```text
No toda persona de junta es administradora.
Toda persona administradora debe estar expresamente designada por la junta.
```

### P-H07-011 — Warning de build por chunk grande

Estado: no bloqueante.

El build puede avisar de chunks superiores a 500 kB. No bloquea H0.7b. Registrar como posible optimización futura:

- lazy loading por rutas;
- división de bundles;
- revisión de dependencias visuales.

No priorizar hasta que haya problema real de rendimiento.

### P-H07-012 — Higiene documental y repo sucio

Estado: pendiente transversal.

El repo mantiene documentos modificados/sin trackear y carpetas operativas no versionadas. Antes de commits importantes conviene una WO específica de higiene documental:

- decidir qué docs canónicos deben versionarse;
- evitar mezclar reports/outbox con código;
- no usar `git add .`;
- commit selectivo;
- revisar `PROJECT_STATE_CURRENT.md`, `decisions.md`, `backlog.md` y contrato auth.

### P-H07-013 — Documentos antiguos con decisiones superadas

Estado: pendiente documental.

Hay documentos antiguos que aún pueden mencionar:

- magic link como vía principal;
- `pending_payment` como estado principal;
- flujos preliminares previos al contrato auth.

No corregirlos de forma dispersa. Crear WO documental específica para alinear PRD/architecture/decisions con el contrato vigente.

### P-H07-014 — Administrador operativo sin ficha de socio

Estado: **decidido — 2026-06-23 (H0.7e.1).**

Clarificado en `docs/h07e-identity-read-model-20260623.md`:

- En el MVP se permite la existencia de administradores operativos sin ficha de socio (especialmente personas designadas para configurar, mantener o gestionar el portal).
- Este rol no equivale a socio ni a junta directiva, y no crea una figura de superadmin.
- El acceso al área admin requiere perfil activo con rol `administrador`, con independencia de que exista o no ficha de socio vinculada.
- El acceso al área de socios sigue requiriendo ficha de socio activa y cuota vigente.

El estado `authenticated_no_member` en el identity read model captura este caso correctamente.

