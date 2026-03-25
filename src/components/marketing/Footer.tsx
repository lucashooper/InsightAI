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
              <a href="https://apps.apple.com/us/app/insight-understand-yourself/id6755717396" target="_blank" rel="noopener noreferrer" className="download-btn-custom">
                <img src="/White-Apple-Logo.png" alt="" className="download-btn-icon" />
                <span className="download-btn-text">iPhone app</span>
              </a>
              <div className="download-btn-custom download-btn-disabled">
                <img src="/Google-Play-Icon.png" alt="" className="download-btn-icon" />
                <span className="download-btn-text">Android app</span>
              </div>
              <a href="/login" className="download-btn-custom">
                <img src="/webapp-icons.svg" alt="" className="download-btn-icon" />
                <span className="download-btn-text">Web app</span>
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

          {/* Socials */}
          <div className="footer-v2-column">
            <h4 className="footer-v2-column-title">Socials</h4>
            <a href="https://www.instagram.com/insightaiapp/" target="_blank" rel="noopener noreferrer" className="footer-v2-link">Instagram</a>
            <a href="https://x.com/insightaiapp" target="_blank" rel="noopener noreferrer" className="footer-v2-link">X (Twitter)</a>
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
