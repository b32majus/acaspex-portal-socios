---
title: Estrategia transición formularios — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: living-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# Estrategia transición formularios — ACASPEX Portal Socios

## 1. Decisión de producto

El formulario actual de Microsoft Forms se mantiene inicialmente en Google Sites como punto de entrada público hasta que el nuevo formulario propio esté probado, embebido y validado.

La arquitectura destino no es depender permanentemente de Microsoft Forms/Excel, sino sustituirlo por un formulario propio cuando se confirme que:

```text
1. se puede insertar en Google Sites;
2. funciona correctamente desde la página pública;
3. escribe directamente en Supabase;
4. permite subida de justificantes;
5. permite validar cuota general/reducida;
6. no rompe el flujo actual de ACASPEX.
```

## 2. Principio rector

```text
No romper el proceso actual hasta que el nuevo flujo funcione mejor.
```

## 3. Fases de transición

### Fase A — Situación actual protegida

```text
Google Sites
→ Microsoft Forms actual
→ Excel de respuestas
→ gestión manual ACASPEX
```

Uso: continuidad operativa.

Regla: no tocar el formulario actual hasta tener alternativa funcional.

### Fase B — Nuevo formulario en entorno de prueba

```text
Formulario propio ACASPEX dev
→ Supabase dev
→ Storage dev para justificantes/acreditaciones
→ panel admin dev
```

Objetivo: probar funcionamiento sin afectar a ACASPEX.

Debe permitir:

- mismos campos principales del formulario actual;
- selección cuota general/reducida;
- subida de justificante de transferencia;
- subida de documento acreditativo para cuota reducida;
- creación directa de registro en Supabase;
- estado inicial pending_review o pending_payment;
- visualización por admin.

### Fase C — Prueba embebida en Google Sites

```text
Google Sites página de prueba/no visible
→ embed del formulario propio
→ Supabase dev
```

Objetivo: confirmar que el formulario propio puede vivir dentro de Google Sites o como página embebida/enlazada desde Google Sites.

Validaciones:

- carga correctamente;
- es usable en móvil;
- no bloquea iframe/embed;
- permite subir archivos;
- confirma envío;
- no expone credenciales;
- no rompe experiencia visual.

### Fase D — Sustitución controlada

```text
Google Sites público
→ nuevo formulario propio
→ Supabase producción
→ admin valida altas/pagos
```

Solo cuando Sil/ACASPEX lo autoricen.

A partir de esta fase, Microsoft Forms queda como fallback temporal o se retira.

## 4. Formulario destino

El formulario propio debe conservar la lógica del formulario actual, pero añadir capacidades que Microsoft Forms/Excel no resuelve bien en el sistema destino.

### Campos actuales que debe cubrir

- Primer apellido.
- Segundo apellido.
- Nombre.
- Tipo de documento.
- Número de documento.
- Domicilio.
- Código postal.
- Email.
- Repetición de email o validación equivalente.
- Teléfono móvil.
- Categoría profesional.
- Puesto de trabajo.
- Organización.
- Vinculación con Calidad Asistencial y Seguridad de Pacientes.
- Consentimiento comunicaciones.
- Aceptación privacidad.

### Campos/funciones adicionales destino

- Tipo de cuota: general / reducida.
- Motivo de cuota reducida: residente / estudiante / jubilado.
- Subida de justificante de transferencia bancaria.
- Subida de documento acreditativo de cuota reducida, si aplica.
- Estado inicial de solicitud.
- Registro directo en Supabase.
- Aviso de siguiente paso tras enviar.

## 5. Cuota y documentación

### Cuota general

Importe actual según formulario: 50 euros.

Requiere:

- datos de socio;
- justificante de transferencia si el pago sigue siendo bancario;
- revisión/validación administrativa.

### Cuota reducida

Importe actual según formulario: 30 euros.

Aplica a:

```text
residentes en formación sanitaria especializada
estudiantes de rama sanitaria
profesionales jubilados
```

Requiere:

- selección de motivo;
- documento acreditativo;
- revisión administrativa;
- validación antes de activar acceso.

## 6. Flujo destino con transferencia

```text
Usuario entra en Google Sites
→ completa formulario propio embebido/enlazado
→ sube justificante de transferencia
→ si cuota reducida, sube acreditación
→ Supabase crea solicitud
→ estado pending_review
→ admin revisa pago y documentos
→ admin activa socio
→ paid_until calculado
→ socio puede acceder al portal privado
```

## 7. Arquitectura técnica candidata

### Opción recomendada

```text
Formulario propio en app frontend
→ endpoint/función segura
→ Supabase Postgres
→ Supabase Storage para documentos
```

Preferencia: no permitir que una página pública escriba libremente sin validaciones fuertes.

Opciones técnicas:

1. Frontend con Supabase anon key + RLS muy restrictiva.
2. Frontend + Edge Function/API que valida y escribe en Supabase.
3. Upload directo a Storage con políticas específicas o signed upload flow.

La opción 2 es más segura para producción si el formulario es público y permite subir archivos.

## 8. Riesgos específicos

1. Google Sites puede no embeber cualquier web si la web bloquea iframe o si hay problemas de permisos.
2. El formulario público puede recibir spam o archivos no deseados.
3. La subida de justificantes/acreditaciones implica datos personales y documentos sensibles administrativos.
4. Un formulario público no debe exponer service role key ni secretos.
5. Los archivos subidos deben quedar en bucket privado o con acceso controlado.
6. Hay que definir límites de tamaño y tipo de archivo.
7. Hay que definir conservación/eliminación de justificantes y acreditaciones.

## 9. Decisión operativa actual

```text
Microsoft Forms se mantiene como fallback inicial.
El formulario propio es arquitectura destino.
No se sustituye el formulario público hasta probar embed + envío + subida de archivos + escritura Supabase.
```

## 10. Próximo paso

Definir especificación del formulario propio destino:

```text
pantallas/campos
validaciones
archivos permitidos
tamaños máximos
mensaje post-envío
estados generados
qué ve admin
qué ocurre si falta justificante/acreditación
```

Después actualizar:

```text
PRD.md
data-model.md
architecture.md
security.md
backlog.md
```
