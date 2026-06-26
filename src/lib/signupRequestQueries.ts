import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface SignupRequestRow {
  id: string;
  first_name: string;
  last_name_1: string;
  last_name_2: string | null;
  document_type: 'DNI' | 'NIE' | 'Pasaporte' | null;
  document_number: string | null;
  document_number_normalized: string | null;
  email: string;
  email_normalized: string;
  phone: string | null;
  professional_category: string | null;
  organization: string | null;
  member_profile: 'general' | 'residente' | 'estudiante' | 'jubilado';
  requested_fee_amount: number | null;
  receipt_file_path: string | null;
  accreditation_file_path: string | null;
  status: 'pending_review' | 'needs_info' | 'approved' | 'rejected';
  communication_consent: boolean;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  review_reason: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  province: string | null;
  job_title: string | null;
  quality_safety_link: string | null;
  privacy_accepted_at: string | null;
  approved_member_id: string | null;
}

export type SignupStatus = SignupRequestRow['status'];

export async function fetchSignupRequests(
  status?: SignupStatus,
): Promise<SignupRequestRow[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  let query = supabase
    .from('signup_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as SignupRequestRow[]) ?? [];
}

export async function fetchSignupRequestById(id: string): Promise<SignupRequestRow | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from('signup_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as SignupRequestRow | null;
}
