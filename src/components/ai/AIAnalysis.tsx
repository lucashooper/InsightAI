import React, { useState, useEffect } from 'react';
import type { DiaryEntry } from '../../types/diary';
import type { EnhancedAIAnalysis } from '../../services/aiService';
import { aiService } from '../../services/aiService';
import { storageAdapter } from '../../services/storageAdapter';
import { actionableInsightsService } from '../../services/actionableInsightsService';
import InsightsReport from './InsightsReport';
import ChatBubble from './ChatBubble';
// import TriggerTimeline from './TriggerTimeline'; // Unused
import ImmersiveLoadingScreen from './ImmersiveLoadingScreen';
import { PremiumIcons } from '../icons/PremiumIcons';
import { InsightBriefingModal } from '../modals/InsightBriefingModal';

interface AIAnalysisProps {
  note: DiaryEntry | null;
  setActiveView: (view: 'editor' | 'dashboard' | 'settings' | 'playbook') => void;
  onUpdateNote: (id: string, updates: Partial<DiaryEntry>) => void;
}

type AnalysisTab = 'chat' | 'insights' | 'trends';

const AIAnalysis: React.FC<AIAnalysisProps> = ({ note, setActiveView, onUpdateNote }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [analysis, setAnalysis] = useState<EnhancedAIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState<string>('');
  const [isContentChangedDismissed, setIsContentChangedDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalysisTab>('chat');
  // Removed unused preview state to satisfy strict TS
  // const [isResponseExpanded, setIsResponseExpanded] = useState(false);
  const [savedAIResponse, setSavedAIResponse] = useState<{
    ai_response_text?: string;
    ai_structured_insights?: any;
    ai_last_analyzed?: string;
    ai_insights?: any;
  } | null>(null);
  
  // New state for chat functionality
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'assistant' | 'user', content: string }>>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [rawAIResponse, setRawAIResponse] = useState<string | null>(null);

  // Trigger Timeline state - Commented out until feature is implemented
  // const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  // const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
  // const [shouldShowTimeline, setShouldShowTimeline] = useState(false);
  
  // Track if we're loading saved analysis
  const [isLoadingSavedAnalysis, setIsLoadingSavedAnalysis] = useState(false);
  
  // Briefing Modal state
  const [showBriefingModal, setShowBriefingModal] = useState(false);

  // Load saved analysis when note changes
  useEffect(() => {
    if (note?.id) {
      loadSavedAIResponse(note.id);
      setConversationHistory([]); // Clear conversation history for new note
      setUserInput(''); // Clear user input
      // setIsResponseExpanded(false); // Reset expanded state when note changes
    } else {
      setSavedAIResponse(null);
      setConversationHistory([]);
      setUserInput('');
    }
  }, [note?.id, note?.ai_analysis]);

  // Clear saved error messages and trigger fresh analysis
  const clearSavedErrors = async () => {
    if (note?.id && savedAIResponse?.ai_response_text) {
      const response = savedAIResponse.ai_response_text;
      if (response.includes("Sorry, Prism's response could not be understood") ||
          response.includes('Failed to parse Prism response') ||
          response.includes('Prism service error')) {
        console.log('🧹 Clearing saved error message and triggering fresh analysis...');
        setSavedAIResponse(null);
        // Clear the error message from database
        try {
          await storageAdapter.saveAIResponse(note.id, {
            conversationalResponse: '',
            structuredInsights: null,
          });
          console.log('✅ Cleared error message from database');
        } catch (error) {
          console.error('❌ Failed to clear error message:', error);
        }
      }
    }
  };

  // Load saved AI response from database
  const loadSavedAIResponse = async (noteId: string) => {
    setIsLoadingSavedAnalysis(true);
    try {
      // First check if the new schema exists
      const hasNewSchema = await storageAdapter.checkAISchema();
      
      if (hasNewSchema) {
        const aiResponse = await storageAdapter.getAIResponse(noteId);
        setSavedAIResponse(aiResponse);
        console.log('📊 Loaded saved AI response:', aiResponse);
        console.log('📊 Has ai_insights?', !!aiResponse?.ai_insights);
        console.log('📊 Has insights_report?', !!aiResponse?.ai_insights?.insights_report);
        console.log('📊 Key takeaways count:', aiResponse?.ai_insights?.insights_report?.keyTakeaways?.length || 0);
        
        // Initialize conversation history from saved response if available
        if (aiResponse?.ai_response_text && !aiResponse.ai_response_text.includes("Sorry, Prism's response could not be understood")) {
          setConversationHistory([{
            role: 'assistant',
            content: aiResponse.ai_response_text
          }]);
        }
        
        // Check if we need to clear error messages
        await clearSavedErrors();
      } else {
        // Fallback to legacy method
        console.log('🔄 Using legacy AI response loading...');
        setSavedAIResponse(null);
      }
    } catch (error) {
      console.error('❌ Failed to load saved AI response:', error);
      setSavedAIResponse(null);
    } finally {
      setIsLoadingSavedAnalysis(false);
    }
  };

  // Auto-analyze if content has changed significantly
  useEffect(() => {
    if (note?.content && note.content.length > 50) {
      const contentChanged = note.content !== lastAnalyzedContent;
      const hasAnalysis = note.ai_analysis || savedAIResponse?.ai_response_text;
      const isAlreadyAnalyzed = note.isAnalyzed;
      
      console.log('Auto-analysis check:', { 
        contentLength: note.content.length, 
        contentChanged, 
        hasAnalysis: !!hasAnalysis,
        isAlreadyAnalyzed,
        lastAnalyzedContent: lastAnalyzedContent.substring(0, 50) + '...'
      });
      
      // Skip auto-analysis if entry is already marked as analyzed
      if (isAlreadyAnalyzed) {
        console.log('Entry already analyzed - skipping auto-analysis');
        return;
      }
      
      // Auto-analyze if content changed significantly and no analysis exists
      if (contentChanged && !hasAnalysis) {
        console.log('Triggering auto-analysis...');
        handleAnalyze(true); // true = auto-analyze
      }
    }
  }, [note?.content, lastAnalyzedContent, note?.ai_analysis, savedAIResponse, note?.isAnalyzed]);

  const handleAnalyze = async (isAutoAnalyze = false) => {
    if (!note?.content) {
      setError('No content to analyze');
      return;
    }

    // Don't auto-analyze if we already have analysis for this content
    if (isAutoAnalyze && (note.ai_analysis || savedAIResponse?.ai_response_text) && note.content === lastAnalyzedContent) {
      return;
    }

    setIsAnalyzing(true);
    setError(null); // Clear any previous errors

    try {
      console.log('🚀 Starting AI analysis for note:', note.id);
      const result = await aiService.analyzeEntry(note.content);
      console.log('✅ AI analysis completed successfully:', result);
      
      setAnalysis(result);
      setLastAnalyzedContent(note.content);
      
      // Initialize conversation history with the initial AI response
      if (result.conversational_response) {
        setConversationHistory([{
          role: 'assistant',
          content: result.conversational_response
        }]);
      }

      // Check if we should generate trigger timeline
      checkShouldShowTimeline(result);
      
      // Save the analysis to the database using new persistence system
      if (note.id) {
        try {
          const insights = {
            mood_analysis: result.mood_analysis,
            wellbeingScore: result.wellbeingScore,
            resilienceScore: result.resilienceScore,
            key_themes: result.key_themes,
            triggers_identified: result.triggers_identified,
            thought_patterns: result.thought_patterns,
            coping_strategies: result.coping_strategies,
            progress_indicators: result.progress_indicators,
            confidence: result.confidence,
            processing_time: result.processing_time,
          };
          await storageAdapter.saveAIResponse(note.id, {
            conversationalResponse: result.conversational_response || '',
            structuredInsights: insights,
            insightsReport: result.insights_report
          });
          // Save the full analysis object to ai_insights
          await storageAdapter.saveAIInsights(note.id, result);
          console.log('✅ AI analysis saved to database with new persistence system');
          
          // Calculate analysis summary for quick stats
          const positiveCount = result.insights_report?.keyTakeaways?.filter(t => t.sentiment === 'positive').length || 0;
          const opportunityCount = result.insights_report?.keyTakeaways?.filter(t => t.sentiment === 'opportunity').length || 0;
          const totalInsights = result.insights_report?.keyTakeaways?.length || 0;
          
          // Generate actionable insights from coping strategies
          if (result.coping_strategies?.suggested && note.id) {
            try {
              actionableInsightsService.generateSuggestionsFromAnalysis(result, note.id);
              console.log('✅ Actionable insights generated and saved to playbook');
            } catch (err) {
              console.error('Error generating actionable insights:', err);
            }
          }
          
          // Update the note with analysis flag and summary
          if (onUpdateNote) {
            onUpdateNote(note.id, {
              isAnalyzed: true,
              analysisSummary: {
                positiveCount,
                opportunityCount,
                totalInsights
              }
            });
          }
          
          // Reload the saved response
          await loadSavedAIResponse(note.id);
          
          // Show briefing modal after analysis completes
          setShowBriefingModal(true);
        } catch (dbError) {
          console.error('❌ Failed to save AI analysis to database:', dbError);
          
          // Try fallback to legacy method
          try {
            console.log('🔄 Attempting fallback to legacy save method...');
            await storageAdapter.updateAIAnalysis(note.id, result);
            console.log('✅ AI analysis saved using legacy method');
          } catch (legacyError) {
            console.error('❌ Legacy save method also failed:', legacyError);
            // Don't throw here - the analysis was successful, just couldn't save
            setError('Analysis completed but could not be saved. Please try again.');
          }
        }
      }
    } catch (err: any) {
      console.error('❌ AI analysis failed:', err);
      let errorMessage = 'Failed to analyze entry. Please try again.';
      let rawResponse = err?.rawAIResponse || err?.rawResponse || null;
      if (err instanceof Error) {
        if (err.message.includes('Groq API error')) {
          if (err.message.includes('429')) {
            errorMessage = 'AI service is busy. Please wait 30 seconds and try again. The system will automatically retry once.';
          } else if (err.message.includes('401') || err.message.includes('403')) {
            errorMessage = 'AI service authentication failed. Please check your settings.';
          } else if (err.message.includes('500')) {
            errorMessage = 'AI service is temporarily unavailable. Please try again later.';
          } else {
            errorMessage = `AI service error: ${err.message}`;
          }
        } else if (err.message.includes('Failed to parse AI response')) {
          errorMessage = "Prism's response could not be understood. Here's the raw response:";
          if (err && typeof err === 'object' && 'analysisText' in err) {
            rawResponse = err.analysisText;
          }
        } else if (err.message.includes('empty response')) {
          errorMessage = 'AI service returned an empty response. Please try again.';
        }
      }
      setError(errorMessage);
      setRawAIResponse(rawResponse || null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!note?.content) {
      setError('No content to analyze');
      return;
    }

    setIsRegenerating(true);
    setError(null); // Clear any previous errors

    try {
      console.log('🔄 Regenerating AI analysis for note:', note.id);
      const result = await aiService.analyzeEntry(note.content);
      console.log('✅ AI analysis regenerated successfully:', result);
      
      setAnalysis(result);
      setLastAnalyzedContent(note.content);
      
      // Initialize conversation history with the initial AI response
      if (result.conversational_response) {
        setConversationHistory([{
          role: 'assistant',
          content: result.conversational_response
        }]);
      }
      
      // Save the analysis to the database using new persistence system
      if (note.id) {
        try {
          const insights = {
            mood_analysis: result.mood_analysis,
            wellbeingScore: result.wellbeingScore,
            resilienceScore: result.resilienceScore,
            key_themes: result.key_themes,
            triggers_identified: result.triggers_identified,
            thought_patterns: result.thought_patterns,
            coping_strategies: result.coping_strategies,
            progress_indicators: result.progress_indicators,
            confidence: result.confidence,
            processing_time: result.processing_time,
          };
          await storageAdapter.saveAIResponse(note.id, {
            conversationalResponse: result.conversational_response || '',
            structuredInsights: insights,
            insightsReport: result.insights_report
          });
          // Save the full analysis object to ai_insights
          await storageAdapter.saveAIInsights(note.id, result);
          console.log('✅ Regenerated AI analysis saved to database');
          
          // Reload the saved response
          await loadSavedAIResponse(note.id);
        } catch (dbError) {
          console.error('❌ Failed to save regenerated AI analysis to database:', dbError);
          
          // Try fallback to legacy method
          try {
            console.log('🔄 Attempting fallback to legacy save method...');
            await storageAdapter.updateAIAnalysis(note.id, result);
            console.log('✅ Regenerated AI analysis saved using legacy method');
          } catch (legacyError) {
            console.error('❌ Legacy save method also failed:', legacyError);
            // Don't throw here - the analysis was successful, just couldn't save
            setError('Analysis completed but could not be saved. Please try again.');
          }
        }
      }
            } catch (err: any) {
          console.error('❌ AI analysis regeneration failed:', err);
          let errorMessage = 'Failed to regenerate analysis. Please try again.';
          let rawResponse = err?.rawAIResponse || err?.rawResponse || null;
          if (err instanceof Error) {
            if (err.message.includes('Groq API error')) {
              if (err.message.includes('429')) {
                errorMessage = 'AI service is busy. Please wait 30 seconds and try again. The system will automatically retry once.';
          } else if (err.message.includes('401') || err.message.includes('403')) {
            errorMessage = 'AI service authentication failed. Please check your settings.';
          } else if (err.message.includes('500')) {
            errorMessage = 'AI service is temporarily unavailable. Please try again later.';
          } else {
            errorMessage = `AI service error: ${err.message}`;
          }
        } else if (err.message.includes('Failed to parse AI response')) {
          errorMessage = "Prism's response could not be understood. Here's the raw response:";
          if (err && typeof err === 'object' && 'analysisText' in err) {
            rawResponse = err.analysisText;
          }
        } else if (err.message.includes('empty response')) {
          errorMessage = 'AI service returned an empty response. Please try again.';
        }
      }
      setError(errorMessage);
      setRawAIResponse(rawResponse || null);
    } finally {
      setIsRegenerating(false);
    }
  };

  // handleConversationalOnly removed - Chat with Prism button removed from UI

  // Unused function - commented out for build
  // const copyToClipboard = (text: string) => {
  //   navigator.clipboard.writeText(text);
  // };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#2ed573';
      case 'moderate': return '#ffa502';
      case 'challenging': return '#ff4757';
      default: return '#747d8c';
    }
  };

  // Consistent color for theme categories
  // Removed unused helpers (color/icon mappers) to satisfy strict TS

  // Check if content has changed since last analysis
  const contentHasChanged = note?.content !== lastAnalyzedContent;

  const hasConversationalResponse = (analysis && analysis.conversational_response) || 
                                   savedAIResponse?.ai_response_text;

  // Helper function to truncate text for preview
  // Removed unused helper to satisfy strict TS

  // Removed unused preview helpers to satisfy strict TS

  // Removed unused preview helpers to satisfy strict TS

  const handleSendMessage = async () => {
    if (!userInput.trim() || isSendingMessage) return;

    const userMessage = userInput.trim();
    setIsSendingMessage(true);
    setError(null);

    try {
      console.log('🚀 Sending user message:', userMessage);
      
      // Optimistic update: Add user message immediately
      const userMessageObj = { role: 'user' as const, content: userMessage };
      setConversationHistory(prev => [...prev, userMessageObj]);
      setUserInput('');

      // Prepare the API payload with full conversation context
      const apiPayload = [
        { role: 'system', content: 'You are a supportive, empathetic AI diary assistant. Continue the conversation naturally and helpfully.' },
        { role: 'user', content: note?.content || '' }, // The original journal entry
        ...conversationHistory, // All previous messages
        userMessageObj // The new user message
      ];

      console.log('📤 API payload prepared:', {
        totalMessages: apiPayload.length,
        originalEntryLength: note?.content?.length || 0,
        conversationHistoryLength: conversationHistory.length
      });

      // Call AI backend with conversation context
      const response = await aiService.getConversationalResponseWithContext(apiPayload);
      console.log('✅ AI response received:', response.substring(0, 100) + '...');

      // Add AI response to conversation history
      const assistantMessageObj = { role: 'assistant' as const, content: response };
      setConversationHistory(prev => [...prev, assistantMessageObj]);

      // Save the conversation to database
      if (note?.id) {
        try {
          await storageAdapter.saveAIResponse(note.id, {
            conversationalResponse: response,
            structuredInsights: null, // Only saving conversational response
          });
          console.log('✅ Conversation saved to database');
          await loadSavedAIResponse(note.id);
        } catch (dbError) {
          console.error('❌ Failed to save conversation to database:', dbError);
        }
      }
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      
      // Remove the optimistic user message on error
      setConversationHistory(prev => prev.slice(0, -1));
      setUserInput(userMessage); // Restore the user input
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('Groq API error')) {
          if (err.message.includes('429')) {
            errorMessage = 'AI service is busy. Please wait a moment and try again.';
          } else if (err.message.includes('401') || err.message.includes('403')) {
            errorMessage = 'AI service authentication failed. Please check your settings.';
          } else if (err.message.includes('500')) {
            errorMessage = 'AI service is temporarily unavailable. Please try again later.';
          } else {
            errorMessage = `AI service error: ${err.message}`;
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Generate trigger timeline from recent entries - Feature not implemented
  const generateTriggerTimeline = async () => {
    if (!note?.content || !note.id) return;

    // setIsGeneratingTimeline(true);
    // setTimelineEvents([]);

    try {
      // Get recent notes (last 5 days)
      const allNotes = await storageAdapter.getNotes();
      const currentNoteIndex = allNotes.findIndex(n => n.id === note.id);
      
      if (currentNoteIndex === -1) {
        throw new Error('Current note not found');
      }

      // Get notes from the previous 5 days
      const previousNotes = allNotes
        .slice(currentNoteIndex + 1, currentNoteIndex + 6) // Get next 5 notes (more recent)
        .filter(n => n.content && n.content.trim().length > 20) // Only notes with substantial content
        .map(n => n.content);

      if (previousNotes.length === 0) {
        console.log('No previous notes found for timeline analysis');
        // setShouldShowTimeline(false);
        return;
      }

      console.log(`Generating trigger timeline with ${previousNotes.length} previous notes`);
      
      const events = await aiService.generateTriggerTimeline(note.content, previousNotes);
      // setTimelineEvents(events);
      // setShouldShowTimeline(true);
      console.log('Timeline events:', events); // Log to avoid unused variable warning
      
      console.log('Trigger timeline generated:', events);
    } catch (error) {
      console.log('Error generating trigger timeline:', error);
      setError('Failed to generate trigger timeline');
      // setShouldShowTimeline(false);
    } finally {
      // setIsGeneratingTimeline(false);
    }
  };

  // Check if we should show the timeline based on analysis results
  const checkShouldShowTimeline = (analysis: EnhancedAIAnalysis) => {
    // Show timeline if there are many opportunity insights (indicating a difficult day)
    const opportunityInsights = analysis.insights_report?.keyTakeaways?.filter(
      takeaway => takeaway.sentiment === 'opportunity'
    ) || [];
    
    const shouldShow = opportunityInsights.length >= 2;
    // setShouldShowTimeline(shouldShow);
    console.log('Should show timeline:', shouldShow); // Log to avoid unused warning
    
    if (shouldShow) {
      console.log('Triggering timeline generation due to multiple opportunity insights');
      generateTriggerTimeline();
    }
  };

  const hasSavedInsights = !!savedAIResponse?.ai_insights;
  const insightsToShow = hasSavedInsights ? savedAIResponse.ai_insights : analysis;
  const hasAnalysis = analysis !== null || savedAIResponse?.ai_response_text || savedAIResponse?.ai_insights || note?.isAnalyzed;

  // Auto-trigger analysis when no analysis exists (only after saved analysis has loaded)
  useEffect(() => {
    if (!isLoadingSavedAnalysis && !hasAnalysis && !isAnalyzing && note?.content && !note?.isAnalyzed) {
      console.log('🚀 Auto-triggering analysis (no existing analysis found)');
      handleAnalyze(true);
    }
  }, [note?.id, isLoadingSavedAnalysis, hasAnalysis, isAnalyzing, note?.isAnalyzed]); // Wait for saved analysis to load

  // Debug logging
  console.log('🔍 AIAnalysis render state:', {
    noteId: note?.id,
    isLoadingSavedAnalysis,
    hasAnalysis,
    hasConversationalResponse,
    isAnalyzing,
    savedAIResponse: !!savedAIResponse,
    analysis: !!analysis
  });

  return (
    <>
      {/* Immersive Full-Screen Loading */}
      <ImmersiveLoadingScreen isVisible={isAnalyzing || isRegenerating} />
      
      {(hasAnalysis || isAnalyzing) && (
        <div className="ai-analysis-container" style={{ padding: '2rem 3rem', maxWidth: '100%' }}>
          {/* Centered Header with Entry Date */}
          <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
            <h1 style={{ 
              margin: '0 0 1rem 0', 
              background: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '700',
              fontSize: '2.5rem',
              letterSpacing: '-0.02em'
            }}>
              Prism's Analysis
            </h1>
            {note && (
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)', 
                fontSize: '1.1rem',
                fontWeight: '400',
                fontStyle: 'italic',
                fontFamily: '"Georgia", "Times New Roman", serif',
                letterSpacing: '0.02em',
                opacity: 0.85
              }}>
                "{note.title || new Date(note.created_at).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}"
              </p>
            )}
            {/* Regenerate button positioned absolutely in top-right */}
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || isAnalyzing}
              title="Regenerate analysis with fresh AI insights"
              aria-label="Regenerate analysis"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                padding: '0.5rem 1rem',
                background: isRegenerating ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                cursor: isRegenerating || isAnalyzing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                opacity: isRegenerating || isAnalyzing ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isRegenerating && !isAnalyzing) {
                  e.currentTarget.style.background = 'var(--bg-quaternary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isRegenerating && !isAnalyzing) {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              <PremiumIcons.RefreshCw size={16} color="currentColor" />
              <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </button>
          </div>

          {/* Content changed indicator - subtle badge in top right */}
          {contentHasChanged && !isContentChangedDismissed && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.4rem 0.75rem',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#D97706',
              opacity: 0.85,
              zIndex: 10,
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontSize: '0.7rem' }}>⚠️</span>
              <span>Content updated</span>
              <button
                onClick={() => setIsContentChangedDismissed(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#D97706',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1rem',
                  marginLeft: '0.25rem',
                  opacity: 0.7,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                title="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div style={{
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              color: '#EF4444'
            }}>
              <strong>Error:</strong> {error}
              {rawAIResponse && (
                <pre style={{
                  marginTop: '1rem',
                  background: '#23293a',
                  color: '#E5E7EB',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowX: 'auto',
                  border: '1px solid #374151'
                }}>{rawAIResponse}</pre>
              )}
            </div>
          )}

          {/* Loading handled by ImmersiveLoadingScreen - no inline loading needed */}

          {/* Analysis Results - Tabbed Interface */}
          {hasAnalysis && !isAnalyzing && (
            <div className="card" style={{ padding: '0', background: 'transparent', border: 'none', boxShadow: 'none' }}>
              {/* Tab Navigation - Glassmorphic Design */}
              <div style={{ 
                display: 'flex', 
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                position: 'relative',
                alignItems: 'center',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderBottom: 'none'
              }}>
                <div style={{ display: 'flex', flex: 1, gap: '0.5rem', padding: '0.5rem' }}>
                  {(hasConversationalResponse || analysis) && (
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                      style={{
                        flex: 1,
                        padding: '1rem 1.5rem',
                        background: activeTab === 'chat' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        color: activeTab === 'chat' ? '#FFFFFF' : '#a0a0a0',
                        fontWeight: activeTab === 'chat' ? '600' : '500',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        backdropFilter: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== 'chat') {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== 'chat') {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#a0a0a0';
                        }
                      }}
                    >
                      <PremiumIcons.Brain size={18} color="currentColor" />
                      <span>Prism's Response</span>
                    </button>
                  )}
                  
                  {analysis && (
                    <button
                      onClick={() => setActiveTab('insights')}
                      className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
                      style={{
                        flex: 1,
                        padding: '1rem 1.5rem',
                        background: activeTab === 'insights' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        color: activeTab === 'insights' ? '#FFFFFF' : '#a0a0a0',
                        fontWeight: activeTab === 'insights' ? '600' : '500',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        backdropFilter: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== 'insights') {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== 'insights') {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#a0a0a0';
                        }
                      }}
                    >
                      <PremiumIcons.BarChart size={18} color="currentColor" />
                      <span>Structured Insights</span>
                    </button>
                  )}
                  
                </div>
              </div>

              {/* Tab Content */}
              <div style={{ padding: '2rem' }}>
                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <div>
                    {/* Display full InsightsReport (without duplicate summary) */}
                    {(insightsToShow?.insights_report || analysis?.insights_report) && (
                      <div style={{ marginBottom: '2rem' }}>
                        <InsightsReport 
                          insights={insightsToShow?.insights_report || analysis?.insights_report} 
                          noteId={note?.id}
                          setActiveView={setActiveView}
                        />
                      </div>
                    )}
                    
                    {/* Chat Log Area */}
                    <div className="chat-log-area" style={{ marginBottom: '0.5rem' }}>
                      {/* Show actionable suggestion as first message */}
                      {(insightsToShow?.insights_report?.actionableSuggestion || analysis?.insights_report?.actionableSuggestion) && conversationHistory.length === 0 && (
                        <ChatBubble 
                          message={{
                            role: 'assistant',
                            content: `**One thing to try next:**\n\n${(insightsToShow?.insights_report?.actionableSuggestion || analysis?.insights_report?.actionableSuggestion)?.suggestion}`
                          }}
                        />
                      )}
                      
                      {conversationHistory.length > 0 && (
                        conversationHistory.map((message, index) => (
                          <ChatBubble key={index} message={message} />
                        ))
                      )}
                      {/* Loading indicator for AI response */}
                      {isSendingMessage && (
                        <div className="chat-message-line assistant-line">
                          <div className="avatar-container">
                            <div className="prism-avatar">
                              <span className="prism-icon">🔮</span>
                            </div>
                          </div>
                          <div className="bubble-content">
                            <span className="sender-name">Prism</span>
                            <div className="chat-bubble assistant">
                              <div className="message-content">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>Typing</span>
                                  <div className="typing-dots">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Chat Input Component */}
                    <div className="chat-input-container" style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'var(--bg-primary)',
                      borderTop: '1px solid var(--border-color)'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-end'
                      }}>
                        <textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Ask a follow-up question about these insights..."
                          style={{
                            flex: 1,
                            minHeight: '44px',
                            maxHeight: '120px',
                            padding: '0.75rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem',
                            lineHeight: '1.5',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!userInput.trim() || isSendingMessage}
                          style={{
                            padding: '0.75rem',
                            background: userInput.trim() && !isSendingMessage ? '#10b981' : '#374151',
                            border: 'none',
                            borderRadius: '50%',
                            color: '#FFFFFF',
                            cursor: userInput.trim() && !isSendingMessage ? 'pointer' : 'not-allowed',
                            opacity: userInput.trim() && !isSendingMessage ? 1 : 0.5,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            boxShadow: userInput.trim() && !isSendingMessage ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (userInput.trim() && !isSendingMessage) {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = userInput.trim() && !isSendingMessage ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none';
                          }}
                          title="Send message"
                        >
                          {isSendingMessage ? (
                            <span style={{ fontSize: '1rem' }}>⏳</span>
                          ) : (
                            <span style={{ fontSize: '1.2rem' }}>↑</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insights Tab */}
                {activeTab === 'insights' && insightsToShow && (
                  <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    width: '100%'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#E5E7EB',
                      marginBottom: '2rem',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      <PremiumIcons.BarChart size={24} color="#E5E7EB" />
                      Structured Insights
                    </h3>
                    
                    {/* Two-Column Grid Layout for Desktop */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr',
                      gap: '1.75rem',
                      marginBottom: '2rem',
                      alignItems: 'start'
                    }}>
                      {/* Column 1: Mood Analysis Card */}
                      <div className="analysis-card" style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '1.5rem',
                        height: '100%',
                        gridRow: window.innerWidth > 1024 ? 'span 2' : 'auto'
                      }}>
                      <h4 className="card-title">
                        <span className="icon">📈</span>
                        Mood Analysis
                      </h4>
                      
                      {/* Hero Stat - Primary Emotion */}
                      <div className="mood-hero">
                        <span className="mood-label">Primary Emotion</span>
                        <h3 className="mood-value">{insightsToShow.mood_analysis.primary_emotion}</h3>
                      </div>
                      
                      {/* Secondary Stats */}
                      <div className="secondary-stats">
                        <div className="stat-item">
                          <span className="stat-label">Intensity</span>
                          <span className="stat-value">{insightsToShow.mood_analysis.intensity}/10</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Trend</span>
                          <span className="stat-value">{insightsToShow.mood_analysis.mood_trend}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Confidence</span>
                          <span className="stat-value">{insightsToShow.mood_analysis.confidence}%</span>
                        </div>
                      </div>
                      </div>

                      {/* Key Themes Card */}
                      {insightsToShow.key_themes.length > 0 && (
                        <div className="analysis-card" style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '1.5rem',
                          height: '100%'
                        }}>
                        <h4 className="card-title">
                          <span className="icon">🎯</span>
                          Key Themes
                        </h4>
                        <div className="themes-list">
                          {insightsToShow.key_themes.map((theme: any, index: number) => (
                            <div key={index}>
                              <div className="theme-item">
                                <h4 className="theme-title">{theme.theme}</h4>
                                <div className="theme-tags">
                                  <span className={`tag tag-priority-${theme.emotional_impact}`}>
                                    {theme.emotional_impact}
                                  </span>
                                  <span className={`tag tag-${theme.category}`}>
                                    {theme.category.charAt(0).toUpperCase() + theme.category.slice(1)}
                                  </span>
                                  {theme.is_recurring && (
                                    <span className="tag tag-recurring">
                                      🔄 Recurring
                                    </span>
                                  )}
                                </div>
                              </div>
                              {index < insightsToShow.key_themes.length - 1 && (
                                <hr className="theme-divider" />
                              )}
                            </div>
                          ))}
                        </div>
                        </div>
                      )}

                      {/* Coping Strategies Card */}
                      {insightsToShow.coping_strategies.suggested.length > 0 && (
                        <div className="analysis-card" style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '1.5rem',
                          height: '100%'
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h4 className="card-title" style={{ margin: 0 }}>
                            <span className="icon">🛡️</span>
                            Coping Strategies
                          </h4>
                          <button
                            onClick={() => {
                              if (note?.id) {
                                actionableInsightsService.generateSuggestionsFromAnalysis(
                                  { coping_strategies: insightsToShow.coping_strategies },
                                  note.id
                                );
                                alert('Strategies saved to your Personal Playbook!');
                              }
                            }}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: '#3b82f6',
                              border: 'none',
                              borderRadius: '6px',
                              color: 'white',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <PremiumIcons.Target size={14} />
                            Add to Playbook
                          </button>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {insightsToShow.coping_strategies.suggested.map((strategy: any, index: number) => (
                            <div key={index} style={{
                              padding: '1.5rem',
                              background: 'rgba(56, 189, 248, 0.08)',
                              borderRadius: '12px',
                              border: '2px solid rgba(56, 189, 248, 0.2)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontWeight: '600', color: '#E5E7EB' }}>{strategy.strategy}</span>
                                <span style={{ 
                                  fontSize: '0.8rem',
                                  padding: '0.25rem 0.75rem',
                                  background: getDifficultyColor(strategy.difficulty),
                                  color: 'white',
                                  borderRadius: '8px',
                                  fontWeight: '500'
                                }}>
                                  {strategy.difficulty}
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.9rem', color: '#9CA3AF', lineHeight: '1.6' }}>
                                {strategy.why_helpful}
                              </p>
                            </div>
                          ))}
                        </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Trends Tab */}
                {activeTab === 'trends' && (
                  <div>
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem',
                      color: '#9CA3AF',
                      background: '#1F2937',
                      borderRadius: '12px',
                      border: '1px solid #374151'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                      <h4 style={{ color: '#E5E7EB', marginBottom: '0.5rem' }}>Mood Trends</h4>
                      <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
                        Your mood trends and historical data are now available in the main dashboard.
                      </p>
                      <button
                        className="primary-button"
                        onClick={() => setActiveView('dashboard')}
                        style={{
                          fontSize: '0.9rem',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        📈 View Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Insight Briefing Modal */}
      {analysis && showBriefingModal && (
        <InsightBriefingModal
          isOpen={showBriefingModal}
          primaryEmotion={analysis.mood_analysis.primary_emotion}
          emotionIntensity={analysis.mood_analysis.intensity}
          summaryText={analysis.insights_report?.conversationalSummary || 'Your insights are ready to explore.'}
          topEmotions={
            analysis.mood_analysis.secondary_emotions.slice(0, 3).map((emotion, index) => ({
              emotion: emotion,
              percentage: Math.round((3 - index) * 15) // Simple percentage calculation
            }))
          }
          onViewFullAnalysis={() => setShowBriefingModal(false)}
        />
      )}
    </>
  );
};

export default AIAnalysis; 