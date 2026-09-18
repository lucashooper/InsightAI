import React from 'react';
import MarketingNav from '../../components/marketing/MarketingNav';
import CloudMascotMark from '../../components/marketing/CloudMascotMark';
import FeaturesSection from '../../components/marketing/FeaturesSection';
import FeatureShowcase from '../../components/marketing/FeatureShowcase';
import FAQSection from '../../components/marketing/FAQSection';
import Footer from '../../components/marketing/Footer';
import { useScrollReveal } from '../../hooks/marketing/useScrollReveal';
import { MARKETING_PHONE_IMAGES } from '../../constants/marketingPhoneImages';
import PhoneFrame from '../../components/marketing/PhoneFrame';
import '../../styles/marketing.css';

const HomePage: React.FC = () => {
  useScrollReveal();

  return (
    <div className="App marketing-page marketing-page--light">
      <div className="ambient-gradient ambient-gradient--light" aria-hidden="true" />
      <div className="mesh-blob mesh-blob--a" aria-hidden="true" />
      <div className="mesh-blob mesh-blob--b" aria-hidden="true" />
      <div className="mesh-blob mesh-blob--c" aria-hidden="true" />

      <MarketingNav />

      <section className="hero-section-v2 hero-premium hero-light">
        <div className="hero-v2-content">
          <div className="hero-v2-text hero-premium-text">
            <CloudMascotMark size={96} className="hero-mascot float-slow" tint="#B8D4FF" />
            <h1 className="hero-v2-title hero-premium-title hero-light-title">
              The AI reflection journal
              <br />
              <span className="hero-premium-accent">that helps you grow.</span>
            </h1>
            <p className="hero-v2-subtitle hero-premium-subtitle hero-light-subtitle">
              Reflect in voice or text, track your mood, and get personalized insights — just five minutes a day.
            </p>
            <div className="hero-v2-buttons">
              <a href="/quiz" className="premium-nav-cta" style={{ textDecoration: 'none', marginRight: '0.5rem' }}>
                Take the free quiz
              </a>
              <a href="https://apps.apple.com/us/app/insight-understand-yourself/id6755717396" target="_blank" rel="noopener noreferrer">
                <img src="/app-store-download-button.avif" alt="Download on the App Store" className="download-badge" />
              </a>
              <div className="download-badge-wrapper">
                <img src="/google-play-button-new.avif" alt="Get it on Google Play" className="download-badge download-badge--disabled" />
              </div>
            </div>
          </div>
          <div className="hero-v2-phones hero-premium-phones">
            <div className="hero-phone-float hero-phone-float--main float-phone">
              <PhoneFrame
                src={MARKETING_PHONE_IMAGES.main}
                alt="Insight app home screen"
                size="hero-main"
              />
            </div>
            <div className="hero-phone-float hero-phone-float--secondary float-phone-delayed">
              <PhoneFrame
                src={MARKETING_PHONE_IMAGES.dashboard}
                alt="Insight daily check-in"
                size="hero-secondary"
              />
            </div>
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
