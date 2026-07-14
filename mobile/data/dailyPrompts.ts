import { promptTranslations } from '../i18n/features/prompts';
import { getCurrentLanguage } from '../i18n/languageRef';
import { TranslationTree } from '../i18n/types';

export interface DailyPrompt {
  id: string;
  category: 'self-discovery' | 'gratitude' | 'reflection' | 'growth' | 'relationships' | 'mindfulness';
  prompt: string;
  followUp?: string;
  emoji: string;
}

type PromptDefinition = Pick<DailyPrompt, 'id' | 'category' | 'emoji'>;

const promptDefinitions: PromptDefinition[] = [
  // Self-Discovery
  { id: 'sd1', category: 'self-discovery', emoji: '🔮' },
  { id: 'sd2', category: 'self-discovery', emoji: '✨' },
  { id: 'sd3', category: 'self-discovery', emoji: '🪞' },
  { id: 'sd4', category: 'self-discovery', emoji: '💌' },
  { id: 'sd5', category: 'self-discovery', emoji: '💎' },
  { id: 'sd6', category: 'self-discovery', emoji: '🎭' },
  { id: 'sd7', category: 'self-discovery', emoji: '🦋' },

  // Gratitude
  { id: 'gr1', category: 'gratitude', emoji: '😊' },
  { id: 'gr2', category: 'gratitude', emoji: '💛' },
  { id: 'gr3', category: 'gratitude', emoji: '☀️' },
  { id: 'gr4', category: 'gratitude', emoji: '🙏' },
  { id: 'gr5', category: 'gratitude', emoji: '🌱' },

  // Reflection
  { id: 'rf1', category: 'reflection', emoji: '🧠' },
  { id: 'rf2', category: 'reflection', emoji: '🌊' },
  { id: 'rf3', category: 'reflection', emoji: '🔄' },
  { id: 'rf4', category: 'reflection', emoji: '🕊️' },
  { id: 'rf5', category: 'reflection', emoji: '🔁' },
  { id: 'rf6', category: 'reflection', emoji: '⚡' },

  // Growth
  { id: 'gw1', category: 'growth', emoji: '🎯' },
  { id: 'gw2', category: 'growth', emoji: '📚' },
  { id: 'gw3', category: 'growth', emoji: '🦁' },
  { id: 'gw4', category: 'growth', emoji: '🗺️' },
  { id: 'gw5', category: 'growth', emoji: '🏗️' },

  // Relationships
  { id: 'rl1', category: 'relationships', emoji: '👥' },
  { id: 'rl2', category: 'relationships', emoji: '💬' },
  { id: 'rl3', category: 'relationships', emoji: '🗣️' },
  { id: 'rl4', category: 'relationships', emoji: '🤝' },

  // Mindfulness
  { id: 'mf1', category: 'mindfulness', emoji: '👁️' },
  { id: 'mf2', category: 'mindfulness', emoji: '🧘' },
  { id: 'mf3', category: 'mindfulness', emoji: '🌸' },
  { id: 'mf4', category: 'mindfulness', emoji: '🍃' },
  { id: 'mf5', category: 'mindfulness', emoji: '🌬️' },
];

function asTranslationTree(value: string | TranslationTree | undefined): TranslationTree | undefined {
  return value && typeof value !== 'string' ? value : undefined;
}

function getPromptCopy(id: string): Pick<DailyPrompt, 'prompt' | 'followUp'> {
  const language = getCurrentLanguage();
  const localized = asTranslationTree(promptTranslations[language]?.[id]);
  const english = asTranslationTree(promptTranslations.en?.[id]);
  const prompt = localized?.prompt ?? english?.prompt;
  const followUp = localized?.followUp ?? english?.followUp;

  return {
    prompt: typeof prompt === 'string' ? prompt : id,
    followUp: typeof followUp === 'string' ? followUp : undefined,
  };
}

const prompts: DailyPrompt[] = promptDefinitions.map((definition) => ({
  ...definition,
  get prompt() {
    return getPromptCopy(definition.id).prompt;
  },
  get followUp() {
    return getPromptCopy(definition.id).followUp;
  },
}));

/**
 * Get today's daily prompt. Uses the day of year as a seed
 * so every user gets the same prompt on the same day,
 * but it rotates through the full list over time.
 */
export function getTodayPrompt(): DailyPrompt {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return prompts[dayOfYear % prompts.length];
}

/**
 * Get a random prompt from a specific category.
 */
export function getPromptByCategory(category: DailyPrompt['category']): DailyPrompt {
  const filtered = prompts.filter(p => p.category === category);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export default prompts;
