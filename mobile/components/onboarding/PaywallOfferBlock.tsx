import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import PaywallPlanCard from './PaywallPlanCard';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { supabase } from '../../lib/supabase';
import { isTablet, sf } from '../../utils/responsive';
import { analytics } from '../../services/analytics';
import { useLanguage } from '../../contexts/LanguageContext';
import { ONBOARDING_SURFACE, ONBOARDING_TEXT, ONBOARDING_CTA } from '../../constants/onboardingTheme';
import { isRevenueCatEnabled } from '../../utils/revenueCatConfig';
import { safeInvalidateCustomerInfoCache } from '../../utils/revenueCatSafe';
import { syncSubscriptionTierFromRevenueCat } from '../../utils/subscriptionSync';
import { safeGoBack } from '../../utils/navigationSafety';

const ENTITLEMENT_ID = 'Insight Pro';

type Props = {
  navigation: any;
  route?: any;
  /** Vertical stacked cards (premium scroll) vs compact row */
  layout?: 'stack' | 'row';
  showHeading?: boolean;
};

export default function PaywallOfferBlock({
  navigation,
  route,
  layout = 'stack',
  showHeading = true,
}: Props) {
  const { user } = useAuth();
  const { userName } = useOnboarding();
  const { t } = useLanguage();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'yearly'>('yearly');
  const [trialEnabled, setTrialEnabled] = useState(false);
  const [trialDays, setTrialDays] = useState(3);

  const trialLabel = t('onboarding.paywall.trialEnabledDays', { days: trialDays });
  const trialBadgeLabel = t('onboarding.paywall.trialDays', { days: trialDays });
  const showTrialCta = trialEnabled && selectedPlan === 'weekly';

  const handleTrialToggle = (enabled: boolean) => {
    Haptics.selectionAsync();
    setTrialEnabled(enabled);
    if (enabled) setSelectedPlan('weekly');
  };

  const handleSelectPlan = (plan: 'weekly' | 'monthly' | 'yearly') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
    if (plan !== 'weekly') setTrialEnabled(false);
  };

  useEffect(() => {
    if (!isRevenueCatEnabled()) {
      setIsLoading(false);
      return;
    }

    analytics.trackPaywallViewed(route?.params?.source || 'onboarding');
    analytics.trackOnboardingScreen('paywall', 'viewed', userName || undefined);

    const loadOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setOffering(offerings.current);
          const idToPlan = (id: string): 'weekly' | 'monthly' | 'yearly' | null => {
            if (id.includes('week') || id === '$rc_weekly') return 'weekly';
            if (id.includes('month') || id === '$rc_monthly') return 'monthly';
            if (id.includes('annual') || id.includes('year') || id === '$rc_annual') return 'yearly';
            return null;
          };
          for (const pkg of offerings.current.availablePackages) {
            const intro = (pkg.product as any).introPrice;
            const isFreeIntro =
              intro &&
              (intro.price === 0 ||
                intro.priceString === 'Free' ||
                String(intro.priceString || '').toLowerCase().includes('free'));
            if (!isFreeIntro) continue;
            const plan = idToPlan(pkg.identifier) || idToPlan(pkg.product.identifier);
            if (plan) {
              setSelectedPlan(plan);
              setTrialEnabled(true);
              break;
            }
          }
        }
      } catch {
        setOffering(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadOfferings();
  }, [route?.params?.source, userName]);

  const saveUsernameToProfile = async () => {
    if (!user) {
      await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
      return;
    }
    try {
      const authProvider = user.app_metadata?.provider || '';
      const isSocialSignIn = authProvider === 'google' || authProvider === 'apple';
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id, username')
        .eq('user_id', user.id)
        .single();

      let finalUsername = '';
      if (isSocialSignIn && existingProfile?.username) {
        finalUsername = existingProfile.username;
      } else if (userName) {
        finalUsername = userName;
      } else if (existingProfile?.username) {
        finalUsername = existingProfile.username;
      } else {
        await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
        return;
      }

      if (existingProfile) {
        if (!isSocialSignIn && userName && userName !== existingProfile.username) {
          await supabase.from('user_profiles').update({ username: userName }).eq('user_id', user.id);
        }
      } else {
        await supabase.from('user_profiles').insert({
          user_id: user.id,
          username: finalUsername,
          email: user.email,
        });
      }
      await AsyncStorage.setItem('CACHED_USERNAME', finalUsername);
      await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
    } catch {
      /* non-fatal */
    }
  };

  const getSelectedPackage = (): PurchasesPackage | null => {
    if (!offering) return null;
    const packageTypeMap = {
      weekly: '$rc_weekly',
      monthly: '$rc_monthly',
      yearly: '$rc_annual',
    };
    const targetIdentifier = packageTypeMap[selectedPlan];
    return offering.availablePackages.find((p) => p.identifier === targetIdentifier) ?? offering.availablePackages[0] ?? null;
  };

  const handleCustomerInfo = async (customerInfo: CustomerInfo) => {
    const isProActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    const hasAnyActiveEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;

    if (hasAnyActiveEntitlement && customerInfo.originalAppUserId.startsWith('$RCAnonymousID:')) {
      await AsyncStorage.setItem('REVENUECAT_ANONYMOUS_ID', customerInfo.originalAppUserId);
    }

    if (hasAnyActiveEntitlement && user?.id) {
      const originalOwner = customerInfo.originalAppUserId;
      const isOwnSubscription = originalOwner === user.id || originalOwner?.startsWith('$RCAnonymousID:');
      if (!isOwnSubscription) {
        Alert.alert(
          t('onboarding.paywall.alerts.otherAccountTitle'),
          t('onboarding.paywall.alerts.otherAccountBody'),
          [{ text: t('onboarding.paywall.alerts.ok') }],
        );
        return;
      }
    }

    if (isProActive || hasAnyActiveEntitlement) {
      if (user?.id) await syncSubscriptionTierFromRevenueCat(user.id, customerInfo);
      const fromSettings = route?.params?.fromSettings === true;
      if (fromSettings) {
        Alert.alert(
          t('onboarding.paywall.alerts.purchaseSuccessTitle'),
          t('onboarding.paywall.alerts.purchaseSuccessBody'),
          [{ text: t('onboarding.paywall.alerts.ok'), onPress: () => safeGoBack(navigation) }],
        );
      } else {
        const hasEmail = user?.email && !user.email.includes('privaterelay');
        if (!user || !hasEmail) {
          await AsyncStorage.setItem('NEEDS_EMAIL_SIGNUP', 'true');
          navigation.navigate('PostPurchaseWelcome');
        } else {
          await saveUsernameToProfile();
          await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
          await AsyncStorage.removeItem('HAS_SEEN_DASHBOARD_INTRO');
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        }
      }
    } else {
      Alert.alert(t('onboarding.paywall.alerts.inactiveTitle'), t('onboarding.paywall.alerts.inactiveBody'));
    }
  };

  const handleStartJourney = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!user) await AsyncStorage.setItem('NEEDS_EMAIL_SIGNUP', 'true');

    if (!isRevenueCatEnabled()) {
      await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
      navigation.replace('PostPurchaseWelcome');
      return;
    }

    const selectedPackage = getSelectedPackage();
    if (!selectedPackage) {
      Alert.alert(
        t('onboarding.paywall.alerts.comingSoonTitle'),
        t('onboarding.paywall.alerts.comingSoonBody'),
        [{
          text: t('onboarding.paywall.alerts.continueToApp'),
          onPress: async () => {
            const hasEmail = user?.email && !user.email.includes('privaterelay');
            if (user && hasEmail) {
              await saveUsernameToProfile();
              navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
            } else {
              await AsyncStorage.setItem('NEEDS_EMAIL_SIGNUP', 'true');
              navigation.navigate('PostPurchaseWelcome');
            }
          },
        }],
      );
      return;
    }

    try {
      setIsPurchasing(true);
      const existingInfo = await Purchases.getCustomerInfo();
      const alreadySubscribed =
        !!existingInfo.entitlements.active[ENTITLEMENT_ID] ||
        Object.keys(existingInfo.entitlements.active).length > 0;
      if (alreadySubscribed) {
        handleCustomerInfo(existingInfo);
        setIsPurchasing(false);
        return;
      }
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      const tier = selectedPlan === 'yearly' ? 'pro_yearly' : selectedPlan === 'monthly' ? 'pro_monthly' : 'pro_weekly';
      analytics.trackSubscriptionStarted(tier, selectedPackage.product.priceString, userName || undefined);
      analytics.trackOnboardingScreen('paywall', 'completed', userName || undefined);
      handleCustomerInfo(customerInfo);
    } catch (error: any) {
      if (!error?.userCancelled) {
        Alert.alert(
          t('onboarding.paywall.alerts.purchaseFailed'),
          t('onboarding.paywall.alerts.purchaseError', {
            message: error.message,
            code: error.code || t('onboarding.paywall.alerts.unknown'),
          }),
        );
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsPurchasing(true);
      await safeInvalidateCustomerInfoCache();
      const customerInfo = await Purchases.restorePurchases();
      if (Object.keys(customerInfo.entitlements.active).length === 0) {
        Alert.alert(t('onboarding.paywall.alerts.noPurchasesTitle'), t('onboarding.paywall.alerts.noPurchasesBody'));
      } else {
        handleCustomerInfo(customerInfo);
      }
    } catch (error: any) {
      Alert.alert(
        t('onboarding.paywall.alerts.restoreFailed'),
        t('onboarding.paywall.alerts.restoreError', { message: error.message }),
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <View style={styles.block}>
      {showHeading ? (
        <Text style={styles.sectionTitle}>{t('onboarding.prePaywall.scroll.startJourney')}</Text>
      ) : null}

      {layout === 'row' ? (
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
      ) : null}

      {layout === 'stack' ? (
        <View style={styles.stackPlans}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleSelectPlan('yearly')}
            style={[styles.stackCard, selectedPlan === 'yearly' && styles.stackCardSelected]}
          >
            <View style={styles.stackCardLeft}>
              <View style={[styles.radio, selectedPlan === 'yearly' && styles.radioOn]}>
                {selectedPlan === 'yearly' ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
              </View>
              <View>
                <Text style={styles.stackPlanName}>{t('onboarding.paywall.yearly')}</Text>
                <Text style={styles.stackPlanSub}>{t('onboarding.prePaywall.scroll.perWeekHint')}</Text>
              </View>
            </View>
            <View style={styles.stackCardRight}>
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>{t('onboarding.prePaywall.scroll.bestOffer')}</Text>
              </View>
              <Text style={styles.stackPrice}>{t('onboarding.paywall.priceYearly')}</Text>
              <Text style={styles.stackPer}>per year</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleSelectPlan('weekly')}
            style={[styles.stackCard, selectedPlan === 'weekly' && styles.stackCardSelected]}
          >
            <View style={styles.stackCardLeft}>
              <View style={[styles.radio, selectedPlan === 'weekly' && styles.radioOn]}>
                {selectedPlan === 'weekly' ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
              </View>
              <View>
                <Text style={styles.stackPlanName}>{t('onboarding.paywall.weekly')}</Text>
                <Text style={styles.stackPlanSub}>{t('onboarding.prePaywall.scroll.renewsWeekly')}</Text>
              </View>
            </View>
            <View style={styles.stackCardRight}>
              <Text style={styles.stackPrice}>{t('onboarding.paywall.priceWeekly')}</Text>
              <Text style={styles.stackPer}>per week</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
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
            <Text style={styles.compactPlanName}>{t('onboarding.paywall.weekly')}</Text>
            <Text style={styles.compactPlanPriceMain}>{t('onboarding.paywall.priceWeekly')}</Text>
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
            <Text style={styles.compactPlanName}>{t('onboarding.paywall.yearly')}</Text>
            <Text style={styles.compactPlanPriceMain}>{t('onboarding.paywall.priceYearly')}</Text>
          </PaywallPlanCard>
          <PaywallPlanCard
            selected={selectedPlan === 'monthly'}
            light
            onPress={() => handleSelectPlan('monthly')}
          >
            <Text style={styles.compactPlanName}>{t('onboarding.paywall.monthly')}</Text>
            <Text style={styles.compactPlanPriceMain}>{t('onboarding.paywall.priceMonthly')}</Text>
          </PaywallPlanCard>
        </View>
      )}

      <View style={styles.commitmentBadge}>
        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
        <Text style={styles.commitmentText}>{t('onboarding.paywall.noCommitment')}</Text>
      </View>

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
            {showTrialCta ? t('onboarding.paywall.startJourney') : t('common.continue')}
          </Text>
        )}
      </TouchableOpacity>

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
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: 8,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: sf(22),
    fontWeight: '700',
    color: ONBOARDING_TEXT.primary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.6,
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
    marginBottom: 20,
  },
  trialToggleLabel: {
    fontSize: sf(14),
    fontWeight: '500',
    color: '#1a1a2e',
    flex: 1,
    paddingRight: 12,
  },
  stackPlans: {
    gap: 12,
    marginBottom: 16,
  },
  stackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(200, 185, 255, 0.25)',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  stackCardSelected: {
    borderColor: '#7B5EA7',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  stackCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  stackCardRight: {
    alignItems: 'flex-end',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(123, 94, 167, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    backgroundColor: '#1a1a2e',
    borderColor: '#1a1a2e',
  },
  stackPlanName: {
    fontSize: sf(16),
    fontWeight: '700',
    color: ONBOARDING_TEXT.primary,
  },
  stackPlanSub: {
    fontSize: sf(12),
    color: ONBOARDING_TEXT.secondary,
    marginTop: 2,
  },
  stackPrice: {
    fontSize: sf(18),
    fontWeight: '800',
    color: ONBOARDING_TEXT.primary,
  },
  stackPer: {
    fontSize: sf(11),
    color: ONBOARDING_TEXT.secondary,
    marginTop: 2,
  },
  bestBadge: {
    backgroundColor: 'rgba(123, 94, 167, 0.15)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  bestBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7B5EA7',
    letterSpacing: 0.4,
  },
  plansRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingTop: 14,
  },
  compactPlanName: {
    fontSize: sf(14),
    fontWeight: '700',
    color: ONBOARDING_TEXT.primary,
    marginBottom: 4,
  },
  compactPlanPriceMain: {
    fontSize: sf(16),
    fontWeight: '800',
    color: ONBOARDING_TEXT.primary,
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
  },
  commitmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  commitmentText: {
    fontSize: sf(13),
    color: '#34C759',
    fontWeight: '500',
  },
  ctaButton: {
    width: '100%',
    height: 56,
    borderRadius: ONBOARDING_CTA.borderRadius,
    backgroundColor: ONBOARDING_CTA.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: 'rgba(123, 94, 167, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: ONBOARDING_CTA.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  footerLink: {
    fontSize: isTablet ? 13 : 11,
    color: ONBOARDING_TEXT.secondary,
    fontWeight: '500',
  },
  footerDivider: {
    fontSize: 11,
    color: ONBOARDING_TEXT.secondary,
    opacity: 0.5,
  },
});
