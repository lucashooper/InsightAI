import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

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

      // Prepare chart data using ai_insights (wellbeing + resilience)
      const sentimentNotes =
        notes?.filter((n: any) => n.ai_insights && (n.ai_insights.wellbeingScore || n.ai_insights.resilienceScore)) || [];

      console.log('[Mobile Dashboard] sentimentNotes', sentimentNotes);

      if (sentimentNotes.length > 0) {
        // Use last 8 points for mobile (cleaner, less crowded)
        const recent = sentimentNotes
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .slice(-8);

        // Create abbreviated labels - show every other label
        const labels = recent.map((n: any, index: number) => {
          if (index % 2 === 0 || index === recent.length - 1) {
            const date = new Date(n.created_at);
            return `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate()}`;
          }
          return ''; // Empty label for intermediate points
        });
        const wellbeingSeries = recent.map((n: any) => n.ai_insights?.wellbeingScore || 0);
        const resilienceSeries = recent.map((n: any) => n.ai_insights?.resilienceScore || 0);

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
    <View style={styles.container}>
      {/* Subtle Background Gradient */}
      <LinearGradient
        colors={['#0a0a0a', '#050505', '#000000']}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your emotional wellbeing at a glance</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : stats ? (
          <View style={styles.statsGrid}>
            {/* Current Streak - Primary */}
            <LinearGradient
              colors={['rgba(15, 15, 15, 0.95)', 'rgba(10, 10, 10, 0.95)']}
              style={styles.statCard}
            >
              <View style={styles.statHeader}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statLabel}>DAY STREAK</Text>
              </View>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
            </LinearGradient>

            {/* Wellbeing Score - Primary */}
            <LinearGradient
              colors={['rgba(15, 15, 15, 0.95)', 'rgba(10, 10, 10, 0.95)']}
              style={styles.statCard}
            >
              <View style={styles.statHeader}>
                <Text style={styles.statEmoji}>💝</Text>
                <Text style={styles.statLabel}>AVG WELLBEING</Text>
              </View>
              <Text style={styles.statValue}>{stats.avgWellbeingScore}</Text>
            </LinearGradient>

            {/* Resilience Score - Primary */}
            <LinearGradient
              colors={['rgba(15, 15, 15, 0.95)', 'rgba(10, 10, 10, 0.95)']}
              style={styles.statCard}
            >
              <View style={styles.statHeader}>
                <Text style={styles.statEmoji}>🛡️</Text>
                <Text style={styles.statLabel}>AVG RESILIENCE</Text>
              </View>
              <Text style={styles.statValue}>{stats.avgResilienceScore}</Text>
            </LinearGradient>

            {/* Simplified Wellbeing Trend Chart */}
            {chartData && chartData.datasets[0].data.length > 0 ? (
              <LinearGradient
                colors={['rgba(10, 10, 10, 0.98)', 'rgba(5, 5, 8, 0.98)']}
                style={styles.chartCard}
              >
                <View style={styles.chartHeader}>
                  <Ionicons name="trending-up" size={20} color="#8b5cf6" />
                  <Text style={styles.chartTitle}>Wellbeing Trend</Text>
                </View>
                <LineChart
                  data={{
                    labels: chartData.labels,
                    datasets: [{ data: chartData.datasets[0].data }]
                  }}
                  width={screenWidth - 64}
                  height={180}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(120, 120, 140, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: '0',
                      strokeWidth: '0',
                    },
                    strokeWidth: 3,
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: 'rgba(255, 255, 255, 0.05)',
                      strokeWidth: 1,
                    },
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
                  style={{
                    marginVertical: 12,
                    alignSelf: 'center',
                    borderRadius: 16,
                  }}
                />
                <Text style={styles.chartSubtext}>
                  Last {chartData.labels.length} entries • Wellbeing score
                </Text>
              </LinearGradient>
            ) : (
              <View style={[styles.statCard, styles.wideCard]}>
                <Ionicons name="trending-up" size={32} color="#666" />
                <Text style={styles.comingSoonText}>
                  Chart will appear after analyzing more entries
                </Text>
              </View>
            )}

            {/* Secondary Stats - compact footer */}
            <View style={styles.secondaryStats}>
              <Text style={styles.secondaryStatsFooterText}>
                Entries: {stats.totalEntries}   ·   Analyzed: {stats.analyzedEntries}   ·   Best streak: {stats.currentStreak}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart" size={64} color="#666" />
            <Text style={styles.emptyText}>No data available</Text>
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
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
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
  statCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    width: '48%',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    width: '100%',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
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
});
