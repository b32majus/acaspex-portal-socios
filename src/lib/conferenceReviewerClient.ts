// ACASPEX Portal Socios — Conference reviewer read-only client (B14A)
// Exposes RPC functions for authenticated reviewers to read their
// assigned submissions, submission details, and stats.
// All RPCs are SECURITY DEFINER and verify:
//   is_comite_cientifico() + is_reviewer_for_submission()
// No service_role. No secrets. No signed URLs. No file access.

import { supabase, isSupabaseConfigured } from './supabaseClient';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

/**
 * Row returned by get_assigned_submissions_for_reviewer().
 * Contains ONLY scientific content. No authorship, email, files, or admin notes.
 */
export interface ReviewerAssignedSubmissionRow {
  id: string;
  submission_code: string;
  title: string;
  topic_area: string | null;
  modality: string;
  assignment_status: string;
  assigned_at: string;
}

/**
 * Row returned by get_submission_for_reviewer(p_submission_id).
 * Full scientific content for a single submission. No authorship or files.
 */
export interface ReviewerSubmissionDetailRow {
  submission_code: string;
  title: string;
  abstract_text: string;
  topic_area: string | null;
  modality: string;
}

/**
 * Row returned by get_reviewer_stats().
 * Aggregate counts for the current reviewer.
 */
export interface ReviewerStatsRow {
  total_assigned: number;
  completed: number;
  pending: number;
}

// ═══════════════════════════════════════════════════════════════════
// LABELS
// ═══════════════════════════════════════════════════════════════════

export const modalityLabels: Record<string, string> = {
  oral: 'Comunicación oral',
  poster: 'Póster',
  communication: 'Comunicación libre',
};

export const assignmentStatusLabels: Record<string, string> = {
  assigned: 'Asignado',
  in_progress: 'En evaluación',
  completed: 'Completado',
};

// ═══════════════════════════════════════════════════════════════════
// MUTATION — Submit review (B14C-CLIENT)
// ═══════════════════════════════════════════════════════════════════

export type ConferenceReviewRecommendation = 'accept' | 'reject' | 'needs_discussion';

export interface SubmitConferenceReviewInput {
  submissionId: string;
  scoreRelevance: number | null;
  scoreMethodology: number | null;
  scoreImpact: number | null;
  scoreClarity: number | null;
  comments: string | null;
  recommendation: ConferenceReviewRecommendation | null;
}

/**
 * Submit a scientific review via atomic RPC.
 * Calls RPC: submit_conference_review(...)
 *
 * The RPC resolves reviewer_id from auth.uid() — never from frontend params.
 * Returns the review_id on success.
 *
 * Error codes from RPC:
 * - not_authorized: user is not comite_cientifico
 * - not_assigned_reviewer: user has no active assignment for this submission
 * - review_already_submitted: duplicate review (pre-check or unique_violation)
 * - invalid_score: score out of 1-5 range
 * - assignment_not_found: assignment update failed (should not happen)
 */
export async function submitConferenceReview(
  input: SubmitConferenceReviewInput,
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  const { data, error } = await supabase!.rpc('submit_conference_review', {
    p_submission_id: input.submissionId,
    p_score_relevance: input.scoreRelevance,
    p_score_methodology: input.scoreMethodology,
    p_score_impact: input.scoreImpact,
    p_score_clarity: input.scoreClarity,
    p_comments: input.comments,
    p_recommendation: input.recommendation,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

// ═══════════════════════════════════════════════════════════════════
// QUERIES (read-only RPCs)
// ═══════════════════════════════════════════════════════════════════

/**
 * Fetch all submissions assigned to the current reviewer.
 * Calls RPC: get_assigned_submissions_for_reviewer()
 *
 * Returns ONLY: submission_code, title, topic_area, modality,
 *   assignment_status, assigned_at.
 * Does NOT expose: authorship, email, center, files, admin notes.
 */
export async function fetchReviewerAssignments(): Promise<ReviewerAssignedSubmissionRow[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  const { data, error } = await supabase!.rpc('get_assigned_submissions_for_reviewer');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ReviewerAssignedSubmissionRow[];
}

/**
 * Fetch scientific content of a specific submission for the current reviewer.
 * Calls RPC: get_submission_for_reviewer(p_submission_id)
 *
 * Verifies double condition: is_comite_cientifico() + is_reviewer_for_submission().
 * Returns empty result if conditions not met.
 *
 * Returns ONLY: submission_code, title, abstract_text, topic_area, modality.
 * Does NOT expose: authorship, email, center, files, admin notes.
 */
export async function fetchReviewerSubmission(
  submissionId: string,
): Promise<ReviewerSubmissionDetailRow | null> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  const { data, error } = await supabase!.rpc('get_submission_for_reviewer', {
    p_submission_id: submissionId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ReviewerSubmissionDetailRow[];
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Fetch aggregate stats for the current reviewer.
 * Calls RPC: get_reviewer_stats()
 *
 * Returns: total_assigned, completed, pending.
 */
export async function fetchReviewerStats(): Promise<ReviewerStatsRow> {
  if (!isSupabaseConfigured()) {
    throw new Error('supabase_not_configured');
  }

  const { data, error } = await supabase!.rpc('get_reviewer_stats');

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ReviewerStatsRow[];
  if (rows.length === 0) {
    return { total_assigned: 0, completed: 0, pending: 0 };
  }

  return rows[0];
}
