import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import Starfield from '../common/Starfield';
import AuthInput from './AuthInput';
import GoogleButton from './GoogleButton';
import './auth.css';

interface LoginProps {
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
  };

  // Google OAuth login handler using Supabase
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            prompt: 'select_account', // Force account selection
          },
        },
      });

      if (error) {
        setError(error.message || 'Google sign-in failed');
        setLoading(false);
      }
      // If successful, user will be redirected to Google OAuth
    } catch (err) {
      setError('Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Starfield background */}
      <Starfield count={150} />
      
      {/* Second animated orb - Blue */}
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
      
      <div className="auth-card">
        <div className="auth-header">
          <img 
            src="/Insight-Logo-nobg.webp" 
            alt="InsightAI" 
            className="auth-logo"
            style={{ maxWidth: '80px', height: 'auto', marginBottom: '1.5rem' }}
          />
          <h1 className="auth-title">Sign in to Insight</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <AuthInput
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            label="Email or Username"
            required
            disabled={loading}
            icon="email"
          />

          <AuthInput
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            label="Password"
            required
            disabled={loading}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
            icon="lock"
          />

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* OAuth Divider */}
          <div className="oauth-divider">
            <span>OR</span>
          </div>

          {/* Google OAuth Button */}
          <GoogleButton 
            onClick={handleGoogleSignIn} 
            disabled={loading}
          />
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button onClick={onSwitchToSignup} className="auth-link">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
