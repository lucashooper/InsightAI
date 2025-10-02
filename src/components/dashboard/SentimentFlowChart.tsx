import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SentimentDataPoint {
  date: string;
  wellbeingScore: number;
  resilienceScore: number;
}

interface SentimentFlowChartProps {
  data: SentimentDataPoint[];
  timeRange?: number;
}

const SentimentFlowChart: React.FC<SentimentFlowChartProps> = ({ data, timeRange = 30 }) => {
  // Get time range label
  const getTimeRangeLabel = (range: number) => {
    switch (range) {
      case 7: return 'Last 7 Days';
      case 30: return 'Last 30 Days';
      case 90: return 'Last 90 Days';
      default: return `Last ${range} Days`;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1F2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '12px',
          color: '#E5E7EB'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              color: entry.color,
              fontSize: '14px'
            }}>
              {entry.name}: {entry.value}/10
            </p>
          ))}
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
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
        📈 Emotional Journey ({getTimeRangeLabel(timeRange)})
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            domain={[0, 10]}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#E5E7EB' }}
            formatter={(value) => (
              <span style={{ color: '#E5E7EB' }}>
                {value === 'wellbeingScore' ? '💙 Well-being' : '💪 Resilience'}
              </span>
            )}
          />
          <Bar 
            dataKey="resilienceScore" 
            fill="#f59e0b"
            name="resilienceScore"
            radius={[4, 4, 0, 0]}
          />
          <Line 
            type="monotone"
            dataKey="wellbeingScore" 
            stroke="#38bdf8"
            strokeWidth={3}
            dot={{ fill: '#38bdf8', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#38bdf8', strokeWidth: 2 }}
            name="wellbeingScore"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div style={{ 
        marginTop: '1rem', 
        fontSize: '0.875rem', 
        color: '#9CA3AF',
        textAlign: 'center'
      }}>
        <span style={{ color: '#38bdf8' }}>💙 Well-being</span> (line) shows your emotional state • <span style={{ color: '#f59e0b' }}>💪 Resilience</span> (bars) shows your active effort
      </div>
    </div>
  );
};

export default SentimentFlowChart; 