---
title: H0.7k — Diagnóstico de identidad U1 admin
status: pending_review
created: 2026-06-23
owner: Sil / Cora
---

# H0.7k — Diagnóstico de identidad U1 admin

## Diagnóstico

**Caso C: IDs coinciden.** No hay mismatch. Datos correctos.

## Verificaciones

| Check | Resultado |
|-------|-----------|
| Auth user encontrado | Sí |
| Auth user ID | `3a4b3065-d34e-4228-9953-7d8dec0f2844` |
| Profile encontrado | Sí |
| Profile ID | `3a4b3065-d34e-4228-9953-7d8dec0f2844` |
| IDs coinciden | Sí |
| Profile role | `administrador` |
| Profile is_active | `true` |
| Profile member_id | `null` |
| Duplicados | No |
| Último login de Sil | `2026-06-23T13:40:18Z` |

## Causa del síntoma

Sil vio "Tu cuenta está pendiente de activación o revisión" porque probó contra una build de GitHub Pages anterior al commit `b0f45cc` (H0.7l — admin global access). En builds anteriores, el LoginPage post-sesión evaluaba `!canAccessMemberArea && !canAccessAdmin` y ambos eran `false` si la identidad aún no se había cargado.

El commit `b0f45cc` (pusheado a las ~13:50 UTC) corrige esto: `canAccessAdmin` siempre es `true` para admin, y `canAccessMemberArea` es `true` por `admin_oversight`.

## Corrección

No se requiere corrección de datos. Los datos de U1 son correctos. Solo se necesita que GitHub Pages despliegue la build de `b0f45cc`.

## Validación pendiente

Tras nuevo deploy de Pages, Sil debe re-validar:

- Login con `acaspex.admin.demo@example.com`
- Pantalla post-login: "Ir al panel de administración" + "Ver área de socios"
- `/admin` accesible
- `/socios` accesible con nota "Supervisión administrativa"
- Logout OK

## Método

- Consultas de solo lectura vía Management API + Auth Admin API
- No se modificaron datos
- No se tocaron RLS, policies, migraciones ni Storage
- No se documentaron contraseñas
