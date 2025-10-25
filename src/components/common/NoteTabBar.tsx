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
  const [hoveredNoteId, setHoveredNoteId] = React.useState<string | null>(null);

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
      background: 'rgba(10, 10, 15, 0.95)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
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
          gap: '0',
          padding: '0 16px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="tab-scroll-container"
      >
        {openNotes.map((note) => {
          const isActive = note.id === activeNoteId;
          const isHovered = hoveredNoteId === note.id;
          
          return (
            <div
              key={note.id}
              data-note-id={note.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 12px',
                height: '100%',
                minWidth: '120px',
                maxWidth: '180px',
                background: isActive 
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'transparent',
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                flexShrink: 0
              }}
              onClick={() => onSelectNote(note)}
              onMouseEnter={(e) => {
                setHoveredNoteId(note.id);
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                setHoveredNoteId(null);
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >

              {/* Note title */}
              <span style={{
                flex: 1,
                fontSize: '0.8125rem',
                fontWeight: isActive ? '500' : '400',
                color: isActive ? '#e5e7ff' : '#9ca3af',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease'
              }}>
                {note.title || 'Untitled'}
              </span>

              {/* Close button - only show on active or hovered tabs */}
              {(isActive || isHovered) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseNote(note.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    opacity: 0.6,
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                  title="Close tab"
                >
                  <X size={14} strokeWidth={2} />
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
