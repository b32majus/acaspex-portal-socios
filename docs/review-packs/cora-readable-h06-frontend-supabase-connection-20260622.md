# Review Pack H0.6 — Conexión frontend con Supabase staging

**Status:** pending_review
**Fecha:** 2026-06-22

## TL;DR

Frontend preparado para Supabase. Cliente centralizado, health check no destructivo, variables seguras, build OK. Sin secrets. Listo para H0.7 (auth real).

## Estado

`h06_frontend_supabase_connection_ready_for_review`

## Entregables

| WO | Entregable | Estado |
|----|-----------|--------|
| H0.6a | `docs/frontend-supabase-connection-contract-20260622.md` | ✅ |
| H0.6b | `@supabase/supabase-js` 2.108.2 instalado | ✅ |
| H0.6c | `.env.example` con placeholders | ✅ |
| H0.6d | `src/lib/supabaseClient.ts` | ✅ |
| H0.6e | `src/lib/supabaseHealth.ts` | ✅ |
| H0.6f | Smoke build + auditoría de seguridad | ✅ |

## Confirmaciones

- [x] Sin `service_role`
- [x] Sin database password
- [x] Sin connection string completa
- [x] Sin datos reales
- [x] Sin seeds
- [x] Sin mutaciones (INSERT/UPDATE/DELETE/upload)
- [x] Sin `.env.local` trackeado
- [x] Sin cambios en migraciones/RLS/policies/buckets
- [x] Build OK (`tsc -b && vite build`)
- [x] Sin secrets en código fuente

## Pendiente manual de Sil

- Configurar `VITE_SUPABASE_ANON_KEY` real en `.env.local` (NO commitear)
- O configurarla en el entorno de despliegue (GitHub Pages, Vercel, Netlify, etc.)

## Próximo paso

`H0.7` — Auth/login real con Supabase Auth y roles

## Veredicto

`h06_frontend_supabase_connection_ready_for_cora_review`
