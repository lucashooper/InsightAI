import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import type { DiaryEntry } from '../../types/diary';

interface NoteTabBarProps {
  openNotes: DiaryEntry[];
  activeNoteId: string | null;
  onSelectNote: (note: DiaryEntry) => void;
  onCloseNote: (noteId: string) => void;
}

const NoteTabBar: React.FC<NoteTabBarProps> = ({
  openNotes,
  activeNoteId,
  onSelectNote,
  onCloseNote
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active tab
  useEffect(() => {
    if (scrollContainerRef.current && activeNoteId) {
      const activeTab = scrollContainerRef.current.querySelector(`[data-note-id="${activeNoteId}"]`);
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeNoteId]);

  if (openNotes.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '240px', // Start after sidebar
      right: 0,
      height: '48px',
      background: '#0a0a0a',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      zIndex: 101
    }}>
      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: '4px',
          padding: '8px 16px 0 16px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="tab-scroll-container"
      >
        {openNotes.map((note) => {
          const isActive = note.id === activeNoteId;
          
          return (
            <div
              key={note.id}
              data-note-id={note.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                height: 'calc(100% - 8px)',
                minWidth: '120px',
                maxWidth: '200px',
                background: isActive 
                  ? '#1a1a1a'
                  : 'transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                flexShrink: 0
              }}
              onClick={() => onSelectNote(note)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#141414';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >

              {/* Note title */}
              <span style={{
                flex: 1,
                fontSize: '0.875rem',
                fontWeight: isActive ? '500' : '400',
                color: isActive ? '#ffffff' : '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease'
              }}>
                {note.title || 'Untitled'}
              </span>

              {/* Close button - only show on active tab */}
              {isActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseNote(note.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                  title="Close tab"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .tab-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default NoteTabBar;
