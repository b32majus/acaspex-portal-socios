import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { MemberAccessProfile } from './memberAccessQueries';

export type CreateMemberAccessResponse = {
  ok: boolean;
  already_exists?: boolean;
  profile?: MemberAccessProfile;
  code?: string;
  message?: string;
  rollback_auth_user?: boolean;
};

export async function updateMemberAccessStatus(
  memberId: string,
  profileId: string,
  isActive: boolean,
): Promise<MemberAccessProfile> {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase no configurado');

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', profileId)
    .eq('member_id', memberId)
    .select('id, member_id, email, email_normalized, role, is_active, invited_at, last_seen_at, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as MemberAccessProfile;
}

export async function createMemberAccess(memberId: string): Promise<CreateMemberAccessResponse> {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase no configurado');

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (sessionError || !accessToken) {
    throw new Error('No hay sesión de administrador activa.');
  }

  const { data, error } = await supabase.functions.invoke<CreateMemberAccessResponse>('create-member-access', {
    body: { memberId },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) {
    throw new Error(error.message || 'Error al invocar la función de creación de acceso.');
  }

  return data as CreateMemberAccessResponse;
}
