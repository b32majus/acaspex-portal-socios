import { supabase, isSupabaseConfigured } from './supabaseClient';
import { fetchSignupRequestById, type SignupRequestRow } from './signupRequestQueries';
import { mapSignupRequestToMemberCreatePayload, type MemberCreatePayload } from './signupApprovalModel';

export interface ApproveSignupResult {
  ok: boolean;
  member?: MemberCreatePayload & { id: string };
  signup?: SignupRequestRow;
  code?: string;
  message: string;
}

export async function approveSignupRequest(signupId: string): Promise<ApproveSignupResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, code: 'not_configured', message: 'Supabase no configurado.' };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) {
    return { ok: false, code: 'no_session', message: 'No hay sesión de administrador activa.' };
  }

  const signup = await fetchSignupRequestById(signupId);
  if (!signup) {
    return { ok: false, code: 'not_found', message: 'Solicitud no encontrada.' };
  }

  if (signup.status !== 'pending_review') {
    if (signup.status === 'approved') {
      return {
        ok: false,
        code: 'already_approved',
        message: 'La solicitud ya está aprobada.',
      };
    }
    return {
      ok: false,
      code: 'invalid_status',
      message: `La solicitud no está pendiente de revisión (estado actual: ${signup.status}).`,
    };
  }

  if (signup.approved_member_id) {
    return {
      ok: false,
      code: 'already_approved',
      message: 'Esta solicitud ya tiene un socio vinculado.',
    };
  }

  const emailNormalized = signup.email_normalized;

  const { data: duplicateByEmail, error: dupEmailError } = await supabase
    .from('members')
    .select('id')
    .eq('email_normalized', emailNormalized)
    .maybeSingle();

  if (dupEmailError) {
    return { ok: false, code: 'unexpected_error', message: 'Error al verificar duplicados por email.' };
  }

  if (duplicateByEmail) {
    return {
      ok: false,
      code: 'duplicate_email',
      message: 'Ya existe un socio con este email.',
    };
  }

  const docNormalized = signup.document_number_normalized;

  if (docNormalized) {
    const { data: duplicateByDoc, error: dupDocError } = await supabase
      .from('members')
      .select('id')
      .eq('document_number_normalized', docNormalized)
      .maybeSingle();

    if (dupDocError) {
      return { ok: false, code: 'unexpected_error', message: 'Error al verificar duplicados por documento.' };
    }

    if (duplicateByDoc) {
      return {
        ok: false,
        code: 'duplicate_document',
        message: 'Ya existe un socio con este documento.',
      };
    }
  }

  const payload = mapSignupRequestToMemberCreatePayload(signup);

  const { data: newMember, error: insertError } = await supabase
    .from('members')
    .insert(payload)
    .select('id, first_name, last_name_1, last_name_2, member_number, status')
    .single();

  if (insertError || !newMember) {
    return {
      ok: false,
      code: 'member_creation_failed',
      message: insertError?.message || 'No se ha podido crear el socio.',
    };
  }

  const now = new Date().toISOString();

  const { data: updatedSignup, error: updateError } = await supabase
    .from('signup_requests')
    .update({
      status: 'approved',
      approved_member_id: newMember.id,
      reviewed_by: userId,
      reviewed_at: now,
    })
    .eq('id', signupId)
    .select('*')
    .single();

  if (updateError) {
    return {
      ok: true,
      member: { ...payload, id: newMember.id },
      message:
        'Socio creado, pero no se pudo actualizar el estado de la solicitud. Contacta con soporte técnico.',
    };
  }

  return {
    ok: true,
    member: { ...payload, id: newMember.id },
    signup: updatedSignup as unknown as SignupRequestRow,
    message: 'Socio creado correctamente.',
  };
}
