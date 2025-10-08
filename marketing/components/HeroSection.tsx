import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="hero-title-gradient">Insight</span>
          <span className="gradient-text">AI</span>
        </h1>
        <p className="hero-tagline">
          Understand yourself. Build better habits. Take control.
        </p>
        <button className="cta-button primary">
          Try Insight Today!
        </button>
        
        {/* Dashboard Preview */}
        <div className="dashboard-preview">
          <div className="preview-window">
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
