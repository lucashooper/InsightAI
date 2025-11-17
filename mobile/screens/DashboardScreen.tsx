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

      // Prepare chart data (last 7 entries with wellbeing scores)
      const recentNotesWithScores = notes
        ?.filter(n => n.ai_structured_insights?.wellbeingScore)
        .slice(0, 7)
        .reverse() || [];

      if (recentNotesWithScores.length > 0) {
        setChartData({
          labels: recentNotesWithScores.map(n => 
            new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          ),
          datasets: [{
            data: recentNotesWithScores.map(n => 
              n.ai_structured_insights?.wellbeingScore || 0
            )
          }]
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your insights at a glance</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : stats ? (
          <View style={styles.statsGrid}>
            {/* Total Entries */}
            <LinearGradient
              colors={['rgba(15, 15, 15, 0.95)', 'rgba(26, 26, 26, 0.95)']}
              style={styles.statCard}
            >
              <View style={styles.statHeader}>
                <View style={styles.iconGlow}>
                  <Ionicons name="document-text" size={20} color="#8b5cf6" />
                </View>
                <Text style={styles.statValue}>{stats.totalEntries}</Text>
              </View>
              <Text style={styles.statLabel}>Total Entries</Text>
            </LinearGradient>

            {/* Analyzed Entries */}
            <LinearGradient
              colors={['rgba(15, 15, 15, 0.95)', 'rgba(26, 26, 26, 0.95)']}
              style={styles.statCard}
            >
              <View style={styles.statHeader}>
                <View style={[styles.iconGlow, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="analytics" size={20} color="#10b981" />
                </View>
                <Text style={styles.statValue}>{stats.analyzedEntries}</Text>
              </View>
              <Text style={styles.statLabel}>Analyzed</Text>
            </LinearGradient>

            {/* Current Streak */}
            <LinearGradient
              colors={['rgba(15, 15, 15, 0.95)', 'rgba(26, 26, 26, 0.95)']}
              style={styles.statCard}
            >
              <View style={styles.statHeader}>
                <View style={[styles.iconGlow, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Text style={styles.inlineEmoji}>🔥</Text>
                </View>
                <Text style={styles.statValue}>{stats.currentStreak}</Text>
              </View>
              <Text style={styles.statLabel}>Day Streak</Text>
            </LinearGradient>

            {/* Wellbeing Score */}
            <LinearGradient
              colors={['rgba(15, 15, 15, 0.95)', 'rgba(26, 26, 26, 0.95)']}
              style={styles.statCard}
            >
              <View style={styles.statHeader}>
                <View style={[styles.iconGlow, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                  <Text style={styles.inlineEmoji}>💝</Text>
                </View>
                <Text style={styles.statValue}>{stats.avgWellbeingScore}</Text>
              </View>
              <Text style={styles.statLabel}>Avg Wellbeing</Text>
            </LinearGradient>

            {/* Resilience Score */}
            <LinearGradient
              colors={['rgba(15, 15, 15, 0.95)', 'rgba(26, 26, 26, 0.95)']}
              style={styles.statCard}
            >
              <View style={styles.statHeader}>
                <View style={[styles.iconGlow, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Text style={styles.inlineEmoji}>🛡️</Text>
                </View>
                <Text style={styles.statValue}>{stats.avgResilienceScore}</Text>
              </View>
              <Text style={styles.statLabel}>Avg Resilience</Text>
            </LinearGradient>

            {/* Wellbeing Trend Chart */}
            {chartData && chartData.datasets[0].data.length > 0 ? (
              <LinearGradient
                colors={['rgba(15, 15, 15, 0.95)', 'rgba(26, 26, 26, 0.95)']}
                style={styles.chartCard}
              >
                <View style={styles.chartHeader}>
                  <View style={styles.iconGlow}>
                    <Ionicons name="trending-up" size={18} color="#8b5cf6" />
                  </View>
                  <Text style={styles.chartTitle}>Wellbeing Trend</Text>
                </View>
                <LineChart
                  data={chartData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#0f0f0f',
                    backgroundGradientFrom: '#0f0f0f',
                    backgroundGradientTo: '#0f0f0f',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(153, 153, 153, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#8b5cf6'
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
                <Text style={styles.chartSubtext}>
                  Last {chartData.labels.length} analyzed entries
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
    gap: 16,
  },
  statCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    width: '47%',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  iconGlow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineEmoji: {
    fontSize: 18,
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
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
    marginTop: 4,
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
});
