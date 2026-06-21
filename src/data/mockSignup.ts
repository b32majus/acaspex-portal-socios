export type SignupStatus = 'pending_review' | 'active' | 'expired' | 'inactive' | 'cancelled';

export type SignupMembershipType = 'general' | 'reduced';

export type SignupReducedFeeReason = 'resident' | 'student' | 'retired' | null;

export type SignupDocumentType = 'dni' | 'nie' | 'passport';

export interface SignupRequest {
  id: string;
  firstName: string;
  lastName1: string;
  lastName2: string;
  documentType: SignupDocumentType;
  documentNumber: string;
  address: string;
  postalCode: string;
  email: string;
  emailConfirmation: string;
  phone: string;
  professionalCategory: string;
  jobTitle: string;
  organization: string;
  qualitySafetyLink: string;
  membershipType: SignupMembershipType;
  reducedFeeReason: SignupReducedFeeReason;
  transferReceiptUploaded: boolean;
  transferReceiptFileName: string | null;
  accreditationUploaded: boolean;
  accreditationFileName: string | null;
  communicationConsent: boolean;
  dataProcessingConsent: boolean;
  status: SignupStatus;
  requestedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  notes: string;
}

export const mockSignupRequests: SignupRequest[] = [
  {
    id: 'sig-001',
    firstName: 'Sofía',
    lastName1: 'Herrera',
    lastName2: 'Bravo',
    documentType: 'dni',
    documentNumber: '12345678A',
    address: 'Calle Ficticia 12, 2º B',
    postalCode: '06001',
    email: 'sofia.herrera@example.test',
    emailConfirmation: 'sofia.herrera@example.test',
    phone: '600000010',
    professionalCategory: 'Enfermería',
    jobTitle: 'Especialista en seguridad del paciente',
    organization: 'Hospital Universitario Central',
    qualitySafetyLink: 'Coordinadora de la unidad de seguridad clínica y participa en grupos de mejora.',
    membershipType: 'general',
    reducedFeeReason: null,
    transferReceiptUploaded: true,
    transferReceiptFileName: 'transferencia_sofia_herrera.pdf',
    accreditationUploaded: false,
    accreditationFileName: null,
    communicationConsent: true,
    dataProcessingConsent: true,
    status: 'pending_review',
    requestedAt: '2026-06-18T09:30:00.000Z',
    reviewedAt: null,
    reviewedBy: null,
    notes: 'Solicitud general completa. Pendiente de revisar justificante de transferencia.',
  },
  {
    id: 'sig-002',
    firstName: 'Diego',
    lastName1: 'Ortega',
    lastName2: 'Molina',
    documentType: 'nie',
    documentNumber: 'X1234567Y',
    address: 'Avenida de la Salud 45',
    postalCode: '28001',
    email: 'diego.ortega@example.test',
    emailConfirmation: 'diego.ortega@example.test',
    phone: '600000011',
    professionalCategory: 'Medicina',
    jobTitle: 'Residente de Medicina Interna',
    organization: 'Complejo Hospitalario Sur',
    qualitySafetyLink: 'Interés en protocolos de seguridad y análisis de eventos centinela.',
    membershipType: 'reduced',
    reducedFeeReason: 'resident',
    transferReceiptUploaded: true,
    transferReceiptFileName: 'resguardo_diego_ortega.png',
    accreditationUploaded: false,
    accreditationFileName: null,
    communicationConsent: true,
    dataProcessingConsent: true,
    status: 'pending_review',
    requestedAt: '2026-06-19T14:15:00.000Z',
    reviewedAt: null,
    reviewedBy: null,
    notes: 'Cuota reducida por residente. Acreditación de residencia pendiente de subir.',
  },
  {
    id: 'sig-003',
    firstName: 'Nerea',
    lastName1: 'Vidal',
    lastName2: 'Soto',
    documentType: 'dni',
    documentNumber: '87654321B',
    address: 'Plaza Mayor 8, 4º A',
    postalCode: '41001',
    email: 'nerea.vidal@example.test',
    emailConfirmation: 'nerea.vidal@example.test',
    phone: '600000012',
    professionalCategory: 'Estudiante',
    jobTitle: 'Estudiante de Grado en Enfermería',
    organization: 'Universidad Pública de Ensayo',
    qualitySafetyLink: 'Formación práctica en calidad asistencial y experiencia del paciente.',
    membershipType: 'reduced',
    reducedFeeReason: 'student',
    transferReceiptUploaded: false,
    transferReceiptFileName: null,
    accreditationUploaded: false,
    accreditationFileName: null,
    communicationConsent: true,
    dataProcessingConsent: true,
    status: 'pending_review',
    requestedAt: '2026-06-20T11:00:00.000Z',
    reviewedAt: null,
    reviewedBy: null,
    notes: 'Cuota reducida por estudiante. Falta justificante de transferencia y acreditación.',
  },
  {
    id: 'sig-004',
    firstName: 'Tomás',
    lastName1: 'Ramos',
    lastName2: 'Gil',
    documentType: 'passport',
    documentNumber: 'ABC123456',
    address: 'Calle del Pinar 22',
    postalCode: '08001',
    email: 'tomas.ramos@example.test',
    emailConfirmation: 'tomas.ramos@example.test',
    phone: '600000013',
    professionalCategory: 'Gestión sanitaria',
    jobTitle: 'Técnico de calidad',
    organization: 'Consorcio Sanitario de Prueba',
    qualitySafetyLink: 'Gestiona indicadores y planes de mejora en el área asistencial.',
    membershipType: 'general',
    reducedFeeReason: null,
    transferReceiptUploaded: true,
    transferReceiptFileName: 'comprobante_tomas_ramos.pdf',
    accreditationUploaded: false,
    accreditationFileName: null,
    communicationConsent: true,
    dataProcessingConsent: true,
    status: 'pending_review',
    requestedAt: '2026-06-21T08:45:00.000Z',
    reviewedAt: null,
    reviewedBy: null,
    notes: 'Solicitud general. Pendiente de revisión administrativa.',
  },
];
