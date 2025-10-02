import React from 'react';
import Spinner from './Spinner';

interface KeyTakeaway {
  insight: string;
  sentiment: "positive" | "opportunity";
  category: string;
}

interface ActionableSuggestion {
  title: string;
  suggestion: string;
}

interface InsightsReportData {
  conversationalSummary: string;
  keyTakeaways: KeyTakeaway[];
  actionableSuggestion: ActionableSuggestion;
}

interface InsightsReportProps {
  insights: InsightsReportData;
  isRegenerating?: boolean;
}

const InsightsReport: React.FC<InsightsReportProps> = ({ insights, isRegenerating = false }) => {
  // Parse highlighted phrases from insight text
  const parseHighlightedText = (text: string, sentiment: "positive" | "opportunity") => {
    const parts = text.split(/(\*[^*]+\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const highlightedText = part.slice(1, -1);
        return (
          <span
            key={index}
            className={`highlighted-phrase ${sentiment}`}
            style={{
              backgroundColor: sentiment === 'positive' 
                ? 'rgba(34, 197, 94, 0.15)' 
                : 'rgba(245, 158, 11, 0.15)',
              padding: '2px 4px',
              borderRadius: '4px',
              fontWeight: '600'
            }}
          >
            {highlightedText}
          </span>
        );
      }
      return part;
    });
  };

  const positiveCount = insights.keyTakeaways.filter(t => t.sentiment === 'positive').length;
  const opportunityCount = insights.keyTakeaways.filter(t => t.sentiment === 'opportunity').length;

  return (
    <div className="insights-report insights-report-container">
      {/* Regeneration Overlay */}
      {isRegenerating && (
        <div className="regeneration-overlay">
          <Spinner size="large" />
          <span>Scanning for deeper insights...</span>
        </div>
      )}
      
      {/* Conversational Summary */}
      <div className="summary-section">
        <p className="conversational-summary">
          {insights.conversationalSummary}
        </p>
      </div>

      {/* Quantified Summary */}
      <div className="insights-summary">
        <p>
          Prism found ✨ <strong>{positiveCount}</strong> positive takeaways and 🌱 <strong>{opportunityCount}</strong> opportunities for growth in your entry.
        </p>
      </div>

      {/* Key Takeaways */}
      <div className="takeaways-section">
        <h3>Key Insights</h3>
        <div className="takeaways-grid">
          {insights.keyTakeaways.map((takeaway, index) => (
            <div
              key={index}
              className={`insight-card ${takeaway.sentiment}`}
            >
              <div className="insight-content">
                <p className="insight-text">
                  {parseHighlightedText(takeaway.insight, takeaway.sentiment)}
                </p>
                <span className="category-tag">
                  {takeaway.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Suggestion */}
      <div className="actionable-section">
        <div className="actionable-card">
          <h4 className="actionable-title">
            🎯 {insights.actionableSuggestion.title}
          </h4>
          <p className="actionable-suggestion">
            {insights.actionableSuggestion.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightsReport; 