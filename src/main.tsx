import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import './styles/base.css';
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import AuthGate from './components/auth/AuthGate'
import EncryptionGate from './components/encryption/EncryptionGate'
import { GOOGLE_CLIENT_ID } from './config/google'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AuthGate>
          <EncryptionGate>
            <App />
          </EncryptionGate>
        </AuthGate>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('[PWA] App is ready for offline use');
  },
  onUpdate: (registration) => {
    console.log('[PWA] New version available! Please refresh.');
    // Optionally show a notification to the user
    if (confirm('New version available! Reload to update?')) {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
})
