import { supabase } from './supabaseClient';

export type ActionType = 'ai_analysis' | 'probe_deeper';

export interface UsageLimit {
  canUse: boolean;
  remaining: number;
  limit: number;
  tier: 'free' | 'pro' | 'unlimited';
}

export const usageTrackingService = {
  /**
   * Check if user can perform an action based on daily limits
   */
  async checkDailyLimit(_actionType: ActionType): Promise<UsageLimit> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch user profile with subscription_tier
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Default to free tier on error
        return {
          canUse: false,
          remaining: 0,
          limit: 0,
          tier: 'free'
        };
      }

      // Map subscription tier to usage limits - treat unlimited as pro
      const rawTier = profile?.subscription_tier || 'free';
      const tier = (rawTier === 'unlimited' ? 'pro' : rawTier) as 'free' | 'pro';
      
      let limit = 0;
      let canUse = false;
      
      if (tier === 'pro') {
        limit = 2;
        canUse = true;
      }
      
      return {
        canUse,
        remaining: limit,
        limit,
        tier
      };
    } catch (error) {
      console.error('Error checking daily limit:', error);
      // On error, default to free tier
      return {
        canUse: false,
        remaining: 0,
        limit: 0,
        tier: 'free'
      };
    }
  },

  /**
   * Track an action (increment usage counter)
   * NOTE: Disabled - usage_tracking table doesn't exist yet
   */
  async trackAction(actionType: ActionType): Promise<void> {
    // Disabled - no usage tracking table in database
    console.log(`📊 Would track action: ${actionType} (tracking disabled)`);
    return Promise.resolve();
  },

  /**
   * Get today's usage statistics
   */
  async getTodayUsage(_actionType: ActionType): Promise<{ count: number; limit: number; tier: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ [UsageTracking] No user found');
        return { count: 0, limit: 0, tier: 'free' };
      }

      console.log('🔍 [UsageTracking] Fetching subscription for user:', user.id);

      // Fetch subscription tier from user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('❌ [UsageTracking] Error fetching profile:', error);
        return { count: 0, limit: 0, tier: 'free' };
      }

      console.log('📦 [UsageTracking] Profile data:', profile);
      console.log('💎 [UsageTracking] Subscription tier from DB:', profile?.subscription_tier);

      const rawTier = profile?.subscription_tier || 'free';
      
      // Map tier to limits - treat 'unlimited' as 'pro' for compatibility
      let tier = rawTier;
      let limit = 0;
      
      if (rawTier === 'pro' || rawTier === 'unlimited') {
        tier = 'pro'; // Normalize unlimited to pro
        limit = 2;
        console.log('✨ [UsageTracking] Pro/Unlimited tier detected - normalized to pro, limit: 2');
      } else {
        console.log('🆓 [UsageTracking] Free tier detected - limit: 0');
      }
      
      // TODO: Track actual usage count when usage_tracking table is implemented
      return { count: 0, limit, tier };
    } catch (error) {
      console.error('❌ [UsageTracking] Error getting usage stats:', error);
      return { count: 0, limit: 0, tier: 'free' };
    }
  }
};
