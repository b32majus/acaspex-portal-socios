# Mapping preliminar Excel Microsoft Forms → datos de socio ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22
**Referencia:** `docs/migration-plan-forms-excel-to-supabase-20260622.md`

---

## Contexto

La cabecera procede del Excel actual generado por Microsoft Forms. Este documento solo describe el mapping de columnas. No contiene filas ni datos reales. No se importa nada todavía.

La situación actual de ACASPEX es que el formulario recoge datos de inscripción, pero no registra pagos, justificantes ni validación administrativa de pagos. Se basa en la confianza de que la persona realiza la transferencia correctamente.

---

## Tabla de mapping

### Metadatos de Microsoft Forms

| Columna Excel | Significado funcional | Campo destino propuesto | Tabla destino propuesta | Transformación necesaria | Notas/riesgos |
|---|---|---|---|---|---|
| `ID` | Identificador legacy de respuesta Forms | `legacy_member_number` o `legacy_source` | `members` | Conservar como referencia histórica (no como PK) | Puede no ser único si Forms reasigna IDs. Evaluar tras ver datos reales. |
| `Hora de inicio` | Timestamp de apertura del formulario | No se mapea directamente | — | Descartar o conservar como metadata de importación | Solo útil para auditoría de la migración. |
| `Hora de finalización` | Timestamp de envío del formulario | `created_at` aproximado | `members` | Usar como fecha histórica de solicitud si no existe otra fuente | Puede usarse como proxy de fecha de alta histórica. |
| `Correo electrónico` | Email de la cuenta Microsoft con que se respondió Forms | `legacy_source` / metadata de importación | `members` (solo si no hay email declarado) | No usar como fuente principal. Solo como fallback si el email declarado está vacío. | Puede diferir del email declarado por la persona. |
| `Nombre` | Nombre de cuenta Microsoft del respondedor | No se mapea directamente | — | Descartar si existen nombre y apellidos explícitos. Usar solo como fallback si los campos de identidad están vacíos. | Menos fiable que los campos explícitos de nombre y apellidos. |
| `Hora de la última modificación` | Timestamp de última edición de la respuesta | No se mapea directamente | — | Metadata Forms. Descartar o conservar en log de importación. | Solo útil para trazabilidad de la migración. |

### Identidad

| Columna Excel | Significado funcional | Campo destino propuesto | Tabla destino propuesta | Transformación necesaria | Notas/riesgos |
|---|---|---|---|---|---|
| `Indique su nombre` | Nombre de pila declarado | `first_name` | `members` | Trim, capitalización consistente | — |
| `Por favor, indique su primer apellido` | Primer apellido | `last_name_1` | `members` | Trim, capitalización consistente | — |
| `Indique su segundo apellido` | Segundo apellido | `last_name_2` | `members` | Trim; opcional (null si vacío) | — |
| Nombre completo construido | — | — | — | `first_name` + `last_name_1` + (`last_name_2` si existe). No se almacena campo separado; se construye en aplicación. | El schema actual no tiene `full_name`; la UI lo compone dinámicamente. |

### Documento identificativo

| Columna Excel | Significado funcional | Campo destino propuesto | Tabla destino propuesta | Transformación necesaria | Notas/riesgos |
|---|---|---|---|---|---|
| `Indique un tipo de documento` | Tipo de documento (DNI, NIE, Pasaporte) | `document_type` | `members` | Normalizar al enum `public.document_type`: DNI → `'DNI'`, NIE → `'NIE'`, Pasaporte → `'Pasaporte'`. Mapear variantes comunes (texto libre a enum). | Puede requerir normalización manual si hay valores atípicos. |
| `Indique el número del documento` | Número de documento | `document_number` (valor original) y `document_number_normalized` (para deduplicación) | `members` | `document_number` = valor original con trim. `document_number_normalized` = uppercase, sin espacios, sin puntos, sin guiones. | Es el identificador fuerte para detección de duplicados. |

### Contacto

| Columna Excel | Significado funcional | Campo destino propuesto | Tabla destino propuesta | Transformación necesaria | Notas/riesgos |
|---|---|---|---|---|---|
| `Indique su domicilio` | Dirección postal | `address_line` | `members` | Trim | `city` y `province` no están en el formulario Forms actual; requerirían otra fuente o quedar null. |
| `Indique su Código Postal` | Código postal | `postal_code` | `members` | Trim, normalizar a 5 dígitos | — |
| `Indique un correo electrónico` | Email principal declarado por la persona | `email` (valor original) y `email_normalized` (para deduplicación y búsquedas) | `members` | `email` = valor original con trim. `email_normalized` = lowercase, trim. | Es el email de contacto principal. Se usa para login/recuperación futura. |
| `Por favor, para evitar errores, repita su correo electrónico` | Email de confirmación (control de calidad) | No se mapea a columna de destino | — | Validar coincidencia con `Indique un correo electrónico`. Si no coinciden → marcar registro para revisión manual. No usar como fuente principal. | Campo de control; útil para detectar errores de tipeo en la migración. |
| `Indique su teléfono móvil` | Teléfono móvil | `phone` | `members` | Trim, normalizar formato (prefijo +34 si aplica) | — |

### Perfil profesional

| Columna Excel | Significado funcional | Campo destino propuesto | Tabla destino propuesta | Transformación necesaria | Notas/riesgos |
|---|---|---|---|---|---|
| `Indique su categoría profesional` | Categoría profesional declarada | `professional_category` | `members` | Trim, conservar como texto libre | Podría normalizarse a categorías estándar en el futuro. |
| `Indique su puesto de trabajo` | Puesto de trabajo | `job_title` | `members` | Trim | — |
| `Indique la organización en la que trabaja` | Organización/empresa | `organization` | `members` | Trim | — |
| `Comente brevemente su vinculación con la Calidad Asistencial y la Seguridad de Pacientes` | Vinculación profesional con calidad asistencial y seguridad de pacientes | `quality_safety_link` | `members` | Trim, conservar como texto libre | Campo específico del ámbito de ACASPEX. |

### Consentimientos

| Columna Excel | Significado funcional | Campo destino propuesto | Tabla destino propuesta | Transformación necesaria | Notas/riesgos |
|---|---|---|---|---|---|
| `¿Acepta que la Asociación Extremeña de Calidad Asistencial y Seguridad de Pacientes le envíe correos electrónicos anunciando actividades y otras iniciativas de interés?` | Consentimiento de comunicaciones | `communication_consent` | `members` | Convertir respuesta Sí/No a boolean: `Sí` → `true`, `No`/vacío → `false` | — |
| `He leído y acepto las indicaciones sobre tratamiento de datos personales` | Aceptación de tratamiento de datos personales | `privacy_accepted_at` | `members` | Si respuesta es `Sí`, asignar `privacy_accepted_at` = fecha de envío del formulario (`Hora de finalización`). Si es `No` o vacío, mantener null. Marcar registro para revisión si no se acepta. | La aceptación de privacidad es requisito legal. |

---

## Reglas preliminares de importación

| Regla | Descripción |
|---|---|
| Email principal | Usar `Indique un correo electrónico` como fuente. |
| Email Microsoft Forms | Conservar como metadata de importación si el schema futuro lo permite (actualmente no hay campo específico; podría usarse `legacy_source`). |
| Email repetido | Validar coincidencia con email principal. Si no coinciden → conflicto a revisión manual. |
| Documento duplicado | Si `document_number_normalized` coincide con otro registro → posible duplicado → marcar para revisión manual. |
| Email duplicado | Si `email_normalized` coincide con otro registro → posible duplicado → marcar para revisión manual. |
| Fecha de solicitud | `Hora de finalización` como proxy de fecha histórica de alta (`created_at`). |
| Pagos | No inferir pagos ni estado económico desde esta cabecera. |
| Member profile | Todos los socios importados como `general` por defecto, salvo revisión manual. |

---

## Información que esta cabecera NO recoge

| Dato ausente | Implicación |
|---|---|
| Cuota abonada (`amount`) | No se puede reconstruir historial de pagos desde Forms. |
| Justificante de pago | No hay `receipt_file_path` en Forms. |
| Fecha real de transferencia | No registrada. |
| Validación de pago (`payment_status`) | No existe capa administrativa de validación en Forms. |
| Estado administrativo interno | No hay `status` de miembro en Forms. |
| Número interno de socio (`member_number`) | Salvo que exista en otra fuente externa. |
| `paid_until` | Sin pagos registrados, no hay fecha de vigencia. |
| Perfil de cuota (`member_profile`) | No se pregunta en Forms actual. Se asume `general`. |
| Ciudad / Provincia | `city` y `province` no están en el formulario. |

**Nota:** Actualmente ACASPEX no registra de forma estructurada los pagos en el formulario; se basa en la confianza de que la persona realiza la transferencia correctamente. Por tanto, cualquier capa futura de pagos/renovaciones será una mejora operativa nueva, no una migración directa desde este Excel.

---

## Decisiones pendientes

1. **Número interno de socio**: confirmar si existe otro listado con `member_number` o si se generan secuencialmente en la importación.
2. **Control externo de pagos**: confirmar si existe otro control externo de pagos o cuotas (hoja de cálculo aparte, extracto bancario).
3. **Estado inicial de socios importados**: ¿activos por defecto (`active`), pendientes de revisión (`pending_review`) o importados como históricos?
4. **Perfil de socio por defecto**: ¿todos los socios históricos se importan con `member_profile = 'general'` salvo revisión manual?
5. **Fecha de alta histórica**: ¿se usará `Hora de finalización` como fecha histórica de alta/solicitud (`created_at`)?
6. **Ciudad y provincia**: ¿se obtienen de otra fuente o se dejan null en la importación?
7. **Legacy metadata**: ¿se necesita un campo adicional en `members` para conservar el `ID` de Forms y el `Correo electrónico` de Forms? Actualmente existen `legacy_member_number`, `legacy_source` y `legacy_import_batch`.

---

## Recomendación final

1. Cerrar este mapping con revisión de Sil/Cora.
2. Crear WO separada para revisar si el schema necesita algún campo legacy adicional (p.ej., `forms_id`, `forms_email`).
3. Crear WO separada para script de validación de cabecera, sin datos reales.
4. No crear importador hasta que el mapping esté validado.

---

*Status: pending_review*
