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
  const { entryId, shouldAnalyze } = route.params || {};
  const [analyzing, setAnalyzing] = useState(false);
  const { user } = useAuth();
  const [entry, setEntry] = useState<any>(null);
  const [editableContent, setEditableContent] = useState('');
  const [editableTitle, setEditableTitle] = useState('');
  const [isModified, setIsModified] = useState(false);

  // Load entry
  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    if (!entryId) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', entryId)
        .single();
      
      if (!error && data) {
        setEntry(data);
        setEditableContent(data.content || '');
        setEditableTitle(data.title || '');
        
        // Auto-analyze if requested
        if (shouldAnalyze && !data.ai_structured_insights) {
          handleAnalyzeEntry(data);
        }
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    }
  };

  useEffect(() => {
    if (!entry) return;
    const hasChanged = editableContent !== entry?.content || editableTitle !== entry?.title;
    setIsModified(hasChanged);
  }, [editableContent, editableTitle, entry]);

  // Auto-save functionality
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isModified) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save after 1.5 seconds of inactivity
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('notes')
          .update({
            title: editableTitle.trim() || 'Untitled Entry',
            content: editableContent.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', entry.id);

        if (!error) {
          entry.title = editableTitle.trim() || 'Untitled Entry';
          entry.content = editableContent.trim();
          setIsModified(false);
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editableContent, editableTitle, isModified]);

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
          <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {!structuredInsights && (
            <TouchableOpacity 
              onPress={handleAnalyzeEntry}
              disabled={analyzing}
              style={[styles.analyzeHeaderButton, (!entry?.content || analyzing) && styles.analyzeHeaderButtonDisabled]}
            >
              {analyzing ? (
                <Text style={styles.analyzeHeaderText}>Analyzing...</Text>
              ) : (
                <Text style={[styles.analyzeHeaderText, !entry?.content && styles.analyzeHeaderTextDisabled]}>
                  Analyze
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>


      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.entryContainer}>
            <TextInput
              style={styles.titleInput}
              value={editableTitle}
              onChangeText={setEditableTitle}
              placeholder="Untitled Entry"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />
            <Text style={styles.metaLine}>
              {formatDate(entry.created_at)}
            </Text>
            <TextInput
              style={styles.contentInput}
              value={editableContent}
              onChangeText={setEditableContent}
              multiline
              textAlignVertical="top"
              placeholder="What's on your mind?"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />
            
            {/* Inline Insights */}
            {structuredInsights && (
              <View style={styles.inlineInsightsSection}>
                <View style={styles.insightsDivider} />
                <Text style={styles.inlineInsightsTitle}>Insights</Text>
                
                {structuredInsights?.insights_report?.conversationalSummary && (
                  <View style={styles.inlineBriefingCard}>
                    <Text style={styles.inlineBriefingText}>
                      {structuredInsights.insights_report.conversationalSummary.replace(/The user/g, 'You').replace(/the user/g, 'you')}
                    </Text>
                  </View>
                )}
                
                {moodAnalysis && (
                  <View style={styles.inlineMoodCard}>
                    <Text style={styles.inlineMoodLabel}>Primary Emotion</Text>
                    <Text style={styles.inlineMoodEmotion}>{moodAnalysis.primary_emotion}</Text>
                  </View>
                )}
              </View>
            )}
        </View>
      </ScrollView>
    </View>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analyzeHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  analyzeHeaderButtonDisabled: {
    opacity: 0.3,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  analyzeHeaderText: {
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeHeaderTextDisabled: {
    color: 'rgba(139, 92, 246, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  entryContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
    padding: 0,
  },
  metaLine: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
  },
  contentInput: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 26,
    minHeight: 400,
    padding: 0,
  },
  inlineInsightsSection: {
    marginTop: 40,
    paddingTop: 32,
  },
  insightsDivider: {
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 24,
  },
  inlineInsightsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 20,
  },
  inlineBriefingCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  inlineBriefingText: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 26,
  },
  inlineMoodCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  inlineMoodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(139, 92, 246, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inlineMoodEmotion: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    textTransform: 'capitalize',
  },
});
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
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  saveButtonText: {
    color: '#8b5cf6',
    fontSize: 15,
    fontWeight: '600',
  },
  analyzeHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  analyzeHeaderButtonDisabled: {
    opacity: 0.4,
  },
  analyzeHeaderText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeHeaderTextDisabled: {
    color: 'rgba(139, 92, 246, 0.4)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
    padding: 0,
  },
  metaLine: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
  },
  contentInput: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 26,
    minHeight: 400,
    padding: 0,
  },
  inlineInsightsSection: {
    marginTop: 40,
    paddingTop: 32,
  },
  insightsDivider: {
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 24,
  },
  inlineInsightsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  inlineBriefingCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  inlineBriefingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
  },
  inlineMoodCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  inlineMoodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(139, 92, 246, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inlineMoodEmotion: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    textTransform: 'capitalize',
  },
  analyzingOverlay: {},
  insightsCard: {
    paddingHorizontal: 24,
    paddingTop: 20,
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
