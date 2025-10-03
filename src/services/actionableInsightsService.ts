// Actionable Insights Service
// Manages personal playbook of mental health strategies

import type { ActionableInsight, InsightProgress } from '../types/actionableInsight';

const STORAGE_KEY_INSIGHTS = 'insightai_actionable_insights';
const STORAGE_KEY_PROGRESS = 'insightai_insight_progress';

class ActionableInsightsService {
  /**
   * Get all actionable insights
   */
  getInsights(): ActionableInsight[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INSIGHTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading actionable insights:', error);
      return [];
    }
  }

  /**
   * Save an actionable insight
   */
  saveInsight(insight: Omit<ActionableInsight, 'id' | 'createdAt'>): ActionableInsight {
    const insights = this.getInsights();
    const newInsight: ActionableInsight = {
      ...insight,
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    insights.push(newInsight);
    localStorage.setItem(STORAGE_KEY_INSIGHTS, JSON.stringify(insights));
    return newInsight;
  }

  /**
   * Update insight status
   */
  updateInsightStatus(
    insightId: string, 
    status: ActionableInsight['status'],
    notes?: string
  ): void {
    const insights = this.getInsights();
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
      
      localStorage.setItem(STORAGE_KEY_INSIGHTS, JSON.stringify(insights));
    }
  }

  /**
   * Delete an insight
   */
  deleteInsight(insightId: string): void {
    const insights = this.getInsights();
    const filtered = insights.filter(i => i.id !== insightId);
    localStorage.setItem(STORAGE_KEY_INSIGHTS, JSON.stringify(filtered));
  }

  /**
   * Get insights by status
   */
  getInsightsByStatus(status: ActionableInsight['status']): ActionableInsight[] {
    return this.getInsights().filter(i => i.status === status);
  }

  /**
   * Get progress for an insight
   */
  getProgress(insightId: string): InsightProgress | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROGRESS);
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
  recordAttempt(
    insightId: string,
    success: boolean,
    effectiveness?: number,
    note?: string
  ): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROGRESS);
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
      
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error recording attempt:', error);
    }
  }

  /**
   * Generate suggested insights from AI analysis
   */
  generateSuggestionsFromAnalysis(aiInsights: any, entryId: string): ActionableInsight[] {
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
    
    return suggestions.map(s => this.saveInsight(s));
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
