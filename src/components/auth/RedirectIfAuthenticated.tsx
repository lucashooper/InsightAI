import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

/**
 * Wrapper that redirects authenticated users away from auth pages.
 * 
 * Flow:
 * - If loading: Show loading spinner
 * - If authenticated: Redirect to /app
 * - If not authenticated: Render children (login/signup page)
 */
const RedirectIfAuthenticated: React.FC<RedirectIfAuthenticatedProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  // Already authenticated - redirect to app
  if (user) {
    return <Navigate to="/app" replace />;
  }

  // Not authenticated - show the auth page
  return <>{children}</>;
};

export default RedirectIfAuthenticated;
