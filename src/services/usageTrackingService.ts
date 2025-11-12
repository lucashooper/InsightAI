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
  async checkDailyLimit(actionType: ActionType): Promise<UsageLimit> {
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
   */
  async trackAction(actionType: ActionType): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          action_type: actionType
        });

      if (error) {
        console.error('Error tracking action:', error);
        throw error;
      }

      console.log(`✅ Tracked action: ${actionType}`);
    } catch (error) {
      console.error('Error in trackAction:', error);
      // Don't throw - we don't want to block the user if tracking fails
    }
  },

  /**
   * Get today's usage statistics
   */
  async getTodayUsage(actionType: ActionType): Promise<{ count: number; limit: number; tier: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Everyone gets unlimited for now (using local LLM)
      const tier = 'free';
      const limit = 999999;

      // Count today's usage
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('id')
        .eq('user_id', user.id)
        .eq('action_type', actionType)
        .gte('created_at', today.toISOString());

      const count = usageData?.length || 0;

      return { count, limit, tier };
    } catch (error) {
      console.error('Error getting today usage:', error);
      return { count: 0, limit: 999999, tier: 'free' };
    }
  }
};
