import React, { useState } from 'react';
import { PremiumIcons } from '../icons/PremiumIcons';
import './membership.css';

interface MembershipPageProps {
  onSuccess: () => void;
  onSkip?: () => void;
  showCloseButton?: boolean;
}

const MembershipPage: React.FC<MembershipPageProps> = ({ onSuccess, onSkip, showCloseButton = true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call Netlify Function to create checkout session
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1SKrDtAN91Um40UbiS3HguVw',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="membership-container">
      {/* Close Button */}
      {showCloseButton && onSkip && (
        <button
          className="membership-close-button"
          onClick={onSkip}
          aria-label="Close"
        >
          ✕
        </button>
      )}
      
      <div className="membership-content">
        {/* Logo */}
        <div className="membership-logo">
          <img 
            src="/Insight-logo.png" 
            alt="InsightAI Logo" 
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              marginBottom: '1rem'
            }}
          />
        </div>

        {/* Header */}
        <div className="membership-header">
          <div className="membership-icon">
            <PremiumIcons.Sparkles size={48} />
          </div>
          <h1 className="membership-title">Unlock Your Full Potential</h1>
          <p className="membership-subtitle">
            Start your 3-day free trial and experience premium insights
          </p>
        </div>

        {/* Pricing Card */}
        <div className="pricing-card">
          <div className="pricing-badge">
            <PremiumIcons.Crown size={16} />
            <span>Premium</span>
          </div>
          
          <div className="pricing-amount">
            <span className="currency">£</span>
            <span className="price">5</span>
            <span className="period">/month</span>
          </div>

          <div className="trial-badge">
            🎉 3-Day Free Trial
          </div>

          {/* Features List */}
          <div className="features-list">
            <div className="feature-item">
              <PremiumIcons.Sparkles size={20} color="#22c55e" />
              <span>AI-Powered Deep Insights</span>
            </div>
            <div className="feature-item">
              <PremiumIcons.TrendingUp size={20} color="#22c55e" />
              <span>Advanced Pattern Recognition</span>
            </div>
            <div className="feature-item">
              <PremiumIcons.Target size={20} color="#22c55e" />
              <span>Personalized Growth Opportunities</span>
            </div>
            <div className="feature-item">
              <PremiumIcons.Brain size={20} color="#22c55e" />
              <span>Mental Health Tracking</span>
            </div>
            <div className="feature-item">
              <PremiumIcons.Shield size={20} color="#22c55e" />
              <span>Unlimited Entries & Analysis</span>
            </div>
            <div className="feature-item">
              <PremiumIcons.Zap size={20} color="#22c55e" />
              <span>Real-time Sentiment Analysis</span>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            className="subscribe-button"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Processing...
              </>
            ) : (
              <>
                Start Free Trial
                <PremiumIcons.ArrowRight size={20} />
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="pricing-note">
            Cancel anytime. No commitment required.
          </div>
        </div>

        {/* Skip Option */}
        {onSkip && (
          <button className="skip-button" onClick={onSkip}>
            Continue with Free Plan →
          </button>
        )}

        {/* Trust Indicators */}
        <div className="trust-indicators">
          <div className="trust-item">
            <PremiumIcons.Lock size={16} />
            <span>Secure Payment</span>
          </div>
          <div className="trust-item">
            <PremiumIcons.Shield size={16} />
            <span>Data Protected</span>
          </div>
          <div className="trust-item">
            <PremiumIcons.Check size={16} />
            <span>Cancel Anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
