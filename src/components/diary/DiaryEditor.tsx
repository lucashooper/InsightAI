import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { DiaryEntry } from '../../types/diary';
import { PremiumIcons } from '../icons/PremiumIcons';

interface DiaryEditorProps {
  note: DiaryEntry | null;
  onSave: (note: Partial<DiaryEntry>) => Promise<void>;
  onNavigateToAnalysis?: () => void;
}

const DiaryEditor: React.FC<DiaryEditorProps> = ({ note, onSave, onNavigateToAnalysis }) => {
  console.log('📝 DiaryEditor render:', { 
    hasNote: !!note, 
    noteTitle: note?.title, 
    noteContent: note?.content?.substring(0, 50) + '...', 
    noteId: note?.id 
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const lastSavedContent = useRef<string>('');
  const saveCount = useRef(0);
  const lastNoteId = useRef<string | null>(null);
  const isInitializing = useRef(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

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
      setTimeout(() => {
        isInitializing.current = false;
      }, 0);
    } else {
      console.log('⏭️ Skipping state update - note ID unchanged and state not empty');
    }
  }, [note?.id, note?.title, note?.content]); // Depend on the actual note properties

  // Auto-save functionality
  const debouncedSave = useCallback(
    debounce(async (title: string, content: string) => {
      saveCount.current += 1;
      const currentSaveCount = saveCount.current;
      
      console.log(`💾 Auto-save triggered (${currentSaveCount}):`, {
        title,
        contentLength: content.length,
        lastSavedContent: lastSavedContent.current,
        noteTitle: note?.title,
        noteId: note?.id,
        isInitializing: isInitializing.current
      });
      
      // Don't save if we're still initializing
      if (isInitializing.current) {
        console.log('⏭️ Skipping save - still initializing');
        return;
      }
      
      // Only save if content has actually changed
      if (title.trim() === (note?.title || '') && content.trim() === lastSavedContent.current) {
        console.log('⏭️ Skipping save - no changes detected');
        return;
      }
      
      // IMPORTANT: Don't skip saving just because content is empty!
      // This could cause data loss if the note legitimately has no content
      // Only skip if we have no title AND no content AND no existing note content
      if (!title.trim() && !content.trim() && !(note?.content || '').trim()) {
        console.log('⏭️ Skipping save - completely empty note with no existing content');
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
    [onSave, note?.title, note?.content]
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

  const handleSave = async () => {
    console.log('💾 Manual save triggered');
    
    // Only skip if we have no title AND no content AND no existing note content
    if (!title.trim() && !content.trim() && !(note?.content || '').trim()) {
      console.log('⏭️ Manual save skipped - completely empty note with no existing content');
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
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    console.log('✏️ Title changed:', { from: title, to: newTitle });
    setTitle(newTitle);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  };



  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    console.log('✏️ Content changed:', { 
      fromLength: content.length, 
      toLength: newContent.length,
      change: newContent.length - content.length
    });
    setContent(newContent);
  };

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      console.log('⌨️ Ctrl+S pressed - triggering manual save');
      handleSave();
    }
  };

  // Download entry as TXT file
  const handleDownload = () => {
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
  };

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

  if (!note) {
    console.log('📝 DiaryEditor: No note selected, showing placeholder');
    return (
      <div style={{ padding: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Select a note</h2>
        <div style={{ color: 'var(--text)', opacity: 0.6 }}>No note selected</div>
      </div>
    );
  }

  console.log('📝 DiaryEditor: Showing editable view for note:', note.title);
  return (
    <div className="diary-textarea-container" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '0.5rem 1rem',
      width: '100%',
      boxSizing: 'border-box',
      maxWidth: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Title Input */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          className="diary-title-input"
          spellCheck={false}
          type="text"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Note title..."
          style={{
            width: '100% !important',
            maxWidth: 'none !important',
            padding: '0.75rem 0',
            border: 'none',
            background: 'transparent',
            color: 'var(--text)',
            outline: 'none',
            fontSize: '2rem',
            fontWeight: '600',
            lineHeight: '1.2',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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
        <p style={{
          margin: '0.5rem 0 0 0',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          opacity: 0.7,
          fontWeight: '400',
          lineHeight: '1.4',
        }}>
          {note.updated_at ? new Date(note.updated_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }) : 'Just created'}
        </p>
      </div>

      {/* Toolbar with Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Download Button */}
        <button
          onClick={handleDownload}
          title="Download as text file"
          aria-label="Download entry as text file"
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
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
          <span>Download</span>
        </button>

        {/* Voice Input Button */}
        <button
          onClick={toggleVoiceRecording}
          title={isRecording ? 'Stop recording' : 'Start voice input'}
          aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
          style={{
            padding: '0.5rem 1rem',
            background: isRecording ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: isRecording ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            animation: isRecording ? 'pulse 2s infinite' : 'none'
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
          <span>{isRecording ? 'Recording...' : 'Voice Input'}</span>
        </button>

        {/* Spacer to push analysis button to the right */}
        <div style={{ flex: 1 }} />

        {/* Analysis Indicators - Only show if entry has been analyzed */}
        {note?.isAnalyzed && note?.analysisSummary && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
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
                <span>✨</span>
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
                <span>⚠️</span>
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
            disabled={!content || content.length < 50}
            title={content?.length < 50 ? 'Write at least 50 characters to analyze' : 'Analyze this entry with AI'}
            aria-label="Analyze entry"
            style={{
              padding: '0.5rem 1.25rem',
              background: content?.length >= 50 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: content?.length >= 50 ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: content?.length >= 50 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              opacity: content?.length >= 50 ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (content?.length >= 50) {
                e.currentTarget.style.background = 'var(--bg-quaternary)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (content?.length >= 50) {
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
      
      {/* Main Content Textarea */}
      <textarea
        className="diary-textarea"
        spellCheck={false}
        value={content}
        onChange={handleContentChange}
        onKeyDown={handleContentKeyDown}
        placeholder="Your thoughts go here..."
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '100%',
          minHeight: '600px',
          fontSize: '1.15rem',
          lineHeight: '1.7',
          background: 'transparent',
          color: 'var(--text)',
          border: 'none',
          outline: 'none',
          padding: '0',
          resize: 'none',
          fontFamily: 'inherit',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap',
          boxSizing: 'border-box',
          overflow: 'hidden',
          hyphens: 'auto',
        }}
      />
        
        {/* Footer with Save Info and Button */}
        <div style={{ 
          marginTop: '1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '0.75rem',
          borderTop: '1px solid #374151',
          width: '100%',
          boxSizing: 'border-box',
          maxWidth: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <small style={{ opacity: 0.6, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              Press Enter on title or Ctrl+S to save
            </small>
            {isSaving && (
              <small style={{ color: 'var(--accent)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                Saving...
              </small>
            )}
            {lastSaved && !isSaving && (
              <small style={{ opacity: 0.5, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                Last saved: {lastSaved.toLocaleTimeString()}
              </small>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '0.75rem 1.5rem',
              background: isSaving ? '#666' : 'var(--primary)',
              color: 'var(--text)',
              border: 'none',
              borderRadius: '8px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              marginLeft: '1rem',
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(56, 189, 248, 0.25)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
    </div>
  );
};

export default DiaryEditor; 