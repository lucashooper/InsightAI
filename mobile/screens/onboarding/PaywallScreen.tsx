import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Image, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import SunoGradient from '../../components/onboarding/SunoGradient';
import PlanCard from '../../components/onboarding/PlanCard';
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { supabase } from '../../lib/supabase';
import { isTablet, sf, ss, iPadContentStyle } from '../../utils/responsive';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { analytics } from '../../services/analytics';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');

const phoneImages = [
  require('../../public/phone-images/Insight-Main-Page-Phone copy.png'),
  require('../../public/phone-images/Insight-Dashboard-Page-Phone.png'),
  require('../../public/phone-images/Insight-Journal-Page-Phone copy.png'),
  require('../../public/phone-images/Insight-Insights-Page-Phone-Real.png'),
  require('../../public/phone-images/Insight-Playbook-Page-Phone.png'),
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAROUSEL_IMAGE_WIDTH = SCREEN_WIDTH;
const PHONE_DISPLAY_HEIGHT = isTablet ? SCREEN_HEIGHT * 0.50 : SCREEN_HEIGHT * 0.42;

const slideHeadings = [
  'Understand Yourself\nwith Insight',
  'Track Your Growth\n& Progress',
  'Reflect Deeper,\nLive Better',
  'Unlock AI-Powered\nInsights',
  'Your Personal\nPlaybook',
];

const ENTITLEMENT_ID = 'Insight Pro';

export default function PaywallScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { userName } = useOnboarding();
  const { theme } = useTheme();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'yearly'>('yearly');
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(true); // Images preloaded globally in App.tsx
  const carouselRef = useRef<FlatList>(null);

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
          'Subscription Found on Another Account',
          'This subscription belongs to a different account on this device. Please log in to that account to use Pro features.',
          [{ text: 'OK' }]
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
          'Purchase Successful! 🎉',
          'You now have access to unlimited AI insights and all Pro features.',
          [
            {
              text: 'OK',
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
      Alert.alert('Subscription not active', 'Your purchase could not be confirmed. Please contact support if this persists.');
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
        'Subscriptions Coming Soon',
        'Mobile subscriptions are being set up. You can continue using the app and subscribe later on the web at myinsightai.app',
        [
          {
            text: 'Continue to App',
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
            'Already Subscribed',
            'You already have an active Pro subscription. Enjoy your premium features!',
            [{ text: 'OK', onPress: () => {
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
            'Subscription Found on Another Account',
            'A Pro subscription is active on a different account on this device. Please log in to that account to use Pro features, or purchase a new subscription for this account.',
            [
              { text: 'OK', style: 'cancel' },
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
          'Subscription Already Exists',
          'A subscription was previously purchased on this device with a different account. To use Pro features, please log in to the account that originally purchased the subscription.\n\nIf you believe this is an error, try restoring purchases or contact support.',
          [
            { text: 'Try Restore', onPress: async () => {
              try {
                console.log('[REVENUECAT] Attempting restore to verify ownership...');
                await Purchases.invalidateCustomerInfoCache();
                await new Promise(resolve => setTimeout(resolve, 1000));
                handleRestorePurchases();
              } catch (error) {
                console.error('[REVENUECAT] Restore failed:', error);
              }
            }},
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          'Purchase Failed',
          `Error: ${error.message}\n\nCode: ${error.code || 'unknown'}\n\nPlease check:\n1. Sandbox account is signed in (Settings > App Store)\n2. Products are configured in App Store Connect\n3. Try again in a few moments`,
          [{ text: 'OK' }]
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
        Alert.alert('No Purchases Found', 'No active subscriptions were found for this Apple ID.');
      } else {
        handleCustomerInfo(customerInfo);
      }
    } catch (error: any) {
      console.error('[REVENUECAT] ❌ Restore error:', error);
      console.error('[REVENUECAT] Error message:', error.message);
      Alert.alert('Restore failed', `Could not restore purchases: ${error.message}`);
    } finally {
      setIsPurchasing(false);
    }
  };

  const onCarouselScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveCarouselIndex(index);
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

      {/* Show loading spinner until images are preloaded */}
      {!imagesLoaded ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : (
        <>
      {/* Scrollable top content */}
      <ScrollView
        style={styles.topContent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={insightLogo} style={styles.logo} resizeMode="cover" />
        </View>

        {/* Dynamic heading that changes per slide */}
        <View style={styles.header}>
          <Text style={[styles.title, !isDarkTheme(theme.name) && styles.titleLight]}>{slideHeadings[activeCarouselIndex]}</Text>
        </View>

        {/* Phone Image Carousel - half phone with fade */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={carouselRef}
            data={phoneImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={styles.carouselSlide}>
                <Image source={item} style={styles.carouselImage} resizeMode="contain" />
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
          {/* Subtle fade at bottom of phone to soften cutoff */}
          <LinearGradient
            colors={(() => {
              // Use rgba with matching hue to avoid black line from 'transparent' (which is rgba(0,0,0,0))
              const bg = theme.colors.background;
              // Parse hex to rgb
              const r = parseInt(bg.slice(1, 3), 16) || 0;
              const g = parseInt(bg.slice(3, 5), 16) || 0;
              const b = parseInt(bg.slice(5, 7), 16) || 0;
              return [
                `rgba(${r},${g},${b},0)`,
                `rgba(${r},${g},${b},0.2)`,
                `rgba(${r},${g},${b},1)`,
              ];
            })()}
            style={styles.phoneFade}
            pointerEvents="none"
          />
        </View>

        {/* Pagination Dots - Now Clickable */}
        <View style={styles.dotsContainer}>
          {phoneImages.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                carouselRef.current?.scrollToIndex({ index, animated: true });
                setActiveCarouselIndex(index);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dot,
                  activeCarouselIndex === index && styles.dotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Compact 3-in-a-row Pricing */}
        <View style={styles.plansRow}>
          {/* Weekly */}
          <TouchableOpacity
            style={[styles.compactPlan, !isDarkTheme(theme.name) && { backgroundColor: 'rgba(0, 0, 0, 0.06)', borderColor: 'rgba(0, 0, 0, 0.1)' }, selectedPlan === 'weekly' && styles.compactPlanSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlan('weekly');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.trialBadge}>
              <Text style={styles.trialBadgeText}>3 day trial</Text>
            </View>
            <Text style={[styles.compactPlanName, !isDarkTheme(theme.name) && { color: '#1a1a2e' }, selectedPlan === 'weekly' && styles.compactPlanNameSelected]}>Weekly</Text>
            <Text style={[styles.compactPlanDaily, !isDarkTheme(theme.name) && { color: '#1a1a2e' }, selectedPlan === 'weekly' && styles.compactPlanDailySelected]}>$0.71 / day</Text>
            <Text style={[styles.compactPlanPrice, !isDarkTheme(theme.name) && { color: 'rgba(0,0,0,0.5)' }, selectedPlan === 'weekly' && styles.compactPlanPriceSelected]}>$4.99 per week</Text>
          </TouchableOpacity>

          {/* Yearly - Best Value */}
          <TouchableOpacity
            style={[styles.compactPlan, !isDarkTheme(theme.name) && { backgroundColor: 'rgba(0, 0, 0, 0.06)', borderColor: 'rgba(0, 0, 0, 0.1)' }, selectedPlan === 'yearly' && styles.compactPlanSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlan('yearly');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 73%</Text>
            </View>
            <Text style={[styles.compactPlanName, !isDarkTheme(theme.name) && { color: '#1a1a2e' }, selectedPlan === 'yearly' && styles.compactPlanNameSelected]}>Yearly</Text>
            <Text style={[styles.compactPlanDaily, !isDarkTheme(theme.name) && { color: '#1a1a2e' }, selectedPlan === 'yearly' && styles.compactPlanDailySelected]}>$0.19 / day</Text>
            <Text style={[styles.compactPlanPrice, !isDarkTheme(theme.name) && { color: 'rgba(0,0,0,0.5)' }, selectedPlan === 'yearly' && styles.compactPlanPriceSelected]}>$69.99 per year</Text>
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            style={[styles.compactPlan, !isDarkTheme(theme.name) && { backgroundColor: 'rgba(0, 0, 0, 0.06)', borderColor: 'rgba(0, 0, 0, 0.1)' }, selectedPlan === 'monthly' && styles.compactPlanSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlan('monthly');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.compactPlanName, !isDarkTheme(theme.name) && { color: '#1a1a2e' }, selectedPlan === 'monthly' && styles.compactPlanNameSelected]}>Monthly</Text>
            <Text style={[styles.compactPlanDaily, !isDarkTheme(theme.name) && { color: '#1a1a2e' }, selectedPlan === 'monthly' && styles.compactPlanDailySelected]}>$0.60 / day</Text>
            <Text style={[styles.compactPlanPrice, !isDarkTheme(theme.name) && { color: 'rgba(0,0,0,0.5)' }, selectedPlan === 'monthly' && styles.compactPlanPriceSelected]}>$17.99 per month</Text>
          </TouchableOpacity>
        </View>

        {/* What you get */}
        <View style={styles.whatYouGetContainer}>
          <Text style={[styles.whatYouGetTitle, !isDarkTheme(theme.name) && styles.whatYouGetTitleLight]}>What you get:</Text>
          <View style={styles.whatYouGetList}>
            {[
              'Unlimited AI-powered journal insights',
              'Deep pattern & trigger detection',
              'Personalized weekly summaries',
              'Growth playbook & action plans',
            ].map((item, i) => (
              <View key={i} style={styles.whatYouGetItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={[styles.whatYouGetText, !isDarkTheme(theme.name) && styles.whatYouGetTextLight]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Testimonials Carousel */}
        <View style={styles.testimonialContainer}>
          <FlatList
            data={[
              { id: '1', text: "Insight has completely changed how I understand my emotions. The AI insights are incredibly accurate and helpful.", author: "Jessica M." },
              { id: '2', text: "The journaling prompts are thoughtful and the pattern tracking helps me see my growth over time.", author: "Michael R." },
              { id: '3', text: "Best mental health app I've used. The AI feels like talking to a therapist who really gets me.", author: "Sarah K." },
              { id: '4', text: "I love how it connects my daily habits to my mood patterns. Eye-opening insights every week.", author: "David L." },
              { id: '5', text: "The playbook feature with personalized strategies has been a game-changer for my anxiety.", author: "Emma T." },
            ]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveReviewIndex(index);
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={styles.testimonialSlide}>
                <View style={[
                  styles.testimonialCard, 
                  isDarkTheme(theme.name) 
                    ? styles.testimonialCardDark 
                    : styles.testimonialCardLight
                ]}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons key={star} name="star" size={16} color="#fbbf24" />
                    ))}
                  </View>
                  <Text style={[styles.testimonialText, !isDarkTheme(theme.name) && styles.testimonialTextLight]}>
                    "{item.text}"
                  </Text>
                  <Text style={[styles.testimonialAuthor, !isDarkTheme(theme.name) && styles.testimonialAuthorLight]}>— {item.author}</Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
          {/* Review Pagination Dots */}
          <View style={styles.reviewDotsContainer}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View
                key={index}
                style={[
                  styles.reviewDot,
                  activeReviewIndex === index && styles.reviewDotActive,
                  !isDarkTheme(theme.name) && styles.reviewDotLight,
                  !isDarkTheme(theme.name) && activeReviewIndex === index && styles.reviewDotActiveLight,
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={styles.stickyFooter}>
        {/* Commitment Badge */}
        <View style={styles.commitmentBadge}>
          <Text style={styles.commitmentEmoji}>✅</Text>
          <Text style={styles.commitmentText}>No Commitment, Cancel anytime.</Text>
        </View>

        {/* CTA Button - Purple gradient */}
        <TouchableOpacity
          style={[styles.ctaButton, isPurchasing && { opacity: 0.7 }]}
          activeOpacity={0.9}
          onPress={handleStartJourney}
          disabled={isPurchasing || isLoading}
        >
          <View style={styles.ctaGradient}>
            {isPurchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Start My Journey Today</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestorePurchases}>
            <Text style={styles.footerLink}>Restore Purchase</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://myinsightai.app/terms')}>
            <Text style={styles.footerLink}>Terms & Conditions</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://myinsightai.app/privacy')}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
      </>
      )}
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
    paddingTop: isTablet ? 70 : 50,
  },
  scrollContent: {
    paddingBottom: isTablet ? 190 : 160,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? 12 : 6,
  },
  logo: {
    width: isTablet ? 110 : 105,
    height: isTablet ? 110 : 105,
    opacity: 0.9,
  },
  header: {
    alignItems: 'center',
    marginBottom: isTablet ? 16 : 4,
    paddingHorizontal: 24,
    minHeight: isTablet ? sf(100) : sf(80),
    justifyContent: 'center',
  },
  title: {
    fontSize: isTablet ? sf(38) : sf(36),
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: isTablet ? sf(46) : sf(43),
  },
  titleLight: {
    color: '#1a1a2e',
  },
  // Carousel
  carouselContainer: {
    height: PHONE_DISPLAY_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  carouselSlide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  carouselImage: {
    width: isTablet ? SCREEN_WIDTH * 0.50 : SCREEN_WIDTH * 0.85,
    height: isTablet ? SCREEN_WIDTH * 0.50 * 2.1 : SCREEN_WIDTH * 0.85 * 2.1,
    borderRadius: 28,
  },
  phoneFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  dotActive: {
    backgroundColor: '#8b5cf6',
    width: 20,
  },
  // Compact pricing
  plansRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: isTablet ? 80 : 24,
  },
  compactPlan: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 40, 0.85)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
  },
  compactPlanSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
    borderWidth: 2.5,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  compactPlanName: {
    fontSize: sf(14),
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  compactPlanNameSelected: {
    opacity: 0.9,
    fontWeight: '700',
  },
  compactPlanDaily: {
    fontSize: sf(15),
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  compactPlanDailySelected: {
    opacity: 0.85,
  },
  compactPlanPrice: {
    fontSize: sf(10),
    color: '#ffffff',
    fontWeight: '500',
  },
  compactPlanPriceSelected: {
    opacity: 0.8,
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  trialBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  trialBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  // What you get
  whatYouGetContainer: {
    marginBottom: 8,
    paddingHorizontal: isTablet ? 80 : 24,
  },
  whatYouGetTitle: {
    fontSize: sf(18),
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  whatYouGetTitleLight: {
    color: '#1a1a2e',
  },
  whatYouGetList: {
    gap: 10,
  },
  whatYouGetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  whatYouGetText: {
    fontSize: sf(16),
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
  },
  whatYouGetTextLight: {
    color: '#1a1a2e',
  },
  // Testimonial
  testimonialContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  testimonialSlide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: isTablet ? 80 : 24,
    alignItems: 'center',
  },
  testimonialCard: {
    width: SCREEN_WIDTH - (isTablet ? 160 : 48),
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  testimonialCardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  testimonialCardLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testimonialText: {
    fontSize: sf(15),
    color: '#ffffff',
    lineHeight: sf(22),
    fontWeight: '500',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  testimonialTextLight: {
    color: '#374151',
  },
  testimonialAuthor: {
    fontSize: sf(14),
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
  },
  testimonialAuthorLight: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  reviewDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  reviewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  reviewDotActive: {
    backgroundColor: '#8b5cf6',
    width: 20,
  },
  reviewDotLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  reviewDotActiveLight: {
    backgroundColor: '#8b5cf6',
  },
  // Sticky footer
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: isTablet ? 80 : 24,
    paddingBottom: isTablet ? 30 : 20,
    paddingTop: 14,
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
    marginBottom: 10,
  },
  commitmentEmoji: {
    fontSize: 14,
  },
  commitmentText: {
    fontSize: sf(13),
    color: '#6b7280',
    fontWeight: '400',
  },
  ctaButton: {
    width: '100%',
    borderRadius: 28,
    marginBottom: 12,
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    borderRadius: 28,
  },
  ctaText: {
    fontSize: sf(17),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
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
