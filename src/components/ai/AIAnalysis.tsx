import React, { useState, useEffect } from 'react';
import type { DiaryEntry } from '../../types/diary';
import type { EnhancedAIAnalysis, TimelineEvent } from '../../services/aiService';
import { aiService } from '../../services/aiService';
import { storageAdapter } from '../../services/storageAdapter';
import InsightsReport from './InsightsReport';
import ChatBubble from './ChatBubble';
import Spinner from './Spinner';
import TriggerTimeline from './TriggerTimeline';

interface AIAnalysisProps {
  note: DiaryEntry | null;
  setActiveView: (view: 'editor' | 'dashboard' | 'settings' | 'alerts') => void;
  onUpdateNote: (id: string, updates: Partial<DiaryEntry>) => void;
}

type AnalysisTab = 'chat' | 'insights' | 'trends';

const AIAnalysis: React.FC<AIAnalysisProps> = ({ note, setActiveView, onUpdateNote }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [analysis, setAnalysis] = useState<EnhancedAIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationalOnly, setConversationalOnly] = useState<string>('');
  const [isGettingConversational, setIsGettingConversational] = useState(false);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState<string>('');
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

  // Trigger Timeline state
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
  const [shouldShowTimeline, setShouldShowTimeline] = useState(false);

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
    try {
      // First check if the new schema exists
      const hasNewSchema = await storageAdapter.checkAISchema();
      
      if (hasNewSchema) {
        const aiResponse = await storageAdapter.getAIResponse(noteId);
        setSavedAIResponse(aiResponse);
        console.log('Loaded saved AI response:', aiResponse);
        
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
      console.error('Failed to load saved AI response:', error);
      setSavedAIResponse(null);
    }
  };

  // Auto-analyze if content has changed significantly
  useEffect(() => {
    if (note?.content && note.content.length > 50) {
      const contentChanged = note.content !== lastAnalyzedContent;
      const hasAnalysis = note.ai_analysis || savedAIResponse?.ai_response_text;
      
      console.log('Auto-analysis check:', { 
        contentLength: note.content.length, 
        contentChanged, 
        hasAnalysis: !!hasAnalysis,
        lastAnalyzedContent: lastAnalyzedContent.substring(0, 50) + '...'
      });
      
      // Auto-analyze if content changed significantly and no analysis exists
      if (contentChanged && !hasAnalysis) {
        console.log('Triggering auto-analysis...');
        handleAnalyze(true); // true = auto-analyze
      }
    }
  }, [note?.content, lastAnalyzedContent, note?.ai_analysis, savedAIResponse]);

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
          
          // Reload the saved response
          await loadSavedAIResponse(note.id);
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

  const handleConversationalOnly = async () => {
    if (!note?.content) {
      setError('No content to analyze');
      return;
    }

    setIsGettingConversational(true);
    setError(null); // Clear any previous errors

    try {
      console.log('🚀 Getting conversational response for note:', note.id);
      const response = await aiService.getConversationalResponse(note.content);
      console.log('✅ Conversational response received:', response.substring(0, 100) + '...');
      
      setConversationalOnly(response);
      setActiveTab('chat');
      
      // Initialize conversation history with the conversational response
      setConversationHistory([{
        role: 'assistant',
        content: response
      }]);
      
      // Save the conversational response to database
      if (note.id) {
        try {
          await storageAdapter.saveAIResponse(note.id, {
            conversationalResponse: response,
            structuredInsights: null, // Only saving conversational response
          });
          console.log('✅ Conversational response saved to database');
          // Update local state in App
          if (onUpdateNote) {
            onUpdateNote(note.id, {
              ai_response_text: response,
              ai_last_analyzed: new Date().toISOString()
            });
          }
          await loadSavedAIResponse(note.id);
        } catch (dbError) {
          console.error('❌ Failed to save conversational response to database:', dbError);
          // Don't throw here - the response was successful, just couldn't save
        }
      }
    } catch (err) {
      
      let errorMessage = 'Failed to get conversational response. Please try again.';
      
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
      setIsGettingConversational(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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

  const hasConversationalResponse = conversationalOnly || 
                                   (analysis && analysis.conversational_response) || 
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

  // Generate trigger timeline from recent entries
  const generateTriggerTimeline = async () => {
    if (!note?.content || !note.id) return;

    setIsGeneratingTimeline(true);
    setTimelineEvents([]);

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
        setShouldShowTimeline(false);
        return;
      }

      console.log(`Generating trigger timeline with ${previousNotes.length} previous notes`);
      
      const events = await aiService.generateTriggerTimeline(note.content, previousNotes);
      setTimelineEvents(events);
      setShouldShowTimeline(true);
      
      console.log('Trigger timeline generated:', events);
    } catch (error) {
      console.error('Error generating trigger timeline:', error);
      setError('Failed to generate trigger timeline');
      setShouldShowTimeline(false);
    } finally {
      setIsGeneratingTimeline(false);
    }
  };

  // Check if we should show the timeline based on analysis results
  const checkShouldShowTimeline = (analysis: EnhancedAIAnalysis) => {
    // Show timeline if there are many opportunity insights (indicating a difficult day)
    const opportunityInsights = analysis.insights_report?.keyTakeaways?.filter(
      takeaway => takeaway.sentiment === 'opportunity'
    ) || [];
    
    const shouldShow = opportunityInsights.length >= 2;
    setShouldShowTimeline(shouldShow);
    
    if (shouldShow) {
      console.log('Triggering timeline generation due to multiple opportunity insights');
      generateTriggerTimeline();
    }
  };

  const hasSavedInsights = !!savedAIResponse?.ai_insights;
  const insightsToShow = hasSavedInsights ? savedAIResponse.ai_insights : analysis;
  const hasAnalysis = analysis !== null || savedAIResponse?.ai_response_text || conversationalOnly;

  // Debug logging
  console.log('🔍 AIAnalysis render state:', {
    hasAnalysis,
    hasSavedInsights,
    insightsToShow: !!insightsToShow,
    isAnalyzing,
    savedAIResponse: !!savedAIResponse,
    analysis: !!analysis,
    conversationalOnly: !!conversationalOnly
  });

  return (
    <>
      {(!hasAnalysis && !isAnalyzing) ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: '#1F2937',
          borderRadius: '16px',
          border: '1px solid #374151'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🧠</div>
          <h3 style={{ marginBottom: '1rem', color: '#E5E7EB' }}>Ready for Analysis</h3>
          <p style={{ marginBottom: '2rem', color: '#9CA3AF' }}>
            Click "Analyze Entry" to get AI-powered insights about your thoughts and feelings.
          </p>
          <button 
            className="primary-button"
            onClick={() => handleAnalyze(false)} 
            style={{ 
              fontSize: '1.1rem', 
              padding: '1rem 2rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.25)'
            }}
          >
            🧠 Analyze Entry
          </button>
        </div>
      ) : (
        <div style={{ padding: '2rem', maxWidth: '100%' }}>
          {/* Simplified Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, color: '#38BDF8', fontWeight: '600' }}>Prism's Analysis</h2>
          </div>

          {/* Content changed indicator */}
          {hasAnalysis && contentHasChanged && !isAnalyzing && (
            <div style={{
              padding: '1rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>⚠️</span>
              <span style={{ color: '#F59E0B', fontSize: '0.9rem' }}>
                Content has changed since last analysis. Click "Regenerate" for fresh insights.
              </span>
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

          {/* Loading State - In-Place Overlay */}
          {isAnalyzing && (
            <div className="card" style={{ padding: '0', position: 'relative' }}>
              {/* Loading Overlay */}
              <div className="regeneration-overlay" style={{ borderRadius: '16px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
                <h3 style={{ marginBottom: '1rem', color: '#E5E7EB', fontSize: '1.5rem' }}>Prism is analyzing your thoughts...</h3>
                <p style={{ color: '#9CA3AF', marginBottom: '1.5rem', textAlign: 'center', maxWidth: '400px' }}>
                  Our AI is reading your entry and generating personalized insights.
                </p>
                <Spinner size="large" />
              </div>
              
              {/* Placeholder content structure */}
              <div style={{ 
                padding: '2rem',
                background: '#1F2937',
                borderRadius: '16px',
                border: '1px solid #374151',
                minHeight: '300px'
              }}>
                {/* This content is hidden behind the overlay but provides structure */}
              </div>
            </div>
          )}

          {/* Analysis Results - Tabbed Interface */}
          {(hasAnalysis || conversationalOnly) && !isAnalyzing && (
            <div className="card" style={{ padding: '0' }}>
              {/* Tab Navigation */}
              <div style={{ 
                display: 'flex', 
                borderBottom: '2px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                position: 'relative',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', flex: 1 }}>
                  {hasConversationalResponse && (
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                      style={{
                        flex: 1,
                        padding: '1.25rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderTopLeftRadius: '16px',
                        color: activeTab === 'chat' ? '#FFFFFF' : '#9CA3AF',
                        fontWeight: activeTab === 'chat' ? '600' : '500',
                        fontSize: '0.95rem',
                        transition: 'color 0.3s ease',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      💬 Prism's Response
                    </button>
                  )}
                  
                  {analysis && (
                    <button
                      onClick={() => setActiveTab('insights')}
                      className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
                      style={{
                        flex: 1,
                        padding: '1.25rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: activeTab === 'insights' ? '#FFFFFF' : '#9CA3AF',
                        fontWeight: activeTab === 'insights' ? '600' : '500',
                        fontSize: '0.95rem',
                        transition: 'color 0.3s ease',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      📊 Structured Insights
                    </button>
                  )}
                  
                  {analysis && (
                    <button
                      onClick={() => setActiveTab('trends')}
                      className={`tab-button ${activeTab === 'trends' ? 'active' : ''}`}
                      style={{
                        flex: 1,
                        padding: '1.25rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderTopRightRadius: '16px',
                        color: activeTab === 'trends' ? '#FFFFFF' : '#9CA3AF',
                        fontWeight: activeTab === 'trends' ? '600' : '500',
                        fontSize: '0.95rem',
                        transition: 'color 0.3s ease',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      📈 Trends
                    </button>
                  )}
                </div>
                
                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem' }}>
                  <button
                    className="primary-button"
                    onClick={handleConversationalOnly}
                    disabled={isGettingConversational || !note?.content}
                    style={{
                      fontSize: '0.9rem',
                      padding: '0.5rem 1rem',
                      marginLeft: '0.5rem',
                      opacity: isGettingConversational || !note?.content ? 0.5 : 1,
                      cursor: isGettingConversational || !note?.content ? 'not-allowed' : 'pointer'
                    }}
                  >
                    💬 Chat with Prism
                  </button>
                  
                  <button
                    className="primary-button"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    style={{
                      fontSize: '0.9rem',
                      padding: '0.5rem 1rem',
                      marginLeft: '0.5rem',
                      opacity: isRegenerating ? 0.6 : 1,
                      cursor: isRegenerating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isRegenerating ? '⏳ Regenerating...' : '🔄 Regenerate'}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div style={{ padding: '2rem' }}>
                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <div>
                    {insightsToShow?.insights_report ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                          <button
                            onClick={() => copyToClipboard(insightsToShow.insights_report?.conversationalSummary || '')}
                            style={{ 
                              fontSize: '0.8rem',
                              background: 'transparent',
                              color: '#9CA3AF',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)';
                              e.currentTarget.style.color = '#E5E7EB';
                              e.currentTarget.style.borderColor = '#38BDF8';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#9CA3AF';
                              e.currentTarget.style.borderColor = '#374151';
                            }}
                          >
                            📋 Copy
                          </button>
                        </div>
                        <InsightsReport insights={insightsToShow.insights_report} isRegenerating={isRegenerating} />
                        
                        {/* Trigger Timeline */}
                        {(shouldShowTimeline || isGeneratingTimeline) && (
                          <TriggerTimeline 
                            events={timelineEvents} 
                            isLoading={isGeneratingTimeline}
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
                          <button
                            onClick={() => copyToClipboard(
                              analysis?.conversational_response || rawAIResponse || conversationalOnly || ''
                            )}
                            style={{ 
                              fontSize: '0.8rem',
                              background: 'transparent',
                              color: '#9CA3AF',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)';
                              e.currentTarget.style.color = '#E5E7EB';
                              e.currentTarget.style.borderColor = '#38BDF8';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#9CA3AF';
                              e.currentTarget.style.borderColor = '#374151';
                            }}
                          >
                            📋 Copy
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Chat Log Area */}
                    <div className="chat-log-area" style={{ marginBottom: '0.5rem' }}>
                      {conversationHistory.length > 0 ? (
                        conversationHistory.map((message, index) => (
                          <ChatBubble key={index} message={message} />
                        ))
                      ) : (
                        <div className="empty-chat-placeholder">
                          <span className="prism-icon">🔮</span>
                          <span>No response yet. Try regenerating the analysis.</span>
                        </div>
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
                      background: '#1F2937',
                      borderRadius: '12px',
                      border: '1px solid #374151'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-end'
                      }}>
                        <textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Ask a follow-up question..."
                          style={{
                            flex: 1,
                            minHeight: '44px',
                            maxHeight: '120px',
                            padding: '0.75rem',
                            background: '#111827',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#E5E7EB',
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
                  <div>
                    <h3 className="card-title">
                      <span className="icon">📊</span>
                      Structured Insights
                    </h3>
                    
                    {/* Mood Analysis Card */}
                    <div className="analysis-card">
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
                      <div className="analysis-card">
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
                      <div className="analysis-card">
                        <h4 className="card-title">
                          <span className="icon">🛡️</span>
                          Coping Strategies
                        </h4>
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
    </>
  );
};

export default AIAnalysis; 