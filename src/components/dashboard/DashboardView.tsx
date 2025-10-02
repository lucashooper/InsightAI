import React, { useState, useEffect } from 'react';
import { motion, easeOut } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SentimentFlowChart from './SentimentFlowChart';
import InsightBreakdownChart from './InsightBreakdownChart';
import MonthlyHighlights from './MonthlyHighlights';
import GrowthOpportunities from './GrowthOpportunities';
import { storageAdapter } from '../../services/storageAdapter';
import type { DiaryEntry } from '../../types/diary';

interface SentimentDataPoint {
  date: string;
  wellbeingScore: number;
  resilienceScore: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
}

interface PositiveInsight {
  insight: string;
  sentiment: "positive" | "opportunity";
  category: string;
  noteId: string;
  noteTitle: string;
  noteDate: string;
}

interface GrowthOpportunity {
  insight: string;
  sentiment: "positive" | "opportunity";
  category: string;
  noteId: string;
  noteTitle: string;
  noteDate: string;
}

interface DashboardViewProps {
  setActiveView: React.Dispatch<React.SetStateAction<'editor' | 'dashboard' | 'settings' | 'alerts'>>;
  setActiveNoteId: (id: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView, setActiveNoteId }) => {
  const [notes, setNotes] = useState<DiaryEntry[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const [positiveInsights, setPositiveInsights] = useState<PositiveInsight[]>([]);
  const [growthOpportunities, setGrowthOpportunities] = useState<GrowthOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(30);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut
      }
    }
  };

  // Load dashboard data
  const loadDashboardData = async (range: number = timeRange) => {
    setIsLoading(true);
    try {
      const notesData = await storageAdapter.getNotesForDashboard(range);
      setNotes(notesData);
      
      // Process data for charts
      const sentimentFlowData = storageAdapter.processSentimentFlowData(notesData);
      const categoryBreakdownData = storageAdapter.processCategoryData(notesData);
      const positiveInsightsData = storageAdapter.getPositiveInsights(notesData);
      const growthOpportunitiesData = storageAdapter.getGrowthOpportunities(notesData);
      
      setSentimentData(sentimentFlowData);
      setCategoryData(categoryBreakdownData);
      setPositiveInsights(positiveInsightsData);
      setGrowthOpportunities(growthOpportunitiesData);
      
      console.log('📊 Dashboard data loaded:', {
        timeRange: range,
        notesCount: notesData.length,
        sentimentData: sentimentFlowData.length,
        categories: categoryBreakdownData.length,
        positiveInsights: positiveInsightsData.length,
        growthOpportunities: growthOpportunitiesData.length
      });
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setNotes([]);
      setSentimentData([]);
      setCategoryData([]);
      setPositiveInsights([]);
      setGrowthOpportunities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (newRange: number) => {
    setTimeRange(newRange);
    loadDashboardData(newRange);
  };

  // Load data when component mounts
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Get time range label
  const getTimeRangeLabel = (range: number) => {
    switch (range) {
      case 7: return 'Last 7 Days';
      case 30: return 'Last 30 Days';
      case 90: return 'Last 90 Days';
      default: return `Last ${range} Days`;
    }
  };

  // Export dashboard as PDF
  const exportDashboardAsPDF = async () => {
    try {
      const dashboardElement = document.getElementById('dashboard-container');
      if (!dashboardElement) {
        console.error('Dashboard container not found');
        return;
      }

      // Show loading state
      const exportButton = document.getElementById('export-button');
      if (exportButton) {
        exportButton.textContent = '📄 Generating PDF...';
        exportButton.setAttribute('disabled', 'true');
      }

      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1F2937'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(56, 189, 248); // Blue color
      pdf.text('InsightAI Monthly Review', 20, 20);

      // Add date
      pdf.setFontSize(12);
      pdf.setTextColor(156, 163, 175); // Gray color
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);

      // Add the dashboard image
      pdf.addImage(imgData, 'PNG', 0, 40, pdfWidth, pdfHeight - 40);

      // Save the PDF
      const fileName = `InsightAI-Report-${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);

      console.log('✅ PDF exported successfully:', fileName);
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
    } finally {
      // Reset button state
      const exportButton = document.getElementById('export-button');
      if (exportButton) {
        exportButton.textContent = '📄 Export PDF';
        exportButton.removeAttribute('disabled');
      }
    }
  };

  return (
    <div id="dashboard-container" style={{ padding: '2rem', maxWidth: '100%' }}>
      {/* Dashboard Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#38BDF8', fontWeight: '600' }}>Monthly Review</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#9CA3AF', fontSize: '0.9rem' }}>
            Your emotional journey over the last {timeRange} days
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Date Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(Number(e.target.value))}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #374151',
              background: '#1F2937',
              color: '#E5E7EB',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          
          {/* Export PDF Button */}
          <button
            id="export-button"
            onClick={exportDashboardAsPDF}
            disabled={isLoading || notes.length === 0}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #374151',
              background: '#1F2937',
              color: '#E5E7EB',
              fontSize: '0.9rem',
              cursor: notes.length === 0 ? 'not-allowed' : 'pointer',
              opacity: notes.length === 0 ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (notes.length > 0) {
                e.currentTarget.style.background = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (notes.length > 0) {
                e.currentTarget.style.background = '#1F2937';
              }
            }}
          >
            📄 Export PDF
          </button>
          
          <button
            className="primary-button"
            onClick={() => loadDashboardData()}
            disabled={isLoading}
            style={{
              fontSize: '0.9rem',
              padding: '0.5rem 1rem'
            }}
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh Data'}
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Loading State */}
        {isLoading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#9CA3AF',
            background: '#1F2937',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h4 style={{ color: '#E5E7EB', marginBottom: '0.5rem' }}>Loading Monthly Review...</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Analyzing your insights and patterns...
            </p>
          </div>
        )}

        {/* Charts Section */}
        {!isLoading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            {/* Sentiment Flow Chart - Full Width */}
            <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
              <SentimentFlowChart data={sentimentData} timeRange={timeRange} />
            </motion.div>
            
            {/* Grid Layout for Other Components */}
            <motion.div 
              variants={itemVariants}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '2rem',
                alignItems: 'start'
              }}
            >
              {/* Left Column: Insight Categories + Growth Opportunities */}
              <motion.div 
                variants={itemVariants}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '2rem',
                  gridColumn: '1 / 2'
                }}
              >
                {/* Insight Breakdown Chart */}
                <InsightBreakdownChart data={categoryData} timeRange={timeRange} />
                
                {/* Growth Opportunities */}
                <GrowthOpportunities 
                  insights={growthOpportunities} 
                  timeRange={timeRange}
                  setActiveView={setActiveView as React.Dispatch<React.SetStateAction<'editor' | 'dashboard' | 'settings'>>}
                  setActiveNoteId={setActiveNoteId}
                />
              </motion.div>
              
              {/* Right Column: Monthly Highlights - Spans 2 columns */}
              <motion.div variants={itemVariants} style={{ gridColumn: '2 / 4' }}>
                <MonthlyHighlights 
                  insights={positiveInsights} 
                  timeRange={timeRange}
                  setActiveView={setActiveView as React.Dispatch<React.SetStateAction<'editor' | 'dashboard' | 'settings'>>}
                  setActiveNoteId={setActiveNoteId}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Summary Stats */}
        {!isLoading && notes.length > 0 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            style={{
              background: '#1F2937',
              borderRadius: '12px',
              border: '1px solid #374151',
              padding: '1.5rem'
            }}
          >
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#E5E7EB', 
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              📈 {getTimeRangeLabel(timeRange)} Summary
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <div style={{
                padding: '1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#22c55e' }}>
                  {notes.length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                  Entries {getTimeRangeLabel(timeRange)}
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#22c55e' }}>
                  {positiveInsights.length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                  Positive Insights
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f59e0b' }}>
                  {growthOpportunities.length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                  Growth Opportunities
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍩</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#3b82f6' }}>
                  {categoryData.length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                  Insight Categories
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#8b5cf6' }}>
                  {sentimentData.length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                  Days with Insights
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                background: 'rgba(56, 189, 248, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💙</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#38bdf8' }}>
                  {sentimentData.length > 0 ? 
                    (sentimentData.reduce((sum, day) => sum + day.wellbeingScore, 0) / sentimentData.length).toFixed(1) : 
                    '0.0'
                  }
                </div>
                <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                  Avg Well-being
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💪</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f59e0b' }}>
                  {sentimentData.length > 0 ? 
                    (sentimentData.reduce((sum, day) => sum + day.resilienceScore, 0) / sentimentData.length).toFixed(1) : 
                    '0.0'
                  }
                </div>
                <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                  Avg Resilience
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardView; 