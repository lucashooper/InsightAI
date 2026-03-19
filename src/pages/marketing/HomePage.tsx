import React, { useState, useEffect } from 'react';
import Starfield from '../../components/marketing/Starfield';
import FeaturesSection from '../../components/marketing/FeaturesSection';
import FeatureShowcase from '../../components/marketing/FeatureShowcase';
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
            width: '100%',
            maxWidth: '100%',
            padding: '12px 20px',
            justifyContent: 'space-between',
            gap: '0.5rem',
            borderRadius: 0,
            background: 'rgba(10, 10, 20, 0.95)',
            border: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'none',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          } : undefined}
        >
          <div className="floating-nav-logo" style={isMobile ? { marginRight: 'auto' } : undefined}>
            <img src="/Insight-Logo-nobg.webp" alt="Insight" />
            <span className="floating-nav-brand">Insight</span>
          </div>
          <div className="floating-nav-links" style={isMobile ? { display: 'none' } : undefined}>
            <a href="#features" className="floating-nav-link">Features</a>
            <a href="#showcase" className="floating-nav-link">App</a>
            <a href="/privacy" className="floating-nav-link">Privacy</a>
          </div>
          <a href="/login" className="floating-nav-cta" style={isMobile ? { fontSize: '0.8rem', padding: '8px 16px', marginRight: '2px', flexShrink: 0 } : undefined}>Try for free</a>
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={isMobile ? { display: 'block' } : undefined}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
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
            background: 'rgba(10, 10, 31, 0.98)',
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
              <div className="download-badge-wrapper">
                <img src="/download-with-app-store-button.webp" alt="Download on the App Store" className="download-badge" />
                <span className="coming-soon-text">Coming Soon</span>
              </div>
              <div className="download-badge-wrapper">
                <img src="/google-play-button.webp" alt="Get it on Google Play" className="download-badge" />
                <span className="coming-soon-text">Coming Soon</span>
              </div>
              <a href="/login" className="download-badge-wrapper download-badge-web">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span className="download-badge-web-text">Web App</span>
              </a>
            </div>
          </div>
          <div className="hero-v2-phones">
            <img 
              src="/phone-images/Insight-Main-Page-Phone.png" 
              alt="Insight App" 
              className="hero-phone-main"
            />
            <img 
              src="/phone-images/Insight-Dashboard-Page-Phone.png" 
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

      <Footer />
    </div>
  );
};

export default HomePage;
