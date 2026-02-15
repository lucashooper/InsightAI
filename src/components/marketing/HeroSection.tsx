import React from 'react';
import PhoneCarousel from './PhoneCarousel';

const HeroSection: React.FC = () => {
  // Phone mockup images from mobile app
  const phoneImages = [
    '/phone-images/Insight-Main-Page-Phone.png',
    '/phone-images/Insight-Journal-Page-Phone.png',
    '/phone-images/Insight-Dashboard-Page-Phone.png',
    '/phone-images/Insight-Playbook-Page-Phone.png',
  ];

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
        
        {/* Phone Carousel */}
        <div style={{ marginTop: '60px' }}>
          <PhoneCarousel images={phoneImages} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
