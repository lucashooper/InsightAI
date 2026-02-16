import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  userName: string;
  setUserName: (name: string) => void;
  onboardingAnswers: Record<string, string>;
  setOnboardingAnswers: (answers: Record<string, string>) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState<string>('');
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, string>>({});

  // Load cached username on mount (for Apple/Google Sign-In users)
  useEffect(() => {
    const loadCachedUsername = async () => {
      try {
        const cached = await AsyncStorage.getItem('CACHED_USERNAME');
        if (cached) {
          console.log('[OnboardingContext] Loaded cached username:', cached);
          setUserName(cached);
        }
      } catch (error) {
        console.error('[OnboardingContext] Error loading cached username:', error);
      }
    };
    loadCachedUsername();
  }, []);

  const setUserNameWithLogging = (name: string) => {
    console.log('[OnboardingContext] setUserName called with:', name);
    setUserName(name);
    console.log('[OnboardingContext] userName state updated to:', name);
  };

  return (
    <OnboardingContext.Provider
      value={{
        userName,
        setUserName: setUserNameWithLogging,
        onboardingAnswers,
        setOnboardingAnswers,
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
