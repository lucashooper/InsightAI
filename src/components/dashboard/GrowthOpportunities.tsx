import React from 'react';

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
  // Handle insight card click
  const handleInsightClick = (noteId: string) => {
    setActiveNoteId(noteId);
    setActiveView('editor');
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

  // Parse highlighted phrases from insight text (reusing logic from InsightsReport)
  const parseHighlightedText = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const highlightedText = part.slice(1, -1);
        return (
          <span
            key={index}
            className="highlighted-phrase opportunity"
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

  if (insights.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: '#9CA3AF',
        background: '#1F2937',
        borderRadius: '12px',
        border: '1px solid #374151'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
        <h4 style={{ color: '#E5E7EB', marginBottom: '0.5rem' }}>No Growth Areas Yet</h4>
        <p style={{ margin: '0', fontSize: '0.9rem' }}>
          Your growth opportunities will appear here once you have some analysis.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1.5rem'
    }}>
      <h3 style={{ 
        margin: '0 0 1.5rem 0', 
        color: '#E5E7EB',
        fontSize: '1.25rem',
        fontWeight: '600'
      }}>
        🌱 Your Focus Areas {getTimeRangeLabel(timeRange)} ({insights.length})
      </h3>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {insights.map((insight, index) => (
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
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
      
      <div style={{ 
        marginTop: '1.5rem', 
        fontSize: '0.875rem', 
        color: '#9CA3AF',
        textAlign: 'center',
        padding: '1rem',
        background: 'rgba(245, 158, 11, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(245, 158, 11, 0.1)'
      }}>
        🌱 You have {insights.length} growth opportunities to explore {getTimeRangeLabel(timeRange).toLowerCase()}. Each one is a step toward personal development.
      </div>
    </div>
  );
};

export default GrowthOpportunities; 