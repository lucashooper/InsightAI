import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PremiumIcons } from '../icons/PremiumIcons';

interface SentimentDataPoint {
  date: string;
  wellbeingScore: number;
  resilienceScore: number;
  entryId?: string;
  entryTitle?: string;
  entrySnippet?: string;
}

interface SentimentFlowChartProps {
  data: SentimentDataPoint[];
  timeRange?: number;
  onViewEntry?: (entryId: string) => void;
}

const SentimentFlowChart: React.FC<SentimentFlowChartProps> = ({ data, timeRange = 30, onViewEntry }) => {
  // Get time range label
  const getTimeRangeLabel = (range: number) => {
    switch (range) {
      case 7: return 'Last 7 Days';
      case 30: return 'Last 30 Days';
      case 90: return 'Last 90 Days';
      default: return `Last ${range} Days`;
    }
  };

  // Find highest and lowest points
  const wellbeingScores = data.map(d => d.wellbeingScore);
  const resilienceScores = data.map(d => d.resilienceScore);
  const maxWellbeing = Math.max(...wellbeingScores);
  const maxResilience = Math.max(...resilienceScores);
  const bestWellbeingDay = data.find(d => d.wellbeingScore === maxWellbeing);
  const bestResilienceDay = data.find(d => d.resilienceScore === maxResilience);
  
  // Calculate averages
  const avgWellbeing = data.length > 0 
    ? (data.reduce((sum, d) => sum + d.wellbeingScore, 0) / data.length).toFixed(1)
    : '0.0';
  const avgResilience = data.length > 0
    ? (data.reduce((sum, d) => sum + d.resilienceScore, 0) / data.length).toFixed(1)
    : '0.0';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = data.find(d => d.date === label);
      return (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          color: '#E5E7EB',
          minWidth: '220px',
          maxWidth: '320px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '0.875rem' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              color: entry.color,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {entry.name === 'wellbeingScore' ? 'Well-being' : 'Resilience'}: {entry.value}/10
            </p>
          ))}
          {dataPoint?.entryTitle && (
            <div style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#E5E7EB',
                marginBottom: '4px'
              }}>
                Entry: "{dataPoint.entryTitle}"
              </div>
              {dataPoint.entrySnippet && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9CA3AF',
                  lineHeight: '1.4',
                  marginBottom: '6px'
                }}>
                  {dataPoint.entrySnippet}
                </div>
              )}
              <div style={{
                fontSize: '0.7rem',
                color: '#3b82f6',
                cursor: 'pointer',
                marginTop: '4px'
              }}
              onClick={() => dataPoint.entryId && onViewEntry?.(dataPoint.entryId)}
              >
                View full entry →
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: '#9CA3AF',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
          <PremiumIcons.BarChart size={48} color="#9CA3AF" />
        </div>
        <h4 style={{ color: '#E5E7EB', marginBottom: '0.5rem' }}>No Data Yet</h4>
        <p style={{ margin: '0', fontSize: '0.9rem' }}>
          Start writing entries to see your emotional journey over time.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
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
          color: '#E5E7EB',
          fontSize: '1.5rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.75rem' }}>📊</span>
          Emotional Health Over Time
        </h2>
        <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
          {getTimeRangeLabel(timeRange)}
        </span>
      </div>
      
      {/* Combined Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Well-being line */}
          <Line 
            type="monotone"
            dataKey="wellbeingScore"
            name="Well-being"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ fill: '#06b6d4', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: '#06b6d4', strokeWidth: 3 }}
          />
          
          {/* Resilience line */}
          <Line 
            type="monotone"
            dataKey="resilienceScore"
            name="Resilience"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ fill: '#f97316', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: '#f97316', strokeWidth: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary stats below chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#06b6d4', marginBottom: '0.5rem', fontWeight: '500' }}>
            Well-being
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#E5E7EB', marginBottom: '0.25rem' }}>
            {avgWellbeing} avg
          </div>
          {bestWellbeingDay && (
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ color: '#22c55e' }}>↑</span> Best day: {bestWellbeingDay.date} ({bestWellbeingDay.wellbeingScore}/10)
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#f97316', marginBottom: '0.5rem', fontWeight: '500' }}>
            Resilience
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#E5E7EB', marginBottom: '0.25rem' }}>
            {avgResilience} avg
          </div>
          {bestResilienceDay && (
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ color: '#22c55e' }}>↑</span> Highest: {bestResilienceDay.date} ({bestResilienceDay.resilienceScore}/10)
            </div>
          )}
        </div>
      </div>

      {/* Hint */}
      <div style={{ 
        fontSize: '0.8rem', 
        color: '#9CA3AF',
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: '1rem'
      }}>
        💡 Hover over data points to see details • Click to view entry from that day
      </div>
    </div>
  );
};

export default SentimentFlowChart;