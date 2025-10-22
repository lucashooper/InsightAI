import React from 'react';
import { PremiumIcons } from '../icons/PremiumIcons';

interface GrowthOpportunity {
  insight: string;
  sentiment: "positive" | "opportunity";
  category: string;
  noteId: string; // Added for navigation
  noteTitle: string;
  noteDate: string;
}

interface GrowthOpportunitiesProps {
  insights: GrowthOpportunity[];
  timeRange?: number;
  setActiveView: React.Dispatch<React.SetStateAction<'editor' | 'dashboard' | 'settings'>>;
  setActiveNoteId: (id: string) => void;
}

const GrowthOpportunities: React.FC<GrowthOpportunitiesProps> = ({ insights, timeRange = 30, setActiveView, setActiveNoteId }) => {
  const [showAll, setShowAll] = React.useState(false);
  const INITIAL_DISPLAY_COUNT = 5;
  
  // Handle insight card click
  const handleInsightClick = (noteId: string) => {
    setActiveNoteId(noteId);
    setActiveView('editor');
  };
  
  // Sort insights by priority: Health > Mental Health > Area for Growth > Other
  const sortedInsights = [...insights].sort((a, b) => {
    const priorityOrder: Record<string, number> = {
      'HEALTH': 4,
      'MENTAL HEALTH': 3,
      'AREA FOR GROWTH': 2,
      'OTHER': 1
    };
    
    const aPriority = priorityOrder[a.category.toUpperCase()] || 0;
    const bPriority = priorityOrder[b.category.toUpperCase()] || 0;
    
    return bPriority - aPriority;
  });
  
  const displayedInsights = showAll ? sortedInsights : sortedInsights.slice(0, INITIAL_DISPLAY_COUNT);
  const remainingCount = sortedInsights.length - INITIAL_DISPLAY_COUNT;

  // Parse highlighted phrases from insight text
  const parseHighlightedText = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const highlightedText = part.slice(1, -1);
        return (
          <span
            key={index}
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              padding: '2px 4px',
              borderRadius: '4px',
              fontWeight: '600',
              color: '#f59e0b'
            }}
          >
            {highlightedText}
          </span>
        );
      }
      return part;
    });
  };

  // Get time range label
  const getTimeRangeLabel = (range: number) => {
    switch (range) {
      case 7: return 'This Week';
      case 30: return 'This Month';
      case 90: return 'This Quarter';
      default: return `This Period`;
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1.5rem'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ 
          margin: '0 0 0.5rem 0', 
          color: '#E5E7EB',
          fontSize: '1.25rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <PremiumIcons.Sprout size={20} color="#f59e0b" />
          Patterns to Address ({insights.length})
        </h3>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          Top priorities based on your recent entries
        </p>
      </div>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {displayedInsights.map((insight, index) => (
          <div
            key={index}
            onClick={() => handleInsightClick(insight.noteId)}
            style={{
              padding: '1.5rem',
              background: 'rgba(245, 158, 11, 0.08)',
              borderRadius: '12px',
              border: '2px solid rgba(245, 158, 11, 0.2)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)';
              e.currentTarget.style.border = '2px solid rgba(245, 158, 11, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)';
              e.currentTarget.style.border = '2px solid rgba(245, 158, 11, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Note info badge */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              fontSize: '0.75rem',
              color: '#9CA3AF',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              {insight.noteDate}
            </div>
            
            {/* Insight content */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ 
                margin: '0', 
                fontSize: '1rem', 
                color: '#E5E7EB', 
                lineHeight: '1.6',
                fontWeight: '500'
              }}>
                {parseHighlightedText(insight.insight)}
              </p>
            </div>
            
            {/* Category tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#f59e0b',
                borderRadius: '6px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {insight.category}
              </span>
              
              <span style={{
                fontSize: '0.75rem',
                color: '#9CA3AF',
                fontStyle: 'italic'
              }}>
                from "{insight.noteTitle}"
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* View All / Show Less Button */}
      {!showAll && remainingCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '1rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            color: '#f59e0b',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
          }}
        >
          View {remainingCount} More Focus Areas →
        </button>
      )}
      
      {showAll && sortedInsights.length > INITIAL_DISPLAY_COUNT && (
        <button
          onClick={() => setShowAll(false)}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '1rem',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          ↑ Show Less
        </button>
      )}
    </div>
  );
};

export default GrowthOpportunities;