import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Web app root route handler.
 * 
 * In production, Netlify serves the marketing site at / via a rewrite,
 * so this component is never reached by unauthenticated users.
 * 
 * - If authenticated: redirect to /app
 * - If not authenticated: redirect to /login
 *   (in production this path is unreachable — Netlify serves marketing site)
 */
const MarketingHome: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/app', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

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
      </div>
    </div>
  );
};

export default MarketingHome;
