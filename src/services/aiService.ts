import { PatternDetectionService } from './patternDetectionService';
import { supabase } from './supabaseClient';
import { chat } from '../lib/localLLM';
import { getLLMProvider } from '../lib/llmProvider';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Rate limiting variables (only for cloud APIs)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests for cloud APIs

// Rate limiting function - only applies to cloud providers
const waitForRateLimit = async () => {
  const provider = getLLMProvider();
  
  // Skip rate limiting for local LLM (it's your own server!)
  if (provider === 'local') {
    return;
  }
  
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏳ Rate limiting: waiting ${waitTime}ms before next request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

export interface MoodAnalysis {
  primary_emotion: string;
  intensity: number;
  secondary_emotions: string[];
  mood_trend: "improving" | "declining" | "stable";
  confidence: number;
}

export interface TriggerAnalysis {
  trigger: string;
  context: string;
  emotional_impact: "high" | "medium" | "low";
}

export interface ThoughtPattern {
  pattern: string;
  type: "rumination" | "catastrophizing" | "mind_reading" | "all_or_nothing" | "overgeneralization" | "emotional_reasoning";
  frequency: "occasional" | "frequent" | "persistent";
}

export interface CopingStrategy {
  strategy: string;
  why_helpful: string;
  difficulty: "easy" | "moderate" | "challenging";
}

export interface TimelineEvent {
  relative_date: string;
  trigger_summary: string;
}

export interface EnhancedAIAnalysis {
  mood_analysis: MoodAnalysis;
  wellbeingScore: number; // New: 1-10 score representing emotional state
  resilienceScore: number; // New: score representing active effort/coping
  key_themes: Array<{
    theme: string;
    emotional_impact: "high" | "medium" | "low";
    category: "work" | "relationships" | "family" | "health" | "personal" | "other";
    is_recurring: boolean;
  }>;
  triggers_identified: TriggerAnalysis[];
  thought_patterns: ThoughtPattern[];
  coping_strategies: {
    current: string[];
    suggested: CopingStrategy[];
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
      sentiment: "positive" | "opportunity";
      category: string;
    }>;
    actionableSuggestion: {
      title: string;
      suggestion: string;
    };
  };
  conversational_response?: string; // Legacy field for backward compatibility
}

export const aiService = {
  // Analyze a single diary entry with enhanced prompt
  async analyzeEntry(content: string): Promise<EnhancedAIAnalysis> {
    // Apply rate limiting
    await waitForRateLimit();
    
    const startTime = Date.now();
    
    const enhancedPrompt = `You are an expert mental health AI assistant with training in CBT, DBT, and positive psychology. Analyze this diary entry with deep psychological insight and empathy.

Your goal is to provide personalized, specific insights that feel like they come from someone who truly understands the user's unique experience. Avoid generic responses.

CRITICAL INSTRUCTIONS:
1. **Read the entry carefully** - Notice specific details, events, emotions, and patterns mentioned
2. **Be specific** - Reference actual words, phrases, and situations from the entry
3. **Avoid generic language** - Don't use phrases like "you've been navigating challenges" or "you showed resilience"
4. **Connect insights to evidence** - Every insight should point to something concrete in the text
5. **Personalize suggestions** - Tailor coping strategies to the specific triggers and patterns you identify

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
    "conversationalSummary": "Write 2-3 sentences that show you truly read and understood this specific entry. Reference actual events, feelings, or situations they mentioned. Be warm but specific - avoid phrases like 'you've been navigating challenges' or 'you showed resilience'. Instead, say things like 'I noticed you felt overwhelmed when your boss gave you that last-minute project' or 'It sounds like the conversation with your friend really lifted your spirits.'",
    "keyTakeaways": [
      {
        "insight": "A specific observation that quotes or closely references the user's actual words. Use *key phrases* to highlight. BAD: 'You practiced self-care.' GOOD: 'You recognized you needed a break and *watched your favorite show* to decompress after the stressful meeting.'",
        "sentiment": "positive",
        "category": "Coping Strategy"
      },
      {
        "insight": "Another specific observation. BAD: 'You were distracted.' GOOD: 'You noticed yourself *scrolling Instagram for 2 hours* when you meant to work on your thesis, which left you feeling frustrated.'",
        "sentiment": "opportunity",
        "category": "Area for Growth"
      },
      {
        "insight": "Another specific observation. BAD: 'You showed self-awareness.' GOOD: 'You identified that the *derealization feeling* happens specifically when you're sleep-deprived and anxious.'",
        "sentiment": "positive",
        "category": "Self-Awareness"
      }
    ],
    "actionableSuggestion": {
      "title": "One specific thing to try based on what they wrote",
      "suggestion": "A concrete suggestion that addresses something specific from their entry. Reference their actual situation."
    }
  }
}

SCORING GUIDELINES:
- "wellbeingScore" (1-10): Rate the user's overall emotional state. High scores (8-10) for happy, content, peaceful entries. Low scores (1-3) for sad, anxious, distressed entries. Medium scores (4-7) for mixed or neutral emotions.
- "resilienceScore" (1-10): Count active coping efforts and positive actions. Each instance of "Coping Strategy", "Self-Awareness", "Achievement", "Anxiety Management" counts as 1 point. Base score of 3, add 1-2 points for each positive action identified, max 10.

IMPORTANT GUIDELINES:
- The "conversationalSummary" should be warm and empathetic, like a supportive friend's response
- Use "positive" sentiment for achievements, good habits, and self-awareness
- Use "opportunity" sentiment for areas where the user can grow or improve (not negative!)
- In insights, wrap key phrases with *asterisks* for highlighting
- The actionableSuggestion should be specific and immediately doable
- Be encouraging and constructive throughout

CRITICAL: For "coping_strategies.suggested":
- Strategy titles MUST be specific, actionable recommendations (e.g., "Try limiting caffeine to one cup before noon", NOT "Reflect on this pattern")
- Connect each strategy directly to patterns, emotions, or triggers identified in THIS specific entry
- In "why_helpful", reference concrete details from the user's experience (e.g., "You mentioned feeling anxious on days you drink caffeine" or "This addresses your recurring pattern of sleep issues")
- Make suggestions practical and immediately implementable
- Avoid generic advice - be specific to what the user is experiencing

Examples of GOOD strategy titles:
- "Try limiting caffeine to one cup before noon"
- "Take a 10-minute walk when you notice anxiety building"
- "Practice 4-7-8 breathing before bed to help with sleep"
- "Set a timer to check in with yourself every 2 hours"
- "Journal for 5 minutes when feeling overwhelmed"

Examples of BAD strategy titles (DO NOT USE):
- "Reflect on this pattern"
- "Consider your habits"
- "Think about your feelings"
- "Work on self-care"

FINAL REMINDER - CRITICAL:
Before you respond, ask yourself:
1. Did I reference specific details from the entry?
2. Would the user feel like I actually read their words?
3. Are my insights personalized to THEIR experience, not generic advice?
4. Did I avoid vague phrases like "navigating challenges" or "showed resilience"?

If you answered NO to any of these, revise your response to be more specific.

Entry text: ${content}`;

    try {
      // Get user's preferred LLM provider
      const provider = getLLMProvider();
      console.log(`🤖 Using ${provider === 'local' ? 'LOCAL (LM Studio)' : 'CLOUD (OpenAI)'} for AI analysis`);
      
      // Use unified chat interface (non-streaming)
      const response = await chat([
        {
          role: 'system',
          content: 'You are an expert mental health AI assistant trained in CBT, DBT, and positive psychology. Your responses must be highly personalized and specific. ALWAYS reference actual details from the user\'s entry - specific events, feelings, situations they mentioned. NEVER use generic phrases like "you\'ve been navigating challenges" or "you showed resilience". Instead, reference their actual words and experiences. When suggesting coping strategies, provide specific, actionable titles like "Try limiting caffeine to one cup before noon" or "Take a 10-minute walk when you notice anxiety building". Make every insight feel like it comes from someone who truly read and understood their unique experience.',
        },
        {
          role: 'user',
          content: enhancedPrompt,
        },
      ], {
        provider,
        temperature: 0.7,
        stream: false, // Explicitly disable streaming
      });

      // Type assertion since we know it's not a stream
      const analysisText = (response as any).choices?.[0]?.message?.content || '';
      
      console.log(`✅ ${provider === 'local' ? 'LOCAL LLM' : 'OPENAI'} response received:`, {
        provider,
        model: provider === 'local' ? 'ChatGPT-OSS-20B' : 'GPT-4o-mini',
        responseLength: analysisText.length,
        first100: analysisText.substring(0, 100)
      });
      
      if (!analysisText || analysisText.trim() === '') {
        throw new Error(`${provider} API returned empty response.`);
      }
      
      const processingTime = Date.now() - startTime;
      
      // Handle the AI response - check if it's already an object or needs parsing
      try {
        // Debug: Log the raw response before processing
        console.log('🔍 Raw AI response before processing:', {
          type: typeof analysisText,
          length: analysisText?.length || 'N/A',
          first100: typeof analysisText === 'string' ? analysisText.substring(0, 100) : 'Not a string',
          containsJson: typeof analysisText === 'string' ? analysisText.includes('{') : 'N/A',
          containsMoodAnalysis: typeof analysisText === 'string' ? analysisText.includes('mood_analysis') : 'N/A'
        });
        
        let parsedAnalysis;
        // First, try to parse the entire response as JSON
        try {
          parsedAnalysis = JSON.parse(analysisText);
          console.log('✅ Successfully parsed entire response as JSON');
        } catch (jsonParseError) {
          // If that fails, use regex to extract the largest JSON object from the string
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          let cleanJsonString = '';
          if (jsonMatch) {
            cleanJsonString = jsonMatch[0];
            console.log('🔧 Regex extracted JSON string:', {
              originalLength: analysisText.length,
              cleanLength: cleanJsonString.length,
              cleanJsonPreview: cleanJsonString.substring(0, 200) + '...'
            });
            parsedAnalysis = JSON.parse(cleanJsonString);
            console.log('✅ Successfully extracted and parsed clean JSON');
          } else {
            throw new Error('Could not find a valid JSON object in the response.');
          }
        }
        
        console.log('✅ JSON parsing successful! Parsed analysis:', {
          hasMoodAnalysis: !!parsedAnalysis.mood_analysis,
          hasConversationalResponse: !!parsedAnalysis.conversational_response,
          conversationalResponseLength: parsedAnalysis.conversational_response?.length || 0
        });
        
        // Validate the parsed object structure
        if (!parsedAnalysis || typeof parsedAnalysis !== 'object') {
          throw new Error('Invalid data structure received from AI');
        }
        
        // Ensure all required fields exist with defaults
        const enhancedAnalysis: EnhancedAIAnalysis = {
          mood_analysis: {
            primary_emotion: parsedAnalysis.mood_analysis?.primary_emotion || 'neutral',
            intensity: parsedAnalysis.mood_analysis?.intensity || 5,
            secondary_emotions: parsedAnalysis.mood_analysis?.secondary_emotions || [],
            mood_trend: parsedAnalysis.mood_analysis?.mood_trend || 'stable',
            confidence: parsedAnalysis.mood_analysis?.confidence || 70,
          },
          wellbeingScore: parsedAnalysis.wellbeingScore || 5,
          resilienceScore: parsedAnalysis.resilienceScore || 5,
          key_themes: parsedAnalysis.key_themes || [],
          triggers_identified: parsedAnalysis.triggers_identified || [],
          thought_patterns: parsedAnalysis.thought_patterns || [],
          coping_strategies: {
            current: parsedAnalysis.coping_strategies?.current || [],
            suggested: parsedAnalysis.coping_strategies?.suggested || [],
          },
          progress_indicators: {
            positive_signals: parsedAnalysis.progress_indicators?.positive_signals || [],
            areas_for_growth: parsedAnalysis.progress_indicators?.areas_for_growth || [],
          },
          processing_time: processingTime,
          confidence: parsedAnalysis.confidence || 70,
          conversational_response: parsedAnalysis.conversational_response || '',
        };
        
        // Clean up insights report if it contains JSON artifacts or preamble
        let cleanInsightsReport = parsedAnalysis.insights_report;
        if (cleanInsightsReport) {
          // Clean up conversational summary
          if (cleanInsightsReport.conversationalSummary) {
            cleanInsightsReport.conversationalSummary = cleanInsightsReport.conversationalSummary
              .replace(/^\s*Here is the JSON response:?\s*/i, '')
              .replace(/^\s*Here is the analysis of the diary entry.*?:?\s*/i, '')
              .replace(/^\s*In the specified JSON format:?\s*/i, '')
              .replace(/^\s*Response:?\s*/i, '')
              .replace(/^\s*\{[\s\S]*\}$/i, '')
              .replace(/^\s*"/, '')
              .replace(/"\s*$/, '')
              .trim();
          }
          
          // Clean up key takeaways
          if (cleanInsightsReport.keyTakeaways) {
            cleanInsightsReport.keyTakeaways = cleanInsightsReport.keyTakeaways.map((takeaway: any) => ({
              ...takeaway,
              insight: takeaway.insight
                .replace(/^\s*"/, '')
                .replace(/"\s*$/, '')
                .trim()
            }));
          }
          
          // Clean up actionable suggestion
          if (cleanInsightsReport.actionableSuggestion) {
            cleanInsightsReport.actionableSuggestion.suggestion = cleanInsightsReport.actionableSuggestion.suggestion
              .replace(/^\s*"/, '')
              .replace(/"\s*$/, '')
              .trim();
          }
        }
        
        enhancedAnalysis.insights_report = cleanInsightsReport;
        
        // Keep legacy conversational_response for backward compatibility
        enhancedAnalysis.conversational_response = cleanInsightsReport?.conversationalSummary || '';
        
        // Trigger pattern detection in the background
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Run pattern detection asynchronously (don't wait for it)
            PatternDetectionService.runPatternDetection(user.id).catch(error => {
              console.error('Pattern detection failed:', error);
            });
          }
        } catch (error) {
          console.error('Failed to trigger pattern detection:', error);
        }
        
        return enhancedAnalysis;
      } catch (parseError) {
        // VERIFICATION: Enhanced logging to diagnose corrupted JSON
        console.log("VERIFICATION: The string that failed to parse is this long:", analysisText.length);
        console.log("VERIFICATION: The last 100 characters of the string are:", analysisText.substring(analysisText.length - 100));
        console.log("VERIFICATION: The first 100 characters of the string are:", analysisText.substring(0, 100));
        
        // Enhanced error logging for JSON parsing failures
        console.error("🚨 Failed to parse AI response. See details below.");
        console.error("Original Error:", parseError);
        console.error("Raw data received from AI:", analysisText);
        console.error("Response length:", analysisText.length);
        console.error("First 200 characters:", analysisText.substring(0, 200));
        console.error("Last 200 characters:", analysisText.substring(analysisText.length - 200));
        
        // Additional debugging for common JSON issues
        console.error("🔍 JSON Debug Info:", {
          hasOpeningBrace: analysisText.includes('{'),
          hasClosingBrace: analysisText.includes('}'),
          braceCount: (analysisText.match(/{/g) || []).length,
          closingBraceCount: (analysisText.match(/}/g) || []).length,
          hasQuotes: analysisText.includes('"'),
          hasNewlines: analysisText.includes('\n'),
          hasTabs: analysisText.includes('\t')
        });
        
        // Try to extract conversational response from the raw text
        let conversationalResponse = 'Sorry, the AI response could not be understood. Please try again.';
        if (analysisText && typeof analysisText === 'string') {
          // Look for any text that might be a conversational response
          const lines = analysisText.split('\n');
          const nonJsonLines = lines.filter(line => 
            !line.trim().startsWith('{') && 
            !line.trim().startsWith('}') && 
            !line.trim().startsWith('"') &&
            line.trim().length > 20
          );
          if (nonJsonLines.length > 0) {
            conversationalResponse = nonJsonLines.join('\n');
            console.log('🔧 Extracted conversational response from raw text:', conversationalResponse.substring(0, 100) + '...');
            // Return a fallback analysis object with just the conversational response
            return {
              mood_analysis: {
                primary_emotion: 'neutral',
                intensity: 5,
                secondary_emotions: [],
                mood_trend: 'stable',
                confidence: 30,
              },
              wellbeingScore: 5,
              resilienceScore: 3,
              key_themes: [],
              triggers_identified: [],
              thought_patterns: [],
              coping_strategies: {
                current: [],
                suggested: [],
              },
              progress_indicators: {
                positive_signals: [],
                areas_for_growth: ['Continue journaling regularly'],
              },
              processing_time: Date.now() - startTime,
              confidence: 30,
              conversational_response: conversationalResponse,
            } as EnhancedAIAnalysis;
          }
        }
        // If no conversational response, throw error with raw text
        const error = new Error("Failed to parse AI response");
        (error as any).analysisText = analysisText;
        throw error;
      }
    } catch (error) {
      console.error('🚨 Error analyzing entry:', error);
      throw error;
    }
  },

  // Get a conversational response with full conversation context
  async getConversationalResponseWithContext(messages: Array<{ role: string; content: string }>): Promise<string> {
    // Apply rate limiting
    await waitForRateLimit();
    
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle rate limiting with retry logic
        if (response.status === 429) {
          console.log('🔄 Rate limited, waiting 5 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          // Retry once
          const retryResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: messages,
              temperature: 0.7,
              max_tokens: 1000,
            }),
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            const retryContent = retryData.choices?.[0]?.message?.content || '';
            return retryContent;
          }
        }
        
        throw new Error(`Groq API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      if (!content.trim()) {
        throw new Error('AI service returned empty response');
      }

      return content;
    } catch (error) {
      console.error('Error getting conversational response with context:', error);
      throw error;
    }
  },

  // Get a conversational response only (ChatGPT-style)
  async getConversationalResponse(content: string): Promise<string> {
    // Apply rate limiting
    await waitForRateLimit();
    
    const prompt = `You are a supportive, empathetic friend or therapist. Read this diary entry and respond naturally as if you're having a conversation with the person. 

Your response should:
- Acknowledge and validate their feelings
- Show understanding of their situation
- Offer gentle insights and observations
- Be encouraging and supportive
- Feel like a warm, caring conversation
- Be 2-3 paragraphs long

Write in a natural, conversational tone. Don't be clinical or robotic. Be the kind of response you'd give to a friend who's sharing their thoughts with you.

Diary entry: ${content}`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('🚨 Groq API error for conversational response:', response.status, errorText);
        

        
        throw new Error(`Groq API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const responseText = data.choices[0]?.message?.content || 'Unable to generate response.';
      
      console.log('✅ Conversational response generated successfully:', {
        length: responseText.length,
        preview: responseText.substring(0, 100)
      });
      
      return responseText;
    } catch (error) {
      console.error('🚨 Error getting conversational response:', error);
      throw error;
    }
  },

  // Analyze multiple entries for weekly patterns
  async analyzeWeeklyPatterns(entries: string[]): Promise<any> {
    // Currently not used; keep function to satisfy type references
    return Promise.resolve({ entriesAnalyzed: entries.length });
  },

  // Generate trigger timeline from recent entries
  async generateTriggerTimeline(currentNoteContent: string, previousNotesArray: string[]): Promise<TimelineEvent[]> {
    // Apply rate limiting
    await waitForRateLimit();
    
    const previousNotesText = previousNotesArray.map((note, index) => 
      `Entry from ${index + 1} day${index === 0 ? '' : 's'} ago: ${note}`
    ).join('\n\n');

    const prompt = `You are a psychological insight assistant. A user is having a difficult day. 

Their current journal entry is: "${currentNoteContent}"

Here are their entries from the preceding days, starting with the most recent:
${previousNotesText}

Your task is to analyze the preceding entries and identify a sequence of up to 3 key events, feelings, or stressors that likely contributed to today's state. 

Respond ONLY with a valid JSON array of objects. Each object must have exactly two keys:
- "relative_date": a string like "Yesterday", "2 days ago", "3 days ago", etc.
- "trigger_summary": a concise one-sentence description of the trigger event

Example response format:
[
  {
    "relative_date": "Yesterday",
    "trigger_summary": "You mentioned feeling a strong sense of derealization and anxiety."
  },
  {
    "relative_date": "3 days ago", 
    "trigger_summary": "You described significant stress related to a work project."
  }
]

Focus on identifying causal relationships and patterns that could explain today's emotional state. Be specific but concise.`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content || '';
      
      if (!responseText.trim()) {
        throw new Error('AI service returned empty response');
      }

      // Parse the JSON response
      let timelineEvents: TimelineEvent[];
      try {
        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          timelineEvents = JSON.parse(jsonMatch[0]);
        } else {
          timelineEvents = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('Failed to parse timeline response:', parseError);
        console.error('Raw response:', responseText);
        throw new Error('Failed to parse timeline response');
      }

      // Validate the structure
      if (!Array.isArray(timelineEvents)) {
        throw new Error('Timeline response is not an array');
      }

      // Validate each event has required fields
      timelineEvents = timelineEvents.filter(event => 
        event.relative_date && 
        event.trigger_summary &&
        typeof event.relative_date === 'string' &&
        typeof event.trigger_summary === 'string'
      );

      return timelineEvents.slice(0, 3); // Limit to 3 events
    } catch (error) {
      console.error('Error generating trigger timeline:', error);
      throw error;
    }
  },
  
  // Co-Writer: Conversational probing for deeper insight
  async probeDeeper(entryContent: string, userQuestion: string, conversationContext: string = ''): Promise<string> {
    // Apply rate limiting
    await waitForRateLimit();

    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    try {
      const systemPrompt = `You are Prism, a compassionate AI co-writer helping someone explore their thoughts and emotions more deeply. You've been given access to their journal entry.

Your role is to:
- Ask thoughtful, probing questions that help them gain clarity
- Point out patterns or connections they might not have noticed
- Offer gentle observations without being prescriptive
- Help them articulate feelings that may be difficult to express
- Be warm, empathetic, and non-judgmental

Keep your responses concise (2-3 sentences) and focused on helping them think deeper, not on giving advice.

Journal Entry:
${entryContent}

${conversationContext ? `Previous Conversation:\n${conversationContext}\n` : ''}`;

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userQuestion
            }
          ],
          temperature: 0.8,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.choices[0]?.message?.content || '';

      if (!responseText) {
        throw new Error('Empty response from Groq API');
      }

      return responseText.trim();
    } catch (error) {
      console.error('Error in probeDeeper:', error);
      throw error;
    }
  }
};