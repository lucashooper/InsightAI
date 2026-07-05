import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer-arise footer-premium-visible">
      <div className="footer-arise-inner">
        <div className="footer-cta-section">
          <div className="footer-cta-icon">
            <img src="/Insight-Logo-1.png" alt="Insight" />
          </div>
          <h2 className="footer-cta-title">Start understanding yourself today.</h2>
          <div className="footer-cta-buttons">
            <a
              href="https://apps.apple.com/us/app/insight-understand-yourself/id6755717396"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/app-store-download-button.avif" alt="Download on the App Store" className="footer-download-badge" />
            </a>
            <img src="/google-play-button-new.avif" alt="Get it on Google Play" className="footer-download-badge footer-download-badge--disabled" />
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-brand-col">
            <div className="footer-brand-name">Insight</div>
          </div>

          <div className="footer-link-col">
            <h4 className="footer-link-title">Downloads</h4>
            <a href="https://apps.apple.com/us/app/insight-understand-yourself/id6755717396" className="footer-link" target="_blank" rel="noopener noreferrer">iOS App</a>
            <a href="/login" className="footer-link">Web App</a>
          </div>

          <div className="footer-link-col">
            <h4 className="footer-link-title">Socials</h4>
            <a href="https://www.instagram.com/insightaiapp/" className="footer-link" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://x.com/insightaiapp" className="footer-link" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
          </div>

          <div className="footer-link-col">
            <h4 className="footer-link-title">Company</h4>
            <a href="/support" className="footer-link">Support</a>
            <a href="mailto:support@myinsightai.app?subject=Insight%20Support%20Request" className="footer-link">Contact</a>
            <a href="/privacy" className="footer-link">Privacy Policy</a>
            <a href="/terms" className="footer-link">Terms of Use</a>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>&copy; 2026 Insight Company LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
