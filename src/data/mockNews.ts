/**
 * Phase 1: News/activity implemented as a Home module.
 * No dedicated /novedades route exists yet.
 * Mock data only — future expansion can add /socios/novedades with a full list view.
 */

export type NewsItemType = 'resource' | 'recording' | 'update' | 'project' | 'publication';

export type NewsItem = {
  id: string;
  type: NewsItemType;
  title: string;
  date: string;
  linkTo: string;
};

export const mockNews: NewsItem[] = [
  {
    id: 'n1',
    type: 'resource',
    title: 'Nueva guía: Seguridad del paciente en atención primaria',
    date: '2026-06-18',
    linkTo: '/socios/recursos',
  },
  {
    id: 'n2',
    type: 'recording',
    title: 'Webinar: Lean Healthcare — casos prácticos (grabación disponible)',
    date: '2026-06-15',
    linkTo: '/socios/recursos',
  },
  {
    id: 'n3',
    type: 'update',
    title: 'Checklist de cultura de seguridad — actualizada a junio 2026',
    date: '2026-06-10',
    linkTo: '/socios/recursos',
  },
  {
    id: 'n4',
    type: 'project',
    title: 'Proyecto del mes: Flebitis Zero en el Hospital de Mérida',
    date: '2026-06-08',
    linkTo: '/socios/proyectos',
  },
  {
    id: 'n5',
    type: 'publication',
    title: 'Artículo: Mejora de procesos en urgencias — disponible en Centro de Conocimiento',
    date: '2026-06-05',
    linkTo: '/socios/recursos',
  },
  {
    id: 'n6',
    type: 'resource',
    title: 'Nuevo kit de inicio en metodología Lean Healthcare',
    date: '2026-06-03',
    linkTo: '/socios/recursos',
  },
  {
    id: 'n7',
    type: 'recording',
    title: 'Píldora formativa: comunicación efectiva en entornos asistenciales',
    date: '2026-06-01',
    linkTo: '/socios/recursos',
  },
  {
    id: 'n8',
    type: 'resource',
    title: 'Nueva guía: Protocolo de identificación segura del paciente',
    date: '2026-05-28',
    linkTo: '/socios/recursos',
  },
  {
    id: 'n9',
    type: 'update',
    title: 'Actualización del plan de formación en seguridad del paciente 2026',
    date: '2026-05-25',
    linkTo: '/socios/recursos',
  },
  {
    id: 'n10',
    type: 'project',
    title: 'Nuevo proyecto colaborativo: Reducción de caídas en hospitalización',
    date: '2026-05-20',
    linkTo: '/socios/proyectos',
  },
];
