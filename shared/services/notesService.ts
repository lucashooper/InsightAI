import { supabase } from './supabaseClient';
import type { DiaryEntry } from '../types/diary';

export const notesService = {
  // Fetch all notes for the current user
  async getNotes(): Promise<DiaryEntry[]> {
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user - returning empty notes array');
      return [];
    }

    const { data, error } = await supabase
      .from('notes')
      .select('* , ai_insights')
      .eq('user_id', user.id) // CRITICAL: Only fetch notes for this user!
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false }); // Secondary sort for stable ordering

    if (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }

    console.log(`✅ Loaded ${data?.length || 0} notes for user ${user.id}`);
    return data || [];
  },

  // Create a new note
  async createNote(title: string, content: string): Promise<DiaryEntry> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create notes');
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          title,
          content,
          mood_score: 5, // Default mood score
          user_id: user.id,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }

    return data;
  },

  // Update a note (only if it belongs to the current user)
  async updateNote(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to update notes');
    }

    const { data, error } = await supabase
      .from('notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id) // SECURITY: Only update if it's the user's note
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }

    return data;
  },

  // Delete a note (only if it belongs to the current user)
  async deleteNote(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to delete notes');
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // SECURITY: Only delete if it's the user's note

    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  // Update AI analysis for a note (legacy method - keeping for backward compatibility)
  async updateAIAnalysis(id: string, analysis: any): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .update({
        ai_analysis: analysis,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating AI analysis:', error);
      throw error;
    }
  },

  // New method: Save AI response with structured data
  async saveAIResponse(id: string, responseData: {
    conversationalResponse: string;
    structuredInsights: any;
    insightsReport?: any;
  }): Promise<void> {
    try {
      console.log('💾 Saving AI analysis to ai_insights field:', {
        id,
        conversationalResponseLength: responseData.conversationalResponse?.length || 0,
        hasStructuredInsights: !!responseData.structuredInsights
      });

      // Save everything to ai_insights field which exists in the database
      const aiInsightsData = {
        conversational_response: responseData.conversationalResponse,
        insights_report: responseData.insightsReport,
        ...responseData.structuredInsights,
        analyzed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('notes')
        .update({
          ai_insights: aiInsightsData,
          ai_last_analyzed: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error saving AI analysis:', error);
        throw error;
      }
      
      console.log('✅ Successfully saved AI analysis');
    } catch (saveError) {
      console.error('❌ Failed to save AI analysis:', saveError);
      const errorMessage = saveError instanceof Error ? saveError.message : 'Unknown error';
      throw new Error(`Failed to save AI response: ${errorMessage}`);
    }
  },

  // Debug function to check database schema
  async debugDatabaseSchema(): Promise<void> {
    try {
      console.log('🔍 Debugging database schema...');
      
      // Try to get table information
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) {
        console.log('❌ Could not get table list:', tablesError);
      } else {
        console.log('📋 Available tables:', tables?.map(t => t.table_name));
      }

      // Try to get column information for notes table
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'notes');

      if (columnsError) {
        console.log('❌ Could not get column list:', columnsError);
      } else {
        console.log('📋 Notes table columns:', columns);
      }

    } catch (error) {
      console.log('❌ Error debugging schema:', error);
    }
  },

  // Check if new AI response columns exist in the database
  async checkAISchema(): Promise<boolean> {
    try {
      console.log('🔍 Checking AI response schema...');
      
      // Try to select the new columns to see if they exist
      const { data, error } = await supabase
        .from('notes')
        .select('ai_response_text, ai_structured_insights, ai_last_analyzed, ai_insights')
        .limit(1);

      if (error) {
        console.log('❌ New AI columns do not exist:', error.message);
        console.log('🔍 Error details:', {
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return false;
      }

      console.log('✅ New AI columns exist in database');
      console.log('🔍 Schema check result:', {
        hasData: !!data,
        dataLength: data?.length || 0,
        sampleData: data?.[0] ? {
          hasResponseText: !!data[0].ai_response_text,
          hasStructuredInsights: !!data[0].ai_structured_insights,
          hasLastAnalyzed: !!data[0].ai_last_analyzed
        } : 'No data'
      });
      return true;
    } catch (error) {
      console.log('❌ Error checking AI schema:', error);
      return false;
    }
  },

  // Save AI insights to the ai_insights column
  async saveAIInsights(id: string, insights: any): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .update({
        ai_insights: insights,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) {
      console.error('Error saving AI insights:', error);
      throw error;
    }
  },

  // Get AI response for a specific note
  async getAIResponse(id: string): Promise<{
    ai_response_text?: string;
    ai_structured_insights?: any;
    ai_last_analyzed?: string;
    ai_insights?: any;
  } | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('ai_response_text, ai_structured_insights, ai_last_analyzed, ai_insights')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching AI response:', error);
      throw error;
    }
    return data;
  },

  // Get notes from the last 30 days for dashboard analytics (current user only)
  async getNotesForDashboard(timeRange: number = 30): Promise<DiaryEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user - returning empty dashboard notes');
      return [];
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - timeRange);
    
    const { data, error } = await supabase
      .from('notes')
      .select('*, ai_insights')
      .eq('user_id', user.id) // SECURITY: Only fetch user's own notes
      .gte('created_at', daysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching notes for dashboard:', error);
      throw error;
    }

    console.log(`✅ Loaded ${data?.length || 0} dashboard notes for user ${user.id}`);
    return data || [];
  },

  // Process sentiment flow data for the stacked bar chart
  processSentimentFlowData(notes: DiaryEntry[]) {
    // Show each note as a separate point for better visualization
    return notes
      .filter(note => note.ai_insights) // Only include notes with AI insights
      .map(note => {
        const date = new Date(note.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit' 
        });
        
        // Use the new dual-axis scores
        const wellbeingScore = note.ai_insights.wellbeingScore || 5;
        const resilienceScore = note.ai_insights.resilienceScore || 3;
        
        // Get snippet from entry (first 80 characters)
        const snippet = note.content 
          ? note.content.length > 80 
            ? note.content.substring(0, 80) + '...'
            : note.content
          : '';
        
        return {
          date: `${date} ${new Date(note.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
          wellbeingScore: Math.round(wellbeingScore * 10) / 10,
          resilienceScore: Math.round(resilienceScore * 10) / 10,
          entryId: note.id,
          entryTitle: note.title,
          entrySnippet: snippet
        };
      })
      .sort((a, b) => {
        // Sort chronologically
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  },

  // Process category breakdown data for the donut chart
  processCategoryData(notes: DiaryEntry[]) {
    const categoryCounts: { [key: string]: number } = {};
    notes.forEach(note => {
      if (note.ai_insights?.insights_report?.keyTakeaways) {
        note.ai_insights.insights_report.keyTakeaways.forEach((takeaway: any) => {
          const category = takeaway.category;
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
      }
    });
    
    // Convert to array format for Recharts
    return Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value
    }));
  },

  // Get positive insights for the monthly highlights
  getPositiveInsights(notes: DiaryEntry[]) {
    const positiveInsights: any[] = [];
    
    notes.forEach(note => {
      if (note.ai_insights?.insights_report?.keyTakeaways) {
        note.ai_insights.insights_report.keyTakeaways.forEach((takeaway: any) => {
          if (takeaway.sentiment === 'positive') {
            positiveInsights.push({
              ...takeaway,
              noteId: note.id,
              noteTitle: note.title,
              noteDate: new Date(note.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit'
              })
            });
          }
        });
      }
    });
    
    return positiveInsights;
  },

  // Get growth opportunities for the dashboard
  getGrowthOpportunities(notes: DiaryEntry[]) {
    const growthOpportunities: any[] = [];
    
    notes.forEach(note => {
      if (note.ai_insights?.insights_report?.keyTakeaways) {
        note.ai_insights.insights_report.keyTakeaways.forEach((takeaway: any) => {
          if (takeaway.sentiment === 'opportunity') {
            growthOpportunities.push({
              ...takeaway,
              noteId: note.id,
              noteTitle: note.title,
              noteDate: new Date(note.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit'
              })
            });
          }
        });
      }
    });
    
    return growthOpportunities;
  },

  // Calculate journaling streak
  calculateStreak(notes: DiaryEntry[]): { currentStreak: number; longestStreak: number; lastEntryDate: string | null } {
    if (notes.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastEntryDate: null };
    }

    // Sort notes by date (newest first)
    const sortedNotes = [...notes].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Get unique dates (in case of multiple entries per day)
    const uniqueDates = [...new Set(
      sortedNotes.map(note => new Date(note.created_at).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastEntryDate: string | null = null;

    // Calculate current streak
    if (uniqueDates.length > 0) {
      lastEntryDate = uniqueDates[0];
      
      // Check if the last entry was today or yesterday (to maintain streak)
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1;
        
        // Count consecutive days backwards from the last entry
        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDate = new Date(uniqueDates[i - 1]);
          const previousDate = new Date(uniqueDates[i]);
          const dayDiff = (currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000);
          
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate longest streak
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = new Date(uniqueDates[i - 1]);
        const previousDate = new Date(uniqueDates[i]);
        const dayDiff = (currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000);
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    // Don't forget to check the last streak
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak, lastEntryDate };
  },
}; 