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
        // Configure RevenueCat with comprehensive logging
        console.log('[REVENUECAT] 🚀 Configuring RevenueCat...');
        console.log('[REVENUECAT] API Key:', REVENUECAT_IOS_API_KEY);
        
        Purchases.configure({
          apiKey: REVENUECAT_IOS_API_KEY,
        });
        
        console.log('[REVENUECAT] ✅ Configuration complete');
        
        // Set debug logs enabled
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        console.log('[REVENUECAT] Debug logging enabled');
        
        // CRITICAL FIX: Invalidate cache and force fresh validation on startup
        // This ensures we validate against the CURRENT Apple ID, not cached data
        try {
          console.log('[REVENUECAT] 🔄 Invalidating cache to force fresh validation...');
          await Purchases.invalidateCustomerInfoCache();
          console.log('[REVENUECAT] ✅ Cache invalidated');
          
          // Now get fresh customer info from Apple servers
          const customerInfo = await Purchases.getCustomerInfo();
          console.log('[REVENUECAT] 📊 Fresh Customer Info (validated against current Apple ID):');
          console.log('[REVENUECAT] - User ID:', customerInfo.originalAppUserId);
          console.log('[REVENUECAT] - Active Entitlements:', Object.keys(customerInfo.entitlements.active));
          console.log('[REVENUECAT] - All Entitlements:', Object.keys(customerInfo.entitlements.all));
          console.log('[REVENUECAT] - Active Subscriptions:', customerInfo.activeSubscriptions);
          console.log('[REVENUECAT] - All Purchased Product IDs:', customerInfo.allPurchasedProductIdentifiers);
          console.log('[REVENUECAT] - Management URL:', customerInfo.managementURL);
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
