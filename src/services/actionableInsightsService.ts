// Actionable Insights Service
// Manages personal playbook of mental health strategies

import type { ActionableInsight, InsightProgress } from '../types/actionableInsight';
import { supabase } from './supabaseClient';

class ActionableInsightsService {
  /**
   * Get user-specific storage key
   */
  private async getStorageKey(key: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    return `insightai_${user.id}_${key}`;
  }
  /**
   * Get all actionable insights for current user
   */
  async getInsights(): Promise<ActionableInsight[]> {
    try {
      const key = await this.getStorageKey('actionable_insights');
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading actionable insights:', error);
      return [];
    }
  }

  /**
   * Save an actionable insight
   */
  async saveInsight(insight: Omit<ActionableInsight, 'id' | 'createdAt'>): Promise<ActionableInsight> {
    const insights = await this.getInsights();
    const newInsight: ActionableInsight = {
      ...insight,
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    insights.push(newInsight);
    const key = await this.getStorageKey('actionable_insights');
    localStorage.setItem(key, JSON.stringify(insights));
    return newInsight;
  }

  /**
   * Update insight status
   */
  async updateInsightStatus(
    insightId: string, 
    status: ActionableInsight['status'],
    notes?: string
  ): Promise<void> {
    const insights = await this.getInsights();
    const insight = insights.find(i => i.id === insightId);
    
    if (insight) {
      insight.status = status;
      if (notes) insight.notes = notes;
      
      if (status === 'active' && !insight.startedAt) {
        insight.startedAt = new Date().toISOString();
      }
      
      if (status === 'completed') {
        insight.completedAt = new Date().toISOString();
      }
      
      const key = await this.getStorageKey('actionable_insights');
      localStorage.setItem(key, JSON.stringify(insights));
    }
  }

  /**
   * Delete an insight
   */
  async deleteInsight(insightId: string): Promise<void> {
    const insights = await this.getInsights();
    const filtered = insights.filter(i => i.id !== insightId);
    const key = await this.getStorageKey('actionable_insights');
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  /**
   * Get insights by status
   */
  async getInsightsByStatus(status: ActionableInsight['status']): Promise<ActionableInsight[]> {
    const insights = await this.getInsights();
    return insights.filter(i => i.status === status);
  }

  /**
   * Get progress for an insight
   */
  async getProgress(insightId: string): Promise<InsightProgress | null> {
    try {
      const key = await this.getStorageKey('insight_progress');
      const stored = localStorage.getItem(key);
      const allProgress: InsightProgress[] = stored ? JSON.parse(stored) : [];
      return allProgress.find(p => p.insightId === insightId) || null;
    } catch (error) {
      console.error('Error loading progress:', error);
      return null;
    }
  }

  /**
   * Record an attempt at an insight
   */
  async recordAttempt(
    insightId: string,
    success: boolean,
    effectiveness?: number,
    note?: string
  ): Promise<void> {
    try {
      const key = await this.getStorageKey('insight_progress');
      const stored = localStorage.getItem(key);
      const allProgress: InsightProgress[] = stored ? JSON.parse(stored) : [];
      
      let progress = allProgress.find(p => p.insightId === insightId);
      
      if (!progress) {
        progress = {
          insightId,
          attempts: 0,
          lastAttemptDate: new Date().toISOString(),
          successCount: 0,
          totalAttempts: 0,
          effectiveness: 0,
          userNotes: []
        };
        allProgress.push(progress);
      }
      
      progress.attempts++;
      progress.totalAttempts++;
      progress.lastAttemptDate = new Date().toISOString();
      
      if (success) {
        progress.successCount++;
      }
      
      if (effectiveness) {
        // Update running average of effectiveness
        const oldWeight = progress.totalAttempts - 1;
        progress.effectiveness = (progress.effectiveness * oldWeight + effectiveness) / progress.totalAttempts;
      }
      
      if (note) {
        progress.userNotes.push(`${new Date().toLocaleDateString()}: ${note}`);
        // Keep only last 10 notes
        if (progress.userNotes.length > 10) {
          progress.userNotes = progress.userNotes.slice(-10);
        }
      }
      
      localStorage.setItem(key, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error recording attempt:', error);
    }
  }

  /**
   * Generate suggested insights from AI analysis
   */
  async generateSuggestionsFromAnalysis(aiInsights: any, entryId: string): Promise<ActionableInsight[]> {
    const suggestions: Omit<ActionableInsight, 'id' | 'createdAt'>[] = [];
    
    // Extract pattern context for richer descriptions
    const patternContext = this.extractPatternContext(aiInsights);
    
    // Parse coping strategies with enhanced descriptions
    if (aiInsights?.coping_strategies?.suggested) {
      aiInsights.coping_strategies.suggested.forEach((strategy: any) => {
        const strategyText = strategy.strategy || strategy;
        const enhancedDescription = this.createEnhancedDescription(
          strategy.why_it_helps || strategyText,
          patternContext,
          strategyText
        );
        
        suggestions.push({
          title: strategyText,
          description: enhancedDescription,
          category: this.categorizeSuggestion(strategyText),
          difficulty: this.estimateDifficulty(strategyText),
          estimatedTime: this.estimateTime(strategyText),
          source: 'ai_suggested',
          sourceEntryId: entryId,
          status: 'suggested'
        });
      });
    }
    
    // Save all suggestions and return them
    const savedSuggestions: ActionableInsight[] = [];
    for (const suggestion of suggestions) {
      const saved = await this.saveInsight(suggestion);
      savedSuggestions.push(saved);
    }
    return savedSuggestions;
  }

  /**
   * Extract pattern context from AI insights
   */
  private extractPatternContext(aiInsights: any): string {
    const contexts: string[] = [];
    
    // Extract primary emotion
    if (aiInsights?.mood_analysis?.primary_emotion) {
      contexts.push(`feeling ${aiInsights.mood_analysis.primary_emotion}`);
    }
    
    // Extract key patterns
    if (aiInsights?.patterns?.recurring) {
      const patterns = Array.isArray(aiInsights.patterns.recurring) 
        ? aiInsights.patterns.recurring 
        : [aiInsights.patterns.recurring];
      contexts.push(...patterns.slice(0, 2));
    }
    
    // Extract triggers
    if (aiInsights?.triggers?.identified) {
      const triggers = Array.isArray(aiInsights.triggers.identified)
        ? aiInsights.triggers.identified
        : [aiInsights.triggers.identified];
      contexts.push(...triggers.slice(0, 1));
    }
    
    return contexts.join(', ');
  }

  /**
   * Create enhanced description with pattern details
   */
  private createEnhancedDescription(baseDescription: string, patternContext: string, strategyTitle: string): string {
    // If we have pattern context, make it actionable
    if (patternContext) {
      // Check if base description already contains good detail
      if (baseDescription.length > 50 && !baseDescription.includes('AI-suggested')) {
        return `${baseDescription}${patternContext ? ` This addresses patterns around ${patternContext}.` : ''}`;
      }
      
      // Create more specific description based on strategy type
      const lower = strategyTitle.toLowerCase();
      
      if (lower.includes('exercise') || lower.includes('walk') || lower.includes('movement')) {
        return `Physical activity can help regulate emotions and reduce stress. ${patternContext ? `Particularly helpful when ${patternContext}.` : ''} Start with 10-15 minutes of gentle movement.`;
      }
      if (lower.includes('breathe') || lower.includes('breathing')) {
        return `Breathing exercises activate your parasympathetic nervous system, helping you feel calmer. ${patternContext ? `Especially useful when ${patternContext}.` : ''} Try 4-7-8 breathing: inhale for 4, hold for 7, exhale for 8.`;
      }
      if (lower.includes('meditat') || lower.includes('mindful')) {
        return `Mindfulness helps you observe thoughts without judgment, creating mental space. ${patternContext ? `Can help you process experiences around ${patternContext}.` : ''} Start with just 5 minutes.`;
      }
      if (lower.includes('journal') || lower.includes('write')) {
        return `Writing helps externalize thoughts and gain perspective. ${patternContext ? `Particularly valuable for processing ${patternContext}.` : ''} Try free-writing for 10 minutes without editing.`;
      }
      if (lower.includes('friend') || lower.includes('talk') || lower.includes('social')) {
        return `Social connection provides support and different perspectives. ${patternContext ? `Reaching out can help when ${patternContext}.` : ''} Even a brief conversation can help.`;
      }
      if (lower.includes('sleep') || lower.includes('rest')) {
        return `Quality rest helps emotional regulation and mental clarity. ${patternContext ? `Important for managing ${patternContext}.` : ''} Aim for consistent sleep schedule.`;
      }
      
      // Default enhanced description
      return `${baseDescription || strategyTitle}${patternContext ? ` This can help with ${patternContext}.` : ' Try this approach when you need support.'}`;
    }
    
    return baseDescription || 'AI-suggested strategy based on your entry';
  }

  /**
   * Estimate difficulty based on strategy type
   */
  private estimateDifficulty(strategy: string): ActionableInsight['difficulty'] {
    const lower = strategy.toLowerCase();
    
    // Easy strategies
    if (lower.includes('breathe') || lower.includes('breathing') || 
        lower.includes('listen to music') || lower.includes('take a break')) {
      return 'easy';
    }
    
    // Challenging strategies
    if (lower.includes('therapy') || lower.includes('confront') || 
        lower.includes('difficult conversation') || lower.includes('intensive')) {
      return 'challenging';
    }
    
    // Default to moderate
    return 'moderate';
  }

  /**
   * Estimate time based on strategy type
   */
  private estimateTime(strategy: string): string {
    const lower = strategy.toLowerCase();
    
    if (lower.includes('quick') || lower.includes('brief') || lower.includes('breathing')) {
      return '5 minutes';
    }
    if (lower.includes('walk') || lower.includes('exercise')) {
      return '15-20 minutes';
    }
    if (lower.includes('journal') || lower.includes('write')) {
      return '10-15 minutes';
    }
    if (lower.includes('meditation') || lower.includes('mindfulness')) {
      return '10-20 minutes';
    }
    
    return '10-15 minutes';
  }

  /**
   * Categorize a suggestion based on keywords
   */
  private categorizeSuggestion(text: string): ActionableInsight['category'] {
    const lower = text.toLowerCase();
    
    if (lower.includes('exercise') || lower.includes('walk') || lower.includes('yoga') || lower.includes('movement')) {
      return 'exercise';
    }
    if (lower.includes('breathe') || lower.includes('meditat') || lower.includes('mindful')) {
      return 'mindfulness';
    }
    if (lower.includes('sleep') || lower.includes('rest') || lower.includes('nap')) {
      return 'sleep';
    }
    if (lower.includes('friend') || lower.includes('talk') || lower.includes('social') || lower.includes('connect')) {
      return 'social';
    }
    if (lower.includes('eat') || lower.includes('food') || lower.includes('nutrition') || lower.includes('meal')) {
      return 'nutrition';
    }
    if (lower.includes('journal') || lower.includes('write') || lower.includes('express') || lower.includes('cope')) {
      return 'coping';
    }
    
    return 'general';
  }

  /**
   * Get category emoji
   */
  getCategoryEmoji(category: ActionableInsight['category']): string {
    const emojis = {
      coping: '💪',
      exercise: '🏃',
      social: '👥',
      mindfulness: '🧘',
      sleep: '😴',
      nutrition: '🥗',
      general: '✨'
    };
    return emojis[category];
  }

  /**
   * Get category label
   */
  getCategoryLabel(category: ActionableInsight['category']): string {
    const labels = {
      coping: 'Coping Strategy',
      exercise: 'Physical Activity',
      social: 'Social Connection',
      mindfulness: 'Mindfulness',
      sleep: 'Sleep & Rest',
      nutrition: 'Nutrition',
      general: 'General Wellness'
    };
    return labels[category];
  }

  /**
   * Get difficulty color
   */
  getDifficultyColor(difficulty: ActionableInsight['difficulty']): string {
    const colors = {
      easy: '#22c55e',
      moderate: '#f59e0b',
      challenging: '#ef4444'
    };
    return colors[difficulty];
  }
}

export const actionableInsightsService = new ActionableInsightsService();
