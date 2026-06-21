# Arquitectura — ACASPEX Portal de Socios

Estado: `draft / pending_review`

## Arquitectura objetivo inicial

```text
Google Sites público
  ↓ botón Área socios
Portal privado socios.acaspex.es
  ↓ login por email
Supabase Auth
  ↓ consulta estado socio
Supabase Postgres
  ↓ recursos/archivos
Supabase Storage + YouTube oculto
```

## Separación de responsabilidades

### Google Sites

- Web pública institucional.
- Información general, noticias, actividades, contacto y llamada a hacerse socio.
- No gestiona autenticación, cuotas ni contenido privado.

### Portal de socios

- Capa privada.
- Login.
- Área de socios.
- Biblioteca de recursos.
- Panel admin.
- Renovaciones/alertas.

### Supabase

- Auth: autenticación por email/magic link.
- Postgres: socios, recursos, pagos/validaciones, roles.
- Storage: documentos privados ligeros.
- Edge Functions: posible Stripe/webhooks/emails en fase posterior.

### Stripe u otra pasarela

Pendiente de decisión. No activar en apertura.

## Modelo funcional preliminar

```text
Alta socio
  → registro pending_payment/pending_review
  → pago Stripe o transferencia
  → validación automática/manual
  → member.status = active
  → paid_until calculado
  → acceso a biblioteca privada
  → alerta de renovación antes de vencimiento
```

## Tablas candidatas

```text
members
payments
resources
resource_files
profiles/admin_users opcional
```

## Pantallas candidatas MVP

### Socio

- Login.
- Home socios.
- Biblioteca de recursos.
- Ficha de recurso.
- Mi cuenta/estado.

### Admin

- Dashboard socios.
- Crear/editar socio.
- Registrar/validar pago.
- Dashboard recursos.
- Crear/editar/publicar recurso.
- Renovaciones próximas.

## Hosting pendiente

Opciones a decidir:

- Cloudflare Pages.
- Netlify.

GitHub se usará como repositorio/versionado selectivo, no necesariamente como hosting principal.

## Pendiente antes de código

- Cerrar flujo MVP.
- Decidir Cloudflare Pages vs Netlify.
- Decidir CSS propio vs shadcn/ui.
- Decidir pago MVP.
- Definir modelo de datos v0.
- Definir roles internos.
