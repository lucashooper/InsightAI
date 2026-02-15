import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import './styles/base.css';
import './styles/themes-extended.css';
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'
import { GOOGLE_CLIENT_ID } from './config/google'
// import * as serviceWorkerRegistration from './serviceWorkerRegistration'

// Disable HMR for this module to prevent infinite reloads
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('⚠️ HMR update detected - ignoring to prevent reload loop');
  });
}

// Intercept navigation to detect what's causing reloads
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  console.log('🔵 history.pushState called:', args[2]);
  console.trace('pushState stack trace');
  return originalPushState.apply(this, args);
};

history.replaceState = function(...args) {
  console.log('🔵 history.replaceState called:', args[2]);
  console.trace('replaceState stack trace');
  return originalReplaceState.apply(this, args);
};

// Reload loop detection removed - was causing false positives on legitimate navigation

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </GoogleOAuthProvider>,
)

// Temporarily disable service worker to fix reload loop
// TODO: Re-enable after fixing the loop issue
// serviceWorkerRegistration.register({
//   onSuccess: () => {
//     console.log('[PWA] App is ready for offline use');
//   },
//   onUpdate: (registration) => {
//     console.log('[PWA] New version available! Please refresh.');
//     // Optionally show a notification to the user
//     if (confirm('New version available! Reload to update?')) {
//       registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
//       window.location.reload();
//     }
//   }
// })

// Unregister any existing service workers WITHOUT reloading
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length > 0) {
      console.log(`[PWA] Found ${registrations.length} service workers - unregistering WITHOUT reload`);
      registrations.forEach(registration => {
        registration.unregister().then(() => {
          console.log('[PWA] Service worker unregistered successfully');
        });
      });
    }
  }).catch(err => {
    console.error('[PWA] Error unregistering service workers:', err);
  });
  
  // Also remove any service worker controller
  if (navigator.serviceWorker.controller) {
    console.log('[PWA] Active service worker controller found - will be removed on next load');
  }
}
