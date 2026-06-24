import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { MemberRow } from './memberFormModel';

const MEMBER_SELECT = `
  id,
  member_number,
  first_name,
  last_name_1,
  last_name_2,
  document_type,
  document_number,
  document_number_normalized,
  address_line,
  postal_code,
  email,
  email_normalized,
  phone,
  professional_category,
  job_title,
  organization,
  quality_safety_link,
  member_profile,
  status,
  fee_amount,
  membership_start,
  paid_until,
  communication_consent,
  privacy_accepted_at,
  legacy_member_number,
  legacy_source,
  legacy_import_batch,
  created_at,
  updated_at
`;

export async function fetchAdminMembers(): Promise<MemberRow[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('members')
    .select(MEMBER_SELECT)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as MemberRow[];
}

export async function fetchAdminMemberById(memberId: string): Promise<MemberRow | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from('members')
    .select(MEMBER_SELECT)
    .eq('id', memberId)
    .maybeSingle();

  if (error || !data) return null;
  return data as MemberRow;
}
