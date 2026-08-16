import Purchases from 'react-native-purchases';
import { supabase } from '../lib/supabase';
import { PRO_DISPLAY_NAME } from '../constants/branding';
import { isInvestorDemoUser } from '../constants/investorDemo';
import { isRevenueCatEnabled } from './revenueCatConfig';

export type SubscriptionTier = 'free' | 'pro' | 'unlimited' | 'demo';

/** Tiers granted by Supabase (admin/investor/manual) or synced from iOS RevenueCat. */
export function isEntitledTier(tier: string | null | undefined): boolean {
  return tier === 'pro' || tier === 'unlimited' || tier === 'demo';
}

export function isUnlimitedTier(tier: string | null | undefined): boolean {
  return tier === 'unlimited';
}

/** Admin-granted tiers that must not be overwritten by RevenueCat sync. */
export function isManualTier(tier: string | null | undefined): boolean {
  return tier === 'unlimited' || tier === 'demo';
}

export async function fetchSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  if (isInvestorDemoUser(userId)) {
    return 'unlimited';
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[entitlements] Failed to fetch tier:', error.message);
    return 'free';
  }

  const tier = (data?.subscription_tier as SubscriptionTier) || 'free';
  if (isEntitledTier(tier)) return tier;
  return tier;
}

export async function hasServerSideProEntitlement(userId: string): Promise<boolean> {
  const tier = await fetchSubscriptionTier(userId);
  return isEntitledTier(tier);
}

async function hasRevenueCatPro(userId: string): Promise<boolean> {
  if (!isRevenueCatEnabled()) return false;

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const hasEntitlement =
      !!customerInfo.entitlements.active['Insight Pro'] ||
      !!customerInfo.entitlements.active['InsightAI Pro'] ||
      !!customerInfo.entitlements.active['pro'] ||
      Object.keys(customerInfo.entitlements.active).length > 0;

    if (!hasEntitlement) return false;

    const originalOwner = customerInfo.originalAppUserId;
    return originalOwner === userId || originalOwner?.startsWith('$RCAnonymousID:');
  } catch (error) {
    console.warn('[entitlements] RevenueCat check failed:', error);
    return false;
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/** Resolve Pro access: investor demo → Supabase tier → iOS RevenueCat. */
export async function resolveProAccess(userId: string): Promise<boolean> {
  if (isInvestorDemoUser(userId)) return true;

  const serverEntitled = await withTimeout(hasServerSideProEntitlement(userId), 8000, false);
  if (serverEntitled) return true;
  return withTimeout(hasRevenueCatPro(userId), 5000, false);
}

export async function getAccountStatsForUser(userId: string): Promise<{
  subscriptionPlan: string;
  entriesLimit: number;
}> {
  const tier = await fetchSubscriptionTier(userId);

  if (isUnlimitedTier(tier)) {
    return { subscriptionPlan: PRO_DISPLAY_NAME, entriesLimit: 20 };
  }

  if (isEntitledTier(tier)) {
    return { subscriptionPlan: PRO_DISPLAY_NAME, entriesLimit: tier === 'demo' ? 3 : 2 };
  }

  if (isRevenueCatEnabled() && (await hasRevenueCatPro(userId))) {
    return { subscriptionPlan: PRO_DISPLAY_NAME, entriesLimit: 2 };
  }

  return { subscriptionPlan: 'Free', entriesLimit: 0 };
}
