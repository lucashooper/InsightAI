import React from 'react';
import Starfield from '../../components/marketing/Starfield';
import MarketingNav from '../../components/marketing/MarketingNav';
import TypewriterText from '../../components/marketing/TypewriterText';
import FeaturesSection from '../../components/marketing/FeaturesSection';
import FeatureShowcase from '../../components/marketing/FeatureShowcase';
import FAQSection from '../../components/marketing/FAQSection';
import Footer from '../../components/marketing/Footer';
import { useScrollReveal } from '../../hooks/marketing/useScrollReveal';
import '../../styles/marketing.css';

const typewriterPhrases = [
  'discover patterns in your thoughts.',
  'track your emotional wellbeing.',
  'build better habits.',
  'understand yourself.',
];

const HomePage: React.FC = () => {
  useScrollReveal();

  return (
    <div className="App marketing-page">
      <div className="ambient-gradient" aria-hidden="true" />
      <Starfield />
      <MarketingNav />

      <section className="hero-section-v2 hero-premium">
        <div className="hero-v2-content">
          <div className="hero-v2-text hero-premium-text">
            <h1 className="hero-v2-title hero-premium-title">
              Understand yourself
              <br />
              <span className="hero-premium-accent">with Insight.</span>
            </h1>
            <p className="hero-v2-subtitle hero-premium-subtitle">
              <TypewriterText phrases={typewriterPhrases} />
            </p>
            <div className="hero-v2-buttons">
              <a href="https://apps.apple.com/us/app/insight-understand-yourself/id6755717396" target="_blank" rel="noopener noreferrer">
                <img src="/app-store-download-button.avif" alt="Download on the App Store" className="download-badge" />
              </a>
              <div className="download-badge-wrapper">
                <img src="/google-play-button-new.avif" alt="Get it on Google Play" className="download-badge download-badge--disabled" />
              </div>
            </div>
          </div>
          <div className="hero-v2-phones hero-premium-phones">
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

      <div className="fade-up" id="features" data-reveal-delay="0">
        <FeaturesSection />
      </div>

      <div className="fade-up" id="showcase" data-reveal-delay="80">
        <FeatureShowcase />
      </div>

      <div className="fade-up" data-reveal-delay="120">
        <FAQSection />
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
