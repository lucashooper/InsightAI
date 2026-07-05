import React from 'react';

const features = [
  {
    title: 'AI-Powered Insights',
    description: 'Understand your emotional journey and identify trends in your daily life.',
  },
  {
    title: 'Beautiful Dashboards',
    description: 'Visualize your progress with interactive charts and sentiment flow graphs.',
  },
  {
    title: 'Pattern Recognition',
    description: 'Automatically detect recurring themes and opportunities for personal growth.',
  },
  {
    title: 'Privacy First',
    description: 'Your data stays on your device. End-to-end encryption ensures complete privacy.',
  },
  {
    title: 'Smart Editor',
    description: 'Distraction-free writing with quick inputs and intelligent keyword highlighting.',
  },
  {
    title: 'Beautiful Themes',
    description: 'Carefully crafted themes designed for comfortable journaling.',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="features-section-v2 features-premium">
      <div className="container">
        <h2 className="features-v2-title features-premium-title">
          Everything you need to
          <br />
          understand yourself.
        </h2>

        <div className="features-v2-grid reveal-stagger">
          {features.map((feature, index) => (
            <div key={index} className="feature-v2-card depth-card" style={{ '--reveal-index': index } as React.CSSProperties}>
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
