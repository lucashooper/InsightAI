import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Marketing landing page - redirects to appropriate page.
 * 
 * - If authenticated: redirect to /app
 * - If not authenticated: redirect to /login
 */
const MarketingHome: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, go to app
        navigate('/app', { replace: true });
      } else {
        // User is not logged in, go to login
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(139, 92, 246, 0.3)',
          borderTop: '3px solid #8b5cf6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p>Loading Insight...</p>
      </div>
    </div>
  );
};

export default MarketingHome;
