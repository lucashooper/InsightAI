import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer-premium">
      <div className="container">
        <div className="footer-content-minimal">
          <div className="footer-brand">
            <h3 className="footer-logo">
              Insight
            </h3>
            <p className="footer-tagline">Your AI-powered journal companion</p>
          </div>
          
          <div className="footer-links-minimal">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/support">Support</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Insight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
