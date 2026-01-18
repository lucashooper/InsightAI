import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SunoGradient from '../../components/onboarding/SunoGradient';
import PlanCard from '../../components/onboarding/PlanCard';
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';

const ENTITLEMENT_ID = 'pro';

export default function PaywallScreen({ navigation }: any) {
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        setOffering(offerings.current ?? null);
      } catch (error) {
        Alert.alert('Error', 'Unable to load subscription options. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOfferings();
  }, []);

  const getMonthlyPackage = (): PurchasesPackage | null => {
    if (!offering) return null;
    const pkg = offering.availablePackages.find((p) => p.identifier === 'monthly');
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
    const monthly = getMonthlyPackage();
    if (!monthly) {
      Alert.alert('Unavailable', 'No subscription options are currently available. Please try again later.');
      return;
    }

    try {
      setIsPurchasing(true);
      const { customerInfo } = await Purchases.purchasePackage(monthly);
      handleCustomerInfo(customerInfo);
    } catch (error: any) {
      if (error?.userCancelled) {
        // User cancelled, no need to show an error
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
      const { customerInfo } = await Purchases.restorePurchases();
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Join InsightAI</Text>
          <Text style={styles.subtitle}>
            Unlock clarity, growth, and daily insights.
          </Text>
        </View>

        {/* Pricing Card - single monthly plan backed by App Store subscription */}
        <View style={styles.plansContainer}>
          <PlanCard
            title="Pro Monthly"
            price={getMonthlyPackage()?.product.priceString ?? '£8.99'}
            period="month"
            selected={true}
            popular={true}
            onPress={() => {}}
          />
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
              <Text style={styles.ctaText}>Continue to app</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.noteText}>
          Your subscription is managed securely through the App Store. You can change or cancel it anytime in your Apple account settings.
        </Text>

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
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#a1a1aa',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
  },
  noteText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 32,
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
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
});
