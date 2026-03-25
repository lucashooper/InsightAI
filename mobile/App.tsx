import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import { View, Text, Image, LogBox, Animated } from 'react-native';
import React from 'react';

// Suppress LinearGradient warnings that spam the console
LogBox.ignoreLogs(['LinearGradient colors and locations props should be arrays of the same length']);
import Purchases from 'react-native-purchases';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, isDarkTheme } from './contexts/ThemeContext';
import { PreloadProvider, usePreloadedData } from './contexts/PreloadContext';
import type { ThemeName } from './contexts/ThemeContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { AppLockProvider, useAppLock } from './contexts/AppLockContext';
import AppNavigator from './navigation/AppNavigator';
import LockScreen from './components/LockScreen';
import { EncryptionService } from './services/encryptionService';
import SunoGradient from './components/onboarding/SunoGradient';

const insightLogo = require('./public/Insight-Logo-nobg.webp');

// RevenueCat API Keys
// Test Store: Bypasses Apple sandbox, works in simulator, instant testing
// Production: Real Apple StoreKit integration for production builds
const REVENUECAT_TEST_STORE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY || 'test_wuTAwQKYtsAjXmbyqtuVVRCMWGF';
const REVENUECAT_PRODUCTION_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || 'appl_kqCbylJegHaNzqoGMLhkrprqibn';

// Use Test Store in development for easier testing, Production for releases
const REVENUECAT_API_KEY = __DEV__ ? REVENUECAT_TEST_STORE_API_KEY : REVENUECAT_PRODUCTION_API_KEY;

// Theme background colors for splash screen (mirrors ThemeContext)
const splashThemeColors: Record<string, { bg: string[], textColor: string, isDark: boolean }> = {
  dark: { bg: ['#0e0e12', '#0a0a0c', '#060608'], textColor: '#ffffff', isDark: true },
  midnight: { bg: ['#0f0f23', '#1a1a3e', '#252550'], textColor: '#ffffff', isDark: true },
  forest: { bg: ['#0f2e1a', '#0a1f0f', '#051008'], textColor: '#ffffff', isDark: true },
  light: { bg: ['#fef5f8', '#fef0f5', '#fef7f2'], textColor: '#1a1a2e', isDark: false },
  vibrant: { bg: ['#faf5ff', '#f3e8ff', '#e9d5ff'], textColor: '#1a1a2e', isDark: false },
  ocean: { bg: ['#eff6ff', '#dbeafe', '#bfdbfe'], textColor: '#1a1a2e', isDark: false },
  sunset: { bg: ['#fff8f0', '#ffe9d6', '#ffd9b8'], textColor: '#1a1a2e', isDark: false },
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
          setSavedTheme(storedTheme);
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
        
        // STEP 3: Invalidate cache to force fresh validation against Apple servers
        console.log('[REVENUECAT] 🔄 Invalidating cache to force fresh validation...');
        try {
          await Purchases.invalidateCustomerInfoCache();
          console.log('[REVENUECAT] ✅ Cache invalidated');
        } catch (cacheError: any) {
          console.log('[REVENUECAT] ℹ️ Cache invalidation completed:', cacheError.message);
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

        // Test encryption on startup
        console.log('=== ENCRYPTION TEST START ===');
        try {
          await EncryptionService.testEncryption();
        } catch (testError) {
          console.error('=== ENCRYPTION TEST FAILED ===', testError);
        }
        console.log('=== ENCRYPTION TEST END ===');

        // Preload ALL critical assets to prevent loading delays / pop-in
        await Promise.all([
          // App logos
          Asset.fromModule(require('./public/Insight-Logo-nobg.webp')).downloadAsync(),
          Asset.fromModule(require('./public/InsightAI-New-Logo.png')).downloadAsync(),
          Asset.fromModule(require('./public/InsightAI-Orb.png')).downloadAsync(),
          // Onboarding images
          Asset.fromModule(require('./public/Onboarding-Main-Phone-Image.png')).downloadAsync(),
          Asset.fromModule(require('./public/InsightAI-Onboarding-MAIN.png')).downloadAsync(),
          Asset.fromModule(require('./public/noisy-image.webp')).downloadAsync(),
          Asset.fromModule(require('./public/clarity-image.webp')).downloadAsync(),
          // Onboarding icons
          Asset.fromModule(require('./public/onboarding-icons/BellIcon.webp')).downloadAsync(),
          Asset.fromModule(require('./public/onboarding-icons/Email-Icon2.webp')).downloadAsync(),
          Asset.fromModule(require('./public/onboarding-icons/LockIcon2.webp')).downloadAsync(),
          // Research institution logos
          Asset.fromModule(require('./public/research-images/Cambridge-Logo-Frame.png')).downloadAsync(),
          Asset.fromModule(require('./public/research-images/Liverpool-Logo.jpg')).downloadAsync(),
          Asset.fromModule(require('./public/research-images/Smaller-Kaiser-Logo.png')).downloadAsync(),
          Asset.fromModule(require('./public/research-images/APA-LOGO.png')).downloadAsync(),
          // Cambridge logo (legacy)
          Asset.fromModule(require('./assets/Cambridge-logo.png')).downloadAsync(),
          // Paywall phone carousel images
          Asset.fromModule(require('./public/phone-images/Insight-Main-Page-Phone.png')).downloadAsync(),
          Asset.fromModule(require('./public/phone-images/Insight-Dashboard-Page-Phone.png')).downloadAsync(),
          Asset.fromModule(require('./public/phone-images/Insight-Journal-Page-Phone.png')).downloadAsync(),
          Asset.fromModule(require('./public/phone-images/Insight-Insights-Page-Phone-Real.png')).downloadAsync(),
          Asset.fromModule(require('./public/phone-images/Insight-Playbook-Page-Phone.png')).downloadAsync(),
        ]);
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
    <View style={{ flex: 1 }}>
      {/* Providers and navigator render underneath from the start */}
      {assetsLoaded ? (
        <ThemeProvider>
          <AppLockProvider>
            <AuthProvider>
              <PreloadProvider>
                <OnboardingProvider>
                  <AppContent onReady={() => setAppReady(true)} />
                  <StatusBar style="light" />
                </OnboardingProvider>
              </PreloadProvider>
            </AuthProvider>
          </AppLockProvider>
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
    </View>
  );
}

function AppContent({ onReady }: { onReady: () => void }) {
  const { isLocked, isLockEnabled } = useAppLock();
  const { loading: authLoading, user } = useAuth();
  const { data: preloadedData, preloadForUser } = usePreloadedData();

  // Preload all data once auth resolves and we have a user
  useEffect(() => {
    if (!authLoading && user) {
      preloadForUser(user.id, user.email || '');
    }
  }, [authLoading, user]);

  // Signal ready once auth is done AND data is preloaded (or no user)
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // No user — show onboarding/login immediately
        console.log('[AppContent] No user, showing onboarding');
        const timer = setTimeout(onReady, 100);
        return () => clearTimeout(timer);
      } else if (preloadedData.isLoaded) {
        // User + data loaded — show app
        console.log('[AppContent] User + data loaded, showing app');
        const timer = setTimeout(onReady, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [authLoading, user, preloadedData.isLoaded, onReady]);

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
      {isLocked && isLockEnabled && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <LockScreen />
        </View>
      )}
    </View>
  );
}
