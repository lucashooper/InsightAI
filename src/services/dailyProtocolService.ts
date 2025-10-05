// Daily Protocol Service
// Manages recurring daily habits with streak tracking

import type { DailyProtocol, DailyCompletion, ProtocolStats } from '../types/dailyProtocol';

const STORAGE_KEY_PROTOCOLS = 'insightai_daily_protocols';
const STORAGE_KEY_COMPLETIONS = 'insightai_daily_completions';

class DailyProtocolService {
  /**
   * Get all daily protocols
   */
  getProtocols(): DailyProtocol[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROTOCOLS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading daily protocols:', error);
      return [];
    }
  }

  /**
   * Get active protocols only
   */
  getActiveProtocols(): DailyProtocol[] {
    return this.getProtocols().filter(p => p.isActive);
  }

  /**
   * Save a new protocol
   */
  saveProtocol(protocol: Omit<DailyProtocol, 'id' | 'createdAt'>): DailyProtocol {
    const protocols = this.getProtocols();
    const newProtocol: DailyProtocol = {
      ...protocol,
      id: `protocol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    protocols.push(newProtocol);
    localStorage.setItem(STORAGE_KEY_PROTOCOLS, JSON.stringify(protocols));
    return newProtocol;
  }

  /**
   * Update protocol
   */
  updateProtocol(protocolId: string, updates: Partial<DailyProtocol>): void {
    const protocols = this.getProtocols();
    const index = protocols.findIndex(p => p.id === protocolId);
    
    if (index !== -1) {
      protocols[index] = { ...protocols[index], ...updates };
      localStorage.setItem(STORAGE_KEY_PROTOCOLS, JSON.stringify(protocols));
    }
  }

  /**
   * Delete protocol (archives it)
   */
  deleteProtocol(protocolId: string): void {
    const protocols = this.getProtocols();
    const filtered = protocols.filter(p => p.id !== protocolId);
    localStorage.setItem(STORAGE_KEY_PROTOCOLS, JSON.stringify(filtered));
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
