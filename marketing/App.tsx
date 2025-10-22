import React from 'react';
import Starfield from './components/Starfield';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import './styles-premium.css';

function App() {
  return (
    <div className="App">
      <Starfield />
      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-logo">
          <img src="/Insight-logo.png" alt="Insight" />
        </div>
        <div className="nav-links">
          <a href="#home" className="nav-link">Home</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </div>
      </nav>
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}

export default App;
