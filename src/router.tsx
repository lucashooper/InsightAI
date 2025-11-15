import { createBrowserRouter, Navigate } from 'react-router-dom';
import MarketingLayout from './layouts/MarketingLayout';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import RequireAuth from './components/auth/RequireAuth';
import RedirectIfAuthenticated from './components/auth/RedirectIfAuthenticated';

// Marketing pages
import MarketingHome from './pages/marketing/MarketingHome';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// App pages (authenticated)
import AppHome from './pages/app/AppHome';

export const router = createBrowserRouter([
  // Marketing routes (public)
  {
    path: '/',
    element: <MarketingLayout />,
    children: [
      {
        index: true,
        element: <MarketingHome />,
      },
    ],
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

  // Catch-all redirect
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
