import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import './styles/base.css';
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import AuthGate from './components/auth/AuthGate'
import { GOOGLE_CLIENT_ID } from './config/google'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
