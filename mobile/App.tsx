import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Purchases from 'react-native-purchases';
import { Asset } from 'expo-asset';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import AppNavigator from './navigation/AppNavigator';

const REVENUECAT_IOS_API_KEY = 'test_wuTAwQKYtsAjXmbyqtuVVRCMWGF';

export default function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Configure RevenueCat
        Purchases.configure({
          apiKey: REVENUECAT_IOS_API_KEY,
        });

        // Preload critical assets to prevent loading delays
        await Promise.all([
          Asset.fromModule(require('./public/Insight-Logo-nobg.webp')).downloadAsync(),
          Asset.fromModule(require('./public/InsightAI-New-Logo.png')).downloadAsync(),
          Asset.fromModule(require('./public/InsightAI-Onboarding-MAIN.png')).downloadAsync(),
          Asset.fromModule(require('./assets/Cambridge-logo.png')).downloadAsync(),
        ]);
      } catch (e) {
        console.warn('Error preloading assets:', e);
      } finally {
        setAssetsLoaded(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!assetsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
