import React from 'react';
import { Lock, ScrollText, Users } from 'lucide-react';

const SecuritySection: React.FC = () => {
  return (
    <section className="security-section">
      <div className="container-wide">
        <div className="security-content glass-card-large">
          <div className="security-text">
            <h2 className="section-title-large">Sync securely.</h2>
            <p className="section-description-large">
              Access your notes on any device, secured with end-to-end encryption.{' '}
              <a href="#" className="learn-more">Learn more.</a>
            </p>
            
            <div className="security-features">
              <div className="security-feature glass-card-small">
                <div className="feature-icon-container-medium">
                  <Lock className="feature-icon-svg-medium" size={32} strokeWidth={1.5} />
                </div>
                <div className="feature-content">
                  <h3 className="feature-subtitle">Fine-grained control.</h3>
                  <p className="feature-text">Decide which files and preferences you want to sync across devices.</p>
                </div>
              </div>
              
              <div className="security-feature glass-card-small">
                <div className="feature-icon-container-medium">
                  <ScrollText className="feature-icon-svg-medium" size={32} strokeWidth={1.5} />
                </div>
                <div className="feature-content">
                  <h3 className="feature-subtitle">Version history.</h3>
                  <p className="feature-text">Easily track changes between revisions, with one year of version history for every note.</p>
                </div>
              </div>
              
              <div className="security-feature glass-card-small">
                <div className="feature-icon-container-medium">
                  <Users className="feature-icon-svg-medium" size={32} strokeWidth={1.5} />
                </div>
                <div className="feature-content">
                  <h3 className="feature-subtitle">Collaboration.</h3>
                  <p className="feature-text">Work with your team on shared files, without compromising your private data.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
