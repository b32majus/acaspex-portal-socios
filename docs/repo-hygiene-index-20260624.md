# Repo Hygiene Index — 2026-06-24

Pre-H0.9A cleanup. Historical docs archived, only canonical/active docs remain.

## Archived externally

Location: `/srv/kairos-lab/state/coding-workshop/archive/acaspex/repo-docs-archive-20260624/`

~37 historical contract/design/planning docs from 2026-06-21/22 + review-packs + design-references. See MANIFEST.md in archive dir.

## Canonical docs (in repo)

| File | Purpose |
|---|---|
| docs/PROJECT_STATE_CURRENT.md | Estado actual vigente del proyecto |
| docs/backlog.md | Backlog funcional vivo |
| docs/decisions.md | Decisiones acumuladas |
| docs/PRD.md | Product requirements |
| docs/architecture.md | Arquitectura del portal |
| docs/work-order-splitting-policy.md | Política de splitting de WOs |
| docs/WO_DEFAULTS.md | Defaults operativos para WOs cerradas |
| docs/h07-auth-contract-20260623.md | Contrato de auth/identidad |
| docs/h07e-identity-read-model-20260623.md | Modelo de lectura de identidad |
| docs/h08a-resource-flow-design-20260623.md | Diseño flujo de recursos |
| docs/h08b-admin-resource-upload-flow-20260623.md | Flujo de subida admin |
| docs/h08c-admin-resource-management-20260623.md | Gestión admin de recursos |
| docs/repo-hygiene-index-20260624.md | Este archivo |

## Local/sensitive files (NOT versioned)

| File | Reason |
|---|---|
| docs/CLI_SECRETS_MAP.md | Potencialmente sensible — gitignored |
| opencode.json | Config local de operador — gitignored |
| scripts/ | Scripts locales no curados — gitignored |

## Pending review

- `scripts/validate-fix.sh` — revisar si debe versionarse como script curado o moverse a `scripts/local/`.
- `.gitignore` recién actualizado.
