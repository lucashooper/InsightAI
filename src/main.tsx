import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import './styles/base.css';
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'
import { GOOGLE_CLIENT_ID } from './config/google'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

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

// Track page loads to detect reload loops
const loadCount = parseInt(sessionStorage.getItem('app_load_count') || '0') + 1;
sessionStorage.setItem('app_load_count', loadCount.toString());
const loadTime = new Date().toISOString();
console.log(`🟢 main.tsx executing (page load #${loadCount}) at ${loadTime}`);
console.log(`🟢 Current URL: ${window.location.href}`);
console.log(`🟢 Referrer: ${document.referrer || 'none'}`);

if (loadCount > 3) {
  console.error(`🚨 RELOAD LOOP DETECTED! Page has loaded ${loadCount} times.`);
  console.error('🚨 Stopping execution to prevent infinite loop');
  
  // Clear the counter so user can retry
  sessionStorage.removeItem('app_load_count');
  
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: system-ui; background: #000; color: #fff; min-height: 100vh;">
      <h1 style="color: #ef4444;">⚠️ Reload Loop Detected</h1>
      <p>The app has reloaded ${loadCount} times. This indicates an infinite loop.</p>
      <p><strong>Current URL:</strong> ${window.location.href}</p>
      <p><strong>Check the console</strong> for navigation logs to see what's causing the reload.</p>
      <button onclick="sessionStorage.clear(); localStorage.clear(); location.href='/';" style="padding: 12px 24px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin-top: 20px;">
        Clear All Storage & Go to Home
      </button>
    </div>
  `;
  throw new Error('Reload loop detected - stopping execution');
}

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
