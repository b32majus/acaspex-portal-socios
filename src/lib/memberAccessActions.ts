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
