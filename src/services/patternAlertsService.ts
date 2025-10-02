import { supabase } from './supabaseClient';
import type { PatternAlert, AlertType } from '../types/diary';

export class PatternAlertsService {
  /**
   * Create a new pattern alert
   */
  static async createAlert(
    userId: string,
    alertType: AlertType,
    alertText: string,
    relatedNoteIds: string[]
  ): Promise<PatternAlert | null> {
    try {
      const { data, error } = await supabase
        .from('pattern_alerts')
        .insert({
          user_id: userId,
          alert_type: alertType,
          alert_text: alertText,
          related_note_ids: relatedNoteIds,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating pattern alert:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating pattern alert:', error);
      return null;
    }
  }

  /**
   * Get all alerts for a user
   */
  static async getUserAlerts(userId: string): Promise<PatternAlert[]> {
    try {
      const { data, error } = await supabase
        .from('pattern_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user alerts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      return [];
    }
  }

  /**
   * Get unread alerts count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('pattern_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark an alert as read
   */
  static async markAsRead(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pattern_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) {
        console.error('Error marking alert as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return false;
    }
  }

  /**
   * Mark all alerts as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pattern_alerts')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all alerts as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      return false;
    }
  }

  /**
   * Delete an alert
   */
  static async deleteAlert(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pattern_alerts')
        .delete()
        .eq('id', alertId);

      if (error) {
        console.error('Error deleting alert:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting alert:', error);
      return false;
    }
  }

  /**
   * Check if a similar alert already exists (to avoid duplicates)
   */
  static async checkForDuplicateAlert(
    userId: string,
    alertType: AlertType,
    alertText: string,
    hoursThreshold: number = 24
  ): Promise<boolean> {
    try {
      const thresholdDate = new Date();
      thresholdDate.setHours(thresholdDate.getHours() - hoursThreshold);

      const { data, error } = await supabase
        .from('pattern_alerts')
        .select('id')
        .eq('user_id', userId)
        .eq('alert_type', alertType)
        .eq('alert_text', alertText)
        .gte('created_at', thresholdDate.toISOString())
        .limit(1);

      if (error) {
        console.error('Error checking for duplicate alert:', error);
        return false;
      }

      return (data && data.length > 0);
    } catch (error) {
      console.error('Error checking for duplicate alert:', error);
      return false;
    }
  }
} 