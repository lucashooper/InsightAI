import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer-premium">
      <div className="container">
        <div className="footer-content-premium">
          <div className="footer-brand">
            <h3 className="footer-logo">
              Insight<span className="gradient-text">AI</span>
            </h3>
            <p className="footer-tagline">Your AI-powered journal companion</p>
          </div>
          
          <div className="footer-column">
            <h4 className="footer-column-title">PRODUCT</h4>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#security">Security</a>
              <a href="#pricing">Pricing</a>
              <a href="/app">Try Now</a>
            </div>
          </div>
          
          <div className="footer-column">
            <h4 className="footer-column-title">RESOURCES</h4>
            <div className="footer-links">
              <a href="#docs">Documentation</a>
              <a href="#guides">Guides</a>
              <a href="#blog">Blog</a>
              <a href="#support">Support</a>
            </div>
          </div>
          
          <div className="footer-column">
            <h4 className="footer-column-title">COMPANY</h4>
            <div className="footer-links">
              <a href="#about">About</a>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 InsightAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
