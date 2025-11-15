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
        
        {/* Dashboard Preview - Premium Shadow */}
        <div className="relative mx-auto max-w-5xl mt-16">
          {/* Glow container */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl opacity-50" />
          
          {/* Dashboard image */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10" 
               style={{
                 boxShadow: '0 20px 80px -20px rgba(147,51,234,0.4), 0 0 60px -15px rgba(59,130,246,0.3), 0 8px 30px rgba(0,0,0,0.8)'
               }}>
            <div className="window-header bg-gray-900/50 backdrop-blur-sm px-4 py-3 border-b border-white/5">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              </div>
            </div>
            <img 
              src="/Dashboard.png" 
              alt="InsightAI Dashboard" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
