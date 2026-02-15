import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import RequireAuth from './components/auth/RequireAuth';
import RedirectIfAuthenticated from './components/auth/RedirectIfAuthenticated';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// App pages (authenticated)
import AppHome from './pages/app/AppHome';

export const router = createBrowserRouter([
  // Root route - In production, Netlify serves marketing site before this is reached
  // This only runs in development or if Netlify rewrite fails
  {
    path: '/',
    element: (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>InsightAI</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          Transform your thoughts into clarity
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a 
            href="/login" 
            style={{
              padding: '12px 32px',
              background: 'white',
              color: '#667eea',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            Sign In
          </a>
          <a 
            href="/app" 
            style={{
              padding: '12px 32px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              border: '2px solid white'
            }}
          >
            Get Started
          </a>
        </div>
        <p style={{ marginTop: '3rem', opacity: 0.7, fontSize: '0.9rem' }}>
          In production, the marketing site is served here via Netlify.
        </p>
      </div>
    ),
  },

  // Auth routes (public, but redirect if already authenticated)
  {
    path: '/login',
    element: (
      <RedirectIfAuthenticated>
        <AuthLayout />
      </RedirectIfAuthenticated>
    ),
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },

  // App routes (require authentication)
  {
    path: '/app',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <AppHome />,
      },
      // Add more app routes here as needed
      // { path: 'playbook', element: <PlaybookPage /> },
      // { path: 'notes', element: <NotesPage /> },
      // etc.
    ],
  },
]);
