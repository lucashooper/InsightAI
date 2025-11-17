import React, { useState, useEffect, useCallback } from 'react';
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
  TextInput,
  Alert,
  Share,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

const insightLogo = require('../assets/192px-Insight-ICON.png');

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  mood?: string;
  ai_structured_insights?: any;
  is_favorite?: boolean;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  profile_picture_url: string | null;
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'analyzed' | 'unanalyzed' | 'favorites'>('all');

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

  const toggleFavorite = async (entry: DiaryEntry) => {
    if (!user) return;
    const nextValue = !entry.is_favorite;
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_favorite: nextValue })
        .eq('id', entry.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, is_favorite: nextValue } : e));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchQuery.trim() ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isAnalyzed = !!entry.ai_structured_insights;

    switch (filter) {
      case 'analyzed':
        return isAnalyzed;
      case 'unanalyzed':
        return !isAnalyzed;
      case 'favorites':
        return !!entry.is_favorite;
      default:
        return true;
    }
  });

  const handleDeleteEntry = async (entry: DiaryEntry) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', entry.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    } catch (err) {
      console.error('Error deleting entry:', err);
      Alert.alert('Error', 'Failed to delete entry');
    }
  };

  const handleShareEntry = async (entry: DiaryEntry) => {
    try {
      await Share.share({
        title: entry.title || 'Journal entry',
        message: entry.content,
      });
    } catch (err) {
      console.error('Error sharing entry:', err);
    }
  };

  const handleEntryLongPress = (entry: DiaryEntry) => {
    const isFav = !!entry.is_favorite;
    const options = [
      'View Insights',
      isFav ? 'Remove from Favorites' : 'Add to Favorites',
      'Share',
      'Delete',
      'Cancel',
    ];
    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            navigation.navigate('EntryDetail', { entry, openInsights: true });
          } else if (buttonIndex === 1) {
            toggleFavorite(entry);
          } else if (buttonIndex === 2) {
            handleShareEntry(entry);
          } else if (buttonIndex === 3) {
            Alert.alert('Delete entry', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => handleDeleteEntry(entry) },
            ]);
          }
        },
      );
    } else {
      Alert.alert('Entry options', undefined, [
        { text: 'View Insights', onPress: () => navigation.navigate('EntryDetail', { entry, openInsights: true }) },
        { text: isFav ? 'Remove from Favorites' : 'Add to Favorites', onPress: () => toggleFavorite(entry) },
        { text: 'Share', onPress: () => handleShareEntry(entry) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteEntry(entry) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setUserProfile({
          id: data.id,
          email: data.email,
          username: data.username,
          profile_picture_url: data.profile_picture_url || null,
        });
      }
    } catch (err) {
      console.error('[Home] Error loading user profile for avatar', err);
    }
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
    loadUserProfile();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [user])
  );

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
        onLongPress={() => handleEntryLongPress(item)}
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
      {/* Subtle Background Gradient */}
      <LinearGradient
        colors={['#0a0a0a', '#050505', '#000000']}
        style={styles.backgroundGradient}
      />

      {/* Clean Header */}
      <View style={styles.header}>
        <Image source={insightLogo} style={styles.appLogo} />
        <Text style={styles.headerTitle}>Journal</Text>
        <View style={styles.headerRight}>
          {streak.currentStreak > 0 && (
            <Text style={styles.streakInline}>🔥 {streak.currentStreak}</Text>
          )}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')} 
            style={styles.avatarButton}
          >
            {userProfile?.profile_picture_url ? (
              <Image 
                source={{ uri: userProfile.profile_picture_url }} 
                style={styles.headerAvatar}
              />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Text style={styles.headerAvatarText}>
                  {(userProfile?.username || user?.email || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search + Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search entries..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          {[
            { key: 'all', label: 'All' },
            { key: 'analyzed', label: 'Analyzed' },
            { key: 'unanalyzed', label: 'Unanalyzed' },
            { key: 'favorites', label: '⭐ Favorites' },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.key}
              style={[
                styles.filterChip,
                filter === chip.key && styles.filterChipActive,
              ]}
              onPress={() => setFilter(chip.key as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === chip.key && styles.filterChipTextActive,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Summary Card */}
      {entries.length > 0 && (
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['rgba(15, 15, 20, 0.98)', 'rgba(5, 5, 10, 0.96)']}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryRow}>
              {/* Entries with mini sparkline */}
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{entries.length}</Text>
                <Text style={styles.summaryLabel}>Entries</Text>
                <View style={styles.sparklineRow}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.sparklineBar,
                        i % 2 === 0 && styles.sparklineBarTall,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.summaryDivider} />

              {/* Analyzed with circular progress */}
              <View style={styles.summaryItem}>
                <View style={styles.progressCircleWrapper}>
                  <View style={styles.progressCircleOuter}>
                    <View style={styles.progressCircleInner}>
                      <Text style={styles.progressCircleText}>
                        {entries.length
                          ? `${entries.filter(e => e.ai_structured_insights).length}/${entries.length}`
                          : '0/0'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.summaryLabel}>Analyzed</Text>
              </View>

              <View style={styles.summaryDivider} />

              {/* Best Streak with inline flame */}
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  <Text style={styles.summaryFlame}>🔥 </Text>
                  {streak.longestStreak}
                </Text>
                <Text style={styles.summaryLabel}>Best Streak</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
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
          data={filteredEntries}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  appLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff6432',
  },
  streakInline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff6432',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8b5cf6',
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
  // Summary Card Styles
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  // Search & Filter styles
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  filterChipsRow: {
    marginTop: 10,
    paddingRight: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: 'rgba(139, 92, 246, 0.9)',
  },
  filterChipText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  // Stats sparkline & progress visuals
  sparklineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginTop: 6,
  },
  sparklineBar: {
    width: 4,
    height: 8,
    borderRadius: 2,
    backgroundColor: 'rgba(148, 163, 184, 0.5)',
  },
  sparklineBarTall: {
    height: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
  },
  progressCircleWrapper: {
    marginBottom: 4,
  },
  progressCircleOuter: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 15, 20, 0.9)',
  },
  progressCircleInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  summaryFlame: {
    fontSize: 20,
    textShadowColor: 'rgba(248, 113, 113, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
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
  streakCardEmoji: {
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
  streakCardNumber: {
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Center Bottom FAB (Reflectly-style)
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFab: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  centerFabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Old FAB styles (kept for compatibility)
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
