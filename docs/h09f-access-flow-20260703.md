# H0.9F — Acceso al portal desde socio aprobado / pagado

Última actualización: 2026-07-03
Status: done — H0.9F-D cierre documental

## Objetivo

Exponer al administrador el acceso al portal del socio desde dos puntos de entrada (ficha de socio y solicitud aprobada) y mostrar el estado de pago validado en la ficha. No reconstruir la creación de acceso: reutilizar el flujo implementado en H0.9C.

## Decisión de producto

La elegibilidad para crear acceso al portal se mantiene como:

```
member.status = active
AND member.paid_until >= today
AND member.email no null
```

`payments` actúa como **trazabilidad económica** y como **señal administrativa**, no como gate estricto de acceso. Esto permite escenarios como:
- Socio aprobado y acceso creado antes de registrar el pago (admin puede crear acceso y luego registrar pago).
- Socio con pago validado pero sin acceso (admin puede crear acceso manualmente).

## Estado

### H0.9F-A — Auditoría ✓

- Funcionalidad ya implementada en H0.9C (`create-member-access` Edge Function, `createMemberAccess()` helper).
- UI ya implementada en `AdminMemberDetailPage` (crear/bloquear/desbloquear, estado, último acceso).
- Recomendación: H0.9F debe ser refinamiento ligero, no reimplementación.

### H0.9F-B — Botón acceso desde solicitud aprobada ✓

- Sección "Acceso al portal" en `AdminSignupDetailPage` cuando la solicitud está aprobada.
- Llama a `createMemberAccess(approved_member_id)`.
- Distingue `already_exists` del helper.
- Aviso SMTP/D033 incluido.

### H0.9F-C — Indicador pago validado en ficha ✓

- Nuevo helper read-only `fetchValidatedPaymentForMemberPeriod()`.
- UI con 5 estados: `validated`, `missing`, `duplicate`, `not_applicable`, `error`.
- Auto-refresh tras registrar pago.
- No cambia gate de acceso.

### H0.9F-D — Documentación cierre ✓

- Este documento.

## Flujo completo

```
1. Signup público /hazte-socio
2. Admin aprueba solicitud (H0.9D-H) → crea member active
3. Admin registra pago validado (H0.9E) → crea payments row
4. Admin crea acceso al portal (H0.9C/H0.9F):
   - desde /admin/socios/:memberId, o
   - desde /admin/solicitudes/:signupId (si approved)
5. Socio recibe email invitación (cuando SMTP-final D033 esté configurado)
6. Socio accede al portal
7. Admin puede bloquear/desbloquear acceso en cualquier momento
```

## Arquitectura de acceso (reutilizada de H0.9C)

```
AdminMemberDetailPage / AdminSignupDetailPage
  → createMemberAccess(memberId)  [src/lib/memberAccessActions.ts]
    → Edge Function create-member-access  [service_role aquí]
      → verifica admin caller (token + profiles.role)
      → valida member (active + paid_until vigente + email)
      → check profile existente (idempotente)
      → auth.admin.inviteUserByEmail(email) → crea auth.user + envía invitación
      → INSERT profile (role=socio, is_active=true)
      → rollback auth.user si falla profile
```

### Seguridad

- ✅ `service_role` solo en Edge Function
- ✅ Frontend sin `service_role` / `auth.admin` / `createUser`
- ✅ RLS profiles limita a admin
- ✅ Admin no puede bloquearse a sí mismo
- ✅ Token de admin verificado en cada invocación de Edge Function

## UI

### `/admin/socios/:memberId`

Sección "Acceso al portal" (existente desde H0.9C):
- Estado: sin acceso / activo / bloqueado
- Botón: Crear acceso / Enviar invitación
- Botón: Bloquear / Desbloquear acceso
- Datos: email, rol, invitado, último acceso

Sección "Pago de la cuota" (existente desde H0.9B/E):
- Indicador de pago validado para periodo vigente (H0.9F-C)
  - `validated`: importe, fecha, método, justificante
  - `missing`: aviso + opción de registrar
  - `duplicate`: aviso de revisión
  - `not_applicable`: socio sin fechas
  - `error`: error de consulta
- Botón: Registrar pago validado

### `/admin/solicitudes/:signupId`

Cuando `status = approved` y `approved_member_id` existe:
- Sección "Solicitud aprobada" con enlace a ficha de socio
- Sección "Pago de la cuota" con botón "Registrar pago validado" (H0.9E-D)
- Sección "Acceso al portal" con botón "Crear acceso / Enviar invitación" (H0.9F-B)

## Exclusiones

- No crea `auth.users` desde frontend
- No crea `profiles` desde frontend
- No envía emails desde frontend
- No toca SMTP
- No usa Stripe
- No toca pagos (solo lectura en H0.9F-C)
- No toca miembros
- No toca solicitudes (salvo lectura)
- No toca RLS ni grants
- No toca Jornadas

## SMTP / D033

La Edge Function usa `auth.admin.inviteUserByEmail()` que requiere SMTP. Mientras el correo corporativo de ACASPEX no esté configurado (D033):
- ✅ `auth.user` se crea
- ✅ `profile` se crea
- ⚠️ La invitación por email puede no entregarse
- ⚠️ El socio no podrá establecer contraseña ni hacer login

No configurar SMTP ahora. No usar cuenta personal. No workaround inseguro.

## Relación con H0.9E

H0.9E registra la trazabilidad económica en `public.payments`. H0.9F muestra ese estado en la ficha del socio de forma informativa. La elegibilidad de acceso no se calcula desde `payments`, sino desde `members.paid_until` (que es la fuente de verdad operativa).

## Deudas posteriores

| Deuda | Descripción |
|-------|-------------|
| **H0.9E-HARD1** | Unique index/constraint `(member_id, payment_period_start)` WHERE `payment_status != 'rejected'`. El check app-level cubre el caso normal pero no blinda concurrencia. |
| **SMTP-final D033** | Configuración de correo corporativo para invitaciones reales. Bloquea el flujo de "socio accede al portal" en la práctica. |
| **H0.9G** | Renovaciones, vencimientos y control de cuotas para socios existentes. |

## Archivos creados

- `src/lib/paymentQueries.ts`

## Archivos modificados

- `src/routes/placeholderPages.tsx` — `AdminSignupDetailPage` (H0.9F-B)
- `src/components/members/AdminMemberDetailPage.tsx` — sección pago (H0.9E + H0.9F-C)

## Siguiente bloque recomendado

Opción 1: **H0.9E-HARD1** — Constraint DB de unicidad. ~15 min, blinda pagos antes de producción.

Opción 2: **H0.9G-A** — Auditoría de renovaciones y vencimientos. Bloque más amplio que cubre el ciclo de vida del socio más allá del alta.
