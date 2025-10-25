import React from 'react';
import { Star, X } from 'lucide-react';
import type { DiaryEntry } from '../../types/diary';

interface BookmarkDropdownProps {
  isOpen: boolean;
  bookmarkedNotes: DiaryEntry[];
  onSelectNote: (note: DiaryEntry) => void;
  onRemoveBookmark: (noteId: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

const BookmarkDropdown: React.FC<BookmarkDropdownProps> = ({
  isOpen,
  bookmarkedNotes,
  onSelectNote,
  onRemoveBookmark,
  onClose,
  anchorRef
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
      />

      {/* Dropdown */}
      <div
        style={{
          position: 'fixed',
          top: anchorRef.current ? anchorRef.current.getBoundingClientRect().bottom + 8 : '56px',
          left: '16px',
          width: '280px',
          maxHeight: '400px',
          background: 'rgba(15, 18, 25, 0.98)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Star size={16} color="#f59e0b" fill="#f59e0b" />
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#e5e7ff'
            }}
          >
            Bookmarks
          </span>
        </div>

        {/* Bookmarked Notes List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px'
          }}
        >
          {bookmarkedNotes.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '0.875rem'
              }}
            >
              <Star size={32} color="#4b5563" style={{ margin: '0 auto 12px' }} />
              <div>No bookmarked notes yet</div>
            </div>
          ) : (
            bookmarkedNotes.map((note) => {
              const [isHovered, setIsHovered] = React.useState(false);
              
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    onSelectNote(note);
                    onClose();
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    margin: '2px 4px',
                    background: isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <Star size={14} color="#f59e0b" fill="#f59e0b" style={{ flexShrink: 0 }} />
                  
                  <span
                    style={{
                      flex: 1,
                      fontSize: '0.8125rem',
                      color: '#e5e7ff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {note.title || 'Untitled'}
                  </span>

                  {/* Remove button on hover */}
                  {isHovered && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(note.id);
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
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#6b7280';
                      }}
                      title="Remove bookmark"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default BookmarkDropdown;
