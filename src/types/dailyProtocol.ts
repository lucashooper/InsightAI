// Daily Protocol Types
// Tracks recurring daily habits/strategies with streak tracking

export interface DailyProtocol {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'morning' | 'afternoon' | 'evening' | 'anytime';
  estimatedTime: string;
  createdAt: string;
  isActive: boolean;
}

export interface DailyCompletion {
  protocolId: string;
  date: string; // YYYY-MM-DD format
  completedAt: string; // ISO timestamp
}

export interface ProtocolStats {
  protocolId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // percentage
  lastCompletedDate: string | null;
}
