import type { DocumentType, MemberProfile, MemberStatus } from './memberFormOptions';

export type { DocumentType, MemberProfile, MemberStatus };

export type MemberFormState = {
  memberNumber: string;
  firstName: string;
  lastName1: string;
  lastName2: string;
  documentType: DocumentType | '';
  documentNumber: string;
  addressLine: string;
  postalCode: string;
  email: string;
  phone: string;
  professionalCategory: string;
  jobTitle: string;
  organization: string;
  qualitySafetyLink: string;
  memberProfile: MemberProfile | '';
  status: MemberStatus;
  communicationConsent: boolean;
  privacyAcceptedAt: string;
  feeAmount: number;
  membershipStart: string;
  paidUntil: string;
  notes: string;
  legacyMemberNumber: string;
  legacySource: string;
  legacyImportBatch: string;
};

export function createEmptyMemberFormState(): MemberFormState {
  return {
    memberNumber: '',
    firstName: '',
    lastName1: '',
    lastName2: '',
    documentType: '',
    documentNumber: '',
    addressLine: '',
    postalCode: '',
    email: '',
    phone: '',
    professionalCategory: '',
    jobTitle: '',
    organization: '',
    qualitySafetyLink: '',
    memberProfile: 'general',
    status: 'pending_review',
    communicationConsent: false,
    privacyAcceptedAt: '',
    feeAmount: 50,
    membershipStart: '',
    paidUntil: '',
    notes: '',
    legacyMemberNumber: '',
    legacySource: '',
    legacyImportBatch: '',
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeDocumentNumber(documentNumber: string): string {
  return documentNumber.trim().toUpperCase().replace(/[\s.\-]/g, '');
}

export function getFeeAmountForMemberProfile(profile: MemberProfile | ''): number {
  if (profile === 'general') return 50;
  if (profile === 'residente' || profile === 'estudiante' || profile === 'jubilado') return 30;
  return 50;
}

export function calculatePaidUntilFromStartDate(startDate: string): string {
  if (!startDate) return '';
  const date = new Date(startDate + 'T00:00:00');
  if (isNaN(date.getTime())) return '';
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
}

export function mapDocumentTypeToDb(value: DocumentType | ''): 'DNI' | 'NIE' | 'Pasaporte' | null {
  if (value === 'dni') return 'DNI';
  if (value === 'nie') return 'NIE';
  if (value === 'passport') return 'Pasaporte';
  return null;
}

export function mapDocumentTypeFromDb(value: string | null): DocumentType | '' {
  if (value === 'DNI') return 'dni';
  if (value === 'NIE') return 'nie';
  if (value === 'Pasaporte') return 'passport';
  return '';
}

export type MemberRow = Record<string, unknown> & {
  id: string;
  member_number: string | null;
  first_name: string;
  last_name_1: string;
  last_name_2: string | null;
  document_type: string | null;
  document_number: string | null;
  address_line: string | null;
  postal_code: string | null;
  email: string | null;
  phone: string | null;
  professional_category: string | null;
  job_title: string | null;
  organization: string | null;
  quality_safety_link: string | null;
  member_profile: string | null;
  status: string;
  fee_amount: number | null;
  membership_start: string | null;
  paid_until: string | null;
  communication_consent: boolean | null;
  privacy_accepted_at: string | null;
  legacy_member_number: string | null;
  legacy_source: string | null;
  legacy_import_batch: string | null;
  created_at: string;
  updated_at: string;
};

export function mapMemberRowToForm(row: MemberRow): MemberFormState {
  return {
    memberNumber: row.member_number || '',
    firstName: row.first_name || '',
    lastName1: row.last_name_1 || '',
    lastName2: row.last_name_2 || '',
    documentType: mapDocumentTypeFromDb(row.document_type),
    documentNumber: row.document_number || '',
    addressLine: row.address_line || '',
    postalCode: row.postal_code || '',
    email: row.email || '',
    phone: row.phone || '',
    professionalCategory: row.professional_category || '',
    jobTitle: row.job_title || '',
    organization: row.organization || '',
    qualitySafetyLink: row.quality_safety_link || '',
    memberProfile: (row.member_profile as MemberProfile) || '',
    status: row.status as MemberStatus,
    communicationConsent: row.communication_consent || false,
    privacyAcceptedAt: row.privacy_accepted_at || '',
    feeAmount: row.fee_amount || 50,
    membershipStart: row.membership_start || '',
    paidUntil: row.paid_until || '',
    notes: ((row as Record<string, unknown>).notes as string) || '',
    legacyMemberNumber: row.legacy_member_number || '',
    legacySource: row.legacy_source || '',
    legacyImportBatch: row.legacy_import_batch || '',
  };
}

export function mapFormToMemberInsertPayload(form: MemberFormState): Record<string, unknown> {
  const email = form.email.trim();
  const documentNumber = form.documentNumber.trim();
  const memberProfile = (form.memberProfile || 'general') as MemberProfile;
  const feeAmount = getFeeAmountForMemberProfile(memberProfile);

  return {
    member_number: form.memberNumber.trim() || null,

    first_name: form.firstName.trim(),
    last_name_1: form.lastName1.trim(),
    last_name_2: form.lastName2.trim() || null,

    document_type: mapDocumentTypeToDb(form.documentType),
    document_number: documentNumber || null,
    document_number_normalized: documentNumber ? normalizeDocumentNumber(documentNumber) : null,

    address_line: form.addressLine.trim() || null,
    postal_code: form.postalCode.trim() || null,

    email: email || null,
    email_normalized: normalizeEmail(email),

    phone: form.phone.trim() || null,
    professional_category: form.professionalCategory || null,
    job_title: form.jobTitle.trim() || null,
    organization: form.organization || null,
    quality_safety_link: form.qualitySafetyLink.trim() || null,
    member_profile: memberProfile,
    status: form.status,
    fee_amount: feeAmount,
    membership_start: form.membershipStart || null,
    paid_until: form.paidUntil || null,
    notes: form.notes.trim() || null,
    communication_consent: form.communicationConsent,
    privacy_accepted_at: form.privacyAcceptedAt || null,
    legacy_member_number: form.legacyMemberNumber || null,
    legacy_source: form.legacySource || null,
    legacy_import_batch: form.legacyImportBatch || null,
  };
}

export function mapFormToMemberUpdatePayload(form: MemberFormState): Record<string, unknown> {
  const email = form.email.trim();
  const documentNumber = form.documentNumber.trim();
  const memberProfile = (form.memberProfile || 'general') as MemberProfile;
  const feeAmount = getFeeAmountForMemberProfile(memberProfile);

  return {
    member_number: form.memberNumber.trim() || null,

    first_name: form.firstName.trim(),
    last_name_1: form.lastName1.trim(),
    last_name_2: form.lastName2.trim() || null,

    document_type: mapDocumentTypeToDb(form.documentType),
    document_number: documentNumber || null,
    document_number_normalized: documentNumber ? normalizeDocumentNumber(documentNumber) : null,

    address_line: form.addressLine.trim() || null,
    postal_code: form.postalCode.trim() || null,

    email: email || null,
    email_normalized: normalizeEmail(email),

    phone: form.phone.trim() || null,
    professional_category: form.professionalCategory || null,
    job_title: form.jobTitle.trim() || null,
    organization: form.organization || null,
    quality_safety_link: form.qualitySafetyLink.trim() || null,
    member_profile: memberProfile,
    status: form.status,
    fee_amount: feeAmount,
    notes: form.notes.trim() || null,
    communication_consent: form.communicationConsent,
  };
}
