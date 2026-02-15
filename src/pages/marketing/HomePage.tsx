import React from 'react';
import Starfield from '../../components/marketing/Starfield';
import HeroSection from '../../components/marketing/HeroSection';
import FeaturesSection from '../../components/marketing/FeaturesSection';
import Footer from '../../components/marketing/Footer';
import { useScrollReveal } from '../../hooks/marketing/useScrollReveal';
import '../../styles/marketing.css';

const HomePage: React.FC = () => {
  useScrollReveal();
  
  return (
    <div className="App">
      <Starfield />
      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-logo">
          <img src="/InsightAI-New-Logo.png" alt="Insight" />
        </div>
        <div className="nav-links">
          <a 
            href="/" 
            className="nav-link"
          >
            Home
          </a>
          <a 
            href="/login" 
            className="nav-link nav-login-btn"
          >
            Login
          </a>
        </div>
      </nav>
      <HeroSection />
      <div className="fade-up">
        <FeaturesSection />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
