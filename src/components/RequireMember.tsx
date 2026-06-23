import { Navigate } from 'react-router-dom'
import { useIdentity } from '../lib/identityContext'

export function RequireMember({ children }: { children: React.ReactNode }) {
  const { status, loading, canAccessMemberArea } = useIdentity()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Comprobando acceso...</p>
      </div>
    )
  }

  if (status === 'not_authenticated') {
    return <Navigate to="/login" replace />
  }

  if (!canAccessMemberArea) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="max-w-sm text-center space-y-4">
          <h2 className="font-serif text-xl text-slate-900">Acceso no disponible</h2>
          <p className="text-sm text-slate-500">
            {status === 'authenticated_no_profile' && 'Tu cuenta aún no está vinculada a un perfil del portal.'}
            {status === 'authenticated_no_member' && 'Tu cuenta no tiene una ficha de socio vinculada.'}
            {status === 'member_inactive' && 'Tu ficha de socio no está activa actualmente.'}
            {status === 'member_expired' && 'Tu acceso como socio no está activo porque la cuota no está vigente.'}
            {status === 'admin' && 'El acceso al área de socios requiere ficha de socio activa y cuota vigente.'}
            {status === 'error' && 'Ha ocurrido un error al consultar tu estado. Inténtalo de nuevo.'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
