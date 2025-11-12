/**
 * LLM Provider Helper
 * Centralized access to user's LLM provider preference
 */

export type LLMProvider = 'local' | 'openai';

/**
 * Get the user's preferred LLM provider from localStorage
 * Defaults to 'local' for privacy
 * Falls back to 'local' if 'openai' is selected but no API key is configured
 */
export function getLLMProvider(): LLMProvider {
  if (typeof window === 'undefined') {
    return 'local'; // Default for SSR
  }
  
  const saved = localStorage.getItem('insightai-llm-provider') as LLMProvider;
  const hasOpenAIKey = import.meta.env.VITE_OPENAI_API_KEY && 
                       import.meta.env.VITE_OPENAI_API_KEY !== 'your-openai-api-key-here';
  
  // If user selected OpenAI but no key is configured, fall back to local
  if (saved === 'openai' && !hasOpenAIKey) {
    console.warn('⚠️ OpenAI provider selected but no API key configured. Falling back to LOCAL (LM Studio)');
    return 'local';
  }
  
  return saved || 'local';
}

/**
 * Set the user's preferred LLM provider
 */
export function setLLMProvider(provider: LLMProvider): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('insightai-llm-provider', provider);
  }
}
