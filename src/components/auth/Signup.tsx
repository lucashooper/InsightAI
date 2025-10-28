import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Starfield from '../common/Starfield';
import AuthInput from './AuthInput';
import './auth.css';

interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(email, password, username);

    if (signUpError) {
      setError(signUpError.message);
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
        {/* Back Button */}
        <button
          onClick={onSwitchToLogin}
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '0.5rem',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
          aria-label="Back to sign in"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="auth-header">
          <div className="logo-container">
            <img 
              src="/Insight-logo.png" 
              alt="InsightAI" 
              className="auth-logo"
            />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start your journey with InsightAI</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <AuthInput
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            label="Username"
            required
            disabled={loading}
            icon="user"
          />

          <AuthInput
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            label="Email"
            required
            disabled={loading}
            icon="email"
          />

          <div>
            <AuthInput
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              label="Password"
              required
              disabled={loading}
              minLength={6}
              showPasswordToggle
              onTogglePassword={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
              icon="lock"
            />
            <small style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>Must be at least 6 characters</small>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="auth-link">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
