# Plan de rollback/recreación Supabase staging — ACASPEX

**Status:** pending_review
**Fecha:** 2026-06-22

> **Principio:** Staging no tiene datos reales. El rollback preferente puede ser recrear el proyecto o limpiar manualmente, según el punto de fallo. Esta guía no contiene SQL destructivo ejecutable.

---

## Escenarios de fallo y acciones

### Escenario 1 — Falla antes de crear ninguna tabla (error en 001)

**Síntoma:** `create extension` o `create type` falla. Tablas no existen.

**Acción:**
- El proyecto está limpio. Corregir la causa del error (p.ej., extensión no disponible, sintaxis).
- Reintentar 001 tras corrección.
- No se necesita limpieza.

---

### Escenario 2 — Falla durante la creación de tablas (001 a medias)

**Síntoma:** Algunas tablas creadas, otras no. Error en una sentencia `create table`.

**Acción:**
- Si staging queda parcial, la opción recomendada es **recrear el proyecto staging desde cero.** Es la vía más limpia y rápida. No hay datos que preservar.
- No hacer limpieza manual destructiva. Si se necesita una limpieza controlada, pedir una WO específica para ese caso.
- Parar, guardar el error y consultar con Cora/Sil antes de tocar el estado de la base de datos.

---

### Escenario 3 — Falla en RLS baseline (002)

**Síntoma:** 001 fue bien, pero 002 falla. Funciones de rol no se crean, RLS no se activa.

**Acción:**
- Las tablas de 001 ya existen.
- Si el error es por función duplicada (improbable porque usan `create or replace`): revisar el mensaje.
- Si el error es de otro tipo: corregir la causa, reintentar 002.
- **No pasar a 003–018** hasta que 002 esté completo (las policies dependen de las funciones de rol).

---

### Escenario 4 — Falla en una policy de tabla (003–012)

**Síntoma:** Una policy no se crea. El resto de la migración pudo ejecutarse parcialmente.

**Acción:**
- Las policies usan `create policy` (no `create or replace`). Si la policy ya existe, fallará con `duplicate`.
- Si el error es `policy already exists`: **NO pases automáticamente a la siguiente.** Puede que la migración anterior se ejecutara parcialmente y falten otras policies del mismo archivo.
- Ejecuta las queries de verificación de H0.4d para comprobar si todas las policies esperadas de esa migración existen.
- Si todas existen y sus definiciones coinciden con lo esperado, puedes continuar.
- Si falta alguna policy, **para.** No continúes. Pide una WO específica de comparación/corrección.
- Si el error es de otro tipo (función no encontrada, tabla no encontrada): revisa que 001 y 002 estén completos. Corrige y reintenta.
- No hagas limpieza manual destructiva. No uses comandos de eliminación.

---

### Escenario 5 — Falla en buckets Storage (013)

**Síntoma:** `insert into storage.buckets` falla.

**Acción:**
- 013 es idempotente (`on conflict do update`). Si falla, puede ser porque la tabla `storage.buckets` no existe → Supabase no ha inicializado Storage. Ve a la sección **Storage** del dashboard de Supabase y actívalo (crea un bucket dummy y bórralo). Luego reintenta 013.
- Si el error es de permisos: asegúrate de estar usando un rol con permisos sobre `storage.buckets` (en SQL Editor suele estar bien).

---

### Escenario 6 — Falla en una Storage policy (014–018)

**Síntoma:** `create policy on storage.objects` falla.

**Acción:**
- Verifica que el bucket referenciado existe (013 debe haberse ejecutado).
- Si la policy ya existe (`duplicate`): **NO pases automáticamente a la siguiente.** Verifica con las queries de H0.4d que todas las Storage policies esperadas de ese archivo existen (revisando tanto `qual` como `with_check`).
- Si todas existen y coinciden, puedes continuar. Si falta alguna, para y pide WO específica.
- Si faltan funciones (`is_admin` no existe): 002 no se ejecutó o falló. Vuelve a 002.

---

### Escenario 7 — Se ejecuta una migración dos veces

**Síntoma:** Error de objeto duplicado (`already exists`).

**Acción:**
- Para migraciones con `create table if not exists`, `create or replace function` y `on conflict do update`: **no pasa nada.** Son idempotentes por diseño.
- Para `create type` (001): la migración ya incluye bloques `do $$ ... exception when duplicate_object then null` que la hacen segura para re-ejecutar.
- Para `create policy`: si aparece error de duplicado, **no pases automáticamente a la siguiente.** Verifica con H0.4d que todas las policies de esa migración existen. Si falta alguna, para y pide WO específica.

---

### Escenario 8 — Se detecta un bucket público por error

**Síntoma:** La query de verificación 6a muestra algún bucket con `public = true`.

**Acción:**
- Ejecuta de nuevo la migración 013. El `on conflict do update` forzará `public = false`.
- Verifica con la query 6a que los tres buckets quedan privados.

---

### Escenario 9 — Se detecta una policy demasiado abierta

**Síntoma:** `USING (true)` o `WITH CHECK (true)` en alguna policy.

**Acción:**
- Esto no debería ocurrir porque las migraciones no contienen `USING (true)`.
- Si ocurre por error humano (se modificó el SQL): para la ejecución, guarda el error y consulta con Cora/Sil. No intentes arreglarlo manualmente con comandos destructivos.
- La corrección debe hacerse mediante una WO específica que evalúe el estado y proponga la vía segura (recrear staging, o limpiar la policy concreta de forma controlada).

---

## Recreación completa de staging

Si el staging queda en un estado inconsistente y no merece la pena depurar:

1. **Opción recomendada:** crear un proyecto nuevo en Supabase (gratuito). Ejecutar 001–018 limpiamente.
2. **Opción alternativa:** si el proyecto actual ofrece "Reset database" en sus ajustes, usarlo (es una operación controlada por Supabase, no un comando SQL manual). Luego ejecutar 001–018.
3. **No hacer limpieza manual con comandos SQL destructivos.** Si ninguna de las opciones anteriores es viable, pedir una WO específica de recreación controlada.

---

## Nota sobre producción

Esta guía es **solo para staging sin datos reales.** Producción requerirá un plan de rollback más estricto con backups, migraciones reversibles y validación de datos. No se usará este plan en producción.

---

*Status: pending_review*
