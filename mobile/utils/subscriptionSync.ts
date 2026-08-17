import Purchases from 'react-native-purchases';
import { supabase } from '../lib/supabase';
import { isDevAccountEmail } from '../constants/devAccounts';
import { isEntitledTier, isManualTier } from './entitlements';

/** Sync RevenueCat entitlements → Supabase subscription_tier (upgrade-only safe). */
export async function syncSubscriptionTierFromRevenueCat(
  userId: string,
  customerInfo: Awaited<ReturnType<typeof Purchases.getCustomerInfo>>,
): Promise<void> {
  try {
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('subscription_tier, email')
      .eq('user_id', userId)
      .maybeSingle();

    if (isManualTier(existingProfile?.subscription_tier)) {
      console.log('[SUBSCRIPTION SYNC] Preserving manual tier:', existingProfile?.subscription_tier);
      return;
    }

    if (isDevAccountEmail(existingProfile?.email)) {
      console.log('[SUBSCRIPTION SYNC] Preserving dev account tier');
      return;
    }

    let tier = 'free';

    console.log('[SUBSCRIPTION SYNC] Checking entitlements:', customerInfo.entitlements.active);
    console.log('[SUBSCRIPTION SYNC] Original App User ID:', customerInfo.originalAppUserId);
    console.log('[SUBSCRIPTION SYNC] Current Supabase User ID:', userId);

    const hasActiveEntitlement =
      customerInfo.entitlements.active['InsightAI Pro'] ||
      customerInfo.entitlements.active['Insight Pro'] ||
      customerInfo.entitlements.active['pro'] ||
      Object.keys(customerInfo.entitlements.active).length > 0;

    if (hasActiveEntitlement) {
      const originalOwner = customerInfo.originalAppUserId;
      const isOwnSubscription =
        originalOwner === userId || originalOwner?.startsWith('$RCAnonymousID:');

      if (isOwnSubscription) {
        tier = 'pro';
        console.log('[SUBSCRIPTION SYNC] Pro entitlement detected — owned by this user');
      } else {
        console.log('[SUBSCRIPTION SYNC] Pro entitlement belongs to different user:', originalOwner);
      }
    }

    if (tier === 'free' && isEntitledTier(existingProfile?.subscription_tier)) {
      console.log(
        '[SUBSCRIPTION SYNC] Keeping existing tier',
        existingProfile?.subscription_tier,
        '— RC shows no active entitlement for this environment',
      );
      return;
    }

    console.log('[SUBSCRIPTION SYNC] Updating Supabase with tier:', tier);

    const updatePromise = supabase
      .from('user_profiles')
      .update({ subscription_tier: tier })
      .eq('user_id', userId);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Subscription sync timeout after 5s')), 5000),
    );

    const { error } = (await Promise.race([updatePromise, timeoutPromise])) as {
      error: { message: string } | null;
    };

    if (error) {
      console.error('[SUBSCRIPTION SYNC] Failed to update Supabase:', error);
    } else {
      console.log('[SUBSCRIPTION SYNC] Successfully synced to Supabase — tier:', tier);
    }
  } catch (error) {
    console.error('[SUBSCRIPTION SYNC] Error:', error);
  }
}
