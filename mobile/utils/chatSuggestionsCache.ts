import { InteractionManager } from 'react-native';
import { mobileAiService } from '../services/mobileAiService';
import { yieldToUI } from './yieldToUI';

const FALLBACK_SUGGESTIONS = [
  'How have I been feeling lately?',
  'What patterns do you notice?',
  'What should I focus on this week?',
  'Help me reflect on my entries',
];

let cachedUserId: string | null = null;
let cachedSuggestions: string[] = FALLBACK_SUGGESTIONS;
let prewarmGen = 0;

export function getCachedChatSuggestions(userId: string): string[] {
  if (cachedUserId === userId && cachedSuggestions.length > 0) {
    return cachedSuggestions;
  }
  return FALLBACK_SUGGESTIONS;
}

export function setCachedChatSuggestions(userId: string, suggestions: string[]) {
  if (!suggestions.length) return;
  cachedUserId = userId;
  cachedSuggestions = suggestions;
}

export function clearChatSuggestionsCache() {
  cachedUserId = null;
  cachedSuggestions = FALLBACK_SUGGESTIONS;
}

/** Pre-fetch chat suggestions after preload so Companion opens instantly. */
export function prewarmChatSuggestions(userId: string) {
  const gen = ++prewarmGen;

  InteractionManager.runAfterInteractions(async () => {
    await yieldToUI();
    if (gen !== prewarmGen) return;

    try {
      const suggestions = await mobileAiService.getChatSuggestions();
      if (gen !== prewarmGen) return;
      setCachedChatSuggestions(userId, suggestions);
      console.log('[AIChat:Cache] Prewarmed', suggestions.length, 'suggestions');
    } catch (e) {
      console.warn('[AIChat:Cache] Prewarm failed, using fallbacks');
    }
  });
}
