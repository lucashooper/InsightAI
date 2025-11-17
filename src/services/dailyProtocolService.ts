// Daily Protocol Service
// Manages recurring daily habits with streak tracking

import type { DailyProtocol, DailyCompletion, ProtocolStats } from '../types/dailyProtocol';
import { supabase } from './supabaseClient';

class DailyProtocolService {
  /**
   * Get all daily protocols
   */
  async getProtocols(): Promise<DailyProtocol[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('daily_protocols')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading daily protocols:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error loading daily protocols:', error);
      return [];
    }
  }

  /**
   * Get active protocols only
   */
  async getActiveProtocols(): Promise<DailyProtocol[]> {
    const protocols = await this.getProtocols();
    return protocols.filter(p => p.isActive || p.is_active);
  }

  /**
   * Save a new protocol
   */
  async saveProtocol(protocol: Omit<DailyProtocol, 'id' | 'createdAt'>): Promise<DailyProtocol> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('daily_protocols')
      .insert({
        user_id: user.id,
        title: protocol.title,
        description: protocol.description || '',
        category: protocol.category,
        emoji: protocol.emoji || '⏰',
        is_active: protocol.isActive !== false,
        reminder_time: protocol.reminderTime || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving protocol:', error);
      throw error;
    }

    return data as DailyProtocol;
  }

  /**
   * Update protocol
   */
  async updateProtocol(protocolId: string, updates: Partial<DailyProtocol>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.emoji) dbUpdates.emoji = updates.emoji;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.reminderTime) dbUpdates.reminder_time = updates.reminderTime;

    const { error } = await supabase
      .from('daily_protocols')
      .update(dbUpdates)
      .eq('id', protocolId);

    if (error) {
      console.error('Error updating protocol:', error);
      throw error;
    }
  }

  /**
   * Delete protocol (archives it)
   */
  async deleteProtocol(protocolId: string): Promise<void> {
    const { error } = await supabase
      .from('daily_protocols')
      .delete()
      .eq('id', protocolId);

    if (error) {
      console.error('Error deleting protocol:', error);
      throw error;
    }
  }

  /**
   * Get all completions
   */
  private getCompletions(): DailyCompletion[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMPLETIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading completions:', error);
      return [];
    }
  }

  /**
   * Mark protocol as complete for today
   */
  completeProtocol(protocolId: string): void {
    const today = this.getTodayDateString();
    const completions = this.getCompletions();
    
    // Check if already completed today
    const existingIndex = completions.findIndex(
      c => c.protocolId === protocolId && c.date === today
    );
    
    if (existingIndex === -1) {
      completions.push({
        protocolId,
        date: today,
        completedAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEY_COMPLETIONS, JSON.stringify(completions));
    }
  }

  /**
   * Unmark protocol completion for today
   */
  uncompleteProtocol(protocolId: string): void {
    const today = this.getTodayDateString();
    const completions = this.getCompletions();
    
    const filtered = completions.filter(
      c => !(c.protocolId === protocolId && c.date === today)
    );
    
    localStorage.setItem(STORAGE_KEY_COMPLETIONS, JSON.stringify(filtered));
  }

  /**
   * Check if protocol is completed today
   */
  isCompletedToday(protocolId: string): boolean {
    const today = this.getTodayDateString();
    const completions = this.getCompletions();
    
    return completions.some(
      c => c.protocolId === protocolId && c.date === today
    );
  }

  /**
   * Get statistics for a protocol
   */
  getStats(protocolId: string): ProtocolStats {
    const completions = this.getCompletions()
      .filter(c => c.protocolId === protocolId)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (completions.length === 0) {
      return {
        protocolId,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        completionRate: 0,
        lastCompletedDate: null
      };
    }

    const protocol = this.getProtocols().find(p => p.id === protocolId);
    const createdDate = protocol ? new Date(protocol.createdAt) : new Date();
    const today = new Date();
    const daysSinceCreation = Math.floor(
      (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    // Calculate current streak
    let currentStreak = 0;
    const todayStr = this.getTodayDateString();
    const yesterdayStr = this.getDateString(new Date(Date.now() - 86400000));
    
    // Check if completed today or yesterday to start streak
    if (completions.some(c => c.date === todayStr)) {
      currentStreak = 1;
      let checkDate = new Date(Date.now() - 86400000);
      
      while (completions.some(c => c.date === this.getDateString(checkDate))) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      }
    } else if (completions.some(c => c.date === yesterdayStr)) {
      currentStreak = 1;
      let checkDate = new Date(Date.now() - 2 * 86400000);
      
      while (completions.some(c => c.date === this.getDateString(checkDate))) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const completion of completions) {
      const currentDate = new Date(completion.date);
      
      if (lastDate) {
        const dayDiff = Math.floor(
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      lastDate = currentDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      protocolId,
      currentStreak,
      longestStreak,
      totalCompletions: completions.length,
      completionRate: Math.round((completions.length / daysSinceCreation) * 100),
      lastCompletedDate: completions[completions.length - 1]?.date || null
    };
  }

  /**
   * Get completion history for last N days
   */
  getCompletionHistory(protocolId: string, days: number = 30): { date: string; completed: boolean }[] {
    const completions = this.getCompletions().filter(c => c.protocolId === protocolId);
    const history: { date: string; completed: boolean }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = this.getDateString(date);
      const completed = completions.some(c => c.date === dateStr);
      
      history.push({ date: dateStr, completed });
    }
    
    return history;
  }

  /**
   * Get today's date as YYYY-MM-DD string
   */
  private getTodayDateString(): string {
    return this.getDateString(new Date());
  }

  /**
   * Convert date to YYYY-MM-DD string
   */
  private getDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get category label
   */
  getCategoryLabel(category: DailyProtocol['category']): string {
    const labels = {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      anytime: 'Anytime'
    };
    return labels[category];
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: DailyProtocol['category']): string {
    const icons = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌙',
      anytime: '⏰'
    };
    return icons[category];
  }
}

export const dailyProtocolService = new DailyProtocolService();
