Status: pending_review

# ACASPEX H0.8T-FIX4 — iconos configurables para subsecciones

## Objetivo

Permitir que cada subsección de `resource_categories` guarde un `icon_key` configurable y que el portal use ese valor para pintar un icono estable en el sidebar.

## Alcance

- Añadir `icon_key` nullable en `public.resource_categories`.
- Persistir `folder` desde frontend cuando alta/edición no elijan icono.
- Centralizar catálogo cerrado de iconos Lucide en helper compartido.
- Usar el mismo helper en admin y en portal.
- Mostrar icono actual en la tabla de subsecciones.
- Mantener `Material Corporativo` fuera de esta lógica.

## Diseño

- DB:
  `resource_categories.icon_key text` sin constraint estricta en esta tanda.
  La migración 027 rellena iconos iniciales para categorías existentes conocidas.

- Frontend compartido:
  `src/lib/resourceCategories.ts` se amplía con:
  `icon_key` en el tipo de categoría,
  catálogo `resourceCategoryIconOptions`,
  helper `getResourceCategoryIcon(iconKey)`,
  fallback estable `folder`.

- Admin:
  `AdminResourceCategoriesPage` añade selector de icono en alta y edición.
  Si el selector queda vacío, el insert/update persiste `folder`.
  La tabla muestra icono y etiqueta actuales.

- Portal:
  Las vistas que ya consumen `fetchActiveResourceCategories(...)` resolverán el icono desde `icon_key` usando el helper compartido.
  No se añade lógica de negocio nueva a `placeholderPages.tsx`; solo se sustituye el mapeo local de iconos por el helper.

## Riesgos

- El portal sigue teniendo UI en `placeholderPages.tsx`, por lo que hay que tocar el render visual para eliminar el mapeo hardcodeado actual.
- `icon_key` queda abierto en DB en esta fase; valores desconocidos seguirán renderizando `folder`.
