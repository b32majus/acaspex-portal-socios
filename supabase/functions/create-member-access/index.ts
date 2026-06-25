import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  memberId: string
}

interface ProfileRow {
  id: string
  member_id: string | null
  email: string
  email_normalized: string
  role: 'socio' | 'junta_directiva' | 'administrador'
  is_active: boolean
  invited_at: string | null
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

interface MemberRow {
  id: string
  member_number: string
  first_name: string
  last_name_1: string
  last_name_2: string | null
  email: string | null
  status: string
  paid_until: string | null
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, code: 'method_not_allowed', message: 'Solo se admite POST.' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse({ ok: false, code: 'missing_env', message: 'Variables de entorno no configuradas.' }, 500)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ ok: false, code: 'missing_authorization', message: 'Token de autorización no proporcionado.' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify caller identity using anon client
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey ?? '', {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !authData?.user) {
      return jsonResponse({ ok: false, code: 'invalid_session', message: 'Sesión no válida.' }, 401)
    }

    const callerUserId = authData.user.id

    // Verify caller is admin via profiles table
    const { data: callerProfile, error: callerProfileError } = await supabaseClient
      .from('profiles')
      .select('id, role, is_active')
      .eq('id', callerUserId)
      .maybeSingle()

    if (callerProfileError || !callerProfile) {
      return jsonResponse({ ok: false, code: 'forbidden_not_admin', message: 'No tienes perfil de acceso.' }, 403)
    }

    if (callerProfile.role !== 'administrador') {
      return jsonResponse({ ok: false, code: 'forbidden_not_admin', message: 'Se requiere rol de administrador.' }, 403)
    }

    if (!callerProfile.is_active) {
      return jsonResponse({ ok: false, code: 'forbidden_not_admin', message: 'Tu perfil de administrador está desactivado.' }, 403)
    }

    // Parse request body
    let body: RequestBody
    try {
      body = await req.json()
    } catch {
      return jsonResponse({ ok: false, code: 'invalid_payload', message: 'Cuerpo JSON no válido.' }, 400)
    }

    if (!body.memberId || typeof body.memberId !== 'string') {
      return jsonResponse({ ok: false, code: 'invalid_payload', message: 'Se requiere memberId (uuid).' }, 400)
    }

    const memberId = body.memberId

    // Fetch member
    const { data: member, error: memberError } = await supabaseClient
      .from('members')
      .select('id, member_number, first_name, last_name_1, last_name_2, email, status, paid_until')
      .eq('id', memberId)
      .maybeSingle()

    if (memberError) {
      return jsonResponse({ ok: false, code: 'unexpected_error', message: 'Error al consultar el socio.' }, 500)
    }

    if (!member) {
      return jsonResponse({ ok: false, code: 'member_not_found', message: 'Socio no encontrado.' }, 404)
    }

    if (!member.email) {
      return jsonResponse({ ok: false, code: 'member_without_email', message: 'El socio no tiene email registrado.' }, 400)
    }

    // Validate eligibility: status = active AND paid_until >= today
    if (member.status !== 'active') {
      return jsonResponse({
        ok: false,
        code: 'member_not_eligible',
        message: 'El socio debe estar activo para crear acceso.',
      }, 400)
    }

    const today = new Date().toISOString().slice(0, 10)
    if (!member.paid_until || member.paid_until < today) {
      return jsonResponse({
        ok: false,
        code: 'member_not_eligible',
        message: 'El socio debe tener cuota vigente para crear acceso.',
      }, 400)
    }

    // Check for existing profile
    const { data: existingProfile, error: existingProfileError } = await supabaseClient
      .from('profiles')
      .select('id, member_id, email, role, is_active, invited_at, last_seen_at, created_at, updated_at')
      .eq('member_id', memberId)
      .maybeSingle()

    if (existingProfileError) {
      return jsonResponse({ ok: false, code: 'unexpected_error', message: 'Error al verificar perfil existente.' }, 500)
    }

    if (existingProfile) {
      return jsonResponse({
        ok: true,
        already_exists: true,
        profile: existingProfile,
      })
    }

    // Admin client for auth operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Create/invite auth user
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      member.email,
      {
        data: {
          member_id: member.id,
          member_number: member.member_number,
        },
      },
    )

    if (inviteError || !inviteData?.user) {
      return jsonResponse({
        ok: false,
        code: 'auth_user_creation_failed',
        message: inviteError?.message ?? 'Error al crear el usuario de autenticación.',
      }, 500)
    }

    const authUserId = inviteData.user.id
    const emailNormalized = member.email.toLowerCase().trim()

    // Create profile using the ADMIN's authenticated client (passes RLS is_admin() check).
    // supabaseAdmin (service_role) is needed for auth.admin.* but the RLS policy
    // profiles_insert_admin requires is_admin() which depends on auth.uid().
    const { data: newProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: authUserId,
        member_id: member.id,
        email: member.email,
        email_normalized: emailNormalized,
        role: 'socio',
        is_active: true,
        invited_at: new Date().toISOString(),
      })
      .select('id, member_id, email, role, is_active, invited_at, last_seen_at, created_at, updated_at')
      .single()

    if (profileError) {
      let rollbackOk = false
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUserId)
        rollbackOk = !deleteError
      } catch {
      }

      return jsonResponse({
        ok: false,
        code: 'profile_creation_failed',
        message: profileError.message,
        rollback_auth_user: rollbackOk,
      }, 500)
    }

    return jsonResponse({
      ok: true,
      already_exists: false,
      profile: newProfile,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado.'
    return jsonResponse({ ok: false, code: 'unexpected_error', message }, 500)
  }
})
