import { Navigate } from 'react-router-dom'
import { useIdentity } from '../lib/identityContext'

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { status, loading, canAccessAdmin } = useIdentity()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Comprobando permisos...</p>
      </div>
    )
  }

  if (status === 'not_authenticated') {
    return <Navigate to="/login" replace />
  }

  if (!canAccessAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="max-w-sm text-center space-y-4">
          <h2 className="font-serif text-xl text-slate-900">Acceso restringido</h2>
          <p className="text-sm text-slate-500">
            No tienes permisos para acceder al panel de administración.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
