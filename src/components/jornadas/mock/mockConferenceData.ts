export interface MockSubmission {
  id: string;
  submission_code: string;
  title: string;
  modality: 'oral' | 'poster' | 'communication';
  topic_area: string;
  abstract_text: string;
  authors_text: string;
  main_author_name: string;
  main_author_email: string;
  main_author_phone: string;
  center: string;
  service_unit: string;
  province: string;
  status: 'received' | 'under_review' | 'accepted' | 'rejected' | 'needs_info' | 'poster_pending' | 'poster_received';
  created_at: string;
}

export interface MockReviewer {
  id: string;
  name: string;
  email: string;
  institution: string;
}

export const mockSubmissions: MockSubmission[] = [
  {
    id: '1',
    submission_code: 'P001',
    title: 'Reducción de infecciones asociadas a la atención sanitaria mediante protocolo de higiene de manos',
    modality: 'oral',
    topic_area: 'Seguridad del paciente',
    abstract_text: 'Presentamos los resultados de un programa de mejora de la higiene de manos implementado en tres centros hospitalarios de la red sanitaria extremeña durante 18 meses. El estudio incluyó a 320 profesionales sanitarios y evaluó la tasa de infecciones asociadas a la atención sanitaria (IAAS) antes y después de la intervención. Se diseñó un programa formativo multimodal con auditas directas, retroalimentación personalizada y dispensadores automatizados. Los resultados muestran una reducción del 38% en la tasa de IAAS (p<0.001), con una adherencia al protocolo que pasó del 52% al 89%. Se discuten las barreras identificadas y las estrategias de sostenibilidad a largo plazo.',
    authors_text: 'Lucía Méndez Vidal, Rafael Obrero Sánchez, Marta Calvo García',
    main_author_name: 'Lucía Méndez Vidal',
    main_author_email: 'l.mendez@ ExtremaduraSalud.es',
    main_author_phone: '620123456',
    center: 'Hospital Universitario de Badajoz',
    service_unit: 'Servicio de Medicina Preventiva',
    province: 'Badajoz',
    status: 'under_review',
    created_at: '2026-06-20T10:30:00Z',
  },
  {
    id: '2',
    submission_code: 'P002',
    title: 'Continuidad asistencial en transiciones hospital-primaria: implementación de la carta de alta estructurada',
    modality: 'poster',
    topic_area: 'Continuidad asistencial',
    abstract_text: 'La transición entre niveles asistenciales es un momento crítico para la seguridad del paciente. Este estudio presenta la implementación de una carta de alta estructurada en formato digital en el Hospital San Pedro de Alcántara, con integración en el sistema de Historia Clínica Compartida de Extremadura. Se evaluó la completitud de la información transmitida, la satisfacción de profesionales y pacientes, y la tasa de reingresos a 30 días. La muestra incluyó 450 altas hospitalarias durante 12 meses. Los resultados muestran mejora en la completitud de la información (del 61% al 94%), reducción de reingresos no programados (del 12% al 7.3%) y alta satisfacción profesional (4.2/5).',
    authors_text: 'Fernando Arroyo Muñoz, Isabel Durán Delgado',
    main_author_name: 'Fernando Arroyo Muñoz',
    main_author_email: 'f.arroyo@ ExtremaduraSalud.es',
    main_author_phone: '630987654',
    center: 'Hospital San Pedro de Alcántara',
    service_unit: 'Servicio de Administración Clínica',
    province: 'Cáceres',
    status: 'received',
    created_at: '2026-06-21T14:15:00Z',
  },
  {
    id: '3',
    submission_code: 'P003',
    title: 'Aplicación de Lean Healthcare en quirófano: reducción de tiempos de espera y mejora de la eficiencia',
    modality: 'communication',
    topic_area: 'Lean Healthcare',
    abstract_text: 'La aplicación de metodologías Lean en el ámbito sanitario permite identificar y eliminar desperdicios en los procesos asistenciales. Presentamos la experiencia de implementación de Lean Healthcare en el Bloque Quirúrgico del Hospital de Mérida, con el objetivo de reducir los tiempos muertos entre intervenciones y optimizar la utilización de recursos. Se aplicaron técnicas de observación directa, mapeo de flujo de valor y Kaizen intensivo durante 6 meses. Los resultados incluyen reducción del 25% en el tiempo medio entre cirugías, incremento del 18% en la productividad de quirófano y mejora de la satisfacción del equipo quirúrgico.',
    authors_text: 'Pedro Navas Castillo, Ana Riquelme Galán, Carlos Guerrero López',
    main_author_name: 'Pedro Navas Castillo',
    main_author_email: 'p.navas@ ExtremaduraSalud.es',
    main_author_phone: '645678901',
    center: 'Hospital de Mérida',
    service_unit: 'Unidad de Gestión Quirúrgica',
    province: 'Badajoz',
    status: 'accepted',
    created_at: '2026-06-18T09:00:00Z',
  },
  {
    id: '4',
    submission_code: 'P004',
    title: 'Experiencia de paciente: validación de un cuestionario de evaluación de la humanización en atención primaria',
    modality: 'oral',
    topic_area: 'Humanización',
    abstract_text: 'La humanización de la atención sanitaria es un pilar fundamental de la calidad asistencial. Este estudio presenta la validación de un cuestionario de evaluación de la experiencia de paciente en el ámbito de Atención Primaria en Extremadura. Se diseño un instrumento de 25 items agrupados en 5 dimensiones: trato personal, comunicación, entorno físico, continuidad y acceso. Se administró a 1.200 pacientes de 28 centros de salud de toda la comunidad autónoma. El cuestionario mostró alta fiabilidad (alfa de Cronbach=0.91) y validez convergente. Los resultados revelan que las dimensiones con mayor margen de mejora son acceso (3.1/5) y continuidad (3.4/5), mientras que trato personal obtiene la puntuación más alta (4.3/5).',
    authors_text: 'Carmen Bravo Martín, Antonio J. Ramos Haro, Elena V. Sánchez Pinto',
    main_author_name: 'Carmen Bravo Martín',
    main_author_email: 'c.bravo@ ExtremaduraSalud.es',
    main_author_phone: '654321098',
    center: 'Centro de Salud Zafra',
    service_unit: 'Atención Primaria Extremadura',
    province: 'Badajoz',
    status: 'needs_info',
    created_at: '2026-06-19T11:45:00Z',
  },
  {
    id: '5',
    submission_code: 'P005',
    title: 'Gestión de riesgos en procesos de alta hospitalaria: análisis de incidentes y propuestas de mejora',
    modality: 'poster',
    topic_area: 'Gestión de riesgos',
    abstract_text: 'El proceso de alta hospitalaria es una de las fases con mayor riesgo de errores en la cadena asistencial. Presentamos un análisis retrospectivo de los incidentes relacionados con el proceso de alta registrados en el Sistema de Gestión de Riesgos del SES durante 24 meses. Se identificaron 287 incidentes, clasificados en categorías: comunicación incompleta (34%), medicación (28%), documentación (22%) y otros (16%). A partir del análisis se diseñaron 12 intervenciones de mejora, incluyendo checklist estandarizado, revisión farmacéutica pre-alta y llamada telefónica de seguimiento a las 48 horas. La implementación preliminar muestra una reducción del 42% en incidentes registrados.',
    authors_text: 'M.ª Luisa Fernández Bernal, José A. Prieto Cordero',
    main_author_name: 'M.ª Luisa Fernández Bernal',
    main_author_email: 'ml.fernandez@ ExtremaduraSalud.es',
    main_author_phone: '678901234',
    center: 'Hospital Universitario de Cáceres',
    service_unit: 'Servicio de Calidad Asistencial',
    province: 'Cáceres',
    status: 'poster_pending',
    created_at: '2026-06-17T16:20:00Z',
  },
];

export const mockReviewers: MockReviewer[] = [
  { id: 'r1', name: 'Dra. Patricia Vega Ríos', email: 'p.vega@uned.es', institution: 'Universidad de Extremadura' },
  { id: 'r2', name: 'Dr. Manuel A. Holgado Martín', email: 'm.holgado@ ExtremaduraSalud.es', institution: 'Hospital Universitario de Badajoz' },
  { id: 'r3', name: 'Dra. Ana I. Muñoz Rodríguez', email: 'a.munoz@ ExtremaduraSalud.es', institution: 'Servicio Extremeño de Salud' },
];

export const mockAssignedSubmissions = [
  { submission: mockSubmissions[0], reviewer: mockReviewers[0] },
  { submission: mockSubmissions[1], reviewer: mockReviewers[0] },
  { submission: mockSubmissions[3], reviewer: mockReviewers[0] },
];

export const topicAreas = [
  'Seguridad del paciente',
  'Continuidad asistencial',
  'Mejora de procesos',
  'Humanización',
  'Lean Healthcare',
  'Experiencia de paciente',
  'Gestión de riesgos',
  'Transiciones asistenciales',
  'Calidad asistencial',
  'Innovación sanitaria',
];

export const statusLabels: Record<string, string> = {
  received: 'Recibida',
  under_review: 'En revisión',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  needs_info: 'Info requerida',
  poster_pending: 'Póster pendiente',
  poster_received: 'Póster recibido',
  archived: 'Archivada',
};

export const modalityLabels: Record<string, string> = {
  oral: 'Comunicación oral',
  poster: 'Póster',
  communication: 'Comunicación libre',
};
