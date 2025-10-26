import React, { useState } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { encryptionService } from '../../services/encryptionService';
import type { UserProfile } from '../../services/userProfileService';

interface UnlockVaultModalProps {
  userProfile: UserProfile;
  onUnlock: () => void;
  onCancel?: () => void;
}

const UnlockVaultModal: React.FC<UnlockVaultModalProps> = ({ userProfile, onUnlock, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUnlocking(true);

    try {
      if (!userProfile.encryption_salt || !userProfile.encryption_test_payload) {
        throw new Error('Encryption not properly set up');
      }

      // Verify password by attempting to decrypt test payload
      const isValid = await encryptionService.verifyPassword(
        password,
        userProfile.encryption_salt,
        userProfile.encryption_test_payload
      );

      if (!isValid) {
        setError('Incorrect password. Please try again.');
        setIsUnlocking(false);
        return;
      }

      // Initialize encryption with the correct password
      await encryptionService.initializeEncryption(password, userProfile.encryption_salt);

      console.log('✅ Vault unlocked successfully');
      onUnlock();
    } catch (err) {
      console.error('Error unlocking vault:', err);
      setError('Failed to unlock vault. Please try again.');
      setIsUnlocking(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '20px',
        padding: '2.5rem',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '12px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Lock size={28} color="white" />
          </div>
          <div>
            <h2 style={{
              margin: 0,
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Unlock Your Vault
            </h2>
            <p style={{
              margin: '0.25rem 0 0 0',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem'
            }}>
              Enter your encryption password
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.75rem'
        }}>
          <Lock size={20} color="#a78bfa" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.5' }}>
            Your notes are <strong>end-to-end encrypted</strong>. Only you can decrypt them with your password.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleUnlock}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Encryption Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
              disabled={isUnlocking}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '10px',
                border: error ? '2px solid #ef4444' : '2px solid rgba(139, 92, 246, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#8b5cf6';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                if (!error) {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                }
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
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

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '2rem'
          }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isUnlocking}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: isUnlocking ? 'not-allowed' : 'pointer',
                  opacity: isUnlocking ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isUnlocking) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isUnlocking || !password}
              style={{
                flex: 1,
                padding: '0.875rem',
                borderRadius: '10px',
                border: 'none',
                background: password && !isUnlocking ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(139, 92, 246, 0.3)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (isUnlocking || !password) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (password && !isUnlocking) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isUnlocking ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                  Unlocking...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Unlock Vault
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.6)',
          lineHeight: '1.5'
        }}>
          <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>⚠️ Important:</strong> If you forget your password, your notes cannot be recovered. Make sure to backup your recovery key.
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UnlockVaultModal;
