import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import './auth.css';

const WelcomeScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleGetStarted = async () => {
    if (!user) return;
    
    setLoading(true);
    await userProfileService.completeWelcome(user.id);
    setLoading(false);
  };

  return (
    <div className="welcome-container">
      {/* Animated gradient orbs for depth */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
        top: '-200px',
        right: '-200px',
        zIndex: 2,
        animation: 'float 20s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        bottom: '-150px',
        left: '-150px',
        zIndex: 2,
        animation: 'float 15s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />
      
      <motion.div
        className="welcome-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Star background decoration */}
        <div className="welcome-stars">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="star"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="welcome-content">
          <motion.div
            className="logo-container"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <img 
              src="/Insight-logo.png" 
              alt="InsightAI Logo" 
              className="auth-logo"
            />
          </motion.div>

          <motion.h1
            className="welcome-title"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome to InsightAI
          </motion.h1>

          <motion.p
            className="welcome-subtitle"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your thoughts are the seeds of clarity. Let's nurture them together.
          </motion.p>

          <motion.div
            className="welcome-features"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="feature-item">
              <Brain className="feature-icon" />
              <span className="feature-text">AI-powered insights from your entries</span>
            </div>
            <div className="feature-item">
              <TrendingUp className="feature-icon" />
              <span className="feature-text">Track patterns and emotional trends</span>
            </div>
            <div className="feature-item">
              <Target className="feature-icon" />
              <span className="feature-text">Personalized growth recommendations</span>
            </div>
          </motion.div>

          <motion.button
            className="welcome-button"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={handleGetStarted}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'Loading...' : "Let's Begin →"}
          </motion.button>

          <motion.p
            className="welcome-tip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            💡 Tip: Write regularly to unlock the full power of AI insights
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
