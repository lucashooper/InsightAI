import type { DiaryEntry, PatternAlert, AlertType } from '../types/diary';

// Local storage keys
const STORAGE_KEYS = {
  DIARY_ENTRIES: 'insight_ai_diary_entries',
  PATTERN_ALERTS: 'insight_ai_pattern_alerts',
  USER_ID: 'insight_ai_user_id',
  LAST_SYNC: 'insight_ai_last_sync'
};

// Generate a simple UUID for local use
function generateId(): string {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Generate a consistent user ID for local storage
function getUserId(): string {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = generateId();
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
}

// Helper function to safely parse JSON from localStorage
function safeJsonParse<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error parsing localStorage item ${key}:`, error);
    return defaultValue;
  }
}

// Helper function to safely stringify and store JSON
function safeJsonStore(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing localStorage item ${key}:`, error);
    throw new Error(`Failed to store data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export class LocalStorageService {
  // Diary Entries Methods
  static async getNotes(): Promise<DiaryEntry[]> {
    const entries = safeJsonParse<DiaryEntry[]>(STORAGE_KEYS.DIARY_ENTRIES, []);
    // Sort by updated_at desc, then created_at desc (matching Supabase behavior)
    return entries.sort((a, b) => {
      const aUpdated = new Date(a.updated_at).getTime();
      const bUpdated = new Date(b.updated_at).getTime();
      if (aUpdated !== bUpdated) {
        return bUpdated - aUpdated;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  static async createNote(title: string, content: string): Promise<DiaryEntry> {
    const entries = await this.getNotes();
    const now = new Date().toISOString();
    
    const newEntry: DiaryEntry = {
      id: generateId(),
      title,
      content,
      created_at: now,
      updated_at: now,
      mood_score: 5 // Default mood score
    };

    entries.unshift(newEntry); // Add to beginning for newest first
    safeJsonStore(STORAGE_KEYS.DIARY_ENTRIES, entries);
    
    return newEntry;
  }

  static async updateNote(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
    const entries = await this.getNotes();
    const entryIndex = entries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) {
      throw new Error(`Note with id ${id} not found`);
    }

    const updatedEntry = {
      ...entries[entryIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    entries[entryIndex] = updatedEntry;
    safeJsonStore(STORAGE_KEYS.DIARY_ENTRIES, entries);
    
    return updatedEntry;
  }

  static async deleteNote(id: string): Promise<void> {
    const entries = await this.getNotes();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    
    if (filteredEntries.length === entries.length) {
      throw new Error(`Note with id ${id} not found`);
    }

    safeJsonStore(STORAGE_KEYS.DIARY_ENTRIES, filteredEntries);
  }

  // AI Analysis Methods
  static async updateAIAnalysis(id: string, analysis: any): Promise<void> {
    await this.updateNote(id, { ai_analysis: analysis });
  }

  static async saveAIResponse(id: string, responseData: {
    conversationalResponse: string;
    structuredInsights: any;
    insightsReport?: any;
  }): Promise<void> {
    await this.updateNote(id, {
      ai_response_text: responseData.conversationalResponse,
      ai_structured_insights: responseData.structuredInsights,
      insights_report: responseData.insightsReport,
      ai_last_analyzed: new Date().toISOString()
    });
  }

  static async saveAIInsights(id: string, insights: any): Promise<void> {
    await this.updateNote(id, { ai_insights: insights });
  }

  static async getAIResponse(id: string): Promise<{
    ai_response_text?: string;
    ai_structured_insights?: any;
    ai_last_analyzed?: string;
    ai_insights?: any;
  } | null> {
    const entries = await this.getNotes();
    const entry = entries.find(e => e.id === id);
    
    if (!entry) {
      throw new Error(`Note with id ${id} not found`);
    }

    return {
      ai_response_text: entry.ai_response_text,
      ai_structured_insights: entry.ai_structured_insights,
      ai_last_analyzed: entry.ai_last_analyzed,
      ai_insights: entry.ai_insights
    };
  }

  // Dashboard Methods
  static async getNotesForDashboard(timeRange: number = 30): Promise<DiaryEntry[]> {
    const entries = await this.getNotes();
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - timeRange);
    
    return entries
      .filter(entry => new Date(entry.created_at) >= daysAgo)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // Pattern Alerts Methods
  static async createAlert(
    alertType: AlertType,
    alertText: string,
    relatedNoteIds: string[]
  ): Promise<PatternAlert | null> {
    try {
      const alerts = safeJsonParse<PatternAlert[]>(STORAGE_KEYS.PATTERN_ALERTS, []);
      const userId = getUserId();
      
      const newAlert: PatternAlert = {
        id: generateId(),
        created_at: new Date().toISOString(),
        user_id: userId,
        alert_type: alertType,
        alert_text: alertText,
        related_note_ids: relatedNoteIds,
        is_read: false
      };

      alerts.unshift(newAlert); // Add to beginning for newest first
      safeJsonStore(STORAGE_KEYS.PATTERN_ALERTS, alerts);
      
      return newAlert;
    } catch (error) {
      console.error('Error creating pattern alert:', error);
      return null;
    }
  }

  static async getUserAlerts(): Promise<PatternAlert[]> {
    try {
      const alerts = safeJsonParse<PatternAlert[]>(STORAGE_KEYS.PATTERN_ALERTS, []);
      const userId = getUserId();
      
      return alerts
        .filter(alert => alert.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      return [];
    }
  }

  static async getUnreadCount(): Promise<number> {
    try {
      const alerts = await this.getUserAlerts();
      return alerts.filter(alert => !alert.is_read).length;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  static async markAsRead(alertId: string): Promise<boolean> {
    try {
      const alerts = safeJsonParse<PatternAlert[]>(STORAGE_KEYS.PATTERN_ALERTS, []);
      const alertIndex = alerts.findIndex(alert => alert.id === alertId);
      
      if (alertIndex === -1) {
        return false;
      }

      alerts[alertIndex].is_read = true;
      safeJsonStore(STORAGE_KEYS.PATTERN_ALERTS, alerts);
      
      return true;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return false;
    }
  }

  static async markAllAsRead(): Promise<boolean> {
    try {
      const alerts = safeJsonParse<PatternAlert[]>(STORAGE_KEYS.PATTERN_ALERTS, []);
      const userId = getUserId();
      
      const updatedAlerts = alerts.map(alert => 
        alert.user_id === userId ? { ...alert, is_read: true } : alert
      );
      
      safeJsonStore(STORAGE_KEYS.PATTERN_ALERTS, updatedAlerts);
      return true;
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      return false;
    }
  }

  static async deleteAlert(alertId: string): Promise<boolean> {
    try {
      const alerts = safeJsonParse<PatternAlert[]>(STORAGE_KEYS.PATTERN_ALERTS, []);
      const filteredAlerts = alerts.filter(alert => alert.id !== alertId);
      
      if (filteredAlerts.length === alerts.length) {
        return false; // Alert not found
      }

      safeJsonStore(STORAGE_KEYS.PATTERN_ALERTS, filteredAlerts);
      return true;
    } catch (error) {
      console.error('Error deleting alert:', error);
      return false;
    }
  }

  static async checkForDuplicateAlert(
    alertType: AlertType,
    alertText: string,
    hoursThreshold: number = 24
  ): Promise<boolean> {
    try {
      const alerts = await this.getUserAlerts();
      const thresholdDate = new Date();
      thresholdDate.setHours(thresholdDate.getHours() - hoursThreshold);

      return alerts.some(alert => 
        alert.alert_type === alertType &&
        alert.alert_text === alertText &&
        new Date(alert.created_at) >= thresholdDate
      );
    } catch (error) {
      console.error('Error checking for duplicate alert:', error);
      return false;
    }
  }

  // Utility Methods
  static async exportData(): Promise<{
    entries: DiaryEntry[];
    alerts: PatternAlert[];
    userId: string;
    exportDate: string;
  }> {
    return {
      entries: await this.getNotes(),
      alerts: await this.getUserAlerts(),
      userId: getUserId(),
      exportDate: new Date().toISOString()
    };
  }

  static async importData(data: {
    entries: DiaryEntry[];
    alerts: PatternAlert[];
  }): Promise<void> {
    safeJsonStore(STORAGE_KEYS.DIARY_ENTRIES, data.entries);
    safeJsonStore(STORAGE_KEYS.PATTERN_ALERTS, data.alerts);
  }

  static async clearAllData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.DIARY_ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.PATTERN_ALERTS);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  }

  // Debug Methods
  static async debugDatabaseSchema(): Promise<void> {
    console.log('🔍 Local Storage Debug Info:');
    console.log('📋 Available keys:', Object.values(STORAGE_KEYS));
    console.log('📊 Storage usage:', {
      entries: (await this.getNotes()).length,
      alerts: (await this.getUserAlerts()).length,
      userId: getUserId()
    });
  }

  static async checkAISchema(): Promise<boolean> {
    // Always return true for local storage since we control the schema
    console.log('✅ Local storage AI schema is always compatible');
    return true;
  }
}
