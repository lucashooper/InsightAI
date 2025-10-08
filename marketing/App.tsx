import React from 'react';
import Starfield from './components/Starfield';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import SecuritySection from './components/SecuritySection';
import PhilosophySection from './components/PhilosophySection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import './styles-premium.css';

function App() {
  return (
    <div className="App">
      <Starfield />
      <HeroSection />
      <FeaturesSection />
      <SecuritySection />
      <PhilosophySection />
      <CTASection />
      <Footer />
    </div>
  );
}

export default App;
