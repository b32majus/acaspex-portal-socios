---
title: PRD v0.1 — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: living-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# PRD v0.1 — ACASPEX Portal Socios

## 1. Resumen

ACASPEX Portal Socios será una herramienta ligera para gestionar altas, cuotas, estado de socios, acceso privado y recursos exclusivos de la Asociación Extremeña de Calidad Asistencial y Seguridad de Pacientes.

No sustituye inicialmente la web pública actual de ACASPEX en Google Sites. La complementa con una capa funcional privada.

```text
Google Sites = web pública institucional
Portal Socios = sistema privado de socios, pagos/validaciones y recursos
Supabase = backend operativo
```

## 2. Contexto actual

ACASPEX dispone actualmente de:

- web pública en Google Sites;
- formulario de inscripción mediante Microsoft Forms;
- volcado de respuestas a Excel;
- pago de cuota mediante transferencia bancaria;
- revisión/seguimiento manual;
- ausencia de sistema integrado para controlar estado de socio, renovación y acceso privado.

El formulario actual solicita datos personales, contacto, perfil profesional, vinculación con calidad asistencial/seguridad del paciente y aceptación de comunicaciones/privacidad.

Cuotas actuales según formulario compartido por Sil:

```text
Cuota general: 50 euros
Cuota reducida: 30 euros
```

La cuota reducida aplica a residentes en formación sanitaria especializada, estudiantes de rama sanitaria o profesionales jubilados. La transferencia bancaria es el método actual. El dato bancario completo no debe replicarse en documentos operativos salvo entorno autorizado.

## 3. Problema

El proceso actual es suficiente para arrancar, pero no escala bien:

1. El alta y el pago están separados.
2. La validación del pago depende de revisión manual.
3. El estado de socio no está conectado a un acceso privado.
4. No hay control robusto de renovación o vencimiento.
5. La cuota reducida requiere gestión manual adicional.
6. El histórico queda en Excel, pero no en una base operativa.
7. La administración puede perder trazabilidad de fechas, pagos y bajas.
8. No existe aún una propuesta de valor digital clara para socios activos.

## 4. Objetivo del producto

Crear un portal privado y backoffice mínimo que permita:

- registrar solicitudes de alta;
- gestionar socios y estados;
- controlar cuota, pago y periodo de validez;
- activar o desactivar acceso a recursos privados;
- publicar materiales exclusivos para socios;
- preparar integración futura con Stripe u otra pasarela;
- facilitar renovaciones y alertas administrativas.

## 5. Usuarios

### 5.1 Socio/a

Persona que solicita inscripción o ya pertenece a ACASPEX.

Necesita:

- darse de alta;
- pagar o justificar pago;
- acceder al área privada si está activo;
- consultar recursos exclusivos;
- ver estado básico de su membresía;
- recibir recordatorios o información relevante.

### 5.2 Admin ACASPEX

Persona de secretaría, comunicación o junta que gestiona socios.

Necesita:

- ver solicitudes de alta;
- validar pagos/manuales;
- activar o inactivar socios;
- consultar renovaciones próximas;
- corregir datos;
- exportar información si procede.

### 5.3 Editor de contenidos

Persona que sube materiales al área privada.

Necesita:

- crear fichas de recursos;
- subir documentos;
- pegar enlaces de vídeo;
- publicar/despublicar recursos;
- categorizar materiales.

En MVP, Admin y Editor pueden ser el mismo rol.

### 5.4 Responsable técnico

Sil/Hermes inicialmente, o proveedor futuro.

Necesita:

- mantener configuración;
- revisar incidencias;
- evolucionar el sistema;
- documentar decisiones y cambios.

## 6. Alcance MVP v0.1

El MVP v0.1 debe mantener el formulario actual de Microsoft Forms como fallback inicial mientras se construye y prueba el nuevo formulario propio.

La arquitectura destino es que el nuevo formulario, integrado o enlazado desde Google Sites, escriba directamente en Supabase y permita adjuntar justificantes/acreditaciones.

El MVP v0.1 debe permitir:

1. Mantener Microsoft Forms activo hasta validar el nuevo flujo.
2. Crear un formulario propio equivalente, con capacidades ampliadas.
3. Probar que el formulario propio puede integrarse/enlazarse desde Google Sites.
4. Escribir directamente en Supabase.
5. Subir justificante de transferencia.
6. Subir acreditación de cuota reducida, si aplica.
7. Usar el Excel de Microsoft Forms como fuente transitoria/fallback.
8. Registrar estados básicos de socio.
9. Validar acceso por email y estado activo.
10. Crear portal privado para socios activos.
11. Crear biblioteca de recursos privados.
12. Crear ficha de recurso con texto, categoría, archivo/enlace y estado publicado.
13. Crear panel admin para socios.
14. Crear panel admin para recursos.
15. Gestionar pago manual ordenado.
16. Registrar cuota válida hasta.
17. Mostrar renovaciones próximas o vencidas.

## 7. Alcance MVP v0.2 candidato

1. Stripe Checkout para pago único anual.
2. Webhook de confirmación de pago.
3. Activación automática tras pago confirmado.
4. Email de bienvenida.
5. Email de renovación.
6. Enlace de renovación anual.
7. Importación controlada desde Excel histórico.

## 8. Fuera de alcance por ahora

No entra en MVP v0.1:

- migrar toda la web pública de Google Sites;
- domiciliación bancaria completa;
- SEPA recurrente;
- contabilidad avanzada;
- facturación compleja;
- comunidad/foro;
- app móvil nativa;
- datos sanitarios o clínicos;
- automatizaciones masivas sin validación;
- despliegue público sin revisión;
- pagos reales sin decisión explícita.

## 9. Flujos funcionales principales

### 9.1 Alta con formulario actual + transferencia manual ordenada

```text
Usuario completa Microsoft Forms público
→ Microsoft Forms vuelca respuesta al Excel actual
→ sistema importa/sincroniza la fila hacia Supabase
→ se crea solicitud en estado pending_payment o pending_review
→ admin revisa pago/acreditación según proceda
→ admin valida pago
→ socio pasa a active
→ se calcula paid_until
→ se habilita acceso al portal privado
```

### 9.2 Alta con pago online futuro

```text
Usuario completa formulario
→ sistema crea solicitud pending_payment
→ usuario paga mediante Stripe Checkout u otra pasarela
→ webhook confirma pago
→ socio pasa a active
→ se calcula paid_until
→ se habilita acceso al portal privado
```

### 9.3 Acceso al portal

```text
Usuario introduce email
→ Supabase Auth envía magic link/código
→ app consulta estado del socio
→ si active y dentro de periodo válido, entra
→ si no, muestra mensaje de soporte/renovación
```

### 9.4 Publicación de recursos

```text
Admin/editor crea recurso
→ añade título, descripción, categoría y texto de presentación
→ sube archivo o pega enlace externo
→ guarda como borrador o publica
→ si publicado, aparece en biblioteca de socios
```

### 9.5 Renovación

```text
Sistema calcula paid_until
→ admin ve renovaciones próximas/vencidas
→ se contacta manualmente o se envía email futuro
→ socio paga renovación
→ se actualiza paid_until
```

## 10. Campos actuales del alta

Fuente: formulario actual compartido por Sil.

### Identificación

- Primer apellido.
- Segundo apellido.
- Nombre.
- Tipo de documento.
- Número de documento.
- Domicilio.
- Código postal.

### Contacto

- Email.
- Repetición de email.
- Teléfono móvil.

### Perfil profesional

- Categoría profesional.
- Puesto de trabajo.
- Organización en la que trabaja.
- Vinculación con Calidad Asistencial y Seguridad de Pacientes.

### Consentimientos

- Consentimiento para recibir correos de actividades e iniciativas.
- Aceptación de tratamiento de datos personales.

## 11. Campos nuevos o derivados necesarios

- Tipo de cuota: general / reducida.
- Motivo cuota reducida: residente / estudiante / jubilado.
- Acreditación cuota reducida, si aplica.
- Método de pago.
- Estado de pago.
- Fecha de solicitud.
- Fecha de validación.
- Inicio de membresía.
- Cuota válida hasta.
- Estado de socio.
- Email de acceso al portal.
- Email alternativo opcional.
- Origen del alta: formulario nuevo / importación Excel / alta manual.

## 12. Estados de socio candidatos

```text
pending_payment
pending_review
active
expired
inactive
cancelled
```

Definición preliminar:

- `pending_payment`: solicitud creada, pago no confirmado.
- `pending_review`: requiere revisión administrativa.
- `active`: socio activo con acceso permitido.
- `expired`: periodo de cuota vencido.
- `inactive`: socio dado de baja o desactivado sin eliminación.
- `cancelled`: solicitud o membresía cancelada.

## 13. Métricas de éxito

Métricas funcionales:

- reducción de altas gestionadas manualmente fuera del sistema;
- porcentaje de socios con estado y paid_until correctamente informados;
- número de recursos publicados en área privada;
- reducción de incidencias por acceso;
- renovaciones detectadas antes de vencimiento;
- capacidad de exportar lista de socios activos.

Métricas cualitativas:

- administración entiende el panel sin soporte técnico constante;
- el socio percibe valor real en el área privada;
- el sistema no depende de memoria humana para vencimientos.

## 14. Riesgos

1. Exceso de complejidad inicial.
2. Dependencia de Sil/Hermes si no se documenta bien.
3. Pedir más datos personales de los necesarios.
4. Confusión entre email de alta, email de pago y email de acceso.
5. Gestión manual de cuota reducida.
6. Contenido descargado puede compartirse fuera del portal.
7. Falta de claridad sobre año natural vs 12 meses desde alta.
8. Pasarela de pago introduce obligaciones operativas/contables.
9. Roles admin mal definidos.

## 15. Decisiones pendientes

1. Confirmar si cuota va por año natural o 12 meses desde alta.
2. Confirmar si DNI/documento es obligatorio por estatutos/gestión administrativa.
3. Confirmar si domicilio completo es necesario o puede minimizarse.
4. Confirmar si transferencia manual entra en MVP v0.1.
5. Confirmar si Stripe entra en v0.1 o v0.2.
6. Confirmar quién valida pagos y cuota reducida.
7. Confirmar correo oficial para soporte y privacidad.
8. Confirmar hosting frontend: Cloudflare Pages o Netlify.
9. Confirmar stack visual: CSS propio, shadcn/ui u otro.
10. Confirmar plan de importación desde Excel actual.

## 16. Criterios de aceptación del PRD v0.1

El PRD v0.1 se considerará suficientemente maduro cuando estén definidos:

- flujo de alta;
- método de pago MVP;
- estados de socio;
- campos obligatorios y opcionales;
- roles internos;
- alcance del MVP;
- decisión sobre Stripe v0.1/v0.2;
- base mínima para data-model.md.

## 17. Próximo paso

Tratar el formulario actual y su Excel como input canónico. Definir cómo se importan/sincronizan esos datos hacia Supabase y qué campos derivados añade el sistema sin modificar el formulario público inicial.
