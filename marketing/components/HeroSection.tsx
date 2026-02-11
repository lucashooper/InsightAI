import React from 'react';
import ImageSlider from './ImageSlider';

const HeroSection: React.FC = () => {
  const appImages = [
    './better-app-images/New-DashboardPage.png',
    './better-app-images/NewAnalysisPage.png',
    './better-app-images/New-MyNotesPage.png',
    './better-app-images/New-PP-PageImage.png',
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
        
        {/* Premium App Slider */}
        <div className="dashboard-preview-premium">
          <ImageSlider images={appImages} interval={5000} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
