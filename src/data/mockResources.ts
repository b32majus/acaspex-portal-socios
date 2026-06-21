export type ResourceType = 'pdf' | 'video' | 'template' | 'link' | 'presentation';

export type ResourceCategory = 'formacion' | 'herramientas' | 'jornadas' | 'guias' | 'plantillas';

export type ResourceStatus = 'draft' | 'published' | 'archived';

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

export const mockResources: Resource[] = [
  {
    id: 'res-001',
    title: 'Guia basica para comunicar proyectos de mejora',
    subtitle: 'Estructura minima para convertir una mejora en una historia comprensible.',
    description: 'Recurso introductorio para ordenar contexto, problema, intervencion, resultados y aprendizaje transferible.',
    category: 'guias',
    type: 'pdf',
    status: 'published',
    publishedAt: '2026-05-15',
    estimatedReadMinutes: 8,
    externalUrl: null,
    fileLabel: 'PDF descargable',
  },
  {
    id: 'res-002',
    title: 'Plantilla de mapa de proceso asistencial',
    subtitle: 'Documento editable para identificar pasos, esperas y puntos criticos.',
    description: 'Plantilla ficticia para trabajar circuitos asistenciales y priorizar oportunidades de mejora.',
    category: 'plantillas',
    type: 'template',
    status: 'published',
    publishedAt: '2026-05-22',
    estimatedReadMinutes: null,
    externalUrl: null,
    fileLabel: 'Plantilla editable',
  },
  {
    id: 'res-003',
    title: 'Grabacion sesion: fundamentos de seguridad del paciente',
    subtitle: 'Sesion formativa para socios con acceso privado.',
    description: 'Video ficticio alojado externamente y accesible desde la biblioteca de socios.',
    category: 'formacion',
    type: 'video',
    status: 'published',
    publishedAt: '2026-06-01',
    estimatedReadMinutes: null,
    externalUrl: 'https://example.test/video-seguridad-paciente',
    fileLabel: 'Video externo',
  },
  {
    id: 'res-004',
    title: 'Materiales Jornada ACASPEX 2026',
    subtitle: 'Presentaciones y documentos de apoyo para socios.',
    description: 'Espacio ficticio para agrupar recursos derivados de una jornada cientifica.',
    category: 'jornadas',
    type: 'presentation',
    status: 'draft',
    publishedAt: null,
    estimatedReadMinutes: null,
    externalUrl: null,
    fileLabel: 'Pendiente de publicacion',
  },
  {
    id: 'res-005',
    title: 'Checklist de preparacion de comunicaciones cientificas',
    subtitle: 'Lista de comprobacion antes de enviar una comunicacion o poster.',
    description: 'Checklist ficticia para ayudar a equipos a revisar claridad, indicadores, impacto y transferibilidad.',
    category: 'herramientas',
    type: 'pdf',
    status: 'published',
    publishedAt: '2026-06-08',
    estimatedReadMinutes: 5,
    externalUrl: null,
    fileLabel: 'PDF descargable',
  },
];
