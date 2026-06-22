# Guía manual para ejecutar migraciones en Supabase SQL Editor — ACASPEX staging

**Status:** pending_review
**Fecha:** 2026-06-22

> Esta guía es para Sil. KairOS no tiene acceso a Supabase y no puede ejecutar estas migraciones por ti.

## Antes de empezar

1. **Completa la checklist** de `h04c-preflight-checklist-20260622.md`. Si algún punto no está marcado, resuélvelo antes de continuar.
2. **Ten a mano** las 18 migraciones en local. Puedes copiarlas desde el repo de GitHub: `b32majus/acaspex-portal-socios` en `supabase/migrations/`.
3. **Abre Supabase Dashboard** en tu navegador, en el proyecto **staging**.

---

## Paso a paso

### Paso 1 — Entrar en Supabase

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard).
2. Selecciona el proyecto **staging** de ACASPEX.
3. En el menú izquierdo, ve a **SQL Editor**.
4. Abre una **nueva query** (botón "New query").

### Paso 2 — Ejecutar migración 001

1. Copia TODO el contenido del archivo `2026062200001_001_acaspex_schema.sql`.
2. Pégalo en el SQL Editor.
3. Pulsa **Run** (o Ctrl+Enter).
4. Espera el resultado: debe aparecer `Success. No rows returned` o similar.
5. Si aparece un error en rojo:
   - **PARA.** No ejecutes más migraciones.
   - Copia el mensaje de error completo.
   - Revisa `h04f-staging-rollback-plan-20260622.md` para decidir qué hacer.

### Paso 3 — Repetir con 002, 003... hasta 018

1. Abre una nueva query (o limpia la actual).
2. Copia el contenido de la siguiente migración.
3. Pégala y ejecuta.
4. Confirma éxito.
5. Repite hasta llegar a la 018.

**Recuerda:** El orden es ESTRICTAMENTE 001 → 018. No te saltes ninguna.

### Paso 4 — Después de ejecutar 001–018

1. Abre el archivo `h04d-post-execution-verification-queries-20260622.sql`.
2. Ejecuta las queries de verificación (todas son SELECT, no modifican nada).
3. Revisa los resultados:
   - 9 tablas en information_schema.
   - 9 tablas con `rowsecurity = true` (RLS activado).
   - Policies por tabla (mínimo las esperadas).
   - 6 funciones auxiliares, todas con `security_definer = true`.
   - 3 buckets con `public = false`.
   - Storage policies referenciando los buckets ACASPEX.
4. Si algún resultado no coincide, **no cargues datos reales**. Revisa qué migración pudo fallar.

### Paso 5 — Estado final

Si todo coincide:
- Schema, RLS y Storage están listos en staging.
- **No cargar datos reales todavía.**
- **No conectar frontend todavía.**
- El siguiente paso será H0.6 (conexión frontend con anon key).

---

## Qué NO hacer

| ❌ No hagas esto | Por qué |
|------------------|---------|
| Ejecutar en producción | Los datos reales no deben tocarse sin validación |
| Pegar `service_role` key en SQL Editor | El SQL Editor usa el rol actual; no necesitas la key |
| Pegar contraseñas de base de datos | Nunca se pegan secrets en ningún sitio |
| Meter datos reales | Staging es para pruebas sin datos reales |
| Cambiar el SQL sobre la marcha | Las migraciones han sido revisadas; cambios improvisados pueden romper dependencias |
| Ignorar errores y seguir | Un error temprano puede causar fallos en cadena |
| Ejecutar migraciones en orden distinto | Las dependencias están documentadas en H0.4b |
| Ejecutar varias migraciones juntas | Si falla una mezcla, no sabrás cuál fue |

---

## Si algo falla

1. **Para inmediatamente.**
2. Copia el mensaje de error.
3. Consulta `h04f-staging-rollback-plan-20260622.md`.
4. Comparte el error con KairOS o Cora para diagnóstico.
5. No improvises una solución sobre la marcha sin revisar.

---

*Status: pending_review*
