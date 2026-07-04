// ACASPEX Portal Socios — Edge Function: submit-conference-submission
// B08: flujo backend controlado para envío de comunicaciones a jornadas.
// Acepta POST multipart/form-data con campos obligatorios + archivo PDF/DOCX.
// Resuelve event_id desde slug, inserta submission (trigger genera P001),
// sube archivo al bucket acaspex-conference-submissions, actualiza file_path,
// y devuelve submission_code al autor.
// No expone stack traces. No commitea secrets. No toca Supabase remoto.
// Rama: work/acaspex-jornadas-pending-review-20260626

import { createClient } from "jsr:@supabase/supabase-js@2";

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const BUCKET_NAME = "acaspex-conference-submissions";
const DEFAULT_EVENT_SLUG = "iii-jornada-acaspex";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx"]);

// CORS: Access-Control-Allow-Origin: "*" is acceptable for local/review
// but MUST be hardened before production (restrict to known origins).
// TODO(B08-PROD): replace "*" with specific origin(s) or use Supabase edge config.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface SubmissionFields {
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
  privacy_accepted: string;
  communication_consent: string;
  event_slug: string;
}

interface ConferenceEventRow {
  id: string;
  slug: string;
  status: string;
  submission_open_at: string | null;
  submission_close_at: string | null;
}

interface SubmissionInsertRow {
  id: string;
  submission_code: string;
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function err(code: string, message: string, status = 400): Response {
  return json({ ok: false, code, message }, status);
}

function extFromMime(mime: string): string {
  if (mime === "application/pdf") return "pdf";
  if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx";
  return "";
}

function extFromFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot + 1).toLowerCase();
}

// ═══════════════════════════════════════════════════════════════════
// MULTIPART PARSER (Deno std)
// ═══════════════════════════════════════════════════════════════════

async function parseMultipart(
  req: Request
): Promise<{ fields: SubmissionFields; file: File }> {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    throw new Error("content_type_not_multipart");
  }

  const formData = await req.formData();

  const get = (key: string): string => {
    const v = formData.get(key);
    return typeof v === "string" ? v.trim() : "";
  };

  const fields: SubmissionFields = {
    title: get("title"),
    modality: get("modality"),
    topic_area: get("topic_area"),
    abstract_text: get("abstract_text"),
    authors_text: get("authors_text"),
    main_author_name: get("main_author_name"),
    main_author_email: get("main_author_email"),
    main_author_phone: get("main_author_phone"),
    center: get("center"),
    service_unit: get("service_unit"),
    province: get("province"),
    privacy_accepted: get("privacy_accepted"),
    communication_consent: get("communication_consent"),
    event_slug: get("event_slug") || DEFAULT_EVENT_SLUG,
  };

  const fileVal = formData.get("file");
  if (!fileVal || typeof fileVal === "string" || !(fileVal instanceof File)) {
    throw new Error("missing_file");
  }

  return { fields, file: fileVal };
}

// ═══════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════

function validateFields(f: SubmissionFields): string | null {
  const required: [keyof SubmissionFields, string][] = [
    ["title", "Título"],
    ["modality", "Modalidad"],
    ["topic_area", "Área temática"],
    ["abstract_text", "Resumen"],
    ["authors_text", "Autores"],
    ["main_author_name", "Nombre del autor principal"],
    ["main_author_email", "Email del autor principal"],
    ["center", "Centro"],
    ["service_unit", "Unidad de servicio"],
    ["province", "Provincia"],
  ];

  for (const [key, label] of required) {
    if (!f[key]) return `Campo obligatorio: ${label}.`;
  }

  if (!f.privacy_accepted || f.privacy_accepted !== "true") {
    return "Debe aceptar la política de privacidad.";
  }

  const validModalities = ["oral", "poster", "communication"];
  if (!validModalities.includes(f.modality)) {
    return `Modalidad no válida. Use: ${validModalities.join(", ")}.`;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(f.main_author_email)) {
    return "Email del autor principal no válido.";
  }

  return null;
}

function validateFile(
  file: File
): { ok: true } | { ok: false; code: string; message: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      code: "file_too_large",
      message: `El archivo supera el límite de ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
    };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      code: "invalid_mime_type",
      message: "Solo se aceptan archivos PDF y DOCX.",
    };
  }

  const ext = extFromFilename(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      ok: false,
      code: "invalid_extension",
      message: "Extensión no válida. Use .pdf o .docx.",
    };
  }

  // Cross-check MIME vs extension
  const mimeExt = extFromMime(file.type);
  if (mimeExt !== ext) {
    return {
      ok: false,
      code: "mime_extension_mismatch",
      message: "La extensión del archivo no coincide con su contenido.",
    };
  }

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return err("method_not_allowed", "Solo se admite POST.", 405);
  }

  // ── Env vars ──────────────────────────────────────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return err("missing_env", "Variables de entorno no configuradas.", 500);
  }

  try {
    // ── Parse multipart ─────────────────────────────────────────
    let fields: SubmissionFields;
    let file: File;
    try {
      ({ fields, file } = await parseMultipart(req));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "parse_error";
      if (msg === "content_type_not_multipart") {
        return err("invalid_content_type", "Se espera multipart/form-data.", 400);
      }
      if (msg === "missing_file") {
        return err("missing_file", "Archivo adjunto requerido (PDF o DOCX).", 400);
      }
      return err("invalid_payload", "No se pudo procesar el formulario.", 400);
    }

    // ── Validate fields ─────────────────────────────────────────
    const fieldError = validateFields(fields);
    if (fieldError) return err("validation_error", fieldError, 400);

    // ── Validate file ───────────────────────────────────────────
    const fileCheck = validateFile(file);
    if (!fileCheck.ok) return err(fileCheck.code, fileCheck.message, 400);

    // ── Client ──────────────────────────────────────────────────
    // Service_role client used for all DB operations (INSERT + SELECT + UPDATE).
    // RLS is bypassed server-side; input validation in this function enforces
    // the same constraints that the anon INSERT policy would check.
    // anon client is NOT used: conference_submissions has no SELECT policy
    // for anon (only admin), so anon .select() would fail by RLS.
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // ── Resolve event ───────────────────────────────────────────
    const { data: event, error: eventError } = await supabaseAdmin
      .from("conference_events")
      .select("id, slug, status, submission_open_at, submission_close_at")
      .eq("slug", fields.event_slug)
      .maybeSingle();

    if (eventError) {
      return err("unexpected_error", "Error al consultar el evento.", 500);
    }
    if (!event) {
      return err("event_not_found", "Evento no encontrado.", 404);
    }

    const ev = event as ConferenceEventRow;

    // ── Check event allows submissions ──────────────────────────
    if (ev.status !== "open") {
      return err(
        "submissions_closed",
        "Este evento no está aceptando comunicaciones actualmente.",
        400
      );
    }

    const now = new Date();
    if (ev.submission_open_at && now < new Date(ev.submission_open_at)) {
      return err(
        "submissions_not_yet_open",
        "El periodo de envío de comunicaciones aún no ha comenzado.",
        400
      );
    }
    if (ev.submission_close_at && now > new Date(ev.submission_close_at)) {
      return err(
        "submissions_expired",
        "El periodo de envío de comunicaciones ha cerrado.",
        400
      );
    }

    // ── INSERT submission (trigger generates P001) ──────────────
    // Uses service_role client (supabaseAdmin) to bypass RLS.
    // The Edge Function enforces the same constraints as the anon INSERT
    // policy (status=received, no admin fields, no file_path, etc.).
    // The trigger set_conference_submission_code_before_insert
    // always overwrites submission_code, ignoring any client value.
    const privacyAcceptedAt = now.toISOString();
    const commConsent = fields.communication_consent === "true";

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from("conference_submissions")
      .insert({
        event_id: ev.id,
        title: fields.title,
        modality: fields.modality,
        topic_area: fields.topic_area || null,
        abstract_text: fields.abstract_text,
        authors_text: fields.authors_text,
        main_author_name: fields.main_author_name,
        main_author_email: fields.main_author_email,
        main_author_phone: fields.main_author_phone || null,
        center: fields.center,
        service_unit: fields.service_unit,
        province: fields.province,
        privacy_accepted_at: privacyAcceptedAt,
        communication_consent: commConsent,
      })
      .select("id, submission_code")
      .single();

    if (insertError) {
      return err(
        "submission_insert_failed",
        "No se pudo registrar la comunicación. Inténtelo de nuevo.",
        500
      );
    }

    const submission = insertData as SubmissionInsertRow;
    const submissionCode = submission.submission_code;
    const submissionId = submission.id;

    // ── Build file path ─────────────────────────────────────────
    // Path: {event_id}/{submission_code}/abstract.{ext}
    const ext = extFromMime(file.type);
    const filePath = `${ev.id}/${submissionCode}/abstract.${ext}`;

    // ── Upload file to storage ──────────────────────────────────
    // Using service_role client to bypass storage policies.
    // The bucket is private; only signed URLs or admin access works.
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // Rollback: delete the submission row since file upload failed
      await supabaseAdmin
        .from("conference_submissions")
        .delete()
        .eq("id", submissionId);

      return err(
        "file_upload_failed",
        "No se pudo subir el archivo. Inténtelo de nuevo.",
        500
      );
    }

    // ── Update submission with file metadata ────────────────────
    // Using service_role because anon UPDATE policy doesn't exist for this table.
    const { error: updateError } = await supabaseAdmin
      .from("conference_submissions")
      .update({
        file_path: filePath,
        file_original_name: file.name,
        file_mime_type: file.type,
        file_size: file.size,
      })
      .eq("id", submissionId);

    if (updateError) {
      // Full rollback: delete uploaded file + submission row
      // to avoid orphaned data (file without metadata reference,
      // or submission without associated file).
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([filePath]);
      await supabaseAdmin
        .from("conference_submissions")
        .delete()
        .eq("id", submissionId);

      return err(
        "metadata_update_failed",
        "No se pudieron guardar los metadatos del archivo. La comunicación no fue registrada.",
        500
      );
    }

    // ── Success response ────────────────────────────────────────
    return json({
      ok: true,
      submission_code: submissionCode,
      title: fields.title,
      received_at: privacyAcceptedAt,
    });
  } catch (err_: unknown) {
    // Never expose internal errors
    const message =
      err_ instanceof Error ? "Error interno del servidor." : "Error inesperado.";
    return json({ ok: false, code: "unexpected_error", message }, 500);
  }
});
