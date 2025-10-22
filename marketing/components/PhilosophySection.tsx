import React from 'react';

const PhilosophySection: React.FC = () => {
  return (
    <section className="philosophy-section">
      <div className="container-wide">
        <div className="philosophy-content">
          <div className="philosophy-text">
            <div className="philosophy-item">
              <h3 className="philosophy-title">Your thoughts are yours.</h3>
              <p className="philosophy-description">
                InsightAI stores notes <span className="text-highlight">privately on your device</span>, so you can access them quickly, 
                even offline. No one can read <span className="text-highlight">them</span>, not even us.
              </p>
            </div>
            
            <div className="philosophy-item">
              <h3 className="philosophy-title">Your mind is unique.</h3>
              <p className="philosophy-description">
                With <span className="text-highlight">powerful AI analysis</span> and themes, you can 
                shape InsightAI to fit your way of thinking.
              </p>
            </div>
            
            <div className="philosophy-item">
              <h3 className="philosophy-title">Your knowledge should last.</h3>
              <p className="philosophy-description">
                InsightAI uses <span className="text-highlight">open file formats</span>, so you're never locked in. 
                You own your data for the long term.
              </p>
            </div>
          </div>
          
          <div className="philosophy-visual">
            <div className="logo-container">
              <img src="/Insight-logo.png" alt="Insight" className="philosophy-logo" />
            </div>
            <h2 className="philosophy-brand">
              Insight<span className="gradient-text">AI</span>
            </h2>
            <p className="philosophy-cta-text">Free without limits.</p>
            <a href="/app" className="philosophy-cta-link">Download now</a>
          </div>
        </div>
        
        <div className="spark-section">
          <h2 className="spark-title">Spark ideas.</h2>
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
