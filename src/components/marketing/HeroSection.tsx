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
        <a href="/login" className="cta-button-premium" style={{ textDecoration: 'none' }}>
          Join Insight
        </a>
        
        {/* Dashboard Preview - simplified without slider */}
        <div className="dashboard-preview-premium" style={{ marginTop: '60px' }}>
          <img 
            src="/Dashboard.png" 
            alt="Insight Dashboard" 
            style={{ 
              width: '100%', 
              maxWidth: '900px', 
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }} 
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
