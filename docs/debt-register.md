# Registro de deuda — ACASPEX Portal Socios

Última actualización: 2026-07-03

Documento operativo que consolida la deuda técnica, de producto, de datos y de comunicación detectada en los bloques H0.7-H0.9G. No es narrativo eterno: cada entrada tiene severidad, prioridad y recomendación.

## Resumen ejecutivo

| ID | Título | Tipo | Estado | Severidad | Prioridad |
|----|--------|------|--------|-----------|-----------|
| D033 | SMTP-final / correo corporativo | infra/comunicación | open | alta para emails reales | **P1** |
| B4 | Reenvío/reset password | producto/auth | blocked_by_D033 | media | **P1** (post-D033) |
| D-H09G-002 | Operación no transaccional en renovación | técnica/datos | open | media-alta | **P1** |
| D-H09G-001 | Trigger 033 y `membership_start` NULL en reactivaciones | datos/producto | open | media | **P2** |
| RLS-H0.9 | RLS que bloquee por cuota vencida | seguridad/producto | deferred | media | **P2** |
| D-ACCESS-GRACE-001 | Periodo de gracia tras vencimiento | producto/acceso | accepted_pending_implementation | media | **P2** |
| D-H09E-001 | DELETE hardcoded en migración 045 | higiene migraciones | documented_observation | baja-media | **P3** |
| D-H09G-003 | Renovaciones sucesivas explícitas | producto/UX | open | baja | **P3** |
| D-H09G-004 | Sintéticos staging sin limpiar | datos | open | baja | **P3** |
| M-PERIODS | `membership_periods` no usada | arquitectura | deferred | baja | **P3** |
| M-STRIPE | Pagos online / Stripe / TPV | producto/infra | future | no aplica MVP | **P3** |
| H0.9E-HARD1 | Unique index payments validated por periodo | técnica | **closed** | resuelta | — |

## Deudas

### D-H09G-001 — Trigger 033 y `membership_start` NULL en reactivaciones

- **Tipo**: datos/producto
- **Estado**: open
- **Severidad**: media
- **Prioridad sugerida**: P2
- **Bloque origen**: H0.9G-F (staging)
- **Descripción precisa**: El trigger 033 (`set_member_activation_dates`) se ejecuta cuando `new.status = 'active'` y es INSERT u `old.status != 'active'`. Solo rellena `membership_start` si `new.membership_start IS NULL`. Solo rellena `paid_until` si `new.paid_until IS NULL`. En reactivaciones `expired` → `active`: si `membership_start` ya existe, NO se sobrescribe; si es NULL, se rellena con `current_date`. En H0.9G-F ocurrió porque el socio sintético `expired` (ACX-0010) tenía `membership_start = NULL`.
- **Impacto**: puede afectar a socios importados o sintéticos incompletos con `membership_start` NULL.
- **Decisión actual**: aceptado como comportamiento existente; el helper H0.9G-D no toca `membership_start`.
- **Opciones**:
  - A. Exigir `membership_start` antes de permitir renovar `expired`.
  - B. Ajustar trigger para no rellenar `membership_start` en UPDATE.
  - C. Mantener como está y documentarlo como saneamiento de datos incompletos.
- **Recomendación**: No bloquear MVP. Documentar en helper. Revisar si hay socios reales importados sin `membership_start`.
- **Cuándo abordarla**: cuando se aborden saneamientos de datos o se decida producto de importes.
- **Archivos relacionados**:
  - `supabase/migrations/20260625000033_033_acaspex_member_activation_dates.sql`
  - `src/lib/paymentActions.ts` (`registerValidatedPaymentForRenewal`)
  - `src/components/members/AdminMemberDetailPage.tsx`
- **Handoffs relacionados**:
  - `20260628-0006-h09e-f2-payments-functional-validation-handoff.md`
  - `20260703-0014-h09g-f-renewals-staging-validation-handoff.md`

### D-H09G-002 — Operación no transaccional en renovación

- **Tipo**: técnica/datos
- **Estado**: open
- **Severidad**: media-alta
- **Prioridad sugerida**: P1
- **Bloque origen**: H0.9G-D
- **Descripción**: `registerValidatedPaymentForRenewal` ejecuta `INSERT payments` y `UPDATE members` en dos llamadas separadas (sin RPC transaccional).
- **Impacto**: si `UPDATE members` falla tras `INSERT payments`, el payment queda validado pero `member.paid_until` no se actualiza. No se hace DELETE compensatorio. El admin recibe `code: 'member_update_failed'` y debe actualizar manualmente.
- **Decisión actual**: deuda aceptada; se documenta el riesgo en el handoff de H0.9G-D.
- **Opciones**:
  - A. Crear RPC PostgreSQL transaccional (`register_renewal_payment(member_id, ...)`).
  - B. Edge Function con service_role que haga ambas operaciones en una sola llamada.
  - C. Mantener como está hasta volumen real.
- **Recomendación**: resolver antes de producción real con volumen o antes de automatizar pagos online (Stripe).
- **Cuándo abordarla**: P1, especialmente si se decide registrar renovaciones reales con frecuencia.
- **Archivos relacionados**:
  - `src/lib/paymentActions.ts` (`registerValidatedPaymentForRenewal`)
  - `supabase/functions/` (si se opta por opción B)
- **Handoffs relacionados**:
  - `20260703-0011-h09g-d-renewal-payment-helper-handoff.md`

### D-H09G-003 — Renovaciones sucesivas explícitas

- **Tipo**: producto/UX
- **Estado**: open
- **Severidad**: baja
- **Prioridad sugerida**: P3
- **Bloque origen**: H0.9G-F (observación)
- **Descripción**: cada confirmación de renovación añade un año más (helper calcula desde `paid_until` actual). La UI bloquea click concurrente (`disabled={renewingPayment}`), pero una segunda renovación posterior es posible y puede ser legítima.
- **Impacto**: comportamiento correcto pero puede sorprender al admin si renueva dos veces seguidas por error. Riesgo bajo.
- **Decisión actual**: aceptado.
- **Opciones**:
  - A. Mejorar copy: "Esta acción renueva por un año desde el paid_until actual."
  - B. Bloquear si ya se renovó hace menos de N horas/días.
  - C. Mostrar advertencia si `last_payment` fue en los últimos X días.
- **Recomendación**: añadir copy A como mejora de UX; no bloquear en MVP.
- **Cuándo abordarla**: cuando se decida hacer UX pass general.
- **Archivos relacionados**:
  - `src/components/members/AdminMemberDetailPage.tsx`
- **Handoffs relacionados**:
  - `20260703-0014-h09g-f-renewals-staging-validation-handoff.md`

### D-H09G-004 — Sintéticos staging sin limpiar

- **Tipo**: datos/staging
- **Estado**: open
- **Severidad**: baja
- **Prioridad sugerida**: P3
- **Bloque origen**: H0.9G-F
- **Descripción**: durante la validación staging de H0.9G-F se crearon 2 socios sintéticos y 2 pagos nuevos que quedan en staging.
- **Datos afectados**:
  - `a7e43725-1d3c-424a-b8ad-6de1a9f5034e` → ACX-0010 (`notes='H0.9G-F staging validation synthetic'`)
  - `e26ef8a7-c0a4-4fbc-9b5d-5e8b6b1a8e5f` → ACX-0011 (`notes='H0.9G-F staging validation synthetic (cancelled state)'`)
  - Pago `06ef8d0d` (ACX-0009, periodo 2027-06-29 → 2028-06-28)
  - Pago `c9369085` (ACX-0010, periodo 2026-05-16 → 2027-05-15)
- **Decisión actual**: no limpiar con DELETE sin autorización explícita.
- **Opciones**:
  - A. Mantener documentados.
  - B. Limpieza controlada con script y autorización.
  - C. Mover a un entorno "smoke" separado.
- **Recomendación**: mantener hasta que haya un caso de uso para limpieza o un script de smoke.
- **Cuándo abordarla**: cuando se decida limpieza general de staging.
- **Archivos relacionados**: ninguno en repo (datos solo en Supabase).
- **Handoffs relacionados**:
  - `20260703-0014-h09g-f-renewals-staging-validation-handoff.md`

### D033 — SMTP-final / correo corporativo

- **Tipo**: infra/comunicación
- **Estado**: open
- **Severidad**: alta para emails reales (invitaciones, recordatorios)
- **Prioridad sugerida**: P1
- **Bloque origen**: D033 (decisión diferida desde H0.7)
- **Descripción**: el correo corporativo de ACASPEX sigue sin configurar. Afecta al flujo de invitaciones de acceso (H0.9C) y a cualquier futuro email automático.
- **Incluye**:
  - `acaspex@outlook.es` (pendiente de configuración)
  - Templates de email
  - Redirect URLs
  - Validación presencial con Ana T
- **Bloquea**:
  - B4 (reenvío/reset password)
  - Emails automáticos (recordatorios de renovación)
  - Confirmaciones reales de invitación a portal
- **Decisión actual**: diferido. Sin workaround inseguro. Sin cuenta personal.
- **Recomendación**: abordar antes de explotación real con socios. No implementar nada que dependa de SMTP hasta entonces.
- **Cuándo abordarla**: bloqueante para B4, P1 para emails reales.
- **Archivos relacionados**:
  - `docs/decisions.md` (si existe), `docs/h07-...`, `docs/h09c-...`
  - `supabase/functions/create-member-access/index.ts` (usa `auth.admin.inviteUserByEmail`)
- **Handoffs relacionados**: múltiples a lo largo de H0.7-H0.9G.

### B4 — Reenvío/reset password

- **Tipo**: producto/auth
- **Estado**: blocked_by_D033
- **Severidad**: media
- **Prioridad sugerida**: P1 (después de D033)
- **Bloque origen**: B4 (decisión diferida)
- **Descripción**: flujo de recuperación de contraseña no implementado. Supabase Auth lo soporta nativamente pero requiere SMTP configurado.
- **Bloquea**: nada crítico en MVP actual (admin crea acceso manualmente).
- **Decisión actual**: no implementar hasta SMTP-final (D033).
- **Recomendación**: una vez D033 resuelto, implementar flujo de Supabase Auth `resetPasswordForEmail` con templates de email.
- **Cuándo abordarla**: post-D033.
- **Archivos relacionados**:
  - `src/routes/placeholderPages.tsx` (LoginPage)
  - `src/lib/authContext.tsx`
- **Handoffs relacionados**:
  - `20260626-xxxx-h07-auth-contract-handoff.md` (si existe)

### D-H09E-001 — DELETE hardcoded en migración 045

- **Tipo**: higiene migraciones/datos
- **Estado**: documented_observation
- **Severidad**: baja-media
- **Prioridad sugerida**: P3
- **Bloque origen**: H0.9E-HARD1
- **Descripción**: la migración 045 contiene `DELETE FROM public.payments WHERE id = 'a3057487-...'`. Es un cleanup puntual de staging, hardcoded.
- **Matiz**: no revertir migración ya aplicada. No normalizar patrón. En otros entornos el DELETE es inerte (0 filas afectadas).
- **Decisión actual**: documentado, sin acción.
- **Opciones**:
  - A. Mantener como está (recomendada — bajo impacto real).
  - B. Documentar en comment del archivo SQL que es cleanup histórico.
  - C. Patrón idempotente futuro con `WHERE id IN (SELECT id WHERE ...)`.
- **Recomendación**: futuras limpiezas con patrón idempotente. La actual no tocar.
- **Cuándo abordarla**: cuando se hagan más migraciones que necesiten cleanup.
- **Archivos relacionados**:
  - `supabase/migrations/20260703000045_045_acaspex_payments_validated_unique_index.sql`
- **Handoffs relacionados**:
  - `20260703-0006-h09e-hard1-payments-unique-index-blocked-data.md`
  - `20260703-0007-h09e-hard1-payments-unique-index-handoff.md`

### M-PERIODS — `membership_periods` no usada

- **Tipo**: arquitectura/producto
- **Estado**: deferred
- **Severidad**: baja
- **Prioridad sugerida**: P3
- **Bloque origen**: H0.1 (schema), H0.9G-A-VERIFY
- **Descripción**: la tabla `membership_periods` existe con policies RLS (`007_*)` e índices, pero la app no la usa. Tiene campos: `member_id`, `payment_id`, `period_start`, `period_end`, `status`, `notes`.
- **Decisión actual**: deferred. `payments` cubre la trazabilidad actual.
- **Recomendación**: no usar hasta decidir si se necesita historial formal más allá de `payments`.
- **Cuándo abordarla**: cuando se necesite modelar ciclos de membresía explícitos (no solo pagos).
- **Archivos relacionados**:
  - `supabase/migrations/20260622000001_001_acaspex_schema.sql`
  - `supabase/migrations/20260622000007_007_acaspex_membership_periods_policies.sql`
- **Handoffs relacionados**:
  - `20260703-0009-h09g-a-verify-renewals-audit-handoff.md`


### D-ACCESS-GRACE-001 — Periodo de gracia tras vencimiento

- **Tipo**: producto/acceso
- **Estado**: accepted_pending_implementation
- **Severidad**: media
- **Prioridad sugerida**: P2
- **Bloque origen**: H0.9I-A (decisión producto)
- **Descripción**: se acepta conceptualmente un periodo de gracia tras `paid_until` antes de bloquear acceso de forma radical.
- **Decisión actual**: propuesta aceptada de 30 días de margen.
- **Regla futura propuesta**:
  - hasta `paid_until`: cuota vigente;
  - de `paid_until + 1` a `paid_until + 30`: vencido en gracia, acceso permitido con aviso;
  - después de `paid_until + 30`: acceso bloqueado.
- **Impacto**: evita cortar acceso de forma abrupta y da margen operativo a secretaría y al socio.
- **Opciones**:
  - A. Implementar gracia calculada sin columna nueva (`paid_until + 30 días`).
  - B. Añadir campo configurable si la Junta quiere variar el margen por socio/caso.
  - C. Mantener bloqueo inmediato (descartado conceptualmente por ahora).
- **Recomendación**: documentar y abordar en WO futura de acceso/vigencia. No mezclar con importación legacy ni SMTP.
- **Cuándo abordarla**: antes de explotación real con socios si se quiere bloqueo automático por cuota.
- **Archivos relacionados**:
  - `src/lib/identityContext.tsx`
  - `src/lib/memberQueries.ts`
  - `src/components/members/AdminMembersPage.tsx`
- **Handoffs relacionados**:
  - `20260703-0016-h09h-debt-register-handoff.md`

### RLS-H0.9 — RLS por cuota vencida

- **Tipo**: seguridad/producto
- **Estado**: deferred/needs_decision
- **Severidad**: media
- **Prioridad sugerida**: P2
- **Bloque origen**: H0.7e (deuda P-H07-006), H0.9G-A
- **Descripción**: el control principal de acceso por cuota vive en frontend (`IdentityProvider` + `RequireMember` en `src/lib/identityContext.tsx`), no como enforcement duro en RLS de `resources` o Storage.
- **Impacto**: un socio con rol `socio` y perfil activo pero cuota vencida puede técnicamente acceder a recursos privados vía RLS actuales. El frontend bloquea visualmente pero no a nivel backend.
- **Decisión actual**: deferred hasta decisión explícita de producto.
- **Opciones**:
  - A. Implementar `is_active_member_with_valid_quota()` en RLS policies.
  - B. Mantener control solo en frontend.
  - C. Bloquear en `profiles.is_active` cuando cuota vencida (ya implementado vía H0.9C-B3).
- **Recomendación**: P2, decidir antes de producción con recursos privados sensibles.
- **Cuándo abordarla**: cuando se decida endurecer seguridad backend.
- **Archivos relacionados**:
  - `supabase/migrations/20260622000009_009_acaspex_resource_access_helpers.sql`
  - `supabase/migrations/20260622000018_018_acaspex_storage_resource_files_policies.sql`
  - `src/lib/identityContext.tsx`
  - `docs/h07e-identity-read-model-20260623.md`
- **Handoffs relacionados**:
  - `20260624-0000-h09a-members-admin-audit-handoff.md` (si existe)

### M-STRIPE — Pagos online / Stripe / TPV

- **Tipo**: producto/infra/pagos
- **Estado**: future
- **Severidad**: no aplica MVP actual
- **Prioridad sugerida**: P3
- **Bloque origen**: M09 (backlog)
- **Descripción**: integración con Stripe Checkout o TPV para pagos online. Requiere API keys, webhooks, configuración de Supabase Edge Functions para recibir eventos.
- **Decisión actual**: no activar sin autorización explícita.
- **Recomendación**: fase posterior al MVP. Requiere decisión de producto sobre comisiones, modelo de pagos, etc.
- **Cuándo abordarla**: post-MVP, con decisión de negocio clara.
- **Archivos relacionados**: ninguno en repo todavía.
- **Handoffs relacionados**: ninguno.

### H0.9E-HARD1 — Unique index payments validated por periodo

- **Tipo**: técnica
- **Estado**: **closed**
- **Severidad**: resuelta
- **Descripción**: índice único parcial `payments_validated_member_period_uidx` implementado en migración 045 (commit `865dde6`).
- **Matiz**: la migración 045 contiene un DELETE hardcoded de staging (ver D-H09E-001), pero el index funciona correctamente y previene duplicados a nivel DB.
- **Recomendación**: mantener como referencia cerrada. No reactivar.
- **Cuándo abordarla**: N/A.
- **Archivos relacionados**:
  - `supabase/migrations/20260703000045_045_acaspex_payments_validated_unique_index.sql`
- **Handoffs relacionados**:
  - `20260703-0007-h09e-hard1-payments-unique-index-handoff.md`

## Decisiones producto H0.9I-A

Ver `docs/h09i-decisions-legacy-import-20260703.md`. Decisiones principales:

- `membership_start` = fecha histórica de alta como socio de ACASPEX, no alta en portal.
- `paid_until` = fecha hasta la que la cuota está pagada.
- La validación del justificante sigue siendo manual por admin/Ana T.
- Renovaciones sucesivas explícitas permitidas: cada confirmación añade un año.
- Periodo de gracia conceptual aceptado: 30 días tras vencimiento.
- No usar `membership_periods` en MVP.
- No limpiar staging todavía.
- SMTP-final queda diferido hasta reunión con Ana T. y correo corporativo.

## Priorización recomendada

### P1 (abordar pronto)

1. **D033 SMTP-final** — bloqueante para emails reales, invitaciones, B4.
2. **D-H09G-002** (RPC transaccional) — si se van a registrar renovaciones reales con frecuencia.
3. **B4** (reenvío/reset password) — post-D033.

### P2 (decidir y abordar)

1. **D-H09G-001** (trigger/membership_start NULL) — revisar si hay socios reales importados sin `membership_start`.
2. **D-ACCESS-GRACE-001** (periodo de gracia 30 días) — decisión aceptada, pendiente de implementar.
3. **RLS-H0.9** (RLS por cuota vencida) — antes de producción con recursos privados sensibles.

### P3 (cuando se decida)

1. **D-H09G-003** (copy/control renovaciones sucesivas) — mejora de UX.
2. **D-H09G-004** (sintéticos staging) — limpieza cuando se autorice.
3. **D-H09E-001** (DELETE hardcoded) — sin acción, solo documentar.
4. **M-PERIODS** (membership_periods no usada) — decidir si se necesita.
5. **M-STRIPE** (pagos online) — fase posterior, decisión de negocio.
