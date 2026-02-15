import React from 'react';
import '../../styles/marketing.css';

const SupportPage: React.FC = () => {
  return (
    <div className="legal-page">
      <nav className="main-nav">
        <div className="nav-logo">
          <img src="/InsightAI-Logo-Transparent.png" alt="Insight" style={{ height: '40px', width: 'auto' }} />
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/login" className="nav-link nav-login-btn">Login</a>
        </div>
      </nav>
      
      <div className="legal-content">
        <h1>Support</h1>
        <p className="last-updated">Get help with InsightAI</p>

        <section>
          <h2>Contact Us</h2>
          <p>Need help? We're here for you. Reach out to our support team:</p>
          <p><strong>Email:</strong> <a href="mailto:support@myinsightai.app">support@myinsightai.app</a></p>
          <p>We typically respond within 24 hours.</p>
        </section>

        <section>
          <h2>Frequently Asked Questions</h2>
          
          <h3>How do I cancel my subscription?</h3>
          <p>You can cancel your subscription at any time through your account settings in the app, or through your Apple/Google account subscription management.</p>

          <h3>Is my data secure?</h3>
          <p>Yes! We use end-to-end encryption to protect all your journal entries. Your data is encrypted on your device before being sent to our servers.</p>

          <h3>Can I export my journal entries?</h3>
          <p>Yes, premium users can export their journal entries in multiple formats (PDF, JSON) from the app settings.</p>

          <h3>How does the AI analysis work?</h3>
          <p>Our AI analyzes your journal entries to identify patterns, emotions, and insights. It uses advanced natural language processing while maintaining your privacy through encryption.</p>

          <h3>What's included in the free trial?</h3>
          <p>The 14-day free trial includes full access to all premium features. No credit card required to start.</p>
        </section>

        <section>
          <h2>Technical Support</h2>
          <p>Experiencing technical issues? Please include the following in your support email:</p>
          <ul>
            <li>Device type and operating system version</li>
            <li>App version</li>
            <li>Description of the issue</li>
            <li>Steps to reproduce the problem</li>
          </ul>
        </section>

        <section>
          <h2>Feedback</h2>
          <p>We love hearing from our users! Share your feedback, feature requests, or suggestions at: <a href="mailto:feedback@myinsightai.app">feedback@myinsightai.app</a></p>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;
