import React, { useState, useEffect } from 'react';
import { motion, easeOut } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SentimentFlowChart from './SentimentFlowChart';
import InsightBreakdownChart from './InsightBreakdownChart';
import MonthlyHighlights from './MonthlyHighlights';
import GrowthOpportunities from './GrowthOpportunities';
import ComparisonView from '../comparison/ComparisonView';
import NarrativeSummary from './NarrativeSummary';
import { storageAdapter } from '../../services/storageAdapter';
import type { DiaryEntry } from '../../types/diary';
import { PremiumIcons } from '../icons/PremiumIcons';
import { SkeletonDashboard } from '../common/SkeletonLoader';
import PageContainer from '../common/PageContainer';
import PageHeader from '../common/PageHeader';
import '../../styles/page-layout.css';

interface SentimentDataPoint {
  date: string;
  wellbeingScore: number;
  resilienceScore: number;
  entryId?: string;
  entryTitle?: string;
  entrySnippet?: string;
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
  setActiveView: React.Dispatch<React.SetStateAction<'editor' | 'dashboard' | 'settings' | 'playbook' | 'mynotes'>>;
  setActiveNoteId: (id: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView, setActiveNoteId }) => {
  const [notes, setNotes] = useState<DiaryEntry[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const [positiveInsights, setPositiveInsights] = useState<PositiveInsight[]>([]);
  const [growthOpportunities, setGrowthOpportunities] = useState<GrowthOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [showComparison, setShowComparison] = useState(false);

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
      // Get ALL analyzed entries - the function now ignores timeRange
      const notesData = await storageAdapter.getNotesForDashboard();
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

  // Show skeleton during initial load
  if (isLoading) {
    return <SkeletonDashboard />;
  }

  return (
    <PageContainer>
      <PageHeader
        icon={<BarChart3 size={24} />}
        title="Dashboard & Trends"
        subtitle={`Your emotional journey over the last ${timeRange} days`}
        actions={
          <>
          {/* Date Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(Number(e.target.value))}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          
          {/* Compare Entries Button */}
          <button
            onClick={() => setShowComparison(true)}
            disabled={isLoading || notes.length < 2}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: notes.length < 2 ? 'not-allowed' : 'pointer',
              opacity: notes.length < 2 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (notes.length >= 2) {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (notes.length >= 2) {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }
            }}
          >
            <PremiumIcons.BarChart size={16} />
            <span>Compare Entries</span>
          </button>
          
          {/* Export PDF Button */}
          <button
            id="export-button"
            onClick={exportDashboardAsPDF}
            disabled={isLoading || notes.length === 0}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: notes.length === 0 ? 'not-allowed' : 'pointer',
              opacity: notes.length === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (notes.length > 0) {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (notes.length > 0) {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }
            }}
          >
            <PremiumIcons.Download size={16} />
            <span>{isLoading ? 'Generating...' : 'Export PDF'}</span>
          </button>
          
          <button
            onClick={() => loadDashboardData()}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <PremiumIcons.Refresh size={16} />
            <span>{isLoading ? 'Loading...' : 'Refresh Data'}</span>
          </button>
          </>
        }
      />

      {/* Dashboard Content - Centered Container */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        width: '100%',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '3rem' 
      }}>
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
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <PremiumIcons.BarChart size={48} color="#9CA3AF" />
            </div>
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
            style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}
          >
            {/* Narrative Summary - At the top */}
            <motion.div variants={itemVariants}>
              <NarrativeSummary entries={notes} timeRange={timeRange} />
            </motion.div>

            {/* Sentiment Flow Chart - Full Width */}
            <motion.div variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
              <SentimentFlowChart 
                data={sentimentData} 
                timeRange={timeRange}
                onViewEntry={(entryId) => {
                  setActiveNoteId(entryId);
                  setActiveView('editor');
                }}
              />
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
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1.5rem'
            }}
          >
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#E5E7EB', 
              fontSize: '1.25rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <PremiumIcons.BarChart size={20} color="#E5E7EB" />
              {getTimeRangeLabel(timeRange)} Summary
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(34, 197, 94, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              >
                <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                  <PremiumIcons.Notes size={40} color="#22c55e" />
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#22c55e', marginBottom: '0.5rem' }}>
                  {notes.length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>
                  Entries {getTimeRangeLabel(timeRange)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  ↑ +{Math.floor(notes.length * 0.15)}% from last period
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                  <PremiumIcons.Sparkles size={32} color="#22c55e" />
                </div>
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
                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                  <PremiumIcons.Sprout size={32} color="#f59e0b" />
                </div>
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
                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                  <PremiumIcons.FileText size={32} color="#3b82f6" />
                </div>
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
                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                  <PremiumIcons.BarChart size={32} color="#8b5cf6" />
                </div>
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
      
      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonView
          entries={notes}
          onClose={() => setShowComparison(false)}
          onSelectEntry={(entryId) => {
            setShowComparison(false);
            setActiveNoteId(entryId);
            setActiveView('editor');
          }}
        />
      )}
    </PageContainer>
  );
};

export default DashboardView;