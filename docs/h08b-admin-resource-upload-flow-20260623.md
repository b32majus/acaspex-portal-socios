---
title: H0.8b — Flujo real de recursos: subida admin, detalle y preview
status: pending_review
created: 2026-06-23
updated: 2026-06-23
owner: Sil / Cora
depends_on:
  - h08a_resource_flow_design
  - h07q_material_corporativo_unified
  - h08b_fix1_permission_grants
---

# H0.8b — Flujo real de recursos: subida admin, detalle y preview

## 1. Veredicto

```
h08b_real_resource_detail_preview_ready_for_validation
```

Implementaciones completadas. Pendiente de validación pública con U1 (admin), U2 (junta) y U3 (socio).

---

## 2. Implementaciones H0.8b-FIX2

### 2.1 Tipos de recurso ampliados

Nuevos tipos disponibles en el formulario admin (`/admin/recursos/nuevo`):

| Valor interno | Label | Icono |
|--------------|-------|-------|
| `image` | Imagen | Image |
| `logo` | Logo | Image |
| `teams_background` | Fondo Teams | Image |
| `pdf` | PDF | FileText |
| `document` | Documento | FileText |
| `presentation` | Presentación | BookOpen |
| `template` | Plantilla | ClipboardList |
| `external_link` | Enlace externo | Globe |

El tipo `Image` (antes ausente) ya está disponible como "Imagen" y "Fondo Teams".

### 2.2 Página de detalle con Supabase real

`MemberResourceDetailPage` (`/socios/recursos/:resourceId`) ahora:

1. Consulta Supabase `resources` primero (por `id` real UUID).
2. Cae a `mockResources` como fallback si no encuentra.
3. Muestra loading skeleton mientras carga.
4. Genera signed URL para preview de imágenes.
5. Ofrece botón Descargar para recursos con archivo.
6. Ofrece botón Abrir para recursos con enlace externo.
7. Back link contextual: Material Corporativo o Centro de Conocimiento.

### 2.3 Preview de imágenes con signed URLs

Para recursos de tipo `image`, `logo` o `teams_background` (o archivos con extensión .png/.jpg/.jpeg):

- **En card**: `ResourceCardImage` genera signed URL de 300s y muestra preview.
- **En detalle**: Preview grande vía signed URL.
- **Descarga**: Botón que genera signed URL fresh y abre en nueva pestaña.

Sin abrir el bucket como público.

### 2.4 Etiquetas corregidas

- **Tipo**: Muestra label humano (Imagen, Fondo Teams, Documento, etc.), nunca valor técnico.
- **Visibilidad**: "Junta Directiva" para recursos corporativos, "Socios" para el resto.
- **Fecha**: `formatResourceDate()` maneja tanto `YYYY-MM-DD` como ISO timestamp completo.

### 2.5 Archivos modificados

```
src/data/mockResources.ts       — ResourceType ampliado, filePath añadido
src/routes/placeholderPages.tsx — ResourceCard, ResourceCardImage,
                                   MemberResourceDetailPage (rewrite),
                                   MaterialCorporativoPage (mapping),
                                   AdminResourceNewPage (dropdown),
                                   typeLabel, typeIconMap, formatResourceDate
```

---

## 3. Validación esperada por roles

### U1 — Admin (`acaspex.admin.demo@example.com`)

- [ ] Login admin OK.
- [ ] Material Corporativo visible en `/socios/material-corporativo`.
- [ ] Recurso "Fondo TEAMs ACASPEX" visible en card.
- [ ] Card muestra fecha legible (dd/mm/aaaa).
- [ ] Card muestra tipo legible (Imagen / Fondo Teams).
- [ ] Card muestra etiqueta "Junta Directiva".
- [ ] "Ver recurso" abre detalle con preview de imagen.
- [ ] Detalle muestra título, descripción, tipo, fecha, acceso.
- [ ] Botón Descargar funcional.
- [ ] `/admin/recursos/nuevo` muestra "Imagen", "Fondo Teams", etc. en el dropdown de tipo.
- [ ] Puede crear un nuevo recurso tipo Imagen con archivo PNG/JPG.

### U2 — Junta (`acaspex.junta.demo@example.com`)

- [ ] Login junta OK.
- [ ] Material Corporativo visible.
- [ ] Recurso real visible en card.
- [ ] "Ver recurso" abre detalle.
- [ ] Preview de imagen visible si es imagen.
- [ ] Botón Descargar funcional.
- [ ] `/admin` denegado.

### U3 — Socio (`acaspex.socio.demo@example.com`)

- [ ] Login socio OK.
- [ ] Material Corporativo NO visible en menú.
- [ ] Ruta directa `/socios/material-corporativo` bloqueada.
- [ ] Ruta detalle del recurso corporativo bloqueada o no disponible.
- [ ] Descarga directa no accesible sin URL firmada válida.
- [ ] `/admin` denegado.

---

## 4. Primer recurso real creado

Sil creó el primer recurso real desde la app admin:

```
Título: Fondo TEAMs ACASPEX
Sección: Material Corporativo
Estado: Publicado
Archivo: PNG
```

Este recurso se usó como referencia para validar el flujo completo de detalle y preview.

---

## 5. H0.8b-FIX3 — Tipos alineados y preview por formato

### 5.1 Enum `resource_type` ampliado en DB

Bug detectado al crear recurso "Logo ACASPEX Transparente":

```
invalid input value for enum resource_type: "logo"
```

El enum de la DB solo aceptaba `pdf, video, presentation, template, link, document, other`. El frontend había añadido `image, logo, teams_background, external_link` que la DB rechazaba.

Migración aplicada (`021_acaspex_resource_type_enum_values.sql`):

```sql
alter type public.resource_type add value if not exists 'image';
alter type public.resource_type add value if not exists 'logo';
alter type public.resource_type add value if not exists 'teams_background';
alter type public.resource_type add value if not exists 'external_link';
```

Verificado en staging:

```
pdf, video, presentation, template, link, document, other, image, logo, teams_background, external_link
```

Test de aceptación (rollback): insertar registros con los 4 nuevos tipos → OK, sin error de enum.

### 5.2 Preview por formato (DOCX/PPTX como descargables)

AnaT detectó que un DOCX subía correctamente pero la app intentaba previsualizarlo como si fuera imagen/PDF.

Nuevos helpers de clasificación:

| Helper | Criterio |
|--------|----------|
| `isImageResource` | tipo es image/logo/teams_background O extensión .png/.jpg/.jpeg/.gif/.webp |
| `isPdfResource` | tipo es pdf O extensión .pdf |
| `isOfficeResource` | tipo es document/template/presentation O extensión .docx/.doc/.pptx/.ppt |
| `isExternalLinkResource` | tiene external_url pero no file_path |
| `isPreviewableResource` | image O pdf |
| `isDownloadOnlyResource` | office O no previsualizable |

### 5.3 Comportamiento por tipo

| Tipo | Card | Detalle | Botones |
|------|------|---------|---------|
| Imagen / Logo / Fondo Teams | Preview real (signed URL) | Preview grande | Ver recurso, Descargar |
| PDF | Placeholder PDF (rosa) | Placeholder PDF | Abrir PDF, Descargar |
| DOCX/PPTX | Placeholder Word/PPT + "Documento descargable" | Placeholder + aviso "Vista previa no disponible" | Descargar archivo |
| Enlace externo | Placeholder "Enlace externo" | Placeholder "Enlace externo" | Abrir recurso |
| Sin archivo/enlace | MockCover decorativo | MockCover | Mensaje "Sin archivo ni enlace" |

### 5.4 Verificación de archivos huérfanos

Bucket `acaspex-resource-files` revisado:

```
corporativo/2026/512dc4b3-...-MODELO-FIRMAS-ALUMNOS.docx (Ana's test)
corporativo/2026/33020380-...-Fondo-TEAMs-ACASPEX.PNG  (Sil's first resource)
```

No se encontraron archivos huérfanos del intento fallido de Logo. El flujo `AdminResourceNewPage` ya tiene bloque de limpieza (`storage.remove([storagePath])` cuando el INSERT falla) y funcionó correctamente.

### 5.5 Archivos modificados en H0.8b-FIX3

```
src/routes/placeholderPages.tsx — helpers de clasificación, ResourceCardImage refactorizado, MemberResourceDetailPage con preview/notice/buttons
supabase/migrations/20260623000021_021_acaspex_resource_type_enum_values.sql — nueva migración
```

---

## 6. Deuda conocida

- La tabla `resources` no tiene columna `category`. La categoría se infiere del contexto (Material Corporativo, Centro de Conocimiento, etc.). En el futuro puede añadirse si se necesita filtrar por categoría en Supabase directamente.
- `ResourceCategory` para recursos Supabase se asigna según `resource_type`, lo que es frágil si un mismo tipo pertenece a varias categorías.
- Los mocks siguen funcionando como fallback para entornos sin Supabase configurado.

---

## 6. Estado

Status: pending_review
