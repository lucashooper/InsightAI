import OpenAI from 'openai';

// Model configuration
export const LOCAL_MODEL = import.meta.env.VITE_LOCAL_LLM_MODEL || 'openai/gpt-oss-20b';
export const GROQ_MODEL = 'openai/gpt-oss-120b';

// Lazy-loaded clients (only created when needed)
let _localAI: OpenAI | null = null;
let _cloudAI: OpenAI | null = null;

function getLocalAI(): OpenAI {
  if (!_localAI) {
    _localAI = new OpenAI({
      baseURL: import.meta.env.VITE_LOCAL_LLM_BASE || 'http://127.0.0.1:1234/v1',
      apiKey: import.meta.env.VITE_LOCAL_LLM_KEY || 'lm-studio',
      dangerouslyAllowBrowser: true,
    });
  }
  return _localAI;
}

function getGroqAI(): OpenAI {
  if (!_cloudAI) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey || apiKey === 'your-groq-api-key-here') {
      throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env.local file or use Local mode.');
    }
    _cloudAI = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return _cloudAI;
}

// Unified chat interface with provider toggle
export async function chat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    provider?: 'local' | 'groq';
    temperature?: number;
    stream?: boolean;
  } = {}
) {
  const { provider = 'groq', temperature = 0.7, stream = false } = options;
  
  const client = provider === 'local' ? getLocalAI() : getGroqAI();
  const model = provider === 'local' ? LOCAL_MODEL : GROQ_MODEL;

  return client.chat.completions.create({
    model,
    messages,
    temperature,
    stream,
  });
}

// Helper for streaming responses
export async function* chatStream(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  provider: 'local' | 'groq' = 'groq'
) {
  const client = provider === 'local' ? getLocalAI() : getGroqAI();
  const model = provider === 'local' ? LOCAL_MODEL : GROQ_MODEL;

  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      yield delta;
    }
  }
}
