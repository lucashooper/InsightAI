import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { PremiumIcons } from '../icons/PremiumIcons';
import PageContainer from '../common/PageContainer';
import { actionableInsightsService } from '../../services/actionableInsightsService';
import { dailyProtocolService } from '../../services/dailyProtocolService';
import Emoji from '../common/Emoji';
import type { ActionableInsight } from '../../types/actionableInsight';
import type { DailyProtocol } from '../../types/dailyProtocol';
import './playbook.css';
import '../../styles/page-layout.css';
import '../../styles/premium-cards.css';

interface PlaybookViewProps {
  onNavigateToEntry?: (entryId: string) => void;
  existingNoteIds?: string[]; // Add this to check if source entries exist
}

interface ConsolidatedInsight extends ActionableInsight {
  count: number;
  sourceEntryIds: string[];
  allIds: string[]; // All insight IDs that were merged
  dates: string[];
}

const PlaybookView: React.FC<PlaybookViewProps> = ({ onNavigateToEntry, existingNoteIds }) => {
  const [insights, setInsights] = useState<ConsolidatedInsight[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProtocolForm, setShowProtocolForm] = useState(false);
  const [showSourceEntriesModal, setShowSourceEntriesModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<ConsolidatedInsight | null>(null);
  const [dailyProtocols, setDailyProtocols] = useState<DailyProtocol[]>([]);
  const [activeSection, setActiveSection] = useState<'strategies' | 'protocols'>('protocols');
  const [newStrategy, setNewStrategy] = useState({
    title: '',
    description: '',
    category: 'general' as ActionableInsight['category'],
    difficulty: 'moderate' as ActionableInsight['difficulty'],
    estimatedTime: '10-15 minutes',
    emoji: '✨'
  });

  const categoryEmojis = {
    coping: '💪',
    exercise: '🏃',
    social: '👥',
    mindfulness: '🧘',
    sleep: '😴',
    nutrition: '🥗',
    general: '✨'
  };

  const commonEmojis = ['✨', '💪', '🏃', '👥', '🧘', '😴', '🥗', '🎯', '🌟', '💡', '🔥', '🌈', '🎨', '📚', '🎵', '🌱', '☕', '🍃', '💝', '🌸'];

  const [newProtocol, setNewProtocol] = useState({
    title: '',
    description: '',
    emoji: '✨',
    category: 'anytime' as DailyProtocol['category'],
    estimatedTime: '5-10 minutes'
  });

  useEffect(() => {
    loadInsights();
    loadProtocols();
  }, []); // Load once on mount

  const loadProtocols = () => {
    setDailyProtocols(dailyProtocolService.getActiveProtocols());
  };

  const loadInsights = async () => {
    // Load all insights - we'll organize them by status in the UI
    let loadedInsights: ActionableInsight[] = await actionableInsightsService.getInsights();
    
    console.log('=== LOADED ALL INSIGHTS ===');
    console.log('Count:', loadedInsights.length);
    console.log('Insights with sourceEntryId:', 
      loadedInsights.filter(i => i.sourceEntryId).length
    );
    console.log('Sample insight:', loadedInsights[0]);
    
    // Clean up orphaned insights if we have note IDs to check against
    if (existingNoteIds && existingNoteIds.length > 0) {
      const orphanedInsights = loadedInsights.filter(
        insight => insight.sourceEntryId && !existingNoteIds.includes(insight.sourceEntryId)
      );
      
      if (orphanedInsights.length > 0) {
        console.warn('⚠️ Found orphaned insights (source entries deleted):', orphanedInsights.length);
        console.log('Orphaned insight IDs:', orphanedInsights.map(i => ({ 
          insightId: i.id, 
          title: i.title,
          missingEntryId: i.sourceEntryId 
        })));
        
        // Auto-delete orphaned insights
        for (const insight of orphanedInsights) {
          console.log(`🗑️ Auto-deleting orphaned insight: ${insight.title}`);
          await actionableInsightsService.deleteInsight(insight.id);
        }
        
        // Reload after cleanup
        loadedInsights = await actionableInsightsService.getInsights();
        console.log('✅ Cleaned up. Remaining insights:', loadedInsights.length);
      }
    }
    
    // Consolidate duplicates
    const consolidated = consolidateDuplicates(loadedInsights);
    console.log('📊 Consolidated:', loadedInsights.length, '→', consolidated.length, 'unique strategies');
    
    setInsights(consolidated);
  };
  
  const consolidateDuplicates = (insights: ActionableInsight[]): ConsolidatedInsight[] => {
    const grouped = insights.reduce((acc, insight) => {
      // Normalize title for grouping (lowercase, trim)
      const key = insight.title.toLowerCase().trim();
      
      if (acc[key]) {
        // Duplicate found - merge
        acc[key].count += 1;
        if (insight.sourceEntryId) {
          acc[key].sourceEntryIds.push(insight.sourceEntryId);
        }
        acc[key].allIds.push(insight.id);
        acc[key].dates.push(insight.createdAt);
        
        // Delete duplicate from database (keep the first one)
        console.log(`🗑️ Deleting duplicate strategy: "${insight.title}" (ID: ${insight.id})`);
        actionableInsightsService.deleteInsight(insight.id).catch(err => 
          console.error('Failed to delete duplicate:', err)
        );
      } else {
        // New strategy - keep this one
        acc[key] = {
          ...insight,
          count: 1,
          sourceEntryIds: insight.sourceEntryId ? [insight.sourceEntryId] : [],
          allIds: [insight.id],
          dates: [insight.createdAt]
        };
      }
      
      return acc;
    }, {} as Record<string, ConsolidatedInsight>);
    
    // Convert to array and sort by frequency (highest first)
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  };
  
  const getPriorityColor = (count: number): { bg: string; border: string; text: string } => {
    if (count >= 7) {
      return {
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.4)',
        text: '#F87171'
      };
    }
    if (count >= 4) {
      return {
        bg: 'rgba(249, 115, 22, 0.15)',
        border: 'rgba(249, 115, 22, 0.4)',
        text: '#FB923C'
      };
    }
    if (count >= 2) {
      return {
        bg: 'rgba(251, 191, 36, 0.15)',
        border: 'rgba(251, 191, 36, 0.4)',
        text: '#FCD34D'
      };
    }
    return {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
      text: '#60A5FA'
    };
  };

  const handleStatusChange = async (insightId: string, newStatus: ActionableInsight['status']) => {
    await actionableInsightsService.updateInsightStatus(insightId, newStatus);
    await loadInsights();
  };

  const handleDelete = async (insightId: string) => {
    if (confirm('Remove this insight from your playbook?')) {
      await actionableInsightsService.deleteInsight(insightId);
      await loadInsights();
    }
  };

  const handleProtocolToggle = (protocolId: string) => {
    if (dailyProtocolService.isCompletedToday(protocolId)) {
      dailyProtocolService.uncompleteProtocol(protocolId);
    } else {
      dailyProtocolService.completeProtocol(protocolId);
    }
    loadProtocols(); // Refresh to show updated state
  };

  const handleDeleteProtocol = (protocolId: string) => {
    if (confirm('Delete this daily protocol?')) {
      dailyProtocolService.deleteProtocol(protocolId);
      loadProtocols();
    }
  };

  const InsightCard: React.FC<{ insight: ConsolidatedInsight }> = ({ insight }) => {
    const [progress, setProgress] = React.useState<any>(null);
    
    React.useEffect(() => {
      actionableInsightsService.getProgress(insight.id).then(setProgress);
    }, [insight.id]);
    const priorityColors = getPriorityColor(insight.count);
    
    // Debug logging
    console.log('Insight card:', {
      id: insight.id,
      title: insight.title,
      count: insight.count,
      hasSourceEntry: !!insight.sourceEntryId,
      sourceEntryId: insight.sourceEntryId
    });

    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <div 
        style={{
          padding: '1.25rem',
          paddingBottom: '3.5rem', /* Reserve space for action buttons */
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          width: '100%',
          minHeight: '280px', /* Fixed minimum height prevents expansion */
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Frequency Badge */}
        {insight.count > 1 && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              background: priorityColors.bg,
              border: `1px solid ${priorityColors.border}`,
              color: priorityColors.text,
              backdropFilter: 'blur(10px)',
              cursor: 'help',
              animation: 'none'
            }}
            title={`Suggested ${insight.count} times\nClick "View Source Entries" to see all`}
          >
            <span style={{ fontSize: '14px' }}>🔁</span>
            <span>×{insight.count}</span>
          </div>
        )}

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem',
          paddingRight: insight.count > 1 ? '70px' : '0' // Make room for badge
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>
                {actionableInsightsService.getCategoryEmoji(insight.category)}
              </span>
              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: '600',
                color: '#E5E7EB'
              }}>
                {insight.title}
              </h3>
            </div>
            <p style={{
              margin: '0 0 0.75rem 0',
              fontSize: '0.875rem',
              color: '#9CA3AF',
              lineHeight: '1.5'
            }}>
              {insight.description}
            </p>
          </div>
        </div>

        {/* Simplified Meta Info - Only time estimate */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.8rem',
          color: '#9CA3AF'
        }}>
          <PremiumIcons.Clock size={14} color="#9CA3AF" />
          <span>{insight.estimatedTime}</span>
          {insight.difficulty === 'easy' && <span style={{ color: '#22c55e' }}>• Easy</span>}
          {insight.difficulty === 'challenging' && <span style={{ color: '#ef4444' }}>• Challenging</span>}
        </div>

        {/* Progress */}
        {progress && progress.totalAttempts > 0 && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(34, 197, 94, 0.05)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: '#22c55e'
          }}>
            <div style={{ marginBottom: '0.25rem' }}>
              📊 Progress: {progress.successCount}/{progress.totalAttempts} attempts
            </div>
            {progress.effectiveness > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                ⭐ Effectiveness: {progress.effectiveness.toFixed(1)}/5
              </div>
            )}
          </div>
        )}

        {/* Actions - Absolutely positioned at bottom */}
        <div style={{
          position: 'absolute',
          bottom: '1.25rem',
          left: '1.25rem',
          right: '1.25rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {insight.status === 'suggested' && (
            <>
              <button
                onClick={() => handleStatusChange(insight.id, 'active')}
                style={{
                  padding: '0.5rem',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                title="Try This"
              >
                <PremiumIcons.Check size={16} />
              </button>
              <button
                onClick={() => handleStatusChange(insight.id, 'skipped')}
                style={{
                  padding: '0.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                title="Skip"
              >
                <PremiumIcons.ArrowRight size={16} />
              </button>
            </>
          )}

          {insight.status === 'active' && (
            <>
              <button
                onClick={() => handleStatusChange(insight.id, 'completed')}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#22c55e',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <PremiumIcons.Check size={14} />
                Mark Complete
              </button>
              <button
                onClick={() => {
                  const note = prompt('How did it go? (optional)');
                  const effectiveness = prompt('Rate effectiveness (1-5):');
                  actionableInsightsService.recordAttempt(
                    insight.id,
                    true,
                    effectiveness ? parseInt(effectiveness) : undefined,
                    note || undefined
                  ).then(() => loadInsights());
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#9CA3AF',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Log Progress
              </button>
            </>
          )}

          {insight.sourceEntryIds.length > 0 && onNavigateToEntry && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (insight.count === 1) {
                  // Single source entry - navigate directly
                  console.log('=== VIEW SOURCE ENTRY CLICKED (SINGLE) ===');
                  console.log('Source Entry ID:', insight.sourceEntryIds[0]);
                  
                  // Check if source entry still exists
                  if (existingNoteIds && !existingNoteIds.includes(insight.sourceEntryIds[0])) {
                    console.error('❌ Source entry no longer exists!');
                    const shouldDelete = confirm(
                      `The source entry for "${insight.title}" has been deleted.\n\nWould you like to remove this strategy from your playbook?`
                    );
                    if (shouldDelete) {
                      handleDelete(insight.id);
                    }
                    return;
                  }
                  
                  onNavigateToEntry(insight.sourceEntryIds[0]);
                } else {
                  // Multiple source entries - show modal
                  console.log('=== VIEW SOURCE ENTRIES CLICKED (MULTIPLE) ===');
                  console.log('Count:', insight.count);
                  console.log('Source Entry IDs:', insight.sourceEntryIds);
                  setSelectedInsight(insight);
                  setShowSourceEntriesModal(true);
                }
              }}
              style={{
                padding: '0.5rem',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '6px',
                color: '#8b5cf6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title={insight.count === 1 ? 'View Source Entry' : `View ${insight.count} Source Entries`}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                e.currentTarget.style.borderColor = '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
              }}
            >
              <PremiumIcons.FileText size={16} />
            </button>
          )}
          
          {/* Removed redundant recurring warning - count badge is sufficient */}
          
          {!insight.sourceEntryIds.length && !onNavigateToEntry && (
            insight.sourceEntryId && !onNavigateToEntry && (
              <div style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px'
              }}>
                ⚠️ Navigation not available (missing handler)
              </div>
            )
          )}

          {isHovered && (
            <button
              onClick={() => handleDelete(insight.id)}
              style={{
                marginLeft: 'auto',
                padding: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Delete"
            >
              <PremiumIcons.Trash size={16} color="#ef4444" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Source Entries Modal Component
  const SourceEntriesModal = () => {
    if (!showSourceEntriesModal || !selectedInsight) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}
      onClick={() => setShowSourceEntriesModal(false)}
      >
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
        >
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
              fontWeight: '600'
            }}>
              Source Entries
            </h2>
            <button
              onClick={() => setShowSourceEntriesModal(false)}
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

          <p style={{
            margin: '0 0 1rem 0',
            color: '#9CA3AF',
            fontSize: '0.9rem'
          }}>
            "{selectedInsight.title}" was suggested in <strong>{selectedInsight.count} entries</strong>:
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {selectedInsight.dates.map((date, i) => {
              const entryId = selectedInsight.sourceEntryIds[i];
              const isDeleted = existingNoteIds && !existingNoteIds.includes(entryId);
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (isDeleted) {
                      alert('This entry has been deleted');
                      return;
                    }
                    setShowSourceEntriesModal(false);
                    onNavigateToEntry?.(entryId);
                  }}
                  disabled={isDeleted}
                  style={{
                    padding: '1rem',
                    background: isDeleted ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.03)',
                    border: isDeleted ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    color: isDeleted ? '#9CA3AF' : '#E5E7EB',
                    fontSize: '0.9rem',
                    cursor: isDeleted ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    opacity: isDeleted ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleted) {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeleted) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                >
                  <PremiumIcons.Calendar size={16} color={isDeleted ? '#9CA3AF' : '#60A5FA'} />
                  <div style={{ flex: 1 }}>
                    <div>{new Date(date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'short'
                    })}</div>
                    {isDeleted && (
                      <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                        Entry deleted
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* CSS Animation + Override global h1 styles */}
      <style>{`
        @keyframes subtle-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        /* Override global h1 styles for playbook */
        .page-container h1 {
          font-size: 1.75rem !important;
          line-height: 1.2 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
      
    <PageContainer>
      <div style={{ margin: '0', padding: '0' }}>
      {/* Redesigned Header - Compact & Clean */}
      <div className="playbook-header-enhanced">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Target size={28} color="#8b5cf6" className="playbook-icon-glow" />
            <h1 className="playbook-title-enhanced">
              Personal Playbook
            </h1>
          </div>
        </div>
      </div>

      {/* Section Tabs - Premium Segmented Control */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        <div className="tab-selector-premium" style={{ flex: 1 }}>
        <button
          onClick={() => setActiveSection('protocols')}
          className={`tab-button-premium ${activeSection === 'protocols' ? 'active' : ''}`}
        >
          <span>Daily Protocols</span>
        </button>
        <button
          onClick={() => setActiveSection('strategies')}
          className={`tab-button-premium ${activeSection === 'strategies' ? 'active' : ''}`}
        >
          <span>Strategies</span>
        </button>
        </div>
        
        {/* Add Button - Integrated with tabs */}
        <button
          onClick={() => activeSection === 'protocols' ? setShowProtocolForm(true) : setShowCreateForm(true)}
          style={{
            padding: '0.5rem 1rem',
            background: '#8b5cf6',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#7c3aed';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#8b5cf6';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.3)';
          }}
          title={activeSection === 'protocols' ? 'Add Protocol' : 'Add Strategy'}
        >
          <span style={{ fontSize: '1.25rem', lineHeight: '1' }}>+</span>
          <span>{activeSection === 'protocols' ? 'Add Protocol' : 'Add Strategy'}</span>
        </button>
      </div>

      {/* Removed confusing filter tabs - strategies now show all relevant items organized by priority */}

      {/* Source Entries Modal */}
      <SourceEntriesModal />
      
      {/* Redesigned Insights Display - Priority-Based */}
      {activeSection === 'strategies' && (insights.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: '#9CA3AF'
        }}>
          <PremiumIcons.Target size={48} color="#6b7280" />
          <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#E5E7EB' }}>
            No Strategies Yet
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Analyze your diary entries to get personalized strategy suggestions based on your patterns and emotions.
          </p>
        </div>
      ) : (() => {
        // Separate strategies by status
        const activeStrategies = insights.filter(i => i.status === 'active');
        const suggestedStrategies = insights.filter(i => i.status === 'suggested');
        
        // Sort suggested by count (recurring patterns first) - these are top priorities
        const sortedSuggested = [...suggestedStrategies].sort((a, b) => b.count - a.count);
        const topPriorities = sortedSuggested.slice(0, 3);
        const otherSuggested = sortedSuggested.slice(3);
        
        // Group other suggested by category
        const categorizedSuggested = otherSuggested.reduce((acc: Record<string, ConsolidatedInsight[]>, insight) => {
          const category = actionableInsightsService.getCategoryLabel(insight.category);
          if (!acc[category]) acc[category] = [];
          acc[category].push(insight);
          return acc;
        }, {});
        
        // Smart category display: only show dedicated sections for categories with 3+ items
        const largeCategories: Record<string, ConsolidatedInsight[]> = {};
        const smallCategoryItems: ConsolidatedInsight[] = [];
        
        Object.entries(categorizedSuggested).forEach(([category, items]) => {
          if (items.length >= 3) {
            largeCategories[category] = items;
          } else {
            smallCategoryItems.push(...items);
          }
        });
        
        return (
          <div style={{ 
            width: '100%', 
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {/* TODAY'S PRIORITIES - Top 3 most recurring patterns - Premium Design */}
            {topPriorities.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Target size={24} color="#8b5cf6" />
                    Today's Priorities
                  </h2>
                  <p style={{
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.875rem',
                    color: '#9CA3AF'
                  }}>
                    Focus on these recurring patterns first
                  </p>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
                  gap: '1.5rem'
                }}>
                  {topPriorities.map(insight => (
                    <div key={insight.id} className="premium-card-priority premium-card-hover-gradient premium-glow">
                      <InsightCard insight={insight} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* ACTIVE STRATEGIES - Currently practicing - Premium Design */}
            {activeStrategies.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{
                  margin: '0 0 1.5rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>✅</span>
                  Active Strategies ({activeStrategies.length})
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
                  gap: '1.5rem'
                }}>
                  {activeStrategies.map(insight => (
                    <div key={insight.id} className="premium-card-active premium-card-hover-gradient">
                      <InsightCard insight={insight} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* OTHER SUGGESTED - Collapsible by category */}
            {otherSuggested.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#E5E7EB',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    marginBottom: showAllCategories ? '1.5rem' : '0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>💡</span>
                    <span>More Suggested Strategies ({otherSuggested.length})</span>
                  </span>
                  <span style={{ 
                    transform: showAllCategories ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    fontSize: '1.2rem'
                  }}>
                    ▼
                  </span>
                </button>
                
                {showAllCategories && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Large categories (3+ items) get dedicated sections */}
                    {Object.entries(largeCategories).map(([category, categoryInsights]) => (
                      <div key={category}>
                        <div style={{
                          marginBottom: '1rem',
                          paddingLeft: '0.5rem',
                          fontSize: '0.85rem',
                          color: '#9CA3AF',
                          fontWeight: '600',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span>{actionableInsightsService.getCategoryEmoji((categoryInsights as ConsolidatedInsight[])[0].category)}</span>
                          <span>{category}</span>
                          <span style={{ 
                            fontSize: '0.75rem',
                            color: '#6B7280',
                            fontWeight: '400'
                          }}>
                            ({(categoryInsights as ConsolidatedInsight[]).length})
                          </span>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
                          gap: '1.5rem'
                        }}>
                          {(categoryInsights as ConsolidatedInsight[]).map(insight => (
                            <div key={insight.id} className="premium-card premium-card-hover-gradient">
                              <InsightCard insight={insight} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Small categories (<3 items) consolidated into "Other Recommended" */}
                    {smallCategoryItems.length > 0 && (
                      <div>
                        <div style={{
                          marginBottom: '1rem',
                          paddingLeft: '0.5rem',
                          fontSize: '0.85rem',
                          color: '#9CA3AF',
                          fontWeight: '600',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase'
                        }}>
                          OTHER RECOMMENDED STRATEGIES ({smallCategoryItems.length})
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
                          gap: '1.5rem'
                        }}>
                          {smallCategoryItems.map(insight => (
                            <div key={insight.id} className="premium-card premium-card-hover-gradient">
                              <InsightCard insight={insight} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })())}

      {/* Daily Protocols Section */}
      {activeSection === 'protocols' && (
        <div className="playbook-container">
          {/* Sidebar - Unified Status Card */}
          <div className="playbook-sidebar">
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(139, 92, 246, 0.1) inset'
            }}>
              <h3 style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#E5E7EB',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Today's Progress
              </h3>
              {dailyProtocols.length > 0 ? (
                <>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#8b5cf6',
                    marginBottom: '0.5rem'
                  }}>
                    {dailyProtocols.filter(p => {
                      const stats = dailyProtocolService.getStats(p.id);
                      const today = new Date().toISOString().split('T')[0];
                      return stats.lastCompletedDate === today;
                    }).length}/{dailyProtocols.length}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#9CA3AF',
                    marginBottom: '0.75rem'
                  }}>
                    protocols completed
                  </div>
                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(dailyProtocols.filter(p => {
                        const stats = dailyProtocolService.getStats(p.id);
                        const today = new Date().toISOString().split('T')[0];
                        return stats.lastCompletedDate === today;
                      }).length / dailyProtocols.length) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </>
              ) : (
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>
                  No protocols yet
                </p>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="playbook-main">
            {dailyProtocols.length === 0 ? (
              <div className="empty-state-content">
                <div className="icon-card">
                  <PremiumIcons.Target size={48} color="#8b5cf6" />
                </div>
                <h2>No Daily Protocols Yet</h2>
                <p>Create recurring daily habits to track your progress and build streaks.</p>
                <button
                  onClick={() => setShowProtocolForm(true)}
                  className="create-protocol-button"
                >
                  Create Your First Protocol
                </button>
              </div>
            ) : (
              <div className="playbook-content-grid" style={{ width: '100%' }}>
                {dailyProtocols.map(protocol => {
                  const stats = dailyProtocolService.getStats(protocol.id);
                  const isCompletedToday = dailyProtocolService.isCompletedToday(protocol.id);
                  const history = dailyProtocolService.getCompletionHistory(protocol.id, 30);

                return (
                  <div
                    key={protocol.id}
                    style={{
                      padding: '1.5rem',
                      background: isCompletedToday 
                        ? 'rgba(34, 197, 94, 0.08)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isCompletedToday
                        ? '1px solid rgba(34, 197, 94, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      {/* Checkbox */}
                      <button
                        onClick={() => handleProtocolToggle(protocol.id)}
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          border: isCompletedToday ? '2px solid #22c55e' : '2px solid rgba(255, 255, 255, 0.2)',
                          background: isCompletedToday ? '#22c55e' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        {isCompletedToday && '✓'}
                      </button>

                      <div style={{ flex: 1 }}>
                        {/* Title and emoji */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          <Emoji emoji={protocol.emoji} size={24} />
                          <h3 style={{
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#E5E7EB',
                            textDecoration: isCompletedToday ? 'line-through' : 'none',
                            opacity: isCompletedToday ? 0.7 : 1
                          }}>
                            {protocol.title}
                          </h3>
                        </div>

                        {protocol.description && (
                          <p style={{
                            margin: '0 0 1rem 0',
                            fontSize: '0.875rem',
                            color: '#9CA3AF',
                            lineHeight: '1.5'
                          }}>
                            {protocol.description}
                          </p>
                        )}

                        {/* Meta info */}
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          marginBottom: '1rem',
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          <div style={{
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '4px',
                            color: '#3b82f6'
                          }}>
                            {dailyProtocolService.getCategoryIcon(protocol.category)} {dailyProtocolService.getCategoryLabel(protocol.category)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <PremiumIcons.Clock size={12} color="#6b7280" />
                            {protocol.estimatedTime}
                          </div>
                        </div>

                        {/* Streak Stats */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '1rem',
                          padding: '1rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '8px',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              color: stats.currentStreak > 0 ? '#f59e0b' : '#6b7280',
                              marginBottom: '0.25rem'
                            }}>
                              🔥 {stats.currentStreak}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                              Current Streak
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              color: '#22c55e',
                              marginBottom: '0.25rem'
                            }}>
                              🏆 {stats.longestStreak}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                              Best Streak
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              color: '#3b82f6',
                              marginBottom: '0.25rem'
                            }}>
                              {stats.completionRate}%
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                              Completion
                            </div>
                          </div>
                        </div>

                        {/* 30-day history visualization */}
                        <div style={{
                          display: 'flex',
                          gap: '2px',
                          marginBottom: '0.75rem'
                        }}>
                          {history.slice(-30).map((day, idx) => (
                            <div
                              key={idx}
                              title={day.date}
                              style={{
                                flex: 1,
                                height: '24px',
                                background: day.completed ? '#22c55e' : 'rgba(255, 255, 255, 0.08)',
                                borderRadius: '2px',
                                transition: 'all 0.2s ease'
                              }}
                            />
                          ))}
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteProtocol(protocol.id)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: 'transparent',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            color: '#ef4444',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <PremiumIcons.Trash size={14} color="#ef4444" />
                          <span>Delete Protocol</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Strategy Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
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
                fontWeight: '600'
              }}>
                Create New Strategy
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
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

            <form onSubmit={(e) => {
              e.preventDefault();
              actionableInsightsService.saveInsight({
                title: newStrategy.title,
                description: newStrategy.description,
                category: newStrategy.category,
                difficulty: newStrategy.difficulty,
                estimatedTime: newStrategy.estimatedTime,
                source: 'user_created',
                status: 'active'
              }).then(() => loadInsights());
              setNewStrategy({
                title: '',
                description: '',
                category: 'general',
                difficulty: 'moderate',
                estimatedTime: '10-15 minutes',
                emoji: '✨'
              });
              setShowCreateForm(false);
              loadInsights();
            }}>
              {/* Emoji Picker */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#9CA3AF',
                  fontWeight: '500'
                }}>
                  Choose an emoji
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(10, 1fr)',
                  gap: '0.5rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewStrategy({...newStrategy, emoji})}
                      style={{
                        padding: '0.5rem',
                        background: newStrategy.emoji === emoji ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        border: newStrategy.emoji === emoji ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#9CA3AF',
                  fontWeight: '500'
                }}>
                  Strategy name *
                </label>
                <input
                  type="text"
                  required
                  value={newStrategy.title}
                  onChange={(e) => setNewStrategy({...newStrategy, title: e.target.value})}
                  placeholder="e.g., Morning meditation routine"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#E5E7EB',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#9CA3AF',
                  fontWeight: '500'
                }}>
                  Description
                </label>
                <textarea
                  value={newStrategy.description}
                  onChange={(e) => setNewStrategy({...newStrategy, description: e.target.value})}
                  placeholder="Describe what this strategy involves and why it helps..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#E5E7EB',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              {/* Category & Difficulty */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#9CA3AF',
                    fontWeight: '500'
                  }}>
                    Category
                  </label>
                  <select
                    value={newStrategy.category}
                    onChange={(e) => setNewStrategy({...newStrategy, category: e.target.value as any})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#E5E7EB',
                      fontSize: '0.95rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {Object.entries(categoryEmojis).map(([key, emoji]) => (
                      <option key={key} value={key}>
                        {emoji} {actionableInsightsService.getCategoryLabel(key as any)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#9CA3AF',
                    fontWeight: '500'
                  }}>
                    Difficulty
                  </label>
                  <select
                    value={newStrategy.difficulty}
                    onChange={(e) => setNewStrategy({...newStrategy, difficulty: e.target.value as any})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#E5E7EB',
                      fontSize: '0.95rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>
              </div>

              {/* Estimated Time */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#9CA3AF',
                  fontWeight: '500'
                }}>
                  Estimated time
                </label>
                <input
                  type="text"
                  value={newStrategy.estimatedTime}
                  onChange={(e) => setNewStrategy({...newStrategy, estimatedTime: e.target.value})}
                  placeholder="e.g., 5-10 minutes"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#E5E7EB',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#9CA3AF',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Create Strategy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Daily Protocol Modal */}
      {showProtocolForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
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
                fontWeight: '600'
              }}>
                Create Daily Protocol
              </h2>
              <button
                onClick={() => setShowProtocolForm(false)}
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

            <form onSubmit={(e) => {
              e.preventDefault();
              dailyProtocolService.saveProtocol({
                title: newProtocol.title,
                description: newProtocol.description,
                emoji: newProtocol.emoji,
                category: newProtocol.category,
                estimatedTime: newProtocol.estimatedTime,
                isActive: true
              });
              setNewProtocol({
                title: '',
                description: '',
                emoji: '✨',
                category: 'anytime',
                estimatedTime: '5-10 minutes'
              });
              setShowProtocolForm(false);
              loadProtocols();
            }}>
              {/* Emoji Picker */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#9CA3AF',
                  fontWeight: '500'
                }}>
                  Choose an emoji
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(10, 1fr)',
                  gap: '0.5rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewProtocol({...newProtocol, emoji})}
                      style={{
                        padding: '0.5rem',
                        background: newProtocol.emoji === emoji ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        border: newProtocol.emoji === emoji ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#9CA3AF',
                  fontWeight: '500'
                }}>
                  Protocol name *
                </label>
                <input
                  type="text"
                  required
                  value={newProtocol.title}
                  onChange={(e) => setNewProtocol({...newProtocol, title: e.target.value})}
                  placeholder="e.g., Morning meditation"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#E5E7EB',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#9CA3AF',
                  fontWeight: '500'
                }}>
                  Description
                </label>
                <textarea
                  value={newProtocol.description}
                  onChange={(e) => setNewProtocol({...newProtocol, description: e.target.value})}
                  placeholder="What does this daily habit involve?"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#E5E7EB',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>

              {/* Category & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#9CA3AF',
                    fontWeight: '500'
                  }}>
                    Time of day
                  </label>
                  <select
                    value={newProtocol.category}
                    onChange={(e) => setNewProtocol({...newProtocol, category: e.target.value as any})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#E5E7EB',
                      fontSize: '0.95rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="morning">🌅 Morning</option>
                    <option value="afternoon">☀️ Afternoon</option>
                    <option value="evening">🌙 Evening</option>
                    <option value="anytime">⏰ Anytime</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#9CA3AF',
                    fontWeight: '500'
                  }}>
                    Estimated time
                  </label>
                  <input
                    type="text"
                    value={newProtocol.estimatedTime}
                    onChange={(e) => setNewProtocol({...newProtocol, estimatedTime: e.target.value})}
                    placeholder="e.g., 5-10 minutes"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#E5E7EB',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowProtocolForm(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#9CA3AF',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Create Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </PageContainer>
    </>
  );
};

export default PlaybookView;
