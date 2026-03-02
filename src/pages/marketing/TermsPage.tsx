import React from 'react';
import Footer from '../../components/marketing/Footer';
import '../../styles/marketing.css';

const TermsPage: React.FC = () => {
  return (
    <div className="legal-page marketing-page">
      <nav className="floating-nav">
        <div className="floating-nav-inner">
          <div className="floating-nav-logo">
            <img src="/Insight-Logo-nobg.webp" alt="Insight" />
            <span className="floating-nav-brand">Insight</span>
          </div>
          <div className="floating-nav-links">
            <a href="/" className="floating-nav-link">Home</a>
            <a href="/privacy" className="floating-nav-link">Privacy</a>
            <a href="/support" className="floating-nav-link">Support</a>
          </div>
          <a href="/login" className="floating-nav-cta">Try for free</a>
        </div>
      </nav>
      
      <div className="legal-content">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: February 15, 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using InsightAI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>

        <section>
          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of InsightAI for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
          <p>Under this license you may not:</p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained in InsightAI</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section>
          <h2>3. Subscription Terms</h2>
          <p>InsightAI offers auto-renewable subscriptions:</p>
          <ul>
            <li>Weekly: $4.99 per week</li>
            <li>Monthly: $17.99 per month</li>
            <li>Yearly: $69.99 per year</li>
          </ul>
          <p>Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period. You can manage your subscription in your account settings.</p>
        </section>

        <section>
          <h2>4. Cancellation & Refunds</h2>
          <p>You may cancel your subscription at any time. No commitment required. For refund requests, please contact support within 7 days of purchase.</p>
        </section>

        <section>
          <h2>5. User Data</h2>
          <p>You retain all rights to your journal entries and personal data. We use encryption to protect your privacy. See our Privacy Policy for details on data handling.</p>
        </section>

        <section>
          <h2>6. Disclaimer</h2>
          <p>InsightAI is not a substitute for professional mental health care. The AI-powered insights are for informational purposes only and should not be considered medical or therapeutic advice.</p>
        </section>

        <section>
          <h2>7. Limitations</h2>
          <p>In no event shall InsightAI or its suppliers be liable for any damages arising out of the use or inability to use the Service.</p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>For questions about these Terms, please contact us at: <a href="mailto:support@myinsightai.app">support@myinsightai.app</a></p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default TermsPage;
