---
title: Data Model v0.1 — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: living-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# Data Model v0.1 — ACASPEX Portal Socios

## 1. Propósito

Definir el modelo de datos preliminar del Portal de Socios ACASPEX antes de crear SQL, Supabase real o tablas productivas.

Este documento es una hipótesis viva. No es aún una migración ejecutable.

## 2. Principios

```text
Minimizar datos personales.
No almacenar datos sanitarios.
No almacenar tarjetas ni credenciales de pago.
Separar socio, pago, documento y recurso.
No borrar socios por defecto: usar bajas/inactivación.
Registrar trazabilidad básica sin construir contabilidad compleja.
```

## 3. Entidades candidatas

```text
members
member_documents
payments
payment_evidence
resources
resource_files
admin_profiles / profiles
```

## 4. Tabla members

Representa a una persona socia o solicitante de alta.

### Campos candidatos

```text
id
first_name
last_name_1
last_name_2
document_type
document_number
address_line
postal_code
email
email_confirmed
alternate_email
phone
professional_category
job_title
organization
quality_safety_link
membership_type
reduced_fee_reason
status
membership_start
paid_until
created_at
updated_at
created_by
source
notes
```

### Campos derivados o calculados

```text
full_name = first_name + last_name_1 + last_name_2
is_active = status active + paid_until válido
renewal_due = paid_until dentro de ventana de alerta
```

### Dudas abiertas

- Confirmar si domicilio completo es obligatorio.
- Confirmar si código postal basta para análisis territorial.
- Confirmar si document_number es requerido por estatutos o gestión formal.
- Confirmar si se debe guardar email alternativo desde el inicio.

## 5. Tabla member_documents

Representa documentos asociados a un socio, especialmente acreditación de cuota reducida si aplica.

### Campos candidatos

```text
id
member_id
document_kind
storage_path
original_filename
mime_type
uploaded_at
review_status
reviewed_by
reviewed_at
notes
```

### document_kind candidatos

```text
reduced_fee_proof
other_admin_document
```

### review_status candidatos

```text
pending
approved
rejected
not_required
```

### Regla

No almacenar documentación innecesaria. Solo pedir acreditación si la cuota reducida lo exige.

## 6. Tabla payments

Representa un pago o intento de pago asociado a un periodo de membresía.

### Campos candidatos

```text
id
member_id
amount
currency
fee_type
payment_method
payment_status
period_start
period_end
paid_at
validated_at
validated_by
provider
provider_payment_id
receipt_url
created_at
updated_at
notes
```

### fee_type candidatos

```text
general
reduced
manual_adjustment
```

### payment_method candidatos

```text
bank_transfer
stripe_checkout
manual_admin
```

### payment_status candidatos

```text
pending
pending_review
paid
failed
refunded
cancelled
```

### provider candidatos

```text
manual
stripe
```

## 7. Tabla payment_evidence

Representa justificantes de transferencia u otra evidencia manual, si ACASPEX decide subirlos al sistema.

### Campos candidatos

```text
id
payment_id
member_id
storage_path
original_filename
mime_type
uploaded_at
review_status
reviewed_by
reviewed_at
notes
```

### Duda abierta

Decidir si los justificantes se suben al portal o si se mantiene revisión por email durante transición.

## 8. Tabla resources

Representa la ficha visible de un recurso de la biblioteca privada.

### Campos candidatos

```text
id
title
subtitle
description
body_text
category
resource_type
visibility
is_published
published_at
created_by
created_at
updated_at
external_url
thumbnail_path
sort_order
```

### resource_type candidatos

```text
pdf
video
presentation
template
link
document
other
```

### visibility candidatos

```text
members
admins_only
public_link_reference
```

## 9. Tabla resource_files

Representa archivos asociados a un recurso.

Un recurso puede tener varios archivos: PDF de vista previa, PPT editable, Word editable, imagen, etc.

### Campos candidatos

```text
id
resource_id
file_role
storage_path
original_filename
mime_type
file_size
created_at
uploaded_by
is_downloadable
```

### file_role candidatos

```text
main
preview
editable
thumbnail
attachment
```

## 10. Tabla profiles / admin_profiles

Representa roles internos vinculados a usuarios autenticados.

### Campos candidatos

```text
id
auth_user_id
email
role
full_name
is_active
created_at
updated_at
```

### role candidatos

```text
member
admin
editor
technical_admin
```

Para MVP puede simplificarse a:

```text
member
admin
```

## 11. Estados de socio

```text
pending_payment
pending_review
active
expired
inactive
cancelled
```

### Reglas preliminares

- `pending_payment`: formulario enviado, pago no confirmado.
- `pending_review`: requiere revisión humana, por ejemplo transferencia o cuota reducida.
- `active`: acceso permitido.
- `expired`: cuota vencida.
- `inactive`: baja/desactivación administrativa.
- `cancelled`: solicitud cancelada.

## 12. Reglas de acceso conceptuales

### Socio

Puede:

- ver su propia cuenta básica;
- acceder a recursos publicados si está activo;
- descargar/ver recursos permitidos;
- iniciar renovación futura.

No puede:

- modificar su estado;
- modificar paid_until;
- modificar pagos;
- ver datos de otros socios;
- acceder a panel admin.

### Admin

Puede:

- ver y editar socios;
- validar pagos manuales;
- cambiar estado;
- crear/editar recursos;
- publicar/despublicar recursos;
- consultar renovaciones.

### Editor

Puede:

- crear/editar recursos;
- publicar/despublicar si se autoriza.

No debería poder:

- validar pagos;
- cambiar estado de socios.

## 13. Relaciones

```text
members 1 → n payments
members 1 → n member_documents
payments 1 → n payment_evidence
resources 1 → n resource_files
profiles 1 → 1 auth.users
```

## 14. Campos del formulario actual mapeados

```text
Primer apellido → last_name_1
Segundo apellido → last_name_2
Nombre → first_name
Tipo documento → document_type
Número documento → document_number
Domicilio → address_line
Código postal → postal_code
Correo electrónico → email
Repetir correo → validación frontend, no campo persistente salvo log temporal
Teléfono móvil → phone
Categoría profesional → professional_category
Puesto de trabajo → job_title
Organización → organization
Vinculación calidad/seguridad → quality_safety_link
Consentimiento comunicaciones → communication_consent
Aceptación privacidad → privacy_accepted_at
```

Campos nuevos:

```text
membership_type
reduced_fee_reason
payment_method
payment_status
membership_start
paid_until
source
```

## 15. Campos de consentimiento candidatos

Podrían vivir en `members` o en tabla separada `consents` si se necesita más trazabilidad.

### Opción simple en members

```text
communication_consent
communication_consent_at
privacy_accepted
privacy_accepted_at
privacy_text_version
```

### Opción más robusta futura

```text
consents
- id
- member_id
- consent_type
- accepted
- accepted_at
- text_version
- source
```

Para MVP v0.1 se propone opción simple, salvo que la revisión RGPD recomiende tabla separada.

## 16. Decisiones pendientes antes de SQL

1. Confirmar obligatoriedad de documento identificativo.
2. Confirmar necesidad de domicilio completo.
3. Confirmar modelo de cuota: año natural o 12 meses desde alta.
4. Confirmar si justificantes se almacenan en Supabase Storage.
5. Confirmar roles MVP: member/admin o member/admin/editor.
6. Confirmar si habrá importación histórica inicial.
7. Confirmar estrategia de emails.
8. Confirmar si Stripe entra en v0.1 o v0.2.

## 17. Próximo paso

Convertir este modelo conceptual en esquema SQL solo cuando Sil valide:

- que el formulario actual de Microsoft Forms y su Excel son el input canónico del MVP;
- mapeo de columnas Excel → Supabase;
- flujo de pago MVP;
- política de datos personales;
- almacenamiento de justificantes/acreditaciones;
- estrategia de importación/sincronización inicial.
