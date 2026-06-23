import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let supabaseInstance: SupabaseClient | null = null

function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  if (supabaseUrl === 'replace_me_with_supabase_url' || supabaseAnonKey === 'replace_me_with_supabase_anon_or_publishable_key') {
    return null
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  }
  return supabaseInstance
}

export const supabase = createSupabaseClient()

export function isSupabaseConfigured(): boolean {
  return supabase !== null
}
