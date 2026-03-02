import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer-v2">
      <div className="footer-v2-inner">
        <div className="footer-v2-grid">
          {/* Brand + Download */}
          <div className="footer-v2-brand">
            <div className="footer-v2-logo-row">
              <img src="/Insight-Logo-nobg.webp" alt="Insight" className="footer-v2-logo-img" />
              <span className="footer-v2-logo-text">Insight</span>
            </div>
            <div className="footer-v2-downloads">
              <div className="footer-badge-wrapper">
                <img src="/download-with-app-store-button.webp" alt="Download on the App Store" className="footer-badge" />
                <span className="footer-coming-soon-text">Coming Soon</span>
              </div>
              <div className="footer-badge-wrapper">
                <img src="/google-play-button.webp" alt="Get it on Google Play" className="footer-badge" />
                <span className="footer-coming-soon-text">Coming Soon</span>
              </div>
              <a href="/login" className="footer-badge-wrapper footer-badge-web">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span>Web App</span>
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="footer-v2-column">
            <h4 className="footer-v2-column-title">Legal</h4>
            <a href="/privacy" className="footer-v2-link">Privacy Policy</a>
            <a href="/terms" className="footer-v2-link">Terms of Use</a>
          </div>

          {/* Company */}
          <div className="footer-v2-column">
            <h4 className="footer-v2-column-title">Company</h4>
            <a href="/support" className="footer-v2-link">Support</a>
            <a href="mailto:support@myinsightai.app?subject=Insight%20Support%20Request" className="footer-v2-link">Contact</a>
          </div>
        </div>

        <div className="footer-v2-bottom">
          <p>&copy; Copyright 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
