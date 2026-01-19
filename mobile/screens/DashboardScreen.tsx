import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

interface DashboardStats {
  totalEntries: number;
  analyzedEntries: number;
  avgWellbeingScore: number;
  avgResilienceScore: number;
  currentStreak: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
  }[];
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const { theme, themeName } = useTheme();
  const navigation = useNavigation<any>();
  
  // Log dashboard load with theme
  useEffect(() => {
    console.log('[DashboardTheme]:', { themeName });
  }, [themeName]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dominantEmotions, setDominantEmotions] = useState<
    { emotion: string; percentage: number }[]
  >([]);
  const [emotionEntriesByEmotion, setEmotionEntriesByEmotion] = useState<
    Record<string, any[]>
  >({});
  const [emotionDetail, setEmotionDetail] = useState<
    { emotion: string; percentage: number; entries: any[] } | null
  >(null);
  const [trendPoints, setTrendPoints] = useState<
    { date: string; wellbeing: number; primaryEmotion?: string }[]
  >([]);
  const [trendTooltip, setTrendTooltip] = useState<
    | {
        index: number;
        date: string;
        wellbeing: number;
        primaryEmotion?: string;
        x: number;
        y: number;
      }
    | null
  >(null);

  const chartOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  useEffect(() => {
    if (chartData && chartData.datasets[0].data.length > 0) {
      chartOpacity.setValue(0);
      Animated.timing(chartOpacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }).start();
    }
  }, [chartData, chartOpacity]);

  const formatScoreLabel = (score: number | undefined): string => {
    if (score == null || Number.isNaN(score)) return 'No recent data';
    if (score <= 3) return 'Running low – be gentle with yourself';
    if (score <= 6) return 'Stable but with room to grow';
    return 'Stable but with room to grow';
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalEntries = notes?.length || 0;
      const analyzedEntries = notes?.filter(n => n.ai_structured_insights).length || 0;
      
      // Calculate average scores
      const scoresData = notes
        ?.filter(n => n.ai_structured_insights)
        .map(n => n.ai_structured_insights) || [];
      
      const avgWellbeing = scoresData.length > 0
        ? scoresData.reduce((sum, s) => sum + (s.wellbeingScore || 0), 0) / scoresData.length
        : 0;
      
      const avgResilience = scoresData.length > 0
        ? scoresData.reduce((sum, s) => sum + (s.resilienceScore || 0), 0) / scoresData.length
        : 0;

      // Calculate streak
      const sortedNotes = notes?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [];
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (const note of sortedNotes) {
        const noteDate = new Date(note.created_at);
        noteDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
        } else if (daysDiff > streak) {
          break;
        }
      }

      setStats({
        totalEntries,
        analyzedEntries,
        avgWellbeingScore: Math.round(avgWellbeing),
        avgResilienceScore: Math.round(avgResilience),
        currentStreak: streak,
      });

      // Build dominant emotions from existing ai_structured_insights.mood_analysis
      const emotionCounts: Record<string, number> = {};
      const entriesByEmotion: Record<string, any[]> = {};
      notes
        ?.filter((n: any) => n.ai_structured_insights?.mood_analysis?.primary_emotion)
        .forEach((n: any) => {
          const key = String(
            n.ai_structured_insights.mood_analysis.primary_emotion,
          ).trim();
          if (!key) return;
          emotionCounts[key] = (emotionCounts[key] || 0) + 1;
          if (!entriesByEmotion[key]) entriesByEmotion[key] = [];
          entriesByEmotion[key].push(n);
        });

      const totalEmotionSamples = Object.values(emotionCounts).reduce(
        (sum, c) => sum + c,
        0,
      );

      const dominant = Object.entries(emotionCounts)
        .map(([emotion, count]) => ({
          emotion,
          percentage: totalEmotionSamples
            ? Math.round((count / totalEmotionSamples) * 100)
            : 0,
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      setDominantEmotions(dominant);
      setEmotionEntriesByEmotion(entriesByEmotion);

      // Prepare chart data using ai_insights (wellbeing + resilience)
      const sentimentNotes =
        notes?.filter((n: any) => n.ai_insights && (n.ai_insights.wellbeingScore || n.ai_insights.resilienceScore)) || [];

      console.log('[Mobile Dashboard] sentimentNotes', sentimentNotes);

      if (sentimentNotes.length > 0) {
        // Use last 8 points for mobile (cleaner, less crowded)
        const recent = sentimentNotes
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .slice(-8);

        // Create labels: first, middle, last only to avoid overlap
        const labels = recent.map((n: any, index: number) => {
          const isFirst = index === 0;
          const isLast = index === recent.length - 1;
          const isMiddle = index === Math.floor(recent.length / 2);
          if (isFirst || isMiddle || isLast) {
            const date = new Date(n.created_at);
            return `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate()}`;
          }
          return '';
        });
        const wellbeingSeries = recent.map((n: any) => n.ai_insights?.wellbeingScore || 0);
        const resilienceSeries = recent.map((n: any) => n.ai_insights?.resilienceScore || 0);

        const trendPointsPayload = recent.map((n: any) => ({
          date: n.created_at,
          wellbeing: n.ai_insights?.wellbeingScore || 0,
          primaryEmotion:
            n.ai_insights?.mood_analysis?.primary_emotion ||
            n.ai_structured_insights?.mood_analysis?.primary_emotion,
        }));

        const chartPayload: ChartData = {
          labels,
          datasets: [
            {
              data: wellbeingSeries,
              color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`, // cyan
            },
            {
              data: resilienceSeries,
              color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`, // orange
            },
          ],
        };

        console.log('[Mobile Dashboard] chartData', chartPayload);
        setChartData(chartPayload);
        setTrendPoints(trendPointsPayload);
      } else {
        console.warn('[Mobile Dashboard] Not enough analyzed entries for trend chart');
        setChartData(null);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Active Theme Background */}
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'transparent', borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>Dashboard</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : stats ? (
          <>
            {/* Refined This Week Card - Horizontal Layout */}
            <View style={[styles.heroCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
              <Text style={[styles.heroTitle, { color: theme.colors.primaryText }]}>This week at a glance</Text>
              
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <View style={styles.metricIconValue}>
                    <Text style={styles.metricEmoji}>🔥</Text>
                    <Text style={[styles.metricValue, { color: theme.colors.primaryText }]}>{stats.currentStreak}</Text>
                  </View>
                  <Text style={[styles.metricLabel, { color: theme.colors.secondaryText }]}>DAY STREAK</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <View style={styles.metricIconValue}>
                    <Text style={styles.metricEmoji}>💭</Text>
                    <Text style={[styles.metricValue, { color: theme.colors.primaryText }]}>{stats.avgWellbeingScore}/10</Text>
                  </View>
                  <Text style={[styles.metricLabel, { color: theme.colors.secondaryText }]}>AVG MOOD</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <View style={styles.metricIconValue}>
                    <Text style={styles.metricEmoji}>⚡</Text>
                    <Text style={[styles.metricValue, { color: theme.colors.primaryText }]}>{stats.avgResilienceScore}/10</Text>
                  </View>
                  <Text style={[styles.metricLabel, { color: theme.colors.secondaryText }]}>ENERGY</Text>
                </View>
              </View>
              
              {/* Interpretive sentence */}
              <Text style={[styles.interpretiveSentence, { color: theme.colors.secondaryText }]}>
                {stats.avgWellbeingScore >= 7 
                  ? 'A steady week with consistent emotional balance.'
                  : stats.avgWellbeingScore >= 5
                  ? 'A steady week, with lower energy mid-week.'
                  : 'You\'ve been navigating some challenges this week.'}
              </Text>
            </View>

            {/* Emotion Bubble Map - Mindsera Style */}
            {dominantEmotions.length > 0 && (
              <View style={[styles.bubbleMapCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
                <View style={styles.bubbleMapHeader}>
                  <Text style={[styles.bubbleMapTitle, { color: theme.colors.primaryText }]}>Emotional landscape</Text>
                  <Text style={[styles.bubbleMapSubtitle, { color: theme.colors.secondaryText }]}>Tap to explore</Text>
                </View>
                
                <View style={styles.bubbleMapContainer}>
                  {dominantEmotions.map((item, index) => {
                    // Calculate bubble size based on percentage
                    const baseSize = 60;
                    const size = baseSize + (item.percentage * 0.8);
                    
                    // Position bubbles in a scattered pattern
                    const positions = [
                      { top: 20, left: 30 },
                      { top: 60, right: 40 },
                      { top: 120, left: 60 },
                      { top: 100, right: 80 },
                      { top: 160, left: 120 },
                    ];
                    
                    const position = positions[index] || { top: 80, left: 80 };
                    
                    return (
                      <TouchableOpacity
                        key={item.emotion}
                        style={[
                          styles.emotionBubble,
                          {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            ...position,
                          },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          console.log('[DashboardBubblePressed]:', { emotion: item.emotion, percentage: item.percentage });
                          navigation.navigate('EmotionDetail', {
                            emotion: item.emotion,
                            percentage: item.percentage,
                            entries: emotionEntriesByEmotion[item.emotion] || [],
                          });
                        }}
                      >
                        <LinearGradient
                          colors={[
                            `rgba(139, 92, 246, ${0.3 + item.percentage / 200})`,
                            `rgba(99, 102, 241, ${0.2 + item.percentage / 200})`,
                          ]}
                          style={styles.bubbleGradient}
                        >
                          <Text style={styles.bubbleEmotionText}>{item.emotion}</Text>
                          <Text style={styles.bubblePercentageText}>{item.percentage}%</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                  
                  {/* Add + bubble for new emotions */}
                  <TouchableOpacity
                    style={[
                      styles.emotionBubble,
                      styles.addBubble,
                      {
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        top: 140,
                        right: 30,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => console.log('[Dashboard] Add emotion tapped')}
                  >
                    <View style={[styles.addBubbleInner, { borderColor: theme.colors.border }]}>
                      <Text style={[styles.addBubbleText, { color: theme.colors.secondaryText }]}>+</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Wellbeing Trend Chart */}
            {chartData && chartData.datasets[0].data.length > 0 && (
            <LinearGradient
              colors={['rgba(5, 5, 15, 0.98)', 'rgba(2, 2, 8, 0.98)', 'rgba(0, 0, 0, 0.98)']}
              style={styles.chartCard}
            >
              <View style={styles.chartHeader}>
                <Ionicons name="trending-up" size={20} color="#8b5cf6" />
                <Text style={styles.chartTitle}>Wellbeing Trend</Text>
              </View>
              <Animated.View
                style={{
                  opacity: chartOpacity,
                  transform: [
                    {
                      translateY: chartOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                }}
              >
                <LineChart
                  data={{
                    labels: chartData.labels,
                    datasets: [{ data: chartData.datasets[0].data }],
                  }}
                  width={screenWidth - 40}
                  height={180}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(167, 139, 250, ${Math.min(opacity * 1.5, 1)})`,
                    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity * 0.7})`,
                    style: { borderRadius: 18 },
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                      stroke: 'rgba(196, 181, 253, 0.8)',
                      fill: '#a78bfa',
                    },
                    strokeWidth: 3,
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: 'rgba(148, 163, 184, 0.03)',
                      strokeWidth: 0.5,
                    },
                    fillShadowGradient: '#a855f7',
                    fillShadowGradientOpacity: 0.35,
                    propsForLabels: {
                      fontSize: 10,
                    },
                  }}
                  bezier
                  withInnerLines={true}
                  withOuterLines={false}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  fromZero={true}
                  segments={6}
                  onDataPointClick={({ index, x, y }) => {
                    const point = trendPoints[index];
                    if (!point) return;
                    setTrendTooltip({
                      index,
                      date: point.date,
                      wellbeing: point.wellbeing,
                      primaryEmotion: point.primaryEmotion,
                      x,
                      y,
                    });
                  }}
                  style={{
                    marginVertical: 12,
                    borderRadius: 18,
                  }}
                />
              </Animated.View>
                {trendTooltip && (
                  <>
                    <View
                      style={[
                        styles.trendTooltipGlow,
                        {
                          left: 18 + trendTooltip.x - 10,
                          top: 12 + trendTooltip.y - 10,
                        },
                      ]}
                    />
                    <View style={styles.trendTooltip}>
                      <Text style={styles.trendTooltipDate}>
                        {new Date(trendTooltip.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                      <Text style={styles.trendTooltipScore}>
                        Wellbeing: {trendTooltip.wellbeing}/10
                      </Text>
                      {trendTooltip.primaryEmotion && (
                        <Text style={styles.trendTooltipEmotion}>
                          Primary emotion: {trendTooltip.primaryEmotion}
                        </Text>
                      )}
                    </View>
                  </>
                )}
                <Text style={styles.chartSubtext}>
                  Last {chartData.labels.length} entries • Wellbeing score
                </Text>
              </LinearGradient>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart" size={64} color="#666" />
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        )}
      </ScrollView>

      {emotionDetail && (
        <View style={styles.sheetOverlay}>
          <LinearGradient
            colors={['#111827', '#020617', '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sheetContainer}
          >
            <View style={styles.sheetHandleWrapper}>
              <View style={styles.sheetHandle} />
            </View>

            <Text style={styles.sheetEmotionLabel}>
              {emotionDetail.emotion.toUpperCase()}
            </Text>
            <Text style={styles.sheetEmotionMeta}>
              Seen in {emotionDetail.percentage}% of your analyzed entries
            </Text>

            <Text style={styles.sheetDescription}>
              Recently, your entries often mention feeling{' '}
              {emotionDetail.emotion.toLowerCase()}. This might be tied to work,
              routines, or relationships depending on the context of each entry.
            </Text>

            {emotionDetail.entries.length > 0 && (
              <View style={styles.sheetEntriesSection}>
                <Text style={styles.sheetEntriesTitle}>Recent entries</Text>
                {emotionDetail.entries.map((entry: any) => (
                  <TouchableOpacity
                    key={entry.id}
                    style={styles.sheetEntryRow}
                    onPress={() => {
                      setEmotionDetail(null);
                      navigation.navigate('EntryDetail', { entry });
                    }}
                  >
                    <Text style={styles.sheetEntryDate}>
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.sheetEntryTitle} numberOfLines={1}>
                      {entry.title || 'Untitled entry'}
                    </Text>
                    <Text style={styles.sheetEntrySnippet} numberOfLines={1}>
                      {entry.content}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.sheetCtaRow}>
              <TouchableOpacity
                style={[styles.sheetCtaButton, styles.sheetCtaSecondary]}
                onPress={() => {
                  setEmotionDetail(null);
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.sheetCtaSecondaryText} numberOfLines={1}>
                  View related entries
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetCtaButton, styles.sheetCtaPrimary]}
                onPress={() => {
                  setEmotionDetail(null);
                  navigation.navigate('Playbook');
                }}
              >
                <Text style={styles.sheetCtaPrimaryText}>Open Playbook</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetCloseArea}
              onPress={() => setEmotionDetail(null)}
            >
              <Text style={styles.sheetCloseText}>Close</Text>
            </TouchableOpacity>
          </LinearGradient>
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
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroCard: {
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  heroGradient: {
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.45)',
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 8,
    paddingTop: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  moodRingContainer: {
    alignItems: 'center',
    marginLeft: 16,
  },
  moodRingOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(129, 140, 248, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  moodRingInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodRingScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  moodRingLabel: {
    marginTop: 6,
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: 140,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroStatItem: {
    flex: 1,
    paddingHorizontal: 4,
  },
  heroStatLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
  },
  heroStatCaption: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(148, 163, 184, 0.35)',
    marginHorizontal: 4,
  },
  heroReflectionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
  },
  dominantCard: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
  },
  dominantGradient: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.8)',
  },
  dominantHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dominantTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f9fafb',
  },
  dominantSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dominantChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionChip: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  emotionChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 130,
  },
  emotionChipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#e5e7eb',
  },
  emotionChipValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#c4b5fd',
  },
  statCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.9)',
    backgroundColor: 'rgba(15, 15, 20, 0.96)',
    width: '48%',
    minHeight: 120,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statEmoji: {
    fontSize: 14,
  },
  wideCard: {
    width: '100%',
    paddingVertical: 40,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -2,
  },
  statSubLabel: {
    marginTop: 6,
    fontSize: 11,
    color: '#8b8b8b',
  },
  statLabel: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  chartCard: {
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    width: '100%',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  chartSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  secondaryStats: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryStatsFooterText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
  trendTooltip: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.7)',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  trendTooltipGlow: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(196, 181, 253, 0.8)',
    shadowColor: '#a855f7',
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  trendTooltipDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 2,
  },
  trendTooltipScore: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  trendTooltipEmotion: {
    fontSize: 12,
    color: '#c4b5fd',
    marginTop: 2,
  },
  sheetOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.6)',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 26,
    shadowColor: '#6366f1',
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -6 },
  },
  sheetHandleWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.6)',
  },
  sheetEmotionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f9fafb',
    textAlign: 'center',
    marginTop: 8,
  },
  sheetEmotionMeta: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  sheetDescription: {
    fontSize: 13,
    color: '#d1d5db',
    marginTop: 12,
    lineHeight: 20,
  },
  sheetEntriesSection: {
    marginTop: 16,
  },
  sheetEntriesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  sheetEntryRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 41, 55, 0.9)',
  },
  sheetEntryDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  sheetEntryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f9fafb',
  },
  sheetEntrySnippet: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sheetCtaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  sheetCtaButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCtaSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.8)',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  sheetCtaSecondaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#e5e7eb',
  },
  sheetCtaPrimary: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  sheetCtaPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  sheetCloseArea: {
    marginTop: 16,
    alignItems: 'center',
  },
  sheetCloseText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  // Simplified Hero Card Styles
  heroStatsRowSimplified: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingHorizontal: 8,
  },
  heroStatItemSimplified: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  heroStatValueLarge: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroStatLabelSimplified: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Bubble Map Styles
  bubbleMapCard: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
  },
  bubbleMapHeader: {
    marginBottom: 16,
  },
  bubbleMapTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bubbleMapSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  bubbleMapContainer: {
    height: 240,
    position: 'relative',
  },
  emotionBubble: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  bubbleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  bubbleEmotionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  bubblePercentageText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  addBubble: {
    shadowColor: '#666',
    shadowOpacity: 0.2,
  },
  addBubbleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  addBubbleText: {
    fontSize: 24,
    fontWeight: '300',
  },
  // Refined This Week Card Styles
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricIconValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metricEmoji: {
    fontSize: 24,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  interpretiveSentence: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 16,
    marginTop: 8,
    paddingBottom: 4,
  },
});
