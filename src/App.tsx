import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import PlaybookView from './components/playbook/PlaybookView';
import MyNotesView from './components/notes/MyNotesView';
import AnimatedBackground from './components/common/AnimatedBackground';
import { storageAdapter } from './services/storageAdapter';
import NoteTabBar from './components/common/NoteTabBar';
import SearchModal from './components/common/SearchModal';
import LeftToolbar from './components/common/LeftToolbar';
import BookmarkDropdown from './components/common/BookmarkDropdown';
import { InstallPrompt } from './components/pwa/InstallPrompt';

// DarkModeToggle removed - theme control is now in Settings page only

const App: React.FC = () => {
  const [notes, setNotes] = useState<DiaryEntry[]>([]);
  const [selectedNote, setSelectedNote] = useState<DiaryEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'analysis'>('editor');
  const [activeView, setActiveView] = useState<'editor' | 'dashboard' | 'settings' | 'playbook' | 'mynotes'>('editor');
  const [isLoading, setIsLoading] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [blurredNoteIds, setBlurredNoteIds] = useState<Set<string>>(new Set());
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0, lastEntryDate: null as string | null });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openTabs, setOpenTabs] = useState<DiaryEntry[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [bookmarkedNoteIds, setBookmarkedNoteIds] = useState<Set<string>>(new Set());
  const [isBookmarkDropdownOpen, setIsBookmarkDropdownOpen] = useState(false);
  const bookmarkButtonRef = useRef<HTMLButtonElement>(null);

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

  // Add selected note to tabs
  useEffect(() => {
    if (selectedNote && !openTabs.find(tab => tab.id === selectedNote.id)) {
      setOpenTabs(prev => {
        // Limit to 6 tabs
        const newTabs = [...prev, selectedNote];
        return newTabs.slice(-6);
      });
    }
  }, [selectedNote, openTabs]);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const loadNotes = async () => {
    try {
      console.log('🔄 Fetching notes from Supabase...');
      const fetchedNotes = await storageAdapter.getNotes();
      console.log('📋 Fetched notes:', fetchedNotes.map(n => ({ id: n.id, title: n.title, updated_at: n.updated_at })));
      
      // Add computed isAnalyzed property to each note
      const notesWithAnalysisStatus = fetchedNotes.map(note => ({
        ...note,
        isAnalyzed: !!(note.ai_insights || note.ai_structured_insights || note.ai_last_analyzed)
      }));
      
      setNotes(notesWithAnalysisStatus);
      
      // Detect patterns across all notes
      if (fetchedNotes.length > 0) {
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

  const handleCloseTab = useCallback((noteId: string) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== noteId);
      // If closing active tab, switch to another tab or clear selection
      if (selectedNote?.id === noteId) {
        if (newTabs.length > 0) {
          setSelectedNote(newTabs[newTabs.length - 1]);
        } else {
          setSelectedNote(null);
        }
      }
      return newTabs;
    });
  }, [selectedNote]);

  const handleToggleBookmark = useCallback((noteId: string) => {
    setBookmarkedNoteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  }, []);

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
            note.id === selectedNote.id ? {
              ...updatedNote,
              isAnalyzed: !!(updatedNote.ai_insights || updatedNote.ai_structured_insights || updatedNote.ai_last_analyzed)
            } : note
          );
          console.log('📋 Notes array after update:', updatedNotes.map(n => ({ id: n.id, title: n.title, updated_at: n.updated_at, isAnalyzed: n.isAnalyzed })));
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
      
      // Update the selected note with isAnalyzed property
      const noteWithAnalysisStatus = {
        ...updatedNote,
        isAnalyzed: !!(updatedNote.ai_insights || updatedNote.ai_structured_insights || updatedNote.ai_last_analyzed)
      };
      console.log('🎯 Updating selectedNote to:', { id: noteWithAnalysisStatus.id, title: noteWithAnalysisStatus.title, isAnalyzed: noteWithAnalysisStatus.isAnalyzed });
      setSelectedNote(noteWithAnalysisStatus);
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

  const handleNavigateToAnalysis = useCallback(() => {
    setActiveTab('analysis');
  }, []);

  const handleToggleFocusMode = useCallback(() => {
    setIsFocusMode(!isFocusMode);
  }, [isFocusMode]);

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
        
        {/* Left Toolbar - Above Sidebar */}
        {!isFocusMode && (
          <LeftToolbar 
            onSearchClick={() => setIsSearchOpen(true)} 
            onBookmarkClick={() => setIsBookmarkDropdownOpen(!isBookmarkDropdownOpen)}
            bookmarkButtonRef={bookmarkButtonRef}
            onMobileMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
          />
        )}
        
        {/* Bookmark Dropdown */}
        <BookmarkDropdown
          isOpen={isBookmarkDropdownOpen}
          bookmarkedNotes={notes.filter(n => bookmarkedNoteIds.has(n.id))}
          onSelectNote={(note) => {
            setSelectedNote(note);
            setActiveView('editor');
            setActiveTab('editor');
            setIsBookmarkDropdownOpen(false);
          }}
          onRemoveBookmark={handleToggleBookmark}
          onClose={() => setIsBookmarkDropdownOpen(false)}
          anchorRef={bookmarkButtonRef}
        />
        
        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          notes={notes}
          onClose={() => setIsSearchOpen(false)}
          onSelectNote={(note) => {
            setSelectedNote(note);
            setActiveView('editor');
            setActiveTab('editor');
          }}
        />
        
        {/* Note Tab Bar */}
        {activeView === 'editor' && openTabs.length > 0 && !isFocusMode && (
          <NoteTabBar
            openNotes={openTabs}
            activeNoteId={selectedNote?.id || null}
            onSelectNote={(note) => {
              setSelectedNote(note);
              setActiveTab('editor');
            }}
            onCloseNote={handleCloseTab}
          />
        )}
        
        {/* Mobile Sidebar Backdrop */}
        <div 
          className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        <div style={{ display: 'flex', flex: '1 1 auto', minHeight: 0, minWidth: 0, width: '100%', maxWidth: '100%', overflow: 'hidden', marginTop: isFocusMode ? '0' : '48px', position: 'relative' }} className={isFocusMode ? 'focus-mode' : ''}>
          {!isFocusMode && (
            <div className={`sidebar-container ${isMobileMenuOpen ? 'sidebar-open' : ''}`} style={{ marginTop: '-60px' }}>
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
              onBookmarkNote={handleToggleBookmark}
              bookmarkedNoteIds={bookmarkedNoteIds}
              />
            </div>
          )}
          <main style={{ 
            flex: '1 1 auto', 
            display: 'flex', 
            flexDirection: 'column', 
            minWidth: 0,
            maxWidth: '100%',
            width: '100%',
            minHeight: 0,
            overflow: 'auto',
            filter: selectedNote && blurredNoteIds.has(selectedNote.id) ? 'blur(4px)' : 'none',
            transition: 'filter 0.3s ease'
          } as React.CSSProperties}>
              {activeView === 'editor' ? (
                activeTab === 'editor' ? (
                  <DiaryEditor 
                    note={selectedNote} 
                    onSave={handleSave}
                    onNavigateToAnalysis={handleNavigateToAnalysis}
                    isFocusMode={isFocusMode}
                    onToggleFocusMode={handleToggleFocusMode}
                  />
                ) : (
                  <AIAnalysis 
                    note={selectedNote} 
                    setActiveView={setActiveView}
                    onUpdateNote={(id, updates) => {
                      const updatedNotes = notes.map(n => {
                        if (n.id === id) {
                          const updated = { ...n, ...updates };
                          // Recompute isAnalyzed after update
                          updated.isAnalyzed = !!(updated.ai_insights || updated.ai_structured_insights || updated.ai_last_analyzed);
                          return updated;
                        }
                        return n;
                      });
                      setNotes(updatedNotes);
                      if (selectedNote?.id === id) {
                        const updated = { ...selectedNote, ...updates };
                        // Recompute isAnalyzed for selected note
                        updated.isAnalyzed = !!(updated.ai_insights || updated.ai_structured_insights || updated.ai_last_analyzed);
                        console.log('🎯 Updated selectedNote with isAnalyzed:', updated.isAnalyzed);
                        setSelectedNote(updated);
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
              ) : activeView === 'mynotes' ? (
                <MyNotesView
                  setActiveView={setActiveView}
                  setActiveNoteId={(id) => {
                    const note = notes.find(n => n.id === id);
                    if (note) {
                      setSelectedNote(note);
                    }
                  }}
                />
              ) : (
                <SettingsView />
              )}
          </main>
        </div>
        
        {/* PWA Install Prompt */}
        <InstallPrompt />
      </div>
    </ThemeProvider>
  );
};

export default App;
