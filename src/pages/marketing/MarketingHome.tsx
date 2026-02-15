import React from 'react';

/**
 * Marketing site root route placeholder.
 * 
 * In production, Netlify serves the static marketing site at / via a rewrite rule,
 * so this React component should never be reached. This component exists only as
 * a fallback for local development.
 * 
 * The marketing site (with Terms, Privacy, etc.) is served from /marketing-dist/
 * and Netlify rewrites / to /marketing-dist/index.html.
 * 
 * DO NOT add redirects here - that breaks the marketing site!
 */
const MarketingHome: React.FC = () => {
  return (
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
      <div style={{ display: 'flex', gap: '1rem' }}>
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
  );
};

export default MarketingHome;
