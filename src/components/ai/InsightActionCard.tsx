import React, { useState } from 'react';
import { PremiumIcons } from '../icons/PremiumIcons';
import { actionableInsightsService } from '../../services/actionableInsightsService';
import { CommitmentModal } from '../modals/CommitmentModal';
import type { ActionableInsight } from '../../types/actionableInsight';

interface InsightActionCardProps {
  insight: {
    insight: string;
    category: string;
  };
  actionableSuggestion?: {
    title: string;
    suggestion: string;
  };
  noteId?: string;
  onAddToPlaybook?: () => void;
  setActiveView?: (view: 'editor' | 'dashboard' | 'settings' | 'playbook' | 'admin') => void;
}

export const InsightActionCard: React.FC<InsightActionCardProps> = ({ 
  insight,
  actionableSuggestion,
  noteId,
  onAddToPlaybook,
  setActiveView
}) => {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Generate smart suggestion based on AI's actionable suggestion or fallback to pattern matching
  const generateSmartSuggestion = (): Partial<ActionableInsight> | null => {
    // First, try to use the AI's actionable suggestion
    if (actionableSuggestion) {
      // Map category to valid ActionableInsight category
      const categoryMap: Record<string, 'coping' | 'exercise' | 'social' | 'mindfulness' | 'sleep' | 'nutrition' | 'general'> = {
        'coping strategy': 'coping',
        'area for growth': 'general',
        'self-awareness': 'mindfulness',
        'achievement': 'general',
        'anxiety management': 'mindfulness',
      };
      
      const mappedCategory = categoryMap[insight.category.toLowerCase()] || 'general';
      
      return {
        title: actionableSuggestion.title,
        description: actionableSuggestion.suggestion,
        category: mappedCategory,
        difficulty: 'easy',
        estimatedTime: '5-15 minutes',
        status: 'active'
      };
    }

    // Fallback to pattern matching if no AI suggestion
    const insightText = insight.insight.toLowerCase();
    
    if (insightText.includes('sleep') || insightText.includes('bedtime') || insightText.includes('tired')) {
      return {
        title: 'Establish a bedtime routine',
        description: 'A suggested coping strategy based on your entry',
        category: 'sleep',
        difficulty: 'easy',
        estimatedTime: '15-30 minutes',
        status: 'active'
      };
    }
    
    if (insightText.includes('scroll') || insightText.includes('phone') || insightText.includes('social media')) {
      return {
        title: 'Set phone boundaries before bed',
        description: 'A suggested coping strategy to reduce late-night screen time',
        category: 'mindfulness',
        difficulty: 'moderate',
        estimatedTime: '5-10 minutes',
        status: 'active'
      };
    }
    
    if (insightText.includes('anxious') || insightText.includes('anxiety') || insightText.includes('stressed')) {
      return {
        title: 'Practice deep breathing exercises',
        description: 'A suggested coping strategy for managing anxiety',
        category: 'coping',
        difficulty: 'easy',
        estimatedTime: '5-10 minutes',
        status: 'active'
      };
    }
    
    if (insightText.includes('exercise') || insightText.includes('workout') || insightText.includes('movement')) {
      return {
        title: 'Start with a 10-minute walk',
        description: 'A suggested exercise routine to build momentum',
        category: 'exercise',
        difficulty: 'easy',
        estimatedTime: '10-15 minutes',
        status: 'active'
      };
    }
    
    // Default general strategy (should rarely be used now)
    return {
      title: 'Reflect on this pattern',
      description: 'A suggested strategy based on your recurring theme',
      category: 'general',
      difficulty: 'easy',
      estimatedTime: '5-10 minutes',
      status: 'active'
    };
  };

  const handleAddClick = () => {
    setShowSuggestion(true);
  };

  const handleAddToPlaybook = () => {
    // Show the commitment modal instead of immediately adding
    setShowModal(true);
  };

  const handleConfirmActivation = () => {
    const suggestion = generateSmartSuggestion();
    if (!suggestion) return;

    setShowModal(false);
    setIsAdding(true);

    // Create the actionable insight
    actionableInsightsService.saveInsight({
      ...suggestion,
      sourceEntryId: noteId
    } as Omit<ActionableInsight, 'id' | 'createdAt'>);

    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      onAddToPlaybook?.();
      
      // Navigate to playbook after brief delay
      setTimeout(() => {
        if (setActiveView) {
          setActiveView('playbook');
        }
      }, 800);
    }, 500);
  };

  const handleCancelModal = () => {
    setShowModal(false);
  };

  const suggestion = generateSmartSuggestion();

  return (
    <div style={{ marginTop: '0.75rem' }}>
      {!showSuggestion ? (
        <button
          onClick={handleAddClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            color: '#3b82f6',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
        >
          <PremiumIcons.Plus size={14} />
          <span>Add to Playbook</span>
        </button>
      ) : (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            marginBottom: '0.75rem',
          }}>
            <span style={{ fontSize: '1.25rem' }}>
              {actionableInsightsService.getCategoryEmoji(suggestion?.category || 'general')}
            </span>
            <div style={{ flex: 1 }}>
              <h4 style={{
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#E5E7EB',
                marginBottom: '0.25rem',
              }}>
                {suggestion?.title}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '0.8rem',
                color: '#9CA3AF',
                lineHeight: '1.4',
              }}>
                {suggestion?.description}
              </p>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginTop: '0.5rem',
                flexWrap: 'wrap',
                fontSize: '0.7rem',
              }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '4px',
                  color: '#3b82f6',
                }}>
                  {suggestion?.difficulty}
                </span>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(156, 163, 175, 0.1)',
                  border: '1px solid rgba(156, 163, 175, 0.2)',
                  borderRadius: '4px',
                  color: '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  <PremiumIcons.Clock size={10} />
                  {suggestion?.estimatedTime}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleAddToPlaybook}
            disabled={isAdding || isAdded}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: isAdded ? '#22c55e' : '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: isAdding || isAdded ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {isAdded ? (
              <>
                <PremiumIcons.Check size={16} />
                <span>Added to Playbook!</span>
              </>
            ) : isAdding ? (
              <span>Adding...</span>
            ) : (
              <>
                <PremiumIcons.Plus size={16} />
                <span>Add to my Playbook</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Commitment Modal */}
      <CommitmentModal
        isOpen={showModal}
        strategyTitle={suggestion?.title || 'this strategy'}
        onConfirm={handleConfirmActivation}
        onCancel={handleCancelModal}
      />
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
