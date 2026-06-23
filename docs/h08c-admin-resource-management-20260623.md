---
title: H0.8c — Panel admin real de gestión de recursos + preview en cards
status: pending_review
created: 2026-06-23
owner: Sil / Cora
depends_on:
  - h08b_real_resource_detail_preview
---

# H0.8c — Panel admin real de gestión de recursos + preview en cards

## 1. Veredicto

```
h08c_admin_resource_management_ready_for_validation
```

Panel admin de recursos conectado a Supabase real. Card preview corregida para recursos con archivo de imagen aunque el tipo no sea `image`. Pendiente de validación pública con U1/U2/U3.

---

## 2. Implementaciones

### 2.1 Preview en card corregida (Parte A)

**Bug:** `ResourceCardImage` solo generaba signed URL si `resource.type` era `image`, `logo` o `teams_background`. El recurso real "Fondo TEAMs ACASPEX" tiene tipo `document` pero archivo PNG → la extensión `.png` hacía match con `hasImageExt` pero el `useEffect` retornaba antes por `!isImageType`.

**Fix:** Condición cambiada de `!isImageType` a `(!isImageType && !hasImageExt)`. Ahora se genera signed URL si:
- el tipo es imagen (image/logo/teams_background), o
- la extensión del archivo es imagen (.png/.jpg/.jpeg/.gif/.webp)

### 2.2 AdminResourcesPage conectada a Supabase (Parte B)

`/admin/recursos` ahora:

1. Consulta `public.resources` con `.select()` y `.order('created_at', { ascending: false })`.
2. Mapea campos reales (`resource_type`, `file_path`, `status`, etc.) a formato interno.
3. Mezcla con `mockResources` como fallback (sin duplicar por id).
4. Loading skeleton mientras carga.
5. Tabla con columnas: Título, Sección, Tipo, Estado, Visibilidad, Fecha, Acciones.
6. Indicador visual (punto verde) para recursos reales.
7. Botones de acción contextuales por estado:
   - Publicado → Archivar
   - Archivado → Desarchivar (a borrador)
   - Borrador → Publicar
8. Cambio de estado vía `UPDATE` en Supabase.

### 2.3 AdminResourceEditorPage real (Parte C)

`/admin/recursos/:resourceId` ahora:

1. Carga recurso desde Supabase (`.maybeSingle()`), fallback a `mockResources`.
2. Muestra formulario editable con campos: Título, Tipo, Estado, Enlace externo, Descripción.
3. Muestra ruta del archivo (solo lectura, con aviso "Para sustituir el archivo, crea un nuevo recurso").
4. Guarda cambios vía `UPDATE` en Supabase (`resource_type`, `title`, `description`, `status`, `external_url`).
5. Gestiona `published_at` al publicar y `archived_at` al archivar.
6. Recursos demo muestran warning y no se guardan en Supabase.
7. Feedback visual tras guardar (success/error).

### 2.4 Permisos (Parte D)

- `resources_update_admin` policy ya existe y permite UPDATE a administradores.
- `resources_select_by_role` permite SELECT de todos los estados a admin.
- AdminResourcesPage y AdminResourceEditorPage usan `supabase` (anon key) con sesión autenticada.
- Sin `service_role` en frontend.

---

## 3. Archivos modificados

```
src/routes/placeholderPages.tsx — ResourceCardImage (fix), AdminResourcesPage (rewrite), AdminResourceEditorPage (rewrite)
```

Solo un archivo modificado. Cambios autónomos en 3 funciones.

---

## 4. Validación esperada por roles

### U1 — Admin (`acaspex.admin.demo@example.com`)

- [ ] Login admin OK.
- [ ] `/admin/recursos` muestra tabla con recursos reales (punto verde) y demo.
- [ ] "Fondo TEAMs ACASPEX" visible en tabla con estado Publicado.
- [ ] Contadores de Publicados/Borradores/Archivados reflejan datos reales.
- [ ] Botón Archivar cambia estado del recurso real.
- [ ] Recurso archivado desaparece de Material Corporativo.
- [ ] Botón Desarchivar/Publicar restaura visibilidad.
- [ ] "Editar" abre formulario con datos reales del recurso.
- [ ] Cambiar título/descripción/estado y guardar funciona.
- [ ] Material Corporativo muestra preview en card para el recurso PNG.

### U2 — Junta (`acaspex.junta.demo@example.com`)

- [ ] Login junta OK.
- [ ] `/admin/recursos` denegado.
- [ ] Material Corporativo muestra solo recursos publicados.
- [ ] Recurso archivado/borrador NO visible en Material Corporativo.
- [ ] Preview en card visible para recurso con imagen.

### U3 — Socio (`acaspex.socio.demo@example.com`)

- [ ] Login socio OK.
- [ ] `/admin/recursos` denegado.
- [ ] Material Corporativo no visible.

---

## 5. Deuda conocida

- El `resource_type` enum de la DB no incluye `image`, `logo`, `teams_background`, `external_link`. El formulario admin incluye estas opciones pero el INSERT/UPDATE fallaría si se usan. Pendiente migración de extensión del enum.
- La eliminación física de recursos no está implementada (preferencia de producto: archivar en su lugar).
- `resource_visibility` no se actualiza al cambiar estado (se crea al insertar y queda fija).

---

## 6. Estado

Status: pending_review
