import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { MemberRow } from './memberFormModel';
import { mapFormToMemberInsertPayload, mapFormToMemberUpdatePayload, type MemberFormState } from './memberFormModel';

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
  notes,
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

  if (error) throw error;
  return (data ?? []) as MemberRow[];
}

export async function fetchAdminMemberById(memberId: string): Promise<MemberRow | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from('members')
    .select(MEMBER_SELECT)
    .eq('id', memberId)
    .maybeSingle();

  if (error) throw error;
  return (data as MemberRow) ?? null;
}

export async function createAdminMember(form: MemberFormState): Promise<MemberRow> {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase no configurado');

  const payload = mapFormToMemberInsertPayload(form);

  const { data, error } = await supabase
    .from('members')
    .insert(payload)
    .select(MEMBER_SELECT)
    .single();

  if (error) throw error;
  return data as MemberRow;
}

export async function updateAdminMember(memberId: string, form: MemberFormState): Promise<MemberRow> {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase no configurado');

  const payload = mapFormToMemberUpdatePayload(form);

  const { data, error } = await supabase
    .from('members')
    .update(payload)
    .eq('id', memberId)
    .select(MEMBER_SELECT)
    .single();

  if (error) throw error;
  return data as MemberRow;
}

export type MemberStats = {
  total: number;
  active: number;
  pending_review: number;
  expired: number;
  inactive: number;
  cancelled: number;
};

export async function fetchAdminMemberStats(): Promise<MemberStats> {
  if (!isSupabaseConfigured() || !supabase) {
    return { total: 0, active: 0, pending_review: 0, expired: 0, inactive: 0, cancelled: 0 };
  }

  const { data, error } = await supabase
    .from('members')
    .select('status');

  if (error) throw error;

  const rows = (data ?? []) as { status: string }[];
  const stats: MemberStats = { total: rows.length, active: 0, pending_review: 0, expired: 0, inactive: 0, cancelled: 0 };
  for (const r of rows) {
    if (r.status in stats) (stats as Record<string, number>)[r.status]++;
  }
  return stats;
}
