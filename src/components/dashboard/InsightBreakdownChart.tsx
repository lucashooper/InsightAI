import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PremiumIcons } from '../icons/PremiumIcons';

interface CategoryDataPoint {
  name: string;
  value: number;
}

interface InsightBreakdownChartProps {
  data: CategoryDataPoint[];
  timeRange?: number;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const InsightBreakdownChart: React.FC<InsightBreakdownChartProps> = ({ data, timeRange = 30 }) => {
  // Get time range label
  const getTimeRangeLabel = (range: number) => {
    switch (range) {
      case 7: return 'last 7 days';
      case 30: return 'last 30 days';
      case 90: return 'last 90 days';
      default: return `last ${range} days`;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{
          backgroundColor: '#1F2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '12px',
          color: '#E5E7EB'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{data.name}</p>
          <p style={{ margin: '4px 0', color: data.color, fontSize: '14px' }}>
            {data.value} insights ({((data.value / data.payload.total) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '12px', 
        justifyContent: 'center',
        marginTop: '1rem'
      }}>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            fontSize: '12px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: entry.color,
              borderRadius: '2px'
            }} />
            <span style={{ color: '#E5E7EB' }}>
              {entry.value} ({((entry.payload.value / entry.payload.total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
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
          <PremiumIcons.FileText size={48} color="#9CA3AF" />
        </div>
        <h4 style={{ color: '#E5E7EB', marginBottom: '0.5rem' }}>No Insights Yet</h4>
        <p style={{ margin: '0', fontSize: '0.9rem' }}>
          Your insight categories will appear here once you have some analysis.
        </p>
      </div>
    );
  }

  // Calculate total for percentage calculations
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

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
        fontWeight: '600',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <PremiumIcons.FileText size={20} color="#E5E7EB" />
        Insight Categories
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {dataWithTotal.map((_, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      <CustomLegend payload={dataWithTotal.map((entry, index) => ({
        value: entry.name,
        color: COLORS[index % COLORS.length],
        payload: entry
      }))} />
      
      <div style={{ 
        marginTop: '1rem', 
        fontSize: '0.875rem', 
        color: '#9CA3AF',
        textAlign: 'center'
      }}>
        Breakdown of your insights by category over the {getTimeRangeLabel(timeRange)}
      </div>
    </div>
  );
};

export default InsightBreakdownChart; 