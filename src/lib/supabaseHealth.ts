import { supabase, isSupabaseConfigured } from './supabaseClient'

export type SupabaseHealth = {
  configured: boolean
  authReachable: boolean // indica que getSession() respondió sin error; no verifica tablas, RLS ni Storage
  session: boolean
  errors: string[]
}

export async function getSupabaseHealth(): Promise<SupabaseHealth> {
  const errors: string[] = []

  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      authReachable: false,
      session: false,
      errors: ['Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'],
    }
  }

  let authReachable = false
  let session = false

  try {
    const { data, error } = await supabase!.auth.getSession()
    if (error) {
      errors.push(`auth.getSession error: ${error.message}`)
    } else {
      authReachable = true
      session = data.session !== null
    }
  } catch (e) {
    errors.push(`auth.getSession exception: ${e instanceof Error ? e.message : String(e)}`)
  }

  return {
    configured: true,
    authReachable,
    session,
    errors,
  }
}
