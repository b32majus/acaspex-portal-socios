---
title: H0.8a — Diseño del primer flujo real de recursos ACASPEX
status: pending_review
created: 2026-06-23
owner: Sil / Cora
depends_on:
  - h07q_closed_ready_for_h08_resource_flow
---

# H0.8a — Diseño del primer flujo real de recursos

## 1. Veredicto

```
h08a_resource_flow_designed_ready_for_first_upload
```

El modelo de recursos, Storage, y políticas RLS están listos para la primera prueba piloto con Material Corporativo. Se detectaron 4 gaps que deben resolverse antes o durante H0.8b.

---

## 2. Estado actual del modelo de recursos

### Tablas

| Tabla | Campos clave | RLS |
|-------|-------------|-----|
| `resources` | id, category_id, title, subtitle, description, body_text, resource_type, status (draft/published/archived), external_url, file_path, created_by, published_at | Admin ve todo. Socio/junta solo publicados con visibilidad. |
| `resource_categories` | id, name, slug, description, sort_order, is_active | Admin gestiona. Sin políticas específicas para lectura. |
| `resource_visibility` | id, resource_id, role (socio/junta_directiva/administrador) | Solo admin lee/escribe. Visibilidad efectiva vía helper. |

### Helpers relevantes

| Helper | Función |
|--------|---------|
| `can_access_resource_by_visibility(resource_id)` | Admin → true. Junta → socio o junta_directiva. Socio → solo socio. |
| `can_access_resource_file_object(object_name)` | Admin → true. Otros → recurso published + visibilidad. Sin auth → false. |

### Estado de resource_categories

No existe la categoría `corporativo` en la tabla. Las categorías existentes en los mocks del frontend son: calidad, seguridad, investigacion, formacion, herramientas, corporativo. Pero la tabla `resource_categories` está vacía en staging — las categorías actuales solo existen en los datos mock del frontend.

---

## 3. Estado actual de Storage

### Bucket `acaspex-resource-files`

| Campo | Valor |
|-------|-------|
| Público | No (privado) |
| Tamaño máx | 50 MB |
| MIME types permitidos | PDF, DOCX, PPTX, XLSX |
| Estructura | `{resource_id}/{filename}` |
| SELECT | `can_access_resource_file_object(name)` — admin ve todo, otros solo publicados + visibilidad |
| INSERT | Solo admin (`is_admin()`) |
| UPDATE/DELETE | Solo admin |

### GAP: faltan tipos de imagen

Los formatos PNG y JPG no están en `allowed_mime_types`. Necesario para logos y fondos de Teams.

---

## 4. Flujo recomendado para la primera prueba

Se recomienda usar Supabase Dashboard + SQL Editor para la primera subida, por tres razones:

1. La UI admin de recursos del frontend es mock/demo — no está conectada a Supabase real.
2. Construir una UI admin completa de recursos es una tanda separada (H0.8c+).
3. Validar el ciclo Storage → RLS → Frontend con datos reales controlados es prioritario.

### Flujo manual para H0.8b

```
1. Crear categoría 'corporativo' en resource_categories (SQL).
2. Subir archivos al bucket acaspex-resource-files (Dashboard Storage).
3. Crear registros en resources con file_path apuntando a los archivos.
4. Crear filas en resource_visibility para junta_directiva y administrador.
5. Verificar que MaterialCorporativoPage puede listarlos (frontend).
6. Verificar permisos: admin/junta pueden ver, socio no puede.
7. Verificar descarga/previsualización.
```

---

## 5. Primer lote piloto sugerido

Archivos reales no sensibles de ACASPEX:

| # | Tipo | Descripción | Formato |
|---|------|-------------|---------|
| 1 | Logo | Logo ACASPEX principal con fondo | PNG |
| 2 | Logo | Logo ACASPEX transparente | PNG |
| 3 | Fondo Teams | Fondo corporativo ACASPEX para Teams | PNG/JPG |

Máximo: 3-5 archivos. Todos no sensibles.

---

## 6. Permisos esperados por rol

| Acción | Admin | Junta | Socio |
|--------|-------|-------|-------|
| Ver Material Corporativo | Sí | Sí | No |
| Ver recurso en catálogo | Sí | Sí | No |
| Previsualizar/descargar archivo | Sí | Sí | No |
| Subir archivos | Sí (Dashboard) | No | No |
| Crear recursos | Sí (Dashboard) | No | No |

---

## 7. Gaps detectados

### G1 — Categoría `corporativo` no existe en BD

**Bloqueante para H0.8b.** Requiere INSERT en `resource_categories`.

### G2 — Formatos de imagen no permitidos en bucket

**Bloqueante para H0.8b.** Requiere añadir `image/png` y `image/jpeg` a `allowed_mime_types`.

### G3 — Sin UI admin de recursos conectada

**No bloqueante para H0.8b.** La primera prueba se hará por Dashboard. La UI admin se construye en H0.8c+.

### G4 — Sin generación de URLs firmadas en frontend

**No bloqueante para H0.8b.** La primera prueba usará URLs públicas temporales. La URL firmada se implementa en H0.8c+.

### G5 — Sin conexión frontend a resources/Storage

**No bloqueante.** `MaterialCorporativoPage` actualmente usa `mockResources`. Para H0.8b se necesita añadir una consulta real a `resources` + `resource_visibility`.

### G6 — MIME types del bucket limitados a documentos

**Parcialmente cubierto por G2.** El bucket permite PDF, DOCX, PPTX, XLSX. Faltan PNG, JPG para logos/imágenes.

---

## 8. Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Subir archivos sensibles por error | Solo Sil selecciona qué archivos subir. Validar antes. |
| Exponer URL de Storage sin firma | Bucket es privado. Las URLs requieren firma. Primera prueba con Dashboard. |
| Confundir staging con producción | Verificar project ref: `oxbsbvbrljzvfqpdozgl`. |
| Romper RLS al modificar policies | No modificar RLS en H0.8. Usar Dashboard/SQL Editor. |
| Dejar archivos huérfanos | Documentar rollback. |

---

## 9. Siguiente WO recomendada

```
H0.8b — Primera subida manual de recursos corporativos
```

**Incluye:**
- Crear categoría `corporativo` en `resource_categories` (SQL).
- Añadir PNG/JPG a `allowed_mime_types` del bucket.
- Subir 2-3 archivos de prueba (logos/fondos) vía Supabase Dashboard.
- Crear registros `resources` + `resource_visibility`.
- Verificar visibilidad desde frontend (admin/junta ven, socio no).
- Documentar resultado.

**No incluye:**
- Construir UI admin de recursos.
- Implementar subida desde frontend.
- URLs firmadas.

**Requiere:** autorización de Sil para tocar Supabase staging.
