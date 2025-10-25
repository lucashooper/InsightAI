import React, { useState } from 'react';
import { PremiumIcons } from '../icons/PremiumIcons';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import './membership.css';

interface MembershipPageProps {
  onSuccess?: () => void;
  onSkip?: () => void;
  showCloseButton?: boolean;
}

const MembershipPage: React.FC<MembershipPageProps> = ({ onSuccess, onSkip, showCloseButton = true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSkip = async () => {
    if (user) {
      // Mark welcome as completed when user skips
      await userProfileService.completeWelcome(user.id);
      localStorage.removeItem('insightai-welcome-seen');
    }
    if (onSkip) {
      onSkip();
    } else {
      // Default: reload to show main app
      window.location.reload();
    }
  };

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
      {showCloseButton && (
        <button
          className="membership-close-button"
          onClick={handleSkip}
          aria-label="Close"
        >
          ✕
        </button>
      )}
      
      <div className="membership-content">
        {/* Pricing Card */}
        <div className="pricing-card">
          {/* Logo inside card */}
          <div className="membership-logo">
            <img 
              src="/Insight-logo.png" 
              alt="InsightAI Logo" 
              className="logo-image"
            />
          </div>

          {/* Header */}
          <h1 className="membership-title">Unlock Your Full Potential</h1>
          <p className="membership-subtitle">
            Start your 3-day free trial and experience premium insights
          </p>
          
          {/* Price */}
          <div className="pricing-amount">
            <span className="currency">£</span>
            <span className="price">5</span>
            <span className="period">/month</span>
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
          <button className="skip-button" onClick={handleSkip}>
            Or Continue With Free Plan →
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
