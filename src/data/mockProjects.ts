export type ProjectCategory =
  | 'seguridad_paciente'
  | 'mejora_procesos'
  | 'experiencia_paciente'
  | 'continuidad_asistencial'
  | 'humanizacion'
  | 'gestion_clinica';

export type ProjectStatus =
  | 'idea'
  | 'en_desarrollo'
  | 'implementado'
  | 'compartido';

export type Project = {
  id: string;
  title: string;
  scope: string;
  organization: string;
  category: ProjectCategory;
  status: ProjectStatus;
  summary: string;
  transferableLearning: string;
  associatedMaterial: string | null;
};

export const projectCategoryLabel: Record<ProjectCategory, string> = {
  seguridad_paciente: 'Seguridad del paciente',
  mejora_procesos: 'Mejora de procesos',
  experiencia_paciente: 'Experiencia del paciente',
  continuidad_asistencial: 'Continuidad asistencial',
  humanizacion: 'Humanización',
  gestion_clinica: 'Gestión clínica',
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  idea: 'Idea',
  en_desarrollo: 'En desarrollo',
  implementado: 'Implementado',
  compartido: 'Compartido',
};

export const projectStatusBadgeClass: Record<ProjectStatus, string> = {
  idea: 'bg-slate-100 text-slate-700',
  en_desarrollo: 'bg-amber-100 text-amber-700',
  implementado: 'bg-emerald-100 text-emerald-800',
  compartido: 'bg-teal-100 text-teal-700',
};

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    title: 'Circuito seguro de administración de medicación',
    scope: 'Seguridad del paciente — Farmacia Hospitalaria',
    organization: 'Hospital Regional Norte',
    category: 'seguridad_paciente',
    status: 'implementado',
    summary: 'Proyecto de mejora del circuito completo de administración de medicación en planta de hospitalización, desde prescripción hasta registro de administración, con implantación de doble verificación y protocolo unificado.',
    transferableLearning: 'La unificación de criterios entre farmacia y enfermería, junto con la formación específica en doble verificación, redujo los errores de administración en un 40 % en seis meses (dato ficticio).',
    associatedMaterial: null,
  },
  {
    id: 'proj-002',
    title: 'Mapa de experiencia del paciente en consultas externas',
    scope: 'Experiencia del paciente — Atención ambulatoria',
    organization: 'Área Sanitaria Centro',
    category: 'experiencia_paciente',
    status: 'compartido',
    summary: 'Mapeo completo de la experiencia del paciente desde la derivación hasta la salida de consulta, identificando puntos de fricción, esperas evitables y oportunidades de mejora en información y acompañamiento.',
    transferableLearning: 'Involucrar a pacientes en sesiones de co-diseño generó propuestas que los profesionales no habíamos identificado, especialmente en comunicación de resultados y tiempos de espera.',
    associatedMaterial: 'Plantilla de mapa de proceso asistencial',
  },
  {
    id: 'proj-003',
    title: 'Programa de humanización en UCI',
    scope: 'Humanización — Cuidados intensivos',
    organization: 'Hospital Universitario Sur',
    category: 'humanizacion',
    status: 'en_desarrollo',
    summary: 'Diseño e implantación progresiva de medidas de humanización en UCI: flexibilización de horarios de visita, diario de UCI para pacientes, protocolo de acompañamiento y mejora de comunicación con familias.',
    transferableLearning: 'Las medidas más sencillas de implantar —como el diario de UCI— generaron el mayor impacto percibido por familias y profesionales en las primeras fases del proyecto.',
    associatedMaterial: 'Guía básica para comunicar proyectos de mejora',
  },
  {
    id: 'proj-004',
    title: 'Continuidad asistencial al alta de pacientes frágiles',
    scope: 'Continuidad asistencial — Gestión de casos',
    organization: 'Servicio de Salud Ficticio',
    category: 'continuidad_asistencial',
    status: 'idea',
    summary: 'Propuesta de modelo de continuidad entre atención hospitalaria y primaria para pacientes frágiles al alta, que incluiría informe estructurado, contacto telefónico a las 48 h y agenda de seguimiento compartida.',
    transferableLearning: 'La experiencia previa en otros centros sugiere que el informe estructurado con apartado específico de plan de cuidados al alta podría ser el elemento más valorado por los equipos de atención primaria.',
    associatedMaterial: null,
  },
  {
    id: 'proj-005',
    title: 'Análisis modal de fallos en circuito quirúrgico',
    scope: 'Mejora de procesos — Bloque quirúrgico',
    organization: 'Hospital Regional Norte',
    category: 'mejora_procesos',
    status: 'compartido',
    summary: 'Aplicación de AMFE (Análisis Modal de Fallos y Efectos) al circuito completo de cirugía programada, identificando puntos críticos y priorizando acciones correctoras en verificación prequirúrgica.',
    transferableLearning: 'La implicación de todos los perfiles del bloque quirúrgico en las sesiones AMFE fue determinante para identificar fallos latentes no visibles desde un solo estamento.',
    associatedMaterial: 'Checklist de preparación de comunicaciones científicas',
  },
  {
    id: 'proj-006',
    title: 'Gestión clínica de la demanda en consultas de enfermería',
    scope: 'Gestión clínica — Atención primaria',
    organization: 'Área Sanitaria Centro',
    category: 'gestion_clinica',
    status: 'implementado',
    summary: 'Reorganización de la demanda en consultas de enfermería de atención primaria mediante triage estructurado, agenda por complejidad y circuitos de resolución autónoma.',
    transferableLearning: 'Clasificar la demanda en tres niveles de complejidad (programada, preferente, urgente) permitió reducir un 25 % las interrupciones y mejorar la continuidad de cuidados.',
    associatedMaterial: null,
  },
];
