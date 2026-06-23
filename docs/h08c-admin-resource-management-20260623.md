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

## 5. H0.8c-FIX2 — Preview DOCX, modo vista admin y estados

### 5.1 Preview experimental de DOCX

Dependencia `docx-preview` (v0.3.7) añadida con `dynamic import()`.

Componente `src/components/resources/DocxPreview.tsx`:
- Descarga el DOCX como ArrayBuffer vía signed URL.
- Renderiza con `renderAsync` de docx-preview.
- Muestra loading skeleton mientras carga.
- Muestra mensaje de error si falla.
- 170 KB code-split automático (no aumenta el bundle principal).

### 5.2 Modo vista admin

Hook `src/lib/previewRole.ts` con persistencia en localStorage (`acaspex_preview_role`).

Selector visible solo para administradores en `MemberLayout`:
- Vista: Administrador (por defecto)
- Vista: Junta Directiva
- Vista: Socio estándar

Efectos al cambiar el modo:
- "Vista Junta Directiva": oculta acceso admin, muestra Material Corporativo, etiqueta "Previsualizando como Junta Directiva".
- "Vista Socio estándar": oculta Material Corporativo, etiqueta "Previsualizando como Socio estándar".
- RequireBoardOrAdmin respeta el preview role y muestra acceso denegado si vista Socio intenta acceder a Material Corporativo.
- No modifica permisos reales, RLS, perfiles ni members.

### 5.3 Estados de recurso mejorados

En `AdminResourcesPage`, las acciones ahora son:

| Estado | Acciones |
|--------|----------|
| Published | Archivar |
| Archived | Publicar de nuevo (principal) + Restaurar borrador |
| Draft | Publicar (principal) + Archivar |

### 5.4 Archivos H0.8c-FIX2

```
package.json — docx-preview dependencia
pnpm-lock.yaml — lockfile actualizado
src/components/resources/DocxPreview.tsx — componente de preview DOCX
src/lib/previewRole.ts — hook de modo vista admin
src/components/layout/MemberLayout.tsx — selector de preview role
src/components/RequireBoardOrAdmin.tsx — gate respeta preview role
src/routes/placeholderPages.tsx — DocxPreview integrado, estados mejorados
```

---

## 6. Deuda conocida

- `resource_visibility` no se actualiza al cambiar estado (se crea al insertar y queda fija).
- El componente DOCX preview es experimental y puede fallar con documentos complejos.
- PPTX sigue sin preview (placeholder premium + botón Descargar).
- La eliminación física de recursos no está implementada (archivar en su lugar).

---

## 7. Estado

Status: pending_review
