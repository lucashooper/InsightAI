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
const SUPABASE_FUNCTION_URL = supabaseUrl
  ? `${supabaseUrl}/functions/v1`
  : 'https://YOUR_PROJECT.supabase.co/functions/v1';

if (!supabaseUrl) {
  console.warn('[mobileAiService] Missing EXPO_PUBLIC_SUPABASE_URL. Analysis will fail.');
}

async function waitForRateLimit() {
  // Simple client-side rate limit spacer used on web as well
  return new Promise((resolve) => setTimeout(resolve, 500));
}

// Helper: call the groq-proxy edge function (keeps API key server-side)
async function callGroqProxy(messages: Array<{role: string; content: string}>, opts?: { temperature?: number; max_tokens?: number; model?: string }): Promise<string> {
  const model = opts?.model || GROQ_CHAT_MODEL;
  const url = `${SUPABASE_FUNCTION_URL}/groq-proxy`;

  console.log('[callGroqProxy] ── request ──');
  console.log('[callGroqProxy] URL:', url);
  console.log('[callGroqProxy] Supabase project:', supabaseUrl || '(missing)');
  console.log('[callGroqProxy] Model:', model);
  console.log('[callGroqProxy] Messages:', messages.length, 'temperature:', opts?.temperature ?? 0.8, 'max_tokens:', opts?.max_tokens ?? 500);

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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: localizedMessages,
        model,
        temperature: opts?.temperature ?? 0.8,
        max_tokens: opts?.max_tokens ?? 500,
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

  const content = data.choices?.[0]?.message?.content || '';
  console.log('[callGroqProxy] ✅ Success, response length:', content.length);
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
9. **Warm, empathetic tone** - Write like a supportive therapist or coach, not a cold data analyst

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
        "text": "A specific, personalized insight addressing the user directly with 'You'. For strengths/wins, highlight what they did well. For growth/reflection, point out patterns or opportunities.",
        "short_label": "STRENGTH" | "WIN" | "GROWTH" | "REFLECTION"
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
    1. You MUST provide at least 3-5 items in 'insightCards' array.
    2. You MUST include a balanced mix of types: at least 1-2 'strength' or 'win' cards AND 1-2 'growth' or 'reflection' cards.
    3. Card types:
       - 'strength': Highlight capabilities, resilience, or positive traits they demonstrated
       - 'win': Celebrate specific achievements or positive moments
       - 'growth': Point out patterns or behaviors that could be improved
       - 'reflection': Invite deeper thinking about emotions, triggers, or recurring themes
    4. Each card's 'text' should be 1-3 sentences, specific to their entry, and address them as 'You'.
    5. You MUST also provide 3-5 items in 'keyTakeaways' for backward compatibility.
    6. **STRICT GRAMMAR RULE**: ALWAYS use second person ("You", "Your"). NEVER use "their", "the user", "he", "she", or third person. Example: "Your contentment suggests..." NOT "You's contentment" or "their contentment".
    7. **Tone**: Write with warmth, encouragement, and empathy, like a supportive therapist speaking directly to the person.
    8. **POSITIVITY BIAS**: Always lead with strengths and wins. Frame challenges as growth opportunities. Key Themes should be ENCOURAGING and GROWTH-ORIENTED, not negative labels. For example:
       - GOOD: "Building social confidence", "Embracing new experiences", "Developing self-compassion"
       - BAD: "Social anxiety and self-perception", "Missed opportunities and self-doubt", "Accidental loss of personal data"
    9. Even when addressing struggles, use empowering language that highlights their awareness and potential for growth.${getAiLanguageInstruction(getCurrentLanguage())}`;

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
        insights_report: parsed.insights_report,
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
          content: `You are Insight, a compassionate journal companion and personal growth mentor. Write in warm, conversational tone with clear structure:
- If asked your name, you are Insight — never refer to yourself as Mira

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
- If asked your name or who you are, you are Insight — never refer to yourself as Mira`;

      const apiMessages = [
        { role: 'system', content: enhancedSystemMessage },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ];

      console.log('[mobileAiService] Calling Groq proxy...');
      const response = await callGroqProxy(apiMessages, {
        temperature: getChatTemperature(personality),
        max_tokens: 350,
        model: GROQ_CHAT_MODEL,
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
        max_tokens: 900,
        model: GROQ_CHAT_MODEL,
      });

      const raw = (response || '').trim();
      const parsed = parseMiraRevealPayload(raw);
      const card = parseMiraRevealResponse(raw);

      if (card) {
        return { reveal: card, raw };
      }

      console.warn('[mobileAiService] chatReveal — no card-worthy reveal, using plain text');
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


