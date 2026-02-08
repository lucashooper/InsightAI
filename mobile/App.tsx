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
import { EncryptionService } from './services/encryptionService';

const REVENUECAT_IOS_API_KEY = 'appl_kqCbylJegHaNzqoGMLhkrprqibn';

export default function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // STEP 1: Configure RevenueCat
        console.log('[REVENUECAT] 🚀 Configuring RevenueCat...');
        console.log('[REVENUECAT] API Key:', REVENUECAT_IOS_API_KEY);
        
        Purchases.configure({
          apiKey: REVENUECAT_IOS_API_KEY,
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

        // Preload critical assets to prevent loading delays
        await Promise.all([
          Asset.fromModule(require('./public/Insight-Logo-nobg.webp')).downloadAsync(),
          Asset.fromModule(require('./public/InsightAI-New-Logo.png')).downloadAsync(),
          Asset.fromModule(require('./public/InsightAI-Onboarding-MAIN.png')).downloadAsync(),
          Asset.fromModule(require('./public/InsightAI-Orb.png')).downloadAsync(),
          Asset.fromModule(require('./assets/Cambridge-logo.png')).downloadAsync(),
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
