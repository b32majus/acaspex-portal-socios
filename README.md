# ACASPEX Portal de Socios

> Antes de trabajar en este proyecto, leer `docs/PROJECT_STATE_CURRENT.md`. Ese archivo es la fuente de verdad operativa actual. Los review packs, reports y documentos históricos no deben usarse como contexto por defecto.

Estado: `active / h07-auth-foundation-complete`

Portal privado de socios ACASPEX conectado a Supabase staging, con login funcional (email + contraseña), sesión, logout y protección de rutas por sesión.

## Estado técnico

Frontend con auth foundation completada en H0.7:

- Login funcional con Supabase Auth (`signInWithPassword`).
- Session shell: `AuthProvider` + `useAuth` hook + logout.
- Route gates: `RequireAuth` protege todas las rutas privadas.
- Cliente Supabase centralizado en `src/lib/supabaseClient.ts`.
- Build validado.

Supabase staging desplegado: 18 migraciones, 9 tablas, RLS activo, helpers security definer.

Pendiente: lectura de perfil/socio/rol (H0.7f), protección por rol en /admin, bloqueo por cuota vigente.

## Documentos canónicos activos

```text
docs/PROJECT_STATE_CURRENT.md
docs/decisions.md
docs/backlog.md
docs/h07-auth-contract-20260623.md
docs/h07e-identity-read-model-20260623.md
docs/work-order-splitting-policy.md
```

## Próximo paso

H0.7f — Identity read hook (`useIdentity`): leer perfiles, socios y roles desde Supabase.
