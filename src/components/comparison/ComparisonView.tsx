import React, { useState } from 'react';
import type { DiaryEntry } from '../../types/diary';
import { PremiumIcons } from '../icons/PremiumIcons';
import { entryBadgeService } from '../../services/entryBadgeService';

interface ComparisonViewProps {
  entries: DiaryEntry[];
  onClose: () => void;
  onSelectEntry: (entryId: string) => void;
}

interface ComparisonInsight {
  differences: string[];
  commonalities: string[];
  suggestions: string[];
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ entries, onClose, onSelectEntry }) => {
  const [selectedEntries, setSelectedEntries] = useState<DiaryEntry[]>([]);
  const [showInsights, setShowInsights] = useState(false);

  const toggleEntrySelection = (entry: DiaryEntry) => {
    if (selectedEntries.find(e => e.id === entry.id)) {
      setSelectedEntries(selectedEntries.filter(e => e.id !== entry.id));
      setShowInsights(false);
    } else if (selectedEntries.length < 3) {
      setSelectedEntries([...selectedEntries, entry]);
    }
  };

  const generateComparison = (): ComparisonInsight | null => {
    if (selectedEntries.length < 2) return null;

    const differences: string[] = [];
    const commonalities: string[] = [];
    const suggestions: string[] = [];

    // Analyze sentiment differences
    const sentiments = selectedEntries.map(e => 
      entryBadgeService.getBadgeForEntry(e).sentimentColor
    );
    const uniqueSentiments = new Set(sentiments);
    
    if (uniqueSentiments.size > 1) {
      differences.push(`Mood varied: ${Array.from(uniqueSentiments).join(', ')} days`);
    } else {
      commonalities.push(`Similar mood across all entries (${sentiments[0]})`);
    }

    // Analyze themes
    const allThemes = selectedEntries.map(e => 
      entryBadgeService.getBadgeForEntry(e).themeIcons
    );
    
    // Find common themes
    const firstThemes = new Set(allThemes[0]);
    const commonThemes = allThemes.slice(1).reduce((acc, themes) => {
      return acc.filter(t => themes.includes(t));
    }, Array.from(firstThemes));

    if (commonThemes.length > 0) {
      commonalities.push(`Recurring themes: ${commonThemes.map(t => 
        entryBadgeService.getThemeEmoji(t)
      ).join(' ')}`);
    }

    // Find unique themes in good vs difficult days
    const goodDays = selectedEntries.filter(e => 
      entryBadgeService.getBadgeForEntry(e).sentimentColor === 'green'
    );
    const difficultDays = selectedEntries.filter(e => 
      entryBadgeService.getBadgeForEntry(e).sentimentColor === 'gray'
    );

    if (goodDays.length > 0 && difficultDays.length > 0) {
      const goodThemes = new Set(goodDays.flatMap(e => 
        entryBadgeService.getBadgeForEntry(e).themeIcons
      ));
      const difficultThemes = new Set(difficultDays.flatMap(e => 
        entryBadgeService.getBadgeForEntry(e).themeIcons
      ));

      const onlyInGoodDays = Array.from(goodThemes).filter(t => !difficultThemes.has(t));
      const onlyInDifficultDays = Array.from(difficultThemes).filter(t => !goodThemes.has(t));

      if (onlyInGoodDays.length > 0) {
        differences.push(`Present on good days: ${onlyInGoodDays.map(t => 
          entryBadgeService.getThemeLabel(t)
        ).join(', ')}`);
        suggestions.push(`Try incorporating: ${onlyInGoodDays.map(t => 
          entryBadgeService.getThemeLabel(t).toLowerCase()
        ).join(', ')}`);
      }

      if (onlyInDifficultDays.length > 0) {
        differences.push(`More frequent on difficult days: ${onlyInDifficultDays.map(t => 
          entryBadgeService.getThemeLabel(t)
        ).join(', ')}`);
      }
    }

    // General suggestions
    if (suggestions.length === 0) {
      suggestions.push('Keep tracking patterns to identify what works for you');
    }

    return { differences, commonalities, suggestions };
  };

  const comparison = showInsights ? generateComparison() : null;

  // Suggest smart comparisons
  const suggestComparisons = () => {
    const greenDays = entries.filter(e => 
      entryBadgeService.getBadgeForEntry(e).sentimentColor === 'green'
    );
    const grayDays = entries.filter(e => 
      entryBadgeService.getBadgeForEntry(e).sentimentColor === 'gray'
    );

    return (
      <div style={{
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '8px'
      }}>
        <div style={{ 
          fontSize: '0.875rem', 
          color: '#3b82f6',
          fontWeight: '600',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <PremiumIcons.Sparkles size={14} color="#3b82f6" />
          Smart Suggestions
        </div>
        <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
          {greenDays.length > 0 && grayDays.length > 0 ? (
            <p style={{ margin: '0.25rem 0' }}>
              💡 Compare your best day with a challenging day to identify key differences
            </p>
          ) : (
            <p style={{ margin: '0.25rem 0' }}>
              💡 Select 2-3 entries from different days to see patterns
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '2rem'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            color: '#E5E7EB',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <PremiumIcons.BarChart size={24} color="#E5E7EB" />
            Compare Entries
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '1.5rem',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        {suggestComparisons()}

        {/* Selection Info */}
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#9CA3AF'
        }}>
          Selected: {selectedEntries.length}/3 entries
          {selectedEntries.length >= 2 && !showInsights && (
            <button
              onClick={() => setShowInsights(true)}
              style={{
                marginLeft: '1rem',
                padding: '0.4rem 0.75rem',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Generate Comparison
            </button>
          )}
        </div>

        {/* Comparison Insights */}
        {showInsights && comparison && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1.5rem',
            background: 'rgba(34, 197, 94, 0.05)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '12px'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.1rem',
              color: '#22c55e',
              fontWeight: '600'
            }}>
              Insights
            </h3>

            {comparison.differences.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  color: '#E5E7EB',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  What was different?
                </h4>
                {comparison.differences.map((diff, idx) => (
                  <p key={idx} style={{
                    margin: '0.25rem 0',
                    fontSize: '0.85rem',
                    color: '#9CA3AF',
                    paddingLeft: '1rem'
                  }}>
                    • {diff}
                  </p>
                ))}
              </div>
            )}

            {comparison.commonalities.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  color: '#E5E7EB',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Common themes
                </h4>
                {comparison.commonalities.map((common, idx) => (
                  <p key={idx} style={{
                    margin: '0.25rem 0',
                    fontSize: '0.85rem',
                    color: '#9CA3AF',
                    paddingLeft: '1rem'
                  }}>
                    • {common}
                  </p>
                ))}
              </div>
            )}

            {comparison.suggestions.length > 0 && (
              <div>
                <h4 style={{
                  fontSize: '0.875rem',
                  color: '#E5E7EB',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Suggested actions
                </h4>
                {comparison.suggestions.map((suggestion, idx) => (
                  <p key={idx} style={{
                    margin: '0.25rem 0',
                    fontSize: '0.85rem',
                    color: '#3b82f6',
                    paddingLeft: '1rem',
                    fontWeight: '500'
                  }}>
                    💡 {suggestion}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Entry Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {entries.slice(0, 20).map(entry => {
            const isSelected = selectedEntries.find(e => e.id === entry.id);
            const badge = entryBadgeService.getBadgeForEntry(entry);

            return (
              <div
                key={entry.id}
                onClick={() => toggleEntrySelection(entry)}
                style={{
                  padding: '1rem',
                  background: isSelected 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected 
                    ? '2px solid #3b82f6' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: entryBadgeService.getSentimentColorHex(badge.sentimentColor),
                    flexShrink: 0
                  }} />
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#E5E7EB',
                    flex: 1
                  }}>
                    {entry.title || 'Untitled'}
                  </span>
                  {isSelected && (
                    <PremiumIcons.Check size={16} color="#3b82f6" />
                  )}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9CA3AF',
                  marginBottom: '0.5rem'
                }}>
                  {new Date(entry.created_at).toLocaleDateString()}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#6b7280',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {entry.content}
                </div>
                <div style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  gap: '0.25rem'
                }}>
                  {badge.themeIcons.map((icon, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      {entryBadgeService.getThemeEmoji(icon)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
