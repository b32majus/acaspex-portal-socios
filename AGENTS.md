# AGENTS — ACASPEX Portal Socios

## Reglas operativas

- Leer primero `docs/PROJECT_STATE_CURRENT.md`.
- Leer `docs/WO_DEFAULTS.md` para defaults de ejecución de WOs cerradas.
- No leer `docs/review-packs/` ni `outbox/reports/` salvo petición explícita.
- No tocar datos reales, credenciales, `.env`, secrets, tokens ni Supabase real.
- Leer `docs/CLI_SECRETS_MAP.md` cuando la WO use CLI y/o credenciales locales.
- Rutas canónicas de credenciales en este repo: Supabase CLI → `/home/hermes/.config/kairos/supabase.env`; Git/GitHub → `/home/hermes/.config/kairos/github.env`. Nunca imprimir tokens ni pasarlos como argumento literal.
- No ejecutar `git add .`.
- No hacer commit ni push sin permiso explícito.
- Preferir cambios pequeños por slice funcional.
- Si una decisión parece contradictoria, parar y reportar en vez de redecidir.
- Handoff obligatorio al cierre de tanda.


## Modo WO cerrada ACASPEX

Para este repo, cuando exista una WO formal, cerrada y ejecutable:

- ejecutar directamente sin fase adicional de brainstorming, spec o plan, salvo decisión material abierta en la propia WO;
- usar CLI local/oficial primero;
- cargar secretos locales necesarios desde ficheros/env ya configurados, sin imprimirlos ni pasarlos como argumento literal;
- usar MCP solo como fallback;
- reducir commentary a hitos breves;
- si la WO ordena trabajar sobre `main` y hacer commit/push a `main`, esa instrucción prevalece sobre la preferencia general de worktree;
- no parar por una barrera instrumental si existe una vía local segura equivalente dentro del alcance de la WO;
- considerar bloqueo real solo si falta una credencial no localizable, una decisión funcional no definida, un permiso fuera de alcance o si el mismo error persiste tras 2 intentos razonables.


## Reglas operativas extra ACASPEX

- Los archivos temporales de verificación deben crearse en `/tmp` o en `state/tmp` si existe, y borrarse antes de commit.
- Si `apply_patch` falla por sandbox o limitación instrumental, se autoriza usar un script local con Python para editar archivos del repo, manteniendo el mismo alcance de la WO.
