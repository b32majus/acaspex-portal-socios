import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { SignupFormState } from './signupRequestModel';
import {
  normalizeEmail,
  normalizeDocumentNumber,
  getRequestedFeeAmount,
} from './signupRequestModel';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function validateReceiptFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'El justificante debe ser PDF, JPG o PNG.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'El justificante no puede superar 10 MB.';
  }
  return null;
}

export interface SignupSubmitResult {
  ok: boolean;
  message: string;
}

export async function submitSignupRequest(form: SignupFormState): Promise<SignupSubmitResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, message: 'El sistema no está configurado. Inténtalo más tarde.' };
  }

  const requestId = crypto.randomUUID();
  let receiptFilePath: string | null = null;

  if (form.receipt_file) {
    const validationError = validateReceiptFile(form.receipt_file);
    if (validationError) {
      return { ok: false, message: validationError };
    }

    const ext = form.receipt_file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];
    const safeExt = allowedExts.includes(ext ?? '') ? ext : 'pdf';
    const storagePath = `signup-requests/${requestId}/payment-receipt.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from('acaspex-payment-receipts')
      .upload(storagePath, form.receipt_file, {
        contentType: form.receipt_file.type,
        upsert: false,
      });

    if (uploadError) {
      return { ok: false, message: 'No se ha podido subir el justificante. Revisa el formato o inténtalo de nuevo.' };
    }

    receiptFilePath = storagePath;
  }

  const now = new Date().toISOString();
  const memberProfile = form.member_profile;

  const { error: insertError } = await supabase.from('signup_requests').insert({
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
    member_profile: memberProfile,
    requested_fee_amount: getRequestedFeeAmount(memberProfile),
    receipt_file_path: receiptFilePath,
    accreditation_file_path: null,
    privacy_accepted_at: now,
    communication_consent: form.communication_consent,
    status: 'pending_review',
    approved_member_id: null,
    reviewed_by: null,
    reviewed_at: null,
    admin_notes: null,
    review_reason: null,
  });

  if (insertError) {
    return {
      ok: false,
      message: insertError.message?.includes('duplicate')
        ? 'Ya existe una solicitud con este correo electrónico.'
        : 'No se ha podido enviar la solicitud. Inténtalo de nuevo.',
    };
  }

  return { ok: true, message: '' };
}
