import { isSupabaseConfigured, supabase } from './supabaseClient';

const EVENT_SLUG = 'iii-jornada-acaspex';
const SUBMISSION_FUNCTION = 'submit-conference-submission-v2';

export type SubmissionTypeV2 = 'scientific' | 'experience';
export type SubmissionTypeDatabaseV2 = 'scientific_work' | 'improvement_experience';
export type EvaluationRoundV2 = 'first' | 'second' | 'third';

export interface SubmissionAuthorV2 {
  full_name: string;
  email?: string;
  phone?: string;
  institution?: string;
  center?: string;
  service_unit?: string;
  province?: string;
}

export interface ConferenceSubmissionPayloadV2 {
  event_slug: string;
  submission_type: SubmissionTypeV2;
  title: string;
  sections: Record<string, string>;
  authors: SubmissionAuthorV2[];
  references: string[];
  center_type: 'public' | 'private' | 'charter' | 'university' | 'other';
  health_area:
    | 'badajoz'
    | 'merida'
    | 'don-benito-villanueva'
    | 'llerena-zafra'
    | 'caceres'
    | 'coria'
    | 'navalmoral-de-la-mata'
    | 'plasencia';
  main_author_is_member: boolean;
  presenter_commitment: boolean;
  no_identifying_data_confirmed: boolean;
  privacy_accepted: boolean;
  definitive_confirmed: boolean;
  website: string;
}

export interface ConferenceEventAvailabilityV2 {
  slug: string;
  title: string;
  edition_label: string;
  status: 'draft' | 'open' | 'closed' | 'reviewing' | 'completed' | 'archived';
  submission_open_at: string | null;
  submission_close_at: string | null;
  poster_deadline_at: string | null;
}

export interface SubmissionSuccessV2 {
  ok: true;
  submission_code: string;
  received_at: string;
}

export class ConferenceV2Error extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ConferenceV2Error';
  }
}

function functionConfiguration(): { url: string; key: string } {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!supabaseUrl || !key) {
    throw new ConferenceV2Error(
      'client_config_error',
      'La conexión con la plataforma científica no está configurada.',
    );
  }
  return {
    url: `${supabaseUrl}/functions/v1/${SUBMISSION_FUNCTION}`,
    key,
  };
}

async function parseFunctionResponse(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    throw new ConferenceV2Error(
      'invalid_server_response',
      'La plataforma devolvió una respuesta no válida.',
    );
  }
}

export async function fetchConferenceEventAvailabilityV2(): Promise<ConferenceEventAvailabilityV2> {
  const { url, key } = functionConfiguration();
  let response: Response;
  try {
    response = await fetch(`${url}?event_slug=${encodeURIComponent(EVENT_SLUG)}`, {
      method: 'GET',
      headers: { apikey: key },
    });
  } catch {
    throw new ConferenceV2Error(
      'network_error',
      'No se pudo consultar el estado de la convocatoria.',
    );
  }
  const body = await parseFunctionResponse(response);
  if (!response.ok || body.ok !== true || !body.event) {
    throw new ConferenceV2Error(
      typeof body.code === 'string' ? body.code : 'event_status_unavailable',
      typeof body.message === 'string'
        ? body.message
        : 'No se pudo consultar el estado de la convocatoria.',
    );
  }
  return body.event as unknown as ConferenceEventAvailabilityV2;
}

export async function submitConferenceSubmissionV2(
  payload: ConferenceSubmissionPayloadV2,
): Promise<SubmissionSuccessV2> {
  const { url, key } = functionConfiguration();
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ConferenceV2Error(
      'network_error',
      'No se pudo conectar con la plataforma. Compruebe su conexión e inténtelo de nuevo.',
    );
  }
  const body = await parseFunctionResponse(response);
  if (!response.ok || body.ok !== true || typeof body.submission_code !== 'string') {
    throw new ConferenceV2Error(
      typeof body.code === 'string' ? body.code : 'submission_failed',
      typeof body.message === 'string'
        ? body.message
        : 'No se pudo registrar el resumen.',
    );
  }
  return body as unknown as SubmissionSuccessV2;
}

export interface ReviewerAssignmentV2 {
  id: string;
  submission_code: string;
  title: string;
  submission_type: SubmissionTypeDatabaseV2;
  assignment_status: 'assigned' | 'in_progress' | 'completed';
  evaluation_round: EvaluationRoundV2;
  assigned_at: string;
}

export interface ReviewerSubmissionDetailV2 {
  submission_code: string;
  title: string;
  submission_type: SubmissionTypeDatabaseV2;
  evaluation_round: EvaluationRoundV2;
  sections: Record<string, string>;
  reference_list: string[];
}

function configuredClient() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new ConferenceV2Error(
      'client_config_error',
      'La conexión con Supabase no está configurada.',
    );
  }
  return supabase;
}

export async function fetchReviewerAssignmentsV2(): Promise<ReviewerAssignmentV2[]> {
  const { data, error } = await configuredClient().rpc(
    'get_assigned_submissions_v2_for_reviewer',
  );
  if (error) throw new ConferenceV2Error(error.code || 'reviewer_load_failed', error.message);
  return (data ?? []) as ReviewerAssignmentV2[];
}

export async function fetchReviewerSubmissionV2(
  submissionId: string,
): Promise<ReviewerSubmissionDetailV2 | null> {
  const { data, error } = await configuredClient().rpc(
    'get_conference_submission_v2_for_reviewer',
    { p_submission_id: submissionId },
  );
  if (error) throw new ConferenceV2Error(error.code || 'submission_load_failed', error.message);
  const rows = (data ?? []) as ReviewerSubmissionDetailV2[];
  return rows[0] ?? null;
}

export interface ReviewPayloadV2 {
  submissionId: string;
  scores: [number, number, number, number, number, number];
  authorRecommendations: string;
  confidentialCommitteeComment: string;
}

export async function submitConferenceReviewV2(payload: ReviewPayloadV2): Promise<string> {
  const { data, error } = await configuredClient().rpc('submit_conference_review_v2', {
    p_submission_id: payload.submissionId,
    p_score_relevance: payload.scores[0],
    p_score_intro_objectives: payload.scores[1],
    p_score_methodology: payload.scores[2],
    p_score_results: payload.scores[3],
    p_score_conclusions_applicability: payload.scores[4],
    p_score_clarity: payload.scores[5],
    p_author_recommendations: payload.authorRecommendations,
    p_confidential_committee_comment: payload.confidentialCommitteeComment,
  });
  if (error) throw new ConferenceV2Error(error.code || 'review_submit_failed', error.message);
  return data as string;
}

export interface CommitteeDashboardV2 {
  event_id: string;
  event_status: ConferenceEventAvailabilityV2['status'];
  total_submissions: number;
  scientific_count: number;
  experience_count: number;
  member_count: number;
  completed_assignments: number;
  total_assignments: number;
}

export interface CommitteeSubmissionV2 {
  submission_id: string;
  submission_code: string;
  title: string;
  submission_type: SubmissionTypeDatabaseV2;
  status: string;
  first_total: number | null;
  second_total: number | null;
  third_total: number | null;
  third_review_required: boolean;
  final_median_total: number | null;
}

export async function fetchCommitteeDashboardV2(): Promise<{
  dashboard: CommitteeDashboardV2;
  submissions: CommitteeSubmissionV2[];
}> {
  const client = configuredClient();
  const { data: dashboardData, error: dashboardError } = await client.rpc(
    'get_conference_committee_dashboard_v2',
    { p_event_slug: EVENT_SLUG },
  );
  if (dashboardError) {
    throw new ConferenceV2Error(
      dashboardError.code || 'committee_load_failed',
      dashboardError.message,
    );
  }
  const dashboard = (dashboardData ?? [])[0] as CommitteeDashboardV2 | undefined;
  if (!dashboard) {
    throw new ConferenceV2Error(
      'committee_dashboard_empty',
      'No se encontró la configuración de la III Jornada.',
    );
  }

  const { data: submissions, error: submissionsError } = await client.rpc(
    'get_conference_committee_submissions_v2',
    { p_event_id: dashboard.event_id },
  );
  if (submissionsError) {
    throw new ConferenceV2Error(
      submissionsError.code || 'committee_load_failed',
      submissionsError.message,
    );
  }
  return {
    dashboard,
    submissions: (submissions ?? []) as CommitteeSubmissionV2[],
  };
}

export const conferenceV2EventSlug = EVENT_SLUG;
