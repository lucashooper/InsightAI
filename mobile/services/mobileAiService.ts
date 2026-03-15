// Mobile AI service - calls Supabase Edge Function for server-side validation
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

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
  console.log('[callGroqProxy] Getting session...');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('[callGroqProxy] No session found');
    throw new Error('Not authenticated');
  }
  console.log('[callGroqProxy] Session found, calling groq-proxy...');

  const response = await fetch(`${SUPABASE_FUNCTION_URL}/groq-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model: opts?.model || 'llama-3.3-70b-versatile',
      temperature: opts?.temperature ?? 0.8,
      max_tokens: opts?.max_tokens ?? 500,
    }),
  });

  console.log('[callGroqProxy] Response status:', response.status);

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[callGroqProxy] Error response:', err);
    throw new Error(err.error || `Groq proxy error (${response.status})`);
  }

  const data = await response.json();
  console.log('[callGroqProxy] ✅ Success, response length:', data.choices?.[0]?.message?.content?.length);
  return data.choices?.[0]?.message?.content || '';
}

const defaultChatSuggestions = [
  'How have I been feeling lately?',
  'What patterns do you notice in my journal?',
  'What should I focus on this week?',
  'Help me reflect on my recent entries',
];

export const mobileAiService = {
  async analyzeEntry(content: string, options?: { signal?: AbortSignal }): Promise<EnhancedAIAnalysis> {
    await waitForRateLimit();

    const startTime = Date.now();

    // Copy of the enhanced analysis prompt from web aiService
    const enhancedPrompt = `You are an expert mental health AI assistant with training in CBT, DBT, and positive psychology. Analyze this diary entry with deep psychological insight and empathy.

Your goal is to provide personalized, specific insights that feel like they come from someone who truly understands the user's unique experience. Avoid generic responses.

CRITICAL INSTRUCTIONS:
1. **Read the entry carefully** - Notice specific details, events, emotions, and patterns mentioned
2. **Be specific** - Reference actual words, phrases, and situations from the entry
3. **Avoid generic language** - Don't use phrases like "you've been navigating challenges" or "you showed resilience"
4. **Connect insights to evidence** - Every insight should point to something concrete in the text
5. **Personalize suggestions** - Tailor coping strategies to the specific triggers and patterns you identify
6. **ALWAYS use second person "You"** - NEVER use "their", "the user", "he", "she", or any third person references. Always address the person directly as "You" or "Your"
7. **Grammar check** - Ensure possessives are correct (e.g., "Your contentment" not "You's contentment")
8. **Warm, empathetic tone** - Write like a supportive therapist or coach, not a cold data analyst

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
    9. Even when addressing struggles, use empowering language that highlights their awareness and potential for growth.`;

    // Get user session for authentication - use multiple strategies with timeouts
    console.log('[mobileAiService] Getting user session...');
    let session: any = null;
    
    // Strategy 1: Try getSession with a tight timeout (most reliable, reads from storage)
    try {
      console.log('[mobileAiService] Strategy 1: getSession...');
      const getSessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('getSession timeout')), 5000))
      ]) as any;
      session = getSessionResult?.data?.session;
      console.log('[mobileAiService] Strategy 1 result:', session ? 'found' : 'null');
    } catch (e: any) {
      console.warn('[mobileAiService] Strategy 1 failed:', e.message);
    }
    
    // Strategy 2: If getSession failed, try refreshSession
    if (!session) {
      try {
        console.log('[mobileAiService] Strategy 2: refreshSession...');
        const refreshResult = await Promise.race([
          supabase.auth.refreshSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('refreshSession timeout')), 5000))
        ]) as any;
        session = refreshResult?.data?.session;
        console.log('[mobileAiService] Strategy 2 result:', session ? 'found' : 'null');
      } catch (e: any) {
        console.warn('[mobileAiService] Strategy 2 failed:', e.message);
      }
    }
    
    // Strategy 3: Last resort - read token from AsyncStorage directly
    if (!session) {
      try {
        console.log('[mobileAiService] Strategy 3: Reading token from storage...');
        const AS = require('@react-native-async-storage/async-storage').default;
        const allKeys: string[] = await AS.getAllKeys();
        const authKeys = allKeys.filter((k: string) => k.includes('auth') || k.includes('supabase'));
        console.log('[mobileAiService] Auth-related storage keys:', authKeys);
        
        for (const key of authKeys) {
          try {
            const value = await AS.getItem(key);
            if (value) {
              const parsed = JSON.parse(value);
              if (parsed?.access_token) {
                console.log('[mobileAiService] Strategy 3: Found token in key:', key);
                session = parsed;
                break;
              }
            }
          } catch {} // Skip non-JSON values
        }
        console.log('[mobileAiService] Strategy 3 result:', session ? 'found' : 'null');
      } catch (e: any) {
        console.warn('[mobileAiService] Strategy 3 failed:', e.message);
      }
    }
    
    if (!session) {
      console.error('[mobileAiService] ❌ No session found after all 3 strategies');
      throw new Error('Not authenticated. Please sign in to use AI features.');
    }

    console.log('[mobileAiService] ✅ Session confirmed, user ID:', session.user?.id || 'unknown');
    console.log('[mobileAiService] Token present:', !!session.access_token);
    console.log('[mobileAiService] Calling Edge Function:', `${SUPABASE_FUNCTION_URL}/clever-api`);

    try {
      console.log('[mobileAiService] 🚀 Starting Edge Function call...');
      console.log('[mobileAiService] Content length:', content.length);
      
      // Add timeout to prevent infinite hanging - use Promise.race for more reliable timeout
      const controller = new AbortController();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.error('[mobileAiService] ⏰ Request timeout after 45 seconds');
          controller.abort();
          reject(new Error('Analysis request timed out. Please try again.'));
        }, 45000); // 45 second timeout (more aggressive)
      });
      
      const combinedSignal = options?.signal || controller.signal;
      
      console.log('[mobileAiService] Fetching from Edge Function...');
      // Call Supabase Edge Function instead of Groq directly
      const fetchPromise = fetch(`${SUPABASE_FUNCTION_URL}/clever-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        signal: combinedSignal,
        body: JSON.stringify({
          content,
          systemInstruction,
          enhancedPrompt,
        }),
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      console.log('[mobileAiService] ✅ Edge Function response received');
      console.log('[mobileAiService] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[mobileAiService] Edge function error', response.status, errorData);
        
        // Handle subscription-specific errors
        if (response.status === 402) {
          throw new Error(errorData.message || 'Subscription required to use AI features.');
        }
        
        // Provide specific error messages based on status code
        let errorMessage = errorData.error || `AI analysis failed (Status ${response.status})`;
        
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please sign in again.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (response.status === 500 || response.status === 503) {
          errorMessage = 'AI service temporarily unavailable. Please try again in a few moments.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[mobileAiService] ✅ Edge Function success, parsing response...');
      
      const analysisText: string = data.choices?.[0]?.message?.content || '';

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
      console.error('[mobileAiService] analyzeEntry error', error);
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
      const protocolText = await callGroqProxy([
        {
          role: 'system',
          content: 'You are a practical mental health coach who creates simple, actionable daily protocols. Always format your response exactly as requested.',
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
          content: 'You are a compassionate therapist who asks thoughtful, specific questions that help people understand themselves better. You write in a warm, conversational style like Mindsera.',
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
    options?: { signal?: AbortSignal; personality?: string }
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
    let journalContext = '';
    if (entries && entries.length > 0) {
      const summaries = entries.map((e: any) => {
        const date = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const emotion = e.ai_structured_insights?.mood_analysis?.primary_emotion || '';
        const themes = e.ai_structured_insights?.key_themes?.slice(0, 3).map((t: any) => t.theme).join(', ') || '';
        const snippet = e.content?.substring(0, 300) || '';
        return `[${date}]${emotion ? ` (${emotion})` : ''}${themes ? ` Themes: ${themes}` : ''}\n${snippet}`;
      });
      journalContext = `\n\nHere are the user's recent journal entries (most recent first):\n\n${summaries.join('\n\n---\n\n')}`;
    } else {
      journalContext = '\n\nIMPORTANT: This user has NO journal entries yet. Do NOT reference, summarize, or pretend to have access to any journal entries. If they ask about entries, patterns, or their journal history, let them know they haven\'t written any entries yet and encourage them to start journaling. Do NOT make up or hallucinate any journal content.';
    }

    // Personality-specific tone instructions
    const personalityTones: Record<string, string> = {
      balanced: '- Warm, supportive, and genuinely curious about the user\'s wellbeing\n- Like a wise friend who remembers everything they\'ve shared',
      cheerful: '- Upbeat, encouraging, and optimistic — always highlight the bright side\n- Enthusiastic and energetic, use more emoji and exclamation naturally\n- Celebrate wins big and small, make the user feel great about their progress',
      direct: '- Straightforward and efficient — get to the point quickly\n- No fluff, give clear actionable insights\n- Still caring but prefer brevity and clarity over warmth',
      playful: '- Light-hearted, witty, and fun — use humor and creative language\n- Make journaling feel like chatting with a clever friend\n- Use playful metaphors and keep things engaging',
      gentle: '- Extra soft, nurturing, and patient\n- Prioritize emotional validation above all else\n- Use soothing language, take things slowly, never push',
    };

    const tone = personalityTones[options?.personality || 'balanced'] || personalityTones.balanced;

    const systemMessage = `You are Insight, an AI companion embedded in a journaling app. You have access to the user's journal entries and can reference them to provide personalized support.

Your personality:
${tone}
- You use "you" and speak directly to them
- Concise but thoughtful — 2-4 sentences per response unless they ask for more
- You can reference specific entries, emotions, patterns, and themes from their journal
- When they ask about their history, quote or paraphrase specific entries
- Suggest actionable insights based on patterns you notice
- Never be preachy or give unsolicited advice — ask before suggesting
- If they seem distressed, be extra gentle and validating

You are NOT a therapist. You're a supportive companion who helps them reflect and discover patterns in their own words.

CRITICAL RULE: Only reference journal entries that are explicitly provided below. If no entries are provided, you MUST tell the user they have no entries yet. NEVER fabricate, imagine, or hallucinate journal content.${journalContext}`;

    try {
      console.log('[mobileAiService] Building API messages...');
      const apiMessages = [
        { role: 'system', content: systemMessage },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ];

      console.log('[mobileAiService] Calling Groq proxy...');
      const response = await callGroqProxy(apiMessages, {
        temperature: 0.85,
        max_tokens: 600,
        model: 'llama-3.3-70b-versatile',
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
   * Generate suggested conversation starters based on recent journal entries.
   */
  async getChatSuggestions(): Promise<string[]> {
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !currentUser) return defaultChatSuggestions;

    console.log('[mobileAiService] getChatSuggestions for user:', currentUser.id);
    const { data: entries } = await supabase
      .from('notes')
      .select('content, created_at, ai_structured_insights')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!entries || entries.length === 0) return defaultChatSuggestions;

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


