import type { SignupRequestRow } from './signupRequestQueries';

export interface MemberCreatePayload {
  first_name: string;
  last_name_1: string;
  last_name_2: string | null;
  document_type: 'DNI' | 'NIE' | 'Pasaporte' | null;
  document_number: string | null;
  document_number_normalized: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  province: string | null;
  email: string | null;
  email_normalized: string;
  phone: string | null;
  professional_category: string | null;
  job_title: string | null;
  organization: string | null;
  quality_safety_link: string | null;
  member_profile: 'general' | 'residente' | 'estudiante' | 'jubilado';
  status: 'active';
  fee_amount: number;
  communication_consent: boolean;
  privacy_accepted_at: string | null;
  notes: string | null;
  payment_receipt_file_path: string | null;
  reduced_fee_accreditation_file_path: string | null;
}

export function mapSignupRequestToMemberCreatePayload(
  signup: SignupRequestRow,
): MemberCreatePayload {
  return {
    first_name: signup.first_name,
    last_name_1: signup.last_name_1,
    last_name_2: signup.last_name_2,
    document_type: signup.document_type,
    document_number: signup.document_number,
    document_number_normalized: signup.document_number
      ? signup.document_number.toUpperCase().trim()
      : null,
    address_line: signup.address_line,
    postal_code: signup.postal_code,
    city: signup.city,
    province: signup.province,
    email: signup.email || null,
    email_normalized: signup.email.toLowerCase().trim(),
    phone: signup.phone,
    professional_category: signup.professional_category,
    job_title: signup.job_title,
    organization: signup.organization,
    quality_safety_link: signup.quality_safety_link,
    member_profile: signup.member_profile,
    status: 'active',
    fee_amount: signup.requested_fee_amount ?? (signup.member_profile === 'general' ? 50 : 30),
    communication_consent: signup.communication_consent,
    privacy_accepted_at: signup.privacy_accepted_at || null,
    notes: signup.admin_notes || null,
    payment_receipt_file_path: signup.receipt_file_path,
    reduced_fee_accreditation_file_path: signup.accreditation_file_path,
  };
}
