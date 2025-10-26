import React, { useState } from 'react';
import { Lock, Shield, AlertTriangle, Copy, Check } from 'lucide-react';
import { encryptionService } from '../../services/encryptionService';
import { userProfileService } from '../../services/userProfileService';

interface SetupEncryptionModalProps {
  userId: string;
  onComplete: () => void;
  onSkip?: () => void;
}

const SetupEncryptionModal: React.FC<SetupEncryptionModalProps> = ({ userId, onComplete, onSkip }) => {
  const [step, setStep] = useState<'intro' | 'password' | 'confirm' | 'recovery'>('intro');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recoveryKeyCopied, setRecoveryKeyCopied] = useState(false);
  const [understoodWarning, setUnderstoodWarning] = useState(false);

  const handleNext = async () => {
    setError('');

    if (step === 'intro') {
      setStep('password');
      return;
    }

    if (step === 'password') {
      // Validate password
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setStep('recovery');
      
      // Generate recovery key
      const key = encryptionService.generateRecoveryKey();
      setRecoveryKey(key);
      return;
    }

    if (step === 'recovery') {
      if (!recoveryKeyCopied) {
        setError('Please copy your recovery key before continuing');
        return;
      }
      if (!understoodWarning) {
        setError('Please confirm you understand the warning');
        return;
      }

      // Setup encryption
      setIsProcessing(true);
      try {
        // Initialize encryption with password
        const { salt } = await encryptionService.initializeEncryption(password);

        // Create test payload for password verification
        const testPayload = await encryptionService.createTestPayload();

        // Store encryption data in user profile
        await userProfileService.updateUserProfile(userId, {
          encryption_enabled: true,
          encryption_salt: salt,
          encryption_test_payload: testPayload
        });

        console.log('✅ Encryption setup complete');
        onComplete();
      } catch (err) {
        console.error('Error setting up encryption:', err);
        setError('Failed to setup encryption. Please try again.');
        setIsProcessing(false);
      }
    }
  };

  const copyRecoveryKey = () => {
    navigator.clipboard.writeText(recoveryKey);
    setRecoveryKeyCopied(true);
    setTimeout(() => setRecoveryKeyCopied(false), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '24px',
        padding: '3rem',
        maxWidth: '550px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Intro Step */}
        {step === 'intro' && (
          <>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '20px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <Shield size={48} color="white" />
              </div>
              <h2 style={{
                margin: 0,
                color: 'white',
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '0.5rem'
              }}>
                Zero-Knowledge Encryption
              </h2>
              <p style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                Your journal entries will be encrypted on your device before being stored. Only you can decrypt them.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <Lock size={24} color="#a78bfa" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: 'white', fontSize: '1rem' }}>
                    True Privacy
                  </h4>
                  <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    We literally cannot read your journals, even if we wanted to
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <Shield size={24} color="#a78bfa" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: 'white', fontSize: '1rem' }}>
                    AI Features Work
                  </h4>
                  <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    Analysis happens on decrypted data temporarily, never stored
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleNext}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Setup Encryption
              </button>

              {onSkip && (
                <button
                  onClick={onSkip}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  }}
                >
                  Skip for Now (Not Recommended)
                </button>
              )}
            </div>
          </>
        )}

        {/* Password Step */}
        {step === 'password' && (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                margin: '0 0 0.5rem 0',
                color: 'white',
                fontSize: '1.75rem',
                fontWeight: '600'
              }}>
                Create Encryption Password
              </h2>
              <p style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.95rem'
              }}>
                This password encrypts your journals. Choose a strong, memorable password.
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Password (min 8 characters)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '10px',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '10px',
                  border: error ? '2px solid #ef4444' : '2px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {error && (
                <div style={{
                  marginTop: '0.5rem',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={!password || !confirmPassword}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: password && confirmPassword ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(139, 92, 246, 0.3)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: password && confirmPassword ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              Continue
            </button>
          </>
        )}

        {/* Recovery Key Step */}
        {step === 'recovery' && (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                margin: '0 0 0.5rem 0',
                color: 'white',
                fontSize: '1.75rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertTriangle color="#f59e0b" size={28} />
                Recovery Key
              </h2>
              <p style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.95rem'
              }}>
                Save this key somewhere safe. You'll need it if you forget your password.
              </p>
            </div>

            <div style={{
              marginBottom: '1.5rem',
              padding: '1.25rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              position: 'relative'
            }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                color: 'white',
                wordBreak: 'break-all',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                {recoveryKey}
              </div>
              <button
                onClick={copyRecoveryKey}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  background: recoveryKeyCopied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {recoveryKeyCopied ? (
                  <>
                    <Check size={18} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy Recovery Key
                  </>
                )}
              </button>
            </div>

            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.5'
              }}>
                <input
                  type="checkbox"
                  checked={understoodWarning}
                  onChange={(e) => setUnderstoodWarning(e.target.checked)}
                  style={{
                    marginTop: '0.25rem',
                    cursor: 'pointer'
                  }}
                />
                <span>
                  I understand that if I lose both my password and recovery key, my data <strong>cannot be recovered</strong>.
                </span>
              </label>
            </div>

            {error && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={isProcessing || !understoodWarning}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: understoodWarning && !isProcessing ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(139, 92, 246, 0.3)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: understoodWarning && !isProcessing ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              {isProcessing ? 'Setting up encryption...' : 'Complete Setup'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SetupEncryptionModal;
