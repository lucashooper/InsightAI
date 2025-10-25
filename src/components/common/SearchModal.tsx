import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { DiaryEntry } from '../../types/diary';

interface SearchModalProps {
  isOpen: boolean;
  notes: DiaryEntry[];
  onClose: () => void;
  onSelectNote: (note: DiaryEntry) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  notes,
  onClose,
  onSelectNote
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<DiaryEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter notes based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotes([]);
      setSelectedIndex(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = notes.filter(note => {
      const titleMatch = note.title?.toLowerCase().includes(query);
      const contentMatch = note.content?.toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });

    setFilteredNotes(results);
    setSelectedIndex(0);
  }, [searchQuery, notes]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredNotes.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredNotes[selectedIndex]) {
            onSelectNote(filteredNotes[selectedIndex]);
            handleClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredNotes, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleClose = () => {
    setSearchQuery('');
    setFilteredNotes([]);
    setSelectedIndex(0);
    onClose();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} style={{
            background: 'rgba(139, 92, 246, 0.3)',
            color: '#c4b5fd',
            padding: '2px 4px',
            borderRadius: '2px'
          }}>{part}</mark>
        : part
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - only darkens left side */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.85) 600px, rgba(0, 0, 0, 0.3) 600px, transparent 100%)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 9999,
          animation: 'fadeIn 0.15s ease-out'
        }}
      />

      {/* Modal Container - Left aligned like Obsidian */}
      <div style={{
        position: 'fixed',
        top: '48px', // Below toolbar
        left: '0',
        width: '480px',
        maxHeight: 'calc(100vh - 48px)',
        background: 'rgba(15, 18, 25, 0.98)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideInLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <Search size={18} color="#6b7280" strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#e5e7ff',
              fontSize: '1rem',
              fontWeight: '500',
              padding: 0
            }}
          />
          <button
            onClick={handleClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              padding: 0,
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {searchQuery.trim() && filteredNotes.length === 0 ? (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              No notes found for "{searchQuery}"
            </div>
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    onSelectNote(note);
                    handleClose();
                  }}
                  style={{
                    padding: '10px 16px',
                    margin: '2px 8px',
                    background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Title */}
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#e5e7ff',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {highlightMatch(note.title || 'Untitled', searchQuery)}
                    {note.isAnalyzed && (
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '4px',
                        color: '#60a5fa'
                      }}>
                        Analyzed
                      </span>
                    )}
                  </div>

                  {/* Content preview */}
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#9ca3af',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {highlightMatch(
                      note.content?.substring(0, 80) || 'No content',
                      searchQuery
                    )}
                  </div>

                  {/* Metadata */}
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '6px'
                  }}>
                    {new Date(note.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              );
            })
          ) : searchQuery.trim() === '' ? (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              <div style={{ marginBottom: '8px', fontSize: '2rem' }}>🔍</div>
              Start typing to search your notes
            </div>
          ) : null}
        </div>

        {/* Keyboard hints */}
        {filteredNotes.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '16px',
            padding: '12px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            <span><kbd style={{ padding: '2px 6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>↑↓</kbd> Navigate</span>
            <span><kbd style={{ padding: '2px 6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>↵</kbd> Open</span>
            <span><kbd style={{ padding: '2px 6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>Esc</kbd> Close</span>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default SearchModal;
