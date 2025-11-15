import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Discover yourself<br />
          <span className="gradient-text-insight">with Insight.</span>
        </h1>
        <p className="hero-tagline">
          Meet Insight. A toolkit for understanding yourself and your habits, allowing you to find a routine that works for you, based on the data.
        </p>
        <button className="cta-button-premium">
          Join Insight
        </button>
        
        {/* Dashboard Preview */}
        <div className="dashboard-preview-premium">
          <div className="preview-glow"></div>
          <div className="preview-window-premium">
            <div className="window-header">
              <div className="window-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
            </div>
            <img 
              src="/Dashboard.png" 
              alt="InsightAI Dashboard" 
              className="dashboard-screenshot"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
