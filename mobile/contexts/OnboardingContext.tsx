import React, { createContext, useContext, useState, ReactNode } from 'react';

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
