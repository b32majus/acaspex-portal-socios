import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { SignupFormState } from './signupRequestModel';
import {
  mapSignupFormToInsertPayload,
  validateSignupForm,
} from './signupRequestModel';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function validateReceiptFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'El justificante debe ser PDF, JPG o PNG.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'El justificante no puede superar 10 MB.';
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return 'La extensión del justificante no es válida. Usa PDF, JPG o PNG.';
  }
  return null;
}

export interface SignupSubmitResult {
  ok: boolean;
  message: string;
}

export async function submitSignupRequest(
  form: SignupFormState,
  emailConfirmation: string,
): Promise<SignupSubmitResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, message: 'El sistema no está configurado. Inténtalo más tarde.' };
  }

  const validationError = validateSignupForm(form, emailConfirmation);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  if (form.receipt_file) {
    const fileError = validateReceiptFile(form.receipt_file);
    if (fileError) {
      return { ok: false, message: fileError };
    }
  }

  const requestId = crypto.randomUUID();
  let receiptFilePath: string | null = null;

  if (form.receipt_file) {
    const ext = form.receipt_file.name.split('.').pop()?.toLowerCase() ?? 'pdf';
    const safeExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : 'pdf';
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

  const payload = mapSignupFormToInsertPayload(requestId, form, receiptFilePath);

  const { error: insertError } = await supabase.from('signup_requests').insert(payload);

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
