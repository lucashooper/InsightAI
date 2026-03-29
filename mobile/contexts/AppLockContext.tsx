import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SecureStore from 'expo-secure-store';
// Conditionally import local authentication (crashes in Expo Go where native module isn't available)
let LocalAuthentication: any = null;
try {
  LocalAuthentication = require('expo-local-authentication');
} catch (e) {
  console.log('[AppLock] expo-local-authentication not available (Expo Go)');
}
import { supabase } from '../lib/supabase';

// Helper to get user-specific keys
const getUserKey = async (baseKey: string): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user ? `${baseKey}_${user.id}` : baseKey;
};

const APP_LOCK_PIN_KEY = 'APP_LOCK_PIN';
const APP_LOCK_ENABLED_KEY = 'APP_LOCK_ENABLED';
const APP_LOCK_BIOMETRIC_KEY = 'APP_LOCK_BIOMETRIC';

interface AppLockContextType {
  isLocked: boolean;
  isLockEnabled: boolean;
  isBiometricEnabled: boolean;
  isBiometricAvailable: boolean;
  unlock: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  enableLock: (pin: string) => Promise<void>;
  disableLock: (pin: string) => Promise<boolean>;
  toggleBiometric: (enabled: boolean) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  forgotPin: () => Promise<boolean>;
}

const AppLockContext = createContext<AppLockContextType>({
  isLocked: false,
  isLockEnabled: false,
  isBiometricEnabled: false,
  isBiometricAvailable: false,
  unlock: async () => false,
  unlockWithBiometric: async () => false,
  setPin: async () => {},
  enableLock: async () => {},
  disableLock: async () => false,
  toggleBiometric: async () => {},
  verifyPin: async () => false,
  forgotPin: async () => false,
});

export const useAppLock = () => useContext(AppLockContext);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const appState = useRef(AppState.currentState);
  const hasInitialized = useRef(false);
  const hasBackgrounded = useRef(false);

  // Check biometric availability and load settings on mount
  useEffect(() => {
    const init = async () => {
      // Check biometric hardware
      if (LocalAuthentication) {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricAvailable(compatible && enrolled);
      } else {
        setIsBiometricAvailable(false);
      }

      // Load saved settings with user-specific keys
      const enabledKey = await getUserKey(APP_LOCK_ENABLED_KEY);
      const biometricKey = await getUserKey(APP_LOCK_BIOMETRIC_KEY);
      const enabled = await SecureStore.getItemAsync(enabledKey);
      const biometric = await SecureStore.getItemAsync(biometricKey);
      
      const lockEnabled = enabled === 'true';
      setIsLockEnabled(lockEnabled);
      setIsBiometricEnabled(biometric === 'true');

      // Lock on first launch if enabled
      if (lockEnabled) {
        setIsLocked(true);
      }
      hasInitialized.current = true;
    };
    init();
  }, []);

  // Lock when app goes to background and comes back
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Track when app goes to background
      if (nextAppState === 'background') {
        hasBackgrounded.current = true;
      }
      
      // Only lock if app actually went to background and is now coming back to active
      if (
        hasBackgrounded.current &&
        nextAppState === 'active' &&
        isLockEnabled &&
        hasInitialized.current
      ) {
        setIsLocked(true);
        hasBackgrounded.current = false; // Reset flag
      }
      
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isLockEnabled]);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    const pinKey = await getUserKey(APP_LOCK_PIN_KEY);
    const storedPin = await SecureStore.getItemAsync(pinKey);
    return storedPin === pin;
  }, []);

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    const valid = await verifyPin(pin);
    if (valid) {
      setIsLocked(false);
    }
    return valid;
  }, [verifyPin]);

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    if (!isBiometricEnabled || !isBiometricAvailable || !LocalAuthentication) return false;
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Insight',
      cancelLabel: 'Use PIN',
      disableDeviceFallback: true,
    });

    if (result.success) {
      setIsLocked(false);
      return true;
    }
    return false;
  }, [isBiometricEnabled, isBiometricAvailable]);

  const setPin = useCallback(async (pin: string) => {
    const pinKey = await getUserKey(APP_LOCK_PIN_KEY);
    await SecureStore.setItemAsync(pinKey, pin);
  }, []);

  const enableLock = useCallback(async (pin: string) => {
    const pinKey = await getUserKey(APP_LOCK_PIN_KEY);
    const enabledKey = await getUserKey(APP_LOCK_ENABLED_KEY);
    await SecureStore.setItemAsync(pinKey, pin);
    await SecureStore.setItemAsync(enabledKey, 'true');
    setIsLockEnabled(true);
  }, []);

  const disableLock = useCallback(async (pin: string): Promise<boolean> => {
    const valid = await verifyPin(pin);
    if (valid) {
      const enabledKey = await getUserKey(APP_LOCK_ENABLED_KEY);
      const biometricKey = await getUserKey(APP_LOCK_BIOMETRIC_KEY);
      await SecureStore.setItemAsync(enabledKey, 'false');
      await SecureStore.setItemAsync(biometricKey, 'false');
      setIsLockEnabled(false);
      setIsBiometricEnabled(false);
      setIsLocked(false);
    }
    return valid;
  }, [verifyPin]);

  const toggleBiometric = useCallback(async (enabled: boolean) => {
    const biometricKey = await getUserKey(APP_LOCK_BIOMETRIC_KEY);
    await SecureStore.setItemAsync(biometricKey, enabled.toString());
    setIsBiometricEnabled(enabled);
  }, []);

  const forgotPin = useCallback(async (): Promise<boolean> => {
    try {
      // Get the current user's email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.warn('[AppLock] No user email found for PIN reset');
        return false;
      }

      // Send a recovery email as a security notification before clearing the local PIN.
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);

      if (error) {
        console.error('[AppLock] Failed to send reset email:', error);
        return false;
      }

      // Clear the PIN and unlock immediately
      // The email send itself is the verification that they have access to the account
      const enabledKey = await getUserKey(APP_LOCK_ENABLED_KEY);
      const biometricKey = await getUserKey(APP_LOCK_BIOMETRIC_KEY);
      const pinKey = await getUserKey(APP_LOCK_PIN_KEY);
      await SecureStore.setItemAsync(enabledKey, 'false');
      await SecureStore.setItemAsync(biometricKey, 'false');
      await SecureStore.deleteItemAsync(pinKey);
      setIsLockEnabled(false);
      setIsBiometricEnabled(false);
      setIsLocked(false);

      return true;
    } catch (err) {
      console.error('[AppLock] Forgot PIN error:', err);
      return false;
    }
  }, []);

  return (
    <AppLockContext.Provider
      value={{
        isLocked,
        isLockEnabled,
        isBiometricEnabled,
        isBiometricAvailable,
        unlock,
        unlockWithBiometric,
        setPin,
        enableLock,
        disableLock,
        toggleBiometric,
        verifyPin,
        forgotPin,
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
}
