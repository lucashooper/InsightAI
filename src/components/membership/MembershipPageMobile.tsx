import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumIcons } from '../icons/PremiumIcons';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import { Check, Smartphone } from 'lucide-react';
import './membership.css';

interface MembershipPageMobileProps {
  onSuccess?: () => void;
  onSkip?: () => void;
  showCloseButton?: boolean;
}

const MembershipPageMobile: React.FC<MembershipPageMobileProps> = ({ onSkip, showCloseButton = true }) => {
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'yearly'>('yearly');
  const { user } = useAuth();

  const handleSkip = async () => {
    if (user) {
      await userProfileService.completeWelcome(user.id);
      localStorage.removeItem('insightai-welcome-seen');
    }
    if (onSkip) {
      onSkip();
    } else {
      window.location.reload();
    }
  };

  const plans = [
    {
      id: 'weekly' as const,
      name: 'Weekly',
      price: '$4.99',
      period: 'per week',
      daily: '$0.71 / day',
      badge: null,
    },
    {
      id: 'yearly' as const,
      name: 'Yearly',
      price: '$69.99',
      period: 'per year',
      daily: '$0.19 / day',
      badge: 'Save 73%',
    },
    {
      id: 'monthly' as const,
      name: 'Monthly',
      price: '$17.99',
      period: 'per month',
      daily: '$0.60 / day',
      badge: null,
    },
  ];

  const features = [
    'Unlimited AI-powered journal insights',
    'Deep pattern & trigger detection',
    'Personalized weekly summaries',
    'Growth playbook & action plans',
    'End-to-end encryption',
    'Export & backup features',
    'Priority support',
  ];

  return (
    <div className="membership-container-v2">
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
        <motion.div 
          className="membership-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="membership-title-v2">Choose Your Plan</h1>
          <p className="membership-subtitle-v2">
            Subscribe on mobile to unlock all features
          </p>
        </motion.div>

        {/* Plans Row */}
        <div className="plans-row-compact">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`compact-plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              {plan.badge && (
                <div className="plan-badge">{plan.badge}</div>
              )}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-daily">{plan.daily}</div>
              <div className="plan-price-compact">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          className="features-list-compact"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="features-title">What You Get:</h3>
          {features.map((feature, index) => (
            <div key={index} className="feature-row-compact">
              <Check size={18} className="feature-check" />
              <span>{feature}</span>
            </div>
          ))}
        </motion.div>

        {/* Mobile Subscribe CTA */}
        <motion.div
          className="mobile-subscribe-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="mobile-info-box">
            <Smartphone size={24} className="mobile-icon" />
            <div className="mobile-info-text">
              <h4>Subscribe on Mobile</h4>
              <p>Download the InsightAI app on your iPhone or Android device to subscribe and unlock all premium features.</p>
            </div>
          </div>

          <div className="app-download-buttons">
            <a 
              href="https://apps.apple.com/app/insightai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="app-store-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              App Store
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=com.insightai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="play-store-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              Google Play
            </a>
          </div>

          <button 
            className="continue-free-button"
            onClick={handleSkip}
          >
            Continue with Limited Free Version
          </button>

          <p className="already-subscribed-text">
            Already subscribed on mobile? Just log in with the same account to access all features on web.
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          className="trust-indicators-v2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
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

export default MembershipPageMobile;
