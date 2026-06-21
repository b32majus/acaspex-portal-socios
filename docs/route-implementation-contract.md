---
title: Route Implementation Contract — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# Route Implementation Contract — ACASPEX Portal Socios

## 1. Propósito

Definir cómo implementar las rutas placeholder de Fase 1 sin que el Builder tenga que decidir librería, estructura o comportamiento.

## 2. Decisión técnica

Usar `react-router-dom` para la navegación placeholder de Fase 1.

Motivo: evita crear un router casero y prepara la app para rutas reales posteriores.

## 3. Dependencia permitida

Añadir una única dependencia nueva:

```text
react-router-dom
```

No añadir otras dependencias de routing.

## 4. Archivos permitidos para la WO de rutas

La WO de rutas placeholder puede crear o modificar solo:

```text
package.json
pnpm-lock.yaml
src/App.tsx
src/routes/AppRouter.tsx
src/routes/placeholderPages.tsx
src/components/layout/MemberLayout.tsx
src/components/layout/AdminLayout.tsx
```

No modificar otros archivos salvo que sea imprescindible para que compile y se reporte explícitamente.

## 5. Rutas a implementar

Implementar exactamente las rutas definidas en:

```text
docs/ui-routes-contract.md
```

No añadir rutas adicionales.

## 6. Comportamiento placeholder

Cada ruta debe mostrar:

```text
título visible
ruta actual
texto breve: Pantalla placeholder Fase 1
```

No usar datos mock todavía.
No implementar lógica de negocio.
No conectar backend.

## 7. Login mock

`/login` debe mostrar dos enlaces:

```text
Entrar como socio -> /socios
Entrar como administrador -> /admin
```

No pedir usuario ni contraseña.

## 8. Layout socio

`MemberLayout` debe mostrar navegación con:

```text
Inicio -> /socios
Biblioteca -> /socios/recursos
Mi cuenta -> /socios/mi-cuenta
```

## 9. Layout admin

`AdminLayout` debe mostrar navegación con:

```text
Panel -> /admin
Socios -> /admin/socios
Recursos -> /admin/recursos
Renovaciones -> /admin/renovaciones
```

## 10. Fuera de alcance

```text
Supabase
auth real
roles reales
protección real de rutas
mockMembers/mockResources
pantallas finales
formularios
subida de archivos
pagos
deploy
```

## 11. Validación

Ejecutar:

```bash
pnpm install
pnpm build
```

Dejar reporte pending_review en:

```text
/srv/kairos-lab/outbox/reports/acaspex-portal-socios-routes-placeholder-20260620.md
```
