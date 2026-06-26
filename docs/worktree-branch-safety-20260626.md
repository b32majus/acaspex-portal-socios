# ACASPEX Portal — Seguridad de worktrees y ramas experimentales

Última actualización: 2026-06-26
Status: active

## Objetivo

Evitar contaminación entre el trabajo estable de `main` y ramas experimentales, especialmente la rama de Jornadas/comunicaciones.

Este documento nace tras detectar que el checkout principal del repo quedó situado por accidente en la rama experimental `work/acaspex-jornadas-pending-review-20260626`, con migraciones de Jornadas untracked. Para evitar mezclas, se crea un worktree separado para `main`.

## Worktrees operativos

### Trabajo estable / main

Usar exclusivamente:

```text
/srv/kairos-lab/projects/acaspex/portal-socios/repo-main
```

Estado esperado:

```bash
cd /srv/kairos-lab/projects/acaspex/portal-socios/repo-main
git branch --show-current
git rev-parse --short HEAD
git rev-parse --short origin/main
git status -s
```

Esperado:

```text
main
<HEAD de main>
<origin/main alineado>
working tree limpio
```

En este worktree no deben aparecer migraciones ni archivos de Jornadas/comunicaciones (`conference`, `submission`, etc.) salvo WO explícita de integración.

### Rama experimental Jornadas

La rama experimental es:

```text
work/acaspex-jornadas-pending-review-20260626
```

El checkout donde se estaba trabajando accidentalmente esa rama era:

```text
/srv/kairos-lab/projects/acaspex/portal-socios/repo
```

Esa rama se considera laboratorio aislado. No debe integrarse en `main` hasta que exista una WO explícita de revisión, rebase, renumeración de migraciones y validación staging.

## Reglas para trabajar en `main`

Antes de cualquier WO sobre portal base, accesos, socios, recursos o roadmap general:

```bash
cd /srv/kairos-lab/projects/acaspex/portal-socios/repo-main
git branch --show-current
git rev-parse --short HEAD
git rev-parse --short origin/main
git status -s
```

Reglas:

- Debe estar en `main`.
- HEAD y `origin/main` deben estar alineados o la divergencia debe estar explicada.
- No usar `/srv/kairos-lab/projects/acaspex/portal-socios/repo` para tareas de `main` mientras siga asociado a Jornadas.
- No usar `git add .`.
- Añadir archivos de forma explícita.
- Si aparecen archivos `conference`, `submission` o migraciones de Jornadas en `repo-main`, parar y preguntar.

## Reglas para el agente de Jornadas

El agente que trabaje en Jornadas debe permanecer en la rama experimental:

```text
work/acaspex-jornadas-pending-review-20260626
```

Antes de cualquier commit:

```bash
git branch --show-current
git status -s
git diff --name-only
```

Debe confirmar que todos los cambios pertenecen a Jornadas/comunicaciones.

No debe tocar salvo instrucción explícita:

- `docs/h09c-access-management-20260625.md`
- `src/lib/memberAccessActions.ts`
- `src/lib/identityContext.tsx`
- archivos de H0.9C/accesos
- documentación de cierre H0.9C
- worktree `repo-main`

No debe cambiar a `main` desde el checkout experimental si hay trabajo vivo o archivos untracked de Jornadas.

## Migraciones de Jornadas

La rama experimental puede contener migraciones de Jornadas como:

```text
039_acaspex_conference_base_tables
040_acaspex_conference_submission_code_generation
043/044_acaspex_conference_...
```

Estas migraciones no deben mergearse directamente a `main`.

Antes de integrar Jornadas en `main` será obligatoria una WO específica de integración con estos pasos mínimos:

1. Revisar todas las migraciones de Jornadas.
2. Compararlas contra la cola real de migraciones en `main`.
3. Renumerarlas si es necesario para evitar duplicidades y mantener orden lógico.
4. Confirmar que no pisan migraciones existentes de H0.9C, especialmente:
   - `20260626000041_041_acaspex_profiles_admin_write_grants.sql`
   - `20260626000042_042_acaspex_touch_last_seen.sql`
5. Aplicar en staging limpio.
6. Validar RLS, Storage, policies y flujo funcional.
7. Crear handoff de integración antes de merge.

## H0.9C cerrado en main

H0.9C queda cerrado funcionalmente en `main` con:

```text
HEAD main: 2815207
B1        ✓ Edge Function create-member-access
B2        ✓ Botón Crear acceso / Enviar invitación
B2-FIX1   ✓ Grants INSERT/UPDATE sobre profiles
B3        ✓ Bloquear/desbloquear acceso al portal
B5        ✓ last_seen_at con RPC segura
B4        diferido hasta SMTP-final
SMTP-final diferido por D033
```

B4 y SMTP-final no deben implementarse hasta la configuración de correo corporativo con Ana T., templates y redirect URLs.

## Criterios de parada

Parar y preguntar si ocurre cualquiera de estos casos:

- Estás en una rama distinta a la esperada.
- Aparecen archivos de Jornadas en `repo-main`.
- Aparecen cambios de H0.9C en la rama experimental de Jornadas.
- Hay migraciones duplicadas o fuera de orden.
- Hay archivos untracked no reconocidos.
- Cualquier paso requiere `git add .`.
- Cualquier integración de Jornadas se plantea sin WO específica de revisión.
