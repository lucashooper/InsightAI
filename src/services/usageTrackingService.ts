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

      // Verify user profile exists (but don't query subscription_tier since it doesn't exist yet)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Don't throw - just default to free tier
      }

      // For now, everyone gets unlimited usage since we're using local LLM (it's free!)
      // TODO: When implementing paid plans, add subscription_tier column and tier checks
      return {
        canUse: true,
        remaining: 999999,
        limit: 999999,
        tier: 'free'
      };
    } catch (error) {
      console.error('Error checking daily limit:', error);
      // On error, allow the action but log it
      return {
        canUse: true,
        remaining: 0,
        limit: 2,
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
   * NOTE: Disabled - usage_tracking table doesn't exist yet
   */
  async getTodayUsage(_actionType: ActionType): Promise<{ count: number; limit: number; tier: string }> {
    // Disabled - no usage tracking table in database
    // Everyone gets unlimited for now
    return Promise.resolve({ count: 0, limit: 999999, tier: 'free' });
  }
};
