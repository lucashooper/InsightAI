import Starfield from './components/Starfield';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import { useScrollReveal } from './hooks/useScrollReveal';
import './styles-premium.css';

function App() {
  useScrollReveal();
  
  return (
    <div className="App">
      <Starfield />
      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-logo">
          <img src="./Insight-Logo-nobg.webp" alt="Insight" />
        </div>
        <div className="nav-links">
          <a 
            href="#" 
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Home
          </a>
          <a 
            href="/login" 
            className="nav-link nav-login-btn-styled"
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
}

export default App;
