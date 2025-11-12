import React from 'react';
import Spinner from './Spinner';
import { PremiumIcons } from '../icons/PremiumIcons';
import { InsightActionCard } from './InsightActionCard';
import { Tag } from '../common/Tag';

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
  noteId?: string;
  setActiveView?: (view: 'editor' | 'dashboard' | 'settings' | 'playbook' | 'admin') => void;
}

const InsightsReport: React.FC<InsightsReportProps> = ({ insights, isRegenerating = false, noteId, setActiveView }) => {
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
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Prism found <PremiumIcons.Sparkles size={16} color="#22c55e" /> <strong>{positiveCount}</strong> positive takeaways and
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <PremiumIcons.Sprout size={16} color="#f59e0b" /> <strong>{opportunityCount}</strong> opportunities for growth in your entry.
          </span>
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
                <Tag variant={takeaway.sentiment === 'positive' ? 'success' : 'warning'} size="sm">
                  {takeaway.category}
                </Tag>
                {/* Add to Playbook button for opportunity insights */}
                {takeaway.sentiment === 'opportunity' && (
                  <InsightActionCard 
                    insight={takeaway}
                    actionableSuggestion={insights.actionableSuggestion}
                    noteId={noteId}
                    setActiveView={setActiveView}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Suggestion */}
      <div className="actionable-section">
        <div className="actionable-card">
          <h4 className="actionable-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PremiumIcons.Target size={18} color="currentColor" />
            {insights.actionableSuggestion.title}
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