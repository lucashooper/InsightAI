import React, { useState, useEffect } from 'react';
import { PremiumIcons } from '../icons/PremiumIcons';
import { actionableInsightsService } from '../../services/actionableInsightsService';
import { dailyProtocolService } from '../../services/dailyProtocolService';
import Emoji from '../common/Emoji';
import type { ActionableInsight } from '../../types/actionableInsight';
import type { DailyProtocol } from '../../types/dailyProtocol';

interface PlaybookViewProps {
  onNavigateToEntry?: (entryId: string) => void;
}

const PlaybookView: React.FC<PlaybookViewProps> = ({ onNavigateToEntry }) => {
  const [insights, setInsights] = useState<ActionableInsight[]>([]);
  const [filter, setFilter] = useState<'all' | 'suggested' | 'active' | 'completed'>('active');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProtocolForm, setShowProtocolForm] = useState(false);
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
  }, [filter]);

  const loadProtocols = () => {
    setDailyProtocols(dailyProtocolService.getActiveProtocols());
  };

  const loadInsights = () => {
    if (filter === 'all') {
      setInsights(actionableInsightsService.getInsights());
    } else {
      setInsights(actionableInsightsService.getInsightsByStatus(filter));
    }
  };

  const handleStatusChange = (insightId: string, newStatus: ActionableInsight['status']) => {
    actionableInsightsService.updateInsightStatus(insightId, newStatus);
    loadInsights();
  };

  const handleDelete = (insightId: string) => {
    if (confirm('Remove this insight from your playbook?')) {
      actionableInsightsService.deleteInsight(insightId);
      loadInsights();
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

  const InsightCard: React.FC<{ insight: ActionableInsight }> = ({ insight }) => {
    const progress = actionableInsightsService.getProgress(insight.id);

    return (
      <div style={{
        padding: '1.25rem',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        transition: 'all 0.2s ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem'
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

        {/* Meta Info */}
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
            {actionableInsightsService.getCategoryLabel(insight.category)}
          </div>
          <div style={{
            padding: '0.25rem 0.5rem',
            background: `${actionableInsightsService.getDifficultyColor(insight.difficulty)}20`,
            border: `1px solid ${actionableInsightsService.getDifficultyColor(insight.difficulty)}40`,
            borderRadius: '4px',
            color: actionableInsightsService.getDifficultyColor(insight.difficulty)
          }}>
            {insight.difficulty}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <PremiumIcons.Clock size={12} color="#6b7280" />
            {insight.estimatedTime}
          </div>
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

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {insight.status === 'suggested' && (
            <>
              <button
                onClick={() => handleStatusChange(insight.id, 'active')}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#3b82f6',
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
                Try This
              </button>
              <button
                onClick={() => handleStatusChange(insight.id, 'skipped')}
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
                Skip
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
                  );
                  loadInsights();
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

          {insight.sourceEntryId && onNavigateToEntry && (
            <button
              onClick={() => onNavigateToEntry(insight.sourceEntryId!)}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '6px',
                color: '#8b5cf6',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              View Source Entry
            </button>
          )}

          <button
            onClick={() => handleDelete(insight.id)}
            style={{
              marginLeft: 'auto',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <PremiumIcons.Trash size={14} color="#ef4444" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '700',
            color: '#E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <PremiumIcons.Target size={32} color="#E5E7EB" />
            Personal Playbook
          </h1>
          <p style={{
            margin: '0.5rem 0 0 0',
            color: '#9CA3AF',
            fontSize: '0.95rem'
          }}>
            Track strategies that work for you
          </p>
        </div>
        <button
          onClick={() => activeSection === 'protocols' ? setShowProtocolForm(true) : setShowCreateForm(true)}
          style={{
            padding: '0.75rem 1.25rem',
            background: '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          <PremiumIcons.Plus size={18} />
          <span>{activeSection === 'protocols' ? 'Add Protocol' : 'Add Strategy'}</span>
        </button>
      </div>

      {/* Section Tabs - Daily Protocols vs Strategies */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        padding: '0.5rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <button
          onClick={() => setActiveSection('protocols')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: activeSection === 'protocols' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            border: activeSection === 'protocols' ? '1px solid #3b82f6' : '1px solid transparent',
            borderRadius: '8px',
            color: activeSection === 'protocols' ? '#3b82f6' : '#9CA3AF',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: activeSection === 'protocols' ? '600' : '400',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>📅</span>
          <span>Daily Protocols</span>
        </button>
        <button
          onClick={() => setActiveSection('strategies')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: activeSection === 'strategies' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            border: activeSection === 'strategies' ? '1px solid #3b82f6' : '1px solid transparent',
            borderRadius: '8px',
            color: activeSection === 'strategies' ? '#3b82f6' : '#9CA3AF',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: activeSection === 'strategies' ? '600' : '400',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>💡</span>
          <span>Strategies</span>
        </button>
      </div>

      {/* Strategies Filter Tabs */}
      {activeSection === 'strategies' && (
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '0.5rem'
      }}>
        {(['active', 'suggested', 'completed', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '0.5rem 1rem',
              background: filter === tab ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              border: filter === tab ? '1px solid #3b82f6' : '1px solid transparent',
              borderRadius: '6px',
              color: filter === tab ? '#3b82f6' : '#9CA3AF',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: filter === tab ? '600' : '400',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'all' && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                ({actionableInsightsService.getInsightsByStatus(tab).length})
              </span>
            )}
          </button>
        ))}
      </div>
      )}

      {/* Insights Grid */}
      {activeSection === 'strategies' && (insights.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: '#9CA3AF'
        }}>
          <PremiumIcons.Target size={48} color="#6b7280" />
          <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#E5E7EB' }}>
            {filter === 'active' ? 'No Active Strategies' : 'No Insights Yet'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            {filter === 'active' 
              ? 'Start by activating suggested strategies or analyze your entries to get personalized recommendations.'
              : 'Analyze your diary entries to get personalized strategy suggestions.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {insights.map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      ))}

      {/* Daily Protocols Section */}
      {activeSection === 'protocols' && (
        <div>
          {dailyProtocols.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#9CA3AF'
            }}>
              <span style={{ fontSize: '4rem' }}>📅</span>
              <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#E5E7EB' }}>
                No Daily Protocols Yet
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Create recurring daily habits to track your progress and build streaks.
              </p>
              <button
                onClick={() => setShowProtocolForm(true)}
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Create Your First Protocol
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
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
              });
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
  );
};

export default PlaybookView;
