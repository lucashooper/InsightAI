import React, { useState, useEffect } from 'react';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

const showcaseFeatures = [
  {
    title: 'AI-Powered Analysis',
    description: 'Get deep insights into your emotional patterns. Our AI reads between the lines and surfaces what matters most to your wellbeing.',
    image: '/new-phone-images/Main-Insight.png',
  },
  {
    title: 'Beautiful Dashboard',
    description: 'Track your emotional health over time with interactive charts, mood trends, and pattern recognition — all in one view.',
    image: '/new-phone-images/Insight-Dashboard.png',
  },
  {
    title: 'Deep Insights',
    description: 'Discover meaningful patterns in your thoughts and emotions with AI-powered analysis that helps you understand yourself better.',
    image: '/new-phone-images/Insight-Insights.png',
  },
  {
    title: 'Personal Playbook',
    description: 'Build a library of strategies and coping techniques suggested by AI based on your unique patterns and growth areas.',
    image: '/new-phone-images/Playbook.png',
  },
];

const FeatureShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const isMobile = useIsMobile();

  const handleFeatureChange = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      setFadeKey(prev => prev + 1);
    }
  };

  const mobileSection: React.CSSProperties = {
    padding: '60px 16px',
    overflow: 'hidden',
    maxWidth: '100vw',
    boxSizing: 'border-box',
  };

  const mobileLayout: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '100%',
    overflow: 'hidden',
    padding: 0,
  };

  const mobilePhoneContainer: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    position: 'static',
    order: -1,
  };

  const mobilePhoneImg: React.CSSProperties = {
    width: '260px',
    maxWidth: '65%',
    height: 'auto',
    filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4))',
  };

  const mobileFeatureItem: React.CSSProperties = {
    maxWidth: '100%',
    width: '100%',
    overflow: 'hidden',
    padding: '20px 20px',
    minHeight: 'auto',
    boxSizing: 'border-box',
  };

  return (
    <section className="showcase-section" style={isMobile ? mobileSection : undefined}>
      <h2 className="showcase-title showcase-premium-title" style={isMobile ? { fontSize: '1.75rem', marginBottom: '1.5rem', textAlign: 'center' } : undefined}>What does Insight include?</h2>
      
      <div className={isMobile ? undefined : "showcase-layout"} style={isMobile ? mobileLayout : undefined}>
        <div className="showcase-phone-container" style={isMobile ? mobilePhoneContainer : undefined}>
          <div className="showcase-phone" style={isMobile ? { width: '100%', display: 'flex', justifyContent: 'center' } : undefined}>
            <img 
              src={showcaseFeatures[activeIndex].image} 
              alt={showcaseFeatures[activeIndex].title}
              className={isMobile ? undefined : "showcase-phone-img"}
              key={fadeKey}
              style={isMobile ? mobilePhoneImg : undefined}
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
        
        <div className="showcase-features-list" style={isMobile ? { padding: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box' as const } : undefined}>
          {showcaseFeatures.map((feature, index) => (
            <button
              key={index}
              className={`showcase-feature-item depth-card ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleFeatureChange(index)}
              style={isMobile ? { ...mobileFeatureItem, transform: 'none' } : undefined}
            >
              <h3 className="showcase-feature-title" style={isMobile ? { fontSize: '1.125rem', marginBottom: '8px' } : undefined}>{feature.title}</h3>
              <p className="showcase-feature-desc" style={isMobile ? { fontSize: '0.875rem', whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word' } : undefined}>{feature.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
