// Minimal mobile AI service that mirrors the web aiService.analyzeEntry
import { Platform } from 'react-native';
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

// Groq Chat Completions endpoint (OpenAI-compatible)
const GROQ_API_URL = (process.env.EXPO_PUBLIC_GROQ_API_URL as string) ||
  'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY as string || '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';

if (!GROQ_API_URL || !GROQ_API_KEY) {
  console.warn('[mobileAiService] Missing EXPO_PUBLIC_GROQ_API_URL or EXPO_PUBLIC_GROQ_API_KEY. Analysis will fail.');
}

async function waitForRateLimit() {
  // Simple client-side rate limit spacer used on web as well
  return new Promise((resolve) => setTimeout(resolve, 500));
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
    7. **Tone**: Write with warmth and empathy, like a supportive therapist speaking directly to the person.`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: options?.signal,
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemInstruction,
            },
            {
              role: 'user',
              content: enhancedPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[mobileAiService] Non-OK response from GROQ API', response.status, text);
        throw new Error(`AI analysis failed with status ${response.status}`);
      }

      const data = await response.json();
      const analysisText: string = data.choices?.[0]?.message?.content || '';

      if (!analysisText || analysisText.trim() === '') {
        throw new Error('Empty AI response');
      }

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
};
