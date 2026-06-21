---
title: Scaffold Contract — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# Scaffold Contract — ACASPEX Portal Socios

## 1. Propósito

Definir exactamente el scaffold técnico mínimo de la app frontend para que la primera work order de código no requiera decisiones de arquitectura, estructura o naming por parte del Builder.

Este contrato se debe aplicar antes de crear código funcional, rutas completas o pantallas reales.

## 2. Stack decidido para scaffold

```text
Vite
React
TypeScript
Tailwind v4
shadcn/ui mínimo
```

## 3. Alcance del scaffold

La primera implementación de scaffold debe crear únicamente:

```text
app React/Vite/TS arrancable
Tailwind configurado
shadcn/ui inicializado si procede
estructura base de carpetas
pantalla placeholder inicial
README con comandos básicos
```

No debe crear todavía:

```text
rutas completas
pantallas socio/admin
mock data completo
Supabase
auth
storage
Stripe
emails
imports desde Excel
deploy
```

## 4. Carpeta raíz del proyecto

Ruta del repo:

```text
/srv/kairos-lab/projects/acaspex/portal-socios/repo
```

La app frontend debe vivir directamente en esa ruta, salvo que Sil/Cora decidan después usar subcarpeta.

No crear monorepo.
No crear carpetas `apps/`, `packages/` ni estructura enterprise.

## 5. Package manager

Usar `pnpm` salvo que una herramienta instalada obligue a otro gestor.

Comandos esperados:

```bash
pnpm install
pnpm dev
pnpm build
```

Si se genera `package.json`, debe incluir scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

Añadir `lint` solo si se configura explícitamente ESLint en la misma WO o en WO posterior. No inventar lint si no está configurado.

## 6. Estructura de carpetas objetivo

El scaffold debe preparar esta estructura mínima:

```text
src/
  app/
  components/
    ui/
    layout/
  data/
  lib/
  pages/
    member/
    admin/
  routes/
  styles/
```

Uso previsto:

```text
src/app/        configuración principal de app si se necesita
src/components/ui/      componentes shadcn/ui o wrappers UI
src/components/layout/  MemberLayout, AdminLayout en fases posteriores
src/data/       mock data en WOs posteriores
src/lib/        utilidades compartidas
src/pages/member/       pantallas socio en WOs posteriores
src/pages/admin/        pantallas admin en WOs posteriores
src/routes/     definición de rutas en WO posterior
src/styles/     estilos globales si aplica
```

No crear carpetas adicionales salvo que la herramienta base de Vite las cree automáticamente.

## 7. Archivos mínimos esperados

Tras scaffold, deben existir como mínimo:

```text
package.json
index.html
src/main.tsx
src/App.tsx
src/index.css o src/styles/globals.css
tsconfig.json
vite.config.ts
README.md
```

Si Tailwind v4 requiere archivo de configuración diferente o no requiere `tailwind.config`, seguir la configuración estándar actual de Tailwind/Vite, pero documentarlo en README.

## 8. Pantalla placeholder inicial

`src/App.tsx` debe mostrar una pantalla placeholder simple con este contenido visible:

```text
ACASPEX Portal de Socios
Prototipo técnico inicial
Estado: scaffold mock, sin backend real
```

Debe incluir también una lista breve:

```text
React + Vite + TypeScript
Tailwind + shadcn/ui
Sin Supabase conectado
Sin datos reales
```

No debe incluir navegación completa.
No debe incluir pantallas socio/admin.

## 9. shadcn/ui en scaffold

Objetivo de shadcn en esta fase: dejar la base lista, no construir toda la UI.

Permitir solo instalar/configurar lo mínimo necesario para usar componentes en WOs posteriores.

Si se añade un componente para verificar funcionamiento, usar solo:

```text
Button
Card
```

No añadir más componentes en la WO de scaffold.

## 10. Tailwind

Tailwind debe quedar funcionando con la pantalla placeholder.

No crear tema avanzado.
No crear dark mode.
No crear paleta completa.
No crear tokens complejos.

Usar estilos básicos y sobrios.

## 11. README técnico mínimo

El `README.md` del repo debe conservar el contexto existente del proyecto si ya existe.

Si el Builder necesita modificar README, debe añadir una sección titulada exactamente:

```md
## Ejecución local
```

Con:

```bash
pnpm install
pnpm dev
pnpm build
```

Y una sección:

```md
## Estado técnico
```

Con texto:

```text
Scaffold inicial mock. Sin backend real, sin Supabase, sin pagos y sin datos reales.
```

No borrar las secciones documentales existentes del README salvo instrucción explícita.

## 12. Restricciones estrictas

```text
No conectar Supabase.
No crear .env.
No tocar tokens/secrets.
No instalar Stripe.
No crear pagos.
No crear deploy.
No tocar GitHub.
No usar datos reales.
No implementar auth real.
No crear rutas completas.
No crear pantallas socio/admin.
No crear formularios de alta.
No crear subida de archivos.
No modificar docs salvo README técnico si es necesario.
```

## 13. Validación mínima

La WO que implemente scaffold debe intentar ejecutar:

```bash
pnpm build
```

Si falla por configuración inicial, debe reportar error exacto y no hacer fallback silencioso.

## 14. Reporte esperado

La WO de scaffold debe dejar un reporte `pending_review` en:

```text
/srv/kairos-lab/outbox/reports/acaspex-portal-socios-scaffold-YYYYMMDD.md
```

El reporte debe incluir:

```text
Status: pending_review
archivos creados/modificados
comandos ejecutados
resultado de pnpm build
restricciones respetadas
incidencias si las hubo
```

## 15. Criterios de aceptación del contrato

Este contrato está listo cuando una WO pueda decir:

```text
Crear scaffold técnico mínimo siguiendo docs/scaffold-contract.md.
No crear rutas/pantallas/datos no incluidos en el contrato.
```

Y el PM pueda auditar:

```text
app arranca
build ejecutado o error reportado
placeholder visible
estructura base creada
sin backend
sin secretos
sin datos reales
```
