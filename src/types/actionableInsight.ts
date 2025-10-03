// Actionable Insight Types
// Tracks user's personal playbook of mental health strategies

export interface ActionableInsight {
  id: string;
  title: string;
  description: string;
  category: 'coping' | 'exercise' | 'social' | 'mindfulness' | 'sleep' | 'nutrition' | 'general';
  difficulty: 'easy' | 'moderate' | 'challenging';
  estimatedTime: string; // e.g., "5 minutes", "30 minutes"
  source: 'ai_suggested' | 'user_created' | 'comparison_insight';
  sourceEntryId?: string; // Reference to diary entry that suggested this
  createdAt: string;
  status: 'suggested' | 'active' | 'completed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface InsightProgress {
  insightId: string;
  attempts: number;
  lastAttemptDate: string;
  successCount: number;
  totalAttempts: number;
  effectiveness: number; // 1-5 rating
  userNotes: string[];
}
