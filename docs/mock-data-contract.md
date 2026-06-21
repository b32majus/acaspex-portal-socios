---
title: Mock Data Contract — ACASPEX Portal Socios
created: 2026-06-20
updated: 2026-06-20
status: active-draft
owner: Sil + Cora
project: ACASPEX Portal Socios
---

# Mock Data Contract — ACASPEX Portal Socios

## 1. Propósito

Definir tipos y datos ficticios exactos para el prototipo Fase 1.

Este contrato evita que el Builder invente campos, estados o ejemplos.

## 2. Reglas generales

```text
No usar datos reales.
No usar nombres de personas reales.
No usar emails reales.
No conectar Supabase.
No añadir estados no definidos.
No añadir campos no definidos sin actualizar este contrato.
```

## 3. Estados de socio

El tipo `MemberStatus` debe aceptar exactamente:

```ts
export type MemberStatus =
  | 'pending_review'
  | 'active'
  | 'expired'
  | 'inactive'
  | 'cancelled';
```

## 4. Tipo de cuota

```ts
export type MembershipType = 'general' | 'reduced';
```

## 5. Motivo de cuota reducida

```ts
export type ReducedFeeReason =
  | 'resident'
  | 'student'
  | 'retired'
  | null;
```

## 6. Tipo Member

```ts
export type Member = {
  id: string;
  firstName: string;
  lastName1: string;
  lastName2: string;
  email: string;
  phone: string;
  professionalCategory: string;
  jobTitle: string;
  organization: string;
  qualitySafetyLink: string;
  membershipType: MembershipType;
  reducedFeeReason: ReducedFeeReason;
  status: MemberStatus;
  joinedAt: string;
  paidUntil: string | null;
  lastPaymentAmount: number | null;
  lastPaymentDate: string | null;
  communicationConsent: boolean;
  notes: string;
};
```

## 7. Datos mock de socios

Crear `mockMembers` con exactamente estos 6 registros ficticios:

```ts
export const mockMembers: Member[] = [
  {
    id: 'mem-001',
    firstName: 'Lucía',
    lastName1: 'Morales',
    lastName2: 'Santos',
    email: 'lucia.morales@example.test',
    phone: '600000001',
    professionalCategory: 'Enfermería',
    jobTitle: 'Supervisora de calidad',
    organization: 'Hospital Regional Norte',
    qualitySafetyLink: 'Participa en proyectos de seguridad del paciente y mejora de circuitos asistenciales.',
    membershipType: 'general',
    reducedFeeReason: null,
    status: 'active',
    joinedAt: '2026-01-18',
    paidUntil: '2026-12-31',
    lastPaymentAmount: 50,
    lastPaymentDate: '2026-01-18',
    communicationConsent: true,
    notes: 'Socia activa. Perfil referente en calidad asistencial.'
  },
  {
    id: 'mem-002',
    firstName: 'Raúl',
    lastName1: 'Benítez',
    lastName2: 'Cano',
    email: 'raul.benitez@example.test',
    phone: '600000002',
    professionalCategory: 'Medicina',
    jobTitle: 'Residente de Medicina Preventiva',
    organization: 'Área Sanitaria Centro',
    qualitySafetyLink: 'Interés en indicadores de seguridad y análisis de eventos adversos.',
    membershipType: 'reduced',
    reducedFeeReason: 'resident',
    status: 'pending_review',
    joinedAt: '2026-06-10',
    paidUntil: null,
    lastPaymentAmount: 30,
    lastPaymentDate: '2026-06-10',
    communicationConsent: true,
    notes: 'Pendiente de revisar acreditación de residente y justificante.'
  },
  {
    id: 'mem-003',
    firstName: 'Marta',
    lastName1: 'Garrido',
    lastName2: 'López',
    email: 'marta.garrido@example.test',
    phone: '600000003',
    professionalCategory: 'Farmacia Hospitalaria',
    jobTitle: 'Farmacéutica especialista',
    organization: 'Hospital Universitario Sur',
    qualitySafetyLink: 'Trabaja en continuidad asistencial y uso seguro del medicamento.',
    membershipType: 'general',
    reducedFeeReason: null,
    status: 'expired',
    joinedAt: '2025-03-02',
    paidUntil: '2025-12-31',
    lastPaymentAmount: 50,
    lastPaymentDate: '2025-03-02',
    communicationConsent: true,
    notes: 'Renovación pendiente.'
  },
  {
    id: 'mem-004',
    firstName: 'Elena',
    lastName1: 'Navarro',
    lastName2: 'Ruiz',
    email: 'elena.navarro@example.test',
    phone: '600000004',
    professionalCategory: 'Estudiante',
    jobTitle: 'Estudiante de Ciencias de la Salud',
    organization: 'Universidad Pública de Extremadura',
    qualitySafetyLink: 'Interés formativo en cultura de seguridad y experiencia del paciente.',
    membershipType: 'reduced',
    reducedFeeReason: 'student',
    status: 'active',
    joinedAt: '2026-02-21',
    paidUntil: '2026-12-31',
    lastPaymentAmount: 30,
    lastPaymentDate: '2026-02-21',
    communicationConsent: true,
    notes: 'Acreditación revisada.'
  },
  {
    id: 'mem-005',
    firstName: 'Andrés',
    lastName1: 'Paredes',
    lastName2: 'Mora',
    email: 'andres.paredes@example.test',
    phone: '600000005',
    professionalCategory: 'Gestión sanitaria',
    jobTitle: 'Técnico de calidad',
    organization: 'Servicio de Salud Ficticio',
    qualitySafetyLink: 'Coordina grupos de mejora y seguimiento de indicadores.',
    membershipType: 'general',
    reducedFeeReason: null,
    status: 'inactive',
    joinedAt: '2024-11-14',
    paidUntil: '2025-12-31',
    lastPaymentAmount: 50,
    lastPaymentDate: '2025-01-09',
    communicationConsent: false,
    notes: 'Inactivado por solicitud administrativa ficticia.'
  },
  {
    id: 'mem-006',
    firstName: 'Carmen',
    lastName1: 'Vega',
    lastName2: 'Delgado',
    email: 'carmen.vega@example.test',
    phone: '600000006',
    professionalCategory: 'Jubilada',
    jobTitle: 'Profesional sanitaria jubilada',
    organization: 'Sin centro activo',
    qualitySafetyLink: 'Participación previa en comisiones de calidad hospitalaria.',
    membershipType: 'reduced',
    reducedFeeReason: 'retired',
    status: 'cancelled',
    joinedAt: '2026-05-03',
    paidUntil: null,
    lastPaymentAmount: null,
    lastPaymentDate: null,
    communicationConsent: false,
    notes: 'Solicitud cancelada antes de validación.'
  }
];
```

## 8. Tipos de recurso

```ts
export type ResourceType = 'pdf' | 'video' | 'template' | 'link' | 'presentation';
```

## 9. Categorías de recurso

```ts
export type ResourceCategory =
  | 'formacion'
  | 'herramientas'
  | 'jornadas'
  | 'guias'
  | 'plantillas';
```

## 10. Estado de recurso

```ts
export type ResourceStatus = 'draft' | 'published' | 'archived';
```

## 11. Tipo Resource

```ts
export type Resource = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  status: ResourceStatus;
  publishedAt: string | null;
  estimatedReadMinutes: number | null;
  externalUrl: string | null;
  fileLabel: string | null;
};
```

## 12. Datos mock de recursos

Crear `mockResources` con exactamente estos 5 registros ficticios:

```ts
export const mockResources: Resource[] = [
  {
    id: 'res-001',
    title: 'Guía básica para comunicar proyectos de mejora',
    subtitle: 'Estructura mínima para convertir una mejora en una historia comprensible.',
    description: 'Recurso introductorio para ordenar contexto, problema, intervención, resultados y aprendizaje transferible.',
    category: 'guias',
    type: 'pdf',
    status: 'published',
    publishedAt: '2026-05-15',
    estimatedReadMinutes: 8,
    externalUrl: null,
    fileLabel: 'PDF descargable'
  },
  {
    id: 'res-002',
    title: 'Plantilla de mapa de proceso asistencial',
    subtitle: 'Documento editable para identificar pasos, esperas y puntos críticos.',
    description: 'Plantilla ficticia para trabajar circuitos asistenciales y priorizar oportunidades de mejora.',
    category: 'plantillas',
    type: 'template',
    status: 'published',
    publishedAt: '2026-05-22',
    estimatedReadMinutes: null,
    externalUrl: null,
    fileLabel: 'Plantilla editable'
  },
  {
    id: 'res-003',
    title: 'Grabación sesión: fundamentos de seguridad del paciente',
    subtitle: 'Sesión formativa para socios con acceso privado.',
    description: 'Vídeo ficticio alojado externamente y accesible desde la biblioteca de socios.',
    category: 'formacion',
    type: 'video',
    status: 'published',
    publishedAt: '2026-06-01',
    estimatedReadMinutes: null,
    externalUrl: 'https://example.test/video-seguridad-paciente',
    fileLabel: 'Vídeo externo'
  },
  {
    id: 'res-004',
    title: 'Materiales Jornada ACASPEX 2026',
    subtitle: 'Presentaciones y documentos de apoyo para socios.',
    description: 'Espacio ficticio para agrupar recursos derivados de una jornada científica.',
    category: 'jornadas',
    type: 'presentation',
    status: 'draft',
    publishedAt: null,
    estimatedReadMinutes: null,
    externalUrl: null,
    fileLabel: 'Pendiente de publicación'
  },
  {
    id: 'res-005',
    title: 'Checklist de preparación de comunicaciones científicas',
    subtitle: 'Lista de comprobación antes de enviar una comunicación o póster.',
    description: 'Checklist ficticia para ayudar a equipos a revisar claridad, indicadores, impacto y transferibilidad.',
    category: 'herramientas',
    type: 'pdf',
    status: 'published',
    publishedAt: '2026-06-08',
    estimatedReadMinutes: 5,
    externalUrl: null,
    fileLabel: 'PDF descargable'
  }
];
```

## 13. Renovaciones mock

Derivar renovaciones desde `mockMembers` según `paidUntil`.

Para Fase 1 no crear tipo separado si no es necesario. Si se crea, usar:

```ts
export type RenewalItem = {
  memberId: string;
  fullName: string;
  status: MemberStatus;
  paidUntil: string | null;
  renewalState: 'upcoming' | 'expired' | 'not_applicable';
};
```

## 14. Archivos sugeridos futuros

Cuando se implemente, el Builder puede crear:

```text
src/data/mockMembers.ts
src/data/mockResources.ts
```

No crear esos archivos hasta que exista una WO específica.

## 15. Criterios de aceptación del contrato

Este contrato está listo cuando una WO pueda decir:

```text
Crear exactamente src/data/mockMembers.ts usando los tipos y registros definidos en docs/mock-data-contract.md.
No inventar campos.
No añadir registros.
No usar datos reales.
```
