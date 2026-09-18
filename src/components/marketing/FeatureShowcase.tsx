import React, { useState, useEffect } from 'react';
import { MARKETING_PHONE_IMAGES } from '../../constants/marketingPhoneImages';
import PhoneFrame from './PhoneFrame';

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
    title: 'Light, calm home',
    description: 'Your day at a glance — check-in prompts, reflection cards, and quick actions to write, speak, or scan.',
    image: MARKETING_PHONE_IMAGES.main,
  },
  {
    title: 'Mood check-in',
    description: 'Slide to how you feel. A soft companion reacts as you move — then Insight remembers the pattern.',
    image: MARKETING_PHONE_IMAGES.dashboard,
  },
  {
    title: 'Deep insights',
    description: 'AI reads between the lines of your entries and surfaces themes, strengths, and growth areas.',
    image: MARKETING_PHONE_IMAGES.insights,
  },
  {
    title: 'Daily practice',
    description: 'Build small habits with guided protocols — streaks, reminders, and progress you can actually see.',
    image: MARKETING_PHONE_IMAGES.playbook,
  },
];

const FeatureShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const isMobile = useIsMobile();

  const handleFeatureChange = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      setFadeKey((prev) => prev + 1);
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

  const mobileFeatureItem: React.CSSProperties = {
    maxWidth: '100%',
    width: '100%',
    overflow: 'hidden',
    padding: '20px 20px',
    minHeight: 'auto',
    boxSizing: 'border-box',
  };

  return (
    <section className="showcase-section showcase-light" style={isMobile ? mobileSection : undefined}>
      <h2 className="showcase-title showcase-premium-title showcase-light-title" style={isMobile ? { fontSize: '1.75rem', marginBottom: '1.5rem', textAlign: 'center' } : undefined}>
        What does Insight include?
      </h2>

      <div className={isMobile ? undefined : 'showcase-layout'} style={isMobile ? mobileLayout : undefined}>
        <div className="showcase-phone-container" style={isMobile ? mobilePhoneContainer : undefined}>
          <div className="showcase-phone" style={isMobile ? { width: '100%', display: 'flex', justifyContent: 'center' } : undefined}>
            <PhoneFrame
              src={showcaseFeatures[activeIndex].image}
              alt={showcaseFeatures[activeIndex].title}
              size="showcase"
              imageKey={fadeKey}
            />
          </div>
          <div className="showcase-dots showcase-dots--light">
            {showcaseFeatures.map((_, index) => (
              <button
                key={index}
                type="button"
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
              type="button"
              className={`showcase-feature-item depth-card depth-card--light ${index === activeIndex ? 'active' : ''}`}
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
