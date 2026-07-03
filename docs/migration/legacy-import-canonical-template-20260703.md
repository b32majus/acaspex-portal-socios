# Plantilla canónica de importación legacy ACASPEX

**Status:** template_only — no se importa nada con esta plantilla
**Fecha:** 2026-07-03
**Origen:** H0.9J-A + H0.9I-A

---

## 1. Propósito y alcance

Esta plantilla:

- Es una **plantilla operativa SIN datos personales reales**. Sirve para validar con la Junta / Ana T. qué columnas mínimas necesita el portal para una importación legacy desde el Excel que custodia la Junta.
- **No sustituye al Excel oficial**. No se importa nada hasta que Sil obtenga el fichero o una muestra anonimizada autorizada.
- **No se deben pegar datos reales en el repo**. Cualquier fila con datos personales debe eliminarse y reescribirse con datos ficticios (`EJEMPLO_NO_REAL`, `00000000T`, `ejemplo.no.real@example.org`).
- Forma parte de la preparación para H0.9J-C (dry-run validator) y la reunión con la Junta.

---

## 2. Tabla de columnas canónicas

Cada columna se define con:
- **Origen esperado**: de dónde se obtiene el dato.
- **Campo Supabase**: a qué columna de `public.members` (o `public.payments`) se mapea.
- **Transformación**: normalización esperada antes de INSERT.
- **Validación**: reglas que debe cumplir.
- **Decisión Junta**: pregunta que bloquea si la columna está en blanco.

### 2.1 Identidad

| Columna canónica | Obligatoria | Origen esperado | Campo Supabase | Transformación | Validación | Decisión Junta |
|------------------|:----------:|------------------|-----------------|----------------|------------|----------------|
| `first_name` | ✅ Sí | Cabecera "Indique su nombre" | `members.first_name` | trim, capitalización consistente | no vacío | — |
| `last_name_1` | ✅ Sí | Cabecera "Primer apellido" | `members.last_name_1` | trim, capitalización consistente | no vacío | — |
| `last_name_2` | No | Cabecera "Segundo apellido" | `members.last_name_2` (nullable) | trim; null si vacío | opcional | — |
| `document_type` | ✅ Sí | Cabecera "Tipo de documento" | `members.document_type` enum | normalizar a `'DNI'`, `'NIE'`, `'Pasaporte'` | uno de los tres valores | Confirmar si hay otros tipos |
| `document_number` | ✅ Sí | Cabecera "Número del documento" | `members.document_number` | trim | no vacío | — |
| `document_number_normalized` | ✅ Sí (derivado) | derivado de `document_number` | `members.document_number_normalized` | uppercase, sin espacios, sin puntos, sin guiones | no vacío si `document_number` no vacío | — |

### 2.2 Contacto

| Columna canónica | Obligatoria | Origen esperado | Campo Supabase | Transformación | Validación | Decisión Junta |
|------------------|:----------:|------------------|-----------------|----------------|------------|----------------|
| `email` | ✅ Sí (preferente) | Cabecera "Email principal" | `members.email` | trim | formato email básico | Si falta, ¿es bloqueante? |
| `email_confirmation` | ❌ No | Cabecera "Email repetido" | (no columna destino) | — | validar coincidencia con `email` | — |
| `email_normalized` | ✅ Sí (derivado) | derivado de `email` | `members.email_normalized` | lowercase, trim | no vacío si `email` no vacío | — |
| `phone` | ❌ No | Cabecera "Teléfono móvil" | `members.phone` (nullable) | trim, prefijo +34 si aplica | opcional | — |
| `address_line` | ❌ No | Cabecera "Domicilio" | `members.address_line` (nullable) | trim | opcional | — |
| `postal_code` | ❌ No | Cabecera "Código Postal" | `members.postal_code` (nullable) | trim, 5 dígitos | opcional | Confirmar si hay formato concreto |
| `city` | ❌ No | (no en cabecera Forms) | `members.city` (nullable) | — | opcional | ¿Fuente externa? |
| `province` | ❌ No | (no en cabecera Forms) | `members.province` (nullable) | — | opcional | ¿Fuente externa? |

### 2.3 Perfil profesional

| Columna canónica | Obligatoria | Origen esperado | Campo Supabase | Transformación | Validación | Decisión Junta |
|------------------|:----------:|------------------|-----------------|----------------|------------|----------------|
| `professional_category` | ❌ No | Cabecera "Categoría profesional" | `members.professional_category` (nullable) | trim, conservar como texto libre | opcional | — |
| `job_title` | ❌ No | Cabecera "Puesto de trabajo" | `members.job_title` (nullable) | trim | opcional | — |
| `organization` | ❌ No | Cabecera "Organización" | `members.organization` (nullable) | trim | opcional | — |
| `quality_safety_link` | ❌ No | Cabecera "Vinculación calidad/seguridad" | `members.quality_safety_link` (nullable) | trim | opcional | — |

### 2.4 Consentimientos

| Columna canónica | Obligatoria | Origen esperado | Campo Supabase | Transformación | Validación | Decisión Junta |
|------------------|:----------:|------------------|-----------------|----------------|------------|----------------|
| `communication_consent` | ✅ Sí | Cabecera "¿Acepta comunicaciones?" Sí/No | `members.communication_consent` boolean | Sí → true, No/vacío → false | boolean | — |
| `privacy_accepted` | ✅ Sí | Cabecera "He leído y acepto privacidad" Sí/No | (no columna destino) | Sí / No | boolean | Si no acepta, ¿se importa? |
| `privacy_accepted_at` | ✅ Sí (si privacy_accepted = Sí) | derivado de Forms "Hora de finalización" o fecha de aceptación | `members.privacy_accepted_at` (nullable) | ISO 8601 date | timestamp válido | Confirmar fecha real de aceptación |

### 2.5 Administrativo socio

| Columna canónica | Obligatoria | Origen esperado | Campo Supabase | Transformación | Validación | Decisión Junta |
|------------------|:----------:|------------------|-----------------|----------------|------------|----------------|
| `member_profile` | ✅ Sí | (no en cabecera Forms) | `members.member_profile` enum | uno de: `'general'`, `'residente'`, `'estudiante'`, `'jubilado'` | valor válido | Asumir `'general'` salvo reducción |
| `fee_amount` | ✅ Sí si `status = active` | (no en cabecera Forms) | `members.fee_amount` numeric(10,2) | decimal positivo | `amount > 0` | Confirmar regla 50/30€ |
| `status` | ✅ Sí | (no en cabecera Forms) | `members.status` enum | uno de: `'pending_review'`, `'active'`, `'expired'`, `'inactive'`, `'cancelled'` | valor válido | ¿Todos `active`? |
| `membership_start` | ✅ Sí si `status = active` | (no en cabecera Forms) | `members.membership_start` (nullable) | ISO date `yyyy-mm-dd` | fecha válida | **CRÍTICO**: fuente de fecha de alta |
| `paid_until` | ✅ Sí si `status = active` | (no en cabecera Forms) | `members.paid_until` (nullable) | ISO date `yyyy-mm-dd` | fecha válida, ≥ `membership_start` | **CRÍTICO**: regla de cálculo |
| `legacy_member_number` | ❌ No | Forms "ID" o `member_number` legacy externo | `members.legacy_member_number` (nullable, unique) | trim, respetar `unique` | único si existe | ¿Existe `member_number` legacy oficial? |
| `legacy_source` | ❌ No | Forms "ID" + email Forms + "Hora de finalización" | `members.legacy_source` (nullable) | concat identificador Forms | string | — |
| `legacy_import_batch` | ❌ No | identificador de lote (ej. `import-2026-07-XX`) | `members.legacy_import_batch` (nullable) | string | opcional | — |
| `notes` | ❌ No | (no en Forms) | `members.notes` (nullable) | texto libre | opcional | ¿Anotaciones administrativas? |

### 2.6 Pagos / vigencia

Estos campos solo se rellenan si la Junta autoriza crear `payment` inicial de migración.

| Columna canónica | Obligatoria | Origen esperado | Campo Supabase | Transformación | Validación | Decisión Junta |
|------------------|:----------:|------------------|-----------------|----------------|------------|----------------|
| `create_initial_payment` | ❌ No | decisión de Junta | (no columna destino) | Sí / No | — | ¿Crear payment inicial? |
| `payment_amount` | ❌ No | (no en Forms) | `public.payments.amount` numeric(10,2) | decimal positivo | `amount > 0` | Confirmar importe |
| `payment_period_start` | ❌ No | (no en Forms) | `public.payments.payment_period_start` date | ISO date | fecha válida | — |
| `payment_period_end` | ❌ No | (no en Forms) | `public.payments.payment_period_end` date | ISO date | ≥ `payment_period_start` | — |
| `payment_paid_until` | ❌ No | (no en Forms) | `public.payments.paid_until` date | ISO date | ≥ `payment_period_end` | — |
| `payment_method` | ❌ No | (no en Forms) | `public.payments.payment_method` enum | `'bank_transfer'` (único MVP) | valor válido | — |
| `payment_status` | ❌ No | (no en Forms) | `public.payments.payment_status` enum | uno de: `'pending'`, `'validated'`, `'rejected'` | valor válido | **CRÍTICO**: NO crear `validated` sin soporte |
| `receipt_file_reference` | ❌ No | (no en Forms) | `public.payments.receipt_file_path` (nullable) | path en Storage bucket `acaspex-payment-receipts` | path válido | — |
| `payment_notes` | ❌ No | texto libre | `public.payments.notes` (nullable) | texto libre | opcional | — |

### 2.7 Control de importación

Estos campos son metadata del proceso, no del socio. Se usan en la fase de dry-run (H0.9J-C) para trazabilidad.

| Columna canónica | Obligatoria | Origen esperado | Campo Supabase | Transformación | Validación | Decisión Junta |
|------------------|:----------:|------------------|-----------------|----------------|------------|----------------|
| `import_action` | ✅ Sí | pre-procesador | (no columna destino) | uno de: `'insert'`, `'update'`, `'skip'`, `'flag_review'` | — | — |
| `validation_status` | ✅ Sí | pre-procesador | (no columna destino) | uno de: `'valid'`, `'valid_with_warnings'`, `'invalid'`, `'needs_board_decision'` | — | — |
| `validation_errors` | ❌ No | pre-procesador | (no columna destino) | texto libre (JSON o lista) | opcional | — |
| `review_required` | ✅ Sí | pre-procesador | (no columna destino) | Sí / No | — | — |
| `reviewed_by` | ❌ No | nombre/email del revisor | (no columna destino) | string | opcional | — |
| `reviewed_at` | ❌ No | timestamp de revisión | (no columna destino) | ISO 8601 timestamp | opcional | — |

---

## 3. Campos mínimos para import `members-only`

Para una importación provisional de solo members (sin payments), las columnas mínimas son:

- `first_name`
- `last_name_1`
- `document_type`
- `document_number` (al menos uno de este o `email`)
- `email` (al menos uno de este o `document_number`)
- `communication_consent`
- `privacy_accepted`
- `member_profile` (asumir `'general'` salvo decisión)
- `fee_amount` (asumir `50` para `general`, `30` para reducidas)
- `status` (decidir `active` por defecto o `pending_review`)
- `membership_start` (si `status = active`, requerido)
- `paid_until` (si `status = active`, requerido; sino, dejar null)

`last_name_2`, `phone`, `address_line`, `postal_code`, `city`, `province`, `professional_category`, `job_title`, `organization`, `quality_safety_link`, `legacy_*` son opcionales.

---

## 4. Campos que NO deben inventarse

**CRÍTICO** — los siguientes campos NO deben rellenarse con valores inventados o asumidos:

- ❌ `membership_start` — si no hay fecha real, dejar `null` y no importar el socio (o importar con `status = pending_review`).
- ❌ `paid_until` — si no hay fecha real, dejar `null` y no importar el socio.
- ❌ `payment_amount`, `payment_period_start`, `payment_period_end`, `payment_paid_until` — no inferir de `membership_start` salvo decisión explícita.
- ❌ `payment_status = 'validated'` — solo si hay soporte administrativo (justificante revisado).
- ❌ `validated_by`, `validated_at` — no inventar IDs de admin ni timestamps.

Si un campo obligatorio no se puede obtener, **se documenta en `validation_errors` y se marca `import_action = 'flag_review'`**.

---

## 5. Reglas de normalización

| Campo | Normalización |
|-------|----------------|
| `first_name`, `last_name_1`, `last_name_2` | trim, capitalización consistente (opcional: primera letra mayúscula) |
| `email` | trim, lowercase antes de normalizar |
| `email_normalized` | lowercase, trim |
| `document_number` | trim, valor original |
| `document_number_normalized` | uppercase, sin espacios, sin puntos, sin guiones |
| `document_type` | uno de: `'DNI'`, `'NIE'`, `'Pasaporte'`. Mapear variantes comunes: `dni` → `'DNI'`, `D.N.I.` → `'DNI'`, etc. |
| `phone` | trim, prefijo `+34` si aplica (revisar antes de aplicar) |
| `address_line` | trim, colapsar espacios múltiples en uno |
| `postal_code` | trim, 5 dígitos (validar formato español) |
| `city`, `province` | trim, capitalización |
| `member_profile` | uno de: `'general'`, `'residente'`, `'estudiante'`, `'jubilado'` |
| `status` | uno de: `'pending_review'`, `'active'`, `'expired'`, `'inactive'`, `'cancelled'` |
| `payment_method` | `'bank_transfer'` (único MVP) |
| `payment_status` | uno de: `'pending'`, `'validated'`, `'rejected'` |
| `communication_consent` | `'Sí'` / `'No'` / vacío → `true` / `false` / `false` |
| Fechas | ISO 8601: `yyyy-mm-dd` o `yyyy-mm-ddThh:mm:ssZ` |
| Booleanos | `true` / `false` (no `Sí`/`No` en BD; se transforman al normalizar) |

---

## 6. Reglas económicas

| Regla | Detalle |
|-------|---------|
| `member_profile = 'general'` | `fee_amount` sugerido: `50` |
| `member_profile = 'residente'` / `'estudiante'` / `'jubilado'` | `fee_amount` sugerido: `30` |
| Si la Junta aporta importe en el Excel | prevalece ese importe |
| Si `member_profile` es `null` o vacío | asumir `'general'` y `fee_amount = 50` |
| `amount <= 0` | inválido, marcar `validation_errors` y no importar |
| Crear `payment` inicial | solo con decisión explícita de la Junta |
| `payment_status = 'validated'` | solo con soporte administrativo (justificante) |
| `validated_by` | ID del admin que valida, no inventar |

---

## 7. Plantilla CSV ilustrativa SIN DATOS REALES

⚠️ **NO pegar datos reales en el repo.** Usar solo datos ficticios obvios.

```csv
first_name,last_name_1,last_name_2,document_type,document_number,email,email_normalized,phone,address_line,postal_code,city,province,professional_category,job_title,organization,quality_safety_link,communication_consent,privacy_accepted,privacy_accepted_at,member_profile,fee_amount,status,membership_start,paid_until,legacy_member_number,legacy_source,legacy_import_batch,notes,create_initial_payment,payment_amount,payment_period_start,payment_period_end,payment_paid_until,payment_method,payment_status,receipt_file_reference,payment_notes,import_action,validation_status,validation_errors,review_required,reviewed_by,reviewed_at
EJEMPLO,NO_REAL,PRUEBA,DNI,00000000T,ejemplo.no.real@example.org,ejemplo.no.real@example.org,+34000000000,Calle Ejemplo 1,00000,Ciudad,Provincia,Categoría,Puesto,Organización,Texto,true,true,2026-07-03T00:00:00Z,general,50,active,2026-07-03,2027-07-03,LEGACY-0001,forms-microsoft,import-2026-07-03,Sin observaciones,false,,,,,,,insert,valid,,false,,,
```

**Notas sobre la plantilla:**
- **Cabecera**: nombres de columnas canónicas (snake_case).
- **Fila ficticia**: usa valores obvios (`EJEMPLO`, `NO_REAL`, `PRUEBA`, `00000000T`, `+34000000000`, `ejemplo.no.real@example.org`, `00000`). Nadie en su sano juicio pensaría que son reales.
- **Dominios**: usar `example.org` / `example.com` / `example.net` (RFC 6761, reservados para ejemplos).
- **Fechas**: ISO 8601.
- **Fila de payments vacía**: para `members-only`, dejar los campos de payments vacíos.

---

## 8. Cambios prohibidos

- ❌ No pegar datos reales de socios en el repo.
- ❌ No inventar fechas (`membership_start`, `paid_until`, `payment_*`).
- ❌ No inventar IDs (`validated_by`).
- ❌ No crear `payment_status = 'validated'` sin soporte administrativo.
- ❌ No crear filas en `membership_periods` (no se usa en MVP).
- ❌ No crear `auth.users` ni `profiles` desde importación.
- ❌ No incluir emails con dominios reales de socios.
- ❌ No incluir números de documento reales.

---

## 9. Próximos pasos

1. **H0.9J-C** — Dry-run validator (script de transformación + validación con muestra ficticia o anonimizada). Solo cuando se disponga de:
   - Cabecera oficial (o al menos muestra de 3 filas ficticias).
   - Reglas validadas por Junta/Ana T. para `membership_start`, `paid_until`, `status`, `member_profile`, `fee_amount`, payments iniciales.

2. **Migración real** — solo después de:
   - H0.9J-C validado con muestra.
   - Checklist Junta cerrado (ver `legacy-import-board-checklist-20260703.md`).
   - D033 SMTP-final resuelto (si se importan emails reales).

---

## 10. Referencias

- `docs/migration/microsoft-forms-excel-header-mapping-20260622.md` — Mapping preliminar original.
- `docs/h09i-decisions-legacy-import-20260703.md` — Decisiones H0.9I-A.
- `/srv/kairos-lab/state/coding-workshop/handoffs/acaspex/20260703-0023-h09j-a-legacy-headers-audit-handoff.md` — Audit H0.9J-A.
- `supabase/migrations/20260622000001_001_acaspex_schema.sql` — Schema de `public.members` y `public.payments`.
- `supabase/migrations/20260625000033_033_acaspex_member_activation_dates.sql` — Trigger 033.
- `supabase/migrations/20260704000046_046_acaspex_register_validated_renewal_payment_rpc.sql` — RPC transaccional de renovación.
