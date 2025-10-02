import React from 'react';

interface PositiveInsight {
  insight: string;
  sentiment: "positive" | "opportunity";
  category: string;
  noteTitle: string;
  noteDate: string;
  noteId: string; // Added for navigation
}

interface MonthlyHighlightsProps {
  insights: PositiveInsight[];
  timeRange?: number;
  setActiveView: React.Dispatch<React.SetStateAction<'editor' | 'dashboard' | 'settings'>>;
  setActiveNoteId: (id: string) => void;
}

const MonthlyHighlights: React.FC<MonthlyHighlightsProps> = ({ insights, timeRange = 30, setActiveView, setActiveNoteId }) => {
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
            className="highlighted-phrase positive"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              padding: '2px 4px',
              borderRadius: '4px',
              fontWeight: '600',
              color: '#22c55e'
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
        <h4 style={{ color: '#E5E7EB', marginBottom: '0.5rem' }}>No Wins Yet</h4>
        <p style={{ margin: '0', fontSize: '0.9rem' }}>
          Your positive insights and achievements will appear here once you have some analysis.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#1F2937',
      borderRadius: '12px',
      border: '1px solid #374151',
      padding: '1.5rem'
    }}>
      <h3 style={{ 
        margin: '0 0 1.5rem 0', 
        color: '#E5E7EB',
        fontSize: '1.25rem',
        fontWeight: '600'
      }}>
        ✨ Your Wins {getTimeRangeLabel(timeRange)} ({insights.length})
      </h3>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {insights.map((insight, index) => (
          <div
            key={index}
            onClick={() => handleInsightClick(insight.noteId)}
            style={{
              padding: '1.5rem',
              background: 'rgba(34, 197, 94, 0.08)',
              borderRadius: '12px',
              border: '2px solid rgba(34, 197, 94, 0.2)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.12)';
              e.currentTarget.style.border = '2px solid rgba(34, 197, 94, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.08)';
              e.currentTarget.style.border = '2px solid rgba(34, 197, 94, 0.2)';
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
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#22c55e',
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
        background: 'rgba(34, 197, 94, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(34, 197, 94, 0.1)'
      }}>
        🎉 You've made {insights.length} positive discoveries {getTimeRangeLabel(timeRange).toLowerCase()}! Keep up the great work.
      </div>
    </div>
  );
};

export default MonthlyHighlights; 