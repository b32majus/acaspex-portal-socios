import { AuthProvider } from './lib/authContext'
import { IdentityProvider } from './lib/identityContext'
import { AppRouter } from './routes/AppRouter'

export default function App() {
  return (
    <AuthProvider>
      <IdentityProvider>
        <AppRouter />
      </IdentityProvider>
    </AuthProvider>
  )
}
