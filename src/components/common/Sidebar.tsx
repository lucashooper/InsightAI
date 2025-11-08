import React, { useState } from 'react';
import { Star } from 'lucide-react';
import type { DiaryEntry } from '../../types/diary';
import StreakDisplay from './StreakDisplay';
import { downloadNoteAsTxt } from '../../utils/downloadUtils';
import { PremiumIcons } from '../icons/PremiumIcons';
import { entryBadgeService } from '../../services/entryBadgeService';
import ContextMenu from './ContextMenu';
import { ThemeIconTooltip } from './ThemeIconTooltip';

interface SidebarProps {
  notes: DiaryEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onReorder?: (notes: DiaryEntry[]) => void;
  setActiveView: (view: 'editor' | 'dashboard' | 'settings' | 'playbook' | 'mynotes') => void;
  streakData?: { currentStreak: number; longestStreak: number; lastEntryDate: string | null };
  blurredNoteIds?: Set<string>;
  onToggleNotePrivacy?: (noteId: string) => void;
  onBookmarkNote?: (noteId: string) => void;
  bookmarkedNoteIds?: Set<string>;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  notes, 
  selectedId, 
  onSelect, 
  onAdd, 
  onDelete,
  onRename,
  onReorder,
  setActiveView,
  streakData,
  blurredNoteIds = new Set(),
  onToggleNotePrivacy,
  onBookmarkNote,
  bookmarkedNoteIds = new Set()
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; noteId: string } | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [dragOverNoteId, setDragOverNoteId] = useState<string | null>(null);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPreview = (content: string) => {
    if (!content) return 'No content';
    
    // Find first complete sentence or take first 80 chars
    const sentenceEnd = content.search(/[.!?]\s/);
    if (sentenceEnd !== -1 && sentenceEnd <= 80) {
      return content.substring(0, sentenceEnd + 1);
    }
    
    // Fallback: 80 chars max, try to break at word boundary
    if (content.length <= 80) return content;
    
    const truncated = content.substring(0, 80);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 60 ? truncated.substring(0, lastSpace) : truncated) + '...';
  };

  const handleNoteClick = (noteId: string, _noteTitle: string) => {
    onSelect(noteId);
  };

  const handleAddClick = () => {
    onAdd();
  };

  const handleDeleteClick = (noteId: string, _noteTitle: string) => {
    onDelete(noteId);
  };

  const handleDownloadClick = (note: DiaryEntry) => {
    downloadNoteAsTxt(note);
  };

  const startRename = (noteId: string, currentTitle: string) => {
    setEditingNoteId(noteId);
    setEditingTitle(currentTitle);
  };

  const finishRename = () => {
    if (editingNoteId) {
      const trimmedTitle = editingTitle.trim();
      if (trimmedTitle) {
        onRename(editingNoteId, trimmedTitle);
        setEditingNoteId(null);
        setEditingTitle('');
      } else {
        // Validation: restore original title if empty
        const originalNote = notes.find(n => n.id === editingNoteId);
        if (originalNote) {
          setEditingTitle(originalNote.title);
        }
        // Don't exit edit mode, let user try again
      }
    }
  };

  const cancelRename = () => {
    setEditingNoteId(null);
    setEditingTitle('');
  };

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    setDraggedNoteId(noteId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: React.DragEvent, noteId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverNoteId(noteId);
  };

  const handleDragLeave = () => {
    setDragOverNoteId(null);
  };

  const handleDrop = (e: React.DragEvent, dropNoteId: string) => {
    e.preventDefault();
    
    if (!draggedNoteId || draggedNoteId === dropNoteId || !onReorder) return;
    
    const draggedIndex = notes.findIndex(n => n.id === draggedNoteId);
    const dropIndex = notes.findIndex(n => n.id === dropNoteId);
    
    if (draggedIndex === -1 || dropIndex === -1) return;
    
    const reorderedNotes = [...notes];
    const [draggedNote] = reorderedNotes.splice(draggedIndex, 1);
    reorderedNotes.splice(dropIndex, 0, draggedNote);
    
    onReorder(reorderedNotes);
    setDraggedNoteId(null);
    setDragOverNoteId(null);
  };

  const handleDragEnd = () => {
    setDraggedNoteId(null);
    setDragOverNoteId(null);
  };

  return (
    <aside style={{
      width: 240,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 0 1rem 0',
      boxSizing: 'border-box',
    }}>
      <div style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        opacity: 0.9,
        marginTop: '30px',
        marginLeft: '1rem',
        marginBottom: '0.75rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        My Notes ({notes.length})
      </div>
      
      {/* Streak Display */}
      {streakData && (
        <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
          <StreakDisplay 
            currentStreak={streakData.currentStreak}
            longestStreak={streakData.longestStreak}
            lastEntryDate={streakData.lastEntryDate}
          />
        </div>
      )}
      
      {/* New Note Button */}
      <button 
        onClick={handleAddClick}
        style={{
          margin: '0 1rem 1rem 1rem',
          width: 'calc(100% - 2rem)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'transparent',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '8px',
          color: 'var(--text)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.9rem',
          fontWeight: '500',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <PremiumIcons.Plus size={18} color="var(--accent-primary)" />
        <span>New Note</span>
      </button>
      
      {/* Dashboard Button */}
      <button 
        onClick={() => setActiveView('dashboard')}
        style={{
          margin: '0 1rem 0.5rem 1rem',
          width: 'calc(100% - 2rem)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'transparent',
          border: '1px solid rgba(156, 163, 175, 0.2)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.9rem',
          fontWeight: '500',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(156, 163, 175, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.4)';
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.2)';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <PremiumIcons.Dashboard size={18} color="currentColor" />
        <span>Dashboard</span>
      </button>

      {/* My Notes Button */}
      <button 
        onClick={() => setActiveView('mynotes')}
        style={{
          margin: '0 1rem 0.5rem 1rem',
          width: 'calc(100% - 2rem)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'transparent',
          border: '1px solid rgba(156, 163, 175, 0.2)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.9rem',
          fontWeight: '500',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(156, 163, 175, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.4)';
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.2)';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <PremiumIcons.FileText size={18} color="currentColor" />
        <span>My Notes</span>
      </button>
      
      {/* Playbook Button */}
      <button 
        onClick={() => setActiveView('playbook')}
        style={{
          margin: '0 1rem 0.5rem 1rem',
          width: 'calc(100% - 2rem)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'transparent',
          border: '1px solid rgba(156, 163, 175, 0.2)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.9rem',
          fontWeight: '500',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(156, 163, 175, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.4)';
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.2)';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <PremiumIcons.Target size={18} color="currentColor" />
        <span>Playbook</span>
      </button>
      
      {/* Settings Button */}
      <button 
        onClick={() => setActiveView('settings')}
        style={{
          margin: '0 1rem 1rem 1rem',
          width: 'calc(100% - 2rem)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'transparent',
          border: '1px solid rgba(156, 163, 175, 0.2)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.9rem',
          fontWeight: '500',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(156, 163, 175, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.4)';
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.2)';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <PremiumIcons.Settings size={18} color="currentColor" />
        <span>Settings</span>
      </button>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {notes.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', opacity: 0.6 }}>
            No notes yet. Create your first one!
          </div>
        ) : (
          notes.map(note => {
            const isSelected = selectedId === note.id;
            
            const isBlurred = blurredNoteIds.has(note.id);
            const isDragging = draggedNoteId === note.id;
            const isDragOver = dragOverNoteId === note.id;
            
            return (
              <div
                key={note.id}
                draggable={editingNoteId !== note.id}
                onDragStart={(e) => handleDragStart(e, note.id)}
                onDragOver={(e) => handleDragOver(e, note.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, note.id)}
                onDragEnd={handleDragEnd}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, noteId: note.id });
                }}
                style={{
                  padding: '0.75rem 1rem',
                  background: editingNoteId === note.id ? '#1a1a1a' : (isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
                  color: isSelected ? 'var(--text)' : 'var(--text-secondary)',
                  cursor: isDragging ? 'grabbing' : 'pointer',
                  borderRadius: 6,
                  margin: '0.25rem 0',
                  fontWeight: isSelected ? 600 : 400,
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  filter: isBlurred ? 'blur(4px)' : 'none',
                  border: isDragOver ? '2px solid #3b82f6' : (editingNoteId === note.id ? '1px solid #3b82f6' : (isSelected ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent')),
                  opacity: isDragging ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected && editingNoteId !== note.id) {
                    e.currentTarget.style.background = 'rgba(156, 163, 175, 0.05)';
                    e.currentTarget.style.color = 'var(--text)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected && editingNoteId !== note.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div 
                  onClick={() => handleNoteClick(note.id, note.title)}
                  style={{ flex: 1 }}
                >
                  {/* Title with Sentiment Dot and Analyzed Badge */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    marginBottom: '0.25rem',
                    lineHeight: '1.3'
                  }}>
                    {/* Sentiment Indicator Dot */}
                    <div style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: entryBadgeService.getSentimentColorHex(
                        entryBadgeService.getBadgeForEntry(note).sentimentColor
                      ),
                      flexShrink: 0,
                      boxShadow: `0 0 4px ${entryBadgeService.getSentimentColorHex(
                        entryBadgeService.getBadgeForEntry(note).sentimentColor
                      )}40`
                    }} />
                    {editingNoteId === note.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            finishRename();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelRename();
                          }
                        }}
                        onBlur={finishRename}
                        onFocus={(e) => e.target.select()}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          background: '#1a1a1a',
                          border: '1px solid #3b82f6',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          color: 'var(--text)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          fontFamily: 'inherit',
                          lineHeight: '1.3'
                        }}
                      />
                    ) : (
                      <span style={{ flex: 1 }}>{note.title || 'Untitled'}</span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    opacity: 0.7,
                    lineHeight: '1.4',
                    marginBottom: '0.25rem'
                  }}>
                    {getPreview(note.content || '')}
                  </div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    opacity: 0.5,
                    lineHeight: '1.2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{formatDate(note.created_at)}</span>
                    {/* Theme Icons with Enhanced Tooltips */}
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      {entryBadgeService.getBadgeForEntry(note).themeIcons.map((icon, idx) => (
                        <ThemeIconTooltip key={idx} icon={icon} />
                      ))}
                    </div>
                  </div>
                </div>
                {onToggleNotePrivacy && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleNotePrivacy(note.id);
                    }}
                    style={{
                      position: 'absolute',
                      right: '2rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '0.25rem',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0';
                    }}
                    title={isBlurred ? 'Show content' : 'Hide content'}
                  >
                    {isBlurred ? '👁️' : '🙈'}
                  </button>
                )}
              </div>
            );
          })
        )}
      </nav>
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: 'Rename',
              icon: <PremiumIcons.Edit size={16} />,
              onClick: () => {
                const note = notes.find(n => n.id === contextMenu.noteId);
                if (note) {
                  startRename(note.id, note.title);
                }
              }
            },
            {
              label: bookmarkedNoteIds.has(contextMenu.noteId) ? 'Remove Bookmark' : 'Bookmark Note',
              icon: <Star size={16} fill={bookmarkedNoteIds.has(contextMenu.noteId) ? "#f59e0b" : "none"} color={bookmarkedNoteIds.has(contextMenu.noteId) ? "#f59e0b" : "currentColor"} />,
              onClick: () => {
                if (onBookmarkNote) {
                  onBookmarkNote(contextMenu.noteId);
                }
                setContextMenu(null);
              }
            },
            {
              label: 'Download as TXT',
              icon: <PremiumIcons.Download size={16} />,
              onClick: () => {
                const note = notes.find(n => n.id === contextMenu.noteId);
                if (note) handleDownloadClick(note);
              }
            },
            {
              label: blurredNoteIds.has(contextMenu.noteId) ? 'Show Content' : 'Hide Content',
              icon: blurredNoteIds.has(contextMenu.noteId) ? <PremiumIcons.Eye size={16} /> : <PremiumIcons.Lock size={16} />,
              onClick: () => {
                if (onToggleNotePrivacy) {
                  onToggleNotePrivacy(contextMenu.noteId);
                }
                setContextMenu(null);
              }
            },
            { label: '', onClick: () => {}, separator: true },
            {
              label: 'Delete',
              icon: <PremiumIcons.X size={16} />,
              danger: true,
              onClick: () => {
                const note = notes.find(n => n.id === contextMenu.noteId);
                if (note) handleDeleteClick(note.id, note.title);
              }
            }
          ]}
        />
      )}
    </aside>
  );
};

export default Sidebar; 