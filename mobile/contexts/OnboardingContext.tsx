import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { analytics } from '../services/analytics';

interface OnboardingContextType {
  userName: string;
  setUserName: (name: string) => void;
  onboardingAnswers: Record<string, string>;
  setOnboardingAnswers: (answers: Record<string, string>) => void;
  resetForNewSession: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, string>>({});
  const prevUserIdRef = useRef<string | null>(null);

  // CRITICAL: Reset all onboarding state when user signs out
  // This ensures a completely blank slate on the onboarding page
  useEffect(() => {
    const currentUserId = user?.id || null;
    if (prevUserIdRef.current !== null && currentUserId === null) {
      // User just signed out - reset everything
      console.log('[OnboardingContext] User signed out - resetting all state');
      setUserName('');
      setOnboardingAnswers({});
    }
    prevUserIdRef.current = currentUserId;
  }, [user]);

  // Load cached username on mount ONLY if user is authenticated (from social sign-in)
  // Don't load it if user just signed out - that's handled by the reset effect above
  useEffect(() => {
    const loadCachedUsername = async () => {
      try {
        // Only load cached username if we have a user (social sign-in flow)
        if (!user) {
          console.log('[OnboardingContext] No user, skipping cached username load');
          return;
        }
        
        const cached = await AsyncStorage.getItem('CACHED_USERNAME');
        if (cached) {
          // Don't use cached username if it looks like a random hash (e.g., "dxysfs9kj2")
          // This happens when Apple doesn't provide a name with Hide My Email
          // Only reject strings that have digits mixed with letters AND no spaces (random hashes)
          const looksLikeRandomHash = /\d/.test(cached) && /[a-z]/i.test(cached) && !/\s/.test(cached) && cached.length < 10;
          if (looksLikeRandomHash) {
            console.log('[OnboardingContext] Cached username looks like random hash, ignoring:', cached);
            await AsyncStorage.removeItem('CACHED_USERNAME');
            return;
          }
          console.log('[OnboardingContext] Loaded cached username:', cached);
          setUserName(cached);
        }
      } catch (error) {
        console.error('[OnboardingContext] Error loading cached username:', error);
      }
    };
    loadCachedUsername();
  }, [user]);

  const setUserNameWithLogging = (name: string) => {
    console.log('[OnboardingContext] setUserName called with:', name);
    setUserName(name);
    console.log('[OnboardingContext] userName state updated to:', name);
  };

  // Reset all onboarding state for a fresh session (called on sign-out or new sign-in)
  const resetForNewSession = async () => {
    console.log('[OnboardingContext] Resetting for new session');
    setUserName('');
    setOnboardingAnswers({});
    try {
      await AsyncStorage.removeItem('CACHED_USERNAME');
      await AsyncStorage.removeItem('SKIP_NAME_STEP');
    } catch (error) {
      console.error('[OnboardingContext] Error clearing cached data:', error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        userName,
        setUserName: setUserNameWithLogging,
        onboardingAnswers,
        setOnboardingAnswers,
        resetForNewSession,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
