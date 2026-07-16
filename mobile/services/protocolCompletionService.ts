// Mobile Protocol Completion Service
// Tracks daily protocol completions and calculates streaks

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'protocol_completions';

interface Completion {
  protocolId: string;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO timestamp
}

interface ProtocolStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
}

class ProtocolCompletionService {
  /**
   * Get all completions from storage
   */
  private async getCompletions(): Promise<Completion[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading completions:', error);
      return [];
    }
  }

  /**
   * Save completions to storage
   */
  private async saveCompletions(completions: Completion[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completions));
    } catch (error) {
      console.error('Error saving completions:', error);
    }
  }

  /**
   * Get today's date as YYYY-MM-DD
   */
  private getTodayDateString(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Toggle protocol completion for today
   */
  async toggleCompletion(protocolId: string): Promise<boolean> {
    const today = this.getTodayDateString();
    const completions = await this.getCompletions();
    
    const existingIndex = completions.findIndex(
      c => c.protocolId === protocolId && c.date === today
    );
    
    if (existingIndex >= 0) {
      // Already completed - remove it
      completions.splice(existingIndex, 1);
      await this.saveCompletions(completions);
      return false;
    } else {
      // Not completed - add it
      completions.push({
        protocolId,
        date: today,
        completedAt: new Date().toISOString()
      });
      await this.saveCompletions(completions);
      return true;
    }
  }

  /**
   * Check if protocol is completed today
   */
  async isCompletedToday(protocolId: string): Promise<boolean> {
    const today = this.getTodayDateString();
    const completions = await this.getCompletions();
    return completions.some(c => c.protocolId === protocolId && c.date === today);
  }

  /**
   * Get stats for a protocol (streaks, total completions)
   */
  async getStats(protocolId: string): Promise<ProtocolStats> {
    const completions = (await this.getCompletions())
      .filter(c => c.protocolId === protocolId)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (completions.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0
      };
    }

    // Calculate current streak
    let currentStreak = 0;
    const today = this.getTodayDateString();
    const yesterday = this.getDateString(new Date(Date.now() - 86400000));
    
    // Check if completed today or yesterday to start streak
    if (completions.some(c => c.date === today)) {
      currentStreak = 1;
      let checkDate = new Date(Date.now() - 86400000);
      
      while (completions.some(c => c.date === this.getDateString(checkDate))) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      }
    } else if (completions.some(c => c.date === yesterday)) {
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
      currentStreak,
      longestStreak,
      totalCompletions: completions.length
    };
  }

  /**
   * Get date string from Date object
   */
  private getDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get all completions for today (for progress tracking)
   */
  async getTodayCompletions(activeProtocolIds?: string[]): Promise<string[]> {
    const today = this.getTodayDateString();
    const completions = await this.getCompletions();
    const todayIds = completions
      .filter(c => c.date === today)
      .map(c => c.protocolId);

    if (!activeProtocolIds?.length) return todayIds;

    const active = new Set(activeProtocolIds);
    return todayIds.filter((id) => active.has(id));
  }

  /** Drop completion records for protocols that no longer exist. */
  async pruneCompletions(knownProtocolIds: string[]): Promise<void> {
    const known = new Set(knownProtocolIds);
    const completions = await this.getCompletions();
    const pruned = completions.filter((c) => known.has(c.protocolId));
    if (pruned.length !== completions.length) {
      await this.saveCompletions(pruned);
    }
  }
}

export const protocolCompletionService = new ProtocolCompletionService();
