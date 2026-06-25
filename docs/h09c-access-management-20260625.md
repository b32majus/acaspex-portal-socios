# H0.9C — Gestión de acceso e invitaciones

Última actualización: 2026-06-25
Status: pending_review

## Estado actual

- H0.9B cerrado.
- H0.9C-A cerrado y validado por Sil.
- HEAD validado: 6329e7d.

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

## H0.9C-B — Próximo bloque

Objetivo:
- Crear acceso/invitación desde ficha de socio mediante backend seguro.

Micro-WOs:
- B1: Edge Function backend `create-member-access`, sin UI.
- B2: Botón UI "Crear acceso / Enviar invitación".
- B3: Desactivar/reactivar acceso desde ficha.
- B4: Reenviar invitación / reset password si procede.
- B5: `last_seen_at` si se decide registrar último acceso.
- SMTP-final: configurar correo corporativo / SMTP propio para invitaciones, recuperación de contraseña y emails transaccionales. Esta fase queda deliberadamente pospuesta hasta los últimos ajustes presenciales con Ana T.

## Riesgos

- Orfandad parcial si falla profile tras crear auth user.
- Email ya existente en auth.users.
- Configuración de templates/redirección Supabase Auth.
- Rate limit del SMTP gratuito/default de Supabase hasta que se configure el correo corporativo / SMTP propio en la fase final.
- No confundir profile activo con socio activo.
- No exponer service_role.
- No crear múltiples profiles para el mismo member.
