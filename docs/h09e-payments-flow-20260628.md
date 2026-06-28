# H0.9E — Flujo de validación de pago manual

Última actualización: 2026-06-28
Status: validated — H0.9E-F3 completado

## Objetivo

Registrar la trazabilidad económica formal de una cuota en la tabla `payments` mediante una acción administrativa separada de la creación del socio.

## Decisión de producto

La aprobación de una solicitud de alta (H0.9D) crea el miembro administrativo. El registro formal del pago es una acción independiente ejecutada por administración tras revisar el justificante de transferencia.

No se mezclan la decisión administrativa de alta con la trazabilidad económica.

## Estado

### H0.9E-A — Auditoría ✓

- Schema `payments` correcto y completo.
- Políticas RLS admin-only existentes.
- **Gap detectado**: faltaban grants de tabla para `authenticated`.

### H0.9E-B — Grants ✓

- Migración 044: `GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated`.
- Sin DELETE. Sin grants a `anon`.
- Aplicada en staging.

### H0.9E-C — Helper ✓

- `src/lib/paymentModel.ts` — tipos, enums, helper de cuota.
- `src/lib/paymentActions.ts` — `registerValidatedPayment(input)`.
- Validaciones: sesión admin, fechas del member, duplicados, importe, justificante.
- Payment creado directamente con `status = validated` (lo ejecuta admin).

### H0.9E-D — UI desde solicitud aprobada ✓

- Botón "Registrar pago validado" en `AdminSignupDetailPage`.
- Visible solo si `signup.status = approved` y `approved_member_id` existe.
- Estados: cargando, éxito, error, duplicado.

### H0.9E-E — UI desde ficha de socio ✓

- Botón "Registrar pago validado" en `AdminMemberDetailPage`.
- Visible solo si `member.status = active` con `membership_start` y `paid_until`.
- Sin `signupRequestId` (sirve para socios manuales y existentes).

### H0.9E-F — Migraciones en staging ✓

- Migraciones 043 (signup_requests grants) y 044 (payments grants) aplicadas.
- Proyecto: `oxbsbvbrljzvfqpdozgl` (acaspex-portal-staging).

### H0.9E-F2 — Validación funcional desde ficha de socio ✓

- Payment `a3057487` creado para member `1e2f14a7`.
- Campos verificados. Duplicado bloqueado a nivel app.

### H0.9E-F3 — Validación funcional desde solicitud aprobada ✓

- Flujo completo: `signup 460386a8 → approved → member ACX-0009 → payment 1a53a95a`.
- Campos verificados. Duplicado bloqueado. Exclusiones confirmadas.

## Qué permite ahora el sistema

- Admin puede registrar un payment validado desde una solicitud aprobada.
- Admin puede registrar un payment validado desde la ficha de socio.
- El payment se crea con `payment_status = validated`.
- El payment usa `payment_method = bank_transfer`.
- El periodo se deriva de `member.membership_start` y `member.paid_until`.
- `validated_by` y `validated_at` quedan rellenos automáticamente.
- `receipt_file_path` se hereda del miembro o de la solicitud si existe.
- El duplicado para el mismo periodo se bloquea a nivel de aplicación.
- Las políticas RLS limitan el acceso a administradores.

## Relación con H0.9D

```
H0.9D: signup_request → aprobar → member active
H0.9E: member active → registrar payment validado
```

H0.9D gestiona la decisión administrativa de alta. H0.9E registra la trazabilidad económica. Son acciones independientes que no se mezclan.

## Exclusiones

- No crea `auth.users`.
- No crea `profiles`.
- No envía emails.
- No toca SMTP.
- No usa Stripe / pasarelas de pago.
- No usa `service_role`.
- No usa `auth.admin`.
- No toca Jornadas.
- No tiene política de DELETE sobre payments.

## Deuda técnica

### H0.9E-HARD1 — Constraint de unicidad en DB

Actualmente el bloqueo de duplicados se hace a nivel de aplicación (consulta previa al INSERT). No existe un constraint o índice único en la base de datos para `(member_id, payment_period_start)` con `payment_status != 'rejected'`.

Esto es suficiente para el uso administrativo del MVP, pero no protege contra ejecuciones simultáneas. Se difiere a una WO de hardening posterior.

## Migraciones nuevas

- 044: `GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated`.

## Archivos creados

- `src/lib/paymentModel.ts`
- `src/lib/paymentActions.ts`

## Archivos modificados

- `src/routes/placeholderPages.tsx` — `AdminSignupDetailPage` (sección pago)
- `src/components/members/AdminMemberDetailPage.tsx` — sección pago
