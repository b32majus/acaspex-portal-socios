// ACASPEX Portal Socios — Conference submission client
// B07: calls the submit-conference-submission Edge Function via multipart/form-data.
// Uses VITE_SUPABASE_URL (public) + VITE_SUPABASE_ANON_KEY (public) from env.
// No service_role. No secrets. No hardcoded URLs.

const FUNCTION_NAME = 'submit-conference-submission';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface SubmissionFormData {
  title: string;
  modality: string;
  topic_area: string;
  abstract_text: string;
  authors_text: string;
  main_author_name: string;
  main_author_email: string;
  main_author_phone: string;
  center: string;
  service_unit: string;
  province: string;
  privacy_accepted: boolean;
  communication_consent: boolean;
  event_slug: string;
  file: File | null;
}

export interface SubmissionSuccess {
  ok: true;
  submission_code: string;
  title: string;
  received_at: string;
}

export interface SubmissionError {
  ok: false;
  code: string;
  message: string;
}

export type SubmissionResult = SubmissionSuccess | SubmissionError;

// ═══════════════════════════════════════════════════════════════════
// ERROR CODE → USER MESSAGE MAP
// ═══════════════════════════════════════════════════════════════════

const ERROR_MESSAGES: Record<string, string> = {
  validation_error: 'Revise los campos obligatorios. Todos los datos son necesarios para el registro.',
  missing_file: 'Debe adjuntar un archivo PDF o DOCX con su comunicación.',
  file_too_large: 'El archivo supera el límite de 10 MB. Comprima o reduzca el documento.',
  invalid_mime_type: 'Solo se aceptan archivos PDF y DOCX. No envíe imágenes, ZIP u otros formatos.',
  invalid_extension: 'Extensión no válida. Use archivos .pdf o .docx.',
  mime_extension_mismatch: 'El tipo de archivo no coincide con su extensión. Verifique el documento.',
  event_not_found: 'Evento no encontrado. Verifique que el enlace de envío es correcto.',
  submissions_closed: 'Este evento no está aceptando comunicaciones actualmente.',
  submissions_not_yet_open: 'El periodo de envío de comunicaciones aún no ha comenzado.',
  submissions_expired: 'El plazo de envío de comunicaciones ha finalizado.',
  submission_insert_failed: 'No se pudo registrar la comunicación. Inténtelo de nuevo.',
  file_upload_failed: 'No se pudo subir el archivo. Verifique su conexión e inténtelo de nuevo.',
  metadata_update_failed: 'Error interno al guardar. La comunicación no fue registrada. Contacte con secretaría.',
  invalid_content_type: 'Formato de envío no válido. Use el formulario web.',
  network_error: 'Error de conexión. Verifique su conexión a internet e inténtelo de nuevo.',
  client_config_error: 'Configuración del cliente no disponible. Contacte con el administrador.',
  invalid_payload: 'Datos del formulario no válidos. Revise los campos e inténtelo de nuevo.',
  method_not_allowed: 'Método no permitido. Use el formulario web para enviar su comunicación.',
  missing_env: 'Variables de entorno no configuradas. Contacte con el administrador.',
  unexpected_error: 'Error inesperado. Si persiste, contacte con la secretaría de ACASPEX.',
};

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? 'Error desconocido. Contacte con la secretaría de ACASPEX.';
}

// ═══════════════════════════════════════════════════════════════════
// CLIENT
// ═══════════════════════════════════════════════════════════════════

/**
 * Submit a conference communication to the Edge Function.
 * Sends multipart/form-data with fields + file.
 * Returns controlled JSON (no stack traces).
 */
export async function submitConferenceCommunication(
  data: SubmissionFormData
): Promise<SubmissionResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      code: 'client_config_error',
      message: 'Configuración del cliente no disponible. Contacte con el administrador.',
    };
  }

  if (!data.file) {
    return {
      ok: false,
      code: 'missing_file',
      message: 'Debe adjuntar un archivo PDF o DOCX con su comunicación.',
    };
  }

  // Build multipart form data
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('modality', data.modality);
  formData.append('topic_area', data.topic_area);
  formData.append('abstract_text', data.abstract_text);
  formData.append('authors_text', data.authors_text);
  formData.append('main_author_name', data.main_author_name);
  formData.append('main_author_email', data.main_author_email);
  if (data.main_author_phone) formData.append('main_author_phone', data.main_author_phone);
  formData.append('center', data.center);
  formData.append('service_unit', data.service_unit);
  formData.append('province', data.province);
  formData.append('privacy_accepted', String(data.privacy_accepted));
  formData.append('communication_consent', String(data.communication_consent));
  formData.append('event_slug', data.event_slug);
  formData.append('file', data.file);

  const functionUrl = `${supabaseUrl}/functions/v1/${FUNCTION_NAME}`;

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: formData,
    });

    // Parse JSON response (Edge Function always returns JSON)
    let body: SubmissionResult;
    try {
      body = await response.json();
    } catch {
      return {
        ok: false,
        code: 'unexpected_error',
        message: 'Respuesta no válida del servidor.',
      };
    }

    return body;
  } catch {
    // Network error, timeout, etc.
    return {
      ok: false,
      code: 'network_error',
      message: 'Error de conexión. Verifique su conexión a internet e inténtelo de nuevo.',
    };
  }
}
