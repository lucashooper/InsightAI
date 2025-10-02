export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  ai_analysis?: any;
  ai_response_text?: string;
  ai_structured_insights?: any;
  ai_last_analyzed?: string;
  ai_insights?: any;
  insights_report?: {
    conversationalSummary: string;
    keyTakeaways: Array<{
      insight: string;
      sentiment: "positive" | "opportunity";
      category: string;
    }>;
    actionableSuggestion: {
      title: string;
      suggestion: string;
    };
  };
}

export interface MoodDataPoint {
  date: string;
  intensity: number;
  noteTitle?: string;
}

export interface AIAnalysis {
  mood: string;
  themes: string[];
  triggers: string[];
  suggestions: string[];
  thought_loops: string[];
}

// Removed unused EnhancedAIAnalysis type import

export type AlertType = 'THEME_STREAK' | 'HISTORICAL_SIMILARITY' | 'MOOD_PATTERN' | 'TRIGGER_PATTERN';

export interface PatternAlert {
  id: string;
  created_at: string;
  user_id: string;
  alert_type: AlertType;
  alert_text: string;
  related_note_ids: string[];
  is_read: boolean;
} 