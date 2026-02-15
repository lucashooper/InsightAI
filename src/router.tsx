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

  // DO NOT add a root "/" route here!
  // Netlify serves the marketing site at / via rewrite rule in netlify.toml
  // The marketing site includes /terms, /privacy, /support pages
  // React Router should only handle /login and /app/* routes
]);
