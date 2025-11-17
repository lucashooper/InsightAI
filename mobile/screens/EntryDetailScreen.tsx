import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { mobileAiService } from '../services/mobileAiService';

export default function EntryDetailScreen({ route, navigation }: any) {
  const { entry } = route.params;
  const [activeTab, setActiveTab] = useState<'editor' | 'insights'>('editor');
  const [analyzing, setAnalyzing] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAnalyzeEntry = async () => {
    if (!entry?.content || analyzing) return;

    try {
      setAnalyzing(true);
      console.log('[Mobile Insights] analyzeEntry start', { entryId: entry.id });

      const analysis = await mobileAiService.analyzeEntry(entry.content);
      console.log('[Mobile Insights] analysis result', analysis);

      const { error } = await supabase
        .from('notes')
        .update({
          ai_insights: analysis,
          ai_structured_insights: analysis,
          ai_last_analyzed: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', entry.id);

      if (error) {
        console.error('[Mobile Insights Error] saving analysis', error);
        Alert.alert('Analysis failed', 'Unable to save AI insights. Please try again later.');
        return;
      }

      // Optimistically update local entry
      entry.ai_structured_insights = analysis;
      entry.ai_last_analyzed = new Date().toISOString();

      setActiveTab('insights');
    } catch (err) {
      console.error('[Mobile Insights Error] analyzeEntry', err);
      Alert.alert('Analysis failed', 'Something went wrong while analyzing this entry.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="arrow-back" size={20} color="#8b5cf6" />
            <Text style={styles.backText}>Back</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'editor' && styles.activeTab]}
          onPress={() => setActiveTab('editor')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="document-text" size={16} color={activeTab === 'editor' ? '#8b5cf6' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'editor' && styles.activeTabText]}>
              Note
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="bulb" size={16} color={activeTab === 'insights' ? '#8b5cf6' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
              Insights
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'editor' ? (
          <View style={styles.entryContainer}>
            <Text style={styles.title}>{entry.title || 'Untitled Entry'}</Text>
            <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
            
            {entry.mood_score && (
              <View style={styles.moodContainer}>
                <Text style={styles.moodLabel}>Mood:</Text>
                <Text style={styles.moodValue}>{entry.mood_score}/10</Text>
              </View>
            )}

            {/* Analyze entry CTA */}
            <TouchableOpacity
              style={styles.viewInsightsButton}
              onPress={handleAnalyzeEntry}
              disabled={analyzing}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="sparkles" size={18} color="#8b5cf6" />
                <Text style={styles.viewInsightsText}>
                  {analyzing ? 'Analyzing entry…' : 'Analyze entry'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <Text style={styles.content}>{entry.content}</Text>

            {entry.ai_insights && (
              <TouchableOpacity
                style={styles.viewInsightsButton}
                onPress={() => setActiveTab('insights')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="bulb" size={18} color="#8b5cf6" />
                  <Text style={styles.viewInsightsText}>View Insights</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.entryContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Ionicons name="bulb" size={24} color="#8b5cf6" />
              <Text style={styles.insightsTitle}>AI Insights</Text>
            </View>
            <Text style={styles.date}>Analysis from {formatDate(entry.ai_last_analyzed || entry.created_at)}</Text>
            
            <View style={styles.divider} />

            {entry.ai_structured_insights ? (
              <View>
                {console.log('[Mobile Insights] structured_insights', entry.ai_structured_insights)}
                {/* Confidence Score */}
                {typeof entry.ai_structured_insights.confidence === 'number' && (
                  <View style={styles.insightSection}>
                    <Text style={styles.insightLabel}>Confidence</Text>
                    <Text style={styles.insightValue}>{entry.ai_structured_insights.confidence}%</Text>
                  </View>
                )}

                {/* Key Themes */}
                {Array.isArray(entry.ai_structured_insights.key_themes) && entry.ai_structured_insights.key_themes.length > 0 && (
                  <View style={styles.insightSection}>
                    <Text style={styles.insightLabel}>Key Themes</Text>
                    {entry.ai_structured_insights.key_themes.map((theme: any, index: number) => (
                      <View key={index} style={styles.themeCard}>
                        <Text style={styles.themeTitle}>{String(theme.theme || '')}</Text>
                        <Text style={styles.themeCategory}>{String(theme.category || '')}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Mood Analysis */}
                {entry.ai_structured_insights.mood_analysis && typeof entry.ai_structured_insights.mood_analysis === 'object' && (
                  <View style={styles.insightSection}>
                    <Text style={styles.insightLabel}>Mood Analysis</Text>
                    <View style={styles.moodAnalysisCard}>
                      <Text style={styles.moodEmotion}>
                        Primary: {String(entry.ai_structured_insights.mood_analysis.primary_emotion || 'N/A')}
                      </Text>
                      <Text style={styles.moodIntensity}>
                        Intensity: {String(entry.ai_structured_insights.mood_analysis.intensity || 'N/A')}/10
                      </Text>
                    </View>
                  </View>
                )}

                {/* Insights Report - Key Takeaways */}
                {entry.ai_structured_insights.insights_report?.keyTakeaways &&
                  Array.isArray(entry.ai_structured_insights.insights_report.keyTakeaways) &&
                  entry.ai_structured_insights.insights_report.keyTakeaways.length > 0 && (
                    <View style={styles.insightSection}>
                      <Text style={styles.insightLabel}>Key Insights</Text>
                      {entry.ai_structured_insights.insights_report.keyTakeaways.map((takeaway: any, index: number) => (
                        <View key={index} style={styles.themeCard}>
                          <Text style={styles.themeTitle}>{String(takeaway.insight || '')}</Text>
                          <Text style={styles.themeCategory}>
                            {takeaway.sentiment === 'positive' ? "What's working" : 'Pattern to address'} •{' '}
                            {String(takeaway.category || '')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
              </View>
            ) : entry.ai_insights ? (
              <Text style={styles.insightsText}>{String(entry.ai_insights)}</Text>
            ) : (
              <Text style={styles.noInsightsText}>
                No AI insights yet. Tap "Analyze entry" on the Note tab to generate insights.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#8b5cf6',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#8b5cf6',
  },
  entryContainer: {
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodLabel: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  moodValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginVertical: 20,
  },
  content: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
  },
  viewInsightsButton: {
    marginTop: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
  },
  viewInsightsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  insightsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  insightsText: {
    fontSize: 15,
    color: '#d0d0d0',
    lineHeight: 24,
  },
  noInsightsText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  insightSection: {
    marginBottom: 24,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  themeCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  themeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  themeCategory: {
    fontSize: 13,
    color: '#8b5cf6',
  },
  moodAnalysisCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  moodEmotion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  moodIntensity: {
    fontSize: 14,
    color: '#d0d0d0',
  },
});
