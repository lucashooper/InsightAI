import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
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
        background: '#1F2937',
        borderRadius: '12px',
        border: '1px solid #374151'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Well-being Chart */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.5rem'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{ 
            margin: 0, 
            color: '#E5E7EB',
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <PremiumIcons.TrendingUp size={18} color="#38bdf8" />
            Well-being Over Time
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
            {getTimeRangeLabel(timeRange)}
          </span>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={11}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone"
              dataKey="wellbeingScore" 
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ fill: '#38bdf8', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 7, stroke: '#38bdf8', strokeWidth: 3, fill: '#1e40af' }}
            />
            {/* Best day annotation */}
            {bestWellbeingDay && (
              <ReferenceDot
                x={bestWellbeingDay.date}
                y={bestWellbeingDay.wellbeingScore}
                r={8}
                fill="#22c55e"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        
        {bestWellbeingDay && (
          <div style={{ 
            marginTop: '0.75rem', 
            fontSize: '0.75rem', 
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <PremiumIcons.Sparkles size={14} color="#22c55e" />
            <span>Best day: {bestWellbeingDay.date} ({bestWellbeingDay.wellbeingScore}/10)</span>
          </div>
        )}
      </div>

      {/* Resilience Chart */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.5rem'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{ 
            margin: 0, 
            color: '#E5E7EB',
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <PremiumIcons.Target size={18} color="#f59e0b" />
            Resilience & Active Effort
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
            {getTimeRangeLabel(timeRange)}
          </span>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={11}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone"
              dataKey="resilienceScore" 
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 7, stroke: '#f59e0b', strokeWidth: 3, fill: '#b45309' }}
            />
            {/* Best resilience day annotation */}
            {bestResilienceDay && (
              <ReferenceDot
                x={bestResilienceDay.date}
                y={bestResilienceDay.resilienceScore}
                r={8}
                fill="#22c55e"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        
        {bestResilienceDay && (
          <div style={{ 
            marginTop: '0.75rem', 
            fontSize: '0.75rem', 
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <PremiumIcons.Target size={14} color="#22c55e" />
            <span>Highest effort: {bestResilienceDay.date} ({bestResilienceDay.resilienceScore}/10)</span>
          </div>
        )}
      </div>
      
      <div style={{ 
        fontSize: '0.8rem', 
        color: '#9CA3AF',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        💡 Hover over data points to see details • Click to view entry from that day
      </div>
    </div>
  );
};

export default SentimentFlowChart; 