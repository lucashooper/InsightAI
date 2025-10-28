import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import Starfield from '../common/Starfield';
import AuthInput from './AuthInput';
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
  const { signIn, signInWithGoogle } = useAuth();

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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google sign-in failed: No credential received');
      return;
    }

    setLoading(true);
    setError('');

    const { error: googleError } = await signInWithGoogle(credentialResponse.credential);

    if (googleError) {
      setError(googleError.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed');
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
          <div className="logo-container">
            <img 
              src="/Insight-logo.png" 
              alt="InsightAI" 
              className="auth-logo"
            />
          </div>
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
          <div className="google-oauth-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </div>
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
