// Mobile AI service - calls Supabase Edge Function for server-side validation
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { getCurrentLanguage, getCurrentLocale } from '../i18n/languageRef';
import { getAiLanguageInstruction, getChatLanguageInstruction, translate } from '../i18n';
import {
  AiPersonality,
  buildMiraChatSystemPrompt,
  buildMiraRevealSystemPrompt,
  getChatMaxTokens,
  getChatTemperature,
} from '../utils/aiPersonalities';
import { MiraRevealPayload } from '../constants/miraReveal';
import {
  buildRevealFallbackText,
  parseMiraRevealPayload,
  parseMiraRevealResponse,
  preferredRevealTypeForQuery,
} from '../utils/miraReveal';
import { decryptEntriesInChunks } from '../utils/decryptBatch';
import { looksEncryptedContent } from '../utils/encryptionFormat';
import { GROQ_CHAT_MODEL } from '../constants/groqConfig';
import { EffortLevel, inferEffortLevel, normalizeEffortLevel } from '../utils/effortLevel';

export type InsightCardType = 'strength' | 'win' | 'growth' | 'reflection';

export type InsightCard = {
  type: InsightCardType;
  text: string;
  short_label?: string;
  effort_level?: EffortLevel;
};

function normalizeInsightCards(cards: InsightCard[] | undefined, entryContent: string): InsightCard[] {
  if (!Array.isArray(cards)) return [];

  const strengthCards = cards.filter((c) => c.type === 'strength' || c.type === 'win');
  let growthCards = cards.filter((c) => c.type === 'growth' || c.type === 'reflection');

  const trimmed = entryContent.trim();
  const isSimpleEntry = trimmed.length < 120 || trimmed.split(/\s+/).length < 25;

  if (isSimpleEntry) {
    growthCards = [];
  } else {
    growthCards = growthCards.slice(0, 1).map((card) => ({
      ...card,
      effort_level: normalizeEffortLevel(card.effort_level || inferEffortLevel(card.text || '')),
    }));
  }

  return [...strengthCards, ...growthCards];
}

async function fetchDecryptedJournalEntries(userId: string, limit: number) {
  const { data: entries, error } = await supabase
    .from('notes')
    .select('id, user_id, content, created_at, ai_structured_insights, is_encrypted, title')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[mobileAiService] journal entries error:', error);
    return [];
  }

  if (!entries?.length) return [];

  const decrypted = await decryptEntriesInChunks(entries, 4, userId);
  return decrypted.filter((entry) => {
    const snippet = entry.content?.trim() ?? '';
    if (snippet.length < 20) return false;
    if (looksEncryptedContent(snippet, entry.is_encrypted)) return false;
    if (/unable to decrypt|encrypted entry/i.test(snippet)) return false;
    return true;
  });
}

function buildJournalContextFromEntries(entries: Array<{
  content?: string | null;
  created_at: string;
  ai_structured_insights?: any;
}>): string {
  if (!entries.length) {
    return '\n\nIMPORTANT: This user has NO readable journal entries yet. Return type "insufficient_data". Do NOT invent journal content.';
  }

  const summaries = entries.map((e) => {
    const date = new Date(e.created_at).toLocaleDateString(getCurrentLocale(), {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const emotion = e.ai_structured_insights?.mood_analysis?.primary_emotion || '';
    const themes =
      e.ai_structured_insights?.key_themes?.slice(0, 3).map((t: any) => t.theme).join(', ') ||
      '';
    const snippet = e.content?.substring(0, 360) || '';
    return `[${date}]${emotion ? ` (${emotion})` : ''}${themes ? ` Themes: ${themes}` : ''}\n${snippet}`;
  });

  return `\n\nHere are the user's recent journal entries (most recent first). Readable entry count: ${entries.length}.\n\n${summaries.join('\n\n---\n\n')}`;
}

export interface MoodAnalysis {
  primary_emotion: string;
  intensity: number;
  secondary_emotions: string[];
  mood_trend: string;
  confidence: number;
}

export interface EnhancedAIAnalysis {
  mood_analysis: MoodAnalysis;
  wellbeingScore: number;
  resilienceScore: number;
  key_themes: Array<{
    theme: string;
    emotional_impact: 'high' | 'medium' | 'low';
    category: string;
    is_recurring: boolean;
  }>;
  triggers_identified: any[];
  thought_patterns: any[];
  coping_strategies: {
    current: string[];
    suggested: Array<{
      strategy: string;
      why_helpful: string;
      difficulty: 'easy' | 'moderate' | 'challenging';
    }>;
  };
  progress_indicators: {
    positive_signals: string[];
    areas_for_growth: string[];
  };
  processing_time: number;
  confidence: number;
  /** Locale active when analysis ran — used to scope dashboard patterns per language. */
  analysis_locale?: string;
  insights_report?: {
    conversationalSummary: string;
    insightCards?: InsightCard[];
    keyTakeaways: Array<{
      insight: string;
      sentiment: 'positive' | 'opportunity';
      category: string;
    }>;
    actionableSuggestion: {
      title: string;
      suggestion: string;
    };
  };
}

// Supabase Edge Function URL
const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_FUNCTION_URL = supabaseUrl
  ? `${supabaseUrl}/functions/v1`
  : 'https://YOUR_PROJECT.supabase.co/functions/v1';

if (!supabaseUrl) {
  console.warn('[mobileAiService] Missing EXPO_PUBLIC_SUPABASE_URL. Analysis will fail.');
}
if (__DEV__ && !supabaseAnonKey) {
  console.warn('[mobileAiService] Missing EXPO_PUBLIC_SUPABASE_ANON_KEY — edge function calls may fail.');
}

async function waitForRateLimit() {
  // Simple client-side rate limit spacer used on web as well
  return new Promise((resolve) => setTimeout(resolve, 500));
}

function extractGroqMessageContent(data: any): string {
  const choice = data?.choices?.[0];
  const message = choice?.message;
  if (!message) return '';

  const direct =
    (typeof message.content === 'string' && message.content.trim()) ||
    (typeof message.content === 'string' ? message.content : '');
  if (direct.trim()) return direct.trim();

  const reasoning =
    (typeof message.reasoning === 'string' && message.reasoning.trim()) ||
    (typeof message.reasoning_content === 'string' && message.reasoning_content.trim()) ||
    '';
  if (reasoning.trim()) {
    console.warn('[callGroqProxy] Using reasoning fallback — content field was empty');
    return reasoning.trim();
  }

  return '';
}

function isReasoningGroqModel(model: string): boolean {
  return /gpt-oss|qwen\/qwen3/i.test(model);
}

// Helper: call the groq-proxy edge function (keeps API key server-side)
async function callGroqProxy(messages: Array<{role: string; content: string}>, opts?: { temperature?: number; max_tokens?: number; model?: string; reasoning_effort?: 'low' | 'medium' | 'high' }): Promise<string> {
  const model = opts?.model || GROQ_CHAT_MODEL;
  const url = `${SUPABASE_FUNCTION_URL}/groq-proxy`;
  const requestedTokens = opts?.max_tokens ?? 500;
  const minTokens = isReasoningGroqModel(model) ? 1024 : requestedTokens;
  const max_tokens = Math.max(requestedTokens, minTokens);

  console.log('[callGroqProxy] ── request ──');
  console.log('[callGroqProxy] URL:', url);
  console.log('[callGroqProxy] Supabase project:', supabaseUrl || '(missing)');
  console.log('[callGroqProxy] Model:', model);
  console.log('[callGroqProxy] Messages:', messages.length, 'temperature:', opts?.temperature ?? 0.8, 'max_tokens:', max_tokens);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('[callGroqProxy] ❌ No auth session — user must be signed in');
    throw new Error('Not authenticated');
  }
  console.log('[callGroqProxy] Session OK, user:', session.user.id);

  const languageInstruction = getChatLanguageInstruction(getCurrentLanguage());
  const localizedMessages = languageInstruction
    ? messages.map((message, index) =>
        index === 0 && message.role === 'system'
          ? { ...message, content: `${message.content}\n\n${languageInstruction}` }
          : message,
      )
    : messages;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: localizedMessages,
        model,
        temperature: opts?.temperature ?? 0.8,
        max_tokens,
        ...(isReasoningGroqModel(model) ? { reasoning_effort: opts?.reasoning_effort ?? 'low' } : {}),
      }),
    });
  } catch (networkErr: any) {
    console.error('[callGroqProxy] ❌ Network error:', networkErr?.message || networkErr);
    throw new Error(`Network error calling groq-proxy: ${networkErr?.message || 'unknown'}`);
  }

  console.log('[callGroqProxy] HTTP status:', response.status);

  const rawText = await response.text();

  if (!response.ok) {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { raw: rawText.slice(0, 500) };
    }
    console.error('[callGroqProxy] ❌ ── failure ──');
    console.error('[callGroqProxy]   HTTP status:', response.status);
    console.error('[callGroqProxy]   URL:', url);
    console.error('[callGroqProxy]   Model:', model);
    console.error('[callGroqProxy]   Response body:', JSON.stringify(parsed, null, 2));
    if (parsed.detail) {
      console.error('[callGroqProxy]   Groq detail:', typeof parsed.detail === 'string' ? parsed.detail.slice(0, 800) : parsed.detail);
    }
    if (response.status === 402) {
      throw new Error(String(parsed.message || 'Subscription required to use AI features.'));
    }
    const detail = parsed.detail || parsed.error || parsed.message || rawText.slice(0, 200);
    throw new Error(`Groq proxy error (${response.status}): ${detail}`);
  }

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch (parseErr) {
    console.error('[callGroqProxy] ❌ Invalid JSON response:', rawText.slice(0, 300));
    throw new Error('Invalid JSON from groq-proxy');
  }

  const finishReason = data?.choices?.[0]?.finish_reason;
  const usage = data?.usage;
  const reasoningTokens = usage?.completion_tokens_details?.reasoning_tokens;
  let content = extractGroqMessageContent(data);

  console.log('[callGroqProxy] ✅ Success', {
    contentLength: content.length,
    finishReason,
    completionTokens: usage?.completion_tokens,
    reasoningTokens,
  });

  if (!content && finishReason === 'length') {
    console.warn('[callGroqProxy] Empty content with finish_reason=length — retrying with larger budget');
    const retryResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: localizedMessages,
        model,
        temperature: opts?.temperature ?? 0.8,
        max_tokens: Math.max(max_tokens * 2, 2048),
        ...(isReasoningGroqModel(model) ? { reasoning_effort: 'low' } : {}),
      }),
    });
    const retryRaw = await retryResponse.text();
    if (retryResponse.ok) {
      try {
        const retryData = JSON.parse(retryRaw);
        content = extractGroqMessageContent(retryData);
        console.log('[callGroqProxy] Retry content length:', content.length);
      } catch {
        /* fall through */
      }
    }
  }

  if (!content) {
    console.error('[callGroqProxy] Empty model output after retry', {
      finishReason,
      reasoningTokens,
      choiceKeys: data?.choices?.[0]?.message ? Object.keys(data.choices[0].message) : [],
    });
  }

  return content;
}

function getDefaultChatSuggestions(): string[] {
  return [
    'companion.suggestionFeeling',
    'companion.suggestionCallOut',
    'companion.suggestionAvoiding',
    'companion.suggestionRoastWeek',
  ].map((key) => translate(getCurrentLanguage(), key));
}

export function getRoastChatSuggestions(): string[] {
  return [
    'companion.suggestionDoingWrong',
    'companion.suggestionRoastWeek',
    'companion.suggestionCallOut',
    'companion.suggestionAvoiding',
  ].map((key) => translate(getCurrentLanguage(), key));
}

export const mobileAiService = {
  async analyzeEntry(content: string, options?: { signal?: AbortSignal }): Promise<EnhancedAIAnalysis> {
    await waitForRateLimit();

    const startTime = Date.now();

    // Copy of the enhanced analysis prompt from web aiService
    const enhancedPrompt = `You are an expert mental health AI assistant with training in CBT, DBT, and positive psychology. Analyze this diary entry with deep psychological insight and empathy.

Your goal is to provide personalized, specific insights that feel like they come from someone who truly understands the user's unique experience. Avoid generic responses.

CRITICAL INSTRUCTIONS:
1. **Read the entry carefully** - Notice specific details, events, emotions, and patterns mentioned
2. **Pay attention to negations and context** - If someone says "not much anxiety" or "not bad anxiety", they are expressing LOW anxiety, not high anxiety. Don't misinterpret negations as the opposite emotion.
3. **Be specific** - Reference actual words, phrases, and situations from the entry
4. **Avoid generic language** - Don't use phrases like "you've been navigating challenges" or "you showed resilience"
5. **Connect insights to evidence** - Every insight should point to something concrete in the text
6. **Personalize suggestions** - Tailor coping strategies to the specific triggers and patterns you identify
7. **ALWAYS use second person "You"** - NEVER use "their", "the user", "he", "she", or any third person references. Always address the person directly as "You" or "Your"
8. **Grammar check** - Ensure possessives are correct (e.g., "Your contentment" not "You's contentment")
9. **Warm, empathetic, low-pressure tone** - Write like a supportive therapist or coach, not a cold data analyst
10. **STRICT GROUNDING** - Do NOT overreach, diagnose, or extrapolate beyond what the user explicitly stated. Base all observations strictly on facts directly mentioned in the text. If an entry is short or lacks detail, respond with light validation (e.g., "Sounds like a restful day") rather than inventing underlying issues or forced recommendations. If a pattern isn't clearly supported by the text, omit it entirely.
11. **Gentle observations limit** - Include at most ONE 'growth' or 'reflection' insightCard per entry. For simple, venting, or low-detail entries, include ZERO growth/reflection cards — only strengths/wins and a warm summary.

Provide a comprehensive JSON response with the EXACT structure below:

{
  "mood_analysis": {
    "primary_emotion": "specific emotion like anxious, frustrated, hopeful, overwhelmed",
    "intensity": 1-10,
    "secondary_emotions": ["emotion1", "emotion2"],
    "mood_trend": "improving/declining/stable",
    "confidence": 0-100
  },
  "wellbeingScore": 1-10,
  "resilienceScore": 1-10,
  "key_themes": [
    {
      "theme": "specific theme",
      "emotional_impact": "high/medium/low",
      "category": "work/relationships/family/health/personal/other",
      "is_recurring": true/false
    }
  ],
  "triggers_identified": [
    {
      "trigger": "specific trigger",
      "context": "context description",
      "emotional_impact": "high/medium/low"
    }
  ],
  "thought_patterns": [
    {
      "pattern": "specific pattern description",
      "type": "rumination/catastrophizing/mind_reading/all_or_nothing/overgeneralization/emotional_reasoning",
      "frequency": "occasional/frequent/persistent"
    }
  ],
  "coping_strategies": {
    "current": ["strategy1", "strategy2"],
    "suggested": [
      {
        "strategy": "Specific, actionable strategy title (e.g., 'Try limiting caffeine to one cup per day', 'Take a 10-minute walk when feeling anxious', 'Practice 4-7-8 breathing before bed')",
        "why_helpful": "Detailed explanation connecting this strategy to the specific patterns, emotions, or triggers identified in this entry. Reference concrete details from the user's experience.",
        "difficulty": "easy/moderate/challenging"
      }
    ]
  },
  "progress_indicators": {
    "positive_signals": ["sign1", "sign2"],
    "areas_for_growth": ["area1", "area2"]
  },
  "insights_report": {
    "conversationalSummary": "Short natural-language summary of the entry and key themes.",
    "insightCards": [
      {
        "type": "strength" | "win" | "growth" | "reflection",
        "text": "A specific, personalized insight addressing the user directly with 'You'. For strengths/wins, highlight what they did well. For growth/reflection, one gentle observation only.",
        "short_label": "STRENGTH" | "WIN" | "GROWTH" | "REFLECTION",
        "effort_level": "quick_win" | "mindset_shift" | "deep_routine" (REQUIRED for growth/reflection cards only — quick_win = instant zero-resistance action; mindset_shift = gentle reflection; deep_routine = structural habit change)
      }
    ],
    "keyTakeaways": [
      {
        "insight": "A specific observation about a strength or positive moment.",
        "sentiment": "positive",
        "category": "Strength/Win/Gratitude"
      },
      {
        "insight": "A specific observation about a struggle, negative emotion, or area for growth.",
        "sentiment": "opportunity",
        "category": "Challenge/Growth/Reflection"
      }
    ],
    "actionableSuggestion": {
      "title": "One specific thing to try based on what they wrote",
      "suggestion": "A concrete suggestion that addresses something specific from their entry. Reference their actual situation."
    }
  }
}

Entry text: ${content}`;

    // Add explicit instruction for multiple insights
    const systemInstruction = `You are an expert mental health AI assistant trained in CBT, DBT, and positive psychology. 
    
    CRITICAL OUTPUT RULES:
    1. Provide 2-4 'insightCards' total — always include 'strength' and/or 'win' cards celebrating what went well.
    2. Include at most ONE 'growth' or 'reflection' card. For brief, venting, or simple entries with little detail, include ZERO growth/reflection cards.
    3. Every growth/reflection card MUST include effort_level: "quick_win" | "mindset_shift" | "deep_routine".
    4. Card types:
       - 'strength': Highlight capabilities, resilience, or positive traits they demonstrated
       - 'win': Celebrate specific achievements or positive moments
       - 'growth': One gentle, optional observation — only if clearly supported by the text
       - 'reflection': One gentle cognitive invitation — only if clearly supported by the text
    5. Each card's 'text' should be 1-2 sentences, specific to their entry, and address them as 'You'.
    6. Provide 2-4 items in 'keyTakeaways' for backward compatibility.
    7. **STRICT GRAMMAR RULE**: ALWAYS use second person ("You", "Your"). NEVER use third person.
    8. **Tone**: Warm, empathetic, low-pressure — never preachy or overwhelming.
    9. **STRICT GROUNDING**: Do NOT diagnose, assume hidden problems, or recommend changes not grounded in the entry. When uncertain, omit the growth/reflection card.
    10. **POSITIVITY BIAS**: Lead with strengths. Key Themes should be encouraging, not negative labels.${getAiLanguageInstruction(getCurrentLanguage())}`;

    try {
      console.log('[mobileAiService] Calling groq-proxy for journal analysis...');
      const analysisText = await callGroqProxy(
        [
          {
            role: 'system',
            content: `${systemInstruction}\n\nRespond with valid JSON only.`,
          },
          { role: 'user', content: enhancedPrompt },
        ],
        { temperature: 0.7, max_tokens: 4096 },
      );

      if (!analysisText || analysisText.trim() === '') {
        console.error('[mobileAiService] Empty AI response received');
        throw new Error('Empty AI response');
      }

      console.log('[mobileAiService] AI response length:', analysisText.length);

      let parsed: any;
      try {
        parsed = JSON.parse(analysisText);
      } catch (err) {
        // Try to extract JSON blob
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('[mobileAiService] Failed to parse AI JSON', err, analysisText.slice(0, 200));
          throw err;
        }
        parsed = JSON.parse(jsonMatch[0]);
      }

      const processingTime = Date.now() - startTime;

      const normalizedCards = normalizeInsightCards(
        parsed.insights_report?.insightCards,
        content,
      );
      const insightsReport = parsed.insights_report
        ? {
            ...parsed.insights_report,
            insightCards: normalizedCards,
          }
        : undefined;

      const enhancedAnalysis: EnhancedAIAnalysis = {
        mood_analysis: {
          primary_emotion: parsed.mood_analysis?.primary_emotion || 'neutral',
          intensity: parsed.mood_analysis?.intensity || 5,
          secondary_emotions: parsed.mood_analysis?.secondary_emotions || [],
          mood_trend: parsed.mood_analysis?.mood_trend || 'stable',
          confidence: parsed.mood_analysis?.confidence || 70,
        },
        wellbeingScore: parsed.wellbeingScore || 5,
        resilienceScore: parsed.resilienceScore || 5,
        key_themes: parsed.key_themes || [],
        triggers_identified: parsed.triggers_identified || [],
        thought_patterns: parsed.thought_patterns || [],
        coping_strategies: {
          current: parsed.coping_strategies?.current || [],
          suggested: parsed.coping_strategies?.suggested || [],
        },
        progress_indicators: {
          positive_signals: parsed.progress_indicators?.positive_signals || [],
          areas_for_growth: parsed.progress_indicators?.areas_for_growth || [],
        },
        processing_time: processingTime,
        confidence: parsed.confidence || 70,
        insights_report: insightsReport,
        analysis_locale: getCurrentLanguage(),
      };

      console.log('[mobileAiService] analyzeEntry success', {
        processingTime,
        hasInsightsReport: !!enhancedAnalysis.insights_report,
      });

      // Optional user lookup (future pattern detection)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('[mobileAiService] No user for pattern detection');
        }
      } catch (err) {
        console.log('[mobileAiService] Skipping pattern detection on mobile', err);
      }

      return enhancedAnalysis;
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.warn('[mobileAiService] analyzeEntry aborted');
        throw error;
      }
      console.error('[mobileAiService] analyzeEntry failed');
      console.error('[mobileAiService]   message:', error?.message);
      console.error('[mobileAiService]   stack:', error?.stack);
      throw error;
    }
  },

  async generateProtocol(growthRecommendation: string): Promise<{
    name: string;
    practice: string;
    why: string;
  }> {
    await waitForRateLimit();

    const prompt = `Based on this growth recommendation:
"${growthRecommendation}"

Create a single, actionable daily protocol that the user can practice. Format:

**Protocol Name:** [Short, memorable title - max 4 words]
**Daily Practice:** [One specific action they can take daily - 1-2 sentences max]
**Why it works:** [One sentence explaining the benefit]

Make it:
- Concrete and specific (not vague advice)
- Takes 5-15 minutes daily
- Easy to remember and implement
- Directly addresses the growth area identified

Example:
**Protocol Name:** Creative Task Chunking
**Daily Practice:** Each morning, break your main creative goal into 3 small tasks you can complete today. Focus on finishing one before starting the next.
**Why it works:** Small wins build momentum and prevent perfectionism from blocking progress.

Provide ONLY the protocol in the exact format above, nothing else.`;

    try {
      const lang = getCurrentLanguage();
      const protocolText = await callGroqProxy([
        {
          role: 'system',
          content: `You are a practical mental health coach who creates simple, actionable daily protocols. Always format your response exactly as requested.${getAiLanguageInstruction(lang)}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ], { temperature: 0.8, max_tokens: 300 });

      // Parse the protocol text
      const nameMatch = protocolText.match(/\*\*Protocol Name:\*\*\s*(.+?)(?:\n|$)/i);
      const practiceMatch = protocolText.match(/\*\*Daily Practice:\*\*\s*(.+?)(?=\n\*\*|$)/is);
      const whyMatch = protocolText.match(/\*\*Why it works:\*\*\s*(.+?)$/is);

      return {
        name: nameMatch?.[1]?.trim() || 'Daily Practice',
        practice: practiceMatch?.[1]?.trim() || growthRecommendation,
        why: whyMatch?.[1]?.trim() || 'This practice supports your growth.',
      };
    } catch (error: any) {
      console.error('[mobileAiService] generateProtocol error', error);
      // Fallback to a simple protocol
      return {
        name: 'Daily Reflection',
        practice: 'Take 5 minutes each day to reflect on this growth area and identify one small action you can take.',
        why: 'Regular reflection builds awareness and creates opportunities for change.',
      };
    }
  },

  async generateFollowUpQuestions(content: string, analysis?: EnhancedAIAnalysis): Promise<{
    reflection: string;
    questions: string[];
  }> {
    await waitForRateLimit();

    const contextInfo = analysis ? `

Previous analysis context:
- Primary emotion: ${analysis.mood_analysis.primary_emotion}
- Key themes: ${analysis.key_themes.map(t => t.theme).join(', ')}
- Thought patterns: ${analysis.thought_patterns.map(p => p.pattern).join(', ')}` : '';

    const prompt = `You are a wise, empathetic therapist having a conversation with someone who just shared this journal entry:

"${content}"${contextInfo}

Your task is to help them go deeper into their reflection. Provide:

1. A thoughtful, validating response (2-3 sentences) that:
   - Acknowledges what they shared with empathy
   - Reflects back a key insight or pattern you notice
   - Shows you truly understand their experience
   - Uses warm, conversational language (like Mindsera's style)

2. Then ask 2-3 follow-up questions that:
   - Are specific to what they wrote (reference actual details)
   - Help them explore deeper emotions, triggers, or patterns
   - Feel curious and supportive, not interrogative
   - Build on each other naturally
   - Avoid generic questions like "How does this make you feel?"

Format your response as JSON:
{
  "reflection": "Your empathetic response here",
  "questions": [
    "First specific question?",
    "Second specific question?",
    "Optional third question?"
  ]
}

Example for an entry about procrastination:
{
  "reflection": "It sounds like you've been building something solid with that framework, and then this urge just showed up out of nowhere and kind of bypassed all of it. That must feel frustrating, especially when you'd been doing well.",
  "questions": [
    "That paradox you mentioned is interesting. Like the harder you push against something, the more it pushes back. It's almost like the resistance itself creates tension that eventually needs release. What do you think was different this time compared to when the framework was working for you?",
    "You said it felt 'random' - but was there anything happening in your day or week before that urge came up? Sometimes these things aren't as random as they feel in the moment."
  ]
}

Provide ONLY the JSON, nothing else.`;

    try {
      const responseText = await callGroqProxy([
        {
          role: 'system',
          content: `You are a compassionate therapist who asks thoughtful, specific questions that help people understand themselves better. You write in warm, conversational markdown with short paragraphs, **bold** highlights, and subtle emojis (💡 🌱 ✨).`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ], { temperature: 0.8, max_tokens: 500 });

      let parsed: any;
      try {
        parsed = JSON.parse(responseText);
      } catch (err) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw err;
        }
        parsed = JSON.parse(jsonMatch[0]);
      }

      return {
        reflection: parsed.reflection || "I hear what you're sharing. Let's explore this together.",
        questions: parsed.questions || ["What else comes up for you when you think about this?"],
      };
    } catch (error: any) {
      console.error('[mobileAiService] generateFollowUpQuestions error', error);
      return {
        reflection: "Thank you for sharing this. Let's explore it further.",
        questions: [
          "What do you think might be behind this feeling?",
          "How does this connect to other things happening in your life right now?",
        ],
      };
    }
  },

  async continueGoDeeperChat(
    journalContent: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<string> {
    await waitForRateLimit();

    const history = messages
      .map((m) => `${m.role === 'assistant' ? 'Insight' : 'User'}: ${m.content}`)
      .join('\n\n');

    const prompt = `You are Insight, a warm and insightful journal companion. The user wrote this journal entry:

"${journalContent}"

Conversation so far:
${history}

Respond naturally to the user's latest message. Be empathetic, specific to what they wrote, and curious — not generic. Keep it to 2-4 sentences. Do NOT ask multiple numbered questions. Do NOT analyze or score the entry. Just continue the conversation.`;

    try {
      const responseText = await callGroqProxy([
        {
          role: 'system',
          content: `You are the AI reflection assistant inside Insight. Write in warm, conversational tone with clear structure:
- If asked who you are, you are Insight's reflection assistant — not a separate named persona

- Use **bold** to highlight key insights or emotional themes
- Break longer responses into short 2-3 sentence paragraphs (separated by blank lines)
- Use subtle thematic emojis sparingly (💡 for insights, 🌱 for growth, 🎯 for action steps)
- For actionable advice, use simple bullet points with clear headers
- Keep total response under 280 words — clarity over length
- Never use JSON, never use numbered lists`,
        },
        { role: 'user', content: prompt },
      ], { temperature: 0.75, max_tokens: 280 });

      return responseText.trim() || "I'm listening — tell me more about that.";
    } catch (error) {
      console.error('[mobileAiService] continueGoDeeperChat error', error);
      return "I'm here with you. What else is coming up as you think about this?";
    }
  },

  formatGoDeeperReflection(reflection: string, questions: string[]): string {
    const cleaned = reflection.trim();
    const qs = questions.filter(Boolean).map((q) => q.trim());
    if (qs.length === 0) return cleaned;

    const bullets = qs.map((q) => `- ${q}`).join('\n');
    return `${cleaned}\n\n**💭 Things to explore**\n\n${bullets}`;
  },

  async generateMonthlyStory(entries: any[]): Promise<string> {
    await waitForRateLimit();

    if (entries.length === 0) {
      return "You're just beginning your journey. Each entry you write adds to your story.";
    }

    // Extract key themes and emotions from entries
    const entrySummaries = entries.slice(0, 10).map(e => {
      const emotion = e.ai_structured_insights?.mood_analysis?.primary_emotion || 'reflective';
      const themes = e.ai_structured_insights?.key_themes?.slice(0, 2).map((t: any) => t.theme).join(', ') || '';
      return `${emotion}${themes ? ` (${themes})` : ''}`;
    }).join('; ');

    const prompt = `Based on these emotional patterns from the user's journal entries over the past month:
${entrySummaries}

Create a warm, personalized 2-3 sentence summary of their emotional journey this month. Focus on:
- Resilience and growth they've shown
- Specific themes that emerged
- A gentle, encouraging tone (like a wise friend checking in)
- NO corporate language or productivity talk
- Emphasize self-compassion

Write in second person ("you"). Keep it under 60 words.`;

    try {
      const story = await callGroqProxy([
        {
          role: 'system',
          content: 'You are a compassionate journal companion who helps users reflect on their emotional journey with warmth and wisdom.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ], { temperature: 0.8, max_tokens: 150 });

      return story.trim() || "You've been navigating your emotions with care this month. That takes real courage.";
    } catch (error: any) {
      console.error('[mobileAiService] generateMonthlyStory error', error);
      return "You've been showing up for yourself this month. That's what matters.";
    }
  },

  /**
   * AI Chat Companion — conversational AI with access to all journal entries.
   * Fetches recent entries from Supabase and includes them as context so the AI
   * can answer questions about the user's emotional history, patterns, etc.
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    options?: { signal?: AbortSignal; personality?: AiPersonality }
  ): Promise<string> {
    console.log('[mobileAiService] 💬 Chat function called');
    await waitForRateLimit();

    // Fetch recent journal entries for context
    // CRITICAL: Use getUser() for fresh server-side auth check to prevent stale session leaking other user's data
    console.log('[mobileAiService] Getting authenticated user...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('[mobileAiService] No session found');
      throw new Error('Not authenticated');
    }
    
    // Double-check with getUser() to ensure we have the correct, current user
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !currentUser) {
      console.error('[mobileAiService] getUser() failed:', userError?.message);
      throw new Error('Authentication verification failed');
    }
    
    const userId = currentUser.id;
    console.log('[mobileAiService] Verified user ID:', userId);
    
    // Sanity check: session user should match getUser() result
    if (session.user.id !== userId) {
      console.error('[mobileAiService] ⚠️ SESSION MISMATCH! session.user.id:', session.user.id, 'getUser().id:', userId);
    }

    const { data: entries, error: entriesError } = await supabase
      .from('notes')
      .select('content, created_at, ai_structured_insights')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (entriesError) {
      console.error('[mobileAiService] Error fetching entries:', entriesError);
    }

    // Build journal context summary
    console.log('[mobileAiService] Entries found for user:', entries?.length ?? 0);
    const readableEntries = await fetchDecryptedJournalEntries(userId, 20);
    console.log('[mobileAiService] Readable decrypted entries for chat:', readableEntries.length);
    let journalContext = buildJournalContextFromEntries(readableEntries);
    if (readableEntries.length === 0 && entries && entries.length > 0) {
      journalContext =
        '\n\nIMPORTANT: This user has journal entries, but none are readable on this device (likely encrypted). Do NOT invent journal content. Encourage them to unlock encryption on this device or write new entries.';
    } else if (readableEntries.length === 0) {
      journalContext =
        '\n\nIMPORTANT: This user has NO journal entries yet. Do NOT reference, summarize, or pretend to have access to any journal entries. If they ask about entries, patterns, or their journal history, let them know they haven\'t written any entries yet and encourage them to start journaling. Do NOT make up or hallucinate any journal content.';
    }

    const personality = (options?.personality || 'balanced') as AiPersonality;

    const systemMessage = buildMiraChatSystemPrompt(
      personality,
      journalContext,
      getChatLanguageInstruction(getCurrentLanguage()),
    );

    try {
      console.log('[mobileAiService] Building API messages...', { personality });
      const enhancedSystemMessage = systemMessage + `

Write in warm, conversational tone with clear structure:
- Use **bold** to highlight key insights or emotional themes (e.g., **"self-compassion"**, **"setting boundaries"**)
- Break longer responses into short 2-3 sentence paragraphs (separated by blank lines)
- Use emojis strategically as visual anchors (e.g., 💡 insights, 🌱 growth, 🎯 actions, 🔄 patterns, ✨ wins)
- For actionable advice, use bullet points with emojis to make them scannable
- Example formatting:
  "You've been **prioritizing self-care** lately, and that's showing up in how you handle stress.
  
  💡 **Key Pattern**: You tend to journal more when anxious, which helps you process emotions faster.
  
  Here's what might help:
  • 🎯 Try morning pages for 5 minutes
  • 🌱 Notice when you're avoiding vs. processing
  • ✨ Celebrate small wins"
- Keep responses under 300 words — clarity over length
- If asked who you are, you are Insight's reflection assistant — not a separate named persona`;

      const apiMessages = [
        { role: 'system', content: enhancedSystemMessage },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ];

      console.log('[mobileAiService] Calling Groq proxy...');
      const response = await callGroqProxy(apiMessages, {
        temperature: getChatTemperature(personality),
        max_tokens: 1200,
        model: GROQ_CHAT_MODEL,
        reasoning_effort: 'low',
      });

      console.log('[mobileAiService] ✅ Chat response received, length:', response?.length);
      return response.trim();
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.warn('[mobileAiService] Chat aborted');
        throw error;
      }
      console.error('[mobileAiService] ❌ Chat error:', error);
      console.error('[mobileAiService] Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  /**
   * Discovery reveal — structured "gotcha" card grounded in journal history.
   * Falls back to a soft reveal if the model returns plain text.
   */
  async chatReveal(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    options?: { signal?: AbortSignal; personality?: AiPersonality },
  ): Promise<{ reveal: MiraRevealPayload | null; raw: string; fallbackText?: string }> {
    console.log('[mobileAiService] ✨ chatReveal called');
    await waitForRateLimit();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !currentUser) throw new Error('Authentication verification failed');

    const userId = currentUser.id;
    const readableEntries = await fetchDecryptedJournalEntries(userId, 40);
    console.log('[mobileAiService] chatReveal readable entries:', readableEntries.length);
    const journalContext = buildJournalContextFromEntries(readableEntries);

    const personality = (options?.personality || 'balanced') as AiPersonality;
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const preferredType = preferredRevealTypeForQuery(lastUser);

    const systemMessage = buildMiraRevealSystemPrompt(
      personality,
      journalContext,
      getChatLanguageInstruction(getCurrentLanguage()),
      preferredType,
    );

    try {
      const apiMessages = [
        { role: 'system', content: systemMessage },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const response = await callGroqProxy(apiMessages, {
        temperature: personality === 'roast' ? 0.7 : 0.55,
        max_tokens: 1800,
        model: GROQ_CHAT_MODEL,
        reasoning_effort: 'low',
      });

      const raw = (response || '').trim();
      console.log('[mobileAiService] chatReveal raw length:', raw.length, 'preview:', raw.slice(0, 120));
      const parsed = parseMiraRevealPayload(raw);
      const card = parseMiraRevealResponse(raw);

      if (card) {
        console.log('[mobileAiService] chatReveal card type:', card.type);
        return { reveal: card, raw };
      }

      console.warn('[mobileAiService] chatReveal — no card-worthy reveal', {
        readableEntries: readableEntries.length,
        parsedType: parsed?.type,
        rawLength: raw.length,
      });
      return {
        reveal: null,
        raw,
        fallbackText: buildRevealFallbackText(parsed, raw),
      };
    } catch (error: any) {
      if (error?.name === 'AbortError') throw error;
      console.error('[mobileAiService] ❌ chatReveal error:', error);
      throw error;
    }
  },

  /**
   * Generate suggested conversation starters based on recent journal entries.
   */
  async getChatSuggestions(): Promise<string[]> {
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !currentUser) return getDefaultChatSuggestions();

    console.log('[mobileAiService] getChatSuggestions for user:', currentUser.id);
    const { data: entries } = await supabase
      .from('notes')
      .select('content, created_at, ai_structured_insights')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!entries || entries.length === 0) return getDefaultChatSuggestions();

    // Generate contextual suggestions based on recent entries
    const recentEmotion = entries[0]?.ai_structured_insights?.mood_analysis?.primary_emotion;
    const recentThemes = entries[0]?.ai_structured_insights?.key_themes?.slice(0, 2).map((t: any) => t.theme) || [];

    const suggestions: string[] = [];
    if (recentEmotion) {
      suggestions.push(`Why have I been feeling ${recentEmotion} lately?`);
    }
    suggestions.push('When was I happiest this week?');
    if (recentThemes.length > 0) {
      suggestions.push(`Tell me about my ${recentThemes[0].toLowerCase()} patterns`);
    }
    suggestions.push('What should I focus on this week?');
    suggestions.push('Summarize my emotional journey this month');

    return suggestions.slice(0, 4);
  },
};


