import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="footer-logo">
              Insight<span className="gradient-text">AI</span>
            </h3>
            <p className="footer-tagline">Your AI-powered journal companion</p>
          </div>
          
          <div className="footer-column">
            <h4>Product</h4>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#security">Security</a>
              <a href="#pricing">Pricing</a>
              <a href="/app">Try Now</a>
            </div>
          </div>
          
          <div className="footer-column">
            <h4>Resources</h4>
            <div className="footer-links">
              <a href="#docs">Documentation</a>
              <a href="#guides">Guides</a>
              <a href="#blog">Blog</a>
              <a href="#support">Support</a>
            </div>
          </div>
          
          <div className="footer-column">
            <h4>Company</h4>
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
          <div className="footer-social">
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="GitHub">GitHub</a>
            <a href="#" aria-label="Discord">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
