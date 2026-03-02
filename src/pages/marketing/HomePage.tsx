import React from 'react';
import Starfield from '../../components/marketing/Starfield';
import FeaturesSection from '../../components/marketing/FeaturesSection';
import FeatureShowcase from '../../components/marketing/FeatureShowcase';
import Footer from '../../components/marketing/Footer';
import { useScrollReveal } from '../../hooks/marketing/useScrollReveal';
import '../../styles/marketing.css';

const HomePage: React.FC = () => {
  useScrollReveal();
  
  return (
    <div className="App marketing-page">
      <Starfield />

      {/* Floating Centered Nav - Monk Style */}
      <nav className="floating-nav">
        <div className="floating-nav-inner">
          <div className="floating-nav-logo">
            <img src="/Insight-Logo-nobg.webp" alt="Insight" />
            <span className="floating-nav-brand">Insight</span>
          </div>
          <div className="floating-nav-links">
            <a href="#features" className="floating-nav-link">Features</a>
            <a href="#showcase" className="floating-nav-link">App</a>
            <a href="/privacy" className="floating-nav-link">Privacy</a>
          </div>
          <a href="/login" className="floating-nav-cta">Try for free</a>
        </div>
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
