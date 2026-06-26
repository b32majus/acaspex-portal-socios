# H0.9C — Gestión de acceso e invitaciones

Última actualización: 2026-06-26
Status: active

## Estado actual

- H0.9B cerrado.
- H0.9C-A cerrado y validado por Sil.
- H0.9C-B1 (Edge Function create-member-access): done.
- H0.9C-B2 (botón UI Crear acceso): done.
- H0.9C-B2-FIX1 (grant INSERT/UPDATE sobre profiles a authenticated): done.
- H0.9C-B3 (bloquear/desbloquear acceso): done.
- HEAD validado: 87d1610.

## Arquitectura

```
auth.users.id = profiles.id
profiles.member_id → members.id
profiles.role = rol efectivo
profiles.is_active = acceso activo/inactivo
members.status + members.paid_until = elegibilidad de socio
```

## Decisiones cerradas

- Creación de acceso por Edge Function/backend.
- No service_role en frontend.
- No reutilización de números ACX.
- Borrado seguro: al eliminar member, desactivar profile antes.
- No borrar auth.users desde la app en MVP.
- La eliminación de member deja profile sin member_id por ON DELETE SET NULL, pero inactivo.
- La conexión del correo corporativo / SMTP propio se pospone hasta el final, cuando Sil haga los últimos ajustes presenciales con Ana T. Hasta entonces, se acepta que staging pueda quedar limitado por el SMTP gratuito/default de Supabase.

## H0.9C-A — Cerrado

Resumen de cambios:
- Estado de acceso en ficha administrativa de socio.
- Helper read-only `fetchMemberAccessProfile()`.
- Sustitución del badge genérico H0.9C.
- Aviso de acceso antes de eliminar socio.
- Trigger `deactivate_profiles_before_member_delete` BEFORE DELETE.
- Secuencia `members_member_number_seq` monotónica.
- `generate_member_number()` con `nextval()`.
- Validación manual Sil OK.

## H0.9C-B — Cerrado

Objetivo:
- Crear acceso/invitación desde ficha de socio mediante backend seguro.
- Bloquear/desbloquear acceso al portal sin modificar la ficha administrativa.

Micro-WOs:
- B1: Edge Function backend `create-member-access`, sin UI. ✓
- B2: Botón UI "Crear acceso / Enviar invitación". ✓
- B2-FIX1: GRANT INSERT/UPDATE sobre profiles a authenticated. ✓
- B3: Bloquear/desbloquear acceso al portal desde ficha. ✓
- B4: Reenviar invitación / reset password si procede. (pendiente)
- B5: `last_seen_at` si se decide registrar último acceso. (pendiente)
- SMTP-final: configurar correo corporativo / SMTP propio para invitaciones, recuperación de contraseña y emails transaccionales. Esta fase queda deliberadamente pospuesta hasta los últimos ajustes presenciales con Ana T.

## Distinción producto: socio vs acceso al portal

`members.status` representa la situación administrativa del socio:
- active
- expired
- inactive
- cancelled
- pending_review

`profiles.is_active` representa el interruptor de acceso/login al portal (true/false).

Bloquear el acceso al portal no modifica la situación administrativa del socio, su cuota ni su numeración. Solo impide que el usuario pueda operar en el portal mientras el perfil esté inactivo.

Eliminar una ficha de socio sigue desactivando automáticamente cualquier profile vinculado mediante el trigger `deactivate_profiles_before_member_delete`.

## Riesgos

- Orfandad parcial si falla profile tras crear auth user.
- Email ya existente en auth.users.
- Configuración de templates/redirección Supabase Auth.
- Rate limit del SMTP gratuito/default de Supabase hasta que se configure el correo corporativo / SMTP propio en la fase final.
- No confundir profile activo con socio activo.
- No exponer service_role.
- No crear múltiples profiles para el mismo member.
