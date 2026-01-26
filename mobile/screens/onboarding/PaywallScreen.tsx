import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SunoGradient from '../../components/onboarding/SunoGradient';
import PlanCard from '../../components/onboarding/PlanCard';
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';

const insightLogo = require('../../public/InsightAI-New-Logo.png');

const ENTITLEMENT_ID = 'pro';

export default function PaywallScreen({ navigation }: any) {
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        console.log('[RevenueCat] Offerings loaded:', offerings);
        console.log('[RevenueCat] Current offering:', offerings.current);
        if (offerings.current) {
          console.log('[RevenueCat] Available packages:', offerings.current.availablePackages.map(p => ({
            identifier: p.identifier,
            product: p.product.identifier,
          })));
        }
        setOffering(offerings.current ?? null);
        if (!offerings.current) {
          console.log('[RevenueCat] No offerings available');
        }
      } catch (error) {
        console.error('[RevenueCat] Error loading offerings:', error);
        // Don't show alert, just log the error
      } finally {
        setIsLoading(false);
      }
    };

    loadOfferings();
  }, []);

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

  const handleCustomerInfo = (customerInfo: CustomerInfo) => {
    const isProActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    if (isProActive) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else {
      Alert.alert('Subscription not active', 'Your purchase could not be confirmed. Please contact support if this persists.');
    }
  };

  const handleStartJourney = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const selectedPackage = getSelectedPackage();
    if (!selectedPackage) {
      // No offerings available - let user continue to app anyway
      Alert.alert(
        'Subscriptions Coming Soon',
        'Mobile subscriptions are being set up. You can continue using the app and subscribe later on the web at myinsightai.app',
        [
          {
            text: 'Continue to App',
            onPress: () => {
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

    try {
      setIsPurchasing(true);
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      handleCustomerInfo(customerInfo);
    } catch (error: any) {
      if (error?.userCancelled) {
        return;
      }
      Alert.alert('Purchase failed', 'Something went wrong while processing your purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsPurchasing(true);
      const customerInfo = await Purchases.restorePurchases();
      handleCustomerInfo(customerInfo);
    } catch (error) {
      Alert.alert('Restore failed', 'Could not restore purchases. Please try again later.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SunoGradient />

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
            <View style={styles.trialBadge}>
              <Text style={styles.trialBadgeText}>3-DAY FREE TRIAL</Text>
            </View>
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
        <View style={styles.testimonialContainer}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons key={i} name="star" size={16} color="#fbbf24" />
            ))}
          </View>
          <Text style={styles.testimonialText}>
            Insight has completely transformed how I process my thoughts. The AI insights help me understand patterns I never noticed before.
          </Text>
          <Text style={styles.testimonialAuthor}>— Jessica</Text>
        </View>

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
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.4)',
    padding: 20,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
  },
  planCardPopular: {
    borderColor: '#3b82f6',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: '#3b82f6',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 16,
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
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
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
    marginTop: 8,
    backgroundColor: '#10b981',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginLeft: 36,
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
