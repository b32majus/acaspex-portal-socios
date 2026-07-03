# H0.9G — Renovaciones, vencimientos y control de cuotas

Última actualización: 2026-07-03
Status: validated_with_observations — bloque cerrado con deudas documentadas

## 1. Estado del bloque

| WO | Status | Commit |
|----|--------|--------|
| H0.9G-A | done | (audit) |
| H0.9G-A-VERIFY | done | (verificación independiente) |
| H0.9G-B | done + pushed | `fc85bb6` — feat: add member validity status query |
| H0.9G-C | done + pushed | `75c156c` — feat: show member validity status in admin list |
| H0.9G-D | done + pushed | `49dcc0f` — feat: add validated renewal payment helper |
| H0.9G-E | done + pushed | `be7a296` — feat: add member renewal action |
| H0.9G-E-FIX1 | done + pushed | `b00c3c6` — fix: clarify renewal period copy |
| H0.9G-F | verified_with_observations | staging validation |

## 2. Decisiones de producto cerradas

1. **No cambiar `status` automáticamente por fecha.** El `status` se mantiene en `active` mientras el socio pueda renovar. Admin decide manualmente.
2. **Vigencia operativa** = `status` + `paid_until` (no un campo derivado nuevo).
3. **Próximo a vencer** = 30 días (`RENEWAL_NOTICE_DAYS`).
4. **Renovación es acción explícita de admin** con `window.confirm()`.
5. **Renovación crea un nuevo `payment` `validated`** con periodo nuevo.
6. **Renovación actualiza `members.paid_until`** al nuevo valor.
7. **Renovación no toca `members.membership_start` directamente** (el helper no lo hace; ver D-H09G-001 sobre el trigger 033).
8. **Si `member.status === 'expired'`**, el helper lo pasa a `active` (reactivación explícita por admin).
9. **No emails automáticos.** D033 SMTP sigue diferido.
10. **No `membership_periods` todavía** — la tabla existe con policies pero no se usa.
11. **No limpieza automática de sintéticos staging** — los sintéticos quedan documentados (ver D-H09G-004).

## 3. Modelo de vigencia

Cuatro estados derivados de `member.status` + `member.paid_until`:

| Estado | Condición | Color UI |
|--------|-----------|----------|
| **Vigente** | `status = 'active'` AND `paid_until > today + 30 días` | Verde |
| **Próximo a vencer** | `status = 'active'` AND `today <= paid_until <= today + 30 días` | Ámbar |
| **Vencido** | `status = 'expired'` OR `status = 'active'` con `paid_until < today` (o NULL) | Rojo |
| **Inactivo** | `status ∈ {pending_review, inactive, cancelled}` | Gris |

Helper: `getMemberValidityStatus(member, todayIso)` en `src/lib/memberQueries.ts`.

## 4. Regla de renovación

```
old_paid_until = members.paid_until (valor actual)
new_period_start = old_paid_until + 1 día
new_period_end   = old_paid_until + 12 meses
payment.paid_until = new_period_end
members.paid_until = new_period_end
```

**Importante**:
- La renovación parte de `paid_until` actual, NO de `today`.
- Para socios vencidos hace tiempo, no se rellena el hueco retroactivo.
- El histórico queda contiguo (un día después del vencimiento anterior).
- No se borran pagos anteriores; el pago antiguo queda como histórico.

## 5. Helper `registerValidatedPaymentForRenewal`

```ts
registerValidatedPaymentForRenewal(input: {
  memberId: string;
  amount?: number | null;
  receiptFilePath?: string | null;
  notes?: string | null;
}): Promise<RegisterValidatedPaymentResult>
```

| Caso | Comportamiento |
|------|---------------|
| `status = 'active'` | Permite renovación |
| `status = 'expired'` | Permite renovación + cambia a `active` |
| `status ∈ {pending_review, inactive, cancelled}` | Error `member_status_invalid` |
| Sin `paid_until` | Error `member_missing_dates` |
| `amount <= 0` | Error `invalid_amount` |
| Duplicado en mismo periodo | Error `duplicate_payment_period` (bloqueado por H0.9E-HARD1 unique index) |
| `UPDATE member` falla tras `INSERT payment` | `ok: false, code: 'member_update_failed'`, payment queda registrado |

## 6. UI admin

### Listado (`AdminMembersPage.tsx`)

- Filtro de vigencia: 5 opciones (Todos / Cuota vigente / Próximo a vencer / Cuota vencida / Inactivo).
- Columna "Vigencia" con badge (label) + detalle de días ("Quedan N", "Vence hoy", "Venció hace N").
- Combinable con los 5 filtros existentes (búsqueda, estado, perfil, organización, categoría).

### Ficha de socio (`AdminMemberDetailPage.tsx`)

- Sección "Renovación de cuota" visible solo si:
  - `status === 'active' || status === 'expired'`
  - `paid_until` existe
- Muestra `paid_until actual` y `Nuevo paid_until (estimado)` (= paid_until + 12 meses).
- Botón "Registrar renovación" con `window.confirm()` que muestra fechas exactas.
- Botón `disabled={renewingPayment}` durante la acción.
- Tras éxito: `fetchAdminMemberById` + `fetchValidatedPaymentForMemberPeriod` refrescan member + indicador de pago.
- Errores mapeados via `mapRenewalError()`: `member_status_invalid`, `duplicate_payment_period`, `member_update_failed`, `member_missing_dates`, `invalid_amount`, `no_session`, `not_configured`, `insert_failed`.

## 7. Validación staging H0.9G-F

| Caso | Resultado |
|------|-----------|
| A. `active` → renovación | ✅ OK. `d960e48f` (ACX-0009): paid_until 2027-06-28 → 2028-06-28. Pago `06ef8d0d` creado. |
| B. `expired` → active + renovación | ✅ OK. `a7e43725` (ACX-0010 sintético): paid_until 2026-05-15 → 2027-05-15. status `expired` → `active`. Pago `c9369085` creado. |
| C. `cancelled` (no renovable) | ✅ OK. Helper retorna `member_status_invalid`. UI no renderiza sección. |
| D. Doble click / duplicado | ✅ OK. Unique index `payments_validated_member_period_uidx` bloquea. Triple protección (UI, app, DB). |
| E. Refresh UI | ✅ OK. `fetchAdminMemberById` + `fetchValidatedPaymentForMemberPeriod` secuencial. |

### IDs documentados

| Tipo | ID | Detalle |
|------|----|---------|
| Real pre-existente | `d960e48f` (ACX-0009) | Caso A |
| Sintético nuevo | `a7e43725` (ACX-0010) | Caso B. `notes='H0.9G-F staging validation synthetic'` |
| Sintético nuevo | `e26ef8a7` (ACX-0011) | Caso C. `notes='H0.9G-F staging validation synthetic (cancelled state)'` |
| Pago nuevo | `06ef8d0d` | ACX-0009, periodo 2027-06-29 → 2028-06-28 |
| Pago nuevo | `c9369085` | ACX-0010, periodo 2026-05-16 → 2027-05-15 |

**No se hizo DELETE durante la validación.** Los sintéticos quedan en staging. Limpieza opcional futura solo con autorización explícita.

## 8. Deudas / observaciones

### D-H09G-001 — Trigger 033 y `membership_start` NULL en reactivaciones

**Descripción precisa**:
- El trigger 033 (`set_member_activation_dates`) se ejecuta cuando `new.status = 'active'` y es INSERT u `old.status != 'active'`.
- Solo rellena `membership_start` si `new.membership_start IS NULL`.
- Solo rellena `paid_until` si `new.paid_until IS NULL`.
- Por tanto, en reactivaciones `expired` → `active`:
  - Si `membership_start` ya existe, **NO se sobrescribe**.
  - Si `membership_start` está NULL, se rellena con `current_date`.
- En H0.9G-F ocurrió porque el socio sintético `expired` tenía `membership_start = NULL`.

**Impacto**: puede afectar a socios importados/sintéticos incompletos sin `membership_start`.

**Decisión**: No bloquea MVP. Revisar si se quiere preservar fecha histórica de alta en importaciones incompletas.

**Opciones futuras**:
- A. Exigir `membership_start` antes de permitir renovar `expired`.
- B. Ajustar trigger para no rellenar `membership_start` en UPDATE.
- C. Mantener como está y documentarlo como saneamiento de datos incompletos.

### D-H09G-002 — Operación no transaccional — CERRADA en H0.9I-D/E

Resuelta en commit `dc4996a` (H0.9I-D). Implementada la función PostgreSQL `public.register_validated_renewal_payment(uuid, numeric, text, text)` en migración 046. La RPC ejecuta `INSERT payments` + `UPDATE members` en una sola transacción atómica. Validada en staging con 10 casos (H0.9I-E) → `verified_with_observations`.

Flujo actual del frontend:
1. Admin confirma renovación en `AdminMemberDetailPage`.
2. `registerValidatedPaymentForRenewal` en `src/lib/paymentActions.ts` llama a `supabase.rpc('register_validated_renewal_payment', {...})`.
3. La RPC valida admin (`auth.uid()` + `public.is_admin()`), bloquea el member con `select ... for update`, calcula el nuevo periodo, inserta el payment, actualiza el member. Todo en una sola transacción.
4. Si cualquier paso falla, rollback completo.
5. Helper mapea errores: `duplicate_payment_period` (23505), `member_not_found` (P0002), `member_status_invalid`/`member_missing_dates`/`invalid_amount` (P0001), `no_session` (28000), `forbidden_not_admin` (42501), `renewal_rpc_failed` (fallback).

Mantener reglas originales:
- Renovaciones sucesivas permitidas (cada click +12m desde `paid_until` actual).
- `paid_until + 12 meses`. No desde `today`.
- No emails automáticos.
- No DELETE.
- No `membership_periods`.
- No automatiza validación de justificantes (sigue manual por admin/Ana T).
- Si `expired`, pasa a `active`.
- No toca `membership_start` explícitamente.

Ver detalles completos en `docs/debt-register.md` y handoffs `20260703-0019-h09i-d` y `20260703-0020-h09i-e`.

### D-H09G-003 — Renovaciones sucesivas explícitas

Cada click confirmado renueva un año más (helper calcula desde `paid_until` actual). La UI ya bloquea click concurrente, pero una segunda renovación posterior es posible y puede ser legítima. **Deuda**: copy adicional o aviso si ya se renovó recientemente. Copy mejorado en H0.9I-B (commit `8e2e781`): la UI ahora comunica explícitamente que cada confirmación añade un año más a la vigencia actual.

### D-H09G-004 — Sintéticos staging

Sintéticos de H0.9G-F (ACX-0010, ACX-0011) + nuevos de H0.9I-E (ACX-0012 a ACX-0015) + pagos sintéticos (`06ef8d0d`, `c9369085`, `3c98b2c9`, `06abe8ca`, `7fb10b66`, `34cb02b5`, `69dff25b`). Total 6 sintéticos en staging. **No limpiar con DELETE sin autorización explícita.**

## 9. Qué NO incluye H0.9G

- ❌ Emails automáticos
- ❌ SMTP / D033 (sigue diferido)
- ❌ Pagos online / Stripe / TPV
- ❌ `membership_periods` (tabla existe pero no se usa)
- ❌ RLS que bloquee por `paid_until` vencido (queda como en IdentityProvider, decisión separada)
- ❌ Limpieza automática de sintéticos staging
- ❌ Edición manual avanzada de periodos
- ✅ RPC transaccional (implementada en H0.9I-D)

## 10. Hardening posterior (H0.9I)

| Sub-WO | Estado | Commit |
|--------|--------|--------|
| H0.9I-A | (auditoría previa, no en repo) | — |
| H0.9I-B | done — copy renovaciones sucesivas | `8e2e781` |
| H0.9I-C | designed_go — diseño RPC | (handoff) |
| H0.9I-D | accepted — RPC implementada | `dc4996a` |
| H0.9I-E | verified_with_observations — staging 10 casos | (handoff) |
| H0.9I-F | done — cierre documental (este) | (commit actual) |

## 11. Recomendación siguiente

H0.9G + H0.9I quedan cerrados con observaciones.

Bloques posibles siguientes:

- **H0.9J-A — Auditoría/mapeo Excel legacy**: preparar importación de socios actuales desde Excel sin importar datos reales todavía.
- **D033 SMTP-final**: configurar correo corporativo con Ana T. cuando se celebre la reunión prevista.
- **Limpieza staging autorizada**: solo si se aprueba una WO específica de limpieza controlada; no hacer DELETE fuera de esa WO.
- **D-ACCESS-GRACE-001**: diseño/implementación futura del periodo de gracia 30 días antes de bloqueo por cuota vencida.
- **RLS-H0.9**: decisión futura sobre enforcement backend de cuota vencida.

Recomendación principal actual: **H0.9J-A — Auditoría/mapeo Excel legacy**, salvo que la reunión con Ana T. habilite antes D033 SMTP-final.
