---
title: Análisis formulario actual — ACASPEX alta socio
created: 2026-06-20
updated: 2026-06-20
status: draft
source: contenido compartido por Sil desde formulario actual ACASPEX
project: ACASPEX Portal Socios
---

# Análisis formulario actual — ACASPEX alta socio

## Fuente

Sil ha compartido el contenido actual del formulario de inscripción de ACASPEX alojado/enlazado desde la página pública de Google Sites.

URL pública de referencia:

```text
https://sites.google.com/view/acaspex/hazte-socio?authuser=0
```

Nota de seguridad: no se replica aquí el IBAN completo incluido en el formulario actual. La cuenta bancaria deberá tratarse como dato administrativo sensible y gestionarse solo en documentos/entornos autorizados.

## Contexto actual del alta

El formulario actual solicita inscripción como socio/a de ACASPEX y explica:

- Cuota general: 50 euros.
- Cuota reducida: 30 euros.
- La cuota reducida aplica a residentes en formación sanitaria especializada, estudiantes de rama sanitaria o profesionales jubilados.
- El pago se realiza actualmente mediante transferencia bancaria.
- El concepto de transferencia actual solicita incluir cuota/año, nombre, apellidos y documento identificativo.
- Para cuota reducida se pide enviar documento acreditativo por correo electrónico de ACASPEX.

## Campos actuales del formulario

### Identificación personal

1. Primer apellido.
2. Segundo apellido.
3. Nombre.
4. Tipo de documento.
5. Número del documento.
6. Domicilio.
7. Código postal.

### Contacto

8. Correo electrónico.
9. Repetición de correo electrónico para evitar errores.
10. Teléfono móvil.

### Perfil profesional/institucional

11. Categoría profesional.
12. Puesto de trabajo.
13. Organización en la que trabaja.
14. Vinculación con la Calidad Asistencial y la Seguridad de Pacientes.

### Consentimientos

15. Consentimiento para recibir correos electrónicos sobre actividades e iniciativas.
16. Aceptación de indicaciones sobre tratamiento de datos personales.

## Observaciones de producto

### Campos que probablemente deben conservarse

- Nombre.
- Apellidos.
- Tipo de documento.
- Número de documento, pendiente de confirmar necesidad jurídica/administrativa.
- Email.
- Teléfono.
- Categoría profesional.
- Puesto de trabajo.
- Organización.
- Vinculación con calidad asistencial y seguridad del paciente.
- Consentimiento comunicaciones.
- Aceptación privacidad.

### Campos a revisar por minimización de datos

- Domicilio completo.
- Código postal.
- Número de documento.

Estos campos pueden ser legítimos si ACASPEX necesita identificación formal de socios, libro de socios, gestión administrativa o trazabilidad de pagos. Aun así, deben justificarse en el PRD/RGPD y no pedirse por inercia si no son necesarios.

### Campos que faltan para el nuevo sistema

Para el Portal de Socios habría que añadir o derivar:

- Tipo de cuota: general / reducida.
- Motivo cuota reducida: residente / estudiante / jubilado.
- Documento acreditativo de cuota reducida, si aplica.
- Método de pago: transferencia / pago online futuro.
- Estado de pago.
- Fecha de solicitud.
- Fecha de validación.
- Inicio de membresía.
- Cuota válida hasta.
- Estado de socio: pending_payment, pending_review, active, expired, inactive, cancelled.
- Email de acceso al portal.
- Email alternativo opcional.
- Consentimiento específico de acceso digital/portal si procede.

## Problemas detectados en flujo actual

1. Alta y pago están separados.
2. El pago por transferencia requiere comprobación manual.
3. No hay activación automática de socio.
4. La fecha de inicio/renovación puede quedar ambigua.
5. No hay control robusto de vencimientos.
6. La cuota reducida requiere evidencia externa por email.
7. Microsoft Forms vuelca a Excel, pero no alimenta directamente un CRM operativo.
8. El acceso al área privada no está conectado al estado real de socio.

## Propuesta de mejora funcional

### Integración del formulario actual v0.1

El formulario actual de Microsoft Forms no se modifica en la primera fase, porque es una decisión ya tomada por ACASPEX y el Excel que genera es el punto de partida operativo.

Esto no implica que Microsoft Forms sea la arquitectura destino. La arquitectura destino es sustituirlo por un formulario propio cuando esté probado en Google Sites y escriba directamente en Supabase.

Mientras tanto, el sistema debe adaptarse a ese flujo:

- mantener el formulario público en Google Sites;
- usar el Excel generado por Microsoft Forms como fuente inicial de altas;
- importar o sincronizar cada respuesta hacia Supabase;
- conservar el orden/campos actuales como esquema de entrada;
- añadir en Supabase los campos operativos que el formulario no tiene: estado, validación, pago, fechas, acceso y renovación;
- preparar acceso al portal privado cuando el socio sea validado.

### Estados iniciales recomendados

```text
pending_payment
pending_review
active
expired
inactive
cancelled
```

### Flujo transferencia ordenada

```text
formulario enviado
→ registro created
→ estado pending_payment o pending_review
→ admin revisa justificante/acreditación si aplica
→ admin valida pago
→ status active
→ paid_until calculado
→ acceso portal permitido
```

### Flujo pago online futuro

```text
formulario enviado
→ registro pending_payment
→ Stripe Checkout
→ webhook confirma pago
→ status active
→ paid_until calculado
→ acceso portal permitido
```

## Decisiones pendientes derivadas

1. Confirmar si ACASPEX necesita domicilio completo o bastaría con localidad/provincia/código postal.
2. Confirmar si el documento identificativo es obligatorio por estatutos/gestión administrativa.
3. Confirmar si la cuota se rige por año natural o por 12 meses desde fecha de alta.
4. Confirmar si la cuota reducida se valida manualmente o con reglas simples.
5. Confirmar si el justificante de transferencia se subirá al sistema o se mantendrá por email durante transición.
6. Confirmar si se permitirá pago online en MVP v0.1 o v0.2.
7. Confirmar qué correo oficial se usará para soporte, privacidad y comunicaciones.

## Implicaciones para modelo de datos

Tablas mínimas candidatas:

```text
members
member_documents
payments
payment_evidence
resources
resource_files
```

Campos derivados importantes:

```text
membership_type
fee_amount
fee_period
payment_method
payment_status
membership_start
paid_until
communication_consent
privacy_accepted_at
```

## Próximo paso

Convertir este análisis en:

1. PRD v0.1, sección alta de socio desde Microsoft Forms/Excel.
2. Data model v0.1 compatible con los campos actuales.
3. Estrategia de importación/sincronización Excel → Supabase.
4. Decisión sobre campos derivados que añade el sistema sin tocar el formulario público inicial.
