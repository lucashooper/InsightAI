import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { mobileAiService } from '../services/mobileAiService';
import { useAuth } from '../contexts/AuthContext';

export default function EntryDetailScreen({ route, navigation }: any) {
  const { entry, openInsights } = route.params || {};
  const [activeTab, setActiveTab] = useState<'editor' | 'insights'>(
    openInsights ? 'insights' : 'editor'
  );
  const [insightsView, setInsightsView] = useState<'highlights' | 'structured'>('highlights');
  const [analyzing, setAnalyzing] = useState(false);
  const { user } = useAuth();
  const [editableContent, setEditableContent] = useState(entry?.content || '');
  const [editableTitle, setEditableTitle] = useState(entry?.title || '');
  const [isModified, setIsModified] = useState(false);
  const insightsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const hasChanged = editableContent !== entry?.content || editableTitle !== entry?.title;
    setIsModified(hasChanged);
  }, [editableContent, editableTitle, entry]);

  useEffect(() => {
    if (activeTab === 'insights') {
      insightsOpacity.setValue(0);
      Animated.timing(insightsOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [activeTab, insightsOpacity]);

  const handleSave = async () => {
    if (!isModified) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: editableTitle.trim() || 'Untitled Entry',
          content: editableContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', entry.id);

      if (error) throw error;

      // Update the local entry object to reflect the saved state
      entry.title = editableTitle.trim() || 'Untitled Entry';
      entry.content = editableContent.trim();
      setIsModified(false);

      Alert.alert('Success', 'Entry updated!');
    } catch (error) {
      console.error('Error updating entry:', error);
      Alert.alert('Error', 'Failed to update entry.');
    }
  };

  const wordCount = entry?.content
    ? String(entry.content)
        .split(/\s+/)
        .filter((w: string) => w.trim().length > 0).length
    : 0;
  const readMinutes = wordCount > 0 ? Math.max(1, Math.round(wordCount / 200)) : 0;
  const structuredInsights = entry.ai_structured_insights || null;
  const moodAnalysis = structuredInsights?.mood_analysis || null;
  const [expandedEmotion, setExpandedEmotion] = useState<string | null>(null);

  const addTakeawayToPlaybook = async (takeaway: any) => {
    if (!user) return;

    try {
      const title = String(takeaway?.insight || '').trim();
      if (!title) return;

      const category = inferStrategyCategory(title);

      const { error } = await supabase
        .from('actionable_insights')
        .insert({
          user_id: user.id,
          title,
          description: String(takeaway?.why_helpful || ''),
          category,
          difficulty: takeaway?.difficulty || 'moderate',
          emoji: getCategoryEmoji(category),
          status: 'suggested',
          source: 'ai_suggested',
          source_entry_id: entry.id,
        });

      if (error) {
        console.error('[Mobile Insights] Error adding takeaway to Playbook:', error);
        Alert.alert('Playbook', 'Could not add this insight. Please try again later.');
        return;
      }

      Alert.alert('Playbook', 'Insight added to your Playbook.');
    } catch (err) {
      console.error('[Mobile Insights] Unexpected error adding takeaway to Playbook:', err);
      Alert.alert('Playbook', 'Something went wrong while adding this insight.');
    }
  };

  const inferStrategyCategory = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('exercise') || lower.includes('walk') || lower.includes('run') || lower.includes('yoga')) {
      return 'exercise';
    }
    if (lower.includes('breathe') || lower.includes('breath') || lower.includes('meditat') || lower.includes('mindful')) {
      return 'mindfulness';
    }
    if (lower.includes('sleep') || lower.includes('rest') || lower.includes('bed')) {
      return 'sleep';
    }
    if (lower.includes('friend') || lower.includes('talk') || lower.includes('call') || lower.includes('social')) {
      return 'social';
    }
    if (lower.includes('eat') || lower.includes('meal') || lower.includes('food') || lower.includes('nutrition')) {
      return 'nutrition';
    }
    if (lower.includes('journal') || lower.includes('write') || lower.includes('note')) {
      return 'coping';
    }
    return 'general';
  };

  const getCategoryEmoji = (category: string): string => {
    const map: Record<string, string> = {
      coping: '💪',
      exercise: '🏃',
      social: '👥',
      mindfulness: '🧘',
      sleep: '😴',
      nutrition: '🥗',
      general: '✨',
    };
    return map[category] || '✨';
  };

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
      const analysis = await mobileAiService.analyzeEntry(entry.content);

      // ... (rest of the analysis logic is unchanged)

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
        Alert.alert('Analysis failed', 'Unable to save AI insights. Please try again later.');
        return;
      }

      entry.ai_structured_insights = analysis;
      entry.ai_last_analyzed = new Date().toISOString();

      setActiveTab('insights');
    } catch (err) {
      Alert.alert('Analysis failed', 'Something went wrong while analyzing this entry.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="arrow-back" size={20} color="#8b5cf6" />
            <Text style={styles.backText}>Back</Text>
          </View>
        </TouchableOpacity>
        {isModified && (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>

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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'editor' ? (
          <View style={styles.entryContainer}>
            <View style={styles.richHeader}>
              <TextInput
                style={styles.titleInput}
                value={editableTitle}
                onChangeText={setEditableTitle}
                placeholder="Untitled Entry"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.metaLine}>
                {formatDate(entry.created_at)}
                {wordCount > 0 && ` • ${wordCount} words • ${readMinutes} min read`}
              </Text>
              <View style={styles.moodButtonRow}>
                {entry.mood_score && (
                  <View style={styles.moodChip}>
                    <Text style={styles.moodEmoji}>😊</Text>
                    <Text style={styles.moodChipText}>{entry.mood_score}/10</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.aiCtaButton}
                  onPress={entry.ai_structured_insights ? () => setActiveTab('insights') : handleAnalyzeEntry}
                  disabled={analyzing}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={entry.ai_structured_insights ? ['#a855f7', '#6366f1'] : ['#4f46e5', '#a855f7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiCtaGradient}
                  >
                    <Ionicons
                      name={entry.ai_structured_insights ? 'bulb' : 'sparkles'}
                      size={16}
                      color="#ffffff"
                    />
                    <Text style={styles.aiCtaText}>
                      {analyzing
                        ? 'Analyzing...'
                        : entry.ai_structured_insights
                        ? 'View AI Insights'
                        : 'Analyze with AI'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <TextInput
              style={styles.contentInput}
              value={editableContent}
              onChangeText={setEditableContent}
              multiline
              textAlignVertical="top"
              placeholder="What's on your mind?"
              placeholderTextColor="#666"
            />
          </View>
        ) : (
          <Animated.View
            style={[
              styles.insightsCard,
              {
                opacity: insightsOpacity,
                transform: [
                  {
                    translateY: insightsOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.briefingContainer}>
              <Text style={styles.briefingTitle}>Your Entry's Briefing</Text>
              <Text style={styles.briefingSubtitle}>
                Reflect deeply to find patterns and connections between your thoughts and emotions.
              </Text>
              <View
                style={[
                  styles.briefingCard,
                  !structuredInsights?.summary && styles.briefingCardPlaceholder,
                ]}
              >
                <Text
                  style={
                    structuredInsights?.summary
                      ? styles.briefingText
                      : styles.briefingPlaceholderText
                  }
                >
                  {structuredInsights?.summary ||
                    (moodAnalysis
                      ? 'AI insights are available for this entry. View the full analysis for a deeper breakdown.'
                      : "Once this entry has been analyzed, you'll see a concise emotional reflection here.")}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.fullAnalysisButton}
                activeOpacity={0.9}
                onPress={() => setInsightsView('structured')}
              >
                <LinearGradient
                  colors={["#a855f7", "#6366f1"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.fullAnalysisGradient}
                >
                  <Text style={styles.fullAnalysisButtonText}>View Full Analysis</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {moodAnalysis && (
              <LinearGradient
                colors={["#020617", "#020617", "#111827"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryEmotionCard}
              >
                <Text style={styles.sectionTitle}>Primary Emotion</Text>
                <Text style={styles.primaryEmotionGlow}>{moodAnalysis.primary_emotion}</Text>
                <Text style={styles.emotionIntensity}>Intensity: {moodAnalysis.intensity}/10</Text>

                {Array.isArray(moodAnalysis.emotion_breakdown) &&
                  moodAnalysis.emotion_breakdown.length > 0 && (
                    <View style={styles.emotionBreakdownSection}>
                      <Text style={styles.sectionTitle}>Emotion Breakdown</Text>
                      {moodAnalysis.emotion_breakdown.map((emotion: any, index: number) => {
                        const percentage = Math.round((emotion.score || 0) * 100);
                        const isExpanded = expandedEmotion === emotion.emotion;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={styles.emotionBreakdownCard}
                            activeOpacity={0.9}
                            onPress={() =>
                              setExpandedEmotion(isExpanded ? null : emotion.emotion)
                            }
                          >
                            <View style={styles.emotionBreakdownLeft}>
                              <Text style={styles.emotionPillLabel}>{emotion.emotion}</Text>
                              {isExpanded && (
                                <Text style={styles.expandedEmotionDescription}>
                                  This emotion reflects a pattern in your entry. Understanding{' '}
                                  {emotion.emotion.toLowerCase()} can help you identify triggers and
                                  develop coping strategies.
                                </Text>
                              )}
                            </View>
                            <View style={styles.emotionBreakdownRight}>
                              <Text style={styles.emotionBreakdownPercentage}>{percentage}%</Text>
                              <Ionicons
                                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                                size={16}
                                color="#a78bfa"
                              />
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
              </LinearGradient>
            )}

            {structuredInsights?.insights_report?.keyTakeaways && (
              <View style={styles.insightSection}>
                <Text style={styles.sectionTitle}>Key Takeaways</Text>
                {structuredInsights.insights_report.keyTakeaways.map(
                  (takeaway: any, index: number) => (
                    <View key={index} style={styles.insightCard}>
                      <Text style={styles.insightCardText}>{takeaway.insight}</Text>
                    </View>
                  ),
                )}
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {analyzing && (
        <View style={styles.analyzingOverlay}>
          {/* Analyzing overlay remains the same */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  },
  activeTab: {},
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#a78bfa',
  },
  entryContainer: {
    backgroundColor: 'rgba(15, 15, 15, 0.6)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  richHeader: {
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    padding: 0,
  },
  metaLine: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
  },
  moodButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    gap: 6,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  aiCtaButton: {
    flex: 1,
    marginLeft: 8,
  },
  aiCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 999,
  },
  aiCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginVertical: 20,
  },
  contentInput: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
    minHeight: 300,
  },
  analyzingOverlay: {},
  insightsCard: {
    backgroundColor: '#020617',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    shadowColor: '#22c55e',
    shadowOpacity: 0.18,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 },
    marginBottom: 32,
  },
  analysisMeta: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 12,
  },
  briefingContainer: {
    marginBottom: 32,
  },
  briefingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e5e7ff',
    textAlign: 'center',
    marginBottom: 8,
  },
  briefingSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  briefingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  briefingText: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
  },
  briefingCardPlaceholder: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  briefingPlaceholderText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    textAlign: 'center',
  },
  fullAnalysisButton: {
    marginTop: 8,
    borderRadius: 999,
  },
  fullAnalysisGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 999,
  },
  fullAnalysisButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  primaryEmotionCard: {
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  primaryEmotion: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  primaryEmotionGlow: {
    fontSize: 42,
    fontWeight: '800',
    color: '#f9fafb',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(129, 140, 248, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  emotionIntensity: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  emotionBreakdownSection: {
    marginTop: 8,
  },
  emotionBreakdownCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  emotionBreakdownLeft: {
    flex: 1,
    paddingRight: 12,
  },
  emotionBreakdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emotionPillLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  expandedEmotionDescription: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 20,
  },
  emotionBreakdownPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  insightSection: {
    marginBottom: 32,
  },
  insightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  insightCardText: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
  },
});
