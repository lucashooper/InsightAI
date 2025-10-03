import React from 'react';
import type { DiaryEntry } from '../../types/diary';
import StreakDisplay from './StreakDisplay';
import { downloadNoteAsTxt } from '../../utils/downloadUtils';
import { PremiumIcons } from '../icons/PremiumIcons';
import { entryBadgeService } from '../../services/entryBadgeService';

interface SidebarProps {
  notes: DiaryEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  setActiveView: (view: 'editor' | 'dashboard' | 'settings' | 'alerts' | 'playbook') => void;
  streakData?: { currentStreak: number; longestStreak: number; lastEntryDate: string | null };
  unreadAlertsCount?: number;
  blurredNoteIds?: Set<string>;
  onToggleNotePrivacy?: (noteId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  notes, 
  selectedId, 
  onSelect, 
  onAdd, 
  onDelete,
  setActiveView,
  streakData,
  unreadAlertsCount = 0,
  blurredNoteIds = new Set(),
  onToggleNotePrivacy
}) => {
  console.log('📋 Sidebar render:', {
    notesCount: notes.length,
    selectedId,
    noteIds: notes.map(n => n.id),
    noteTitles: notes.map(n => n.title)
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPreview = (content: string) => {
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  const handleNoteClick = (noteId: string, noteTitle: string) => {
    console.log('👆 Sidebar note clicked:', { noteId, noteTitle, currentSelectedId: selectedId });
    onSelect(noteId);
  };

  const handleAddClick = () => {
    console.log('➕ Sidebar add button clicked');
    onAdd();
  };

  const handleDeleteClick = (noteId: string, noteTitle: string) => {
    console.log('🗑️ Sidebar delete button clicked:', { noteId, noteTitle });
    // Immediate deletion without confirmation
    onDelete(noteId);
  };

  const handleDownloadClick = (note: DiaryEntry) => {
    console.log('📥 Sidebar download button clicked:', { noteId: note.id, noteTitle: note.title });
    downloadNoteAsTxt(note);
  };

  return (
    <aside style={{
      width: 240,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 0 1rem 0',
      boxSizing: 'border-box',
    }}>
      <div style={{ 
        padding: '0 1rem', 
        marginBottom: '1rem', 
        fontWeight: 600, 
        fontSize: 18, 
        color: 'var(--text-primary)',
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
      
      {/* Alerts Button */}
      <button 
        onClick={() => setActiveView('alerts')}
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
          position: 'relative',
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
        <PremiumIcons.Alerts size={18} color="currentColor" />
        <span>Alerts</span>
        {unreadAlertsCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}>
            {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
          </span>
        )}
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
            console.log(`📝 Rendering note item:`, { 
              id: note.id, 
              title: note.title, 
              isSelected,
              selectedId 
            });
            
            const isBlurred = blurredNoteIds.has(note.id);
            return (
              <div
                key={note.id}
                style={{
                  padding: '0.75rem 1rem',
                  background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  color: isSelected ? 'var(--text)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  borderRadius: 6,
                  margin: '0.25rem 0',
                  fontWeight: isSelected ? 600 : 400,
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  filter: isBlurred ? 'blur(4px)' : 'none',
                  border: isSelected ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(156, 163, 175, 0.05)';
                    e.currentTarget.style.color = 'var(--text)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
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
                    <span style={{ flex: 1 }}>{note.title || 'Untitled'}</span>
                    {/* Analyzed Badge */}
                    {entryBadgeService.getBadgeForEntry(note).isAnalyzed && (
                      <PremiumIcons.Check size={12} color="#22c55e" />
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
                    {/* Theme Icons */}
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      {entryBadgeService.getBadgeForEntry(note).themeIcons.map((icon, idx) => (
                        <span
                          key={idx}
                          title={entryBadgeService.getThemeLabel(icon)}
                          style={{
                            fontSize: '0.7rem',
                            opacity: 0.6,
                            transition: 'opacity 0.2s ease',
                            cursor: 'help'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.6';
                          }}
                        >
                          {entryBadgeService.getThemeEmoji(icon)}
                        </span>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadClick(note);
                  }}
                  style={{
                    position: 'absolute',
                    right: onToggleNotePrivacy ? '3.5rem' : '2rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
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
                  title="Download as .txt file"
                >
                  <PremiumIcons.Download size={14} color="var(--accent-primary)" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(note.id, note.title);
                  }}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#ff4444',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '0.25rem',
                    opacity: 0.7,
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                  }}
                  title="Delete note"
                >
                  <PremiumIcons.X size={12} color="var(--accent-danger)" />
                </button>
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
};

export default Sidebar; 