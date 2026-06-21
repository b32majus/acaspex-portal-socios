# Seguridad — ACASPEX Portal de Socios

Estado: `draft / pending_review`

## Clasificación de datos

### Permitidos en MVP con control

- Nombre y apellidos.
- Email de acceso.
- Email alternativo si procede.
- Centro/rol profesional.
- Tipo de socio.
- Estado de socio.
- Fecha de alta.
- Cuota válida hasta.
- Método de pago.
- Justificante de transferencia si se decide usarlo.

### No permitidos en MVP

- Datos sanitarios.
- Datos clínicos de pacientes.
- Información sensible no necesaria.
- Datos bancarios crudos si no son imprescindibles.
- Tarjetas o credenciales de pago: deben quedar en Stripe/pasarela, no en la app.

## Reglas Supabase

- Activar RLS antes de usar datos reales.
- No usar service role key en frontend.
- La clave anon solo puede operar bajo políticas RLS.
- Un socio no puede modificar su propio `status`, `role`, `paid_until` ni datos de pago.
- Admin y socio deben tener permisos separados.
- El acceso a recursos privados debe comprobar sesión y estado activo.

## Archivos

- PDFs/documentos privados ligeros pueden ir a Supabase Storage.
- Vídeos en YouTube oculto en MVP.
- Si un archivo es privado, evitar URLs públicas permanentes salvo decisión explícita.
- Valorar signed URLs o control de acceso mediante Storage policies.

## Pagos

- No activar Stripe/pasarela sin decisión explícita.
- No almacenar datos de tarjeta en Supabase.
- Confirmar pagos mediante webhook verificado, no por redirección del usuario.
- Mantener registro de pago suficiente para trazabilidad: importe, fecha, periodo, provider id, estado.

## RGPD y gobernanza

Pendiente de revisar:

- texto de privacidad del alta;
- base jurídica/tratamiento;
- responsable del tratamiento;
- conservación de datos;
- baja de socio;
- derecho de acceso/rectificación/supresión;
- quién tiene rol admin;
- exportaciones CSV y dónde se guardan.

## Zonas rojas

Requieren autorización explícita de Sil/ACASPEX:

- datos reales de socios;
- `.env`/tokens/secrets;
- deploy público;
- dominio real;
- Stripe/pagos reales;
- importación masiva de Excel real;
- cambios de permisos productivos.
