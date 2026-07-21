// ACASPEX Portal Socios — public structured submission endpoint v2.
// Parallel to submit-conference-submission (v1); it does not replace it.

import { createClient } from "jsr:@supabase/supabase-js@2.108.2";

const DEFAULT_EVENT_SLUG = "iii-jornada-acaspex";
const DEFAULT_ALLOWED_ORIGINS = [
  "https://b32majus.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

type SubmissionType = "scientific" | "experience";

interface SubmissionAuthor {
  full_name: string;
  email?: string;
  phone?: string;
  institution?: string;
  center?: string;
  service_unit?: string;
  province?: string;
}

interface SubmissionPayload {
  event_slug?: string;
  submission_type: SubmissionType;
  title: string;
  sections: Record<string, string>;
  authors: SubmissionAuthor[];
  references: string[];
  center_type: "public" | "private" | "charter" | "university" | "other";
  health_area:
    | "badajoz"
    | "merida"
    | "don-benito-villanueva"
    | "llerena-zafra"
    | "caceres"
    | "coria"
    | "navalmoral-de-la-mata"
    | "plasencia";
  main_author_is_member: boolean;
  presenter_commitment: boolean;
  no_identifying_data_confirmed: boolean;
  privacy_accepted: boolean;
  definitive_confirmed: boolean;
  website?: string;
}

interface ConferenceEventRow {
  slug: string;
  title: string;
  edition_label: string;
  status: string;
  submission_open_at: string | null;
  submission_close_at: string | null;
  poster_deadline_at: string | null;
}

function configuredOrigins(): Set<string> {
  const configured = Deno.env.get("ACASPEX_ALLOWED_ORIGINS")
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return new Set(configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS);
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const allowed = configuredOrigins();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };

  if (origin && allowed.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function response(
  req: Request,
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function errorResponse(
  req: Request,
  code: string,
  message: string,
  status = 400,
): Response {
  return response(req, { ok: false, code, message }, status);
}

function requestOriginIsAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  return !origin || configuredOrigins().has(origin);
}

function serviceKey(): string | null {
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys) as Record<string, string>;
      if (parsed.default) return parsed.default;
    } catch {
      // Fall through to the legacy hosted secret.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? null;
}

function trimRecord(value: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value).map(([key, text]) => [key, text.trim()]),
  );
}

function normalizePayload(raw: unknown): SubmissionPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;
  if (
    (source.submission_type !== "scientific" &&
      source.submission_type !== "experience") ||
    typeof source.title !== "string" ||
    !source.sections ||
    typeof source.sections !== "object" ||
    Array.isArray(source.sections) ||
    !Array.isArray(source.authors) ||
    !Array.isArray(source.references)
  ) {
    return null;
  }

  const sections = source.sections as Record<string, unknown>;
  if (Object.values(sections).some((value) => typeof value !== "string")) {
    return null;
  }
  if (
    source.authors.some(
      (author) =>
        !author ||
        typeof author !== "object" ||
        Array.isArray(author) ||
        typeof (author as Record<string, unknown>).full_name !== "string",
    )
  ) {
    return null;
  }
  if (source.references.some((reference) => typeof reference !== "string")) {
    return null;
  }

  const authors = (source.authors as Array<Record<string, unknown>>).map(
    (author) =>
      Object.fromEntries(
        Object.entries(author)
          .filter(([, value]) => typeof value === "string")
          .map(([key, value]) => [key, (value as string).trim()]),
      ) as unknown as SubmissionAuthor,
  );

  return {
    event_slug:
      typeof source.event_slug === "string"
        ? source.event_slug.trim()
        : DEFAULT_EVENT_SLUG,
    submission_type: source.submission_type,
    title: source.title.trim(),
    sections: trimRecord(sections as Record<string, string>),
    authors,
    references: (source.references as string[]).map((item) => item.trim()),
    center_type: source.center_type as SubmissionPayload["center_type"],
    health_area: source.health_area as SubmissionPayload["health_area"],
    main_author_is_member: source.main_author_is_member === true,
    presenter_commitment: source.presenter_commitment === true,
    no_identifying_data_confirmed:
      source.no_identifying_data_confirmed === true,
    privacy_accepted: source.privacy_accepted === true,
    definitive_confirmed: source.definitive_confirmed === true,
    website: typeof source.website === "string" ? source.website.trim() : "",
  };
}

function publicError(errorMessage: string): {
  code: string;
  message: string;
  status: number;
} {
  const known: Record<string, [string, string, number]> = {
    event_not_found: ["event_not_found", "Evento no encontrado.", 404],
    submissions_closed: [
      "submissions_closed",
      "El periodo de envío todavía no está abierto.",
      409,
    ],
    submissions_not_yet_open: [
      "submissions_not_yet_open",
      "El periodo de envío todavía no ha comenzado.",
      409,
    ],
    submissions_expired: [
      "submissions_expired",
      "El periodo de envío ha finalizado.",
      409,
    ],
    invalid_title_length: [
      "invalid_title_length",
      "El título debe contener entre 1 y 15 palabras.",
      400,
    ],
    invalid_abstract_length: [
      "invalid_abstract_length",
      "El resumen no puede superar las 400 palabras.",
      400,
    ],
    invalid_section_length: [
      "invalid_section_length",
      "Uno de los apartados del resumen es demasiado extenso.",
      400,
    ],
    incomplete_sections: [
      "incomplete_sections",
      "Todos los apartados del resumen son obligatorios.",
      400,
    ],
    invalid_author_count: [
      "invalid_author_count",
      "Debe indicar entre 1 y 6 autores.",
      400,
    ],
    invalid_author: [
      "invalid_author",
      "Revise los datos de autoría.",
      400,
    ],
    invalid_main_author_email: [
      "invalid_main_author_email",
      "El correo del autor principal no es válido.",
      400,
    ],
    missing_main_author_context: [
      "missing_main_author_context",
      "Faltan datos profesionales del autor principal.",
      400,
    ],
    invalid_reference_count: [
      "invalid_reference_count",
      "Solo se permiten hasta 3 referencias.",
      400,
    ],
    references_required: [
      "references_required",
      "Los trabajos científicos requieren entre 1 y 3 referencias.",
      400,
    ],
    invalid_reference: [
      "invalid_reference",
      "Las referencias no pueden estar vacías.",
      400,
    ],
    presenter_commitment_required: [
      "presenter_commitment_required",
      "Debe confirmar la disponibilidad para defender el póster.",
      400,
    ],
    no_identifying_data_confirmation_required: [
      "no_identifying_data_confirmation_required",
      "Debe confirmar que el resumen no contiene datos identificativos.",
      400,
    ],
    privacy_acceptance_required: [
      "privacy_acceptance_required",
      "Debe aceptar la política de privacidad.",
      400,
    ],
    definitive_confirmation_required: [
      "definitive_confirmation_required",
      "Debe confirmar que el envío es definitivo.",
      400,
    ],
  };

  for (const [databaseCode, [code, message, status]] of Object.entries(known)) {
    if (errorMessage.includes(databaseCode)) return { code, message, status };
  }
  return {
    code: "submission_failed",
    message: "No se pudo registrar el resumen. Inténtelo de nuevo.",
    status: 500,
  };
}

Deno.serve(async (req: Request) => {
  if (!requestOriginIsAllowed(req)) {
    return errorResponse(req, "origin_not_allowed", "Origen no autorizado.", 403);
  }
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseSecretKey = serviceKey();
  if (!supabaseUrl || !supabaseSecretKey) {
    return errorResponse(
      req,
      "service_unavailable",
      "El servicio no está disponible temporalmente.",
      503,
    );
  }

  const admin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (req.method === "GET") {
    const eventSlug =
      new URL(req.url).searchParams.get("event_slug")?.trim() ||
      DEFAULT_EVENT_SLUG;
    const { data, error } = await admin
      .from("conference_events")
      .select(
        "slug, title, edition_label, status, submission_open_at, submission_close_at, poster_deadline_at",
      )
      .eq("slug", eventSlug)
      .maybeSingle();

    if (error) {
      return errorResponse(
        req,
        "event_status_unavailable",
        "No se pudo consultar el estado de la convocatoria.",
        503,
      );
    }
    if (!data) {
      return errorResponse(req, "event_not_found", "Evento no encontrado.", 404);
    }
    return response(req, { ok: true, event: data as ConferenceEventRow });
  }

  if (req.method !== "POST") {
    return errorResponse(req, "method_not_allowed", "Método no admitido.", 405);
  }
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return errorResponse(
      req,
      "invalid_content_type",
      "Se esperaba un formulario JSON.",
      415,
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return errorResponse(req, "invalid_payload", "Formulario no válido.", 400);
  }

  const payload = normalizePayload(raw);
  if (!payload) {
    return errorResponse(req, "invalid_payload", "Formulario no válido.", 400);
  }
  if (payload.website) {
    return errorResponse(req, "invalid_payload", "Formulario no válido.", 400);
  }

  const { data, error } = await admin.rpc("submit_conference_submission_v2", {
    p_event_slug: payload.event_slug || DEFAULT_EVENT_SLUG,
    p_submission_type:
      payload.submission_type === "scientific"
        ? "scientific_work"
        : "improvement_experience",
    p_title: payload.title,
    p_sections: payload.sections,
    p_authors: payload.authors,
    p_references: payload.references,
    p_center_type: payload.center_type,
    p_health_area: payload.health_area,
    p_main_author_is_member: payload.main_author_is_member,
    p_presenter_commitment: payload.presenter_commitment,
    p_no_identifying_data_confirmed:
      payload.no_identifying_data_confirmed,
    p_privacy_accepted: payload.privacy_accepted,
    p_definitive_confirmed: payload.definitive_confirmed,
  });

  if (error) {
    const mapped = publicError(error.message);
    return errorResponse(req, mapped.code, mapped.message, mapped.status);
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.submission_code) {
    return errorResponse(
      req,
      "submission_failed",
      "No se pudo confirmar el registro del resumen.",
      500,
    );
  }

  return response(
    req,
    {
      ok: true,
      submission_code: result.submission_code,
      received_at: result.received_at,
    },
    201,
  );
});
