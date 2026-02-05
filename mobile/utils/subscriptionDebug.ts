/**
 * CRITICAL SUBSCRIPTION DEBUG UTILITY
 * 
 * This file contains utilities to debug and completely wipe subscription state
 * that persists across app deletions and reinstalls.
 * 
 * ROOT CAUSE IDENTIFIED:
 * RevenueCat stores an anonymous user ID in iOS Keychain which persists across:
 * - App deletions
 * - App reinstalls
 * - Even when switching sandbox accounts
 * 
 * The Keychain data is tied to the app's bundle ID and survives reinstalls.
 */

import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface SubscriptionDebugInfo {
  revenueCatUserId: string | null;
  activeEntitlements: string[];
  activeSubscriptions: string[];
  allPurchasedProducts: string[];
  asyncStorageKeys: string[];
  secureStoreKeys: string[];
}

/**
 * Get comprehensive subscription state information
 */
export async function getSubscriptionDebugInfo(): Promise<SubscriptionDebugInfo> {
  console.log('[SUB DEBUG] 🔍 Gathering subscription debug info...');
  
  const info: SubscriptionDebugInfo = {
    revenueCatUserId: null,
    activeEntitlements: [],
    activeSubscriptions: [],
    allPurchasedProducts: [],
    asyncStorageKeys: [],
    secureStoreKeys: [],
  };

  try {
    // 1. Get RevenueCat customer info
    const customerInfo = await Purchases.getCustomerInfo();
    info.revenueCatUserId = customerInfo.originalAppUserId;
    info.activeEntitlements = Object.keys(customerInfo.entitlements.active);
    info.activeSubscriptions = customerInfo.activeSubscriptions;
    info.allPurchasedProducts = customerInfo.allPurchasedProductIdentifiers;
    
    console.log('[SUB DEBUG] RevenueCat User ID:', info.revenueCatUserId);
    console.log('[SUB DEBUG] Active Entitlements:', info.activeEntitlements);
    console.log('[SUB DEBUG] Active Subscriptions:', info.activeSubscriptions);
  } catch (error) {
    console.error('[SUB DEBUG] Error getting RevenueCat info:', error);
  }

  try {
    // 2. Get all AsyncStorage keys
    const allKeys = await AsyncStorage.getAllKeys();
    info.asyncStorageKeys = [...allKeys]; // Convert readonly array to mutable
    console.log('[SUB DEBUG] AsyncStorage keys:', allKeys);
  } catch (error) {
    console.error('[SUB DEBUG] Error getting AsyncStorage keys:', error);
  }

  // 3. Check known SecureStore keys
  const knownSecureKeys = [
    'insight_encryption_key',
    'com.revenuecat.userdefaults.appUserID',
    'com.revenuecat.userdefaults.cachedCustomerInfo',
  ];
  
  for (const key of knownSecureKeys) {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        info.secureStoreKeys.push(key);
        console.log(`[SUB DEBUG] SecureStore key found: ${key}`);
      }
    } catch (error) {
      // Key doesn't exist or error reading
    }
  }

  return info;
}

/**
 * NUCLEAR OPTION: Completely wipe ALL subscription state
 * 
 * This will:
 * 1. Log out of RevenueCat (clears local cache)
 * 2. Clear all AsyncStorage data
 * 3. Clear all SecureStore/Keychain data
 * 4. Reset RevenueCat to anonymous state
 * 
 * WARNING: This will also clear:
 * - Encryption keys
 * - Onboarding flags
 * - User preferences
 * - Any other app data
 */
export async function nukeAllSubscriptionState(): Promise<void> {
  console.log('[SUB DEBUG] 💣 NUKING ALL SUBSCRIPTION STATE...');
  
  try {
    // 1. Log out of RevenueCat
    console.log('[SUB DEBUG] Step 1: Logging out of RevenueCat...');
    await Purchases.logOut();
    console.log('[SUB DEBUG] ✅ RevenueCat logged out');
  } catch (error) {
    console.error('[SUB DEBUG] ❌ Error logging out of RevenueCat:', error);
  }

  try {
    // 2. Clear ALL AsyncStorage
    console.log('[SUB DEBUG] Step 2: Clearing AsyncStorage...');
    await AsyncStorage.clear();
    console.log('[SUB DEBUG] ✅ AsyncStorage cleared');
  } catch (error) {
    console.error('[SUB DEBUG] ❌ Error clearing AsyncStorage:', error);
  }

  try {
    // 3. Clear known SecureStore keys
    console.log('[SUB DEBUG] Step 3: Clearing SecureStore/Keychain...');
    const keysToDelete = [
      'insight_encryption_key',
      'com.revenuecat.userdefaults.appUserID',
      'com.revenuecat.userdefaults.cachedCustomerInfo',
      'com.revenuecat.userdefaults.cachedOfferings',
    ];
    
    for (const key of keysToDelete) {
      try {
        await SecureStore.deleteItemAsync(key);
        console.log(`[SUB DEBUG] ✅ Deleted SecureStore key: ${key}`);
      } catch (error) {
        console.log(`[SUB DEBUG] ⚠️ Could not delete ${key} (may not exist)`);
      }
    }
  } catch (error) {
    console.error('[SUB DEBUG] ❌ Error clearing SecureStore:', error);
  }

  try {
    // 4. Get fresh customer info to verify reset
    console.log('[SUB DEBUG] Step 4: Verifying reset...');
    const newCustomerInfo = await Purchases.getCustomerInfo();
    console.log('[SUB DEBUG] New RevenueCat User ID:', newCustomerInfo.originalAppUserId);
    console.log('[SUB DEBUG] New Active Entitlements:', Object.keys(newCustomerInfo.entitlements.active));
    
    if (Object.keys(newCustomerInfo.entitlements.active).length === 0) {
      console.log('[SUB DEBUG] ✅ SUCCESS: Subscription state cleared!');
    } else {
      console.log('[SUB DEBUG] ⚠️ WARNING: Still showing active entitlements!');
      console.log('[SUB DEBUG] This means the subscription is tied to your Apple ID in sandbox');
      console.log('[SUB DEBUG] You need to cancel the subscription in App Store Settings');
    }
  } catch (error) {
    console.error('[SUB DEBUG] ❌ Error verifying reset:', error);
  }

  console.log('[SUB DEBUG] 💣 NUKE COMPLETE');
}

/**
 * Safer option: Just reset RevenueCat subscription cache
 * This preserves user data but clears subscription state
 */
export async function resetRevenueCatOnly(): Promise<void> {
  console.log('[SUB DEBUG] 🔄 Resetting RevenueCat only...');
  
  try {
    // Log out of RevenueCat
    await Purchases.logOut();
    console.log('[SUB DEBUG] ✅ RevenueCat logged out');
    
    // Get new customer info
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('[SUB DEBUG] New User ID:', customerInfo.originalAppUserId);
    console.log('[SUB DEBUG] Active Entitlements:', Object.keys(customerInfo.entitlements.active));
    
    if (Object.keys(customerInfo.entitlements.active).length === 0) {
      console.log('[SUB DEBUG] ✅ RevenueCat reset successful!');
    } else {
      console.log('[SUB DEBUG] ⚠️ Still showing active subscription');
      console.log('[SUB DEBUG] The subscription is tied to your Apple ID');
      console.log('[SUB DEBUG] Cancel it in: Settings > App Store > Sandbox Account > Manage');
    }
  } catch (error) {
    console.error('[SUB DEBUG] ❌ Error resetting RevenueCat:', error);
  }
}

/**
 * Print comprehensive debug report
 */
export async function printSubscriptionDebugReport(): Promise<void> {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('           SUBSCRIPTION DEBUG REPORT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n');
  
  const info = await getSubscriptionDebugInfo();
  
  console.log('📱 REVENUECAT STATE:');
  console.log(`   User ID: ${info.revenueCatUserId}`);
  console.log(`   Active Entitlements: ${info.activeEntitlements.join(', ') || 'None'}`);
  console.log(`   Active Subscriptions: ${info.activeSubscriptions.join(', ') || 'None'}`);
  console.log(`   All Purchased Products: ${info.allPurchasedProducts.join(', ') || 'None'}`);
  console.log('\n');
  
  console.log('💾 ASYNCSTORAGE KEYS:');
  info.asyncStorageKeys.forEach(key => console.log(`   - ${key}`));
  console.log('\n');
  
  console.log('🔐 SECURESTORE/KEYCHAIN KEYS:');
  if (info.secureStoreKeys.length > 0) {
    info.secureStoreKeys.forEach(key => console.log(`   - ${key}`));
  } else {
    console.log('   None found');
  }
  console.log('\n');
  
  console.log('🔍 DIAGNOSIS:');
  if (info.activeEntitlements.length > 0) {
    console.log('   ✅ SUBSCRIPTION IS ACTIVE FOR CURRENT APPLE ID');
    console.log('   ');
    console.log('   This is CORRECT behavior - the subscription belongs to this Apple ID.');
    console.log('   ');
    console.log('   If you want to test purchasing again:');
    console.log('   ');
    console.log('   OPTION A: Cancel subscription in iOS Settings');
    console.log('      Settings > App Store > Sandbox Account > Manage');
    console.log('      Cancel the Insight subscription');
    console.log('   ');
    console.log('   OPTION B: Use a different sandbox account');
    console.log('      1. Sign out: Settings > App Store > Sandbox Account > Sign Out');
    console.log('      2. Create new tester in App Store Connect');
    console.log('      3. Sign in with new account when purchasing');
    console.log('      4. App will auto-invalidate cache and show purchase screen');
    console.log('   ');
    console.log('   NOTE: Cache invalidation is now automatic on app launch and sign out.');
  } else {
    console.log('   ✅ NO ACTIVE SUBSCRIPTION FOR CURRENT APPLE ID');
    console.log('   You can test purchasing!');
    console.log('   ');
    console.log('   The app is correctly validating against the current Apple ID.');
  }
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n');
}
