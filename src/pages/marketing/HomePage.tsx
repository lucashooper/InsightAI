import React, { useState, useEffect } from 'react';
import Starfield from '../../components/marketing/Starfield';
import FeaturesSection from '../../components/marketing/FeaturesSection';
import FeatureShowcase from '../../components/marketing/FeatureShowcase';
import FAQSection from '../../components/marketing/FAQSection';
import Footer from '../../components/marketing/Footer';
import { useScrollReveal } from '../../hooks/marketing/useScrollReveal';
import '../../styles/marketing.css';

const HomePage: React.FC = () => {
  useScrollReveal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="App marketing-page">
      <Starfield />

      {/* Navigation */}
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
            <a href="#features" className="floating-nav-link">Features</a>
            <a href="#showcase" className="floating-nav-link">App</a>
            <a href="/privacy" className="floating-nav-link">Privacy</a>
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
            <a href="#features" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#showcase" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>App</a>
            <a href="/privacy" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Privacy</a>
          </div>
        )}
      </nav>

      {/* Hero Section - Cal AI Style: text left, phones right */}
      <section className="hero-section-v2">
        <div className="hero-v2-content">
          <div className="hero-v2-text">
            <h1 className="hero-v2-title">
              Understand yourself<br />
              with Insight.
            </h1>
            <p className="hero-v2-subtitle">
              AI-powered journaling that helps you discover patterns in your thoughts, track your emotional wellbeing, and build better habits.
            </p>
            <div className="hero-v2-buttons">
              <a href="https://apps.apple.com/us/app/insight-understand-yourself/id6755717396" target="_blank" rel="noopener noreferrer">
                <img src="/app-store-download-button.avif" alt="Download on the App Store" className="download-badge" />
              </a>
              <div className="download-badge-wrapper">
                <img src="/google-play-button-new.avif" alt="Get it on Google Play" className="download-badge" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>
          </div>
          <div className="hero-v2-phones">
            <img 
              src="/new-phone-images/Main-Insight.png" 
              alt="Insight App" 
              className="hero-phone-main"
            />
            <img 
              src="/new-phone-images/Insight-Dashboard.png" 
              alt="Insight Dashboard" 
              className="hero-phone-secondary"
            />
          </div>
        </div>
      </section>

      <div className="fade-up" id="features">
        <FeaturesSection />
      </div>

      <div className="fade-up" id="showcase">
        <FeatureShowcase />
      </div>

      <div className="fade-up">
        <FAQSection />
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
