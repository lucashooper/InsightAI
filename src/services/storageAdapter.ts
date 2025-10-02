import { LocalStorageService } from './localStorageService';
import { notesService } from './notesService';
import { PatternAlertsService } from './patternAlertsService';
import type { DiaryEntry, PatternAlert, AlertType } from '../types/diary';

// Configuration to switch between storage backends
const USE_LOCAL_STORAGE = true; // Set to false to use Supabase

// Unified interface for both storage backends
export const storageAdapter = {
  // Notes/Diary Entries
  async getNotes(): Promise<DiaryEntry[]> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.getNotes();
    }
    return notesService.getNotes();
  },

  async createNote(title: string, content: string): Promise<DiaryEntry> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.createNote(title, content);
    }
    return notesService.createNote(title, content);
  },

  async updateNote(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.updateNote(id, updates);
    }
    return notesService.updateNote(id, updates);
  },

  async deleteNote(id: string): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.deleteNote(id);
    }
    return notesService.deleteNote(id);
  },

  async updateAIAnalysis(id: string, analysis: any): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.updateAIAnalysis(id, analysis);
    }
    return notesService.updateAIAnalysis(id, analysis);
  },

  async saveAIResponse(id: string, responseData: {
    conversationalResponse: string;
    structuredInsights: any;
    insightsReport?: any;
  }): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.saveAIResponse(id, responseData);
    }
    return notesService.saveAIResponse(id, responseData);
  },

  async saveAIInsights(id: string, insights: any): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.saveAIInsights(id, insights);
    }
    return notesService.saveAIInsights(id, insights);
  },

  async getAIResponse(id: string): Promise<{
    ai_response_text?: string;
    ai_structured_insights?: any;
    ai_last_analyzed?: string;
    ai_insights?: any;
  } | null> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.getAIResponse(id);
    }
    return notesService.getAIResponse(id);
  },

  async getNotesForDashboard(timeRange: number = 30): Promise<DiaryEntry[]> {
    if (USE_LOCAL_STORAGE) {
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
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.createAlert(alertType, alertText, relatedNoteIds);
    }
    // For Supabase, we need a userId - in a real app this would come from auth
    const userId = 'default-user'; // This would be replaced with actual auth
    return PatternAlertsService.createAlert(userId, alertType, alertText, relatedNoteIds);
  },

  async getUserAlerts(): Promise<PatternAlert[]> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.getUserAlerts();
    }
    const userId = 'default-user'; // This would be replaced with actual auth
    return PatternAlertsService.getUserAlerts(userId);
  },

  async getUnreadCount(): Promise<number> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.getUnreadCount();
    }
    const userId = 'default-user'; // This would be replaced with actual auth
    return PatternAlertsService.getUnreadCount(userId);
  },

  async markAsRead(alertId: string): Promise<boolean> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.markAsRead(alertId);
    }
    return PatternAlertsService.markAsRead(alertId);
  },

  async markAllAsRead(): Promise<boolean> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.markAllAsRead();
    }
    const userId = 'default-user'; // This would be replaced with actual auth
    return PatternAlertsService.markAllAsRead(userId);
  },

  async deleteAlert(alertId: string): Promise<boolean> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.deleteAlert(alertId);
    }
    return PatternAlertsService.deleteAlert(alertId);
  },

  async checkForDuplicateAlert(
    alertType: AlertType,
    alertText: string,
    hoursThreshold: number = 24
  ): Promise<boolean> {
    if (USE_LOCAL_STORAGE) {
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
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.debugDatabaseSchema();
    }
    return notesService.debugDatabaseSchema();
  },

  async checkAISchema(): Promise<boolean> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageService.checkAISchema();
    }
    return notesService.checkAISchema();
  },

  // Migration utilities
  async exportToLocalStorage(): Promise<void> {
    if (USE_LOCAL_STORAGE) {
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
    if (USE_LOCAL_STORAGE) {
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
  // In a real implementation, you'd update the USE_LOCAL_STORAGE constant
  // For now, it's already set to true
};

export const switchToSupabase = () => {
  console.log('🔄 Switching to Supabase mode');
  // In a real implementation, you'd update the USE_LOCAL_STORAGE constant to false
  console.log('⚠️ Remember to update USE_LOCAL_STORAGE constant in storageAdapter.ts');
};
