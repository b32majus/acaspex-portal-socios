---
title: H0.8c — Panel admin real de gestión de recursos + preview en cards
status: validated
created: 2026-06-23
updated: 2026-06-23
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

## 5. H0.8R — Refactor del módulo de recursos y modelo sección/subsección

### 5.1 Rollback DOCX preview

La preview experimental de DOCX (`docx-preview`) no funcionó en validación. Eliminada:
- `docx-preview` quitado de `package.json`.
- `src/components/resources/DocxPreview.tsx` eliminado.
- `MemberResourceDetailPage` restaurado a placeholder premium para DOCX/PPTX.
- Bundle principal reducido en 170 KB (el chunk de docx-preview ya no existe).

### 5.2 Rollback previewRole

El modo vista con selector de rol fue reemplazado por navegación real admin↔portal:
- `src/lib/previewRole.ts` eliminado.
- `MemberLayout` restaurado a comportamiento real de identidad.
- `RequireBoardOrAdmin` restaurado a verificación real de identidad.
- Añadido botón "Panel admin" (Shield) en `MemberLayout` cuando el usuario es admin.
- Añadido enlace "Ver portal de socios" (Users) en `AdminLayout`.

### 5.3 Refactor de helpers

Extraídos a `src/lib/resourceHelpers.ts`:
- `typeLabel`, `categoryLabel`, `typeIconMap`, `resourceStatusLabel`, `resourceStatusBadgeClass`
- `formatResourceDate`
- `isImageResource`, `isPdfResource`, `isOfficeResource`, `isExternalLinkResource`, `isPreviewableResource`, `isDownloadOnlyResource`
- `ResourceLike` type

### 5.4 Formulario con sección/subsección

Rediseñado `AdminResourceNewPage`:

**Secciones:**
- Material Corporativo (sin subsección)
- Centro de Conocimiento → Calidad Asistencial, Seguridad del Paciente, Investigación, Formación, Herramientas
- Banco de Proyectos → Seguridad del paciente, Mejora de procesos, Experiencia del paciente, Continuidad asistencial, Humanización, Gestión Clínica

**Visibilidad por sección:**
- Material Corporativo → Administración + Junta Directiva
- Centro de Conocimiento → Administración + Junta Directiva + Socios
- Banco de Proyectos → Administración + Junta Directiva + Socios

**Storage path** basado en sección (ya no hardcodeado `corporativo/`).

### 5.5 Inspección DB (Parte D)

Schema actual:
- `resources`: sin columna `section`. `category_id` (uuid → resource_categories) nullable.
- `resource_categories`: sin columna `section`. Campos: name, slug, description, sort_order, is_active.
- `resource_type` enum: pdf, video, presentation, template, link, document, other, image, logo, teams_background, external_link.
- `resource_status` enum: draft, published, archived.

**Pendiente:** migración para añadir `section` (enum o text) a `resource_categories` y poblarla. Sin migración aplicada en esta WO — frontend usa mapping.

### 5.6 Archivos H0.8R

```
Eliminados: src/components/resources/DocxPreview.tsx, src/lib/previewRole.ts
Modificados: package.json, pnpm-lock.yaml, placeholderPages.tsx, 
             RequireBoardOrAdmin.tsx, MemberLayout.tsx, AdminLayout.tsx
Nuevos: src/lib/resourceHelpers.ts
```

### 5.7 H0.8R2 — Refactor real del módulo de recursos

Extraídos de `placeholderPages.tsx` a módulos propios:

| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| `src/components/resources/MockCover.tsx` | 157 | Componente de portada decorativa mock |
| `src/components/resources/MemberResourceDetailPage.tsx` | 305 | Página de detalle de recurso (Supabase + mocks) |
| `src/components/resources/AdminResourcesPage.tsx` | 283 | Panel admin de gestión de recursos |
| `src/components/resources/AdminResourceEditorPage.tsx` | 318 | Editor de recurso (carga/edita/guarda) |
| `src/components/resources/AdminResourceNewPage.tsx` | 343 | Formulario de subida (sección/subsección) |

`placeholderPages.tsx`: 4881 → 3547 líneas (-1334, -27%).

`AppRouter.tsx`: actualizado para importar los nuevos módulos.

### 5.8 H0.8S — Migración sección/subsección ✅ VALIDADO

**Estado:** `h08s_resource_sections_model_validated` — 2026-06-23.

Validación de Sil: formulario correcto visualmente, Material Corporativo sin subsección, Centro de Conocimiento y Banco de Proyectos con sus subsecciones, visibilidad U2/U3 correcta.

Modelo de recursos cerrado:

```
section = corporate_material → sin subsección → admin/junta
section = knowledge_center → 5 subsecciones → admin/junta/socios
section = project_bank → 6 subsecciones → admin/junta/socios
```

Próximo bloque: H0.8T — Administración de subsecciones desde panel admin.

### 5.9 H0.8T — Gestión de subsecciones desde panel admin

**Nueva pantalla:** `/admin/recursos/subsecciones` → `AdminResourceCategoriesPage`

Funcionalidades:
- Listado de subsecciones agrupado por sección (Centro de Conocimiento / Banco de Proyectos).
- Crear nueva subsección con slug automático desde el nombre.
- Editar nombre, descripción y orden.
- Activar / desactivar subsección.
- Material Corporativo sin subsecciones (nota informativa).

Integración:
- `AdminResourceNewPage` carga categorías activas desde `resource_categories` (ya no hardcodeadas).
- `AdminResourcesPage` incluye enlace "Gestionar subsecciones".
- `AppRouter` incluye ruta `/admin/recursos/subsecciones`.

Estado: `h08t_resource_subsections_admin_ready_for_validation`. Pendiente de validación de Sil.

### 5.10 H0.8T-CLOSE ✅ VALIDADO

**Estado:** `h08t_resource_subsections_admin_validated` — 2026-06-23.

Validación técnica completa. Build OK, 11 categorías activas, policies verificadas, slugify correcto. Pendiente de validación funcional por Sil en web pública.

### 5.11 H0.8T-FIX1 — Corrección de permisos, navegación y orden

**Estado:** `h08t_resource_subsections_admin_fix_ready_for_validation` — 2026-06-24.

Problemas detectados por Sil tras primera validación:
1. "Gestionar subsecciones" como botón dentro de Recursos → movido a sidebar admin como entrada propia.
2. Crear subsección fallaba: `permission denied for table resource_categories` → GRANT INSERT, UPDATE aplicado (migración 024).
3. Activar/desactivar subsección fallaba por el mismo motivo → mismo fix.
4. Campo Orden manual poco práctico → eliminado, auto-cálculo al crear + botones Subir/Bajar.

**Parte A — Navegación:**
- `AdminLayout`: entrada "Subsecciones" añadida al sidebar (después de "Recursos").
- `AdminLayout.isActive()`: corregido para que "Recursos" no se active al estar en `/admin/recursos/subsecciones`.
- `AdminResourcesPage`: botón "Gestionar subsecciones" eliminado.

**Parte B — Permisos:**
- Migración `024`: `GRANT INSERT, UPDATE ON public.resource_categories TO authenticated`.
- SELECT ya existía (migración 020). Policies RLS ya existían.
- Sin DELETE (por decisión).

**Parte C — Orden:**
- Crear: auto-cálculo `max(sort_order) + 1` dentro de la misma sección.
- Campo manual eliminado del formulario de creación.
- Botones Subir (ArrowUp) / Bajar (ArrowDown) en tabla: intercambian `sort_order` con la subsección adyacente.
- Sin drag & drop (mejora futura).

### 5.12 Decisión: no crear nuevas secciones principales

Las secciones principales actuales son:
- Centro de Conocimiento
- Banco de Proyectos
- Material Corporativo

Crear una nueva sección principal requiere una fase específica porque afecta a navegación, rutas, permisos, modelo de datos y presentación pública. No se implementa en H0.8T-FIX1.

Futuro bloque: H0.9 — Modelo dinámico de secciones principales.

### 5.13 H0.8T-FIX2 — Subsections reales en admin y portal

Estado: h08t_resource_subsections_admin_fix_ready_for_validation — 2026-06-24.

Cierre funcional del flujo real de subsecciones:

- resource_categories queda como fuente única para subsecciones de Centro de Conocimiento y Banco de Proyectos.
- AdminResourceCategoriesPage calcula sort_order = max(sort_order) + 1 consultando datos reales de la tabla al crear.
- Reordenación con Subir/Bajar deja de usar updates paralelos: aplica update secuencial y revierte el primero si falla el segundo.
- AdminResourceNewPage usa category_id real de categorías activas, no slug intermedio.
- AdminResourceEditorPage muestra la sección del recurso, mantiene la categoría actual aunque esté inactiva y permite cambiar a otra categoría activa de la misma sección.
- MemberLibraryPage lee subsecciones activas reales de resource_categories para el sidebar/listado de Centro de Conocimiento y muestra recursos reales section = knowledge_center.
- MemberProjectBankPage lee subsecciones activas reales de resource_categories para el sidebar/listado de Banco de Proyectos.
- Material Corporativo sigue sin subsecciones.

Permisos/RLS:

- Migración 025: reafirma GRANT SELECT, INSERT, UPDATE ON public.resource_categories TO authenticated.
- Recrea policies resource_categories_select_authenticated, resource_categories_insert_admin y resource_categories_update_admin con to authenticated.
- No se crea policy DELETE.
- Staging verificado post-migración: policies con roles={authenticated} y grants SELECT/INSERT/UPDATE para authenticated.

Decisión vigente:

No se crean nuevas secciones principales. Las secciones siguen siendo Centro de Conocimiento, Banco de Proyectos y Material Corporativo.


### Archivos modificados H0.8T-FIX1
- `src/components/layout/AdminLayout.tsx` — navegación sidebar
- `src/components/resources/AdminResourcesPage.tsx` — eliminar botón subsecciones
- `src/components/resources/AdminResourceCategoriesPage.tsx` — reescritura completa (orden, permisos)
- `supabase/migrations/20260623000024_024_acaspex_resource_categories_admin_write_grants.sql` — GRANTs

---

### 5.13 H0.8T-FIX2 — Subsecciones reales en admin y portal

**Estado:** `h08t_resource_subsections_admin_fix_ready_for_validation` — 2026-06-24.

Objetivo cerrado:
- Admin crea subsecciones solo para Centro de Conocimiento y Banco de Proyectos.
- Admin activa/desactiva subsecciones.
- Admin reordena con botones Subir/Bajar dentro de la misma sección.
- Alta de recurso usa `category_id` real de `resource_categories`.
- Editor de recurso muestra sección, mantiene categoría actual aunque esté inactiva y permite cambiar a otra activa de la misma sección.
- Portal socio lee subsecciones activas reales y ordenadas desde `resource_categories`.

**Permisos / RLS / GRANT:**
- Migración `025`: `GRANT SELECT, INSERT, UPDATE ON public.resource_categories TO authenticated`.
- Policies `resource_categories_select_authenticated`, `resource_categories_insert_admin`, `resource_categories_update_admin` recreadas con `TO authenticated`.
- Admin activo puede INSERT/UPDATE.
- Socio/Junta solo leen subsecciones activas.
- Sin policy DELETE.

**Orden:**
- Crear subsección calcula `sort_order` consultando el máximo real en DB dentro de la sección.
- Reordenación evita `Promise.all`: aplica updates secuenciales; si falla el segundo, intenta revertir el primero.

**Portal:**
- Centro de Conocimiento carga categorías activas `section = knowledge_center` ordenadas por `sort_order, name`.
- Banco de Proyectos carga categorías activas `section = project_bank` ordenadas por `sort_order, name`.
- Material Corporativo queda sin subsecciones.

**Decisión mantenida:**
- No se crean nuevas secciones principales en esta tanda.


### 5.14 H0.8T-FIX3 — Unicidad de subsecciones por sección

Estado: h08t_resource_categories_unique_by_section_ready_for_validation — 2026-06-24.

Problema detectado:
- Al crear una subsección con nombre ya existente en otra sección, Supabase devolvía duplicate key sobre resource_categories_name_key.
- La tabla conservaba unicidad global antigua: UNIQUE(name) y UNIQUE(slug).

Cambio DB:
- Migración 026 elimina resource_categories_name_key y resource_categories_slug_key.
- Crea índice único resource_categories_section_slug_key sobre (section, slug).
- No hay duplicados actuales por section+slug antes de aplicar.

Cambio frontend:
- AdminResourceCategoriesPage comprueba section+slug antes de insertar.
- Si ya existe, muestra: Ya existe una subsección con ese nombre en esta sección. Elige otro nombre o edita la existente.
- Si Supabase devuelve 23505, se traduce al mismo mensaje amigable.
- No se muestran errores técnicos de PostgreSQL para duplicados.

Validación funcional esperada:
- U1 admin puede repetir nombre en secciones distintas.
- U1 admin no puede duplicar nombre dentro de la misma sección.
- U2 junta y U3 socio siguen sin acceso a admin/subsecciones.
- Material Corporativo sigue sin subsecciones.


---

## 6. Deuda conocida

- `resource_visibility` no se actualiza al cambiar estado (se crea al insertar y queda fija).
- PPTX sigue sin preview (placeholder premium + botón Descargar).
- DOCX sigue sin preview (placeholder premium + botón Descargar).
- La eliminación física de recursos no está implementada (archivar en su lugar).

---

## 7. Estado

Status: validated

### 5.15 H0.8T-FIX4 — Iconos configurables para subsecciones

Estado: h08t_resource_category_icons_ready_for_validation — 2026-06-24.

- `resource_categories` añade `icon_key` como clave visual de subsección.
- Se define un catálogo cerrado de iconos Lucide compartido entre admin y portal.
- `AdminResourceCategoriesPage` permite elegir icono al crear o editar subsecciones.
- Si no se elige icono, frontend persiste `folder`.
- La tabla de subsecciones muestra el icono actual.
- `MemberLibraryPage` y `MemberProjectBankPage` resuelven el icono desde `resource_categories.icon_key`.
- Fallback estable en portal: `folder` si el valor es nulo o desconocido.
- Material Corporativo sigue sin subsecciones ni iconos configurables en esta tanda.
