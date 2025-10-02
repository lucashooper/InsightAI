import { supabase } from '../services/supabaseClient';
import { LocalStorageService } from '../services/localStorageService';
import type { DiaryEntry, PatternAlert } from '../types/diary';

export class DataMigration {
  /**
   * Extract all data from Supabase and save to local storage
   * This preserves your existing diary entries and alerts
   */
  static async migrateFromSupabaseToLocal(): Promise<{
    success: boolean;
    entriesMigrated: number;
    alertsMigrated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let entriesMigrated = 0;
    let alertsMigrated = 0;

    try {
      console.log('🔄 Starting migration from Supabase to Local Storage...');

      // Step 1: Extract diary entries from Supabase
      console.log('📖 Extracting diary entries...');
      try {
        const { data: notes, error: notesError } = await supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false });

        if (notesError) {
          console.error('❌ Error fetching notes from Supabase:', notesError);
          errors.push(`Notes extraction failed: ${notesError.message}`);
        } else if (notes && notes.length > 0) {
          console.log(`📋 Found ${notes.length} diary entries to migrate`);
          
          // Convert Supabase entries to local format and import
          const localEntries: DiaryEntry[] = notes.map(note => ({
            id: `migrated_${note.id}`, // Prefix to avoid conflicts
            title: note.title || 'Untitled',
            content: note.content || '',
            created_at: note.created_at,
            updated_at: note.updated_at || note.created_at,
            ai_analysis: note.ai_analysis,
            ai_response_text: note.ai_response_text,
            ai_structured_insights: note.ai_structured_insights,
            ai_last_analyzed: note.ai_last_analyzed,
            ai_insights: note.ai_insights,
            insights_report: note.insights_report,
            mood_score: note.mood_score || 5
          }));

          // Import to local storage
          await LocalStorageService.importData({ entries: localEntries, alerts: [] });
          entriesMigrated = localEntries.length;
          console.log(`✅ Successfully migrated ${entriesMigrated} diary entries`);
        } else {
          console.log('📝 No diary entries found in Supabase');
        }
      } catch (notesErr) {
        const errorMsg = `Failed to extract diary entries: ${notesErr instanceof Error ? notesErr.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        errors.push(errorMsg);
      }

      // Step 2: Extract pattern alerts from Supabase (if table exists)
      console.log('🚨 Extracting pattern alerts...');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: alerts, error: alertsError } = await supabase
            .from('pattern_alerts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (alertsError) {
            console.log('⚠️ Pattern alerts table may not exist or is inaccessible:', alertsError.message);
            errors.push(`Alerts extraction failed: ${alertsError.message}`);
          } else if (alerts && alerts.length > 0) {
            console.log(`🚨 Found ${alerts.length} pattern alerts to migrate`);
            
            // Convert and import alerts
            const localAlerts: PatternAlert[] = alerts.map(alert => ({
              ...alert,
              id: `migrated_${alert.id}` // Prefix to avoid conflicts
            }));

            // Get existing entries and add alerts
            const existingData = await LocalStorageService.exportData();
            await LocalStorageService.importData({ 
              entries: existingData.entries, 
              alerts: localAlerts 
            });
            
            alertsMigrated = localAlerts.length;
            console.log(`✅ Successfully migrated ${alertsMigrated} pattern alerts`);
          } else {
            console.log('🚨 No pattern alerts found in Supabase');
          }
        } else {
          console.log('👤 No authenticated user found for alerts migration');
          errors.push('No authenticated user - alerts migration skipped');
        }
      } catch (alertsErr) {
        const errorMsg = `Failed to extract pattern alerts: ${alertsErr instanceof Error ? alertsErr.message : 'Unknown error'}`;
        console.log('⚠️', errorMsg);
        errors.push(errorMsg);
      }

      const success = entriesMigrated > 0 || errors.length === 0;
      
      console.log('🎉 Migration Summary:');
      console.log(`📖 Diary entries migrated: ${entriesMigrated}`);
      console.log(`🚨 Pattern alerts migrated: ${alertsMigrated}`);
      console.log(`❌ Errors encountered: ${errors.length}`);
      
      if (errors.length > 0) {
        console.log('⚠️ Migration completed with warnings:', errors);
      }

      return {
        success,
        entriesMigrated,
        alertsMigrated,
        errors
      };

    } catch (error) {
      const errorMsg = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌', errorMsg);
      return {
        success: false,
        entriesMigrated: 0,
        alertsMigrated: 0,
        errors: [errorMsg]
      };
    }
  }

  /**
   * Export current local storage data to JSON file for backup
   */
  static async exportLocalDataToFile(): Promise<string> {
    try {
      const data = await LocalStorageService.exportData();
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create downloadable file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `diary-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Local data exported to file successfully');
      return jsonString;
    } catch (error) {
      console.error('❌ Failed to export local data:', error);
      throw error;
    }
  }

  /**
   * Import data from JSON file to local storage
   */
  static async importDataFromFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.entries || !Array.isArray(data.entries)) {
        throw new Error('Invalid backup file format - missing entries array');
      }

      await LocalStorageService.importData({
        entries: data.entries,
        alerts: data.alerts || []
      });
      
      console.log('✅ Data imported from file successfully');
    } catch (error) {
      console.error('❌ Failed to import data from file:', error);
      throw error;
    }
  }

  /**
   * Check if Supabase connection is working and has data
   */
  static async checkSupabaseConnection(): Promise<{
    connected: boolean;
    hasNotes: boolean;
    notesCount: number;
    hasAlerts: boolean;
    alertsCount: number;
    error?: string;
  }> {
    try {
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('notes')
        .select('count', { count: 'exact', head: true });

      if (testError) {
        return {
          connected: false,
          hasNotes: false,
          notesCount: 0,
          hasAlerts: false,
          alertsCount: 0,
          error: testError.message
        };
      }

      const notesCount = testData || 0;

      // Check for alerts
      let alertsCount = 0;
      let hasAlerts = false;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { count: alertCount } = await supabase
            .from('pattern_alerts')
            .select('count', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          alertsCount = alertCount || 0;
          hasAlerts = alertsCount > 0;
        }
      } catch (alertError) {
        // Alerts table might not exist, that's okay
        console.log('Pattern alerts table not accessible:', alertError);
      }

      return {
        connected: true,
        hasNotes: notesCount > 0,
        notesCount,
        hasAlerts,
        alertsCount
      };

    } catch (error) {
      return {
        connected: false,
        hasNotes: false,
        notesCount: 0,
        hasAlerts: false,
        alertsCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clear all local storage data (use with caution!)
   */
  static async clearLocalStorage(): Promise<void> {
    await LocalStorageService.clearAllData();
    console.log('🧹 Local storage cleared');
  }
}
