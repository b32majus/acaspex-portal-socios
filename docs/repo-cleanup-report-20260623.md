---
title: Repo cleanup report — ACASPEX Portal Socios
status: pending_review
created: 2026-06-23
owner: Sil / Cora
---

# Repo cleanup report — ACASPEX Portal Socios

## Estado post-H0.7

HEAD final: `8ec8b5b — feat: add auth session, login UI, and route gates`

## Archivos/carpetas excluidos del versionado

### Carpetas operativas (ignoradas por .gitignore)

| Carpeta | Motivo |
|---------|--------|
| `.herenow/` | Contexto temporal de agentes. No versionable. |
| `.opencode/` | Configuración local de OpenCode CLI. No versionable. |
| `docs/.herenow/` | Contexto temporal de agentes en docs. No versionable. |
| `outbox/` | Reports y workorders operativos. No son fuente de verdad. |
| `supabase/.temp/` | Temporales de Supabase CLI. No versionable. |

### Documentos históricos no versionados (untracked)

Estos documentos contienen contratos, decisiones y planes de fases anteriores (pre-H0.7). Quedan sin versionar intencionadamente. No se borran.

| Documento | Recomendación |
|-----------|---------------|
| `docs/production-decisions-acaspex-20260622.md` | Conservar. Contiene decisiones D008-D023 cerradas. |
| `docs/supabase-data-model-draft-20260622.md` | Conservar. Diseño de datos previo. Puede ser útil para contexto. |
| `docs/migration-plan-forms-excel-to-supabase-20260622.md` | Conservar. Plan de migración futuro. |
| `docs/storage-policy-acaspex-20260622.md` | Conservar. Referencia de Storage. |
| `docs/backend-supabase-mvp-architecture-20260622.md` | Conservar. Arquitectura previa. |
| `docs/email-flow-acaspex-20260622.md` | Conservar. Flujo de emails futuro. |
| `docs/review-packs/` | Conservar. Review packs históricos de Cora. |
| `docs/*-contract-*.md` (~25 archivos) | Conservar. Contratos de fases anteriores. No borrar sin decisión explícita. |
| `docs/*-tanda-*.md` | Conservar. Work orders de tandas anteriores. |
| `opencode.json` | Archivo de configuración local. No versionable. |

### Archivos modificados sin commitear (fuera de esta tanda)

| Archivo | Estado | Recomendación |
|---------|--------|---------------|
| `AGENTS.md` | Modificado (limpieza previa) | Revisar en WO separada si procede. Reglas operativas mínimas; funcional ahora. |
| `README.md` | Actualizado en esta tanda | Se versiona en este commit. |
| `docs/decisions.md` | Actualizado en esta tanda | Se versiona en este commit. |
| `docs/PROJECT_STATE_CURRENT.md` | Actualizado en esta tanda | Se versiona en este commit. |

## Acciones realizadas en esta tanda

1. `.gitignore` actualizado con patrones para carpetas operativas.
2. `README.md` actualizado al estado H0.7.
3. `docs/decisions.md` ampliado con D024-D026 (H0.7).
4. `docs/PROJECT_STATE_CURRENT.md` actualizado con estado H0.7 completo.
5. Este reporte de limpieza creado.

## Recomendaciones futuras

- Crear WO separada para revisar documentos históricos y decidir cuáles archivar/versionar/borrar.
- No borrar documentos sin autorización explícita de Sil.
- Mantener `.gitignore` actualizado para evitar reintroducir ruido operativo.
