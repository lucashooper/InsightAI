import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';

// CRITICAL: Suppress all warnings BEFORE any other imports to prevent yellow warning bar
LogBox.ignoreAllLogs();

import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import React from 'react';
import Purchases from 'react-native-purchases';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, normalizeThemeName, useTheme, isDarkTheme } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PreloadProvider, usePreloadedData } from './contexts/PreloadContext';
import type { ThemeName } from './contexts/ThemeContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { AppLockProvider, useAppLock } from './contexts/AppLockContext';
import AppNavigator from './navigation/AppNavigator';
import LockScreen from './components/LockScreen';
import SunoGradient from './components/onboarding/SunoGradient';
import { analytics } from './services/analytics';

const insightLogo = require('./public/Insight-Logo-nobg.webp');

// RevenueCat API Keys
// Test Store: Bypasses Apple sandbox, works in simulator, instant testing
// Production: Real Apple StoreKit integration for production builds
const REVENUECAT_TEST_STORE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY || 'test_wuTAwQKYtsAjXmbyqtuVVRCMWGF';
const REVENUECAT_PRODUCTION_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || 'appl_kqCbylJegHaNzqoGMLhkrprqibn';

// Use Test Store in development for easier testing, Production for releases
const REVENUECAT_API_KEY = __DEV__ ? REVENUECAT_TEST_STORE_API_KEY : REVENUECAT_PRODUCTION_API_KEY;

// Theme background colors for splash screen (light + dark only)
const splashThemeColors: Record<string, { bg: string[], textColor: string, isDark: boolean }> = {
  dark: { bg: ['#0e0e12', '#0a0a0c', '#060608'], textColor: '#ffffff', isDark: true },
  light: { bg: ['#fef5f8', '#fef0f5', '#fef7f2'], textColor: '#1a1a2e', isDark: false },
};

export default function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [savedTheme, setSavedTheme] = useState<string>('dark');
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // CRITICAL: Load theme FIRST before anything else to prevent splash screen flash
        const storedTheme = await AsyncStorage.getItem('@insightai_theme');
        if (storedTheme) {
          setSavedTheme(normalizeThemeName(storedTheme));
        }
        setThemeLoaded(true);
        // STEP 1: Configure RevenueCat
        console.log('[REVENUECAT] 🚀 Configuring RevenueCat...');
        console.log('[REVENUECAT] Environment:', __DEV__ ? 'DEVELOPMENT (Test Store)' : 'PRODUCTION');
        console.log('[REVENUECAT] API Key:', REVENUECAT_API_KEY.substring(0, 20) + '...');
        
        Purchases.configure({
          apiKey: REVENUECAT_API_KEY,
        });
        
        console.log('[REVENUECAT] ✅ Configuration complete');
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        console.log('[REVENUECAT] Debug logging enabled');
        
        // STEP 2: Check if user has pending anonymous purchase (NEEDS_EMAIL_SIGNUP flag)
        // If they do, we MUST preserve their anonymous RevenueCat ID to keep their subscription
        const needsEmailSignup = await AsyncStorage.getItem('NEEDS_EMAIL_SIGNUP');
        const savedAnonymousId = await AsyncStorage.getItem('REVENUECAT_ANONYMOUS_ID');
        
        if (needsEmailSignup === 'true') {
          console.log('[REVENUECAT] 🔒 Anonymous purchaser detected - preserving RevenueCat ID to keep subscription');
          
          // Restore the saved anonymous ID if we have one (critical for Expo Go where Keychain is cleared on reload)
          if (savedAnonymousId) {
            console.log('[REVENUECAT] 🔄 Restoring saved anonymous ID:', savedAnonymousId);
            try {
              await Purchases.logIn(savedAnonymousId);
              console.log('[REVENUECAT] ✅ Anonymous ID restored successfully');
            } catch (loginError: any) {
              console.error('[REVENUECAT] ❌ Failed to restore anonymous ID:', loginError.message);
            }
          } else {
            console.log('[REVENUECAT] ⚠️ No saved anonymous ID found - subscription may be lost');
          }
        } else {
          // STEP 2: CRITICAL - Logout to clear any persisted anonymous user from Keychain
          // iOS Keychain persists across app deletions, so old subscription data remains
          // We MUST logout immediately after configure to clear stale data
          console.log('[REVENUECAT] 🔄 Logging out to clear any persisted anonymous user from Keychain...');
          try {
            await Purchases.logOut();
            console.log('[REVENUECAT] ✅ Logged out - Keychain cleared');
          } catch (logoutError: any) {
            console.log('[REVENUECAT] ℹ️ Logout completed (no previous user):', logoutError.message);
          }
          
          // Clear saved anonymous ID since we're starting fresh
          await AsyncStorage.removeItem('REVENUECAT_ANONYMOUS_ID');
          
          // STEP 3: Invalidate cache to force fresh validation against Apple servers
          console.log('[REVENUECAT] 🔄 Invalidating cache to force fresh validation...');
          try {
            await Purchases.invalidateCustomerInfoCache();
            console.log('[REVENUECAT] ✅ Cache invalidated');
          } catch (cacheError: any) {
            console.log('[REVENUECAT] ℹ️ Cache invalidation completed:', cacheError.message);
          }
        }
        
        // STEP 4: Get fresh customer info from Apple servers
        console.log('[REVENUECAT] 📡 Fetching fresh customer info from Apple servers...');
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          
          // Comprehensive debug logging
          console.log('=== REVENUECAT STARTUP DEBUG ===');
          console.log('Request Date:', new Date().toISOString());
          console.log('Original App User ID:', customerInfo.originalAppUserId);
          console.log('All Entitlements:', Object.keys(customerInfo.entitlements.all));
          console.log('Active Entitlements:', Object.keys(customerInfo.entitlements.active));
          console.log('Active Subscriptions:', customerInfo.activeSubscriptions);
          console.log('All Purchased Product IDs:', customerInfo.allPurchasedProductIdentifiers);
          console.log('Management URL:', customerInfo.managementURL);
          
          if (customerInfo.latestExpirationDate) {
            const expDate = new Date(customerInfo.latestExpirationDate);
            const now = new Date();
            console.log('Latest Expiration Date:', expDate.toISOString());
            console.log('Current Time:', now.toISOString());
            console.log('Is Expired:', expDate < now);
            console.log('Minutes Until Expiry:', Math.round((expDate.getTime() - now.getTime()) / 1000 / 60));
          } else {
            console.log('Latest Expiration Date: null (no subscription)');
          }
          console.log('================================');
        } catch (customerInfoError: any) {
          console.error('[REVENUECAT] ❌ Failed to get customer info:', customerInfoError);
          console.error('[REVENUECAT] Error details:', customerInfoError.message);
        }

        // Initialize analytics
        console.log('[ANALYTICS] Initializing PostHog...');
        await analytics.initialize();

        // Critical assets only — defer the rest so splash clears faster
        await Promise.all([
          Asset.fromModule(require('./public/Insight-Logo-nobg.webp')).downloadAsync(),
          Asset.fromModule(require('./public/InsightAI-Orb.png')).downloadAsync(),
        ]);

        // Non-blocking background preload
        Promise.all([
          Asset.fromModule(require('./public/InsightAI-New-Logo.png')).downloadAsync(),
          Asset.fromModule(require('./public/cool-gradient-bg.png')).downloadAsync(),
          Asset.fromModule(require('./public/new-phone-images/Insight-Main-Phone 1.png')).downloadAsync(),
          Asset.fromModule(require('./public/new-phone-images/Insight-Dashboard-Phone (2) 1.png')).downloadAsync(),
          Asset.fromModule(require('./public/new-phone-images/Insight-Insights-Phone-Black-Better 1.png')).downloadAsync(),
          Asset.fromModule(require('./public/new-phone-images/Insight-Playbook-Phone 1.png')).downloadAsync(),
          Asset.fromModule(require('./public/new-phone-images/Mira-Insight-Marketing-Phone.png')).downloadAsync(),
          Asset.fromModule(require('./public/noisy-image.webp')).downloadAsync(),
          Asset.fromModule(require('./public/clarity-image.webp')).downloadAsync(),
          Asset.fromModule(require('./public/onboarding-icons/BellIcon.webp')).downloadAsync(),
          Asset.fromModule(require('./public/onboarding-icons/Email-Icon2.webp')).downloadAsync(),
          Asset.fromModule(require('./public/onboarding-icons/LockIcon2.webp')).downloadAsync(),
          Asset.fromModule(require('./public/Book-Icon-Insight.webp')).downloadAsync(),
          Asset.fromModule(require('./public/research-images/Cambridge-Logo-Frame.png')).downloadAsync(),
          Asset.fromModule(require('./public/research-images/Liverpool-Logo.jpg')).downloadAsync(),
          Asset.fromModule(require('./public/research-images/Smaller-Kaiser-Logo.png')).downloadAsync(),
          Asset.fromModule(require('./public/research-images/APA-LOGO.png')).downloadAsync(),
          Asset.fromModule(require('./assets/Cambridge-logo.png')).downloadAsync(),
          Asset.fromModule(require('./public/ambient-stuff/rain-image.jpg')).downloadAsync(),
          Asset.fromModule(require('./public/ambient-stuff/campfire-image.jpg')).downloadAsync(),
        ]).catch(() => {});
      } catch (e: any) {
        console.error('[APP] ❌ Error in loadResourcesAndDataAsync:', e);
        console.error('[APP] Error message:', e.message);
        console.error('[APP] Error stack:', e.stack);
      } finally {
        console.log('[APP] ✅ Assets loaded, rendering app');
        setAssetsLoaded(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  const [appReady, setAppReady] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Fade out splash when app is ready
  useEffect(() => {
    if (appReady) {
      console.log('[APP] App ready, fading out splash...');
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        console.log('[APP] Splash fade complete, hiding splash');
        setSplashVisible(false);
      });
    }
  }, [appReady]);

  console.log('[APP RENDER] assetsLoaded:', assetsLoaded, 'appReady:', appReady, 'splashVisible:', splashVisible);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Providers and navigator render underneath from the start */}
      {assetsLoaded ? (
        <ThemeProvider>
          <LanguageProvider>
          <AppLockProvider>
            <AuthProvider>
              <PreloadProvider>
                <OnboardingProvider>
                  <AppContent onReady={() => setAppReady(true)} />
                  <ThemedStatusBar />
                </OnboardingProvider>
              </PreloadProvider>
            </AuthProvider>
          </AppLockProvider>
          </LanguageProvider>
        </ThemeProvider>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      {/* Single splash overlay - stays on top until app is fully ready, then fades out */}
      {splashVisible && themeLoaded && (() => {
        const themeConfig = splashThemeColors[savedTheme] || splashThemeColors.dark;
        return (
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, opacity: fadeAnim }}>
          {themeConfig.isDark ? (
            <LinearGradient colors={themeConfig.bg as any} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          ) : (
            <SunoGradient />
          )}
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={insightLogo}
              style={{ width: 64, height: 64, borderRadius: 16, marginRight: 14 }}
              resizeMode="cover"
            />
            <Text style={{ fontSize: 44, fontWeight: '700', color: themeConfig.textColor, letterSpacing: -1.2 }}>
              Insight
            </Text>
          </View>
        </Animated.View>
        );
      })()}
    </GestureHandlerRootView>
  );
}

function ThemedStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={isDarkTheme(theme.name) ? 'light' : 'dark'} />;
}

function AppContent({ onReady }: { onReady: () => void }) {
  const { isLocked, isLockEnabled, isLockReady } = useAppLock();
  const { loading: authLoading, user } = useAuth();
  const { preloadForUser, resetData } = usePreloadedData();
  const preloadStartedRef = useRef(false);
  const hasSignaledReadyRef = useRef(false);

  // Preload in background as soon as auth resolves — never block PIN on network/decrypt.
  useEffect(() => {
    if (authLoading || !user) return;
    if (preloadStartedRef.current) return;

    preloadStartedRef.current = true;
    preloadForUser(user.id, user.email || '');
  }, [authLoading, user, preloadForUser]);

  useEffect(() => {
    if (!user) {
      preloadStartedRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      resetData();
    }
  }, [authLoading, user, resetData]);

  const isStartupReady = !authLoading && isLockReady;

  // Dismiss splash once auth + lock settings are ready — data preload continues underneath.
  useEffect(() => {
    if (!isStartupReady || hasSignaledReadyRef.current) return;
    hasSignaledReadyRef.current = true;
    const timer = setTimeout(onReady, 120);
    return () => clearTimeout(timer);
  }, [isStartupReady, onReady]);

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
      {isLocked && isLockEnabled && !authLoading && isLockReady && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <LockScreen />
        </View>
      )}
    </View>
  );
}
