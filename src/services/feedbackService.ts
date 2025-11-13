import { supabase } from './supabaseClient';

export interface Feedback {
  id: string;
  user_id: string;
  title: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  created_at: string;
  updated_at: string;
  user_email?: string; // For admin view
}

export const feedbackService = {
  /**
   * Submit new feedback
   */
  async submitFeedback(title: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          user_email: user.email || 'Unknown',
          title: title.trim(),
          message: message.trim(),
          status: 'new'
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Feedback submitted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error in submitFeedback:', error);
      return { success: false, error: 'Failed to submit feedback' };
    }
  },

  /**
   * Get all feedback (admin only)
   */
  async getAllFeedback(): Promise<Feedback[]> {
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllFeedback:', error);
      return [];
    }
  },

  /**
   * Update feedback status (admin only)
   */
  async updateFeedbackStatus(feedbackId: string, status: 'new' | 'read' | 'resolved'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_feedback')
        .update({ status })
        .eq('id', feedbackId);

      if (error) {
        console.error('Error updating feedback status:', error);
        return false;
      }

      console.log(`✅ Feedback ${feedbackId} marked as ${status}`);
      return true;
    } catch (error) {
      console.error('Error in updateFeedbackStatus:', error);
      return false;
    }
  },

  /**
   * Get user's own feedback
   */
  async getMyFeedback(): Promise<Feedback[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my feedback:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMyFeedback:', error);
      return [];
    }
  }
};
