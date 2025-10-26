import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import { encryptionService } from '../../services/encryptionService';
import UnlockVaultModal from './UnlockVaultModal';
import SetupEncryptionModal from './SetupEncryptionModal';

interface EncryptionGateProps {
  children: React.ReactNode;
}

/**
 * EncryptionGate wraps the app and handles encryption setup/unlock flow
 * - If user has encryption enabled but vault is locked → Show unlock modal
 * - If new user without encryption → Show setup modal
 * - If encryption unlocked → Render children
 */
const EncryptionGate: React.FC<EncryptionGateProps> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    checkEncryptionStatus();
  }, [user]);

  const checkEncryptionStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Load user profile
      const profile = await userProfileService.getUserProfile(user.id);
      
      if (!profile) {
        setIsLoading(false);
        return;
      }

      setUserProfile(profile);

      // Check if encryption is enabled
      if (profile.encryption_enabled) {
        // Check if vault is unlocked in this session
        if (encryptionService.isEncryptionActive()) {
          console.log('✅ Vault already unlocked');
          setIsLoading(false);
          return;
        }

        // Vault is locked, need to unlock
        console.log('🔒 Vault is locked, showing unlock modal');
        setShowUnlock(true);
        setIsLoading(false);
        return;
      }

      // Check if user has completed onboarding but hasn't set up encryption yet
      // This catches users who just finished username selection
      const hasCompletedOnboarding = profile.has_completed_welcome;
      const hasEncryption = !!profile.encryption_enabled;
      
      // Show encryption setup for users who completed onboarding but don't have encryption
      if (hasCompletedOnboarding && !hasEncryption) {
        // Check if they explicitly skipped encryption (we'll add this flag)
        const hasSkippedEncryption = localStorage.getItem(`insightai-skip-encryption-${user.id}`) === 'true';
        
        if (!hasSkippedEncryption) {
          console.log('🆕 User completed onboarding, showing encryption setup');
          setShowSetup(true);
          setIsLoading(false);
          return;
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking encryption status:', error);
      setIsLoading(false);
    }
  };

  const handleSetupComplete = async () => {
    console.log('✅ Encryption setup complete');
    setShowSetup(false);
    
    // Reload profile to get updated encryption status
    if (user) {
      const updatedProfile = await userProfileService.getUserProfile(user.id);
      setUserProfile(updatedProfile);
    }
  };

  const handleSkipEncryption = () => {
    console.log('⏭️ User skipped encryption setup');
    if (user) {
      localStorage.setItem(`insightai-skip-encryption-${user.id}`, 'true');
    }
    setShowSetup(false);
  };

  const handleUnlockComplete = () => {
    console.log('✅ Vault unlocked');
    setShowUnlock(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Show setup modal for new users
  if (showSetup && user) {
    return (
      <SetupEncryptionModal 
        userId={user.id} 
        onComplete={handleSetupComplete}
        onSkip={handleSkipEncryption}
      />
    );
  }

  // Show unlock modal if vault is locked
  if (showUnlock && userProfile) {
    return <UnlockVaultModal userProfile={userProfile} onUnlock={handleUnlockComplete} />;
  }

  // Render app
  return <>{children}</>;
};

export default EncryptionGate;
