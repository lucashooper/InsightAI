import React from 'react';

const CTASection: React.FC = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">Ready to understand yourself better?</h2>
          <p className="cta-description">
            Start your journey with InsightAI today. Free, private, and powerful.
          </p>
          <div className="cta-buttons">
            <a href="/app" className="cta-button primary">
              Try InsightAI Now
            </a>
            <a href="#features" className="cta-button secondary">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
