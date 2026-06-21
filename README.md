# ACASPEX Portal de Socios

Estado: `pending_review / mock-data-ready`

Proyecto técnico para construir un portal privado mínimo de socios ACASPEX, conectado a Supabase en fases posteriores, con gestión de socios, cuotas, recursos privados y futura integración de pagos.

## Ejecución local

```bash
pnpm install
pnpm dev
pnpm build
```

## Estado técnico

Scaffold inicial mock con rutas placeholder y datos ficticios tipados. Sin backend real, sin Supabase, sin pagos y sin datos reales.

Build validado correctamente tras scaffold y rutas placeholder el 2026-06-20.

## Documentos vivos

Leer en este orden al retomar el proyecto:

```text
docs/cora-work-plan.md
docs/roadmap-phase0-phase1.md
docs/work-order-splitting-policy.md
docs/PRD.md
docs/current-form-analysis.md
docs/form-transition-strategy.md
docs/data-model.md
docs/architecture.md
docs/security.md
docs/decisions.md
docs/backlog.md
```

## Contratos para ejecución mecánica

```text
docs/scaffold-contract.md
docs/ui-routes-contract.md
docs/mock-data-contract.md
docs/design-system-contract.md
docs/screen-spec-member-home.md
docs/screen-spec-member-library.md
docs/screen-spec-member-resource-detail.md
docs/screen-spec-member-account.md
```

## Stack decidido para Fase 1

```text
Frontend: Vite + React + TypeScript
UI: Tailwind v4 + shadcn/ui usado de forma sobria
Backend/Auth/DB/Storage: no conectado en primera fase mock
Hosting preview: Netlify preview o URL temporal equivalente
Vídeos futuros: YouTube oculto/enlace externo
Pagos futuros: transferencia manual ordenada + Stripe Checkout pendiente de decisión
```

## Próximo paso recomendado

No crear una WO amplia de prototipo completo.

Siguiente WO mecánica recomendada:

```text
Ejecutar cola nocturna hasta area socio mock: ver docs/overnight-workorder-queue-20260620.md.
```
