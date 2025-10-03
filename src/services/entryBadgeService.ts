// Entry Badge Service
// Determines visual indicators (colored dots, theme icons) for sidebar entries

import type { DiaryEntry } from '../types/diary';

export type SentimentColor = 'green' | 'amber' | 'blue' | 'gray';
export type ThemeIcon = 'coffee' | 'anxiety' | 'coping' | 'exercise' | 'sleep' | 'achievement';

export interface EntryBadge {
  sentimentColor: SentimentColor;
  themeIcons: ThemeIcon[];
  isAnalyzed: boolean;
}

class EntryBadgeService {
  /**
   * Determine sentiment color based on entry content and analysis
   */
  private determineSentimentColor(entry: DiaryEntry): SentimentColor {
    // If entry has AI analysis, use that
    if (entry.ai_structured_insights?.mood_analysis) {
      const primaryEmotion = entry.ai_structured_insights.mood_analysis.primary_emotion?.toLowerCase() || '';
      const intensity = entry.ai_structured_insights.mood_analysis.intensity || 5;
      
      // Positive emotions
      if (primaryEmotion.includes('happy') || primaryEmotion.includes('joy') || 
          primaryEmotion.includes('excited') || primaryEmotion.includes('grateful') ||
          primaryEmotion.includes('content')) {
        return 'green';
      }
      
      // Reflective/calm emotions
      if (primaryEmotion.includes('calm') || primaryEmotion.includes('peaceful') || 
          primaryEmotion.includes('reflective') || primaryEmotion.includes('neutral')) {
        return 'blue';
      }
      
      // Mixed/neutral with moderate intensity
      if (intensity >= 4 && intensity <= 6) {
        return 'amber';
      }
      
      // Low energy/difficult
      if (primaryEmotion.includes('sad') || primaryEmotion.includes('anxious') || 
          primaryEmotion.includes('stressed') || primaryEmotion.includes('overwhelmed') ||
          primaryEmotion.includes('tired') || primaryEmotion.includes('frustrated')) {
        return 'gray';
      }
    }
    
    // Fallback: basic content analysis
    const content = entry.content?.toLowerCase() || '';
    
    // Check for positive keywords
    const positiveWords = ['happy', 'great', 'good', 'wonderful', 'excited', 'grateful', 'proud', 'love', 'joy'];
    const negativeWords = ['sad', 'anxious', 'stressed', 'tired', 'worried', 'angry', 'frustrated', 'difficult'];
    const calmWords = ['calm', 'peaceful', 'reflect', 'quiet', 'serene'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    let calmCount = 0;
    
    positiveWords.forEach(word => {
      if (content.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (content.includes(word)) negativeCount++;
    });
    
    calmWords.forEach(word => {
      if (content.includes(word)) calmCount++;
    });
    
    if (positiveCount > negativeCount && positiveCount > 0) return 'green';
    if (calmCount > 0 && negativeCount === 0) return 'blue';
    if (negativeCount > positiveCount) return 'gray';
    
    return 'amber'; // Default mixed/neutral
  }

  /**
   * Extract theme icons based on entry content and analysis
   * Returns up to 3 most relevant theme icons
   */
  private extractThemeIcons(entry: DiaryEntry): ThemeIcon[] {
    const icons: ThemeIcon[] = [];
    const content = entry.content?.toLowerCase() || '';
    
    // Check for caffeine mentions
    if (content.includes('coffee') || content.includes('caffeine') || 
        content.includes('tea') || content.includes('energy drink')) {
      icons.push('coffee');
    }
    
    // Check for anxiety/stress
    if (content.includes('anxiety') || content.includes('anxious') || 
        content.includes('stress') || content.includes('worried') ||
        content.includes('overwhelmed') || content.includes('panic')) {
      icons.push('anxiety');
    }
    
    // Check for coping strategies
    if (content.includes('meditation') || content.includes('breathing') || 
        content.includes('therapy') || content.includes('talked') ||
        content.includes('journaling') || content.includes('mindful')) {
      icons.push('coping');
    }
    
    // Check for exercise/movement
    if (content.includes('exercise') || content.includes('workout') || 
        content.includes('run') || content.includes('gym') ||
        content.includes('walk') || content.includes('yoga')) {
      icons.push('exercise');
    }
    
    // Check for sleep issues
    if (content.includes('sleep') || content.includes('tired') || 
        content.includes('exhausted') || content.includes('insomnia') ||
        content.includes('fatigue')) {
      icons.push('sleep');
    }
    
    // Check for achievements/wins
    if (content.includes('proud') || content.includes('achieved') || 
        content.includes('accomplished') || content.includes('success') ||
        content.includes('win') || content.includes('breakthrough')) {
      icons.push('achievement');
    }
    
    // Return max 3 icons, prioritize based on significance
    return icons.slice(0, 3);
  }

  /**
   * Generate badge data for an entry
   */
  getBadgeForEntry(entry: DiaryEntry): EntryBadge {
    return {
      sentimentColor: this.determineSentimentColor(entry),
      themeIcons: this.extractThemeIcons(entry),
      isAnalyzed: !!entry.isAnalyzed || !!entry.ai_structured_insights
    };
  }

  /**
   * Get color hex code for sentiment
   */
  getSentimentColorHex(color: SentimentColor): string {
    const colors = {
      green: '#22c55e',
      amber: '#f59e0b',
      blue: '#3b82f6',
      gray: '#6b7280'
    };
    return colors[color];
  }

  /**
   * Get emoji for theme icon
   */
  getThemeEmoji(icon: ThemeIcon): string {
    const emojis = {
      coffee: '☕',
      anxiety: '😰',
      coping: '💪',
      exercise: '🏃',
      sleep: '😴',
      achievement: '✨'
    };
    return emojis[icon];
  }

  /**
   * Get label for theme icon (for tooltips)
   */
  getThemeLabel(icon: ThemeIcon): string {
    const labels = {
      coffee: 'Caffeine',
      anxiety: 'Anxiety/Stress',
      coping: 'Coping Strategy',
      exercise: 'Exercise',
      sleep: 'Sleep',
      achievement: 'Achievement'
    };
    return labels[icon];
  }
}

export const entryBadgeService = new EntryBadgeService();
