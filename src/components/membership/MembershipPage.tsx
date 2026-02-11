import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumIcons } from '../icons/PremiumIcons';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import { Check, X } from 'lucide-react';
import './membership.css';

interface MembershipPageProps {
  onSuccess?: () => void;
  onSkip?: () => void;
  showCloseButton?: boolean;
}

const MembershipPage: React.FC<MembershipPageProps> = ({ onSkip, showCloseButton = true }) => {
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

  const freePlanFeatures = [
    { text: 'Unlimited diary entries', included: true },
    { text: '1 AI analysis per day', included: true },
    { text: 'Basic insights & patterns', included: true },
    { text: 'Limited analysis depth', included: false },
    { text: 'Advanced growth recommendations', included: false },
    { text: 'Priority support', included: false },
    { text: 'Export & backup features', included: false },
  ];

  const premiumPlanFeatures = [
    { text: 'Unlimited diary entries', included: true },
    { text: 'Unlimited AI analyses', included: true },
    { text: 'Deep insights & patterns', included: true },
    { text: 'Advanced emotional tracking', included: true },
    { text: 'Personalized growth recommendations', included: true },
    { text: 'Priority support', included: true },
    { text: 'Export & backup features', included: true },
    { text: 'Early access to new features', included: true },
  ];

  return (
    <div className="membership-container-v2">
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
      
      <div className="membership-content-v2">
        {/* Header */}
        <motion.div 
          className="membership-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="membership-title-v2">Choose Your Plan</h1>
          <p className="membership-subtitle-v2">
            Select the plan that best fits your needs
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="plans-grid">
          {/* Free Plan */}
          <motion.div 
            className="plan-card free-plan"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="plan-header">
              <h3 className="plan-name">Free Plan</h3>
              <div className="plan-price">
                <span className="price-amount">$0</span>
                <span className="price-period">/month</span>
              </div>
              <p className="plan-description">
                Perfect for getting started with Insight
              </p>
            </div>

            <div className="plan-features">
              {freePlanFeatures.map((feature, index) => (
                <div key={index} className={`feature-row ${!feature.included ? 'feature-disabled' : ''}`}>
                  {feature.included ? (
                    <Check size={18} className="feature-icon-check" />
                  ) : (
                    <X size={18} className="feature-icon-x" />
                  )}
                  <span className="feature-text">{feature.text}</span>
                </div>
              ))}
            </div>

            <button 
              className="plan-button free-button"
              onClick={handleSkip}
            >
              Continue with Free
            </button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div 
            className="plan-card premium-plan"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="recommended-badge">
              ⭐ Recommended
            </div>
            
            <div className="plan-header">
              <h3 className="plan-name">Premium Plan</h3>
              <div className="plan-price">
                <span className="price-amount">£5</span>
                <span className="price-period">/month</span>
              </div>
              <p className="plan-description">
                14-day free trial • No credit card required
              </p>
            </div>

            <div className="plan-features">
              {premiumPlanFeatures.map((feature, index) => (
                <div key={index} className="feature-row">
                  <Check size={18} className="feature-icon-check premium-check" />
                  <span className="feature-text">{feature.text}</span>
                </div>
              ))}
            </div>

            <button 
              className="plan-button premium-button"
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
                  Start 14-Day Free Trial
                  <PremiumIcons.ArrowRight size={20} />
                </>
              )}
            </button>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <motion.div 
          className="trust-indicators-v2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
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
        </motion.div>
      </div>
    </div>
  );
};

export default MembershipPage;
