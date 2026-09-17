import React from 'react';

const features = [
  {
    title: 'Voice, text & scan',
    description: 'Journal the way you want — speak, write, or capture handwritten notes.',
  },
  {
    title: 'AI-powered insights',
    description: 'Understand your emotional patterns and what triggers them over time.',
  },
  {
    title: 'Daily check-ins',
    description: 'A gentle mood snapshot that builds a picture of how you really feel.',
  },
  {
    title: 'Guided Journey',
    description: 'Short lessons on thoughts, emotions, and habits — at your own pace.',
  },
  {
    title: 'Reflection chat',
    description: 'Talk through what\'s on your mind with Insight\'s AI — grounded in your entries.',
  },
  {
    title: 'Privacy first',
    description: 'Your journal stays yours. Encrypted entries and no third-party data sales.',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="features-section-v2 features-premium features-light">
      <div className="container">
        <h2 className="features-v2-title features-premium-title features-light-title">
          Everything you need to
          <br />
          understand yourself.
        </h2>

        <div className="features-v2-grid reveal-stagger">
          {features.map((feature, index) => (
            <div key={index} className="feature-v2-card depth-card depth-card--light" style={{ '--reveal-index': index } as React.CSSProperties}>
              <h3 className="feature-v2-name">{feature.title}</h3>
              <p className="feature-v2-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
