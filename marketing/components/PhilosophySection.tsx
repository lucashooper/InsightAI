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
            <div className="gem-container">
              <svg className="gem-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <polygon 
                  points="100,20 160,80 140,160 60,160 40,80" 
                  fill="url(#gemGradient)"
                  opacity="0.9"
                />
                <polygon 
                  points="100,20 160,80 100,100" 
                  fill="#7c3aed"
                  opacity="0.7"
                />
                <polygon 
                  points="100,20 40,80 100,100" 
                  fill="#8b5cf6"
                  opacity="0.8"
                />
              </svg>
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
