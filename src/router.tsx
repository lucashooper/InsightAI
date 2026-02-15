import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import RequireAuth from './components/auth/RequireAuth';
import RedirectIfAuthenticated from './components/auth/RedirectIfAuthenticated';

// Marketing pages
import HomePage from './pages/marketing/HomePage';
import TermsPage from './pages/marketing/TermsPage';
import PrivacyPage from './pages/marketing/PrivacyPage';
import SupportPage from './pages/marketing/SupportPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// App pages (authenticated)
import AppHome from './pages/app/AppHome';

export const router = createBrowserRouter([
  // Marketing routes
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/support',
    element: <SupportPage />,
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
