export type MoodTier = 'terrible' | 'struggling' | 'neutral' | 'good' | 'amazing';

export type MoodStop = {
  score: number;
  tier: MoodTier;
  label: string;
};

export const MOOD_STOPS: MoodStop[] = [
  { score: 1, tier: 'terrible', label: 'Terrible' },
  { score: 2, tier: 'struggling', label: 'Struggling' },
  { score: 3, tier: 'neutral', label: 'Neutral' },
  { score: 4, tier: 'good', label: 'Good' },
  { score: 5, tier: 'amazing', label: 'Amazing' },
];

export type CheckInStep = 'mood' | 'feelings' | 'context' | 'journal';

export type CheckInDraft = {
  moodScore: number;
  moodLabel: string;
  moodTier: MoodTier;
  feelings: string[];
  withWho: string[];
  whereAt: string[];
  doing: string[];
};

export const EMPTY_CHECK_IN: CheckInDraft = {
  moodScore: 3,
  moodLabel: 'Neutral',
  moodTier: 'neutral',
  feelings: [],
  withWho: [],
  whereAt: [],
  doing: [],
};

export type TagCategory = 'who' | 'where' | 'doing';

export function scoreToStop(score: number): MoodStop {
  const clamped = Math.max(1, Math.min(5, Math.round(score)));
  return MOOD_STOPS.find((s) => s.score === clamped) || MOOD_STOPS[2];
}

export function tierIsNegative(tier: MoodTier): boolean {
  return tier === 'terrible' || tier === 'struggling';
}

export function tierIsPositive(tier: MoodTier): boolean {
  return tier === 'good' || tier === 'amazing';
}
