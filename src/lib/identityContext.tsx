import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import { useAuth } from './authContext'

export type IdentityStatus =
  | 'loading'
  | 'not_authenticated'
  | 'authenticated_no_profile'
  | 'authenticated_no_member'
  | 'member_inactive'
  | 'member_expired'
  | 'member_active'
  | 'board_member'
  | 'admin'
  | 'error'

export type IdentityState = {
  status: IdentityStatus
  role: string | null
  isMemberActive: boolean
  isFeeCurrent: boolean
  canAccessMemberArea: boolean
  canAccessBoardArea: boolean
  canAccessAdmin: boolean
  loading: boolean
  error: string | null
}

const IdentityContext = createContext<IdentityState>({
  status: 'loading',
  role: null,
  isMemberActive: false,
  isFeeCurrent: false,
  canAccessMemberArea: false,
  canAccessBoardArea: false,
  canAccessAdmin: false,
  loading: true,
  error: null,
})

export function IdentityProvider({ children }: { children: ReactNode }) {
  const { session, loading: sessionLoading } = useAuth()
  const [state, setState] = useState<IdentityState>({
    status: 'loading',
    role: null,
    isMemberActive: false,
    isFeeCurrent: false,
    canAccessMemberArea: false,
    canAccessBoardArea: false,
    canAccessAdmin: false,
    loading: true,
    error: null,
  })

  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (sessionLoading) return

    if (!session || !configured) {
      setState({
        status: 'not_authenticated',
        role: null,
        isMemberActive: false,
        isFeeCurrent: false,
        canAccessMemberArea: false,
        canAccessBoardArea: false,
        canAccessAdmin: false,
        loading: false,
        error: null,
      })
      return
    }

    let cancelled = false

    async function loadIdentity() {
      try {
        const { data: profile, error: profileError } = await supabase!
          .from('profiles')
          .select('id, role, is_active, member_id, members(id, status, paid_until)')
          .eq('id', session!.user.id)
          .single()

        if (cancelled) return

        if (profileError || !profile) {
          setState({
            status: 'authenticated_no_profile',
            role: null,
            isMemberActive: false,
            isFeeCurrent: false,
            canAccessMemberArea: false,
            canAccessBoardArea: false,
            canAccessAdmin: false,
            loading: false,
            error: profileError ? profileError.message : null,
          })
          return
        }

        if (!profile.is_active) {
          setState({
            status: 'authenticated_no_profile',
            role: null,
            isMemberActive: false,
            isFeeCurrent: false,
            canAccessMemberArea: false,
            canAccessBoardArea: false,
            canAccessAdmin: false,
            loading: false,
            error: null,
          })
          return
        }

        const role = (profile as Record<string, unknown>).role as string
        const embeddedMember = (profile as Record<string, unknown>).members
        const member: { id: string; status: string; paid_until: string | null } | null =
          Array.isArray(embeddedMember)
            ? (embeddedMember as Array<{ id: string; status: string; paid_until: string | null }>)[0] ?? null
            : (embeddedMember as { id: string; status: string; paid_until: string | null } | null)

        const isAdmin = role === 'administrador'
        const isBoard = role === 'junta_directiva'

        if (!member) {
          setState({
            status: isAdmin ? 'admin' : 'authenticated_no_member',
            role,
            isMemberActive: false,
            isFeeCurrent: false,
            canAccessMemberArea: false,
            canAccessBoardArea: false,
            canAccessAdmin: isAdmin,
            loading: false,
            error: null,
          })
          return
        }

        const today = new Date().toISOString().slice(0, 10)
        const isActive = member.status === 'active'
        const feeCurrent = member.paid_until !== null && member.paid_until >= today
        const memberActive = isActive && feeCurrent

        let status: IdentityStatus
        if (isAdmin) {
          status = 'admin'
        } else if (isBoard) {
          status = memberActive ? 'board_member' : 'member_expired'
        } else if (!isActive) {
          status = 'member_inactive'
        } else if (!feeCurrent) {
          status = 'member_expired'
        } else {
          status = 'member_active'
        }

        setState({
          status,
          role,
          isMemberActive: isActive,
          isFeeCurrent: feeCurrent,
          canAccessMemberArea: memberActive,
          canAccessBoardArea: (isBoard || isAdmin) && memberActive,
          canAccessAdmin: isAdmin,
          loading: false,
          error: null,
        })
      } catch (err) {
        if (cancelled) return
        setState({
          status: 'error',
          role: null,
          isMemberActive: false,
          isFeeCurrent: false,
          canAccessMemberArea: false,
          canAccessBoardArea: false,
          canAccessAdmin: false,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    loadIdentity()

    return () => {
      cancelled = true
    }
  }, [session, sessionLoading, configured])

  return (
    <IdentityContext.Provider value={state}>
      {children}
    </IdentityContext.Provider>
  )
}

export function useIdentity() {
  return useContext(IdentityContext)
}
