import { supabase } from './supabaseClient';
import { storageAdapter } from './storageAdapter';
// Removed unused type imports

export class PatternDetectionService {
  /**
   * Check for theme streaks in the last 7 days
   */
  static async checkForThemeStreaks(userId: string): Promise<void> {
    try {
      // Get the last 7 days of notes with AI insights
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: notes, error } = await supabase
        .from('notes')
        .select('id, created_at, ai_insights')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching notes for theme streak detection:', error);
        return;
      }

      if (!notes || notes.length < 3) {
        return; // Need at least 3 days for a streak
      }

      // Extract insights from each note
      const insightsByDay = notes.map(note => {
        const insights = note.ai_insights?.insights_report?.keyTakeaways || [];
        return {
          date: note.created_at,
          noteId: note.id,
          insights: insights.map((takeaway: any) => takeaway.insight.toLowerCase())
        };
      });

      // Group insights by consecutive days
      const insightCounts = new Map<string, { count: number; noteIds: string[]; dates: string[] }>();

      insightsByDay.forEach(dayData => {
        dayData.insights.forEach((insight: string) => {
          if (!insightCounts.has(insight)) {
            insightCounts.set(insight, { count: 0, noteIds: [], dates: [] });
          }
          
          const entry = insightCounts.get(insight)!;
          entry.count++;
          entry.noteIds.push(dayData.noteId);
          entry.dates.push(dayData.date);
        });
      });

      // Check for streaks (3 or more consecutive days)
      for (const [insight, data] of insightCounts) {
        if (data.count >= 3) {
          // Check if this is a consecutive streak
          const sortedDates = data.dates.sort();
          const isConsecutive = this.checkConsecutiveDays(sortedDates, 3);

          if (isConsecutive) {
            const alertText = `You've written about "${insight}" for ${data.count} days in a row. This might be a recurring theme worth exploring.`;
            
            // Check for duplicate alert
            const isDuplicate = await storageAdapter.checkForDuplicateAlert(
              'THEME_STREAK',
              alertText,
              24
            );

            if (!isDuplicate) {
              await storageAdapter.createAlert(
                'THEME_STREAK',
                alertText,
                data.noteIds
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking for theme streaks:', error);
    }
  }

  /**
   * Check for mood patterns
   */
  static async checkForMoodPatterns(userId: string): Promise<void> {
    try {
      // Get the last 14 days of notes
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data: notes, error } = await supabase
        .from('notes')
        .select('id, created_at, ai_insights')
        .eq('user_id', userId)
        .gte('created_at', fourteenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error || !notes || notes.length < 5) {
        return;
      }

      // Extract mood data from insights
      const moodData = notes.map(note => {
        const insights = note.ai_insights?.insights_report?.keyTakeaways || [];
        const negativeInsights = insights.filter((takeaway: any) => 
          takeaway.sentiment === 'opportunity'
        );
        
        return {
          date: note.created_at,
          noteId: note.id,
          negativeCount: negativeInsights.length,
          hasNegative: negativeInsights.length > 0
        };
      });

      // Check for patterns of negative sentiment
      const negativeDays = moodData.filter(day => day.hasNegative);
      
      if (negativeDays.length >= 5) {
        const alertText = `You've experienced challenging thoughts or feelings in ${negativeDays.length} out of the last ${moodData.length} days. Consider reaching out for support.`;
        
        const isDuplicate = await storageAdapter.checkForDuplicateAlert(
          'MOOD_PATTERN',
          alertText,
          48
        );

        if (!isDuplicate) {
          const noteIds = negativeDays.map(day => day.noteId);
          await storageAdapter.createAlert(
            'MOOD_PATTERN',
            alertText,
            noteIds
          );
        }
      }
    } catch (error) {
      console.error('Error checking for mood patterns:', error);
    }
  }

  /**
   * Check for trigger patterns
   */
  static async checkForTriggerPatterns(userId: string): Promise<void> {
    try {
      // Get the last 10 days of notes
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const { data: notes, error } = await supabase
        .from('notes')
        .select('id, created_at, ai_insights')
        .eq('user_id', userId)
        .gte('created_at', tenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error || !notes || notes.length < 3) {
        return;
      }

      // Extract trigger information from AI analysis
      const triggerData = notes.map(note => {
        const analysis = note.ai_insights?.ai_analysis;
        const triggers = analysis?.triggers || [];
        
        return {
          date: note.created_at,
          noteId: note.id,
          triggers: triggers
        };
      });

      // Look for recurring triggers
      const triggerCounts = new Map<string, { count: number; noteIds: string[] }>();

      triggerData.forEach(dayData => {
        dayData.triggers.forEach((trigger: string) => {
          const normalizedTrigger = trigger.toLowerCase().trim();
          if (!triggerCounts.has(normalizedTrigger)) {
            triggerCounts.set(normalizedTrigger, { count: 0, noteIds: [] });
          }
          
          const entry = triggerCounts.get(normalizedTrigger)!;
          entry.count++;
          entry.noteIds.push(dayData.noteId);
        });
      });

      // Check for triggers that appear multiple times
      for (const [trigger, data] of triggerCounts) {
        if (data.count >= 2) {
          const alertText = `"${trigger}" has been identified as a trigger in ${data.count} recent entries. This might be worth addressing.`;
          
          const isDuplicate = await storageAdapter.checkForDuplicateAlert(
            'TRIGGER_PATTERN',
            alertText,
            24
          );

          if (!isDuplicate) {
            await storageAdapter.createAlert(
              'TRIGGER_PATTERN',
              alertText,
              data.noteIds
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking for trigger patterns:', error);
    }
  }

  /**
   * Run all pattern detection checks
   */
  static async runPatternDetection(userId: string): Promise<void> {
    try {
      await Promise.all([
        this.checkForThemeStreaks(userId),
        this.checkForMoodPatterns(userId),
        this.checkForTriggerPatterns(userId)
      ]);
    } catch (error) {
      console.error('Error running pattern detection:', error);
    }
  }

  /**
   * Helper function to check if dates are consecutive
   */
  private static checkConsecutiveDays(dates: string[], minConsecutive: number): boolean {
    if (dates.length < minConsecutive) return false;

    const sortedDates = dates.sort();
    let consecutiveCount = 1;
    let maxConsecutive = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        consecutiveCount++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
      } else {
        consecutiveCount = 1;
      }
    }

    return maxConsecutive >= minConsecutive;
  }
} 