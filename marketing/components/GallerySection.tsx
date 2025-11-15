import React from 'react';

const GallerySection: React.FC = () => {
  const galleryItems = [
    {
      image: '/new-app-images/InsightAI-DashboardPage.png',
      caption: 'Dashboard'
    },
    {
      image: '/new-app-images/InsightAI-AnalysisPage.png',
      caption: 'Insights'
    },
    {
      image: '/new-app-images/InsightAI-StrategiesPage.png',
      caption: 'Playbook'
    }
  ];

  return (
    <section className="gallery-section fade-up">
      <div className="container">
        <h2 className="section-title">
          Inside the <span className="gradient-text-purple">App</span>
        </h2>
        <p className="section-subtitle">
          A beautiful, intuitive interface designed for deep self-reflection
        </p>
        
        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <div key={index} className="gallery-card">
              <div className="gallery-image-container">
                <img 
                  src={item.image} 
                  alt={item.caption}
                  className="gallery-image"
                />
              </div>
              <div className="gallery-caption">{item.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
