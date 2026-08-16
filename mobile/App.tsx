import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

// CRITICAL: Suppress all warnings BEFORE any other imports to prevent yellow warning bar
LogBox.ignoreAllLogs();

import { useEffect, useState, useRef } from 'react';
import { View, Animated } from 'react-native';
import React from 'react';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, normalizeThemeName } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PreloadProvider, usePreloadedData } from './contexts/PreloadContext';
import type { ThemeName } from './contexts/ThemeContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { AppLockProvider, useAppLock } from './contexts/AppLockContext';
import AppNavigator from './navigation/AppNavigator';
import LockScreen from './components/LockScreen';
import PremiumSplashOverlay from './components/shared/PremiumSplashOverlay';
import { analytics } from './services/analytics';

import OnboardingLottieWarmup from './components/onboarding/OnboardingLottieWarmup';
import AppImageWarmup from './components/shared/AppImageWarmup';
import OnboardingHeroWarmup from './components/onboarding/OnboardingHeroWarmup';
import OrbOverlayProvider from './components/companion/OrbOverlayProvider';
import { getRevenueCatApiKey, isRevenueCatEnabled } from './utils/revenueCatConfig';
import { preloadAllAppAssets } from './utils/preloadAssets';

// RevenueCat: platform keys resolved in utils/revenueCatConfig.ts

async function configureRevenueCatInBackground() {
  if (!isRevenueCatEnabled()) {
    console.log('[REVENUECAT] Skipped on Android — subscriptions not configured yet');
    return;
  }

  try {
    const REVENUECAT_API_KEY = getRevenueCatApiKey();
    console.log('[REVENUECAT] 🚀 Configuring RevenueCat...');
    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    const needsEmailSignup = await AsyncStorage.getItem('NEEDS_EMAIL_SIGNUP');
    const savedAnonymousId = await AsyncStorage.getItem('REVENUECAT_ANONYMOUS_ID');

    if (needsEmailSignup === 'true' && savedAnonymousId) {
      await Purchases.logIn(savedAnonymousId).catch(() => {});
    } else {
      await Purchases.logOut().catch(() => {});
      await AsyncStorage.removeItem('REVENUECAT_ANONYMOUS_ID');
      await Purchases.invalidateCustomerInfoCache().catch(() => {});
    }

    await Purchases.getCustomerInfo().catch(() => {});
  } catch (e) {
    console.warn('[REVENUECAT] Background configure failed:', e);
  }
}

export default function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [savedTheme, setSavedTheme] = useState<string>('dark');
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [splashAssetsReady, setSplashAssetsReady] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        const storedTheme = await AsyncStorage.getItem('@insightai_theme');
        if (storedTheme) {
          setSavedTheme(normalizeThemeName(storedTheme));
        }
        setThemeLoaded(true);

        // Block until every screen/onboarding asset is decoded — no post-load flashes.
        console.log('[APP] Preloading all visual assets...');
        await preloadAllAppAssets();
        console.log('[APP] ✅ All visual assets preloaded');
        setSplashAssetsReady(true);
        setAssetsLoaded(true);

        void configureRevenueCatInBackground();
        void analytics.initialize();
      } catch (e: any) {
        console.error('[APP] ❌ Error in loadResourcesAndDataAsync:', e);
      } finally {
        setThemeLoaded(true);
        setSplashAssetsReady(true);
        setAssetsLoaded(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  const [appReady, setAppReady] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  /** Brand splash — only for returning/logged-in users */
  const [showBrandSplash, setShowBrandSplash] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const splashShownAtRef = useRef<number | null>(null);

  const SPLASH_MIN_MS = 2800;
  const SPLASH_MAX_MS = 10000;

  useEffect(() => {
    if (showBrandSplash && splashShownAtRef.current == null) {
      splashShownAtRef.current = Date.now();
    }
  }, [showBrandSplash]);

  // Hide native splash once assets are decoded and JS splash is ready.
  useEffect(() => {
    if (!assetsLoaded || Platform.OS === 'web') return;

    try {
      SplashScreen.setOptions({ fade: true, duration: 300 });
    } catch {
      // setOptions unavailable on some builds
    }
    SplashScreen.hideAsync().catch(() => {});
  }, [assetsLoaded]);

  // Hard cap — never leave the splash overlay blocking the app indefinitely.
  useEffect(() => {
    const maxTimer = setTimeout(() => {
      console.log('[APP] Splash max duration reached — forcing dismiss');
      fadeAnim.setValue(0);
      setSplashVisible(false);
    }, SPLASH_MAX_MS);
    return () => clearTimeout(maxTimer);
  }, [fadeAnim]);

  // Fade out splash when app is ready, respecting minimum display time for brand splash only
  useEffect(() => {
    if (!appReady) return;

    const minMs = showBrandSplash ? SPLASH_MIN_MS : 0;
    const elapsed = Date.now() - (splashShownAtRef.current ?? Date.now());
    const remaining = Math.max(0, minMs - elapsed);

    console.log('[APP] App ready, fading splash after', remaining, 'ms (brand=', showBrandSplash, ')');
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: showBrandSplash ? 400 : 0,
        useNativeDriver: true,
      }).start(() => {
        console.log('[APP] Splash fade complete, hiding splash');
        setSplashVisible(false);
      });
    }, remaining);

    return () => clearTimeout(timer);
  }, [appReady, fadeAnim, showBrandSplash]);

  console.log('[APP RENDER] assetsLoaded:', assetsLoaded, 'appReady:', appReady, 'splashVisible:', splashVisible, 'brand:', showBrandSplash);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OrbOverlayProvider>
      {splashAssetsReady ? (
        <>
          <OnboardingLottieWarmup />
          <AppImageWarmup />
          <OnboardingHeroWarmup />
        </>
      ) : null}
      <SafeAreaProvider>
      {/* Providers and navigator render underneath from the start */}
      {assetsLoaded ? (
        <ThemeProvider>
          <LanguageProvider>
          <AppLockProvider>
            <AuthProvider>
              <PreloadProvider>
                <OnboardingProvider>
                  <AppContent
                    onReady={({ showBrandSplash: brand }) => {
                      setShowBrandSplash(brand);
                      setAppReady(true);
                    }}
                  />
                </OnboardingProvider>
              </PreloadProvider>
            </AuthProvider>
          </AppLockProvider>
          </LanguageProvider>
        </ThemeProvider>
      ) : null}

      {/* Gradient splash — only after assets decoded so background never pops in late */}
      {assetsLoaded && splashVisible && themeLoaded && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            opacity: fadeAnim,
          }}
        >
          <PremiumSplashOverlay />
        </Animated.View>
      )}
      </SafeAreaProvider>
      </OrbOverlayProvider>
    </GestureHandlerRootView>
  );
}

function AppContent({
  onReady,
}: {
  onReady: (opts: { showBrandSplash: boolean }) => void;
}) {
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

  // Dismiss splash once auth + lock settings are ready — brand splash only if logged in
  useEffect(() => {
    if (!isStartupReady || hasSignaledReadyRef.current) return;
    hasSignaledReadyRef.current = true;
    const showBrandSplash = !!user;
    console.log('[APP] Startup ready, showBrandSplash=', showBrandSplash);
    const timer = setTimeout(() => onReady({ showBrandSplash }), 120);
    return () => clearTimeout(timer);
  }, [isStartupReady, onReady, user]);

  // Safety net if auth or lock settings hang on a slow device/network.
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (hasSignaledReadyRef.current) return;
      hasSignaledReadyRef.current = true;
      console.warn('[APP] Startup fallback — auth/lock took too long, unblocking app');
      onReady({ showBrandSplash: !!user });
    }, 8000);
    return () => clearTimeout(fallbackTimer);
  }, [onReady, user]);

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
