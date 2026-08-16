import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Linking, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import BreathingLogo from '../../components/onboarding/BreathingLogo';
import PaywallPlanCard from '../../components/onboarding/PaywallPlanCard';
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { supabase } from '../../lib/supabase';
import { isTablet, sf } from '../../utils/responsive';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../contexts/LanguageContext';
import { getFirstName } from '../../utils/paywallPersonalization';
import { ONBOARDING_SURFACE, ONBOARDING_TEXT, ONBOARDING_CTA } from '../../constants/onboardingTheme';
import { isRevenueCatEnabled } from '../../utils/revenueCatConfig';
import { INSIGHT_LOGO } from '../../constants/appAssets';

const ENTITLEMENT_ID = 'Insight Pro';

/** Paywall uses the light onboarding palette on the ambient gradient. */
const PAYWALL_TEXT = {
  primary: ONBOARDING_TEXT.primary,
  secondary: ONBOARDING_TEXT.body,
  muted: ONBOARDING_TEXT.secondary,
} as const;

export default function PaywallScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { userName } = useOnboarding();
  const { t } = useLanguage();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'yearly'>('yearly');
  const [trialEnabled, setTrialEnabled] = useState(false);
  /** Plan that actually carries an intro/free-trial offer from RevenueCat */
  const [trialPlan, setTrialPlan] = useState<'weekly' | 'monthly' | 'yearly' | null>('weekly');
  const [trialDays, setTrialDays] = useState(3);
  const premiumFeatures = [
    {
      icon: 'sparkles-outline' as const,
      title: t('onboarding.paywall.featureTitles.insights'),
      body: t('onboarding.paywall.featureBodies.insights'),
    },
    {
      icon: 'chatbubbles-outline' as const,
      title: t('onboarding.paywall.featureTitles.mira'),
      body: t('onboarding.paywall.featureBodies.mira'),
    },
    {
      icon: 'lock-closed-outline' as const,
      title: t('onboarding.paywall.featureTitles.encryption'),
      body: t('onboarding.paywall.featureBodies.encryption'),
    },
    {
      icon: 'book-outline' as const,
      title: t('onboarding.paywall.featureTitles.playbooks'),
      body: t('onboarding.paywall.featureBodies.playbooks'),
    },
  ];
  const trialLabel = t('onboarding.paywall.trialEnabledDays', { days: trialDays });
  const trialBadgeLabel = t('onboarding.paywall.trialDays', { days: trialDays });
  const showTrialCta = trialEnabled && selectedPlan === 'weekly';

  const handleTrialToggle = (enabled: boolean) => {
    Haptics.selectionAsync();
    setTrialEnabled(enabled);
    if (enabled) {
      setSelectedPlan('weekly');
    }
  };

  const handleSelectPlan = (plan: 'weekly' | 'monthly' | 'yearly') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
    if (plan !== 'weekly') {
      setTrialEnabled(false);
    }
  };
  const firstName = getFirstName(userName);
  const paywallTitle = firstName
    ? t('onboarding.paywall.pricingTitleNamed', { name: firstName })
    : t('onboarding.paywall.pricingTitleGeneric');

  useEffect(() => {
    if (!isRevenueCatEnabled()) {
      const fromSettings = route?.params?.fromSettings === true;
      if (fromSettings) {
        navigation.goBack();
        return;
      }
      (async () => {
        await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
        navigation.replace('PostPurchaseWelcome');
      })();
      return;
    }

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
            const intro = (pkg.product as any).introPrice;
            if (intro) {
              console.log(`  - Intro:`, intro);
            }
          });
          setOffering(offerings.current);

          // Detect which package actually has a free trial / intro offer
          const idToPlan = (id: string): 'weekly' | 'monthly' | 'yearly' | null => {
            if (id.includes('week') || id === '$rc_weekly') return 'weekly';
            if (id.includes('month') || id === '$rc_monthly') return 'monthly';
            if (id.includes('annual') || id.includes('year') || id === '$rc_annual') return 'yearly';
            return null;
          };
          let foundPlan: 'weekly' | 'monthly' | 'yearly' | null = null;
          let foundDays = 3;
          for (const pkg of offerings.current.availablePackages) {
            const intro = (pkg.product as any).introPrice;
            const isFreeIntro =
              intro &&
              (intro.price === 0 ||
                intro.priceString === 'Free' ||
                String(intro.priceString || '').toLowerCase().includes('free'));
            if (!isFreeIntro && !intro) continue;
            if (!intro) continue;
            const plan = idToPlan(pkg.identifier) || idToPlan(pkg.product.identifier);
            if (!plan) continue;
            let days = 3;
            const unit = String(intro.periodUnit || intro.period || '').toUpperCase();
            const n = Number(intro.periodNumberOfUnits || intro.cycles || 1);
            if (unit.includes('DAY')) days = n;
            else if (unit.includes('WEEK')) days = n * 7;
            else if (unit.includes('MONTH')) days = n * 30;
            foundPlan = plan;
            foundDays = days;
            // Prefer weekly if multiple have trials (matches UI badge placement)
            if (plan === 'weekly') break;
          }
          if (foundPlan) {
            setTrialPlan(foundPlan);
            setTrialDays(foundDays);
            setSelectedPlan(foundPlan);
            setTrialEnabled(true);
            console.log('[REVENUECAT] Trial plan:', foundPlan, 'days:', foundDays);
          } else {
            // Fallback: badge weekly as trial carrier (historical RC config)
            setTrialPlan('weekly');
            setTrialDays(3);
            console.log('[REVENUECAT] No introPrice found — defaulting trial UI to weekly / 3 days');
          }
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
            await AsyncStorage.removeItem('HAS_SEEN_DASHBOARD_INTRO');
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
      <OnboardingAmbientBackground />

      {/* Back Button - Circular style matching other onboarding pages */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}
      >
        <View style={styles.backArrowCircle}>
          <Ionicons name="arrow-back" size={20} color={PAYWALL_TEXT.primary} />
        </View>
      </TouchableOpacity>

      <ScrollView
        style={styles.topContent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={styles.logoContainer}>
          <BreathingLogo source={INSIGHT_LOGO} style={styles.logo} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {paywallTitle}
          </Text>
        </View>

        <View style={styles.featuresBlock}>
          <View style={styles.featuresRail}>
            <View style={styles.iconRail}>
              {premiumFeatures.map((feature) => (
                <View key={`icon-${feature.title}`} style={styles.iconRailSlot}>
                  <Ionicons name={feature.icon} size={18} color={ONBOARDING_TEXT.secondary} />
                </View>
              ))}
            </View>
            <View style={styles.featureCopyCol}>
              {premiumFeatures.map((feature) => (
                <View key={feature.title} style={styles.featureCopyRow}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureBody}>{feature.body}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.trialToggle}>
          <Text style={styles.trialToggleLabel}>{trialLabel}</Text>
          <Switch
            value={trialEnabled}
            onValueChange={handleTrialToggle}
            trackColor={{ false: 'rgba(123, 94, 167, 0.15)', true: 'rgba(123, 94, 167, 0.55)' }}
            thumbColor={trialEnabled ? '#FFFFFF' : '#E5E7EB'}
            ios_backgroundColor="rgba(123, 94, 167, 0.15)"
          />
        </View>

        <View style={styles.pricingSection}>
        {/* Compact 3-in-a-row Pricing */}
        <View style={styles.plansRow}>
          <PaywallPlanCard
            selected={selectedPlan === 'weekly'}
            light
            onPress={() => handleSelectPlan('weekly')}
            badge={
              trialEnabled ? (
                <View style={styles.trialBadge}>
                  <Text style={styles.trialBadgeText}>{trialBadgeLabel}</Text>
                </View>
              ) : undefined
            }
          >
            <Text style={[styles.compactPlanName, selectedPlan === 'weekly' && styles.compactPlanNameSelected]}>{t('onboarding.paywall.weekly')}</Text>
            <Text style={[styles.compactPlanPriceMain, selectedPlan === 'weekly' && styles.compactPlanPriceMainSelected]}>{t('onboarding.paywall.priceWeekly')}</Text>
          </PaywallPlanCard>

          <PaywallPlanCard
            selected={selectedPlan === 'yearly'}
            recommended
            light
            onPress={() => handleSelectPlan('yearly')}
            badge={
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{t('onboarding.paywall.bestValue')}</Text>
              </View>
            }
          >
            <Text style={[styles.compactPlanName, selectedPlan === 'yearly' && styles.compactPlanNameSelected]}>{t('onboarding.paywall.yearly')}</Text>
            <Text style={[styles.compactPlanPriceMain, selectedPlan === 'yearly' && styles.compactPlanPriceMainSelected]}>{t('onboarding.paywall.priceYearly')}</Text>
          </PaywallPlanCard>

          <PaywallPlanCard
            selected={selectedPlan === 'monthly'}
            light
            onPress={() => handleSelectPlan('monthly')}
          >
            <Text style={[styles.compactPlanName, selectedPlan === 'monthly' && styles.compactPlanNameSelected]}>{t('onboarding.paywall.monthly')}</Text>
            <Text style={[styles.compactPlanPriceMain, selectedPlan === 'monthly' && styles.compactPlanPriceMainSelected]}>{t('onboarding.paywall.priceMonthly')}</Text>
          </PaywallPlanCard>
        </View>
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
              <Text style={styles.ctaText}>
                {showTrialCta
                  ? t('onboarding.paywall.startJourney')
                  : t('common.continue')}
              </Text>
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
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: isTablet ? 60 : 50,
    left: 24,
    zIndex: 10,
    padding: 4,
  },
  backArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ONBOARDING_SURFACE.fillElevated,
    borderWidth: 1,
    borderColor: ONBOARDING_SURFACE.border,
  },
  topContent: {
    flex: 1,
    paddingTop: isTablet ? 72 : 56,
  },
  scrollContent: {
    paddingBottom: isTablet ? 240 : 210,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? 8 : 4,
  },
  logo: {
    width: isTablet ? 88 : 80,
    height: isTablet ? 88 : 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: isTablet ? 28 : 24,
  },
  title: {
    fontSize: isTablet ? sf(30) : sf(28),
    fontWeight: '600',
    color: PAYWALL_TEXT.primary,
    letterSpacing: -1.28,
    textAlign: 'center',
    lineHeight: isTablet ? sf(38) : sf(36),
  },
  featuresBlock: {
    marginBottom: isTablet ? 32 : 28,
  },
  featuresRail: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  iconRail: {
    width: 48,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: ONBOARDING_SURFACE.fill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ONBOARDING_SURFACE.border,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  iconRailSlot: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopyCol: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 16,
  },
  featureCopyRow: {
    minHeight: 40,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: sf(15),
    fontWeight: '700',
    color: PAYWALL_TEXT.primary,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  featureBody: {
    fontSize: sf(13),
    fontWeight: '400',
    color: PAYWALL_TEXT.secondary,
    lineHeight: sf(18),
  },
  trialToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(200, 185, 255, 0.35)',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: isTablet ? 28 : 24,
  },
  trialToggleLabel: {
    fontSize: sf(14),
    fontWeight: '500',
    color: '#1a1a2e',
    flex: 1,
    paddingRight: 12,
  },
  pricingSection: {
    marginTop: isTablet ? 8 : 4,
    marginBottom: isTablet ? 28 : 24,
    overflow: 'visible',
  },
  plansRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: isTablet ? 20 : 16,
    paddingTop: 14,
    overflow: 'visible',
  },
  compactPlanName: {
    fontSize: sf(14),
    fontWeight: '700',
    color: PAYWALL_TEXT.primary,
    marginBottom: 4,
  },
  compactPlanNameSelected: {
    opacity: 0.9,
    fontWeight: '700',
  },
  compactPlanPriceMain: {
    fontSize: sf(16),
    fontWeight: '800',
    color: PAYWALL_TEXT.primary,
    marginTop: 2,
  },
  compactPlanPriceMainSelected: {
    opacity: 0.9,
  },
  saveBadge: {
    backgroundColor: '#7B5EA7',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  trialBadge: {
    backgroundColor: '#7B5EA7',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  trialBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: isTablet ? 26 : 18,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderTopWidth: 1,
    borderColor: ONBOARDING_SURFACE.border,
    shadowColor: 'rgba(120, 80, 200, 0.12)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 20,
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
    color: PAYWALL_TEXT.secondary,
    fontWeight: '400',
  },
  ctaWrap: {
    width: '100%',
    marginBottom: 8,
  },
  ctaButton: {
    width: '100%',
    height: 56,
    borderRadius: ONBOARDING_CTA.borderRadius,
    backgroundColor: ONBOARDING_CTA.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(123, 94, 167, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: ONBOARDING_CTA.text,
    letterSpacing: 0.2,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: ONBOARDING_CTA.text,
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
    color: PAYWALL_TEXT.secondary,
    fontWeight: '500',
  },
  footerDivider: {
    fontSize: isTablet ? 14 : 10,
    color: 'rgba(255,255,255,0.35)',
  },
});
