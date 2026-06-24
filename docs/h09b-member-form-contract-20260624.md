# H0.9B — Contrato canónico de ficha de socio

Status: active
Created: 2026-06-24

## 1. Decisión base

**Ficha socio = formulario de alta completo + member_number + campos administrativos.**

No se implementa un CRUD mínimo reducido. El formulario administrativo refleja todos los campos que se recogerían en un alta pública, más los campos operativos internos.

## 2. Campos del formulario

### Datos personales

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| first_name | text | Sí |
| last_name_1 | text | Sí |
| last_name_2 | text | No |
| document_type | document_type enum | Sí |
| document_number | text | Sí |

### Dirección y contacto

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| address_line | text | No |
| postal_code | text | No |
| email | text | Sí |
| phone | text | No |

### Perfil profesional

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| professional_category | text | Sí |
| job_title | text | No |
| organization | text | Sí |
| quality_safety_link | text | No |

### Consentimientos

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| communication_consent | boolean | No (default false) |
| privacy_accepted_at | timestamptz | No |

## 3. Campos administrativos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| member_number | text | Nº socio ACX-XXXX. Autogenerado si vacío. |
| status | member_status enum | pending_review por defecto |
| member_profile | member_profile enum | Perfil de cuota |
| fee_amount | numeric | Cuota anual (50 o 30). Derivado de member_profile. |
| membership_start | date | Fecha de activación |
| paid_until | date | Fecha de vigencia (membership_start + 12 meses) |
| notes | text | Notas internas |

### Campos de importación legacy

| Campo | Tipo | Descripción |
|-------|------|-------------|
| legacy_member_number | text | Nº de socio en fuente anterior |
| legacy_source | text | Origen (Excel, Forms, etc.) |
| legacy_import_batch | text | Lote de importación |

## 4. Opciones cerradas

### document_type

| Valor | Label |
|-------|-------|
| dni | DNI |
| nie | NIE |
| passport | Pasaporte |

### member_profile

| Valor | Label | Cuota |
|-------|-------|-------|
| general | General | 50 € |
| residente | Residente | 30 € |
| estudiante | Estudiante | 30 € |
| jubilado | Jubilado | 30 € |

### member_status

| Valor | Label |
|-------|-------|
| pending_review | Pendiente de revisión |
| active | Activo |
| expired | Vencido |
| inactive | Inactivo |
| cancelled | Baja |

## 5. Categorías profesionales

Enfermero/a
Enfermero/a Especialista
Farmacéutico/a
Fisioterapeuta
Logopeda
Médico/a
Odontólogo/a
Personal Administrativo
Psicólogo/a
Residente Formación Sanitaria Especializada
Técnico en Cuidados Auxiliares de Enfermería
Técnico Especialista
Terapeuta Ocupacional
Trabajador/a Social
Veterinario/a
Otras

## 6. Organizaciones

Área de Salud de Badajoz
Área de Salud de Cáceres
Área de Salud de Coria
Área de Salud de Don Benito-Villanueva de la Serena
Área de Salud de Llerena-Zafra
Área de Salud de Mérida
Área de Salud de Navalmoral de la Mata
Área de Salud de Plasencia
Mutuas Colaboradoras con la Seguridad Social
Organización de Pacientes
Sector Privado
SEPAD
Servicios Centrales SES
Universidad de Extremadura
Otras

## 7. Reglas

1. **member_number**: generado como `ACX-XXXX` si no viene informado. Si viene de importación Excel, se respeta el número existente.
2. **status inicial**: `pending_review` por defecto.
3. **Activación**: al cambiar status a `active`:
   - si `membership_start` está vacío → `membership_start = current_date`
   - si `paid_until` está vacío → `paid_until = membership_start + 12 months`
4. **No se sobrescribe** `paid_until` ni `membership_start` si ya tienen valor.
5. **No se calcula** vigencia para `pending_review`, `inactive`, `expired` ni `cancelled`.
6. **H0.9B no crea acceso/login**. No toca `auth.users` ni `profiles`.
7. **member_profile** determina `fee_amount`: general = 50 €, resto = 30 €.
8. **document_number** se normaliza: uppercase, trim, sin espacios, sin puntos, sin guiones.
