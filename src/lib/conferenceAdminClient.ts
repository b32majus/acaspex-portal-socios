// ACASPEX Portal Socios — Conference admin client
// B11: reads conference_submissions using the authenticated Supabase client.
// RLS policy conference_submissions_select_admin enforces admin-only access.
// No service_role. No secrets. No hardcoded URLs.

import { supabase, isSupabaseConfigured } from './supabaseClient';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ConferenceSubmissionRow {
  id: string;
  event_id: string;
  submission_code: string;
  status: string;
  title: string;
  modality: string;
  topic_area: string | null;
  abstract_text: string;
  authors_text: string;
  main_author_name: string;
  main_author_email: string;
  main_author_phone: string | null;
  center: string | null;
  service_unit: string | null;
  province: string | null;
  file_path: string | null;
  file_original_name: string | null;
  file_mime_type: string | null;
  file_size: number | null;
  poster_file_path: string | null;
  poster_status: string | null;
  admin_notes: string | null;
  review_notes: string | null;
  privacy_accepted_at: string;
  communication_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmissionMetrics {
  total: number;
  received: number;
  under_review: number;
  accepted: number;
  rejected: number;
  needs_info: number;
  poster_pending: number;
  poster_received: number;
  without_file: number;
}

// ═══════════════════════════════════════════════════════════════════
// STRUCTURED LOAD ERROR (B18 — admin diagnostics)
// ═══════════════════════════════════════════════════════════════════

const MAX_DIAGNOSTIC_MESSAGE_LENGTH = 200;

// SQL fragment detection for B18 — never render raw SQL in diagnostics.
const SQL_FRAGMENT_KEYWORDS =
  /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|CREATE|ALTER|DROP|SET|INTO|TABLE)\b/gi;
const SEMICOLON_DELIMITED_SQL =
  /(?:\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|CREATE|ALTER|DROP)\b\s*;|;\s*\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|CREATE|ALTER|DROP)\b)/i;
const SQL_FRAGMENT_WINDOW = 160;

function containsSqlFragment(value: string): boolean {
  const matches = [...value.matchAll(SQL_FRAGMENT_KEYWORDS)];
  if (matches.length === 0) return false;

  // Multiple SQL keywords close together strongly suggest a query fragment.
  if (matches.length >= 2) {
    for (let i = 0; i < matches.length - 1; i++) {
      if (matches[i + 1].index! - matches[i].index! <= SQL_FRAGMENT_WINDOW) {
        return true;
      }
    }
  }

  // Semicolon-delimited SQL (e.g. injected statements separated by ';').
  return SEMICOLON_DELIMITED_SQL.test(value);
}

/**
 * Redacts token/key-like substrings and raw SQL from server messages before
 * displaying them in the UI. This is a defense-in-depth measure: the frontend
 * should never expose JWTs, API keys, bearer tokens, or database queries even
 * if a server error happens to include them.
 *
 * Heuristic:
 * - SQL syntax/query fragments are replaced by a safe Spanish placeholder.
 * - key/token/secret/auth/bearer labels followed by a value are redacted.
 * - JWT-like strings (three base64url segments separated by dots) are redacted.
 */
export function sanitizeDiagnosticMessage(raw: string | undefined | null): string {
  if (!raw) return '';

  // B18: never surface raw SQL in admin diagnostics.
  if (containsSqlFragment(raw)) {
    return 'Detalle de consulta oculto por seguridad.';
  }

  // Redact Authorization/Bearer clauses BEFORE generic label patterns.
  // Otherwise the label sanitizer can consume "Authorization: Bearer" and
  // leave the following opaque token exposed.
  const bearerClause = /\bbearer\s+\S+/gi;
  const labeledCredential =
    /([a-zA-Z0-9_-]*(key|token|secret|auth)[a-zA-Z0-9_-]*)[:=]\s*[a-zA-Z0-9_.-]+/gi;
  const jwtLike = /[a-zA-Z0-9_-]{10,}(?:\.[a-zA-Z0-9_-]{10,}){1,2}/g;

  return raw
    .replace(bearerClause, '[REDACTED]')
    .replace(labeledCredential, '[REDACTED]')
    .replace(jwtLike, '[REDACTED]')
    .slice(0, MAX_DIAGNOSTIC_MESSAGE_LENGTH)
    .trim();
}

export interface ConferenceSubmissionsLoadErrorOptions {
  message: string;
  code?: string | null;
  resource?: string;
  suggestion?: string;
  diagnosticMessage?: string;
  cause?: unknown;
}

/**
 * Structured error for failures loading the admin communications list.
 * Carries a friendly user-facing message plus bounded, redacted diagnostic
 * fields that help admins understand why Supabase/PostgREST rejected the
 * query without exposing secrets, stack traces, or raw SQL.
 */
export class ConferenceSubmissionsLoadError extends Error {
  public readonly code: string | null;
  public readonly resource: string;
  public readonly suggestion: string;
  public readonly diagnosticMessage: string;
  public readonly hasDiagnostics: boolean;

  constructor(options: ConferenceSubmissionsLoadErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = 'ConferenceSubmissionsLoadError';
    this.code = options.code ?? null;
    this.resource = options.resource ?? 'conference_submissions';
    this.suggestion =
      options.suggestion ??
      'Revisa la configuración de Supabase, las políticas RLS y el schema.';
    this.diagnosticMessage = options.diagnosticMessage ?? '';
    this.hasDiagnostics = Boolean(this.code) || this.diagnosticMessage.length > 0;
  }
}

export interface CreateConferenceSubmissionsLoadErrorOptions {
  resource?: string;
  suggestion?: string;
}

/**
 * Factory that converts a raw Supabase/PostgREST error into a safe, structured
 * load error. The original message is sanitized and truncated before being
 * surfaced in the UI.
 */
export function createConferenceSubmissionsLoadError(
  rawError: { message?: string; code?: string | null } | null | undefined,
  options?: CreateConferenceSubmissionsLoadErrorOptions,
): ConferenceSubmissionsLoadError {
  return new ConferenceSubmissionsLoadError({
    message: 'No se pudieron cargar las comunicaciones.',
    code: rawError?.code ?? null,
    resource: options?.resource ?? 'conference_submissions',
    suggestion:
      options?.suggestion ??
      'Revisa la configuración de Supabase, las políticas RLS y el schema de la tabla conference_submissions.',
    diagnosticMessage: sanitizeDiagnosticMessage(rawError?.message),
  });
}

// ═══════════════════════════════════════════════════════════════════
// LABELS
// ═══════════════════════════════════════════════════════════════════

export const statusLabels: Record<string, string> = {
  received: 'Recibida',
  under_review: 'En revisión',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  needs_info: 'Info requerida',
  poster_pending: 'Póster pendiente',
  poster_received: 'Póster recibido',
  archived: 'Archivada',
};

export const modalityLabels: Record<string, string> = {
  oral: 'Comunicación oral',
  poster: 'Póster',
  communication: 'Comunicación libre',
};

export const topicAreas = [
  'Seguridad del paciente',
  'Continuidad asistencial',
  'Mejora de procesos',
  'Humanización',
  'Lean Healthcare',
  'Experiencia de paciente',
  'Gestión de riesgos',
  'Transiciones asistenciales',
  'Calidad asistencial',
  'Innovación sanitaria',
];

// ═══════════════════════════════════════════════════════════════════
// MUTATIONS (B13 — admin actions)
// ═══════════════════════════════════════════════════════════════════

export type SubmissionStatus =
  | 'received'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'needs_info'
  | 'poster_pending'
  | 'poster_received'
  | 'archived';

export const ALL_STATUS_OPTIONS: SubmissionStatus[] = [
  'received',
  'under_review',
  'accepted',
  'rejected',
  'needs_info',
  'poster_pending',
  'poster_received',
  'archived',
];

/**
 * Update the status of a single submission.
 * RLS policy conference_submissions_update_admin enforces admin-only access.
 */
export async function updateSubmissionStatus(
  submissionId: string,
  newStatus: SubmissionStatus,
): Promise<ConferenceSubmissionRow> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  const { data, error } = await supabase!
    .from('conference_submissions')
    .update({ status: newStatus })
    .eq('id', submissionId)
    .select(SUBMISSION_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as ConferenceSubmissionRow;
}

/**
 * Update admin_notes on a single submission.
 */
export async function updateSubmissionNotes(
  submissionId: string,
  notes: string,
): Promise<ConferenceSubmissionRow> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  const { data, error } = await supabase!
    .from('conference_submissions')
    .update({ admin_notes: notes })
    .eq('id', submissionId)
    .select(SUBMISSION_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as ConferenceSubmissionRow;
}

/**
 * Combined save: update status + admin_notes in a single round-trip.
 */
export async function saveSubmissionEdit(
  submissionId: string,
  status: SubmissionStatus,
  adminNotes: string,
): Promise<ConferenceSubmissionRow> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  const { data, error } = await supabase!
    .from('conference_submissions')
    .update({ status, admin_notes: adminNotes })
    .eq('id', submissionId)
    .select(SUBMISSION_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as ConferenceSubmissionRow;
}

// ═══════════════════════════════════════════════════════════════════
// TYPES — Reviewers & Assignments (B09/B13bis)
// ═══════════════════════════════════════════════════════════════════

export interface ReviewerRow {
  id: string;
  profile_id: string | null;
  name: string;
  email: string;
  institution: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AssignmentStatus = 'assigned' | 'in_progress' | 'completed';

export interface AssignmentRow {
  id: string;
  submission_id: string;
  reviewer_id: string;
  assigned_at: string;
  assigned_by: string | null;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string;
  // Joined data from reviewer
  reviewer_name?: string;
  reviewer_email?: string;
}

export const assignmentStatusLabels: Record<AssignmentStatus, string> = {
  assigned: 'Asignado',
  in_progress: 'En evaluación',
  completed: 'Completado',
};

export const MAX_ASSIGNMENTS_PER_SUBMISSION = 2;

// ═══════════════════════════════════════════════════════════════════
// QUERIES — Reviewers & Assignments (B09/B13bis)
// ═══════════════════════════════════════════════════════════════════

/**
 * Fetch active reviewers for assignment dropdown.
 * RLS: conference_reviewers_select_admin — admin-only.
 */
export async function fetchActiveReviewers(): Promise<ReviewerRow[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  const { data, error } = await supabase!
    .from('conference_reviewers')
    .select('id, profile_id, name, email, institution, is_active, created_at, updated_at')
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ReviewerRow[];
}

/**
 * Fetch assignments for a specific submission, with reviewer info joined.
 * RLS: conference_assignments_select_admin_or_own — admin sees all.
 */
export async function fetchAssignmentsForSubmission(
  submissionId: string,
): Promise<AssignmentRow[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  const { data, error } = await supabase!
    .from('conference_submission_assignments')
    .select(`
      id,
      submission_id,
      reviewer_id,
      assigned_at,
      assigned_by,
      status,
      created_at,
      updated_at,
      reviewer:conference_reviewers(name, email)
    `)
    .eq('submission_id', submissionId)
    .order('assigned_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // Flatten the joined reviewer data
  return (data ?? []).map((row: any) => ({
    id: row.id,
    submission_id: row.submission_id,
    reviewer_id: row.reviewer_id,
    assigned_at: row.assigned_at,
    assigned_by: row.assigned_by,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reviewer_name: row.reviewer?.name ?? null,
    reviewer_email: row.reviewer?.email ?? null,
  })) as AssignmentRow[];
}

/**
 * Assign a reviewer to a submission.
 * RLS: conference_assignments_insert_admin — admin-only.
 * Application-level validation: max 2, no duplicates.
 */
export async function assignReviewer(
  submissionId: string,
  reviewerId: string,
): Promise<AssignmentRow> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  // Check current assignment count
  const existing = await fetchAssignmentsForSubmission(submissionId);
  if (existing.length >= MAX_ASSIGNMENTS_PER_SUBMISSION) {
    throw new Error('max_assignments_reached');
  }
  if (existing.some((a) => a.reviewer_id === reviewerId)) {
    throw new Error('reviewer_already_assigned');
  }

  const { data, error } = await supabase!
    .from('conference_submission_assignments')
    .insert({
      submission_id: submissionId,
      reviewer_id: reviewerId,
    })
    .select(`
      id,
      submission_id,
      reviewer_id,
      assigned_at,
      assigned_by,
      status,
      created_at,
      updated_at,
      reviewer:conference_reviewers(name, email)
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as any;
  return {
    id: row.id,
    submission_id: row.submission_id,
    reviewer_id: row.reviewer_id,
    assigned_at: row.assigned_at,
    assigned_by: row.assigned_by,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reviewer_name: row.reviewer?.name ?? null,
    reviewer_email: row.reviewer?.email ?? null,
  } as AssignmentRow;
}

/**
 * Remove an assignment only while it is still unstarted.
 * DB RLS reinforces this: DELETE is admin-only, status='assigned',
 * and no review exists for the same submission/reviewer pair.
 */
export async function removeAssignment(
  assignmentId: string,
  currentStatus: AssignmentStatus,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  if (currentStatus !== 'assigned') {
    throw new Error('cannot_remove_active_assignment');
  }

  const { data, error } = await supabase!
    .from('conference_submission_assignments')
    .delete()
    .eq('id', assignmentId)
    .eq('status', 'assigned')
    .select('id');

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error('assignment_not_removed');
  }
}

// ═══════════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════════

const SUBMISSION_SELECT = `
  id,
  event_id,
  submission_code,
  status,
  title,
  modality,
  topic_area,
  abstract_text,
  authors_text,
  main_author_name,
  main_author_email,
  main_author_phone,
  center,
  service_unit,
  province,
  file_path,
  file_original_name,
  file_mime_type,
  file_size,
  poster_file_path,
  poster_status,
  admin_notes,
  review_notes,
  privacy_accepted_at,
  communication_consent,
  created_at,
  updated_at
`.trim();

/**
 * Fetch all conference submissions for admin panel.
 * Uses authenticated Supabase client — RLS enforces admin-only access.
 */
export async function fetchConferenceSubmissions(): Promise<ConferenceSubmissionRow[]> {
  if (!isSupabaseConfigured()) {
    throw new ConferenceSubmissionsLoadError({
      message: 'No se pudieron cargar las comunicaciones.',
      code: 'supabase_not_configured',
      resource: 'conference_submissions',
      suggestion:
        'Revisa las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
    });
  }

  const { data, error } = await supabase!
    .from('conference_submissions')
    .select(SUBMISSION_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    throw createConferenceSubmissionsLoadError(error, {
      resource: 'conference_submissions',
      suggestion:
        'Revisa la configuración de Supabase, las políticas RLS y el schema de la tabla conference_submissions.',
    });
  }

  return (data ?? []) as unknown as ConferenceSubmissionRow[];
}

/**
 * Calculate metrics from submission rows.
 */
export function calculateMetrics(rows: ConferenceSubmissionRow[]): SubmissionMetrics {
  return {
    total: rows.length,
    received: rows.filter((r) => r.status === 'received').length,
    under_review: rows.filter((r) => r.status === 'under_review').length,
    accepted: rows.filter((r) => r.status === 'accepted').length,
    rejected: rows.filter((r) => r.status === 'rejected').length,
    needs_info: rows.filter((r) => r.status === 'needs_info').length,
    poster_pending: rows.filter((r) => r.status === 'poster_pending').length,
    poster_received: rows.filter((r) => r.status === 'poster_received').length,
    without_file: rows.filter((r) => !r.file_path).length,
  };
}

// ═══════════════════════════════════════════════════════════════════
// B12: SIGNED URL FOR FILE DOWNLOAD (admin-only)
// ═══════════════════════════════════════════════════════════════════

const STORAGE_BUCKET = 'acaspex-conference-submissions';
const SIGNED_URL_TTL_SECONDS = 60;

/**
 * Generate a short-lived signed URL for downloading a submission file.
 * Uses the authenticated Supabase client — storage policy enforces admin-only.
 * No service_role. No Edge Function. No migration required.
 *
 * @param filePath - path inside the bucket (e.g. "{event_id}/{code}/abstract.pdf")
 * @returns signed URL valid for 60 seconds
 * @throws if not configured, file_path is empty, or storage rejects
 */
export async function getSubmissionFileSignedUrl(filePath: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  if (!filePath) {
    throw new Error('file_path_required');
  }

  const { data, error } = await supabase!.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS);

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.signedUrl) {
    throw new Error('signed_url_not_generated');
  }

  return data.signedUrl;
}
