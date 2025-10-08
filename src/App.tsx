import React, { useEffect, useState, useCallback } from 'react';
import type { DiaryEntry } from './types/diary';
import './styles/base.css';
import './styles/darkModeToggle.css';
import './styles/themes.css';
import './styles/mobile.css';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/common/Sidebar';
import DiaryEditor from './components/diary/DiaryEditor';
import AIAnalysis from './components/ai/AIAnalysis';
import DashboardView from './components/dashboard/DashboardView';
import SettingsView from './components/settings/SettingsView';
import AlertsView from './components/alerts/AlertsView';
import PlaybookView from './components/playbook/PlaybookView';
import AnimatedBackground from './components/common/AnimatedBackground';
import { storageAdapter } from './services/storageAdapter';
import { supabase } from './services/supabaseClient';
import { PremiumIcons } from './components/icons/PremiumIcons';
import { keywordHighlightService } from './services/keywordHighlightService';
import type { DetectedPattern } from './services/keywordHighlightService';

const DarkModeToggle: React.FC = () => {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <label className="toggle-switch" title="Toggle dark mode">
      <input
        type="checkbox"
        checked={dark}
        onChange={() => setDark((d) => !d)}
        style={{ display: 'none' }}
      />
      <span className="toggle-slider" />
      <span style={{ marginLeft: 8, fontSize: '1.2rem' }}>
        {dark ? <PremiumIcons.Moon size={16} /> : <PremiumIcons.Sun size={16} />}
      </span>
    </label>
  );
};

const App: React.FC = () => {
  const [notes, setNotes] = useState<DiaryEntry[]>([]);
  const [selectedNote, setSelectedNote] = useState<DiaryEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'analysis'>('editor');
  const [activeView, setActiveView] = useState<'editor' | 'dashboard' | 'settings' | 'alerts' | 'playbook'>('editor');
  const [isLoading, setIsLoading] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [blurredNoteIds, setBlurredNoteIds] = useState<Set<string>>(new Set());
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0, lastEntryDate: null as string | null });
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([]);
  const [highlightingEnabled, setHighlightingEnabled] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 App State Change:', {
      notesCount: notes.length,
      selectedNoteId: selectedNote?.id,
      selectedNoteTitle: selectedNote?.title,
      activeTab,
      activeView,
      isLoading
    });
  }, [notes, selectedNote, activeTab, activeView, isLoading]);

  // Load notes from Supabase
  useEffect(() => {
    console.log('📥 Loading notes from database...');
    loadNotes();
  }, []);

  // Calculate streak when notes change
  useEffect(() => {
    if (notes.length > 0) {
      const streak = storageAdapter.calculateStreak(notes);
      setStreakData(streak);
    }
  }, [notes]);

  // Load unread alerts count
  useEffect(() => {
    const loadUnreadAlertsCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const count = await storageAdapter.getUnreadCount();
          setUnreadAlertsCount(count);
        } else {
          // No user authenticated, set count to 0
          setUnreadAlertsCount(0);
        }
      } catch (error) {
        console.error('Error loading unread alerts count:', error);
        setUnreadAlertsCount(0);
      }
    };

    loadUnreadAlertsCount();
  }, []);

  const loadNotes = async () => {
    try {
      console.log('🔄 Fetching notes from Supabase...');
      const fetchedNotes = await storageAdapter.getNotes();
      console.log('📋 Fetched notes:', fetchedNotes.map(n => ({ id: n.id, title: n.title, updated_at: n.updated_at })));
      
      setNotes(fetchedNotes);
      
      // Detect patterns across all notes
      if (fetchedNotes.length > 0) {
        const patterns = keywordHighlightService.detectPatterns(fetchedNotes);
        console.log('🔍 Detected patterns:', patterns);
        setDetectedPatterns(patterns);
        
        if (!selectedNote) {
          console.log('🎯 Setting initial selected note:', fetchedNotes[0].title);
          setSelectedNote(fetchedNotes[0]);
        }
      }
    } catch (error) {
      console.error('❌ Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = useCallback((id: string) => {
    console.log('📝 Note selected by id:', id);
    const note = notes.find(n => n.id === id);
    if (note) {
      setSelectedNote(note);
      setActiveView('editor'); // Switch to editor view
      setActiveTab('editor');
      setIsMobileMenuOpen(false); // Close mobile menu
      console.log('✅ Note selected successfully');
    } else {
      console.error('❌ Note not found in notes array:', { id, notesCount: notes.length });
    }
  }, [notes]);

  const handleAdd = useCallback(async () => {
    try {
      console.log('➕ Creating new note...');
      const newNote = await storageAdapter.createNote('New Note', '');
      console.log('📝 New note created:', { id: newNote.id, title: newNote.title });
      
      setNotes(prevNotes => {
        const updatedNotes = [newNote, ...prevNotes];
        console.log('📋 Updated notes array:', updatedNotes.map(n => ({ id: n.id, title: n.title })));
        return updatedNotes;
      });
      
      setSelectedNote(newNote);
      setActiveTab('editor');
      setActiveView('editor'); // Switch to editor view for new note
      console.log('✅ New note added and selected');
    } catch (error) {
      console.error('❌ Error creating note:', error);
    }
  }, []);

  const handleSave = useCallback(async (updates: Partial<DiaryEntry>) => {
    console.log('💾 handleSave called with updates:', updates);
    console.log('🎯 Current selectedNote:', selectedNote ? { id: selectedNote.id, title: selectedNote.title } : 'null');
    
    if (!selectedNote) {
      console.error('❌ No selected note to save');
      return;
    }

    // Safety check: Don't overwrite existing content with empty data unless explicitly intended
    const hasExistingContent = selectedNote.content && selectedNote.content.trim().length > 0;
    const newContentIsEmpty = !updates.content || !updates.content.trim();
    
    if (hasExistingContent && newContentIsEmpty) {
      console.warn('⚠️ Attempting to save empty content over existing content. This could cause data loss!');
      console.warn('⚠️ Existing content length:', selectedNote.content.length);
      console.warn('⚠️ New content:', updates.content);
      
      // For now, let's preserve the existing content if new content is empty
      // This prevents accidental data loss during state sync issues
      if (!updates.title || updates.title === selectedNote.title) {
        console.log('🛡️ Preserving existing content to prevent data loss');
        updates.content = selectedNote.content;
      }
    }

    try {
      let updatedNote: DiaryEntry;

      if (selectedNote.id) {
        console.log('🔄 Updating existing note:', selectedNote.id);
        // Update existing note
        updatedNote = await storageAdapter.updateNote(selectedNote.id, updates);
        console.log('✅ Note updated in database:', { id: updatedNote.id, title: updatedNote.title, updated_at: updatedNote.updated_at });
        
        // Update the notes list immutably without re-sorting
        setNotes(prevNotes => {
          const updatedNotes = prevNotes.map(note => 
            note.id === selectedNote.id ? updatedNote : note
          );
          console.log('📋 Notes array after update:', updatedNotes.map(n => ({ id: n.id, title: n.title, updated_at: n.updated_at })));
          return updatedNotes;
        });
      } else {
        console.log('🆕 Creating new note from updates');
        // Create new note if it doesn't have an ID
        updatedNote = await storageAdapter.createNote(
          updates.title || 'Untitled',
          updates.content || ''
        );
        console.log('✅ New note created from updates:', { id: updatedNote.id, title: updatedNote.title });
        
        // Add new note to the beginning of the list
        setNotes(prevNotes => {
          const updatedNotes = [updatedNote, ...prevNotes];
          console.log('📋 Notes array after creating new note:', updatedNotes.map(n => ({ id: n.id, title: n.title })));
          return updatedNotes;
        });
      }
      
      // Update the selected note
      console.log('🎯 Updating selectedNote to:', { id: updatedNote.id, title: updatedNote.title });
      setSelectedNote(updatedNote);
      console.log('✅ Save operation completed successfully');
    } catch (error) {
      console.error('❌ Error saving note:', error);
    }
  }, [selectedNote]);

  const handleDelete = useCallback(async (id: string) => {
    console.log('🗑️ handleDelete called with id:', id);
    try {
      await storageAdapter.deleteNote(id);
      console.log('✅ Note deleted from database');
      
      setNotes(prevNotes => {
        const remainingNotes = prevNotes.filter(n => n.id !== id);
        console.log('📋 Notes array after deletion:', remainingNotes.map(n => ({ id: n.id, title: n.title })));
        return remainingNotes;
      });
      
      setSelectedNote(prevSelected => {
        if (prevSelected?.id === id) {
          const remainingNotes = notes.filter(n => n.id !== id);
          const newSelected = remainingNotes.length > 0 ? remainingNotes[0] : null;
          console.log('🎯 Updated selectedNote after deletion:', newSelected ? { id: newSelected.id, title: newSelected.title } : 'null');
          return newSelected;
        }
        return prevSelected;
      });
    } catch (error) {
      console.error('❌ Error deleting note:', error);
    }
  }, [notes]);

  const handleRename = useCallback(async (id: string, newTitle: string) => {
    console.log('✏️ handleRename called with id:', id, 'newTitle:', newTitle);
    try {
      await storageAdapter.updateNote(id, { title: newTitle });
      console.log('✅ Note renamed in database');
      
      setNotes(prevNotes => {
        const updatedNotes = prevNotes.map(n => 
          n.id === id ? { ...n, title: newTitle } : n
        );
        console.log('📋 Notes array after rename:', updatedNotes.map(n => ({ id: n.id, title: n.title })));
        return updatedNotes;
      });
      
      setSelectedNote(prevSelected => {
        if (prevSelected?.id === id) {
          const updated = { ...prevSelected, title: newTitle };
          console.log('🎯 Updated selectedNote after rename:', { id: updated.id, title: updated.title });
          return updated;
        }
        return prevSelected;
      });
    } catch (error) {
      console.error('❌ Error renaming note:', error);
    }
  }, []);

  const handleReorder = useCallback((reorderedNotes: DiaryEntry[]) => {
    console.log('🔄 handleReorder called');
    setNotes(reorderedNotes);
  }, []);

  console.log('🔄 App component rendering with:', {
    notesCount: notes.length,
    selectedNoteId: selectedNote?.id,
    selectedNoteTitle: selectedNote?.title,
    activeTab,
    isLoading
  });

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="app-container">
        <AnimatedBackground />
        
        {/* Mobile Menu Button */}
        {!isFocusMode && (
          <button
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <PremiumIcons.Menu size={24} />
          </button>
        )}
        
        {/* Mobile Sidebar Backdrop */}
        <div 
          className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Grouped Control Panel - Top Right - Hide on Analysis Tab */}
        {!(activeView === 'editor' && activeTab === 'analysis') && (
          <div style={{ 
            position: 'absolute', 
            top: '1rem', 
            right: '1rem', 
            zIndex: 10,
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 8px var(--shadow-color)'
          }}>
            <DarkModeToggle />
          </div>
        )}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }} className={isFocusMode ? 'focus-mode' : ''}>
          {!isFocusMode && (
            <div className={`sidebar-container ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
              <Sidebar 
              onSelect={handleSelect} 
              onAdd={handleAdd} 
              selectedId={selectedNote?.id || null}
              notes={notes}
              onDelete={handleDelete}
              onRename={handleRename}
              onReorder={handleReorder}
              setActiveView={(view) => {
                setActiveView(view);
                setIsMobileMenuOpen(false); // Close mobile menu
              }}
              streakData={streakData}
              unreadAlertsCount={unreadAlertsCount}
              blurredNoteIds={blurredNoteIds}
              onToggleNotePrivacy={(noteId) => {
                setBlurredNoteIds(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(noteId)) {
                    newSet.delete(noteId);
                  } else {
                    newSet.add(noteId);
                  }
                  return newSet;
                });
              }}
              />
            </div>
          )}
          <main style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minWidth: 0, 
            maxWidth: 'calc(100vw - 240px)', 
            overflow: 'hidden',
            filter: selectedNote && blurredNoteIds.has(selectedNote.id) ? 'blur(4px)' : 'none',
            transition: 'filter 0.3s ease',
          }}>
            <div style={{ padding: '0.5rem 1rem' }}>
              {/* Title removed for analysis view - now handled in AIAnalysis component */}
              {activeView === 'dashboard' && (
                <h1 style={{ 
                  margin: 0,
                  marginTop: '2.5rem',
                  fontSize: '2.5rem',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 50%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '700',
                  letterSpacing: '-0.02em'
                }}>
                  Dashboard & Trends
                </h1>
              )}
              {activeView === 'settings' && (
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  Settings
                </h1>
              )}
              {activeView === 'alerts' && (
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  Pattern Alerts
                </h1>
              )}
            </div>
            
            
            <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
              {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>Loading...</div>
              ) : activeView === 'editor' ? (
                activeTab === 'editor' ? (
                  <DiaryEditor 
                    note={selectedNote} 
                    onSave={handleSave}
                    detectedPatterns={detectedPatterns}
                    highlightingEnabled={highlightingEnabled}
                    onToggleHighlighting={() => setHighlightingEnabled(!highlightingEnabled)}
                    onNavigateToAnalysis={() => setActiveTab('analysis')}
                    isFocusMode={isFocusMode}
                    onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
                  />
                ) : (
                  <AIAnalysis 
                    note={selectedNote} 
                    setActiveView={setActiveView}
                    onUpdateNote={(id, updates) => {
                      const updatedNotes = notes.map(n => 
                        n.id === id ? { ...n, ...updates } : n
                      );
                      setNotes(updatedNotes);
                      if (selectedNote?.id === id) {
                        setSelectedNote({ ...selectedNote, ...updates });
                      }
                    }}
                  />
                )
              ) : activeView === 'dashboard' ? (
                <DashboardView 
                  setActiveView={setActiveView}
                  setActiveNoteId={(id) => {
                    const note = notes.find(n => n.id === id);
                    if (note) {
                      setSelectedNote(note);
                    }
                  }}
                />
              ) : activeView === 'playbook' ? (
                <PlaybookView
                  existingNoteIds={notes.map(n => n.id)}
                  onNavigateToEntry={(entryId) => {
                    console.log('=== APP.TSX: onNavigateToEntry called ===');
                    console.log('Entry ID:', entryId);
                    console.log('Total notes available:', notes.length);
                    console.log('All note IDs:', notes.map(n => n.id));
                    
                    const note = notes.find(n => n.id === entryId);
                    console.log('Found note:', note ? { id: note.id, title: note.title } : 'NOT FOUND');
                    
                    if (note) {
                      console.log('✅ Navigating to note:', note.title);
                      setSelectedNote(note);
                      setActiveView('editor');
                      setActiveTab('editor');
                    } else {
                      console.error('❌ Note not found! Entry ID:', entryId);
                      console.error('This means the sourceEntryId on the insight does not match any note ID');
                      alert(`Could not find entry with ID: ${entryId}\n\nThis entry may have been deleted.`);
                    }
                  }}
                />
              ) : activeView === 'alerts' ? (
                <AlertsView />
              ) : (
                <SettingsView setActiveView={setActiveView} />
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
