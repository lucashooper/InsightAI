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
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { mobileAiService } from '../services/mobileAiService';
import { useAuth } from '../contexts/AuthContext';
import { THEME } from '../constants/theme';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      insightsOpacity.setValue(0);
      Animated.timing(insightsOpacity, {
        toValue: 1,
        duration: THEME.animations.durations.normal,
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
            {insightsView === 'highlights' ? (
              <View style={styles.briefingContainer}>
                <Text style={styles.briefingTitle}>Your Entry's Briefing</Text>
                <Text style={styles.briefingSubtitle}>
                  Reflect deeply to find patterns and connections between your thoughts and emotions.
                </Text>

                {/* Glassmorphism Briefing Card */}
                <LinearGradient
                  colors={THEME.colors.gradients.briefingCard.colors as any}
                  start={THEME.colors.gradients.briefingCard.start}
                  end={THEME.colors.gradients.briefingCard.end}
                  style={[
                    styles.briefingCard,
                    !structuredInsights?.insights_report?.conversationalSummary && styles.briefingCardPlaceholder,
                    { borderWidth: 1, borderColor: THEME.colors.borders.glass }
                  ]}
                >
                  <Text
                    style={
                      structuredInsights?.insights_report?.conversationalSummary
                        ? styles.briefingText
                        : styles.briefingPlaceholderText
                    }
                  >
                    {structuredInsights?.insights_report?.conversationalSummary ||
                      (moodAnalysis
                        ? 'AI insights are available for this entry. View the full analysis for a deeper breakdown.'
                        : "Once this entry has been analyzed, you'll see a concise emotional reflection here.")}
                  </Text>

                  {/* Primary Emotion Pill in Briefing */}
                  {moodAnalysis && (
                    <View style={styles.briefingEmotionPill}>
                      <Text style={styles.briefingEmotionLabel}>Primary Emotion</Text>
                      <LinearGradient
                        colors={THEME.colors.gradients.badges.frustrated.colors as any}
                        start={THEME.colors.gradients.badges.frustrated.start}
                        end={THEME.colors.gradients.badges.frustrated.end}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: THEME.colors.borders.badges.frustrated,
                          ...THEME.shadows.glows.growth // Using purple glow
                        }}
                      >
                        <Text style={styles.briefingEmotionText}>{moodAnalysis.primary_emotion}</Text>
                      </LinearGradient>
                    </View>
                  )}
                </LinearGradient>

                <TouchableOpacity
                  style={[styles.fullAnalysisButton, {
                    shadowColor: '#8b5cf6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6
                  }]}
                  activeOpacity={0.9}
                  onPress={() => setInsightsView('structured')}
                >
                  <LinearGradient
                    colors={THEME.colors.gradients.viewFullAnalysis.colors as any}
                    start={THEME.colors.gradients.viewFullAnalysis.start}
                    end={THEME.colors.gradients.viewFullAnalysis.end}
                    style={styles.fullAnalysisGradient}
                  >
                    <Text style={styles.fullAnalysisButtonText}>View Full Analysis</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  style={[styles.fullAnalysisButton, { marginBottom: 16 }]}
                  activeOpacity={0.9}
                  onPress={() => setInsightsView('highlights')}
                >
                  <LinearGradient
                    colors={THEME.colors.gradients.backButton.colors as any}
                    start={THEME.colors.gradients.backButton.start}
                    end={THEME.colors.gradients.backButton.end}
                    style={[styles.fullAnalysisGradient, { borderWidth: 1, borderColor: THEME.colors.borders.glassStrong }]}
                  >
                    <Ionicons name="arrow-back" size={18} color="#fff" />
                    <Text style={styles.fullAnalysisButtonText}>Back to Briefing</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {structuredInsights?.insights_report && (
                  <View>
                    {/* Insights Count Summary */}
                    {structuredInsights.insights_report.keyTakeaways && (
                      <LinearGradient
                        colors={THEME.colors.gradients.summaryCard.colors as any}
                        start={THEME.colors.gradients.summaryCard.start}
                        end={THEME.colors.gradients.summaryCard.end}
                        style={[styles.insightsSummaryCard, { borderWidth: 1, borderColor: THEME.colors.borders.glass }]}
                      >
                        <Text style={styles.insightsSummaryText}>
                          <Ionicons name="sparkles" size={16} color="#22c55e" />{' '}
                          <Text style={{ fontWeight: '700' }}>
                            {structuredInsights.insights_report.keyTakeaways.filter((t: any) => t.sentiment === 'positive').length}
                          </Text>{' '}
                          positive takeaways and{' '}
                          <Ionicons name="leaf" size={16} color="#f59e0b" />{' '}
                          <Text style={{ fontWeight: '700' }}>
                            {structuredInsights.insights_report.keyTakeaways.filter((t: any) => t.sentiment === 'opportunity').length}
                          </Text>{' '}
                          opportunities for growth
                        </Text>
                      </LinearGradient>
                    )}

                    {/* Key Insights with Sentiment Grouping */}
                    {structuredInsights.insights_report.keyTakeaways && (
                      <View style={styles.insightSection}>
                        {/* Positive Highlights */}
                        {structuredInsights.insights_report.keyTakeaways.some((t: any) => t.sentiment === 'positive') && (
                          <View style={styles.insightGroup}>
                            <View style={styles.insightGroupHeader}>
                              <Ionicons name="sparkles" size={18} color="#4ade80" />
                              <Text style={[styles.insightGroupTitle, { color: '#4ade80' }]}>Highlights</Text>
                            </View>
                            {structuredInsights.insights_report.keyTakeaways
                              .filter((t: any) => t.sentiment === 'positive')
                              .map((takeaway: any, index: number) => (
                                <LinearGradient
                                  key={`pos-${index}`}
                                  colors={THEME.colors.gradients.badges.strength.colors as any}
                                  start={THEME.colors.gradients.badges.strength.start}
                                  end={THEME.colors.gradients.badges.strength.end}
                                  style={[styles.insightCardNew, { borderColor: THEME.colors.borders.badges.strength }]}
                                >
                                  <View style={styles.insightCardHeaderNew}>
                                    <View style={[styles.categoryBadge, {
                                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                      borderColor: THEME.colors.borders.badges.strength,
                                      borderWidth: 1
                                    }]}>
                                      <Text style={[styles.categoryBadgeText, { color: '#4ade80' }]}>{takeaway.category}</Text>
                                    </View>
                                  </View>
                                  <Text style={styles.insightCardTextNew}>{takeaway.insight}</Text>
                                </LinearGradient>
                              ))}
                          </View>
                        )}

                        {/* Areas for Growth */}
                        {structuredInsights.insights_report.keyTakeaways.some((t: any) => t.sentiment === 'opportunity') && (
                          <View style={styles.insightGroup}>
                            <View style={styles.insightGroupHeader}>
                              <Ionicons name="trending-up" size={18} color="#fbbf24" />
                              <Text style={[styles.insightGroupTitle, { color: '#fbbf24' }]}>Areas for Growth</Text>
                            </View>
                            {structuredInsights.insights_report.keyTakeaways
                              .filter((t: any) => t.sentiment === 'opportunity')
                              .map((takeaway: any, index: number) => (
                                <LinearGradient
                                  key={`opp-${index}`}
                                  colors={THEME.colors.gradients.badges.challenge.colors as any}
                                  start={THEME.colors.gradients.badges.challenge.start}
                                  end={THEME.colors.gradients.badges.challenge.end}
                                  style={[styles.insightCardNew, { borderColor: THEME.colors.borders.badges.challenge }]}
                                >
                                  <View style={styles.insightCardHeaderNew}>
                                    <View style={[styles.categoryBadge, {
                                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                      borderColor: THEME.colors.borders.badges.challenge,
                                      borderWidth: 1
                                    }]}>
                                      <Text style={[styles.categoryBadgeText, { color: '#fbbf24' }]}>{takeaway.category}</Text>
                                    </View>
                                  </View>
                                  <Text style={styles.insightCardTextNew}>{takeaway.insight}</Text>
                                </LinearGradient>
                              ))}
                          </View>
                        )}
                      </View>
                    )}

                    {/* Premium Actionable Suggestion */}
                    {structuredInsights.insights_report.actionableSuggestion && (
                      <LinearGradient
                        colors={THEME.colors.gradients.actionableCard.colors as any}
                        start={THEME.colors.gradients.actionableCard.start}
                        end={THEME.colors.gradients.actionableCard.end}
                        style={styles.actionableCardNew}
                      >
                        <View style={styles.actionableHeaderNew}>
                          <View style={styles.actionableIconContainer}>
                            <Ionicons name="compass" size={24} color="#c084fc" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.actionableLabel}>RECOMMENDED STRATEGY</Text>
                            <Text style={styles.actionableTitleNew}>
                              {structuredInsights.insights_report.actionableSuggestion.title}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.actionableDivider} />

                        <Text style={styles.actionableSuggestionNew}>
                          {structuredInsights.insights_report.actionableSuggestion.suggestion}
                        </Text>

                        <TouchableOpacity
                          style={styles.addToPlaybookButton}
                          activeOpacity={0.8}
                          onPress={() => Alert.alert('Coming Soon', 'This will add the strategy to your Playbook!')}
                        >
                          <Text style={styles.addToPlaybookText}>Add to Playbook</Text>
                          <Ionicons name="add-circle-outline" size={18} color="#fff" />
                        </TouchableOpacity>
                      </LinearGradient>
                    )}
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {analyzing && (
        <View style={styles.analyzingOverlay}>
          {/* Analyzing overlay content would go here if needed */}
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
    paddingHorizontal: THEME.spacing.xl,
    paddingBottom: THEME.spacing.lg,
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
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.lg,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    paddingHorizontal: THEME.spacing.xl,
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
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    ...THEME.shadows.lg,
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
    fontWeight: '700',
    color: '#e5e7ff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  briefingSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontWeight: '400',
  },
  briefingCard: {
    borderRadius: THEME.borderRadius.xl,
    padding: 24,
    marginBottom: 24,
    ...THEME.shadows.lg,
  },
  briefingText: {
    fontSize: 17,
    color: '#e0e0e0',
    lineHeight: 28,
    letterSpacing: 0.2,
    fontWeight: '400',
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
  briefingEmotionPill: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
  },
  briefingEmotionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8b5cf6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  briefingEmotionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'capitalize',
  },
  fullAnalysisButton: {
    marginTop: 8,
    borderRadius: THEME.borderRadius.md,
    ...THEME.shadows.md,
  },
  fullAnalysisGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
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
  },
  primaryEmotionGlow: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(139, 92, 246, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
  },
  emotionIntensity: {
    fontSize: 16,
    color: '#a78bfa',
    marginBottom: 24,
  },
  emotionBreakdownSection: {
    marginTop: 16,
    width: '100%',
  },
  emotionBreakdownCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emotionBreakdownLeft: {
    flex: 1,
  },
  emotionPillLabel: {
    fontSize: 15,
    color: '#e0e0e0',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  expandedEmotionDescription: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
    lineHeight: 18,
  },
  emotionBreakdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emotionBreakdownPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a78bfa',
  },
  insightsSummaryCard: {
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsSummaryText: {
    fontSize: 15,
    color: '#e0e0e0',
    textAlign: 'center',
    lineHeight: 22,
  },
  insightSection: {
    gap: 24,
  },
  insightGroup: {
    gap: 12,
  },
  insightGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  insightGroupTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  insightCardNew: {
    borderRadius: THEME.borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...THEME.shadows.sm,
  },
  insightCardHeaderNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightCardTextNew: {
    fontSize: 15,
    color: '#e0e0e0',
    lineHeight: 24,
    fontWeight: '400',
  },
  actionableCardNew: {
    borderRadius: THEME.borderRadius.lg,
    padding: 24,
    marginTop: 32,
    ...THEME.shadows.md,
  },
  actionableHeaderNew: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  actionableIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  actionableLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c084fc',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  actionableTitleNew: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 26,
  },
  actionableDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  actionableSuggestionNew: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 26,
    marginBottom: 24,
    fontWeight: '400',
  },
  addToPlaybookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addToPlaybookText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
