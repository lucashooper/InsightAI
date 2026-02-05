// Mood indicator utilities for journal entries
// Extracts emoji and color based on AI analysis

export type MoodSentiment = 'positive' | 'neutral' | 'negative';

export interface MoodIndicator {
  emoji: string;
  color: string;
  sentiment: MoodSentiment;
}

// Map emotions to emojis and colors
const EMOTION_MAP: Record<string, MoodIndicator> = {
  // Positive emotions
  happy: { emoji: '😊', color: '#10b981', sentiment: 'positive' },
  joyful: { emoji: '😄', color: '#10b981', sentiment: 'positive' },
  excited: { emoji: '🤩', color: '#10b981', sentiment: 'positive' },
  grateful: { emoji: '🙏', color: '#10b981', sentiment: 'positive' },
  content: { emoji: '😌', color: '#10b981', sentiment: 'positive' },
  peaceful: { emoji: '😇', color: '#10b981', sentiment: 'positive' },
  hopeful: { emoji: '🌟', color: '#10b981', sentiment: 'positive' },
  proud: { emoji: '💪', color: '#10b981', sentiment: 'positive' },
  relieved: { emoji: '😮‍💨', color: '#10b981', sentiment: 'positive' },
  confident: { emoji: '😎', color: '#10b981', sentiment: 'positive' },
  
  // Neutral emotions
  calm: { emoji: '😐', color: '#f59e0b', sentiment: 'neutral' },
  neutral: { emoji: '😐', color: '#f59e0b', sentiment: 'neutral' },
  thoughtful: { emoji: '🤔', color: '#f59e0b', sentiment: 'neutral' },
  reflective: { emoji: '💭', color: '#f59e0b', sentiment: 'neutral' },
  curious: { emoji: '🧐', color: '#f59e0b', sentiment: 'neutral' },
  tired: { emoji: '😴', color: '#f59e0b', sentiment: 'neutral' },
  bored: { emoji: '😑', color: '#f59e0b', sentiment: 'neutral' },
  
  // Negative emotions
  sad: { emoji: '😢', color: '#ef4444', sentiment: 'negative' },
  anxious: { emoji: '😰', color: '#ef4444', sentiment: 'negative' },
  stressed: { emoji: '😫', color: '#ef4444', sentiment: 'negative' },
  worried: { emoji: '😟', color: '#ef4444', sentiment: 'negative' },
  frustrated: { emoji: '😤', color: '#ef4444', sentiment: 'negative' },
  angry: { emoji: '😠', color: '#ef4444', sentiment: 'negative' },
  overwhelmed: { emoji: '😵', color: '#ef4444', sentiment: 'negative' },
  lonely: { emoji: '😔', color: '#ef4444', sentiment: 'negative' },
  disappointed: { emoji: '😞', color: '#ef4444', sentiment: 'negative' },
  fearful: { emoji: '😨', color: '#ef4444', sentiment: 'negative' },
  guilty: { emoji: '😣', color: '#ef4444', sentiment: 'negative' },
  ashamed: { emoji: '😳', color: '#ef4444', sentiment: 'negative' },
};

// Default indicator when no emotion is detected
const DEFAULT_INDICATOR: MoodIndicator = {
  emoji: '📝',
  color: '#6b7280',
  sentiment: 'neutral',
};

/**
 * Extract mood indicator from AI analysis
 */
export function getMoodIndicator(aiAnalysis: any): MoodIndicator | null {
  if (!aiAnalysis) return null;

  // Try to get primary emotion from mood_analysis
  const primaryEmotion = aiAnalysis.mood_analysis?.primary_emotion;
  
  if (primaryEmotion) {
    const normalized = primaryEmotion.toLowerCase().trim();
    
    // Direct match
    if (EMOTION_MAP[normalized]) {
      return EMOTION_MAP[normalized];
    }
    
    // Partial match (e.g., "feeling anxious" -> "anxious")
    for (const [emotion, indicator] of Object.entries(EMOTION_MAP)) {
      if (normalized.includes(emotion)) {
        return indicator;
      }
    }
  }

  // Fallback: use wellbeing score if available
  const wellbeingScore = aiAnalysis.wellbeingScore;
  if (wellbeingScore !== undefined) {
    if (wellbeingScore >= 7) {
      return { emoji: '😊', color: '#10b981', sentiment: 'positive' };
    } else if (wellbeingScore >= 4) {
      return { emoji: '😐', color: '#f59e0b', sentiment: 'neutral' };
    } else {
      return { emoji: '😔', color: '#ef4444', sentiment: 'negative' };
    }
  }

  return DEFAULT_INDICATOR;
}

/**
 * Get color for sentiment (for entries without full AI analysis)
 */
export function getSentimentColor(sentiment: MoodSentiment): string {
  switch (sentiment) {
    case 'positive':
      return '#10b981';
    case 'neutral':
      return '#f59e0b';
    case 'negative':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}
