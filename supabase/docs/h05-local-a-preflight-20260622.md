# H0.5-local-a — Preflight VPS y repositorio

**Status:** blocked
**Fecha:** 2026-06-22

## Resultados del preflight

| Recurso | Estado | Versión |
|---------|--------|---------|
| Node.js | ✅ | v24.15.0 |
| pnpm | ✅ | 11.8.0 |
| Docker CLI | ✅ | 29.5.2 |
| Docker Compose | ✅ | v5.1.4 |
| **Docker daemon** | ❌ | `permission denied /var/run/docker.sock` |
| Supabase CLI (global) | ✅ | 2.107.0 |
| Supabase CLI (pnpm exec) | ✅ | 2.107.0 |
| Git branch | `main` | sin cambios funcionales pendientes |

## Repositorio

| Recurso | Estado |
|---------|--------|
| `package.json` | ✅ existe (vite/react) |
| `supabase/config.toml` | ❌ no existe |
| Migraciones 001–018 | ✅ 18 archivos presentes |
| Remoto linkeado | ❌ no |

## Bloqueo detectado

**Docker daemon no accesible para `hermes`.** El usuario `hermes` no pertenece al grupo `docker` y no puede conectar al socket `/var/run/docker.sock`. Sin Docker, `supabase start` no puede arrancar la stack local (Postgres, API, Storage, etc.).

```
$ docker ps
permission denied while trying to connect to the docker API at unix:///var/run/docker.sock
```

## Implicaciones para H0.5-local-b a H0.5-local-g

Sin Docker, no se puede:
- Arrancar Supabase local (`supabase start`)
- Aplicar migraciones localmente (`supabase db reset`)
- Ejecutar queries de verificación contra base local

Las micro-WOs H0.5-local-b (instalar CLI) y H0.5-local-c (init config) serían técnicamente posibles porque no requieren Docker, pero son inútiles sin H0.5-local-d (start).

## Veredicto

`h05_local_preflight_blocked`

**Causa:** `hermes` no tiene permisos sobre Docker. Solo `sil` (sudo, docker) puede arrancar contenedores.

**Recomendación:** Seguir con H0.5 manual vía SQL Editor (Sil ejecuta 001–018 en Supabase staging remoto). Este camino era el plan original y no tiene dependencia de Docker.
