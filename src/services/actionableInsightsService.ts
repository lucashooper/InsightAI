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
    
    // Parse coping strategies
    if (aiInsights?.coping_strategies?.suggested) {
      aiInsights.coping_strategies.suggested.forEach((strategy: any) => {
        suggestions.push({
          title: strategy.strategy || strategy,
          description: strategy.why_it_helps || 'AI-suggested coping strategy based on your entry',
          category: this.categorizeSuggestion(strategy.strategy || strategy),
          difficulty: 'moderate',
          estimatedTime: '10-15 minutes',
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
