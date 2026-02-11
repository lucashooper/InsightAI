import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Marketing landing page fallback for the web app.
 * 
 * In production, Netlify serves the real marketing site at /.
 * This component is only reached if the Netlify rewrite doesn't apply
 * (e.g. local dev) or if an authenticated user navigates to /.
 * 
 * - If authenticated: redirect to /app
 * - If not authenticated: show a simple landing with login link
 */
const MarketingHome: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
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
  }

  // Unauthenticated fallback — simple landing page with login link
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      <img 
        src="/InsightAI-New-Logo.png" 
        alt="Insight" 
        style={{ width: '80px', height: '80px', borderRadius: '16px' }} 
      />
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Insight</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
        Your AI-powered journal companion
      </p>
      <Link 
        to="/login" 
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
          color: '#fff',
          padding: '12px 32px',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          marginTop: '0.5rem'
        }}
      >
        Sign In
      </Link>
    </div>
  );
};

export default MarketingHome;
