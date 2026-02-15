import React from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: 'free' | 'pro';
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, currentTier }) => {
  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '0 AI analyses per day',
        'Unlimited journal entries',
        'Basic insights',
        'All themes',
      ],
      current: currentTier === 'free',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$4.99',
      period: 'per month',
      features: [
        '2 AI analyses per day',
        'Unlimited journal entries',
        'Premium insights & features',
        'All themes',
        'Priority support',
      ],
      current: currentTier === 'pro',
      popular: true,
    },
  ];

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.1)',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div style={{ padding: '40px 40px 20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={24} color="#a78bfa" />
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '600', color: '#fff' }}>
                Choose Your Plan
              </h2>
            </div>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '16px' }}>
              {currentTier === 'pro' 
                ? 'Manage your subscription or explore other options'
                : 'Upgrade to unlock premium features and AI-powered insights'}
            </p>
          </div>

          {/* Plans Grid */}
          <div style={{ 
            padding: '20px 40px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  position: 'relative',
                  background: plan.current 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: plan.current 
                    ? '2px solid rgba(139, 92, 246, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  transition: 'all 0.3s ease',
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    padding: '4px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#fff',
                  }}>
                    POPULAR
                  </div>
                )}

                {plan.current && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#a78bfa',
                  }}>
                    CURRENT
                  </div>
                )}

                <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#fff' }}>
                  {plan.name}
                </h3>
                
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '700', color: '#fff' }}>{plan.price}</span>
                  <span style={{ fontSize: '14px', color: '#9ca3af', marginLeft: '8px' }}>/ {plan.period}</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginBottom: '12px',
                      color: '#e5e7eb',
                      fontSize: '14px',
                    }}>
                      <Check size={16} color="#a78bfa" style={{ flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (plan.id === 'pro' && currentTier === 'free') {
                      window.alert('To upgrade to Pro, please use the Insight mobile app and subscribe through the App Store. Your subscription will automatically sync to desktop!');
                    } else if (plan.id === 'free' && currentTier === 'pro') {
                      window.alert('To cancel your Pro subscription, please manage it through the App Store on your mobile device or visit apps.apple.com/account/subscriptions');
                    }
                  }}
                  disabled={plan.current}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    border: plan.current ? '1px solid rgba(139, 92, 246, 0.3)' : 'none',
                    background: plan.current 
                      ? 'transparent'
                      : plan.id === 'pro'
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: plan.current ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: plan.current ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!plan.current) {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.current) {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {plan.current ? 'Current Plan' : plan.id === 'pro' ? 'Upgrade to Pro' : 'Downgrade'}
                </button>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div style={{ 
            padding: '0 40px 40px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '14px',
          }}>
            {currentTier === 'pro' ? (
              <p style={{ margin: 0 }}>
                💡 To manage your subscription billing or cancel, visit the App Store on your mobile device or{' '}
                <a 
                  href="https://apps.apple.com/account/subscriptions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#a78bfa', textDecoration: 'none' }}
                >
                  apps.apple.com/account/subscriptions
                </a>
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                💡 Subscriptions are managed through the App Store. Changes sync automatically across all devices.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubscriptionModal;
