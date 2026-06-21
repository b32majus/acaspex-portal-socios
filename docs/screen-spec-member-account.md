---
title: Screen Spec — Member Account
created: 2026-06-20
updated: 2026-06-20
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
route: /socios/mi-cuenta
component: MemberAccountPage
---

# Screen Spec — Member Account

## Propósito

Definir la pantalla `MemberAccountPage` sin inventar estructura ni comportamiento.

## Ruta y componente

```text
Ruta: /socios/mi-cuenta
Componente: MemberAccountPage
Layout: MemberLayout
Datos: mockMembers
```

## Objetivo

Mostrar al socio sus datos mock principales y estado de cuota.

## Datos usados

Usar como socio actual mock:

```text
memberId = mem-001
```

## Estructura exacta

1. Cabecera de pantalla.
2. Card datos personales.
3. Card estado de membresía.
4. Card consentimiento comunicaciones.
5. Nota informativa.

## Cabecera

Título exacto:

```text
Mi cuenta
```

Subtítulo exacto:

```text
Consulta el estado de tu membresía y los datos asociados a tu perfil de socio.
```

## Card datos personales

Mostrar:

```text
Nombre completo
Email
Teléfono
Categoría profesional
Puesto
Organización
```

## Card estado membresía

Mostrar:

```text
Estado visible: Activo
Tipo de cuota: General
Válido hasta: 31/12/2026
Último pago: 50 euros
Fecha último pago: 18/01/2026
```

## Card consentimiento

Mostrar:

```text
Comunicaciones: Activadas
```

Si fuera false, mostrar `No activadas`.

## Nota informativa

Texto exacto:

```text
Esta pantalla utiliza datos ficticios de prototipo. La gestión real de datos, pagos y renovaciones se definirá en una fase posterior.
```

## Fuera de alcance

```text
no edición de datos
no cambio de contraseña
no auth real
no Supabase
no pagos reales
no renovación real
```

## Criterios de aceptación

```text
/socios/mi-cuenta muestra MemberAccountPage
muestra datos de mem-001
muestra estado Activo
muestra tipo de cuota General
muestra paidUntil como 31/12/2026
muestra nota de datos ficticios
pnpm build pasa
```
