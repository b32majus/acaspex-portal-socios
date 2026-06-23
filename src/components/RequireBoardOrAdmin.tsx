import { Navigate } from 'react-router-dom'
import { useIdentity } from '../lib/identityContext'
import { usePreviewRole } from '../lib/previewRole'

export function RequireBoardOrAdmin({ children }: { children: React.ReactNode }) {
  const { status, loading, canAccessBoardArea } = useIdentity()
  const { previewRole } = usePreviewRole()

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

  const effectiveAccess = canAccessBoardArea && previewRole !== 'socio'

  if (!effectiveAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="max-w-sm text-center space-y-4">
          <h2 className="font-serif text-xl text-slate-900">Acceso restringido</h2>
          <p className="text-sm text-slate-500">
            Esta sección está reservada para la Junta Directiva y administración de ACASPEX.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
