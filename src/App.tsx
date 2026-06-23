import { AuthProvider } from './lib/authContext'
import { AppRouter } from './routes/AppRouter'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
