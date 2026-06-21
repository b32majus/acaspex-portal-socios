---
title: UI Routes Contract — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# UI Routes Contract — ACASPEX Portal Socios

## 1. Propósito

Definir rutas, nombres de pantalla, labels de navegación y alcance de cada vista para que el Builder no tenga que inventar estructura.

Este contrato debe usarse antes de crear rutas o pantallas en código.

## 2. Reglas generales

```text
No crear rutas no listadas aquí.
No renombrar componentes sin actualizar este contrato.
No conectar backend real.
No implementar auth real.
Todas las pantallas de Fase 1 usan datos mock.
```

## 3. Roles de navegación

```text
member = socio
admin = administrador
```

En Fase 1 no existe rol editor separado.

## 4. Rutas públicas / acceso

| Ruta | Componente | Label UI | Propósito | Estado Fase 1 |
|---|---|---|---|---|
| `/login` | `LoginPage` | Acceso socios | Entrada conceptual al portal | Placeholder funcional mock |

## 5. Rutas socio

| Ruta | Componente | Label UI | Propósito | Estado Fase 1 |
|---|---|---|---|---|
| `/socios` | `MemberHomePage` | Inicio | Home privada del socio | Pantalla mock |
| `/socios/recursos` | `MemberLibraryPage` | Biblioteca | Listado de recursos disponibles | Pantalla mock |
| `/socios/recursos/:resourceId` | `MemberResourceDetailPage` | Detalle recurso | Vista de un recurso concreto | Pantalla mock |
| `/socios/mi-cuenta` | `MemberAccountPage` | Mi cuenta | Estado de socio y datos básicos | Pantalla mock |

## 6. Rutas administrador

| Ruta | Componente | Label UI | Propósito | Estado Fase 1 |
|---|---|---|---|---|
| `/admin` | `AdminDashboardPage` | Panel admin | Resumen operativo | Pantalla mock |
| `/admin/socios` | `AdminMembersPage` | Socios | Listado y filtros de socios | Pantalla mock |
| `/admin/socios/:memberId` | `AdminMemberDetailPage` | Ficha socio | Detalle administrativo de socio | Pantalla mock |
| `/admin/recursos` | `AdminResourcesPage` | Recursos | Listado de recursos administrables | Pantalla mock |
| `/admin/recursos/:resourceId` | `AdminResourceEditorPage` | Editar recurso | Ficha/editor visual de recurso | Pantalla mock sin persistencia |
| `/admin/renovaciones` | `AdminRenewalsPage` | Renovaciones | Socios próximos a vencer/vencidos | Pantalla mock |

## 7. Navegación socio

La navegación visible para socio debe incluir exactamente:

```text
Inicio → /socios
Biblioteca → /socios/recursos
Mi cuenta → /socios/mi-cuenta
```

No mostrar enlaces de admin en navegación socio.

## 8. Navegación admin

La navegación visible para administrador debe incluir exactamente:

```text
Panel → /admin
Socios → /admin/socios
Recursos → /admin/recursos
Renovaciones → /admin/renovaciones
```

## 9. Reglas de redirección mock

En Fase 1, sin auth real:

```text
/login puede tener dos botones mock:
- Entrar como socio → /socios
- Entrar como administrador → /admin
```

No implementar login real.
No pedir contraseña.
No conectar Supabase Auth.

## 10. Layouts

### Layout socio

Nombre sugerido:

```text
MemberLayout
```

Debe contener:

```text
header simple
navegación socio
área principal
```

### Layout admin

Nombre sugerido:

```text
AdminLayout
```

Debe contener:

```text
sidebar o navegación lateral
área principal
indicador visual de modo administrador
```

## 11. Orden de implementación recomendado

1. Crear rutas placeholder.
2. Crear layouts básicos.
3. Crear navegación socio/admin.
4. Conectar pantallas concretas una a una en WOs posteriores.

## 12. Fuera de alcance Fase 1

```text
Auth real
Supabase
RLS
Storage
Stripe
emails
permisos reales
redirecciones automáticas por sesión
protección real de rutas
```

## 13. Criterios de aceptación del contrato

Este contrato está listo cuando una WO pueda decir:

```text
Crear exactamente las rutas definidas en docs/ui-routes-contract.md.
No añadir rutas nuevas.
No implementar lógica no definida.
```
