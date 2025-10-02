import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MoodDataPoint {
  date: string;
  intensity: number;
  noteTitle?: string;
}

interface MoodChartProps {
  data: MoodDataPoint[];
}

const MoodChart: React.FC<MoodChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1F2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          <p style={{ color: '#E5E7EB', margin: '0 0 4px 0', fontWeight: '600' }}>
            {label}
          </p>
          <p style={{ color: '#38BDF8', margin: '0', fontSize: '0.9rem' }}>
            Mood Intensity: <span style={{ color: '#E5E7EB' }}>{payload[0].value}/10</span>
          </p>
          {payload[0].payload.noteTitle && (
            <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.8rem' }}>
              Note: {payload[0].payload.noteTitle}
            </p>
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        <h4 style={{ color: '#E5E7EB', marginBottom: '0.5rem' }}>No Mood Data Yet</h4>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          Start writing diary entries and running Prism's analysis to see your mood trends over time.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#1F2937',
      borderRadius: '12px',
      border: '1px solid #374151',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
          📈 Mood Intensity Over Time
        </h3>
        <p style={{ 
          margin: 0, 
          color: '#9CA3AF', 
          fontSize: '0.9rem' 
        }}>
          Track your emotional journey through the last 30 days
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#374151" 
            opacity={0.3}
          />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF" 
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis 
            domain={[0, 10]} 
            stroke="#9CA3AF" 
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="intensity" 
            stroke="#38BDF8" 
            strokeWidth={3}
            dot={{ 
              r: 4, 
              fill: '#38BDF8',
              stroke: '#1F2937',
              strokeWidth: 2
            }} 
            activeDot={{ 
              r: 8, 
              fill: '#38BDF8',
              stroke: '#FFFFFF',
              strokeWidth: 2
            }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(56, 189, 248, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(56, 189, 248, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Average Intensity: </span>
            <span style={{ color: '#38BDF8', fontWeight: '600' }}>
              {(data.reduce((sum, point) => sum + point.intensity, 0) / data.length).toFixed(1)}/10
            </span>
          </div>
          <div>
            <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Data Points: </span>
            <span style={{ color: '#E5E7EB', fontWeight: '600' }}>{data.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodChart; 