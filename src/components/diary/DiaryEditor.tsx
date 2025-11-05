import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { DiaryEntry } from '../../types/diary';
import { PremiumIcons } from '../icons/PremiumIcons';
import { aiService } from '../../services/aiService';
import { usageTrackingService } from '../../services/usageTrackingService';

interface DiaryEditorProps {
  note: DiaryEntry | null;
  onSave: (note: Partial<DiaryEntry>) => Promise<void>;
  onNavigateToAnalysis?: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

const DiaryEditor: React.FC<DiaryEditorProps> = React.memo(({ 
  note, 
  onSave,
  onNavigateToAnalysis,
  isFocusMode = false,
  onToggleFocusMode
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [, setIsSaving] = useState(false);
  const [, setLastSaved] = useState<Date | null>(null);
  const lastSavedContent = useRef<string>('');
  const saveCount = useRef(0);
  const lastNoteId = useRef<string | null>(null);
  const isInitializing = useRef(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Co-Writer state (inline response)
  const [showProbeButton, setShowProbeButton] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Sync state with note prop
  useEffect(() => {
    console.log('🔄 DiaryEditor useEffect - note changed:', {
      noteId: note?.id,
      noteTitle: note?.title,
      currentTitle: title,
      currentContent: content.substring(0, 50) + '...',
      lastNoteId: lastNoteId.current
    });
    
    // Only update state if the note ID actually changed, or if we have a note and our state is empty
    const shouldUpdate = note?.id !== lastNoteId.current || 
                        (note && (title === '' || content === ''));
    
    if (shouldUpdate && note) {
      console.log('✅ Updating DiaryEditor state from note:', {
        fromTitle: title,
        toTitle: note.title || '',
        fromContentLength: content.length,
        toContentLength: (note.content || '').length
      });
      
      isInitializing.current = true;
      setTitle(note.title || '');
      setContent(note.content || '');
      lastSavedContent.current = note.content || '';
      lastNoteId.current = note.id;
      
      // Reset initialization flag after state updates
      // Reset AI response when switching notes
      setAiResponse('');
      setShowProbeButton(false);
      
      setTimeout(() => {
        isInitializing.current = false;
        console.log('✅ State initialization complete');
      }, 0);
    } else if (!note) {
      console.log('🔄 DiaryEditor state cleared - no note');
      isInitializing.current = true;
      setTitle('');
      setContent('');
      lastSavedContent.current = '';
      lastNoteId.current = null;
      setAiResponse('');
      setShowProbeButton(false);
      setTimeout(() => {
        isInitializing.current = false;
      }, 0);
    } else {
      console.log('⏭️ Skipping state update - note ID unchanged and state not empty');
    }
  }, [note?.id, note?.title, note?.content]); // Depend on the actual note properties

  // Auto-save functionality - memoized to prevent re-renders
  const debouncedSave = useCallback(
    debounce(async (title: string, content: string) => {
      saveCount.current += 1;
      const currentSaveCount = saveCount.current;
      
      console.log(`💾 Auto-save triggered (${currentSaveCount}):`, {
        title,
        contentLength: content.length,
        lastSavedContent: lastSavedContent.current,
        isInitializing: isInitializing.current
      });
      
      // Don't save if we're still initializing
      if (isInitializing.current) {
        console.log('⏭️ Skipping save - still initializing');
        return;
      }
      
      // Only save if content has actually changed
      if (content.trim() === lastSavedContent.current) {
        console.log('⏭️ Skipping save - no changes detected');
        return;
      }
      
      // IMPORTANT: Don't skip saving just because content is empty!
      // This could cause data loss if the note legitimately has no content
      // Only skip if we have no title AND no content AND no existing note content
      if (!title.trim() && !content.trim()) {
        console.log('⏭️ Skipping save - completely empty note');
        return;
      }
      
      console.log('💾 Proceeding with save...');
      setIsSaving(true);
      try {
        await onSave({
          title: title.trim() || 'Untitled',
          content: content.trim(),
        });
        setLastSaved(new Date());
        lastSavedContent.current = content.trim();
        console.log(`✅ Auto-save completed (${currentSaveCount})`);
      } catch (error) {
        console.error(`❌ Auto-save failed (${currentSaveCount}):`, error);
      } finally {
        setIsSaving(false);
      }
    }, 1000), // Save after 1 second of inactivity
    [onSave]
  );

  // Trigger auto-save when title or content changes (but not during initialization)
  useEffect(() => {
    if (isInitializing.current) {
      console.log('⏭️ Skipping auto-save effect - still initializing');
      return;
    }
    
    console.log('🔄 Auto-save effect triggered:', {
      noteId: note?.id,
      title,
      contentLength: content.length,
      noteTitle: note?.title,
      noteContentLength: note?.content?.length || 0,
      hasChanges: title !== note?.title || content !== note?.content
    });
    
    if (note?.id && (title !== note.title || content !== note.content)) {
      console.log('🚀 Triggering debounced save...');
      debouncedSave(title, content);
    } else {
      console.log('⏭️ No changes detected, skipping auto-save');
    }
  }, [title, content, note?.id, debouncedSave]);

  const handleSave = useCallback(async () => {
    console.log('💾 Manual save triggered');
    
    // Only skip if we have no title AND no content
    if (!title.trim() && !content.trim()) {
      console.log('⏭️ Manual save skipped - completely empty note');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim() || 'Untitled',
        content: content.trim(),
      });
      setLastSaved(new Date());
      lastSavedContent.current = content.trim();
      console.log('✅ Manual save completed');
    } catch (error) {
      console.error('❌ Manual save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, onSave]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    console.log('✏️ Title changed:', { from: title, to: newTitle });
    setTitle(newTitle);
  }, [title]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('⏎ Enter pressed on title - blurring title and focusing content');
      
      // Blur the title field (this will trigger the existing blur save)
      e.currentTarget.blur();
      
      // Focus the content textarea for immediate typing
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  }, []);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    console.log('✏️ Content changed:', { 
      fromLength: content.length, 
      toLength: e.target.value.length,
      change: e.target.value.length - content.length
    });
    
    // Handle Probe Deeper button visibility
    // setIsTyping(true); // Commented out for now
    setShowProbeButton(false);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Show button 2 seconds after user stops typing (if content is sufficient)
    if (e.target.value.length > 100 && !aiResponse) {
      typingTimeoutRef.current = setTimeout(() => {
        // setIsTyping(false); // Commented out for now
        setShowProbeButton(true);
      }, 2000);
    }
  }, [content, aiResponse]);

  const handleContentKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      console.log('⌨️ Ctrl+S pressed - triggering manual save');
      handleSave();
    }
  }, [handleSave]);

  // Download entry as TXT file
  const handleDownload = useCallback(() => {
    if (!note) return;
    
    const date = note.created_at ? new Date(note.created_at) : new Date();
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toLowerCase().replace(/ /g, '-');
    
    const filename = `entry-${formattedDate}.txt`;
    const fileContent = `${title || 'Untitled Entry'}\n${date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}\n\n${content}`;
    
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [note, title, content]);

  // Voice-to-text functionality
  const initializeVoiceRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return null;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setContent(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setVoiceError('Microphone access denied. Please allow microphone permissions.');
      } else if (event.error === 'no-speech') {
        // Ignore no-speech errors as they're common
      } else {
        setVoiceError(`Voice recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      if (isRecording) {
        // Restart if still recording (handles auto-stop after silence)
        try {
          recognition.start();
        } catch (e) {
          console.log('Recognition ended');
          setIsRecording(false);
        }
      }
    };
    
    return recognition;
  }, [isRecording]);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
      setVoiceError(null);
    } else {
      // Start recording
      const recognition = initializeVoiceRecognition();
      if (recognition) {
        try {
          recognitionRef.current = recognition;
          recognition.start();
          setIsRecording(true);
          setVoiceError(null);
        } catch (error) {
          console.error('Failed to start voice recognition:', error);
          setVoiceError('Failed to start voice recognition. Please try again.');
        }
      }
    }
  };

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  useEffect(() => {
    const editorElement = document.querySelector('[data-editor-container]');
    const textareaElement = document.querySelector('textarea');
    
    if (!editorElement || !textareaElement) return;

    const logDimensions = (event: string) => {
      console.log(`📐 [${event}] Dimensions:`, {
        editorWidth: editorElement.clientWidth,
        editorHeight: editorElement.clientHeight,
        textareaWidth: textareaElement.clientWidth,
        textareaHeight: textareaElement.clientHeight,
        windowInnerWidth: window.innerWidth,
        windowInnerHeight: window.innerHeight,
        visualViewportWidth: window.visualViewport?.width,
        visualViewportHeight: window.visualViewport?.height,
      });
    };

    // Log initial state
    logDimensions('INITIAL');

    // Track focus events
    const onFocus = () => {
      logDimensions('FOCUS');
      // Check computed styles
      const styles = window.getComputedStyle(editorElement);
      console.log('🎨 Editor Computed Styles on Focus:', {
        width: styles.width,
        height: styles.height,
        flex: styles.flex,
        flexBasis: styles.flexBasis,
        flexGrow: styles.flexGrow,
        flexShrink: styles.flexShrink,
        minWidth: styles.minWidth,
        maxWidth: styles.maxWidth,
      });
    };

    const onBlur = () => logDimensions('BLUR');
    
    // Track viewport changes
    const onViewportResize = () => logDimensions('VIEWPORT_RESIZE');
    
    // Track window resize
    const onWindowResize = () => logDimensions('WINDOW_RESIZE');

    textareaElement.addEventListener('focus', onFocus);
    textareaElement.addEventListener('blur', onBlur);
    window.visualViewport?.addEventListener('resize', onViewportResize);
    window.addEventListener('resize', onWindowResize);

    return () => {
      textareaElement.removeEventListener('focus', onFocus);
      textareaElement.removeEventListener('blur', onBlur);
      window.visualViewport?.removeEventListener('resize', onViewportResize);
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  if (!note) {
    console.log('📝 DiaryEditor: No note selected, showing placeholder');
    return (
      <div style={{ padding: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Select a note</h2>
        <div style={{ color: 'var(--text)', opacity: 0.6 }}>No note selected</div>
      </div>
    );
  }

  // Showing editable view
  return (
    <div data-editor-container style={{
      width: '100%',
      minWidth: 0,
      position: 'relative',
      boxSizing: 'border-box',
      background: 'var(--bg-primary)',
      overflow: 'visible'
    }}>
      {/* ==================== HEADER SECTION ==================== */}
      {/* Contains: Title input, timestamp, and action buttons */}
      <div style={{
        flexShrink: 0,
        padding: '1rem 1.5rem 1rem 1.5rem',
        background: 'var(--bg-primary)'
      }}>
        {/* Title Input */}
        <div style={{ marginBottom: '0.5rem' }}>
        <input
          className="diary-title-input"
          spellCheck={false}
          type="text"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Note title..."
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--text)',
            outline: 'none',
            fontSize: '2rem',
            fontWeight: '600',
            lineHeight: '1.2',
            letterSpacing: '0.01em'
          }}
          onFocus={(e) => {
            e.target.style.borderBottomColor = 'var(--accent)';
          }}
          onBlur={(e) => {
            e.target.style.borderBottomColor = '#374151';
            // Also trigger the title blur save
            if (title.trim() !== (note?.title || '')) {
              console.log('💾 Title blur save triggered');
              handleSave();
            }
          }}
        />
        {/* Metadata Timestamp */}
        <div style={{
          marginTop: '0.25rem',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          opacity: 0.6,
          fontWeight: '400',
          lineHeight: '1',
        }}>
          {note.updated_at ? new Date(note.updated_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }) : 'Just created'}
        </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1rem',
          marginBottom: '0rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
        {/* Download Button */}
        <button
          onClick={handleDownload}
          title="Download as text file"
          aria-label="Download entry as text file"
          style={{
            padding: '0.5rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            minWidth: '36px',
            minHeight: '36px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-secondary)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <PremiumIcons.Download size={16} />
        </button>

        {/* Voice Input Button */}
        <button
          onClick={toggleVoiceRecording}
          title={isRecording ? 'Stop recording' : 'Start voice input'}
          aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
          style={{
            padding: '0.5rem',
            background: isRecording ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: isRecording ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            animation: isRecording ? 'pulse 2s infinite' : 'none',
            minWidth: '36px',
            minHeight: '36px'
          }}
          onMouseEnter={(e) => {
            if (!isRecording) {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isRecording) {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }
          }}
        >
          <PremiumIcons.Mic size={16} color={isRecording ? 'white' : 'currentColor'} />
        </button>

        {/* Fullscreen Toggle Button - Icon Only */}
        {onToggleFocusMode && (
          <button
            onClick={onToggleFocusMode}
            title={isFocusMode ? 'Exit Focus Mode (F11)' : 'Enter Focus Mode (F11)'}
            aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
            style={{
              padding: '0.5rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              minWidth: '36px',
              minHeight: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <span>{isFocusMode ? '⏹️' : '⛶'}</span>
          </button>
        )}

        {/* Spacer to push analysis button to the right */}
        <div style={{ flex: 1 }} />

        {/* Analysis Indicators - Only show if entry has been analyzed */}
        {note?.isAnalyzed && note?.analysisSummary && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            marginRight: '1rem'
          }}>
            {note.analysisSummary.positiveCount > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#22c55e'
              }}>
                <PremiumIcons.Sparkles size={12} color="#22c55e" />
                <span>{note.analysisSummary.positiveCount}</span>
              </div>
            )}
            {note.analysisSummary.opportunityCount > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#f59e0b'
              }}>
                <PremiumIcons.Sprout size={12} color="#f59e0b" />
                <span>{note.analysisSummary.opportunityCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Conditional Analyze/View Insights Button */}
        {note?.isAnalyzed ? (
          <button
            onClick={onNavigateToAnalysis}
            title="View your AI insights"
            aria-label="View insights"
            style={{
              padding: '0.5rem 1.25rem',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4c9aff 100%)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(56, 189, 248, 0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(56, 189, 248, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(56, 189, 248, 0.25)';
            }}
          >
            <PremiumIcons.Brain size={16} />
            <span>View Insights</span>
          </button>
        ) : (
          <button
            onClick={onNavigateToAnalysis}
            disabled={!content || content.trim().length === 0}
            title={!content || content.trim().length === 0 ? 'Write something to analyze' : 'Analyze this entry with AI'}
            aria-label="Analyze entry"
            style={{
              padding: '0.5rem 1.25rem',
              background: content && content.trim().length > 0 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: content && content.trim().length > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: content && content.trim().length > 0 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              opacity: content && content.trim().length > 0 ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (content && content.trim().length > 0) {
                e.currentTarget.style.background = 'var(--bg-quaternary)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (content && content.trim().length > 0) {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }
            }}
          >
            <PremiumIcons.Brain size={16} />
            <span>Analyze Entry</span>
          </button>
        )}

        {/* Voice Error Message */}
        {voiceError && (
          <span style={{
            fontSize: '0.75rem',
            color: '#ef4444',
            fontStyle: 'italic',
            width: '100%'
          }}>
            {voiceError}
          </span>
        )}
        </div>
      </div>
      
      {/* ==================== CONTENT SECTION ==================== */}
      {/* Contains: Main text editor or highlighted text view */}
      <div style={{
        padding: '2rem 1.5rem 2rem 1.5rem'
      }}>
      {/* Main Content Area - Always Editable */}
      <div style={{
        width: '100%',
        minHeight: 'auto',
        margin: 0,
        padding: 0
      }}>
        <textarea
          className="diary-textarea"
          spellCheck={false}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleContentKeyDown}
          placeholder="Your thoughts go here..."
          style={{
            width: '100%',
            minHeight: '200px',
            height: 'auto',
            border: 'none',
            background: 'transparent',
            color: 'var(--text)',
            fontSize: '1.15rem',
            lineHeight: '1.7',
            fontFamily: 'inherit',
            resize: 'none',
            overflow: 'hidden',
            padding: '0 !important',
            margin: '0 !important',
            flex: '0 0 auto !important'
          }}
          rows={Math.max(10, content.split('\n').length + 1)}
        />
      </div>
      
      {/* Probe Deeper Button - Contextual Mindsera-style */}
      {showProbeButton && !aiResponse && (
        <div style={{
          position: 'relative',
          width: '100%',
          pointerEvents: 'none',
          marginTop: '1rem'
        }}>
          <button
            onClick={async () => {
              setShowProbeButton(false);
              setIsLoadingAiResponse(true);
              try {
                // Check usage limit
                const usageLimit = await usageTrackingService.checkDailyLimit('probe_deeper');
                
                if (!usageLimit.canUse) {
                  setAiResponse(`You've reached your daily limit of ${usageLimit.limit} AI insights. Upgrade to Pro for unlimited access!`);
                  setIsLoadingAiResponse(false);
                  return;
                }
                
                // Get AI response
                const response = await aiService.probeDeeper(
                  content,
                  'Help me explore what I\'ve written. What stands out to you?',
                  ''
                );
                
                // Track usage
                await usageTrackingService.trackAction('probe_deeper');
                
                setAiResponse(response);
              } catch (error) {
                console.error('Error getting AI response:', error);
                setAiResponse('I apologize, but I encountered an error. Please try again.');
              } finally {
                setIsLoadingAiResponse(false);
              }
            }}
            style={{
              position: 'absolute',
              top: '-2.5rem',
              left: '0',
              padding: '0.5rem 1rem',
              background: 'rgba(139, 92, 246, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '6px',
              color: '#a78bfa',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)',
              animation: 'fadeInUp 0.3s ease-out',
              pointerEvents: 'auto',
              zIndex: 10,
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
              e.currentTarget.style.color = '#c4b5fd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              e.currentTarget.style.color = '#a78bfa';
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>🔮</span>
            <span>Probe Deeper</span>
          </button>
        </div>
      )}
      
      {/* Inline AI Response - Mindsera Style */}
      {(isLoadingAiResponse || aiResponse) && (
        <div style={{
          marginTop: '0.75rem',
          padding: '1rem',
          background: 'rgba(139, 92, 246, 0.08)',
          borderLeft: '3px solid rgba(139, 92, 246, 0.5)',
          borderRadius: '8px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginBottom: '0.5rem'
          }}>
            <button
              onClick={() => {
                setAiResponse('');
                setShowProbeButton(true);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#E5E7EB'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
            >
              ×
            </button>
          </div>
          {isLoadingAiResponse ? (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              color: '#9CA3AF',
              fontSize: '0.9rem'
            }}>
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <span>Thinking...</span>
            </div>
          ) : (
            <div style={{
              fontSize: '0.95rem',
              lineHeight: '1.7',
              color: '#E5E7EB'
            }}>
              {aiResponse}
            </div>
          )}
        </div>
      )}
      </div>
      {/* End of CONTENT SECTION */}
      
    </div>
  );
});

DiaryEditor.displayName = 'DiaryEditor';

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .typing-dots {
    display: flex;
    gap: 0.3rem;
  }
  
  .typing-dot {
    width: 6px;
    height: 6px;
    background: #8b5cf6;
    borderRadius: 50%;
    animation: typingDot 1.4s infinite;
  }
  
  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typingDot {
    0%, 60%, 100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    30% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;
if (!document.head.querySelector('#diary-editor-styles')) {
  style.id = 'diary-editor-styles';
  document.head.appendChild(style);
}

export default DiaryEditor;