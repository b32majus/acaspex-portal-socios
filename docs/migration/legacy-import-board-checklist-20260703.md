# Checklist Junta / Ana T. — Importación legacy socios ACASPEX

**Status:** checklist_preparatory
**Fecha:** 2026-07-03
**Origen:** H0.9J-A + H0.9J-B
**Uso:** preparación para reunión con la Junta y Ana T. antes de cualquier migración real.

---

## 0. Contexto

Este checklist es la lista de preguntas y decisiones que la Junta / Ana T. deben validar antes de que el equipo técnico pueda:

- Construir un dry-run de transformación (H0.9J-C).
- Realizar una migración real desde el Excel que custodia la Junta.

No se importa nada hasta que cada bloque marcado como **CRÍTICO** quede respondido.

Acompañado de: `legacy-import-canonical-template-20260703.md` (plantilla canónica de columnas).

---

## 1. Fuente oficial

| # | Pregunta | Estado | Responsable | Notas |
|---|----------|:------:|--------------|-------|
| 1.1 | ¿Cuál es el fichero oficial? (¿export de Microsoft Forms, Excel administrativo posterior, otro?) | ☐ | Junta | — |
| 1.2 | ¿Quién lo mantiene? (¿Sil, Ana T., otra persona?) | ☐ | Junta | — |
| 1.3 | ¿Cuál es la fecha de corte del fichero? | ☐ | Junta | — |
| 1.4 | ¿Cuántos registros contiene aproximadamente? | ☐ | Junta | — |
| 1.5 | ¿Podemos disponer de solo cabecera + 3 filas ficticias/anonimizadas para validar transformación? | ☐ | Junta | Sin datos reales |
| 1.6 | ¿Podemos disponer de una muestra anonimizada de 5–10 filas reales para validar formato y duplicados? | ☐ | Junta | Anonimización previa |
| 1.7 | ¿Dónde se custodiará el fichero durante la migración? (¿local Sil? ¿servidor seguro? ¿encriptado?) | ☐ | Junta + Sil | RGPD |
| 1.8 | ¿Se destruirá copia temporal tras importación? | ☐ | Junta | Política de retención |

---

## 2. Datos personales

Checklist de completitud por registro:

| Campo | Obligatorio | Validar |
|-------|:-----------:|---------|
| Nombre y apellidos completos | ✅ | ☐ |
| Email principal | ✅ | ☐ |
| Email repetido coincide con email principal | ✅ | ☐ |
| Tipo de documento (DNI/NIE/Pasaporte) | ✅ | ☐ |
| Número de documento | ✅ | ☐ |
| Teléfono | ❌ | ☐ |
| Dirección postal | ❌ | ☐ |
| Código postal | ❌ | ☐ |
| Ciudad | ❌ | ☐ |
| Provincia | ❌ | ☐ |
| Categoría profesional | ❌ | ☐ |
| Puesto de trabajo | ❌ | ☐ |
| Organización | ❌ | ☐ |
| Vinculación calidad/seguridad | ❌ | ☐ |
| Consentimiento comunicaciones | ✅ | ☐ |
| Aceptación privacidad | ✅ | ☐ |

Decisiones pendientes:

- [ ] ¿Se importan registros sin email? (Si no, marcar para revisión manual o skip).
- [ ] ¿Se importan registros sin documento? (Mismo criterio).
- [ ] ¿Se normaliza el formato del teléfono con prefijo +34?

---

## 3. Alta y vigencia (CRÍTICO)

| # | Pregunta | Estado | Impacto |
|---|----------|:------:|---------|
| 3.1 | ¿Qué fecha representa `membership_start`? (alta como socio, solicitud, aprobación) | ☐ | **CRÍTICO** |
| 3.2 | ¿`Hora de finalización` del Forms equivale a solicitud o alta aprobada por Junta? | ☐ | **CRÍTICO** |
| 3.3 | ¿Hay aprobación posterior por Junta que distinga "solicitado" de "socio aprobado"? | ☐ | **CRÍTICO** |
| 3.4 | ¿La cuota es anual desde fecha individual de alta? | ☐ | **CRÍTICO** |
| 3.5 | ¿La cuota es por año natural (1 ene – 31 dic)? | ☐ | **CRÍTICO** |
| 3.6 | ¿Todos los socios actuales están en su primer año? | ☐ | — |
| 3.7 | ¿Existe `paid_until` real en algún documento/registro externo? | ☐ | **CRÍTICO** |
| 3.8 | Si no existe `paid_until`, ¿autorizan `paid_until = membership_start + 12 meses`? | ☐ | **CRÍTICO** |
| 3.9 | Si un socio tiene `membership_start` desconocido, ¿se importa con `status = 'pending_review'` y `paid_until = null`? | ☐ | — |
| 3.10 | ¿Hay excepciones documentadas (socios con segunda anualidad ya pagada)? | ☐ | — |

---

## 4. Estado administrativo

| # | Pregunta | Estado |
|---|----------|:------:|
| 4.1 | ¿Todos los del Excel son socios activos? | ☐ |
| 4.2 | ¿Hay socios pendientes de revisión que no deben importarse como `active`? | ☐ |
| 4.3 | ¿Hay bajas (`cancelled`) o inactivos (`inactive`)? | ☐ |
| 4.4 | ¿Hay socios en estado `expired` (cuota vencida) que no han renovado? | ☐ |
| 4.5 | ¿Hay duplicados conocidos (mismo email o mismo documento)? | ☐ |
| 4.6 | ¿Quién valida el estado inicial de cada registro? | ☐ |
| 4.7 | ¿Se importan todos con `status = 'active'` salvo los marcados explícitamente como `pending_review`? | ☐ |

---

## 5. Cuotas y perfiles

| # | Pregunta | Estado |
|---|----------|:------:|
| 5.1 | ¿Los tipos de socio son solo `general` (50€) y `reducida` (30€)? | ☐ |
| 5.2 | ¿Hay socios `residente` / `estudiante` / `jubilado` en el legacy? | ☐ |
| 5.3 | ¿Hay cuotas bonificadas o exentas? | ☐ |
| 5.4 | ¿Qué hacer si no consta perfil? (asumir `general` + 50€) | ☐ |
| 5.5 | ¿Existe acreditación para los `residente` / `estudiante` / `jubilado`? | ☐ |
| 5.6 | ¿Se sube el justificante al portal o se queda solo en ficha administrativa? | ☐ |

---

## 6. Pagos (CRÍTICO si se crean payments iniciales)

| # | Pregunta | Estado | Impacto |
|---|----------|:------:|---------|
| 6.1 | ¿Hay control externo de transferencias (hoja aparte, extracto bancario)? | ☐ | — |
| 6.2 | ¿Hay justificantes físicos/digitales? | ☐ | — |
| 6.3 | ¿Hay fecha de pago? | ☐ | **CRÍTICO** |
| 6.4 | ¿Se quiere crear `payment` inicial de migración? | ☐ | **CRÍTICO** |
| 6.5 | Si sí, ¿qué periodo cubre? (p. ej., desde `membership_start` hasta `paid_until`) | ☐ | **CRÍTICO** |
| 6.6 | Si sí, ¿qué importe? (¿regla 50/30 según perfil?) | ☐ | **CRÍTICO** |
| 6.7 | Si sí, ¿qué `payment_status`? (¿`validated` con soporte, o `pending`?) | ☐ | **CRÍTICO** |
| 6.8 | Si `validated`, ¿quién figura como `validated_by`? (Ana T., Sil, ¿id de admin?) | ☐ | **CRÍTICO** |
| 6.9 | Si sí, ¿qué nota debe quedar en `notes`? (ej. "Migración legacy — sin justificante físico") | ☐ | — |
| 6.10 | Si no, ¿basta con `members.paid_until` y sin `payment`? | ☐ | — |

---

## 7. Acceso al portal

| # | Pregunta | Estado |
|---|----------|:------:|
| 7.1 | ¿Importamos primero `members` sin acceso al portal? | ☐ |
| 7.2 | ¿Cuándo invitamos a los socios a crear su cuenta? (¿tras H0.9J-C?, ¿tras D033 SMTP-final?) | ☐ |
| 7.3 | ¿Invitamos por tandas? (¿cuántas y cómo?) | ☐ |
| 7.4 | ¿Qué hacemos con socios sin email? (¿skip?, ¿importar para admin con nota?) | ☐ |
| 7.5 | ¿Ana T. quiere validar su cuenta real primero? | ☐ |
| 7.6 | ¿Alguno de los socios actuales ya tiene cuenta en el portal? (validar duplicados) | ☐ |

---

## 8. Privacidad / RGPD

| # | Pregunta | Estado |
|---|----------|:------:|
| 8.1 | ¿Existe autorización explícita para tratar el fichero con fines de migración? | ☐ |
| 8.2 | ¿Se permite usar datos reales en staging o debe anonimizarse? | ☐ |
| 8.3 | ¿El fichero se custodia cifrado o en claro? | ☐ |
| 8.4 | ¿Quién puede acceder al fichero durante el trabajo técnico? | ☐ |
| 8.5 | ¿Se destruye copia temporal tras importación? | ☐ |
| 8.6 | ¿Debe firmarse algún acuerdo o dejar acta? | ☐ |
| 8.7 | ¿Se mantiene un log de accesos? | ☐ |
| 8.8 | ¿Existe plazo de retención post-importación? | ☐ |

---

## 9. Criterios de go / no-go antes de H0.9J-C

Para iniciar el dry-run validator (H0.9J-C), todos los siguientes deben estar ✅:

- [ ] fichero oficial identificado (o al menos muestra de 3 filas ficticias/anonimizadas disponible)
- [ ] regla `membership_start` validada (sección 3)
- [ ] regla `paid_until` validada (sección 3)
- [ ] status inicial validado (sección 4)
- [ ] `member_profile` y `fee_amount` validados (sección 5)
- [ ] decisión sobre payments iniciales tomada (sección 6)
- [ ] tratamiento de socios sin email decidido (sección 7)
- [ ] muestra anonimizada o ficticia disponible (1.5, 1.6)
- [ ] autorización RGPD confirmada (8.1, 8.2)
- [ ] no datos reales en repo confirmado (regla de WO)

**Si algún bloque queda ☐, NO proceder con H0.9J-C.** Documentar bloqueos en handoff y esperar.

---

## 10. Decisiones a documentar

Tabla de decisiones formales. Llenar tras la reunión con Junta/Ana T.:

| Decisión | Opciones consideradas | Decisión tomada | Responsable | Fecha |
|----------|----------------------|-----------------|--------------|-------|
| 3.4/3.5 Tipo de cuota | Anual individual / Año natural / Otra | | | |
| 3.8 Cálculo paid_until | membership_start + 12m / Fecha real / Sin paid_until | | | |
| 4.7 Status inicial | Todos active / Mixto | | | |
| 5.4 Perfil por defecto | general / 30€ / Mixto | | | |
| 6.4-6.10 Payments iniciales | Sí / No / Condicionado | | | |
| 7.1-7.2 Acceso al portal | Tras migración / Tras SMTP / Por tandas | | | |
| 8.1-8.8 Privacidad | Decisión formal sobre tratamiento | | | |

Esta tabla se copiará al `legacy-import-canonical-template-20260703.md` y al `PROJECT_STATE_CURRENT.md` tras la reunión.

---

## 11. Próximos pasos

1. **Reunión con Ana T. / Junta** — usar este checklist como orden del día.
2. **H0.9J-C** (dry-run validator) — solo si todos los criterios go/no-go son ✅.
3. **Migración real** — solo tras dry-run validado con muestra.
4. **D033 SMTP-final** — bloqueante para envío real de emails (invitación, bienvenida).
5. **H0.9G/H0.9I** — cerrados, incluyendo RPC transaccional de renovación. Disponibles para socios importados.

---

## 12. Referencias

- `legacy-import-canonical-template-20260703.md` — Plantilla canónica de columnas.
- `docs/migration/microsoft-forms-excel-header-mapping-20260622.md` — Mapping preliminar original.
- `docs/h09i-decisions-legacy-import-20260703.md` — Decisiones H0.9I-A (membership_start, paid_until, etc.).
- `/srv/kairos-lab/state/coding-workshop/handoffs/acaspex/20260703-0023-h09j-a-legacy-headers-audit-handoff.md` — Audit H0.9J-A.
- `/srv/kairos-lab/state/coding-workshop/handoffs/acaspex/20260703-0014-h09g-f-renewals-staging-validation-handoff.md` — Validación H0.9G-F.
- `/srv/kairos-lab/state/coding-workshop/handoffs/acaspex/20260703-0020-h09i-e-renewal-rpc-staging-validation-handoff.md` — Validación H0.9I-E.

---

*Status: checklist_preparatory — pendiente de sesión con Junta/Ana T.*
