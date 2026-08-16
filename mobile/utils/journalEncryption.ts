import { isInvestorDemoUser } from '../constants/investorDemo';
import { fetchSubscriptionTier, isUnlimitedTier } from './entitlements';

/** Investor/unlimited/demo accounts store journal text in plain text for reliable APK demos. */
export async function shouldEncryptJournalForUser(userId: string): Promise<boolean> {
  if (isInvestorDemoUser(userId)) return false;
  const tier = await fetchSubscriptionTier(userId);
  if (isUnlimitedTier(tier) || tier === 'demo') return false;
  return true;
}
