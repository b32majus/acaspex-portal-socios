---
title: Screen Spec — Member Home
created: 2026-06-20
updated: 2026-06-20
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
route: /socios
component: MemberHomePage
---

# Screen Spec — Member Home

## 1. Propósito

Definir exactamente la pantalla `MemberHomePage` para que pueda implementarse sin inventar estructura, contenido ni datos.

## 2. Ruta y componente

```text
Ruta: /socios
Componente: MemberHomePage
Layout: MemberLayout
Rol visible: socio
Datos: mockMembers + mockResources
```

## 3. Objetivo de la pantalla

Dar al socio una entrada clara al área privada, mostrando:

```text
estado de membresía
acceso a biblioteca
recursos recientes
mensaje institucional breve
```

## 4. Datos usados

Usar como socio actual mock:

```text
memberId = mem-001
```

Usar recursos recientes:

```text
mockResources con status = published
máximo 3 recursos
orden sugerido por publishedAt descendente
```

## 5. Estructura de pantalla

La pantalla debe tener exactamente estas secciones, en este orden:

1. Hero / bienvenida.
2. Card estado de membresía.
3. Card acceso a biblioteca.
4. Sección recursos recientes.
5. Bloque mensaje ACASPEX.

## 6. Sección 1 — Hero / bienvenida

Contenido:

```text
Título: Bienvenida al área de socios de ACASPEX
Subtítulo: Accede a recursos, materiales y contenidos exclusivos para la comunidad ACASPEX.
```

Debe incluir saludo con nombre del socio mock:

```text
Hola, Lucía
```

No usar textos largos.

## 7. Sección 2 — Card estado de membresía

Componente sugerido:

```text
Card + Badge + Button
```

Debe mostrar:

```text
Título card: Estado de tu membresía
Nombre completo: Lucía Morales Santos
Estado visible: Activo
Tipo de cuota: General
Válido hasta: 31/12/2026
```

Badge:

```text
Activo
```

Botón:

```text
Ver mi cuenta → /socios/mi-cuenta
```

## 8. Sección 3 — Card acceso a biblioteca

Componente sugerido:

```text
Card + Button
```

Debe mostrar:

```text
Título card: Biblioteca de recursos
Texto: Consulta guías, plantillas, grabaciones y materiales preparados para socios.
Botón: Ir a biblioteca → /socios/recursos
```

## 9. Sección 4 — Recursos recientes

Título:

```text
Últimos recursos publicados
```

Mostrar máximo 3 cards de recurso publicado.

Cada card debe mostrar:

```text
título
subtítulo
categoría visible en español
tipo de recurso visible en español
botón/enlace: Ver recurso
```

Mapeo de categoría visible:

```text
formacion → Formación
guías/guias → Guías
herramientas → Herramientas
jornadas → Jornadas
plantillas → Plantillas
```

Mapeo tipo visible:

```text
pdf → PDF
video → Vídeo
template → Plantilla
link → Enlace
presentation → Presentación
```

Ruta del botón:

```text
/socios/recursos/:resourceId
```

## 10. Sección 5 — Mensaje ACASPEX

Componente sugerido:

```text
Card o bloque destacado suave
```

Texto exacto:

```text
ACASPEX impulsa una comunidad comprometida con la calidad asistencial y la seguridad del paciente. Este espacio reunirá materiales, formación y herramientas para acompañar ese trabajo compartido.
```

## 11. Estados vacíos

Si no hay recursos publicados, mostrar:

```text
Aún no hay recursos publicados. Próximamente encontrarás aquí materiales para socios.
```

No inventar recursos alternativos.

## 12. Fuera de alcance

```text
No implementar login real.
No implementar renovación real.
No permitir edición.
No conectar Supabase.
No mostrar datos reales.
No añadir gráficas.
No añadir notificaciones automáticas.
```

## 13. Criterios de aceptación de pantalla

La pantalla está lista cuando:

```text
la ruta /socios muestra MemberHomePage
usa MemberLayout
muestra saludo a Lucía
muestra estado activo y paidUntil de mem-001
muestra enlace a /socios/mi-cuenta
muestra enlace a /socios/recursos
muestra hasta 3 recursos publicados
no muestra recursos draft
no usa datos reales
no conecta backend
```
