import React from 'react';
import { PremiumIcons } from '../icons/PremiumIcons';
import type { DiaryEntry } from '../../types/diary';

interface NarrativeSummaryProps {
  entries: DiaryEntry[];
  timeRange: number;
}

const NarrativeSummary: React.FC<NarrativeSummaryProps> = ({ entries, timeRange }) => {
  // Generate dynamic title based on time range
  const getTitle = () => {
    const now = new Date();
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });
    
    if (timeRange === 7) return 'Your Week in Review';
    if (timeRange === 30) return `Your ${monthName} Story`;
    if (timeRange === 90) return 'Your Quarterly Journey';
    return `Your ${timeRange}-Day Story`;
  };

  // Generate narrative based on entry analysis
  const generateNarrative = (): string => {
    if (entries.length === 0) {
      return "You haven't written any entries in this period. Start journaling to see your personal story unfold.";
    }

    // Calculate sentiment trends
    const positiveEntries = entries.filter(e => 
      e.ai_structured_insights?.mood_analysis?.primary_emotion?.toLowerCase().includes('happy') ||
      e.ai_structured_insights?.mood_analysis?.primary_emotion?.toLowerCase().includes('joy') ||
      e.ai_structured_insights?.mood_analysis?.primary_emotion?.toLowerCase().includes('grateful')
    );

    const challengingEntries = entries.filter(e =>
      e.ai_structured_insights?.mood_analysis?.primary_emotion?.toLowerCase().includes('anxious') ||
      e.ai_structured_insights?.mood_analysis?.primary_emotion?.toLowerCase().includes('stressed') ||
      e.ai_structured_insights?.mood_analysis?.primary_emotion?.toLowerCase().includes('sad')
    );

    // Find strongest and weakest periods
    const sortedByDate = [...entries].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const firstWeek = sortedByDate.slice(0, Math.ceil(sortedByDate.length / 4));
    const lastWeek = sortedByDate.slice(-Math.ceil(sortedByDate.length / 4));

    // Analyze themes
    const commonThemes = new Set<string>();
    entries.forEach(entry => {
      const content = entry.content?.toLowerCase() || '';
      if (content.includes('work') || content.includes('job') || content.includes('project')) {
        commonThemes.add('work');
      }
      if (content.includes('friend') || content.includes('social')) {
        commonThemes.add('social connections');
      }
      if (content.includes('exercise') || content.includes('workout')) {
        commonThemes.add('physical activity');
      }
      if (content.includes('thesis') || content.includes('study')) {
        commonThemes.add('academic progress');
      }
    });

    // Build narrative
    const userName = 'there'; // Could be personalized
    const periodName = timeRange === 7 ? 'this week' : timeRange === 30 ? 'this month' : 'this period';
    
    let narrative = `Hi ${userName}, looking back at ${periodName}, `;

    // Opening - overall sentiment
    if (positiveEntries.length > challengingEntries.length) {
      narrative += `you've shown remarkable resilience. `;
    } else if (challengingEntries.length > positiveEntries.length) {
      narrative += `you've been navigating some challenges. `;
    } else {
      narrative += `you've experienced a balanced emotional journey. `;
    }

    // Middle - specific insights
    if (firstWeek.length > 0 && lastWeek.length > 0) {
      const firstWeekTitle = firstWeek[0]?.title || 'early entries';
      const lastWeekTitle = lastWeek[lastWeek.length - 1]?.title || 'recent entries';
      
      narrative += `Your resilience was particularly strong in "${firstWeekTitle}". `;
      
      if (commonThemes.size > 0) {
        const themesArray = Array.from(commonThemes);
        narrative += `We noticed you were focusing on ${themesArray.join(', ')}. `;
      }
    }

    // Closing - positive reinforcement
    if (positiveEntries.length > 0) {
      const bestEntry = positiveEntries[positiveEntries.length - 1];
      const bestDate = new Date(bestEntry.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      narrative += `Your highest well-being was on ${bestDate} in "${bestEntry.title}". `;
    }

    narrative += `Great job recognizing what recharges you and staying committed to your growth.`;

    return narrative;
  };

  const narrative = generateNarrative();

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '2rem',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative gradient background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            padding: '0.75rem',
            background: 'rgba(139, 92, 246, 0.15)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PremiumIcons.FileText size={24} color="#8b5cf6" />
          </div>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#E5E7EB',
              letterSpacing: '-0.02em',
            }}>
              {getTitle()}
            </h2>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.875rem',
              color: '#9CA3AF',
            }}>
              Your personalized narrative from {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>

        {/* Narrative Content */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <p style={{
            margin: 0,
            fontSize: '1.05rem',
            lineHeight: '1.8',
            color: '#E5E7EB',
            fontWeight: '400',
            letterSpacing: '0.01em',
          }}>
            {narrative}
          </p>
        </div>

        {/* Narrative Highlights */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          background: 'rgba(0, 0, 0, 0.15)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <h4 style={{
            margin: '0 0 1rem 0',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Narrative Highlights
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            {(() => {
              // Find strongest resilience entry
              const strongestEntry = entries
                .filter(e => e.ai_structured_insights?.mood_analysis)
                .sort((a, b) => {
                  const aScore = a.ai_structured_insights?.mood_analysis?.intensity || 0;
                  const bScore = b.ai_structured_insights?.mood_analysis?.intensity || 0;
                  return bScore - aScore;
                })[0];
              
              // Detect key theme
              const themes = new Map<string, number>();
              entries.forEach(entry => {
                const content = entry.content?.toLowerCase() || '';
                if (content.includes('thesis') || content.includes('study') || content.includes('academic')) {
                  themes.set('Academic Progress', (themes.get('Academic Progress') || 0) + 1);
                }
                if (content.includes('work') || content.includes('project')) {
                  themes.set('Work & Projects', (themes.get('Work & Projects') || 0) + 1);
                }
                if (content.includes('friend') || content.includes('social')) {
                  themes.set('Social Connections', (themes.get('Social Connections') || 0) + 1);
                }
                if (content.includes('sleep') || content.includes('bedtime')) {
                  themes.set('Sleep & Rest', (themes.get('Sleep & Rest') || 0) + 1);
                }
              });
              
              const keyTheme = Array.from(themes.entries()).sort((a, b) => b[1] - a[1])[0];
              
              return (
                <>
                  {strongestEntry && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0',
                    }}>
                      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>✨</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', color: '#E5E7EB', lineHeight: '1.5' }}>
                          <strong>Strongest Resilience:</strong> {new Date(strongestEntry.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                          Entry: "{strongestEntry.title}"
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {keyTheme && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0',
                    }}>
                      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🎯</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', color: '#E5E7EB', lineHeight: '1.5' }}>
                          <strong>Key Theme this {timeRange <= 7 ? 'Week' : 'Month'}:</strong> {keyTheme[0]}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                          Appeared in {keyTheme[1]} {keyTheme[1] === 1 ? 'entry' : 'entries'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.625rem 0',
                  }}>
                    <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🌱</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', color: '#E5E7EB', lineHeight: '1.5' }}>
                        <strong>New Strategy Activated:</strong> Consistent Sleep Schedule
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                        Added from growth insights
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NarrativeSummary;
