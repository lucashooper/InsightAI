import { LocalStorageService } from './localStorageService';
import { notesService } from './notesService';
import { encryptedNotesService } from './encryptedNotesService';
import { PatternAlertsService } from './patternAlertsService';
import type { DiaryEntry, PatternAlert, AlertType } from '../types/diary';

// Configuration to switch between storage backends
// This is now dynamic based on user's privacy mode preference
const getStorageMode = (): boolean => {
  const privacyMode = localStorage.getItem('insightai-privacy-mode');
  return privacyMode === 'true';
};

// Unified interface for both storage backends
export const storageAdapter = {
  // Notes/Diary Entries (with automatic encryption/decryption)
  async getNotes(): Promise<DiaryEntry[]> {
    if (getStorageMode()) {
      return LocalStorageService.getNotes();
    }
    // Use encrypted notes service which handles encryption automatically
    return encryptedNotesService.getNotes();
  },

  async createNote(title: string, content: string): Promise<DiaryEntry> {
    if (getStorageMode()) {
      return LocalStorageService.createNote(title, content);
    }
    // Use encrypted notes service which handles encryption automatically
    return encryptedNotesService.createNote(title, content);
  },

  async updateNote(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
    if (getStorageMode()) {
      return LocalStorageService.updateNote(id, updates);
    }
    // Use encrypted notes service which handles encryption automatically
    return encryptedNotesService.updateNote(id, updates);
  },

  async deleteNote(id: string): Promise<void> {
    if (getStorageMode()) {
      return LocalStorageService.deleteNote(id);
    }
    // Use encrypted notes service which handles encryption automatically
    return encryptedNotesService.deleteNote(id);
  },

  async updateAIAnalysis(id: string, analysis: any): Promise<void> {
    if (getStorageMode()) {
      return LocalStorageService.updateAIAnalysis(id, analysis);
    }
    return notesService.updateAIAnalysis(id, analysis);
  },

  async saveAIResponse(id: string, responseData: {
    conversationalResponse: string;
    structuredInsights: any;
    insightsReport?: any;
  }): Promise<void> {
    if (getStorageMode()) {
      return LocalStorageService.saveAIResponse(id, responseData);
    }
    return notesService.saveAIResponse(id, responseData);
  },

  async saveAIInsights(id: string, insights: any): Promise<void> {
    if (getStorageMode()) {
      return LocalStorageService.saveAIInsights(id, insights);
    }
    // Use encrypted notes service which handles encryption automatically
    return encryptedNotesService.saveAIInsights(id, insights);
  },

  async getAIResponse(id: string): Promise<{
    ai_response_text?: string;
    ai_structured_insights?: any;
    ai_last_analyzed?: string;
    ai_insights?: any;
  } | null> {
    if (getStorageMode()) {
      return LocalStorageService.getAIResponse(id);
    }
    return notesService.getAIResponse(id);
  },

  async getNotesForDashboard(timeRange: number = 30): Promise<DiaryEntry[]> {
    if (getStorageMode()) {
      return LocalStorageService.getNotesForDashboard(timeRange);
    }
    return notesService.getNotesForDashboard(timeRange);
  },

  // Pattern Alerts
  async createAlert(
    alertType: AlertType,
    alertText: string,
    relatedNoteIds: string[]
  ): Promise<PatternAlert | null> {
    if (getStorageMode()) {
      return LocalStorageService.createAlert(alertType, alertText, relatedNoteIds);
    }
    // For Supabase, we need a userId - in a real app this would come from auth
    const userId = 'default-user'; // This would be replaced with actual auth
    return PatternAlertsService.createAlert(userId, alertType, alertText, relatedNoteIds);
  },

  async getUserAlerts(): Promise<PatternAlert[]> {
    if (getStorageMode()) {
      return LocalStorageService.getUserAlerts();
    }
    const userId = 'default-user'; // This would be replaced with actual auth
    return PatternAlertsService.getUserAlerts(userId);
  },

  async getUnreadCount(): Promise<number> {
    if (getStorageMode()) {
      return LocalStorageService.getUnreadCount();
    }
    const userId = 'default-user'; // This would be replaced with actual auth
    return PatternAlertsService.getUnreadCount(userId);
  },

  async markAsRead(alertId: string): Promise<boolean> {
    if (getStorageMode()) {
      return LocalStorageService.markAsRead(alertId);
    }
    return PatternAlertsService.markAsRead(alertId);
  },

  async markAllAsRead(): Promise<boolean> {
    if (getStorageMode()) {
      return LocalStorageService.markAllAsRead();
    }
    const userId = 'default-user'; // This would be replaced with actual auth
    return PatternAlertsService.markAllAsRead(userId);
  },

  async deleteAlert(alertId: string): Promise<boolean> {
    if (getStorageMode()) {
      return LocalStorageService.deleteAlert(alertId);
    }
    return PatternAlertsService.deleteAlert(alertId);
  },

  async checkForDuplicateAlert(
    alertType: AlertType,
    alertText: string,
    hoursThreshold: number = 24
  ): Promise<boolean> {
    if (getStorageMode()) {
      return LocalStorageService.checkForDuplicateAlert(alertType, alertText, hoursThreshold);
    }
    const userId = 'default-user'; // This would be replaced with actual auth
    return PatternAlertsService.checkForDuplicateAlert(userId, alertType, alertText, hoursThreshold);
  },

  // Utility methods
  processSentimentFlowData(notes: DiaryEntry[]) {
    return notesService.processSentimentFlowData(notes);
  },

  processCategoryData(notes: DiaryEntry[]) {
    return notesService.processCategoryData(notes);
  },

  getPositiveInsights(notes: DiaryEntry[]) {
    return notesService.getPositiveInsights(notes);
  },

  getGrowthOpportunities(notes: DiaryEntry[]) {
    return notesService.getGrowthOpportunities(notes);
  },

  calculateStreak(notes: DiaryEntry[]) {
    return notesService.calculateStreak(notes);
  },

  async debugDatabaseSchema(): Promise<void> {
    if (getStorageMode()) {
      return LocalStorageService.debugDatabaseSchema();
    }
    return notesService.debugDatabaseSchema();
  },

  async checkAISchema(): Promise<boolean> {
    if (getStorageMode()) {
      return LocalStorageService.checkAISchema();
    }
    return notesService.checkAISchema();
  },

  // Migration utilities
  async exportToLocalStorage(): Promise<void> {
    if (getStorageMode()) {
      console.log('Already using local storage');
      return;
    }

    console.log('🔄 Migrating data from Supabase to Local Storage...');
    
    try {
      // Get all data from Supabase
      const notes = await notesService.getNotes();
      const alerts = await PatternAlertsService.getUserAlerts('default-user');

      // Import to local storage
      await LocalStorageService.importData({ entries: notes, alerts });
      
      console.log('✅ Migration completed successfully');
      console.log(`📊 Migrated ${notes.length} notes and ${alerts.length} alerts`);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async exportData() {
    if (getStorageMode()) {
      return LocalStorageService.exportData();
    }
    
    const notes = await notesService.getNotes();
    const alerts = await PatternAlertsService.getUserAlerts('default-user');
    
    return {
      entries: notes,
      alerts,
      userId: 'default-user',
      exportDate: new Date().toISOString()
    };
  }
};

// Export configuration for easy switching
export const switchToLocalStorage = () => {
  console.log('🔄 Switching to Local Storage mode');
  localStorage.setItem('insightai-privacy-mode', 'true');
};

export const switchToSupabase = () => {
  console.log('🔄 Switching to Supabase mode');
  localStorage.setItem('insightai-privacy-mode', 'false');
};
