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
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { mobileAiService } from '../services/mobileAiService';
import { useAuth } from '../contexts/AuthContext';

export default function EntryDetailScreen({ route, navigation }: any) {
  const { entry, openInsights } = route.params || {};
  const [activeTab, setActiveTab] = useState<'editor' | 'insights'>(openInsights ? 'insights' : 'editor');
  const [insightsView, setInsightsView] = useState<'highlights' | 'structured'>('highlights');
  const [analyzing, setAnalyzing] = useState(false);
  const { user } = useAuth();

  const wordCount = entry?.content
    ? String(entry.content)
        .split(/\s+/)
        .filter((w: string) => w.trim().length > 0).length
    : 0;
  const readMinutes = wordCount > 0 ? Math.max(1, Math.round(wordCount / 200)) : 0;

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
      console.log('[Mobile Insights] analyzeEntry start', { entryId: entry.id });

      const analysis = await mobileAiService.analyzeEntry(entry.content);
      console.log('[Mobile Insights] analysis result', analysis);

      // Save AI-suggested strategies to Supabase
      try {
        if (user && analysis?.coping_strategies?.suggested) {
          const suggested = Array.isArray(analysis.coping_strategies.suggested)
            ? analysis.coping_strategies.suggested
            : [];

          if (suggested.length > 0) {
            // Get existing strategies to avoid duplicates
            const { data: existing } = await supabase
              .from('actionable_insights')
              .select('title')
              .eq('user_id', user.id);

            const existingTitles = new Set(
              (existing || []).map((s: any) => String(s.title).toLowerCase()),
            );

            // Prepare new strategies
            const toInsert = suggested
              .map((item: any) => {
                const title = String(item?.strategy || '');
                if (!title || existingTitles.has(title.toLowerCase())) return null;

                const category = inferStrategyCategory(title);
                return {
                  user_id: user.id,
                  title,
                  description: String(item?.why_helpful || ''),
                  category,
                  difficulty: item?.difficulty || 'moderate',
                  emoji: getCategoryEmoji(category),
                  status: 'suggested',
                  source: 'ai_suggested',
                  source_entry_id: entry.id,
                };
              })
              .filter(Boolean);

            if (toInsert.length > 0) {
              const { error: insertError } = await supabase
                .from('actionable_insights')
                .insert(toInsert);

              if (insertError) {
                console.error('[Mobile Playbook] Error saving strategies:', insertError);
              } else {
                console.log('[Mobile Playbook] strategies saved to Supabase', {
                  added: toInsert.length,
                });
              }
            }
          }
        }
      } catch (strategyError) {
        console.error('[Mobile Playbook] Failed to save suggested strategies', strategyError);
      }

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
            {/* Rich header */}
            <View style={styles.richHeader}>
              <Text style={styles.title}>{entry.title || 'Untitled Entry'}</Text>
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

                {/* Premium AI CTA */}
                <TouchableOpacity
                  style={styles.aiCtaButton}
                  onPress={entry.ai_structured_insights ? () => setActiveTab('insights') : handleAnalyzeEntry}
                  disabled={analyzing}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={entry.ai_structured_insights
                      ? ['#a855f7', '#6366f1']
                      : ['#4f46e5', '#a855f7']}
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

            <Text style={styles.content}>{entry.content}</Text>
          </View>
        ) : (
          <View style={styles.entryContainer}>
            {/* Internal Insights view toggle */}
            <View style={styles.insightsToggleRow}>
              <TouchableOpacity
                style={[styles.insightsToggleTab, insightsView === 'highlights' && styles.insightsToggleTabActive]}
                onPress={() => setInsightsView('highlights')}
              >
                <Text
                  style={[
                    styles.insightsToggleText,
                    insightsView === 'highlights' && styles.insightsToggleTextActive,
                  ]}
                >
                  Highlights
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.insightsToggleTab, insightsView === 'structured' && styles.insightsToggleTabActive]}
                onPress={() => setInsightsView('structured')}
              >
                <Text
                  style={[
                    styles.insightsToggleText,
                    insightsView === 'structured' && styles.insightsToggleTextActive,
                  ]}
                >
                  Structured
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.date}>Analysis from {formatDate(entry.ai_last_analyzed || entry.created_at)}</Text>

            {/* Summary Text */}
            {entry.ai_structured_insights && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>
                  AI Analysis: {entry.ai_structured_insights.key_themes?.length || 0} themes •{' '}
                  {entry.ai_structured_insights.insights_report?.keyTakeaways?.length || 0} key takeaway
                  {entry.ai_structured_insights.insights_report?.keyTakeaways?.length === 1 ? '' : 's'}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            {entry.ai_structured_insights ? (
              <View>
                {console.log('[Mobile Insights] structured_insights', entry.ai_structured_insights)}

                {insightsView === 'highlights' && (
                  <>
                    {/* KEY INSIGHTS FIRST */}
                    {entry.ai_structured_insights.insights_report?.keyTakeaways &&
                      Array.isArray(entry.ai_structured_insights.insights_report.keyTakeaways) &&
                      entry.ai_structured_insights.insights_report.keyTakeaways.length > 0 && (
                        <View style={styles.insightSection}>
                          <Text style={styles.insightLabel}>KEY INSIGHTS</Text>
                          {entry.ai_structured_insights.insights_report.keyTakeaways.map((takeaway: any, index: number) => {
                            const isPositive = takeaway.sentiment === 'positive';
                            const isGrowth = takeaway.sentiment === 'negative' || takeaway.sentiment === 'growth';
                            const cardStyle = isPositive
                              ? styles.insightCardGreen
                              : isGrowth
                              ? styles.insightCardOrange
                              : styles.insightCardPurple;
                            const iconName = isPositive ? 'checkmark-circle' : isGrowth ? 'trending-up' : 'bulb';
                            const iconColor = isPositive ? '#10b981' : isGrowth ? '#f59e0b' : '#8b5cf6';
                            const categoryLabel = isPositive
                              ? 'POSITIVE TAKEAWAY'
                              : isGrowth
                              ? 'AREA FOR GROWTH'
                              : 'SELF-AWARENESS';

                            return (
                              <View key={index} style={cardStyle}>
                                <View style={styles.insightCardHeader}>
                                  <View style={styles.insightIconBadge}>
                                    <Ionicons name={iconName} size={16} color={iconColor} />
                                  </View>
                                  <Text style={styles.insightCategoryLabel}>{categoryLabel}</Text>
                                </View>
                                <Text style={styles.insightCardText}>{String(takeaway.insight || '')}</Text>
                                <View style={styles.insightCardFooter}>
                                  <Text style={styles.insightCardCategory}>{String(takeaway.category || '')}</Text>
                                  <TouchableOpacity style={styles.addToPlaybookButton}>
                                    <Ionicons name="add-circle-outline" size={16} color="#8b5cf6" />
                                    <Text style={styles.addToPlaybookText}>Add to Playbook</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}

                    {/* Mood Analysis summary near bottom of highlights */}
                    {entry.ai_structured_insights.mood_analysis &&
                      typeof entry.ai_structured_insights.mood_analysis === 'object' && (
                        <View style={styles.insightSection}>
                          <Text style={styles.insightLabel}>MOOD ANALYSIS</Text>
                          <View style={styles.moodAnalysisCardNew}>
                            <View style={styles.cardHeader}>
                              <Ionicons name="happy" size={18} color="#fbbf24" />
                              <Text style={styles.moodEmotion}>
                                {String(entry.ai_structured_insights.mood_analysis.primary_emotion || 'N/A')}
                              </Text>
                            </View>
                            <View style={styles.moodBarBackground}>
                              <View
                                style={[
                                  styles.moodBarFill,
                                  {
                                    width: `${Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        Number(entry.ai_structured_insights.mood_analysis.intensity || 0) * 10,
                                      ),
                                    )}%`,
                                  },
                                ]}
                              />
                            </View>
                            <Text style={styles.moodIntensity}>
                              Intensity: {String(entry.ai_structured_insights.mood_analysis.intensity || 'N/A')}/10
                            </Text>
                          </View>
                        </View>
                      )}
                  </>
                )}

                {insightsView === 'structured' && (
                  <>
                    {/* Key Themes */}
                    {Array.isArray(entry.ai_structured_insights.key_themes) &&
                      entry.ai_structured_insights.key_themes.length > 0 && (
                        <View style={styles.insightSection}>
                          <Text style={styles.insightLabel}>KEY THEMES</Text>
                          {entry.ai_structured_insights.key_themes.map((theme: any, index: number) => (
                            <View key={index} style={styles.themeCardPurple}>
                              <View style={styles.cardHeader}>
                                <Ionicons name="prism" size={18} color="#a78bfa" />
                                <Text style={styles.themeTitle}>{String(theme.theme || '')}</Text>
                              </View>
                              <Text style={styles.themeCategory}>{String(theme.category || '')}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                    {/* Mood Analysis */}
                    {entry.ai_structured_insights.mood_analysis &&
                      typeof entry.ai_structured_insights.mood_analysis === 'object' && (
                        <View style={styles.insightSection}>
                          <Text style={styles.insightLabel}>MOOD ANALYSIS</Text>
                          <View style={styles.moodAnalysisCardNew}>
                            <View style={styles.cardHeader}>
                              <Ionicons name="happy" size={18} color="#fbbf24" />
                              <Text style={styles.moodEmotion}>
                                {String(entry.ai_structured_insights.mood_analysis.primary_emotion || 'N/A')}
                              </Text>
                            </View>
                            <Text style={styles.moodIntensity}>
                              Intensity: {String(entry.ai_structured_insights.mood_analysis.intensity || 'N/A')}/10
                            </Text>
                          </View>
                        </View>
                      )}

                    {/* Confidence */}
                    {typeof entry.ai_structured_insights.confidence === 'number' && (
                      <View style={styles.insightSection}>
                        <Text style={styles.insightLabel}>CONFIDENCE</Text>
                        <Text style={styles.insightValue}>{entry.ai_structured_insights.confidence}%</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            ) : (
              <Text style={styles.noInsightsText}>
                No AI insights yet. Tap "Analyze entry" on the Note tab to generate insights.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
      {analyzing && (
        <View style={styles.analyzingOverlay}>
          <View style={styles.analyzingCard}>
            <Text style={styles.analyzingEmoji}>🧠</Text>
            <Text style={styles.analyzingTitle}>Analyzing your entry...</Text>
            <Text style={styles.analyzingSubtitle}>
              Identifying emotional patterns and key themes
            </Text>
            <View style={styles.analyzingBarBackground}>
              <View style={styles.analyzingBarFill} />
            </View>
          </View>
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
    borderBottomWidth: 0,
  },
  activeTab: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#a78bfa',
    textShadowColor: 'rgba(139, 92, 246, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  entryContainer: {
    backgroundColor: 'rgba(15, 15, 15, 0.6)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  richHeader: {
    marginBottom: 12,
  },
  metaLine: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
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
  glassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  glassButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(167, 139, 250, 0.95)',
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
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  aiCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
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
  insightsToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  insightsToggleTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  insightsToggleTabActive: {
    backgroundColor: '#8b5cf6',
  },
  insightsToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  insightsToggleTextActive: {
    color: '#ffffff',
  },
  insightSection: {
    marginBottom: 24,
  },
  summaryContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8b5cf6',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  themeCardPurple: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeCardGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeCardOrange: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  moodAnalysisCardNew: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  moodBarBackground: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#fbbf24',
  },
  // Premium Insight Cards with Glow
  insightCardGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  insightCardOrange: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  insightCardPurple: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  insightCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  insightIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCategoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  insightCardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 16,
  },
  insightCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightCardCategory: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  addToPlaybookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  addToPlaybookText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  analyzingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingCard: {
    width: '80%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#050508',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  analyzingEmoji: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  analyzingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  analyzingSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  analyzingBarBackground: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    overflow: 'hidden',
  },
  analyzingBarFill: {
    width: '65%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#a855f7',
  },
});
