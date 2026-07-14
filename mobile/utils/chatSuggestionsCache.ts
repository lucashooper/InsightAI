import { InteractionManager } from 'react-native';
import { mobileAiService } from '../services/mobileAiService';
import { yieldToUI } from './yieldToUI';
import { getCurrentLanguage } from '../i18n/languageRef';
import { translate } from '../i18n';

function fallbackSuggestions() {
  const language = getCurrentLanguage();
  return [
    'companion.suggestionFeeling',
    'companion.suggestionPatterns',
    'companion.suggestionFocus',
    'companion.suggestionReflect',
  ].map((key) => translate(language, key));
}

let cachedKey: string | null = null;
let cachedSuggestions: string[] = fallbackSuggestions();
let prewarmGen = 0;

export function getCachedChatSuggestions(userId: string): string[] {
  const key = `${userId}:${getCurrentLanguage()}`;
  if (cachedKey === key && cachedSuggestions.length > 0) {
    return cachedSuggestions;
  }
  return fallbackSuggestions();
}

export function setCachedChatSuggestions(userId: string, suggestions: string[]) {
  if (!suggestions.length) return;
  cachedKey = `${userId}:${getCurrentLanguage()}`;
  cachedSuggestions = suggestions;
}

export function clearChatSuggestionsCache() {
  cachedKey = null;
  cachedSuggestions = fallbackSuggestions();
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
