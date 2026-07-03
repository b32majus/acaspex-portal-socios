# H0.9I-A — Decisiones producto y preparación de importación legacy

Fecha: 2026-07-03  
Status: documented  
Alcance: documentación de decisiones. Sin código, sin migraciones, sin Supabase, sin datos reales.

## 1. Regla operativa de trabajo

A partir de H0.9I, las work orders deben ser **atómicas, acotadas y seriales**.

No se deben mezclar en una misma WO:

- RPC/transacciones;
- cambios UI;
- documentación amplia;
- importación legacy;
- SMTP;
- limpieza de staging;
- migraciones de datos.

Cada WO debe tener:

1. preflight;
2. alcance estrecho;
3. validación;
4. handoff;
5. parada explícita antes de continuar.

## 2. Estado operativo acordado

El portal **no operará con socios reales hasta después del verano**.

La fase actual es:

- terminar el montaje completo;
- sustituir contenido mock/hardcodeado por contenido real;
- preparar importación de socios legacy desde Excel;
- hacer pruebas funcionales con Ana T.;
- posponer SMTP-final hasta la reunión con Ana T. y la cuenta corporativa oficial.

## 3. SMTP y correo corporativo

Decisión:

- D033 SMTP-final **no se aborda todavía**.
- Se abordará tras reunión con Ana T. prevista en aproximadamente dos semanas.
- Debe configurarse con el correo corporativo oficial de ACASPEX.
- Los emails deben salir desde la cuenta oficial de la sociedad, no desde cuentas personales ni soluciones temporales.

Implicaciones:

- B4 reenvío/reset password sigue bloqueado por D033.
- Emails automáticos de bienvenida, invitación, renovación o recordatorio siguen diferidos.
- No implementar flujos dependientes de email hasta resolver D033.

Preguntas para Ana T. / Junta:

- ¿Cuál será la cuenta oficial remitente?
- ¿Quién administra esa cuenta?
- ¿Se usará Outlook/Microsoft?
- ¿Existe 2FA o restricción de seguridad?
- ¿Qué firma/texto deben llevar las invitaciones?
- ¿Quién valida los textos definitivos?

## 4. Validación de pagos

Decisión:

La validación del justificante sigue siendo **manual por administración**.

El sistema **no da por bueno automáticamente** un justificante subido por el socio.

Flujo funcional:

```text
socio/admin aporta justificante
→ Ana T. / admin lo revisa
→ si es correcto, admin pulsa “Registrar pago” o “Registrar renovación”
→ entonces se crea payment_status = validated
```

La deuda D-H09G-002 no cuestiona esta validación humana. La deuda es técnica: hoy la renovación hace `INSERT payment` + `UPDATE member` en dos llamadas separadas. Cuando se aborde, será para hacer esa operación atómica, no para automatizar la decisión administrativa.

## 5. `membership_start`

Decisión:

`membership_start` significa **fecha histórica de alta como socio de ACASPEX**.

No significa:

- alta en el portal;
- activación de cuenta de acceso;
- fecha de invitación;
- fecha de login.

El portal es accesorio a la condición de socio. Una persona solicita o mantiene su condición de socio; el portal es una herramienta añadida.

Para socios importados desde Excel legacy, `membership_start` debe venir del dato histórico real de alta como socio.

## 6. `paid_until`

Decisión:

`paid_until` significa **fecha hasta la que la cuota está pagada**.

Las renovaciones se calculan desde `paid_until`, no desde `today`.

Regla actual válida:

```text
new_period_start = old_paid_until + 1 día
new_period_end   = old_paid_until + 12 meses
members.paid_until = new_period_end
```

Esto sigue siendo válido para socios importados, siempre que `membership_start` y `paid_until` representen la realidad administrativa.

## 7. Socios actuales y primera anualidad

Decisión/contexto:

- ACASPEX acaba de crearse/activarse operativamente.
- Los socios actuales están en su primer año de vigencia.
- La importación se espera resolver en un plazo corto, antes de que nadie haya agotado su primer año.
- No se necesita todavía un modelo complejo de anualidades.

Aun así, queda documentado el concepto:

- `membership_start`: alta histórica como socio;
- `paid_until`: fin de la vigencia pagada actual;
- `payments`: histórico económico de pagos validados.

Preguntas para Ana T. / Junta:

- ¿La cuota se cuenta siempre desde fecha individual de alta?
- ¿O ACASPEX quiere funcionar por año natural?
- ¿Todos los socios actuales están efectivamente en su primer año?
- ¿Existe alguna excepción que deba tratarse manualmente?

## 8. Renovaciones sucesivas

Decisión:

Se permiten renovaciones sucesivas explícitas.

Cada confirmación añade un año más desde el `paid_until` actual.

Ejemplo:

```text
paid_until actual = 2027-06-28
renovación 1 → 2028-06-28
renovación 2 → 2029-06-28
```

Esto puede ser legítimo, pero la UI debe comunicarlo con claridad. La mejora de copy queda como WO atómica posterior.

## 9. Periodo de gracia tras vencimiento

Decisión conceptual:

Se acepta un **periodo de gracia de 30 días** tras `paid_until` antes de bloquear acceso de forma radical.

Regla futura propuesta:

```text
hasta paid_until:
  cuota vigente

paid_until + 1 a paid_until + 30:
  vencido en periodo de gracia; acceso permitido con aviso

después de paid_until + 30:
  acceso bloqueado
```

No se implementa en H0.9I-A. Queda como deuda/decisión pendiente de implementación.

Preguntas para Ana T. / Junta:

- ¿Confirmamos 30 días como margen oficial?
- ¿Qué mensaje debe ver el socio durante la gracia?
- ¿Debe avisarse por email cuando SMTP esté disponible?
- ¿Quién decide excepciones o prórrogas manuales?

## 10. `membership_periods`

Decisión:

No usar `membership_periods` en MVP.

Motivo:

- `payments` ya guarda el histórico económico de pagos validados;
- `members.paid_until` resuelve la vigencia operativa;
- activar `membership_periods` ahora añade complejidad sin necesidad inmediata.

`membership_periods` queda como arquitectura futura si se necesita separar formalmente:

- periodos de derecho como socio;
- pagos económicos;
- becas/condonaciones/excepciones;
- regularizaciones administrativas sin pago asociado.

## 11. Staging y datos sintéticos

Decisión:

No limpiar staging todavía.

Motivo:

- los socios sintéticos permiten probar flujos;
- todavía quedan pruebas funcionales con Ana T.;
- antes de importación real conviene decidir qué conservar y qué borrar;
- no hacer DELETE sin autorización explícita.

Punto específico:

Ana T. podría querer dejar su cuenta real validada con su justificante real. Esto debe tratarse separadamente de los datos sintéticos.

Preguntas para Ana T. / Junta:

- ¿Qué datos de staging deben conservarse para pruebas?
- ¿Qué socios/demo deben limpiarse antes de importación real?
- ¿Quiere Ana T. validar ya su cuenta real?
- ¿Cuándo hacemos limpieza controlada preimportación?

## 12. Importación legacy desde Excel

Decisión:

El siguiente bloque funcional recomendado es preparar la importación legacy desde el Excel/base actual de socios.

No se importan datos reales todavía en H0.9I-A.

La importación debe mapear, como mínimo:

- datos personales;
- email;
- tipo de socio/cuota;
- fecha histórica de alta como socio (`membership_start`);
- estado del socio;
- vigencia pagada actual (`paid_until`) o regla para calcularla;
- justificantes/documentación si existen;
- observaciones administrativas si existen.

Si el Excel no trae `paid_until`, hay que acordar regla con Ana T./Junta.

Preguntas para Ana T. / Junta:

- ¿Qué columnas exactas tiene el Excel actual?
- ¿Qué columna representa la fecha histórica de alta como socio?
- ¿Existe columna de fecha de pago o vigencia hasta?
- ¿Existe estado actual del socio?
- ¿Hay socios sin email?
- ¿Hay emails duplicados?
- ¿Hay socios con cuota reducida: residentes, estudiantes, jubilados?
- ¿Hay bajas, pendientes o personas que no deben importarse como active?
- ¿Se importan todos primero sin acceso al portal y luego se invita por tandas?

## 13. Contenido real del portal

Decisión/contexto:

Antes de invitar socios reales, hay que sustituir contenido mock/hardcodeado por contenido real.

Preguntas para Ana T. / Junta:

- ¿Qué secciones deben estar listas antes de invitar socios?
- ¿Qué documentos/materiales deben publicarse?
- ¿Qué contenido mock debe eliminarse?
- ¿Quién valida textos, recursos y categorías finales?
- ¿Qué debe poder ver socio vs Junta vs admin?

## 14. Roadmap recomendado tras H0.9I-A

Orden recomendado, manteniendo WOs atómicas y seriales:

1. **H0.9I-B** — Mejora copy renovaciones sucesivas.
2. **H0.9I-C** — Auditoría/diseño RPC transaccional renovación.
3. **H0.9I-D** — Implementación RPC transaccional renovación, si el diseño queda validado.
4. **H0.9I-E** — Validación staging RPC renovación.
5. **H0.9J-A** — Auditoría/mapeo Excel legacy.
6. **H0.9J-B** — Dry-run importador legacy, sin datos reales definitivos.
7. **D033 SMTP-final** — Tras reunión con Ana T. y correo corporativo.
8. **B4** — Reset/reenvío tras SMTP.

No hacer:

- importación real sin validación del mapping;
- limpieza staging sin autorización;
- SMTP antes de reunión Ana T.;
- uso de `membership_periods` en MVP;
- pagos online/Stripe sin decisión de negocio.
