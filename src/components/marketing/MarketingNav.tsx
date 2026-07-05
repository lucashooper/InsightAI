import React, { useState, useEffect } from 'react';

interface MarketingNavProps {
  links?: { href: string; label: string }[];
}

const defaultLinks = [
  { href: '#features', label: 'Features' },
  { href: '#showcase', label: 'App' },
  { href: '/privacy', label: 'Privacy' },
];

const MarketingNav: React.FC<MarketingNavProps> = ({ links = defaultLinks }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`premium-nav ${scrolled ? 'premium-nav--scrolled' : ''}`}>
      <div className="premium-nav-inner">
        <a href="/" className="premium-nav-logo">
          <img src="/Insight-Logo-nobg.webp" alt="Insight" />
          <span>Insight</span>
        </a>

        <nav className="premium-nav-links" aria-label="Main">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="premium-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="premium-nav-actions">
          <a
            href="https://apps.apple.com/us/app/insight-understand-yourself/id6755717396"
            className="premium-nav-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            Try for free
          </a>
          <button
            className="premium-nav-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="premium-nav-mobile">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="premium-nav-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://apps.apple.com/us/app/insight-understand-yourself/id6755717396"
            className="premium-nav-mobile-cta"
            onClick={() => setMobileMenuOpen(false)}
          >
            Try for free
          </a>
        </div>
      )}
    </header>
  );
};

export default MarketingNav;
