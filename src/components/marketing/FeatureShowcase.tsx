import React, { useState } from 'react';

const showcaseFeatures = [
  {
    title: 'AI-Powered Analysis',
    description: 'Get deep insights into your emotional patterns. Our AI reads between the lines and surfaces what matters most to your wellbeing.',
    image: '/phone-images/Insight-Main-Page-Phone.png',
  },
  {
    title: 'Beautiful Dashboard',
    description: 'Track your emotional health over time with interactive charts, mood trends, and pattern recognition — all in one view.',
    image: '/phone-images/Insight-Dashboard-Page-Phone.png',
  },
  {
    title: 'Smart Journaling',
    description: 'Write freely with a distraction-free editor. Insight highlights key themes and emotions as you type.',
    image: '/phone-images/Insight-Journal-Page-Phone.png',
  },
  {
    title: 'Personal Playbook',
    description: 'Build a library of strategies and coping techniques suggested by AI based on your unique patterns and growth areas.',
    image: '/phone-images/Insight-Playbook-Page-Phone.png',
  },
];

const FeatureShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  const handleFeatureChange = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      setFadeKey(prev => prev + 1);
    }
  };

  return (
    <section className="showcase-section">
      <h2 className="showcase-title">What does Insight include?</h2>
      
      <div className="showcase-layout">
        <div className="showcase-phone-container">
          <div className="showcase-phone">
            <img 
              src={showcaseFeatures[activeIndex].image} 
              alt={showcaseFeatures[activeIndex].title}
              className="showcase-phone-img"
              key={fadeKey}
            />
          </div>
          <div className="showcase-dots">
            {showcaseFeatures.map((_, index) => (
              <button
                key={index}
                className={`showcase-dot ${index === activeIndex ? 'active' : ''}`}
                onClick={() => handleFeatureChange(index)}
                aria-label={`View ${showcaseFeatures[index].title}`}
              />
            ))}
          </div>
        </div>
        
        <div className="showcase-features-list">
          {showcaseFeatures.map((feature, index) => (
            <button
              key={index}
              className={`showcase-feature-item ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleFeatureChange(index)}
            >
              <h3 className="showcase-feature-title">{feature.title}</h3>
              <p className="showcase-feature-desc">{feature.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
