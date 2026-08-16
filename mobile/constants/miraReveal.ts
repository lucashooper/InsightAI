/**
 * Mira discovery / reveal-card types and prompt catalog.
 * Shared chassis for all "gotcha" reveal kinds.
 */

export type MiraRevealType =
  | 'biggest_strength'
  | 'biggest_weakness'
  | 'hidden_trait'
  | 'blind_spot'
  | 'emotional_trigger'
  | 'biggest_improvement'
  | 'growth_opportunity'
  | 'recurring_pattern'
  | 'insufficient_data';

export interface MiraRevealPayload {
  type: MiraRevealType;
  /** Category label shown above the answer, e.g. "Biggest Weakness" */
  headline: string;
  /** Short punchy answer, e.g. "Overthinking" */
  answer: string;
  /**
   * 0–100 when evidence is countable and strong.
   * null when precision would be dishonest.
   */
  confidence: number | null;
  /** 2–4 evidence bullets grounded in journal history */
  evidence: string[];
  /** One concrete recommendation */
  recommendation: string;
  /** Conversational explanation (shown under the card / Explore Why) */
  explanation: string;
}

export interface DiscoveryPrompt {
  id: string;
  /** Short chip label shown on discovery landing */
  label: string;
  /** Full question sent to Mira */
  text: string;
  /** Preferred reveal type for the model */
  preferredType: MiraRevealType;
}

/** Primary discovery prompts for Mira empty state (non-roast). */
export const DISCOVERY_PROMPTS: DiscoveryPrompt[] = [
  {
    id: 'strength',
    label: 'Your Biggest Strength',
    text: "What's my greatest strength?",
    preferredType: 'biggest_strength',
  },
  {
    id: 'weakness',
    label: 'Your Biggest Weakness',
    text: "What's my biggest weakness?",
    preferredType: 'biggest_weakness',
  },
  {
    id: 'blind',
    label: 'Your Blind Spots',
    text: 'What is my biggest blind spot?',
    preferredType: 'blind_spot',
  },
  {
    id: 'pattern',
    label: 'Emotional Pattern',
    text: 'What emotional pattern keeps repeating?',
    preferredType: 'recurring_pattern',
  },
  {
    id: 'opportunity',
    label: 'Biggest Opportunity',
    text: 'What should I focus on next?',
    preferredType: 'growth_opportunity',
  },
  {
    id: 'surprise',
    label: 'What surprised you about me?',
    text: 'What surprises you about me?',
    preferredType: 'hidden_trait',
  },
];

/** First Mira screen — three heroes only */
export const DISCOVERY_PROMPTS_FEATURED = DISCOVERY_PROMPTS.slice(0, 3);

/** Remaining prompts behind "See all insights" */
export const DISCOVERY_PROMPTS_MORE = DISCOVERY_PROMPTS.slice(3);

/** Three prompts that rotate daily — fresh feel without expand/collapse UI. */
export function getDailyDiscoveryPrompts(date = new Date()): DiscoveryPrompt[] {
  const daySeed =
    date.getFullYear() * 1000 + date.getMonth() * 31 + date.getDate();
  const pool = [...DISCOVERY_PROMPTS];
  const picked: DiscoveryPrompt[] = [];
  let seed = daySeed;
  while (picked.length < 3 && pool.length > 0) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const index = seed % pool.length;
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

export const REVEAL_TYPE_LABELS: Record<MiraRevealType, string> = {
  biggest_strength: 'Biggest Strength',
  biggest_weakness: 'Biggest Weakness',
  hidden_trait: 'Hidden Trait',
  blind_spot: 'Blind Spot',
  emotional_trigger: 'Emotional Trigger',
  biggest_improvement: 'Biggest Improvement',
  growth_opportunity: 'Growth Opportunity',
  recurring_pattern: 'Recurring Pattern',
  insufficient_data: 'Still Learning',
};

/** Ambient glow tint per reveal type (premium accent). */
export const REVEAL_GLOW: Record<MiraRevealType, string> = {
  biggest_strength: 'rgba(139, 92, 246, 0.20)',
  biggest_weakness: 'rgba(139, 92, 246, 0.14)',
  hidden_trait: 'rgba(167, 139, 250, 0.18)',
  blind_spot: 'rgba(99, 102, 241, 0.16)',
  emotional_trigger: 'rgba(244, 114, 182, 0.14)',
  biggest_improvement: 'rgba(52, 211, 153, 0.14)',
  growth_opportunity: 'rgba(139, 92, 246, 0.18)',
  recurring_pattern: 'rgba(139, 92, 246, 0.14)',
  insufficient_data: 'rgba(255,255,255,0.06)',
};

export const ANALYSIS_STATUS_LINES = [
  'Insight is analysing your journal…',
  'Reviewing recurring patterns…',
  'Finding supporting evidence…',
];
