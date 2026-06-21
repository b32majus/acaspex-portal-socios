---
title: Política de troceado de work orders — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
source: /srv/kairos-lab/docs/work-order-template.md + AGENTS.md
---

# Política de troceado de work orders — ACASPEX Portal Socios

## 1. Motivo

Sil detecta que incluso las micro-WOs propuestas pueden seguir siendo demasiado amplias si obligan al Builder a decidir arquitectura, estructura, diseño o comportamiento.

Corrección: las work orders para ACASPEX deben ser más mecánicas, cerradas y auditables.

## 2. Norma canónica KairOS

Según `/srv/kairos-lab/docs/work-order-template.md` y `AGENTS.md`:

```text
Una work order = una tarea atómica = un archivo de salida.
El PM no debe razonar sobre qué hacer: solo validar, lanzar y auditar.
El Builder no toma decisiones de arquitectura.
```

Una WO bien escrita debe tener:

```text
objetivo en una frase
contexto mínimo, máximo 5 líneas
rutas exactas que puede leer
ruta exacta de salida
contenido esperado literal
criterios de aceptación verificables
restricciones explícitas
chmod g+rw al terminar
```

## 3. Implicación para ACASPEX

No se deben pasar al Builder instrucciones tipo:

```text
Crear prototipo navegable
Crear portal socio
Crear admin socios
Crear app base
Diseñar UI
Montar shadcn correctamente
Crear estructura de rutas
```

Aunque parezcan pequeñas, siguen obligando a decidir demasiadas cosas.

## 4. Regla de preparación previa

Antes de una WO de código debe existir una especificación cerrada y localizable.

Ejemplos:

```text
docs/ui-routes-contract.md
docs/mock-data-contract.md
docs/component-contract.md
docs/screen-spec-login.md
docs/screen-spec-member-home.md
docs/screen-spec-admin-members.md
```

El Builder debe recibir instrucciones como:

```text
Crear exactamente el archivo X con el contenido Y
Modificar exactamente el archivo X para añadir la ruta Y
Crear exactamente el componente Z siguiendo la spec A
```

No debe inventar nombres, rutas, estructura ni comportamiento.

## 5. Granularidad correcta

### Demasiado amplio

```text
Crear prototipo navegable del portal socios.
```

### Aún amplio

```text
Crear shell de navegación y layout base.
```

### Mejor

```text
Crear docs/ui-routes-contract.md con la lista exacta de rutas, labels de navegación y permisos mock.
```

### Código aceptable después de spec

```text
Crear src/routes/routes.ts con las rutas definidas literalmente en docs/ui-routes-contract.md.
```

### Aún más seguro

```text
Crear src/data/mockMembers.ts copiando exactamente el contrato de docs/mock-data-contract.md.
```

## 6. Orden recomendado antes de código

Antes de pedir al Builder que cree pantallas, Cora debe producir/specificar:

1. `docs/ui-routes-contract.md`
2. `docs/mock-data-contract.md`
3. `docs/design-system-contract.md`
4. `docs/screen-spec-member-home.md`
5. `docs/screen-spec-member-library.md`
6. `docs/screen-spec-admin-members.md`
7. `docs/screen-spec-admin-resources.md`

Estos documentos pueden ser escritos por Cora directamente si son documentación verde, o mediante WO documental si se quiere pasar por PM/Builder.

## 7. Primera tarea real recomendada

No empezar mañana por código.

Empezar por cerrar y escribir contratos:

```text
Contrato 1: rutas y navegación.
Contrato 2: datos mock.
Contrato 3: sistema visual mínimo.
Contrato 4: primera pantalla, solo una.
```

Cuando esos contratos estén cerrados, la primera WO de código puede ser mecánica.

## 8. Ejemplo de WO mecánica futura

Objetivo:

```text
Crear el archivo src/data/mockMembers.ts con los datos ficticios definidos en docs/mock-data-contract.md.
```

Entrada:

```text
docs/mock-data-contract.md
```

Salida:

```text
src/data/mockMembers.ts
```

Contenido esperado:

```text
export type MemberStatus = ...
export type Member = ...
export const mockMembers: Member[] = ...
```

Restricciones:

```text
no crear otros archivos
no instalar paquetes
no cambiar rutas
no conectar Supabase
no usar datos reales
```

Esto sí es una WO adecuada para un Builder no top-tier.

## 9. Regla final

Si una WO permite al Builder tomar una decisión de producto, diseño, arquitectura o estructura de proyecto, todavía no está lista.

Cora debe decidir o documentar antes.
