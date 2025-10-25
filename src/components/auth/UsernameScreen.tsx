import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import './auth.css';

interface UsernameScreenProps {
  onComplete?: () => void;
}

const UsernameScreen: React.FC<UsernameScreenProps> = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Generate stars ONCE and memoize them so they never change
  const stars = useMemo(() => {
    return [...Array(120)].map((_, i) => {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.5 + 0.3;
      
      return {
        id: `star-${i}`,
        x,
        y,
        size,
        opacity
      };
    });
  }, []); // Empty dependency array = only runs once

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Check if profile already exists
      let profile = await userProfileService.getUserProfile(user.id);
      
      if (profile) {
        // Profile exists, just update the username
        profile = await userProfileService.updateUserProfile(user.id, {
          username: username.trim()
        });
      } else {
        // Create new profile
        profile = await userProfileService.createUserProfile(
          user.id,
          username.trim(),
          user.email || ''
        );
      }
      
      if (profile) {
        if (onComplete) {
          onComplete();
        } else {
          window.location.reload();
        }
      } else {
        setError('Failed to save username. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Username setup error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Starfield background - completely static, memoized to prevent re-renders */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'white',
              borderRadius: '50%',
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity * 0.8})`
            }}
          />
        ))}
      </div>

      {/* Static gradient orbs - no animation */}
      <div style={{
        position: 'fixed',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        top: '-200px',
        right: '-200px',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'fixed',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        bottom: '-150px',
        left: '-150px',
        pointerEvents: 'none'
      }} />

      {/* Username Card */}
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: '450px',
          width: '90%'
        }}
      >
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Choose Your Username
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '2rem',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          This is how you'll be identified in InsightAI
        </p>

        {/* Username Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Enter your username"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: error ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.border = '2px solid #8b5cf6';
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.15)';
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          {error && (
            <p style={{
              margin: '0.75rem 0 0 0',
              color: '#ef4444',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !username.trim()}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '12px',
            border: 'none',
            background: (loading || !username.trim()) 
              ? 'rgba(139, 92, 246, 0.3)' 
              : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: (loading || !username.trim()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: (loading || !username.trim()) ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading && username.trim()) {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {loading ? 'Setting up...' : 'Continue →'}
        </button>

        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.4)',
          textAlign: 'center'
        }}>
          You can change this later in settings
        </p>
      </motion.div>
    </div>
  );
};

export default UsernameScreen;
