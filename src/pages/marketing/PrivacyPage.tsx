import React from 'react';
import '../../styles/marketing.css';

const PrivacyPage: React.FC = () => {
  return (
    <div className="legal-page">
      <nav className="main-nav">
        <div className="nav-logo">
          <img src="/Insight-Logo-nobg.webp" alt="Insight" style={{ height: '80px', width: 'auto' }} />
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/login" className="nav-link nav-login-btn">Login</a>
        </div>
      </nav>
      
      <div className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: February 15, 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us:</p>
          <ul>
            <li>Account information (email, name)</li>
            <li>Journal entries and personal reflections</li>
            <li>Usage data and analytics</li>
            <li>Payment information (processed securely through Apple/Google)</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and improve our AI-powered journaling service</li>
            <li>Generate personalized insights and analysis</li>
            <li>Process your subscription payments</li>
            <li>Send you service updates and notifications</li>
            <li>Respond to your requests and support inquiries</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Security & Encryption</h2>
          <p>Your privacy is our top priority. We implement industry-standard security measures:</p>
          <ul>
            <li>End-to-end encryption for all journal entries</li>
            <li>Secure data storage with encryption at rest</li>
            <li>Regular security audits and updates</li>
            <li>No selling of personal data to third parties</li>
          </ul>
        </section>

        <section>
          <h2>4. AI Processing</h2>
          <p>Your journal entries are processed by AI to generate insights. This processing:</p>
          <ul>
            <li>Happens securely on our servers</li>
            <li>Uses encrypted data transmission</li>
            <li>Does not share your personal data with AI providers</li>
            <li>Can be disabled in your settings</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <p>We retain your data for as long as your account is active. You can delete your account and all associated data at any time through the app settings.</p>
        </section>

        <section>
          <h2>6. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>Supabase for secure data storage</li>
            <li>RevenueCat for subscription management</li>
            <li>Apple/Google for payment processing</li>
          </ul>
          <p>These services have their own privacy policies governing their use of your information.</p>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request data correction or deletion</li>
            <li>Export your journal entries</li>
            <li>Opt out of analytics</li>
            <li>Cancel your subscription at any time</li>
          </ul>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>InsightAI is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@myinsightai.app">privacy@myinsightai.app</a></p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
