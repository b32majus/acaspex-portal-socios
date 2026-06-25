import { supabase, isSupabaseConfigured } from './supabaseClient';

export type MemberAccessProfile = {
  id: string;
  member_id: string | null;
  email: string;
  email_normalized: string;
  role: 'socio' | 'junta_directiva' | 'administrador';
  is_active: boolean;
  invited_at: string | null;
  last_seen_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function fetchMemberAccessProfile(memberId: string): Promise<MemberAccessProfile | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, member_id, email, email_normalized, role, is_active, invited_at, last_seen_at, created_at, updated_at')
    .eq('member_id', memberId)
    .maybeSingle();

  if (error) throw error;
  return data as MemberAccessProfile | null;
}
