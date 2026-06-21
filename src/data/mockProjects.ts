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
  objetivo: string;
  contexto: string;
  metodologia: string;
  indicadores: string[];
  resultados: string;
  lecciones_aprendidas: string;
  transferableLearning: string;
  associatedMaterial: string | null;
  fuente?: 'Socios' | 'ACASPEX' | 'Buenas prácticas' | 'Experiencias de mejora';
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
    objetivo: 'Reducir los errores de medicación mediante la estandarización del circuito y la implantación de doble verificación en todos los pasos críticos.',
    contexto: 'En la planta de hospitalización coexistían criterios heterogéneos entre servicios, lo que generaba incidencias en prescripción, preparación y registro de administración.',
    metodologia: 'Análisis del proceso conjunto con Farmacia y Enfermería, diseño de un checklist de doble verificación, formación presencial en puntos de trabajo y seguimiento mensual de incidencias.',
    indicadores: [
      'Tasa de errores de medicación por 1.000 administraciones',
      'Cumplimiento del checklist de doble verificación',
      'Tiempo de registro de administración',
    ],
    resultados: 'En seis meses se estandarizó el circuito, se alcanzó un cumplimiento del checklist del 94 % y se redujo un 40 % la tasa de errores de administración (dato ficticio).',
    lecciones_aprendidas: 'La implicación de Farmacia como referente técnico y la formación en el propio puesto de trabajo fueron determinantes para la adherencia del equipo de enfermería.',
    transferableLearning: 'La unificación de criterios entre farmacia y enfermería, junto con la formación específica en doble verificación, redujo los errores de administración en un 40 % en seis meses (dato ficticio).',
    associatedMaterial: null,
    fuente: 'Socios',
  },
  {
    id: 'proj-002',
    title: 'Mapa de experiencia del paciente en consultas externas',
    scope: 'Experiencia del paciente — Atención ambulatoria',
    organization: 'Área Sanitaria Centro',
    category: 'experiencia_paciente',
    status: 'compartido',
    summary: 'Mapeo completo de la experiencia del paciente desde la derivación hasta la salida de consulta, identificando puntos de fricción, esperas evitables y oportunidades de mejora en información y acompañamiento.',
    objetivo: 'Identificar puntos de fricción y oportunidades de mejora en la experiencia del paciente durante todo el recorrido por consultas externas.',
    contexto: 'El aumento de listas de espera y la falta de información clara generaban insatisfacción en pacientes y acompañantes, afectando la percepción de calidad asistencial.',
    metodologia: 'Talleres de journey mapping con pacientes y profesionales, encuestas de satisfacción en cuatro momentos clave y priorización de mejoras rápidas (quick wins).',
    indicadores: [
      'Nivel de satisfacción global',
      'Tiempo de espera percibido',
      'Tasa de información entendida por el paciente',
    ],
    resultados: 'Se diseñaron ocho mejoras puntuales; la satisfacción global subió 15 puntos (dato ficticio) y se redujeron las llamadas de seguimiento no planificadas.',
    lecciones_aprendidas: 'Involucrar a pacientes en sesiones de co-diseño generó propuestas que los profesionales no habíamos identificado, especialmente en comunicación de resultados y tiempos de espera.',
    transferableLearning: 'Involucrar a pacientes en sesiones de co-diseño generó propuestas que los profesionales no habíamos identificado, especialmente en comunicación de resultados y tiempos de espera.',
    associatedMaterial: 'Plantilla de mapa de proceso asistencial',
    fuente: 'ACASPEX',
  },
  {
    id: 'proj-003',
    title: 'Programa de humanización en UCI',
    scope: 'Humanización — Cuidados intensivos',
    organization: 'Hospital Universitario Sur',
    category: 'humanizacion',
    status: 'en_desarrollo',
    summary: 'Diseño e implantación progresiva de medidas de humanización en UCI: flexibilización de horarios de visita, diario de UCI para pacientes, protocolo de acompañamiento y mejora de comunicación con familias.',
    objetivo: 'Humanizar la atención en UCI mediante el acompañamiento a pacientes y familias, la flexibilización de horarios de visita y la mejora de la comunicación.',
    contexto: 'El entorno de cuidados intensivos genera altos niveles de estrés en las familias y limita la comunicación fluida entre equipos y acompañantes.',
    metodologia: 'Implementación secuencial: diario de UCI, flexibilización progresiva de horarios de visita, formación en comunicación y seguimiento mediante grupos de mejora.',
    indicadores: [
      'Satisfacción de familias',
      'Nivel de ansiedad percibida',
      'Adherencia al diario de UCI',
    ],
    resultados: 'Las primeras fases muestran mejoras en la satisfacción familiar y en la percepción de humanización; se continúa escalando al resto de la unidad.',
    lecciones_aprendidas: 'Las medidas más sencillas de implantar —como el diario de UCI— generaron el mayor impacto percibido por familias y profesionales en las primeras fases del proyecto.',
    transferableLearning: 'Las medidas más sencillas de implantar —como el diario de UCI— generaron el mayor impacto percibido por familias y profesionales en las primeras fases del proyecto.',
    associatedMaterial: 'Guía básica para comunicar proyectos de mejora',
    fuente: 'Experiencias de mejora',
  },
  {
    id: 'proj-004',
    title: 'Continuidad asistencial al alta de pacientes frágiles',
    scope: 'Continuidad asistencial — Gestión de casos',
    organization: 'Servicio de Salud Ficticio',
    category: 'continuidad_asistencial',
    status: 'idea',
    summary: 'Propuesta de modelo de continuidad entre atención hospitalaria y primaria para pacientes frágiles al alta, que incluiría informe estructurado, contacto telefónico a las 48 h y agenda de seguimiento compartida.',
    objetivo: 'Diseñar un modelo de continuidad asistencial entre hospital y atención primaria para pacientes frágiles al alta.',
    contexto: 'Los pacientes polimedicados y con necesidades complejas sufren descontinuidades durante la transición entre niveles asistenciales, con riesgo de reingreso.',
    metodologia: 'Revisión de experiencias previas, diseño de un informe estructurado de alta, contacto telefónico a las 48 h y creación de una agenda compartida con atención primaria.',
    indicadores: [
      'Tasa de reingreso a 30 días',
      'Contacto telefónico realizado a las 48 h',
      'Informe estructurado completado',
    ],
    resultados: 'Proyecto en fase de diseño; se espera reducir los reingresos y mejorar la coordinación entre atención primaria y especializada.',
    lecciones_aprendidas: 'La experiencia previa en otros centros sugiere que el informe estructurado con apartado específico de plan de cuidados al alta podría ser el elemento más valorado por los equipos de atención primaria.',
    transferableLearning: 'La experiencia previa en otros centros sugiere que el informe estructurado con apartado específico de plan de cuidados al alta podría ser el elemento más valorado por los equipos de atención primaria.',
    associatedMaterial: null,
    fuente: 'Buenas prácticas',
  },
  {
    id: 'proj-005',
    title: 'Análisis modal de fallos en circuito quirúrgico',
    scope: 'Mejora de procesos — Bloque quirúrgico',
    organization: 'Hospital Regional Norte',
    category: 'mejora_procesos',
    status: 'compartido',
    summary: 'Aplicación de AMFE (Análisis Modal de Fallos y Efectos) al circuito completo de cirugía programada, identificando puntos críticos y priorizando acciones correctoras en verificación prequirúrgica.',
    objetivo: 'Identificar y mitigar fallos latentes en el circuito de cirugía programada mediante un análisis modal de fallos y efectos (AMFE).',
    contexto: 'El bloque quirúrgico concentraba múltiples profesionales y etapas críticas que dificultaban la detección temprana de riesgos y fallos latentes.',
    metodologia: 'Sesiones AMFE interdisciplinares, priorización de modos de fallo según criticidad, definición de controles preventivos y plan de seguimiento de indicadores.',
    indicadores: [
      'Número de modos de fallo identificados',
      'Controles preventivos implementados',
      'Incidencias prequirúrgicas',
    ],
    resultados: 'Se identificaron 24 modos de fallo y se implementaron 15 controles preventivos, reduciendo las incidencias prequirúrgicas en el seguimiento inicial.',
    lecciones_aprendidas: 'La implicación de todos los perfiles del bloque quirúrgico en las sesiones AMFE fue determinante para identificar fallos latentes no visibles desde un solo estamento.',
    transferableLearning: 'La implicación de todos los perfiles del bloque quirúrgico en las sesiones AMFE fue determinante para identificar fallos latentes no visibles desde un solo estamento.',
    associatedMaterial: 'Checklist de preparación de comunicaciones científicas',
    fuente: 'Socios',
  },
  {
    id: 'proj-006',
    title: 'Gestión clínica de la demanda en consultas de enfermería',
    scope: 'Gestión clínica — Atención primaria',
    organization: 'Área Sanitaria Centro',
    category: 'gestion_clinica',
    status: 'implementado',
    summary: 'Reorganización de la demanda en consultas de enfermería de atención primaria mediante triage estructurado, agenda por complejidad y circuitos de resolución autónoma.',
    objetivo: 'Mejorar la accesibilidad y resolución de la demanda en consultas de enfermería de atención primaria.',
    contexto: 'Las consultas presentaban alta presión asistencial y dificultad para diferenciar la demanda programada de la preferente o urgente.',
    metodologia: 'Triage telefónico y presencial estructurado, agenda por niveles de complejidad y circuitos de resolución autónoma con protocolos de enfermería.',
    indicadores: [
      'Tiempo hasta la primera atención',
      'Demanda resuelta sin médico',
      'Interrupciones por consulta',
    ],
    resultados: 'Se redujeron las interrupciones en un 25 % y se mejoró la continuidad de cuidados y la experiencia de los usuarios (dato ficticio).',
    lecciones_aprendidas: 'Clasificar la demanda en tres niveles de complejidad (programada, preferente, urgente) permitió reducir un 25 % las interrupciones y mejorar la continuidad de cuidados.',
    transferableLearning: 'Clasificar la demanda en tres niveles de complejidad (programada, preferente, urgente) permitió reducir un 25 % las interrupciones y mejorar la continuidad de cuidados.',
    associatedMaterial: null,
    fuente: 'ACASPEX',
  },
];
