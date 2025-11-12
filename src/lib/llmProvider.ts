/**
 * LLM Provider Helper
 * Centralized access to user's LLM provider preference
 */

export type LLMProvider = 'local' | 'groq';

/**
 * Get the user's preferred LLM provider from localStorage
 * Defaults to 'groq' for production (cloud-hosted)
 * Falls back to 'local' if 'groq' is selected but no API key is configured
 */
export function getLLMProvider(): LLMProvider {
  if (typeof window === 'undefined') {
    return 'groq'; // Default for SSR
  }
  
  const saved = localStorage.getItem('insightai-llm-provider') as LLMProvider;
  const hasGroqKey = import.meta.env.VITE_GROQ_API_KEY && 
                     import.meta.env.VITE_GROQ_API_KEY !== 'your-groq-api-key-here';
  
  // If user selected Groq but no key is configured, fall back to local
  if (saved === 'groq' && !hasGroqKey) {
    console.warn('⚠️ Groq provider selected but no API key configured. Falling back to LOCAL (LM Studio)');
    return 'local';
  }
  
  // Default to Groq if API key is available, otherwise local
  return saved || (hasGroqKey ? 'groq' : 'local');
}

/**
 * Set the user's preferred LLM provider
 */
export function setLLMProvider(provider: LLMProvider): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('insightai-llm-provider', provider);
  }
}
