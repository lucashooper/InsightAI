import React from 'react';
import Footer from '../../components/marketing/Footer';
import MarketingNav from '../../components/marketing/MarketingNav';
import '../../styles/marketing.css';

const PrivacyPage: React.FC = () => {
  return (
    <div className="legal-page marketing-page">
      <MarketingNav links={[
        { href: '/', label: 'Home' },
        { href: '/terms', label: 'Terms' },
        { href: '/support', label: 'Support' },
      ]} />
      
      <div className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: March 9, 2026</p>

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
          <h2>4. AI-Powered Analysis</h2>
          <p>Insight uses artificial intelligence to provide personalized insights and analysis of your journal entries.</p>
          
          <h3>AI Service Provider</h3>
          <p>We use <strong>Groq</strong>, an AI infrastructure company, running the <strong>Llama 3</strong> language model to analyze your journal entries and generate insights.</p>
          
          <h3>What Data Is Shared</h3>
          <p>When you use AI analysis features in Insight (such as tapping "Analyze" on a journal entry):</p>
          <ul>
            <li>We send the <strong>text content of your journal entry</strong> to Groq's servers</li>
            <li>We do <strong>NOT</strong> send your name, email address, or any other personal identifiers</li>
            <li>Only the journal entry text itself is transmitted for analysis</li>
          </ul>
          
          <h3>How Your Data Is Protected</h3>
          <ul>
            <li>All data is transmitted over <strong>encrypted connections (HTTPS/TLS)</strong></li>
            <li>Groq processes your data according to their privacy policy</li>
            <li><strong>Groq does not use your data to train AI models</strong></li>
            <li>Your journal entries are not stored permanently by Groq after analysis</li>
          </ul>
          
          <h3>Your Control</h3>
          <ul>
            <li>AI analysis features are <strong>optional</strong> - you can journal without using them</li>
            <li>You can choose when to use AI analysis by tapping the "Analyze" button</li>
            <li>All AI-generated insights are stored securely in your Insight account</li>
            <li>You can delete your journal entries and AI insights at any time</li>
          </ul>
          
          <h3>Third-Party Privacy Policy</h3>
          <p>For more information about how Groq handles data, please review their privacy policy: <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer">https://groq.com/privacy-policy/</a></p>
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
      <Footer />
    </div>
  );
};

export default PrivacyPage;
