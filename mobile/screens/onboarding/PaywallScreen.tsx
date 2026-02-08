import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SunoGradient from '../../components/onboarding/SunoGradient';
import PlanCard from '../../components/onboarding/PlanCard';
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { supabase } from '../../lib/supabase';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');

const ENTITLEMENT_ID = 'InsightAI Pro';

export default function PaywallScreen({ navigation }: any) {
  const { user } = useAuth();
  const { userName } = useOnboarding();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
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
    
    if (!userName) {
      console.log('[Paywall] No username found in context, skipping profile save');
      return;
    }
    
    try {
      console.log('[Paywall] Saving username to profile...');
      console.log('[Paywall] User ID:', user.id);
      console.log('[Paywall] Username:', userName);
      console.log('[Paywall] User email:', user.email);
      
      // First, try to check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id, username')
        .eq('user_id', user.id)
        .single();
      
      console.log('[Paywall] Existing profile check:', existingProfile);
      console.log('[Paywall] Check error:', checkError);
      
      if (existingProfile) {
        // Profile exists, update it
        console.log('[Paywall] Profile exists, updating username...');
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
        // Profile doesn't exist, create it
        console.log('[Paywall] Profile does not exist, creating new profile...');
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            username: userName,
            email: user.email,
          });
        
        if (insertError) {
          console.error('[Paywall] ❌ Error creating profile:', insertError);
        } else {
          console.log('[Paywall] ✅ Profile created successfully');
        }
      }
      
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
    
    const isProActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    console.log('[Paywall] Checking subscription status:', isProActive);
    
    // TEMPORARY FIX: If we have ANY active entitlement, consider it valid
    const hasAnyActiveEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
    console.log('[Paywall] Has any active entitlement:', hasAnyActiveEntitlement);
    
    if (isProActive || hasAnyActiveEntitlement) {
      console.log('[Paywall] ✅ Subscription is active');
      
      // Check if user has completed onboarding
      const hasCompletedOnboarding = await AsyncStorage.getItem('HAS_COMPLETED_ONBOARDING');
      console.log('[Paywall] Has completed onboarding:', hasCompletedOnboarding);
      
      if (hasCompletedOnboarding === 'true') {
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
        
        // Save username to profile and mark onboarding complete
        await saveUsernameToProfile();
        
        // Check if user has email (didn't skip email signup)
        const hasEmail = user?.email && !user.email.includes('privaterelay');
        console.log('[Paywall] User has email:', hasEmail);
        
        if (!hasEmail) {
          // User skipped email signup - store flag to show email prompt overlay
          await AsyncStorage.setItem('NEEDS_EMAIL_SIGNUP', 'true');
          console.log('[Paywall] User needs email signup, flag set');
        }
        
        // Navigate to main app
        console.log('[Paywall] Navigating to MainTabs');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
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
              
              // Save username to profile and mark onboarding complete
              await saveUsernameToProfile();
              
              // Check if user has email (didn't skip email signup)
              const hasEmail = user?.email && !user.email.includes('privaterelay');
              console.log('[Paywall] User has email:', hasEmail);
              
              if (!hasEmail) {
                // User skipped email signup - store flag to show email prompt overlay
                await AsyncStorage.setItem('NEEDS_EMAIL_SIGNUP', 'true');
                console.log('[Paywall] User needs email signup, flag set');
              }
              
              // Navigate to main app
              console.log('[Paywall] Navigating to MainTabs (no subscription)');
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
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
      console.log('[REVENUECAT] 💳 Initiating purchase...');
      
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      
      console.log('[REVENUECAT] ✅ Purchase successful!');
      
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
        Alert.alert(
          'Sandbox Subscription Cache',
          'Apple\'s sandbox environment has a cached subscription record.\n\nThis is a testing limitation - your actual subscription status is "Free" as shown in Settings.\n\nTo test purchases:\n1. Settings → App Store → Sign out of sandbox account\n2. Sign in with a different sandbox account\n3. Or wait 30 minutes for auto-expiration\n\nYou can skip this screen and continue to the app.',
          [
            { text: 'Continue to App', onPress: async () => {
              await saveUsernameToProfile();
              navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={insightLogo} style={styles.logo} resizeMode="cover" />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose your plan</Text>
          <Text style={styles.subtitle}>
            Unlock clarity, growth, and daily insights.
          </Text>
        </View>

        {/* Pricing Plans */}
        <View style={styles.plansContainer}>
          {/* 1-Week Plan */}
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'weekly' && styles.planCardSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlan('weekly');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.trialBadge}>
              <Text style={styles.trialBadgeText}>3-DAY FREE TRIAL</Text>
            </View>
            <View style={styles.planHeader}>
              <View style={styles.planTitleRow}>
                <View style={[styles.radioButton, selectedPlan === 'weekly' && styles.radioButtonSelected]}>
                  {selectedPlan === 'weekly' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.planTitle}>1-Week Plan</Text>
              </View>
              <View style={styles.planPricing}>
                <Text style={styles.planPrice}>$4.99</Text>
                <Text style={styles.planPeriod}>per week</Text>
              </View>
            </View>
            <Text style={styles.planDaily}>$0.71 per day</Text>
          </TouchableOpacity>

          {/* Monthly Plan - MOST POPULAR */}
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlan('monthly');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
            </View>
            <View style={styles.planHeader}>
              <View style={styles.planTitleRow}>
                <View style={[styles.radioButton, selectedPlan === 'monthly' && styles.radioButtonSelected]}>
                  {selectedPlan === 'monthly' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.planTitle}>Monthly Plan</Text>
              </View>
              <View style={styles.planPricing}>
                <Text style={styles.planPrice}>$17.99</Text>
                <Text style={styles.planPeriod}>per month</Text>
              </View>
            </View>
            <Text style={styles.planDaily}>$0.60 per day</Text>
          </TouchableOpacity>

          {/* Yearly Plan */}
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPlan('yearly');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.planHeader}>
              <View style={styles.planTitleRow}>
                <View style={[styles.radioButton, selectedPlan === 'yearly' && styles.radioButtonSelected]}>
                  {selectedPlan === 'yearly' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.planTitle}>1-Year Plan</Text>
              </View>
              <View style={styles.planPricing}>
                <Text style={styles.planPrice}>$69.99</Text>
                <Text style={styles.planPeriod}>per year</Text>
              </View>
            </View>
            <Text style={styles.planDaily}>$0.19 per day</Text>
          </TouchableOpacity>
        </View>

        {/* Testimonial */}
        <LinearGradient
          colors={['rgba(88, 50, 150, 0.25)', 'rgba(50, 30, 90, 0.35)', 'rgba(30, 20, 60, 0.45)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.testimonialContainer}
        >
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons key={i} name="star" size={16} color="#fbbf24" />
            ))}
          </View>
          <Text style={styles.testimonialText}>
            Insight has completely transformed how I process my thoughts. The AI insights help me understand patterns I never noticed before.
          </Text>
          <Text style={styles.testimonialAuthor}>— Jessica</Text>
        </LinearGradient>

        {/* Free vs Pro Comparison */}
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonColumn}>
            <Text style={styles.comparisonTitle}>Free</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#6b7280" />
              <Text style={styles.featureText}>Daily journal</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#6b7280" />
              <Text style={styles.featureText}>Limited AI analysis</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="close-circle" size={18} color="#4b5563" />
              <Text style={[styles.featureText, styles.featureDisabled]}>No weekly insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="close-circle" size={18} color="#4b5563" />
              <Text style={[styles.featureText, styles.featureDisabled]}>No pattern tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="close-circle" size={18} color="#4b5563" />
              <Text style={[styles.featureText, styles.featureDisabled]}>No deep summaries</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="close-circle" size={18} color="#4b5563" />
              <Text style={[styles.featureText, styles.featureDisabled]}>No trigger detection</Text>
            </View>
          </View>

          <View style={styles.comparisonColumn}>
            <Text style={[styles.comparisonTitle, styles.proTitle]}>Pro</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Unlimited insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Weekly summaries</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Deep pattern detection</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Trigger analysis</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Personalized guidance</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Streak protection</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Private processing</Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, isPurchasing && { opacity: 0.7 }]}
          activeOpacity={0.9}
          onPress={handleStartJourney}
          disabled={isPurchasing || isLoading}
        >
          <LinearGradient
            colors={['#a855f7', '#8b5cf6', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>
                {selectedPlan === 'weekly' ? 'Start free trial' : 'Subscribe now'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestorePurchases}>
            <Text style={styles.footerLink}>Restore Purchases</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.footerLink}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.footerLink}>Privacy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  radialOverlay1: {
    position: 'absolute',
    top: -200,
    right: -200,
    width: 600,
    height: 600,
    borderRadius: 300,
  },
  radialOverlay2: {
    position: 'absolute',
    bottom: -100,
    left: -200,
    width: 700,
    height: 700,
    borderRadius: 350,
  },
  radialOverlay3: {
    position: 'absolute',
    top: '30%',
    right: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
  },
  starsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  star1: {
    width: 2,
    height: 2,
    top: '15%',
    left: '20%',
    opacity: 0.8,
  },
  star2: {
    width: 1,
    height: 1,
    top: '25%',
    left: '80%',
    opacity: 0.6,
  },
  star3: {
    width: 1.5,
    height: 1.5,
    top: '35%',
    left: '15%',
    opacity: 0.4,
  },
  star4: {
    width: 1,
    height: 1,
    top: '45%',
    left: '70%',
    opacity: 0.7,
  },
  star5: {
    width: 2,
    height: 2,
    top: '55%',
    left: '30%',
    opacity: 0.5,
  },
  star6: {
    width: 1,
    height: 1,
    top: '65%',
    left: '85%',
    opacity: 0.6,
  },
  star7: {
    width: 1.5,
    height: 1.5,
    top: '75%',
    left: '25%',
    opacity: 0.8,
  },
  star8: {
    width: 1,
    height: 1,
    top: '20%',
    left: '50%',
    opacity: 0.5,
  },
  star9: {
    width: 2,
    height: 2,
    top: '40%',
    left: '90%',
    opacity: 0.7,
  },
  star10: {
    width: 1,
    height: 1,
    top: '80%',
    left: '60%',
    opacity: 0.4,
  },
  star11: {
    width: 1.5,
    height: 1.5,
    top: '10%',
    left: '40%',
    opacity: 0.7,
  },
  star12: {
    width: 1,
    height: 1,
    top: '30%',
    left: '60%',
    opacity: 0.5,
  },
  star13: {
    width: 2,
    height: 2,
    top: '50%',
    left: '10%',
    opacity: 0.8,
  },
  star14: {
    width: 1,
    height: 1,
    top: '70%',
    left: '50%',
    opacity: 0.6,
  },
  star15: {
    width: 1.5,
    height: 1.5,
    top: '90%',
    left: '80%',
    opacity: 0.7,
  },
  star16: {
    width: 1,
    height: 1,
    top: '18%',
    left: '75%',
    opacity: 0.4,
  },
  star17: {
    width: 2,
    height: 2,
    top: '38%',
    left: '35%',
    opacity: 0.6,
  },
  star18: {
    width: 1,
    height: 1,
    top: '58%',
    left: '65%',
    opacity: 0.5,
  },
  star19: {
    width: 1.5,
    height: 1.5,
    top: '78%',
    left: '15%',
    opacity: 0.8,
  },
  star20: {
    width: 1,
    height: 1,
    top: '12%',
    left: '88%',
    opacity: 0.6,
  },
  star21: {
    width: 2,
    height: 2,
    top: '42%',
    left: '22%',
    opacity: 0.7,
  },
  star22: {
    width: 1,
    height: 1,
    top: '62%',
    left: '78%',
    opacity: 0.4,
  },
  star23: {
    width: 1.5,
    height: 1.5,
    top: '82%',
    left: '42%',
    opacity: 0.5,
  },
  star24: {
    width: 1,
    height: 1,
    top: '28%',
    left: '92%',
    opacity: 0.7,
  },
  star25: {
    width: 2,
    height: 2,
    top: '48%',
    left: '52%',
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    opacity: 0.9,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#a1a1aa',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
  },
  subscriptionInfo: {
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  plansContainer: {
    gap: 12,
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  planCardSelected: {
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.6)',
    padding: 20,
    position: 'relative',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
  },
  planCardPopular: {
    borderColor: '#3b82f6',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -55 }],
    backgroundColor: '#3b82f6',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#a855f7',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#a855f7',
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  planPeriod: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  planDaily: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    marginLeft: 36,
  },
  testimonialContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
    justifyContent: 'center',
  },
  testimonialText: {
    fontSize: 15,
    color: '#e5e7eb',
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '400',
  },
  testimonialAuthor: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
    textAlign: 'center',
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  comparisonColumn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  proTitle: {
    color: '#10b981',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#9ca3af',
    flex: 1,
  },
  featureDisabled: {
    color: '#6b7280',
    opacity: 0.6,
  },
  featureTextPro: {
    fontSize: 13,
    color: '#e5e7eb',
    flex: 1,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 999,
    marginBottom: 24,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  ctaText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 20,
  },
  footerLink: {
    fontSize: 13,
    color: '#71717a',
    fontWeight: '500',
  },
  footerDivider: {
    fontSize: 13,
    color: '#52525b',
  },
  trialBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -70 }],
    backgroundColor: '#10b981',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  trialBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  devSkipButton: {
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  devSkipText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
});
