import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus } from 'lucide-react';
import type { DiaryEntry } from '../../types/diary';
import { storageAdapter } from '../../services/storageAdapter';
import { PremiumIcons } from '../icons/PremiumIcons';
import { entryBadgeService } from '../../services/entryBadgeService';
import { SkeletonNoteGrid } from '../common/SkeletonLoader';
import PageContainer from '../common/PageContainer';
import PageHeader from '../common/PageHeader';
import '../../styles/page-layout.css';

interface MyNotesViewProps {
  setActiveView: (view: 'editor' | 'dashboard' | 'settings' | 'playbook' | 'mynotes') => void;
  setActiveNoteId: (id: string) => void;
}

const MyNotesView: React.FC<MyNotesViewProps> = ({ setActiveView, setActiveNoteId }) => {
  const [notes, setNotes] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'analyzed' | 'unanalyzed'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Load notes
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const allNotes = await storageAdapter.getNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort notes
  const getFilteredNotes = () => {
    let filtered = [...notes];

    // Apply filter
    if (filter === 'analyzed') {
      filtered = filtered.filter(note => note.isAnalyzed);
    } else if (filter === 'unanalyzed') {
      filtered = filtered.filter(note => !note.isAnalyzed);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Get preview text
  const getPreview = (content: string, maxLength: number = 120) => {
    if (!content) return 'No content';
    const text = content.replace(/[#*_~`]/g, '').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Handle card click
  const handleCardClick = (noteId: string) => {
    setActiveNoteId(noteId);
    setActiveView('editor');
  };

  const filteredNotes = getFilteredNotes();

  // Show skeleton during initial load
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          icon={<FileText size={24} />}
          title="My Notes"
          subtitle="Browse and organize your journal entries"
        />
        <SkeletonNoteGrid count={9} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon={<FileText size={24} />}
        title="My Notes"
        subtitle={`${filteredNotes.length} ${filteredNotes.length === 1 ? 'entry' : 'entries'}${filter !== 'all' ? ` · ${filter}` : ''}`}
        actions={
          <button
            className="new-note-button"
            onClick={() => {
              setActiveNoteId('');
              setActiveView('editor');
            }}
            style={{
              padding: '0.6rem 1.25rem',
              background: '#8b5cf6',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#7c3aed';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#8b5cf6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={20} />
            New Note
          </button>
        }
      />

      {/* Page Content */}
      <div className="page-content">
        {/* Toolbar - Filters and Search */}
        <div className="notes-toolbar" style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '24px',
          paddingBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
          position: 'relative',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          {/* Search Bar */}
          <div style={{
            flex: '1 1 300px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}>
              <PremiumIcons.Search size={18} color="#9CA3AF" />
            </div>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                background: 'rgba(30, 35, 45, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                e.currentTarget.style.background = 'rgba(30, 35, 45, 0.8)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.background = 'rgba(30, 35, 45, 0.6)';
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            background: 'rgba(17, 24, 39, 0.6)',
            padding: '0.25rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)'
          }}>
            {(['all', 'analyzed', 'unanalyzed'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                style={{
                  padding: '0.5rem 1rem',
                  background: filter === filterOption ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: filter === filterOption ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                  borderRadius: '8px',
                  color: filter === filterOption ? '#a78bfa' : '#9CA3AF',
                  fontSize: '0.85rem',
                  fontWeight: filter === filterOption ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize'
                }}
                onMouseEnter={(e) => {
                  if (filter !== filterOption) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== filterOption) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#9CA3AF';
                  }
                }}
              >
                {filterOption}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest')}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(30, 35, 45, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              cursor: 'pointer',
              outline: 'none',
              backdropFilter: 'blur(10px)'
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Loading State */}
      {isLoading && (
        <div 
          className="notes-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.25rem'
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                height: '280px',
                background: 'rgba(30, 35, 45, 0.4)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
          ))}
        </div>
      )}

      {/* Notes Grid */}
      {!isLoading && filteredNotes.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(30, 35, 45, 0.4)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <PremiumIcons.FileText size={64} color="#4B5563" />
          <h3 style={{
            margin: '1rem 0 0.5rem 0',
            color: '#9CA3AF',
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </h3>
          <p style={{
            margin: 0,
            color: '#6B7280',
            fontSize: '0.95rem'
          }}>
            {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
          </p>
        </div>
      )}

      {!isLoading && filteredNotes.length > 0 && (
        <motion.div
          className="notes-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.25rem'
          }}
        >
          {filteredNotes.map((note, index) => {
            const badge = entryBadgeService.getBadgeForEntry(note);
            const sentimentColor = entryBadgeService.getSentimentColorHex(badge.sentimentColor);

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCardClick(note.id)}
                style={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, rgba(30, 35, 45, 0.6) 0%, rgba(20, 25, 35, 0.4) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  boxShadow: `
                    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
                    0 4px 16px rgba(0, 0, 0, 0.4),
                    0 2px 4px rgba(0, 0, 0, 0.2)
                  `,
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = `
                    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                    0 8px 32px rgba(0, 0, 0, 0.5),
                    0 4px 8px ${sentimentColor}30
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.boxShadow = `
                    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
                    0 4px 16px rgba(0, 0, 0, 0.4),
                    0 2px 4px rgba(0, 0, 0, 0.2)
                  `;
                }}
              >
                {/* Noise Texture */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                  opacity: 0.02,
                  pointerEvents: 'none',
                  mixBlendMode: 'overlay'
                }} />

                {/* Top Highlight */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                  pointerEvents: 'none'
                }} />

                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  gap: '0.75rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {/* Sentiment Indicator */}
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: sentimentColor,
                    flexShrink: 0,
                    marginTop: '0.25rem',
                    boxShadow: `0 0 8px ${sentimentColor}60`
                  }} />

                  {/* Analysis Status Badge */}
                  {note.isAnalyzed && (
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      background: 'rgba(139, 92, 246, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      color: '#a78bfa',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <PremiumIcons.BarChart size={12} />
                      Analyzed
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  lineHeight: '1.3',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {note.title || 'Untitled'}
                </h3>

                {/* Preview */}
                <p style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  color: '#9CA3AF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  flex: 1,
                  position: 'relative',
                  zIndex: 1
                }}>
                  {getPreview(note.content)}
                </p>

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {/* Date */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#6B7280'
                  }}>
                    <PremiumIcons.Calendar size={14} />
                    {formatDate(note.created_at)}
                  </div>

                  {/* Theme Icons */}
                  <div style={{
                    display: 'flex',
                    gap: '0.25rem',
                    alignItems: 'center'
                  }}>
                    {badge.themeIcons.slice(0, 3).map((icon, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.85rem',
                          opacity: 0.7
                        }}
                      >
                        {entryBadgeService.getThemeEmoji(icon)}
                      </span>
                    ))}
                    {badge.themeIcons.length > 3 && (
                      <span style={{
                        fontSize: '0.7rem',
                        color: '#6B7280',
                        fontWeight: '600'
                      }}>
                        +{badge.themeIcons.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
        }
        
        @media (max-width: 1200px) {
          .notes-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        
        @media (max-width: 900px) {
          .notes-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 600px) {
          .notes-grid {
            grid-template-columns: repeat(1, 1fr) !important;
          }
        }
      `}</style>
    </div>
    </PageContainer>
  );
};

export default MyNotesView;
