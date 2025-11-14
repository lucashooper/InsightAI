export interface DiaryEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  is_encrypted?: boolean;
  ai_analysis?: string;
  ai_insights?: AIInsight[];
}

export interface AIInsight {
  type: 'emotion' | 'pattern' | 'suggestion' | 'question';
  content: string;
  confidence?: number;
}

export interface MoodEntry {
  mood: string;
  timestamp: string;
  note?: string;
}
