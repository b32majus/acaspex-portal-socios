export type MemberStatus = 'pending_review' | 'active' | 'expired' | 'inactive' | 'cancelled';

export type MembershipType = 'general' | 'reduced';

export type ReducedFeeReason = 'resident' | 'student' | 'retired' | null;

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

export type RenewalItem = {
  memberId: string;
  fullName: string;
  status: MemberStatus;
  paidUntil: string | null;
  renewalState: 'upcoming' | 'expired' | 'not_applicable';
};

export const mockMembers: Member[] = [
  {
    id: 'mem-001',
    firstName: 'Lucía',
    lastName1: 'Morales',
    lastName2: 'Santos',
    email: 'lucia.morales@example.test',
    phone: '600000001',
    professionalCategory: 'Enfermeria',
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
    notes: 'Socia activa. Perfil referente en calidad asistencial.',
  },
  {
    id: 'mem-002',
    firstName: 'Raul',
    lastName1: 'Benitez',
    lastName2: 'Cano',
    email: 'raul.benitez@example.test',
    phone: '600000002',
    professionalCategory: 'Medicina',
    jobTitle: 'Residente de Medicina Preventiva',
    organization: 'Area Sanitaria Centro',
    qualitySafetyLink: 'Interes en indicadores de seguridad y analisis de eventos adversos.',
    membershipType: 'reduced',
    reducedFeeReason: 'resident',
    status: 'pending_review',
    joinedAt: '2026-06-10',
    paidUntil: null,
    lastPaymentAmount: 30,
    lastPaymentDate: '2026-06-10',
    communicationConsent: true,
    notes: 'Pendiente de revisar acreditacion de residente y justificante.',
  },
  {
    id: 'mem-003',
    firstName: 'Marta',
    lastName1: 'Garrido',
    lastName2: 'Lopez',
    email: 'marta.garrido@example.test',
    phone: '600000003',
    professionalCategory: 'Farmacia Hospitalaria',
    jobTitle: 'Farmaceutica especialista',
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
    notes: 'Renovacion pendiente.',
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
    organization: 'Universidad Publica de Extremadura',
    qualitySafetyLink: 'Interes formativo en cultura de seguridad y experiencia del paciente.',
    membershipType: 'reduced',
    reducedFeeReason: 'student',
    status: 'active',
    joinedAt: '2026-02-21',
    paidUntil: '2026-12-31',
    lastPaymentAmount: 30,
    lastPaymentDate: '2026-02-21',
    communicationConsent: true,
    notes: 'Acreditacion revisada.',
  },
  {
    id: 'mem-005',
    firstName: 'Andres',
    lastName1: 'Paredes',
    lastName2: 'Mora',
    email: 'andres.paredes@example.test',
    phone: '600000005',
    professionalCategory: 'Gestion sanitaria',
    jobTitle: 'Tecnico de calidad',
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
    notes: 'Inactivado por solicitud administrativa ficticia.',
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
    qualitySafetyLink: 'Participacion previa en comisiones de calidad hospitalaria.',
    membershipType: 'reduced',
    reducedFeeReason: 'retired',
    status: 'cancelled',
    joinedAt: '2026-05-03',
    paidUntil: null,
    lastPaymentAmount: null,
    lastPaymentDate: null,
    communicationConsent: false,
    notes: 'Solicitud cancelada antes de validacion.',
  },
];

export const mockRenewals: RenewalItem[] = mockMembers.map((member) => ({
  memberId: member.id,
  fullName: `${member.firstName} ${member.lastName1} ${member.lastName2}`,
  status: member.status,
  paidUntil: member.paidUntil,
  renewalState: member.status === 'expired' ? 'expired' : member.paidUntil === '2026-12-31' ? 'upcoming' : 'not_applicable',
}));

export type SocioDashboard = {
  memberNumber: string;
  status: MemberStatus;
  statusLabel: string;
  membershipTypeLabel: string;
  validUntil: string;
  lastPayment: string;
  nextRenewal: string;
  resourcesAvailable: number;
  newsThisMonth: number;
  recentTraining: number;
};

export const mockSocioDashboard: SocioDashboard = {
  memberNumber: 'ACX-0054',
  status: 'active',
  statusLabel: 'Socia activa',
  membershipTypeLabel: 'General',
  validUntil: '31/12/2026',
  lastPayment: '18/01/2026',
  nextRenewal: '01/01/2027',
  resourcesAvailable: 47,
  newsThisMonth: 3,
  recentTraining: 2,
};
