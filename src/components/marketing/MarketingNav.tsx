import React, { useState, useEffect } from 'react';

interface MarketingNavProps {
  links?: { href: string; label: string }[];
}

const defaultLinks = [
  { href: '/', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '/privacy', label: 'Privacy' },
];

const MarketingNav: React.FC<MarketingNavProps> = ({ links = defaultLinks }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav
      className="floating-nav"
      style={isMobile ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '100%',
        transform: 'none',
        borderRadius: 0,
        background: 'transparent',
        border: 'none',
        padding: 0,
        boxShadow: 'none',
        zIndex: 1000,
      } : undefined}
    >
      <div
        className="floating-nav-inner"
        style={isMobile ? {
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '100%',
          padding: '10px 16px',
          borderRadius: 0,
          background: 'rgba(10, 10, 20, 0.95)',
          border: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'none',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          gap: '0',
        } : undefined}
      >
        <a href="/" className="floating-nav-logo" style={isMobile ? { marginRight: 'auto', gap: '12px', textDecoration: 'none' } : { textDecoration: 'none' }}>
          <img src="/Insight-Logo-nobg.webp" alt="Insight" style={isMobile ? { height: '48px', width: 'auto' } : undefined} />
          <span className="floating-nav-brand" style={isMobile ? { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' } : undefined}>Insight</span>
        </a>
        <div className="floating-nav-links" style={isMobile ? { display: 'none' } : undefined}>
          {links.map((link) => (
            <a key={link.href} href={link.href} className="floating-nav-link">{link.label}</a>
          ))}
        </div>
        <a href="https://apps.apple.com/us/app/insight-understand-yourself/id6755717396" className="floating-nav-cta" style={isMobile ? { fontSize: '0.75rem', padding: '6px 14px', marginLeft: 'auto', marginRight: '0px', flexShrink: 0, borderRadius: '100px', background: '#7c3aed', fontWeight: 600, textDecoration: 'none' } : undefined}><span style={isMobile ? { color: '#fff' } : undefined}>Try for free</span></a>
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          style={isMobile ? { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', padding: '0', margin: '0', cursor: 'pointer', flexShrink: 0 } : undefined}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            {mobileMenuOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{
          display: 'block',
          background: 'rgba(10, 10, 20, 0.98)',
          backdropFilter: 'blur(20px)',
          padding: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          {links.map((link) => (
            <a key={link.href} href={link.href} className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>{link.label}</a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default MarketingNav;
