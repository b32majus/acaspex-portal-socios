Status: pending_review

# WO Defaults — ACASPEX

Defaults mínimos para work orders cerradas en este repo. La idea es acelerar ejecución, no añadir burocracia.

## Cabecera mínima recomendada

```text
# WO-<slug> — <objetivo único>

Modo ejecución: main | worktree
CLI: local/oficial primero
Credenciales: cargar desde env/file local autorizado si aplica
Spec/plan: no requerido si la WO está cerrada
Commentary: mínimo
Commit/push: según indique la WO
Handoff: obligatorio
```

## Modo ejecución

- `main`: usar cuando la WO lo indique explícitamente y autorice commit/push directo a `main`.
- `worktree`: usar cuando la WO lo pida o cuando no autorice trabajar sobre `main`.
- Si la WO cerrada indica `main`, esa instrucción prevalece sobre la preferencia genérica de worktree.

## CLI-first

- Usar CLI local/oficial primero.
- Usar credenciales locales ya configuradas solo cuando la WO lo requiera.
- Usar MCP solo como fallback real o cuando aporte una ventaja clara no cubierta por la CLI.

## Spec y plan

- Si la WO está cerrada y ya define objetivo, alcance, restricciones, validaciones y cierre, no abrir fase adicional de spec o plan.
- Solo abrir una aclaración si la WO deja una decisión material abierta.

## Commentary mínimo

En WO cerrada, limitar updates a hitos breves:

- preflight;
- antes de editar;
- antes de commit;
- cierre o bloqueo real.

## Untracked históricos

- Los untracked históricos del workspace no se borran, no se mueven, no se modifican y no se añaden al commit salvo instrucción explícita.
- Antes de commit, verificar el índice con `git diff --cached --name-only`.

## Ignorar siempre

En ACASPEX, salvo instrucción explícita de la WO, ignorar como contexto operativo y dejar fuera del commit:

- `docs/review-packs/`
- `docs/design-references/`
- untracked históricos en `docs/` ajenos a la tanda
- `opencode.json`

## Temporales de verificación

- Crear temporales de comprobación en `/tmp` o en `state/tmp` si existe.
- No dejar temporales en la raíz del repo.
- Borrarlos antes de commit.

## Fallback de edición

- Usar `apply_patch` por defecto para cambios manuales.
- Si `apply_patch` falla por sandbox o limitación instrumental, se autoriza usar un script local con Python para editar archivos del repo sin reabrir la decisión.

## Validaciones mínimas

Usar solo las que apliquen a la WO. Patrón mínimo:

- `npm run build` si hay cambios frontend;
- greps de prohibidos si la WO los pide;
- `git diff -- <rutas>`;
- `git status --short`.

## Commit y push

- No usar `git add .`.
- Hacer commit/push solo si la WO lo autoriza explícitamente.
- Si la WO exige revisión previa del diff, no commitear hasta que Sil lo confirme.

## Handoff

- Obligatorio al cierre de tanda.
- Debe ser breve, factual y sin secretos.
- Incluir: veredicto, archivos tocados, validaciones, resultado build si aplica, riesgos y siguiente validación pendiente.
