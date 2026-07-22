import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SunoGradient from '../../components/onboarding/SunoGradient';
import AnimatedBenefitList from '../../components/onboarding/AnimatedBenefitList';
import BreathingLogo from '../../components/onboarding/BreathingLogo';
import PaywallHeroPhone from '../../components/onboarding/PaywallHeroPhone';
import PaywallPlanCard from '../../components/onboarding/PaywallPlanCard';
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { supabase } from '../../lib/supabase';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../contexts/LanguageContext';
import { getFirstName } from '../../utils/paywallPersonalization';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');

const ENTITLEMENT_ID = 'Insight Pro';

export default function PaywallScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { userName } = useOnboarding();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'yearly'>('yearly');
  const benefitItems = [
    t('onboarding.paywall.benefits.unlimited'),
    t('onboarding.paywall.benefits.patterns'),
    t('onboarding.paywall.benefits.summaries'),
    t('onboarding.paywall.benefits.playbook'),
  ];
  const firstName = getFirstName(userName);
  const paywallTitle = firstName
    ? t('onboarding.paywall.pricingTitleNamed', { name: firstName })
    : t('onboarding.paywall.pricingTitleGeneric');

  useEffect(() => {
    console.log('[Paywall] 🔄 UPDATED VERSION LOADED - Subscription boxes now dark gray for dark theme compatibility');
    
    // Track paywall viewed
    const source = route?.params?.source || 'onboarding';
    analytics.trackPaywallViewed(source);
    analytics.trackOnboardingScreen('paywall', 'viewed', userName || undefined);
    
    const loadOfferings = async () => {
      try {
        // NOTE: We don't invalidate cache here because:
        // 1. Cache is already invalidated on app startup (App.tsx)
        // 2. Invalidating here would clear fresh purchase data
        // 3. This screen is shown AFTER purchase, so we need the cached purchase info
        
        console.log('[REVENUECAT] 🛒 Loading offerings...');
        const offerings = await Purchases.getOfferings();
        console.log('[REVENUECAT] ✅ Offerings loaded successfully');
        console.log('[REVENUECAT] All offerings:', Object.keys(offerings.all));
        console.log('[REVENUECAT] Current offering ID:', offerings.current?.identifier);
        
        // Check current subscription status
        console.log('[REVENUECAT] Checking current subscription status...');
        const customerInfo = await Purchases.getCustomerInfo();
        console.log('[REVENUECAT] Active entitlements:', Object.keys(customerInfo.entitlements.active));
        console.log('[REVENUECAT] Active subscriptions:', customerInfo.activeSubscriptions);
        console.log('[REVENUECAT] All purchased products:', customerInfo.allPurchasedProductIdentifiers);
        
        if (offerings.current) {
          console.log('[REVENUECAT] 📦 Available packages:', offerings.current.availablePackages.length);
          offerings.current.availablePackages.forEach((pkg, index) => {
            console.log(`[REVENUECAT] Package ${index + 1}:`);
            console.log(`  - Identifier: ${pkg.identifier}`);
            console.log(`  - Product ID: ${pkg.product.identifier}`);
            console.log(`  - Price: ${pkg.product.priceString}`);
            console.log(`  - Title: ${pkg.product.title}`);
            console.log(`  - Description: ${pkg.product.description}`);
          });
          setOffering(offerings.current);
        } else {
          console.warn('[REVENUECAT] ⚠️ No current offering available');
          console.log('[REVENUECAT] This usually means products are not configured in RevenueCat dashboard');
          setOffering(null);
        }
      } catch (error: any) {
        console.error('[REVENUECAT] ❌ Error loading offerings:', error);
        console.error('[REVENUECAT] Error message:', error.message);
        console.error('[REVENUECAT] Error code:', error.code);
        console.error('[REVENUECAT] Error stack:', error.stack);
      } finally {
        setIsLoading(false);
        console.log('[REVENUECAT] Loading complete, isLoading set to false');
      }
    };

    loadOfferings();
  }, []);

  const saveUsernameToProfile = async () => {
    if (!user) {
      console.log('[Paywall] No user found, skipping profile save');
      return;
    }
    
    try {
      console.log('[Paywall] Saving username to profile...');
      console.log('[Paywall] User ID:', user.id);
      console.log('[Paywall] User email:', user.email);
      console.log('[Paywall] Context username:', userName);
      
      // Check if this is a social sign-in user by looking at the auth provider
      // This is more reliable than AsyncStorage flags which can get cleared/stale
      const authProvider = user.app_metadata?.provider || '';
      const isSocialSignIn = authProvider === 'google' || authProvider === 'apple';
      console.log('[Paywall] Auth provider:', authProvider);
      console.log('[Paywall] Is social sign-in:', isSocialSignIn);
      
      // Read the CURRENT username from database
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id, username')
        .eq('user_id', user.id)
        .single();
      
      console.log('[Paywall] Existing profile check:', existingProfile);
      console.log('[Paywall] Check error:', checkError);
      
      let finalUsername = '';
      
      if (isSocialSignIn && existingProfile?.username) {
        // Social sign-in: ALWAYS trust the database username (set by Google/Apple sign-in)
        // Never overwrite it with stale OnboardingContext value
        finalUsername = existingProfile.username;
        console.log('[Paywall] Social sign-in: using DB username:', finalUsername);
      } else if (userName) {
        // Manual sign-up: use the username from onboarding context (user typed it)
        finalUsername = userName;
        console.log('[Paywall] Manual sign-up: using context username:', finalUsername);
      } else if (existingProfile?.username) {
        // Fallback to database
        finalUsername = existingProfile.username;
        console.log('[Paywall] Fallback: using DB username:', finalUsername);
      } else {
        console.log('[Paywall] No username found anywhere, skipping profile save');
        // Still mark onboarding complete
        await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
        return;
      }
      
      // Update or create profile
      if (existingProfile) {
        // Only update username if manual sign-up AND different from DB
        if (!isSocialSignIn && userName && userName !== existingProfile.username) {
          console.log('[Paywall] Updating username from', existingProfile.username, 'to', userName);
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ username: userName })
            .eq('user_id', user.id);
          
          if (updateError) {
            console.error('[Paywall] ❌ Error updating profile:', updateError);
          } else {
            console.log('[Paywall] ✅ Username updated successfully');
          }
        } else {
          console.log('[Paywall] Username already correct in database, skipping update');
        }
      } else {
        // Profile doesn't exist, create it
        console.log('[Paywall] Profile does not exist, creating new profile...');
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            username: finalUsername,
            email: user.email,
          });
        
        if (insertError) {
          console.error('[Paywall] ❌ Error creating profile:', insertError);
        } else {
          console.log('[Paywall] ✅ Profile created successfully');
        }
      }
      
      // Cache the final username locally
      await AsyncStorage.setItem('CACHED_USERNAME', finalUsername);
      console.log('[Paywall] ✅ Username cached locally:', finalUsername);
      
      // Mark onboarding as complete
      await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
      console.log('[Paywall] ✅ Onboarding marked as complete');
      
    } catch (err) {
      console.error('[Paywall] ❌ Exception in saveUsernameToProfile:', err);
    }
  };

  const getSelectedPackage = (): PurchasesPackage | null => {
    if (!offering) return null;
    
    // Map our plan selection to RevenueCat package types
    const packageTypeMap = {
      weekly: '$rc_weekly',
      monthly: '$rc_monthly',
      yearly: '$rc_annual',
    };
    
    const targetIdentifier = packageTypeMap[selectedPlan];
    const pkg = offering.availablePackages.find((p) => p.identifier === targetIdentifier);
    return pkg ?? offering.availablePackages[0] ?? null;
  };

  const handleCustomerInfo = async (customerInfo: CustomerInfo) => {
    // CRITICAL DEBUG: Log all entitlements to identify the correct one
    console.log('[Paywall] 🔍 All active entitlements:', Object.keys(customerInfo.entitlements.active));
    console.log('[Paywall] 🔍 Looking for entitlement ID:', ENTITLEMENT_ID);
    console.log('[Paywall] 🔍 All entitlements (active and inactive):', Object.keys(customerInfo.entitlements.all));
    console.log('[Paywall] 🔍 Original App User ID:', customerInfo.originalAppUserId);
    console.log('[Paywall] 🔍 Current User ID:', user?.id);
    
    const isProActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    console.log('[Paywall] Checking subscription status:', isProActive);
    
    const hasAnyActiveEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
    console.log('[Paywall] Has any active entitlement:', hasAnyActiveEntitlement);
    
    // CRITICAL: Save anonymous ID to AsyncStorage for Expo Go persistence
    // Expo Go clears iOS Keychain on reload, so we must manually persist the ID
    if (hasAnyActiveEntitlement && customerInfo.originalAppUserId.startsWith('$RCAnonymousID:')) {
      await AsyncStorage.setItem('REVENUECAT_ANONYMOUS_ID', customerInfo.originalAppUserId);
      console.log('[Paywall] 💾 Saved anonymous RevenueCat ID for persistence:', customerInfo.originalAppUserId);
    }
    
    // CRITICAL: Verify subscription ownership before granting Pro access
    if (hasAnyActiveEntitlement && user?.id) {
      const originalOwner = customerInfo.originalAppUserId;
      const isOwnSubscription = originalOwner === user.id || originalOwner?.startsWith('$RCAnonymousID:');
      if (!isOwnSubscription) {
        console.log('[Paywall] ❌ Subscription belongs to different user:', originalOwner);
        Alert.alert(
          t('onboarding.paywall.alerts.otherAccountTitle'),
          t('onboarding.paywall.alerts.otherAccountBody'),
          [{ text: t('onboarding.paywall.alerts.ok') }]
        );
        return;
      }
    }
    
    if (isProActive || hasAnyActiveEntitlement) {
      console.log('[Paywall] ✅ Subscription is active');
      
      // Check if user came from Settings (upgrading) vs onboarding (new user)
      const fromSettings = route?.params?.fromSettings === true;
      console.log('[Paywall] fromSettings param:', fromSettings);
      
      if (fromSettings) {
        // User is upgrading from Settings - just show success and go back
        console.log('[Paywall] User upgrading from Settings - showing success alert');
        Alert.alert(
          t('onboarding.paywall.alerts.purchaseSuccessTitle'),
          t('onboarding.paywall.alerts.purchaseSuccessBody'),
          [
            {
              text: t('onboarding.paywall.alerts.ok'),
              onPress: () => {
                console.log('[Paywall] Navigating back to Settings');
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        // User is in onboarding flow - complete onboarding
        console.log('[Paywall] User in onboarding flow - completing onboarding');
        
        try {
          // Check if user has a Supabase account with email
          const hasEmail = user?.email && !user.email.includes('privaterelay');
          console.log('[Paywall] User:', user?.id || 'none');
          console.log('[Paywall] Has valid email:', hasEmail);
          
          if (!user || !hasEmail) {
            // No Supabase account or no email - prompt to create account
            // RevenueCat subscription is already active on their anonymous ID
            // When they create an account, we'll link it via Purchases.logIn()
            await AsyncStorage.setItem('NEEDS_EMAIL_SIGNUP', 'true');
            console.log('[Paywall] ✅ Set NEEDS_EMAIL_SIGNUP flag');
            console.log('[Paywall] 🚀 Navigating to PostPurchaseWelcome');
            navigation.navigate('PostPurchaseWelcome');
          } else {
            // User has Supabase account with email - save profile and go to main app
            await saveUsernameToProfile();
            console.log('[Paywall] ✅ Username saved to profile');
            await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
            console.log('[Paywall] ✅ Set HAS_COMPLETED_ONBOARDING flag');
            console.log('[Paywall] 🚀 Navigating to MainTabs via reset');
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          }
        } catch (navError) {
          console.error('[Paywall] ❌ Error during post-purchase navigation:', navError);
          // Fallback - navigate to PostPurchaseWelcome to prompt account creation
          console.log('[Paywall] 🔄 Attempting fallback navigation');
          await AsyncStorage.setItem('NEEDS_EMAIL_SIGNUP', 'true');
          navigation.navigate('PostPurchaseWelcome');
        }
      }
    } else {
      console.log('[Paywall] ❌ Subscription not active after purchase');
      Alert.alert(t('onboarding.paywall.alerts.inactiveTitle'), t('onboarding.paywall.alerts.inactiveBody'));
    }
  };

  const handleStartJourney = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    console.log('[REVENUECAT] 🛍️ Start Journey button pressed');
    console.log('[REVENUECAT] Selected plan:', selectedPlan);
    console.log('[REVENUECAT] Current user:', user?.id || 'none');
    
    // If no user is signed in, proceed with RevenueCat's anonymous ID
    // No Supabase account needed for purchasing - user will create account after
    if (!user) {
      console.log('[Paywall] No Supabase user - proceeding with RevenueCat anonymous ID');
      await AsyncStorage.setItem('NEEDS_EMAIL_SIGNUP', 'true');
    }
    
    const selectedPackage = getSelectedPackage();
    
    if (!selectedPackage) {
      console.warn('[REVENUECAT] ⚠️ No package selected or available');
      console.log('[REVENUECAT] Offering:', offering);
      console.log('[REVENUECAT] Available packages:', offering?.availablePackages.length || 0);
      
      Alert.alert(
        t('onboarding.paywall.alerts.comingSoonTitle'),
        t('onboarding.paywall.alerts.comingSoonBody'),
        [
          {
            text: t('onboarding.paywall.alerts.continueToApp'),
            onPress: async () => {
              console.log('[REVENUECAT] User continuing without purchase');
              
              const hasEmail = user?.email && !user.email.includes('privaterelay');
              
              if (user && hasEmail) {
                // User has account with email - save profile and go to main app
                await saveUsernameToProfile();
                await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              } else {
                // No account or no email - prompt to create account
                await AsyncStorage.setItem('NEEDS_EMAIL_SIGNUP', 'true');
                console.log('[Paywall] No account - navigating to PostPurchaseWelcome');
                navigation.navigate('PostPurchaseWelcome');
              }
            }
          }
        ]
      );
      return;
    }

    console.log('[REVENUECAT] 📦 Selected package:');
    console.log('[REVENUECAT] - Identifier:', selectedPackage.identifier);
    console.log('[REVENUECAT] - Product ID:', selectedPackage.product.identifier);
    console.log('[REVENUECAT] - Price:', selectedPackage.product.priceString);

    try {
      setIsPurchasing(true);
      
      // Check if user already has an active subscription before attempting purchase
      const existingInfo = await Purchases.getCustomerInfo();
      const alreadySubscribed = !!existingInfo.entitlements.active[ENTITLEMENT_ID] || 
                                Object.keys(existingInfo.entitlements.active).length > 0;
      
      if (alreadySubscribed) {
        // CRITICAL: Verify the subscription belongs to THIS user, not a different account on the same device
        const originalOwner = existingInfo.originalAppUserId;
        const currentUserId = user?.id;
        const isOwnSubscription = !currentUserId || originalOwner === currentUserId || 
          originalOwner?.startsWith('$RCAnonymousID:');
        
        console.log('[REVENUECAT] Subscription detected - originalOwner:', originalOwner, 'currentUser:', currentUserId, 'isOwn:', isOwnSubscription);
        
        if (isOwnSubscription) {
          // Subscription belongs to this user - grant access
          console.log('[REVENUECAT] User owns this subscription - granting access');
          Alert.alert(
            t('onboarding.paywall.alerts.alreadySubscribedTitle'),
            t('onboarding.paywall.alerts.alreadySubscribedBody'),
            [{ text: t('onboarding.paywall.alerts.ok'), onPress: () => {
              const fromSettings = route?.params?.fromSettings === true;
              if (fromSettings) {
                navigation.goBack();
              } else {
                handleCustomerInfo(existingInfo);
              }
            }}]
          );
        } else {
          // Subscription belongs to ANOTHER user on this device
          console.log('[REVENUECAT] Subscription belongs to different user:', originalOwner);
          Alert.alert(
            t('onboarding.paywall.alerts.otherAccountTitle'),
            t('onboarding.paywall.alerts.otherAccountPurchaseBody'),
            [
              { text: t('onboarding.paywall.alerts.ok'), style: 'cancel' },
            ]
          );
        }
        setIsPurchasing(false);
        return;
      }
      
      console.log('[REVENUECAT] 💳 Initiating purchase...');
      
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      
      console.log('[REVENUECAT] ✅ Purchase successful!');
      
      // Track subscription purchase
      const tier = selectedPlan === 'yearly' ? 'pro_yearly' : selectedPlan === 'monthly' ? 'pro_monthly' : 'pro_weekly';
      const price = selectedPackage.product.priceString;
      analytics.trackSubscriptionStarted(tier, price, userName || undefined);
      analytics.trackOnboardingScreen('paywall', 'completed', userName || undefined);
      
      // Comprehensive debug logging
      console.log('=== REVENUECAT PURCHASE DEBUG ===');
      console.log('Request Date:', new Date().toISOString());
      console.log('Original App User ID:', customerInfo.originalAppUserId);
      console.log('All Entitlements:', Object.keys(customerInfo.entitlements.all));
      console.log('Active Entitlements:', Object.keys(customerInfo.entitlements.active));
      console.log('Active Subscriptions:', customerInfo.activeSubscriptions);
      console.log('All Purchased Product IDs:', customerInfo.allPurchasedProductIdentifiers);
      
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
      
      handleCustomerInfo(customerInfo);
    } catch (error: any) {
      console.error('[REVENUECAT] ❌ Purchase error:', error);
      console.error('[REVENUECAT] Error message:', error.message);
      console.error('[REVENUECAT] Error code:', error.code);
      console.error('[REVENUECAT] Error userCancelled:', error.userCancelled);
      console.error('[REVENUECAT] Error underlyingErrorMessage:', error.underlyingErrorMessage);
      
      if (error?.userCancelled) {
        console.log('[REVENUECAT] User cancelled purchase');
        return;
      }
      
      // Check if this is the "already subscribed" error from StoreKit
      const errorMsg = error.message?.toLowerCase() || '';
      const isAlreadySubscribed = errorMsg.includes('already') || errorMsg.includes('subscribed') || error.code === 'PRODUCT_ALREADY_PURCHASED_ERROR';
      
      if (isAlreadySubscribed) {
        // CRITICAL: Do NOT grant Pro access here - this receipt likely belongs to another account
        Alert.alert(
          t('onboarding.paywall.alerts.existsTitle'),
          t('onboarding.paywall.alerts.existsBody'),
          [
            { text: t('onboarding.paywall.alerts.tryRestore'), onPress: async () => {
              try {
                console.log('[REVENUECAT] Attempting restore to verify ownership...');
                await Purchases.invalidateCustomerInfoCache();
                await new Promise(resolve => setTimeout(resolve, 1000));
                handleRestorePurchases();
              } catch (error) {
                console.error('[REVENUECAT] Restore failed:', error);
              }
            }},
            { text: t('onboarding.paywall.alerts.ok'), style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          t('onboarding.paywall.alerts.purchaseFailed'),
          t('onboarding.paywall.alerts.purchaseError', {
            message: error.message,
            code: error.code || t('onboarding.paywall.alerts.unknown'),
          }),
          [{ text: t('onboarding.paywall.alerts.ok') }]
        );
      }
    } finally {
      setIsPurchasing(false);
      console.log('[REVENUECAT] Purchase flow complete');
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsPurchasing(true);
      console.log('[REVENUECAT] 🔄 Restoring purchases...');
      
      // Invalidate cache before restoring to force fresh validation
      console.log('[REVENUECAT] Invalidating cache before restore...');
      await Purchases.invalidateCustomerInfoCache();
      
      const customerInfo = await Purchases.restorePurchases();
      
      // Comprehensive debug logging
      console.log('=== REVENUECAT RESTORE DEBUG ===');
      console.log('Request Date:', new Date().toISOString());
      console.log('Original App User ID:', customerInfo.originalAppUserId);
      console.log('All Entitlements:', Object.keys(customerInfo.entitlements.all));
      console.log('Active Entitlements:', Object.keys(customerInfo.entitlements.active));
      console.log('Active Subscriptions:', customerInfo.activeSubscriptions);
      console.log('All Purchased Product IDs:', customerInfo.allPurchasedProductIdentifiers);
      
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
      
      if (Object.keys(customerInfo.entitlements.active).length === 0) {
        Alert.alert(t('onboarding.paywall.alerts.noPurchasesTitle'), t('onboarding.paywall.alerts.noPurchasesBody'));
      } else {
        handleCustomerInfo(customerInfo);
      }
    } catch (error: any) {
      console.error('[REVENUECAT] ❌ Restore error:', error);
      console.error('[REVENUECAT] Error message:', error.message);
      Alert.alert(
        t('onboarding.paywall.alerts.restoreFailed'),
        t('onboarding.paywall.alerts.restoreError', { message: error.message }),
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkTheme(theme.name) ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent={false} />
      {isDarkTheme(theme.name) ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
      ) : (
        <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
      )}

      {/* Back Button - Circular style matching other onboarding pages */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}
      >
        <View style={[styles.backArrowCircle, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <Ionicons name="arrow-back" size={20} color={isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e'} />
        </View>
      </TouchableOpacity>

      <ScrollView
        style={styles.topContent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={styles.logoContainer}>
          <BreathingLogo source={insightLogo} style={styles.logo} />
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, !isDarkTheme(theme.name) && styles.titleLight]}>
            {paywallTitle}
          </Text>
        </View>

        <PaywallHeroPhone />

        <View style={styles.pricingSection}>
        {/* Compact 3-in-a-row Pricing */}
        <View style={styles.plansRow}>
          <PaywallPlanCard
            selected={selectedPlan === 'weekly'}
            light={!isDarkTheme(theme.name)}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlan('weekly');
            }}
            badge={
              <View style={styles.trialBadge}>
                <Text style={styles.trialBadgeText}>{t('onboarding.paywall.trial')}</Text>
              </View>
            }
          >
            <Text style={[styles.compactPlanName, !isDarkTheme(theme.name) && styles.compactPlanNameLight, selectedPlan === 'weekly' && styles.compactPlanNameSelected]}>{t('onboarding.paywall.weekly')}</Text>
            <Text style={[styles.compactPlanPriceMain, !isDarkTheme(theme.name) && styles.compactPlanPriceMainLight, selectedPlan === 'weekly' && styles.compactPlanPriceMainSelected]}>{t('onboarding.paywall.priceWeekly')}</Text>
          </PaywallPlanCard>

          <PaywallPlanCard
            selected={selectedPlan === 'yearly'}
            light={!isDarkTheme(theme.name)}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlan('yearly');
            }}
            badge={
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{t('onboarding.paywall.save')}</Text>
              </View>
            }
          >
            <Text style={[styles.compactPlanName, !isDarkTheme(theme.name) && styles.compactPlanNameLight, selectedPlan === 'yearly' && styles.compactPlanNameSelected]}>{t('onboarding.paywall.yearly')}</Text>
            <Text style={[styles.compactPlanPriceMain, !isDarkTheme(theme.name) && styles.compactPlanPriceMainLight, selectedPlan === 'yearly' && styles.compactPlanPriceMainSelected]}>{t('onboarding.paywall.priceYearly')}</Text>
          </PaywallPlanCard>

          <PaywallPlanCard
            selected={selectedPlan === 'monthly'}
            light={!isDarkTheme(theme.name)}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlan('monthly');
            }}
          >
            <Text style={[styles.compactPlanName, !isDarkTheme(theme.name) && styles.compactPlanNameLight, selectedPlan === 'monthly' && styles.compactPlanNameSelected]}>{t('onboarding.paywall.monthly')}</Text>
            <Text style={[styles.compactPlanPriceMain, !isDarkTheme(theme.name) && styles.compactPlanPriceMainLight, selectedPlan === 'monthly' && styles.compactPlanPriceMainSelected]}>{t('onboarding.paywall.priceMonthly')}</Text>
          </PaywallPlanCard>
        </View>
        </View>

        <View style={styles.whatYouGetContainer}>
          <Text style={[styles.whatYouGetTitle, !isDarkTheme(theme.name) && styles.whatYouGetTitleLight]}>{t('onboarding.paywall.whatYouGet')}</Text>
          <AnimatedBenefitList items={benefitItems} light={!isDarkTheme(theme.name)} />
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={styles.stickyFooter}>
        {/* Commitment Badge */}
        <View style={styles.commitmentBadge}>
          <Text style={styles.commitmentEmoji}>✅</Text>
          <Text style={styles.commitmentText}>{t('onboarding.paywall.noCommitment')}</Text>
        </View>

        <View style={styles.ctaWrap}>
          <TouchableOpacity
            style={[styles.ctaButton, (isPurchasing || isLoading) && styles.ctaButtonDisabled]}
            activeOpacity={0.9}
            onPress={handleStartJourney}
            disabled={isPurchasing || isLoading}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>{t('onboarding.paywall.startJourney')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Links */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestorePurchases}>
            <Text style={styles.footerLink}>{t('onboarding.paywall.restorePurchase')}</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://myinsightai.app/terms')}>
            <Text style={styles.footerLink}>{t('onboarding.paywall.terms')}</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://myinsightai.app/privacy')}>
            <Text style={styles.footerLink}>{t('onboarding.paywall.privacyPolicy')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7f2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: isTablet ? 60 : 50,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  backArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topContent: {
    flex: 1,
    paddingTop: isTablet ? 62 : 44,
  },
  scrollContent: {
    paddingBottom: isTablet ? 200 : 176,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? 6 : 2,
  },
  logo: {
    width: isTablet ? 96 : 88,
    height: isTablet ? 96 : 88,
  },
  header: {
    alignItems: 'center',
    marginBottom: isTablet ? 8 : 2,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: isTablet ? sf(30) : sf(28),
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: isTablet ? sf(38) : sf(36),
  },
  titleLight: {
    color: '#1a1a2e',
  },
  pricingSection: {
    marginTop: isTablet ? 4 : 2,
    overflow: 'visible',
  },
  plansRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: isTablet ? 14 : 10,
    paddingTop: 12,
    paddingHorizontal: isTablet ? 80 : 24,
    overflow: 'visible',
  },
  compactPlanName: {
    fontSize: sf(14),
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  compactPlanNameLight: {
    color: '#1a1a2e',
  },
  compactPlanNameSelected: {
    opacity: 0.9,
    fontWeight: '700',
  },
  compactPlanPriceMain: {
    fontSize: sf(16),
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  compactPlanPriceMainLight: {
    color: '#1a1a2e',
  },
  compactPlanPriceMainSelected: {
    opacity: 0.9,
  },
  saveBadge: {
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  trialBadge: {
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  trialBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  // What you get
  whatYouGetContainer: {
    marginTop: isTablet ? 12 : 8,
    marginBottom: 4,
    paddingHorizontal: isTablet ? 80 : 24,
    paddingBottom: isTablet ? 28 : 24,
  },
  whatYouGetTitle: {
    fontSize: sf(18),
    fontWeight: '700',
    color: '#ffffff',
    marginTop: isTablet ? 4 : 2,
    marginBottom: isTablet ? 14 : 12,
    textAlign: 'center',
  },
  whatYouGetTitleLight: {
    color: '#1a1a2e',
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: isTablet ? 80 : 24,
    paddingBottom: isTablet ? 26 : 18,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  commitmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  commitmentEmoji: {
    fontSize: 14,
  },
  commitmentText: {
    fontSize: sf(13),
    color: '#6b7280',
    fontWeight: '400',
  },
  ctaWrap: {
    width: '100%',
    marginBottom: 8,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 4,
    marginTop: 6,
  },
  footerLink: {
    fontSize: isTablet ? 14 : 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  footerDivider: {
    fontSize: isTablet ? 14 : 10,
    color: '#d1d5db',
  },
});
