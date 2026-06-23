# Contrato H0.6 — Conexión frontend con Supabase staging

**Status:** pending_review
**Fecha:** 2026-06-22

## 1. Alcance

- Conexión técnica del frontend (React/Vite) con Supabase staging.
- Uso exclusivo de Supabase Project URL + anon/publishable key.
- Sin `service_role` ni database password.
- Sin datos reales.
- Sin mutaciones automáticas.
- Sin auth productiva (eso es H0.7).
- Sin alterar el backend ya desplegado (migraciones 001–018).

## 2. Proyecto Supabase staging

| Campo | Valor |
|-------|-------|
| Nombre | `acaspex-portal-staging` |
| Project ref | `oxbsbvbrljzvfqpdozgl` |
| URL pública | `https://oxbsbvbrljzvfqpdozgl.supabase.co` |
| Región | `eu-west-1` |

## 3. Variables de entorno previstas

| Variable | Rol | Expuesta al cliente |
|----------|-----|---------------------|
| `VITE_SUPABASE_URL` | URL pública del proyecto Supabase | Sí (Vite `VITE_` prefix) |
| `VITE_SUPABASE_ANON_KEY` | Anon/publishable key | Sí (Vite `VITE_` prefix) |

### Valores permitidos en documentación

- **URL:** `https://oxbsbvbrljzvfqpdozgl.supabase.co` — documento aquí por ser pública.
- **Anon key:** NO documentar en repo. Sil la configura localmente en `.env.local` o en el entorno de despliegue.
- **Service role:** NO documentar. NO usar en frontend. Solo uso admin autorizado en fases posteriores.

## 4. Arquitectura esperada

```
src/lib/supabaseClient.ts   ← cliente único, punto central de acceso
src/lib/supabaseHealth.ts   ← health check no destructivo
```

- Un único cliente Supabase instanciado en `src/lib/supabaseClient.ts`.
- Toda la app importa desde ese único módulo.
- Validación amable si faltan variables: sin lanzar errores agresivos en build.
- Sin llamadas `createClient` dispersas en componentes.
- Sin llamadas a tablas, RPC ni Storage en H0.6.
- Se permite únicamente una comprobación no destructiva de Auth mediante `supabase.auth.getSession()` para verificar configuración técnica del cliente.
- Auth/login productivo queda para H0.7.

## 5. Restricciones absolutas

- No `service_role`.
- No `SUPABASE_SERVICE_ROLE`.
- No database password.
- No connection string completa.
- No hardcodear anon key real en código fuente.
- No tocar migraciones, RLS, policies, buckets.
- No ejecutar `supabase db push`, `reset`, ni `migration repair`.
- No introducir datos reales, seeds, ni inserts.
- No subir archivos a Storage.

## 6. Fases siguientes (no ejecutar ahora)

| Fase | Descripción |
|------|-------------|
| H0.7 | Auth/login real con Supabase Auth y roles |
| H0.8 | Alta de socios con subida de receipt |
| H0.9 | Admin conectado a datos (sintéticos primero) |
| Post-H0.9 | Seed/test data solo cuando se autorice explícitamente |

## 7. Veredicto

`h06a_contract_approved_for_next_step`
