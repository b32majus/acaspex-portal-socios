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
  accessReason: 'member' | 'admin_oversight' | 'none'
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
  accessReason: 'none',
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
    accessReason: 'none',
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
        accessReason: 'none',
        loading: false,
        error: null,
      })
      return
    }

    let cancelled = false

    async function loadIdentity() {
      try {
        // Step 1: Read profile without join to members
        const { data: profile, error: profileError } = await supabase!
          .from('profiles')
          .select('id, role, is_active, member_id')
          .eq('id', session!.user.id)
          .maybeSingle()

        if (cancelled) return

        if (profileError) {
          setState({
            status: 'authenticated_no_profile',
            role: null,
            isMemberActive: false,
            isFeeCurrent: false,
            canAccessMemberArea: false,
            canAccessBoardArea: false,
            canAccessAdmin: false,
            accessReason: 'none',
            loading: false,
            error: profileError.message,
          })
          return
        }

        if (!profile) {
          setState({
            status: 'authenticated_no_profile',
            role: null,
            isMemberActive: false,
            isFeeCurrent: false,
            canAccessMemberArea: false,
            canAccessBoardArea: false,
            canAccessAdmin: false,
            accessReason: 'none',
            loading: false,
            error: null,
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
            accessReason: 'none',
            loading: false,
            error: null,
          })
          return
        }

        const role = profile.role as string
        const memberId = profile.member_id as string | null
        const isAdmin = role === 'administrador'
        const isBoard = role === 'junta_directiva'

        // Step 2: No member linked
        if (!memberId) {
          setState({
            status: isAdmin ? 'admin' : 'authenticated_no_member',
            role,
            isMemberActive: false,
            isFeeCurrent: false,
            canAccessMemberArea: isAdmin,
            canAccessBoardArea: isAdmin,
            canAccessAdmin: isAdmin,
            accessReason: isAdmin ? 'admin_oversight' : 'none',
            loading: false,
            error: null,
          })
          return
        }

        // Step 3: Read member separately
        const { data: member, error: memberError } = await supabase!
          .from('members')
          .select('id, status, paid_until')
          .eq('id', memberId)
          .maybeSingle()

        if (cancelled) return

        if (memberError) {
          setState({
            status: 'authenticated_no_member',
            role,
            isMemberActive: false,
            isFeeCurrent: false,
            canAccessMemberArea: isAdmin,
            canAccessBoardArea: isAdmin,
            canAccessAdmin: isAdmin,
            accessReason: isAdmin ? 'admin_oversight' : 'none',
            loading: false,
            error: memberError.message,
          })
          return
        }

        if (!member) {
          setState({
            status: 'authenticated_no_member',
            role,
            isMemberActive: false,
            isFeeCurrent: false,
            canAccessMemberArea: isAdmin,
            canAccessBoardArea: isAdmin,
            canAccessAdmin: isAdmin,
            accessReason: isAdmin ? 'admin_oversight' : 'none',
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
          canAccessMemberArea: memberActive || isAdmin,
          canAccessBoardArea: (isBoard || isAdmin) && memberActive || isAdmin,
          canAccessAdmin: isAdmin,
          accessReason: isAdmin && !memberActive ? 'admin_oversight' : memberActive ? 'member' : 'none',
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
          accessReason: 'none',
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
