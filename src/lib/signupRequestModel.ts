export type SignupDocumentType = 'DNI' | 'NIE' | 'Pasaporte';

export type SignupMemberProfile = 'general' | 'residente' | 'estudiante' | 'jubilado';

export interface SignupFormState {
  first_name: string;
  last_name_1: string;
  last_name_2: string;
  document_type: SignupDocumentType | '';
  document_number: string;
  address_line: string;
  postal_code: string;
  city: string;
  province: string;
  email: string;
  email_confirmation: string;
  phone: string;
  professional_category: string;
  job_title: string;
  organization: string;
  quality_safety_link: string;
  member_profile: SignupMemberProfile;
  communication_consent: boolean;
  privacy_accepted: boolean;
  receipt_file: File | null;
}

export const signupInitialState: SignupFormState = {
  first_name: '',
  last_name_1: '',
  last_name_2: '',
  document_type: '',
  document_number: '',
  address_line: '',
  postal_code: '',
  city: '',
  province: '',
  email: '',
  email_confirmation: '',
  phone: '',
  professional_category: '',
  job_title: '',
  organization: '',
  quality_safety_link: '',
  member_profile: 'general',
  communication_consent: false,
  privacy_accepted: false,
  receipt_file: null,
};

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function normalizeDocumentNumber(value: string): string | null {
  const normalized = value.toUpperCase().trim();
  return normalized || null;
}

export function getRequestedFeeAmount(memberProfile: SignupMemberProfile): number {
  return memberProfile === 'general' ? 50 : 30;
}

export interface SignupRequestInsertPayload {
  id: string;
  first_name: string;
  last_name_1: string;
  last_name_2: string | null;
  document_type: SignupDocumentType | null;
  document_number: string | null;
  document_number_normalized: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  province: string | null;
  email: string;
  email_normalized: string;
  phone: string | null;
  professional_category: string | null;
  job_title: string | null;
  organization: string | null;
  quality_safety_link: string | null;
  member_profile: SignupMemberProfile;
  requested_fee_amount: number;
  receipt_file_path: string | null;
  accreditation_file_path: null;
  privacy_accepted_at: string;
  communication_consent: boolean;
  status: 'pending_review';
  approved_member_id: null;
  reviewed_by: null;
  reviewed_at: null;
  admin_notes: null;
  review_reason: null;
}

export function mapSignupFormToInsertPayload(
  requestId: string,
  form: SignupFormState,
  receiptFilePath: string | null,
): SignupRequestInsertPayload {
  const now = new Date().toISOString();

  return {
    id: requestId,
    first_name: form.first_name.trim(),
    last_name_1: form.last_name_1.trim(),
    last_name_2: form.last_name_2.trim() || null,
    document_type: form.document_type || null,
    document_number: form.document_number.trim() || null,
    document_number_normalized: normalizeDocumentNumber(form.document_number),
    address_line: form.address_line.trim() || null,
    postal_code: form.postal_code.trim() || null,
    city: form.city.trim() || null,
    province: form.province.trim() || null,
    email: form.email.trim(),
    email_normalized: normalizeEmail(form.email),
    phone: form.phone.trim() || null,
    professional_category: form.professional_category.trim() || null,
    job_title: form.job_title.trim() || null,
    organization: form.organization.trim() || null,
    quality_safety_link: form.quality_safety_link.trim() || null,
    member_profile: form.member_profile,
    requested_fee_amount: getRequestedFeeAmount(form.member_profile),
    receipt_file_path: receiptFilePath,
    accreditation_file_path: null,
    privacy_accepted_at: form.privacy_accepted ? now : now,
    communication_consent: form.communication_consent,
    status: 'pending_review' as const,
    approved_member_id: null,
    reviewed_by: null,
    reviewed_at: null,
    admin_notes: null,
    review_reason: null,
  };
}

const VALID_MEMBER_PROFILES: SignupMemberProfile[] = ['general', 'residente', 'estudiante', 'jubilado'];

export function validateSignupForm(form: SignupFormState, emailConfirmation: string): string | null {
  if (!form.first_name.trim()) {
    return 'El nombre es obligatorio.';
  }
  if (!form.last_name_1.trim()) {
    return 'El primer apellido es obligatorio.';
  }
  if (!form.email.trim()) {
    return 'El email es obligatorio.';
  }
  if (form.email.trim() !== emailConfirmation.trim()) {
    return 'Los correos electrónicos no coinciden.';
  }
  if (!form.privacy_accepted) {
    return 'Debes aceptar el tratamiento de datos personales.';
  }
  if (!VALID_MEMBER_PROFILES.includes(form.member_profile)) {
    return 'El tipo de cuota seleccionado no es válido.';
  }
  return null;
}
