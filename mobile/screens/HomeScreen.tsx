import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const insightLogo = require('../assets/192px-Insight-ICON.png');

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  mood?: string;
  ai_structured_insights?: any;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const calculateStreak = (notes: DiaryEntry[]) => {
    if (!notes || notes.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const sortedNotes = [...notes].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const note of sortedNotes) {
      const noteDate = new Date(note.created_at);
      noteDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        tempStreak = 1;
        currentStreak = 1;
      } else {
        const dayDiff = Math.floor((lastDate.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          tempStreak++;
          if (currentStreak === lastDate.getTime() / (1000 * 60 * 60 * 24)) {
            currentStreak++;
          }
        } else if (dayDiff > 1) {
          tempStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
      lastDate = noteDate;
    }

    return { currentStreak, longestStreak };
  };

  const loadEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEntries(data || []);
      setStreak(calculateStreak(data || []));
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEntries();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderEntry = ({ item }: { item: DiaryEntry }) => {
    const hasInsights = item.ai_structured_insights?.wellbeingScore;
    
    return (
      <TouchableOpacity
        style={styles.premiumCard}
        onPress={() => navigation.navigate('EntryDetail', { entry: item })}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={hasInsights ? ['#0f0f0f', '#1a1a1a'] : ['#0a0a0a', '#0f0f0f']}
          style={styles.cardGradient}
        >
          {/* Header with title and mood */}
          <View style={styles.entryHeader}>
            <View style={styles.entryTitleRow}>
              <Text style={styles.entryTitle} numberOfLines={1}>
                {item.title || 'Untitled Entry'}
              </Text>
              {item.mood && (
                <View style={styles.moodBadge}>
                  <Text style={styles.moodEmoji}>{item.mood}</Text>
                </View>
              )}
            </View>
            {hasInsights && (
              <View style={styles.insightBadge}>
                <Ionicons name="sparkles" size={12} color="#8b5cf6" />
                <Text style={styles.insightBadgeText}>Analyzed</Text>
              </View>
            )}
          </View>

          {/* Content preview */}
          <Text style={styles.entryContent} numberOfLines={3}>
            {item.content}
          </Text>

          {/* Footer with date and action */}
          <View style={styles.entryFooter}>
            <Text style={styles.entryDate}>{formatDate(item.created_at)}</Text>
            {hasInsights && (
              <TouchableOpacity 
                style={styles.viewInsightsButton}
                onPress={() => navigation.navigate('EntryDetail', { entry: item })}
              >
                <Text style={styles.viewInsightsText}>View Insights</Text>
                <Ionicons name="arrow-forward" size={14} color="#8b5cf6" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0a0a0a', '#000000']}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <Image source={insightLogo} style={styles.appLogo} />
          <Text style={styles.headerTitle}>Journal</Text>
        </View>
        <View style={styles.headerRight}>
          {streak.currentStreak > 0 && (
            <View style={styles.headerStreak}>
              <Text style={styles.headerStreakEmoji}>🔥</Text>
              <Text style={styles.headerStreakText}>{streak.currentStreak}</Text>
            </View>
          )}
          <TouchableOpacity onPress={signOut} style={styles.logoutIconButton}>
            <Ionicons name="log-out-outline" size={22} color="#999999" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Entries List */}
      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No Entries Yet</Text>
          <Text style={styles.emptyText}>
            Start your journaling journey by creating your first entry
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateEntry')}
          >
            <Text style={styles.createButtonText}>Create Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#8b5cf6"
            />
          }
        />
      )}

      {/* Floating Action Button */}
      {entries.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateEntry')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8b5cf6', '#7c3aed']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 26, 26, 0.5)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerStreakEmoji: {
    fontSize: 16,
  },
  headerStreakText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fbbf24',
  },
  logoutIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(153, 153, 153, 0.1)',
  },
  logoutText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  // Streak Card Styles
  streakCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#8b5cf630',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff6b3520',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakInfo: {
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e5e5',
  },
  streakSubtext: {
    fontSize: 13,
    color: '#999999',
    marginTop: 4,
  },
  longestStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fbbf2420',
  },
  trophyEmoji: {
    fontSize: 16,
  },
  longestStreakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fbbf24',
  },
  // Premium Entry Card Styles
  premiumCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    backgroundColor: 'rgba(15, 15, 15, 0.8)',
  },
  entryHeader: {
    marginBottom: 12,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    letterSpacing: -0.3,
  },
  moodBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  moodEmoji: {
    fontSize: 20,
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#8b5cf620',
    alignSelf: 'flex-start',
  },
  insightBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8b5cf6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entryContent: {
    fontSize: 15,
    color: '#999999',
    lineHeight: 22,
    marginBottom: 16,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  viewInsightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#8b5cf615',
  },
  viewInsightsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 96,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});
