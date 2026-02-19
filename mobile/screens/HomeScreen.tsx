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
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { EncryptionService } from '../services/encryptionService';
import PageHeader from '../components/shared/PageHeader';
import StandardContainer from '../components/shared/StandardContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMoodIndicator, MoodIndicator } from '../utils/moodIndicators';
import { isTablet, sf, ss, iPadWideContentStyle } from '../utils/responsive';

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

export default function HomeScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || '');
  const [filter, setFilter] = useState<'all' | 'analyzed' | 'unanalyzed' | 'favorites'>('all');
  const [hiddenEntryIds, setHiddenEntryIds] = useState<Set<string>>(new Set());
  const [dominantEmotions, setDominantEmotions] = useState<{ emotion: string; percentage: number }[]>([]);
  const [moodIndicatorsEnabled, setMoodIndicatorsEnabled] = useState(true);

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
    console.log('[Journal] Long press on entry:', entry.id);
    showEntryOptions(entry);
  };

  const showEntryOptions = (entry: DiaryEntry) => {
    const options = [
      'View Insights',
      'Rename',
      'Change Date',
      entry.is_favorite ? 'Remove from Favorites' : 'Add to Favorites',
      'Hide entry',
      'Share',
      'Delete',
      'Cancel',
    ];
    const cancelButtonIndex = 7;
    const destructiveButtonIndex = 6;

    const handleSelection = (buttonIndex: number) => {
      if (buttonIndex === 0) {
        navigation.navigate('EntryDetail', { entry, openInsights: true });
      } else if (buttonIndex === 1) {
        handleRenameEntry(entry);
      } else if (buttonIndex === 2) {
        handleChangeDateEntry(entry);
      } else if (buttonIndex === 3) {
        toggleFavorite(entry);
      } else if (buttonIndex === 4) {
        toggleHidden(entry.id);
      } else if (buttonIndex === 5) {
        handleShareEntry(entry);
      } else if (buttonIndex === 6) {
        console.log('[Journal] Deleted entry:', entry.id);
        handleDeleteEntry(entry);
        Alert.alert('Deleted', 'Entry removed', [{ text: 'OK' }]);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        handleSelection,
      );
    } else {
      Alert.alert('Entry options', undefined, [
        { text: options[0], onPress: () => handleSelection(0) },
        { text: options[1], onPress: () => handleSelection(1) },
        { text: options[2], onPress: () => handleSelection(2) },
        { text: options[3], onPress: () => handleSelection(3) },
        { text: options[4], onPress: () => handleSelection(4) },
        { text: options[5], onPress: () => handleSelection(5) },
        { text: options[6], style: 'destructive', onPress: () => handleSelection(6) },
        { text: options[7], style: 'cancel' },
      ]);
    }
  };

  const handleRenameEntry = (entry: DiaryEntry) => {
    Alert.prompt(
      'Rename Entry',
      'Enter a new title for this entry',
      async (newTitle) => {
        if (newTitle && newTitle.trim()) {
          try {
            const { error } = await supabase
              .from('notes')
              .update({ title: newTitle.trim() })
              .eq('id', entry.id);

            if (!error) {
              loadEntries();
              Alert.alert('Success', 'Entry renamed');
            } else {
              Alert.alert('Error', 'Failed to rename entry');
            }
          } catch (err) {
            console.error('[Home] Error renaming entry:', err);
            Alert.alert('Error', 'Failed to rename entry');
          }
        }
      },
      'plain-text',
      entry.title
    );
  };

  const handleChangeDateEntry = (entry: DiaryEntry) => {
    const currentDate = new Date(entry.created_at);
    const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    Alert.prompt(
      'Change Entry Date',
      'Enter new date (YYYY-MM-DD format)',
      async (newDate) => {
        if (newDate && newDate.trim()) {
          // Validate date format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(newDate.trim())) {
            Alert.alert('Invalid Format', 'Please use YYYY-MM-DD format (e.g., 2026-02-17)');
            return;
          }

          try {
            const parsedDate = new Date(newDate.trim());
            if (isNaN(parsedDate.getTime())) {
              Alert.alert('Invalid Date', 'Please enter a valid date');
              return;
            }

            // Update the created_at timestamp
            const { error } = await supabase
              .from('notes')
              .update({ created_at: parsedDate.toISOString() })
              .eq('id', entry.id);

            if (!error) {
              loadEntries();
              Alert.alert('Success', 'Entry date updated');
            } else {
              console.error('[Home] Error changing date:', error);
              Alert.alert('Error', 'Failed to change entry date');
            }
          } catch (err) {
            console.error('[Home] Error changing entry date:', err);
            Alert.alert('Error', 'Failed to change entry date');
          }
        }
      },
      'plain-text',
      formattedDate
    );
  };

  const toggleHidden = (id: string) => {
    setHiddenEntryIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
        const validPfp = data.profile_picture_url && 
          (data.profile_picture_url.startsWith('http://') || data.profile_picture_url.startsWith('https://'))
          ? data.profile_picture_url : null;
        if (validPfp) AsyncStorage.setItem('CACHED_PROFILE_PICTURE', validPfp);
        if (data.username) AsyncStorage.setItem('CACHED_USERNAME', data.username);
        setUserProfile({
          id: data.id,
          email: data.email,
          username: data.username,
          profile_picture_url: validPfp,
        });
      } else {
        // Fallback to cached data
        const cachedName = await AsyncStorage.getItem('CACHED_USERNAME');
        const cachedPfp = await AsyncStorage.getItem('CACHED_PROFILE_PICTURE');
        setUserProfile({
          id: user.id,
          email: user.email || '',
          username: cachedName || user.email?.split('@')[0] || 'User',
          profile_picture_url: cachedPfp || null,
        });
      }
    } catch (err) {
      console.error('[Home] Error loading user profile for avatar', err);
      const cachedName = await AsyncStorage.getItem('CACHED_USERNAME');
      const cachedPfp = await AsyncStorage.getItem('CACHED_PROFILE_PICTURE');
      setUserProfile({
        id: user.id,
        email: user.email || '',
        username: cachedName || user.email?.split('@')[0] || 'User',
        profile_picture_url: cachedPfp || null,
      });
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

      // Smart decryption: handles both encrypted and legacy plain text entries
      const encryptionKey = await EncryptionService.getKey();
      console.log('[HomeScreen] Encryption key available:', !!encryptionKey);
      console.log('[HomeScreen] Processing', (data || []).length, 'entries');
      
      const processedEntries = await Promise.all((data || []).map(async (entry, index) => {
        console.log(`[HomeScreen] Entry ${index + 1}:`, {
          id: entry.id,
          contentPreview: entry.content?.substring(0, 50) + '...',
          isEncrypted: entry.is_encrypted,
          looksEncrypted: entry.content?.includes(':') && entry.content.length > 32
        });

        // If no key, return as-is (legacy entries will display, encrypted ones won't)
        if (!encryptionKey) {
          console.log('[HomeScreen] No encryption key, returning entry as-is');
          return entry;
        }

        // If entry is marked as encrypted or looks encrypted, try to decrypt
        if (entry.is_encrypted || (entry.content?.includes(':') && entry.content.length > 32)) {
          try {
            const decryptedContent = await EncryptionService.decrypt(entry.content, encryptionKey);
            console.log('[HomeScreen] Decrypted entry', entry.id);
            return { ...entry, content: decryptedContent };
          } catch (decryptError) {
            console.error('[HomeScreen] Failed to decrypt entry:', entry.id, decryptError);
            return { ...entry, content: '[Encrypted - Unable to decrypt]' };
          }
        }

        // Legacy plain text entry
        console.log('[HomeScreen] Legacy plain text entry:', entry.id);
        return entry;
      }));

      setEntries(processedEntries);
      setStreak(calculateStreak(processedEntries));

      // Calculate dominant emotions for greeting
      const emotionCounts: Record<string, number> = {};
      processedEntries
        .filter((n: any) => n.ai_structured_insights?.mood_analysis?.primary_emotion)
        .forEach((n: any) => {
          const key = String(n.ai_structured_insights.mood_analysis.primary_emotion).trim();
          if (key) emotionCounts[key] = (emotionCounts[key] || 0) + 1;
        });
      const totalEmotionSamples = Object.values(emotionCounts).reduce((sum, c) => sum + c, 0);
      const dominant = Object.entries(emotionCounts)
        .map(([emotion, count]) => ({
          emotion,
          percentage: totalEmotionSamples ? Math.round((count / totalEmotionSamples) * 100) : 0,
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 2);
      setDominantEmotions(dominant);
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
      loadEntries();
      loadMoodIndicatorsSetting();
    }, [])
  );

  const loadMoodIndicatorsSetting = async () => {
    try {
      const setting = await AsyncStorage.getItem('moodIndicatorsEnabled');
      if (setting !== null) {
        setMoodIndicatorsEnabled(setting === 'true');
      }
    } catch (error) {
      console.error('Error loading mood indicators setting:', error);
    }
  };

// Handle search query from navigation params (e.g., from Recent Topics)
useEffect(() => {
  if (route?.params?.searchQuery) {
    setSearchQuery(route.params.searchQuery);
  }
}, [route?.params?.searchQuery]);

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

const getGreeting = () => {
  const hour = new Date().getHours();
  const name = userProfile?.username || 'there';
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 18) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
};

const getMicroMessage = () => {
  const name = userProfile?.username || 'there';
  const messages = [
    `Welcome back, ${name}.`,
    `Reflection streak: ${streak.currentStreak} days.`,
    entries.length > 0 && dominantEmotions.length > 0
      ? `Your last entry was mostly ${dominantEmotions[0].emotion.toLowerCase()}.`
      : null,
    'Good to see you again.',
  ].filter(Boolean);
  // Simple rotation based on current second (changes every render but feels dynamic)
  const index = Math.floor(Date.now() / 5000) % messages.length;
  return messages[index];
};

// Helper to highlight search query matches in text
const highlightText = (text: string, query: string) => {
  if (!query.trim()) return <Text>{text}</Text>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <Text>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={index} style={{ backgroundColor: '#8b5cf6', color: '#ffffff', fontWeight: '600' }}>
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        )
      )}
    </Text>
  );
};

const renderEntry = ({ item }: { item: DiaryEntry }) => {
  const hasInsights = item.ai_structured_insights?.wellbeingScore;
  const isHidden = hiddenEntryIds.has(item.id);
  
  return (
    <TouchableOpacity
      style={styles.premiumCardPressable}
      onPress={() => {
        if (isHidden) {
          Alert.alert('Locked entry', 'Unlock this entry to view its contents?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Unlock',
              onPress: () => {
                toggleHidden(item.id);
                navigation.navigate('EntryDetail', { entry: item });
              },
            },
          ]);
        } else {
          navigation.navigate('EntryDetail', { entry: item });
        }
      }}
      onLongPress={() => handleEntryLongPress(item)}
      activeOpacity={0.7}
    >
      <StandardContainer style={[styles.premiumCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
        <View style={styles.cardGradient}>
          <View style={styles.entryTitleRow}>
            <View style={styles.entryTitleWithIndicator}>
              {moodIndicatorsEnabled && (() => {
                const moodIndicator = getMoodIndicator(item.ai_structured_insights);
                return moodIndicator ? (
                  <Text style={styles.moodIndicatorEmoji}>{moodIndicator.emoji}</Text>
                ) : null;
              })()}
              <Text style={[styles.entryTitle, { color: theme.colors.primaryText }]} numberOfLines={1}>
                {isHidden ? 'Locked entry' : searchQuery.trim() ? highlightText(item.title || 'Untitled Entry', searchQuery) : item.title || 'Untitled Entry'}
              </Text>
            </View>
            {item.mood && (
              <View style={styles.moodBadge}>
                <Text style={styles.moodEmoji}>{item.mood}</Text>
              </View>
            )}
          </View>
          <View style={styles.entryHeader}>
            {hasInsights && (
              <View style={styles.insightBadge}>
                <Ionicons name="sparkles" size={12} color="#ffffff" />
                <Text style={styles.insightBadgeText}>Analyzed</Text>
              </View>
            )}
          </View>

            <Text style={[styles.entryContent, { color: theme.colors.secondaryText }]} numberOfLines={3}>
              {isHidden ? 'Tap to unlock and view this entry.' : searchQuery.trim() ? highlightText(item.content, searchQuery) : item.content}
            </Text>

            <View style={styles.entryFooter}>
              <Text style={[styles.entryDate, { color: theme.colors.tertiaryText }]}>{formatDate(item.created_at)}</Text>
              {hasInsights && (
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.viewInsightsButton}
                >
                  <TouchableOpacity
                    style={styles.viewInsightsButtonInner}
                    onPress={() => navigation.navigate('EntryDetail', { entry: item })}
                  >
                    <Text style={styles.viewInsightsText}>View Insights</Text>
                    <Ionicons name="arrow-forward" size={14} color="#ffffff" />
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </View>
          </View>
        </StandardContainer>
      </TouchableOpacity>
  );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
  <View style={styles.container}>
    <LinearGradient
      colors={theme.colors.backgroundGradient as any}
      style={styles.backgroundGradient}
    />

    <PageHeader
      title="Journal"
      right={
        <View style={styles.headerRight}>
          {streak.currentStreak > 0 && (
            <View style={styles.streakContainerClean}>
              <Text style={styles.flameEmoji}>🔥</Text>
              <Text style={[styles.streakNumber, { color: theme.colors.primaryText }]}>{streak.currentStreak}</Text>
            </View>
          )}
        </View>
      }
    />

    <View style={styles.searchSection}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search entries..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlignVertical="center"
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsRow}
        style={{ marginTop: 12 }}
      >
        {[
          { key: 'all', label: 'All' },
          { key: 'analyzed', label: 'Analyzed' },
          { key: 'unanalyzed', label: 'Unanalyzed' },
          { key: 'favorites', label: ' Favorites' },
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
    gap: 12,
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
    marginLeft: 8,
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
  // Emotional Overview Hero + Dominant Emotions
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
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
    shadowRadius: 16,
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
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
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
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  dominantGradient: {
    padding: 16,
    borderRadius: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.6)',
    minWidth: 120,
  },
  emotionChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  emotionChipValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a78bfa',
  },
  // Search & Filter styles
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    paddingVertical: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 20,
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
  // Emotional Home Header
  emotionalHomeHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
  },
  streakContainerClean: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flameEmoji: {
    fontSize: 18,
  },
  emotionalSubline: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  quickActionTile: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 4,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
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
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: 'rgba(15, 18, 25, 0.98)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sheetHandleWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.5)',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 12,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    marginVertical: 8,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  sheetRowText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e5e7eb',
  },
  sheetRowTextDestructive: {
    color: '#f97373',
  },
  listContent: {
    padding: isTablet ? 40 : 20,
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
    width: isTablet ? 72 : 56,
    height: isTablet ? 72 : 56,
    borderRadius: isTablet ? 36 : 28,
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
    fontSize: sf(32),
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
  },
  streakLabel: {
    fontSize: sf(16),
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
  premiumCardPressable: {
    marginBottom: 12,
  },
  premiumCard: {
  },
  cardGradient: {
    padding: 14,
  },
  entryHeader: {
    marginBottom: 8,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    position: 'relative',
  },
  moodIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
  },
  entryTitleWithIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  moodIndicatorEmoji: {
    fontSize: 20,
  },
  entryTitle: {
    fontSize: sf(20),
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    letterSpacing: -0.3,
  },
  moodBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    alignSelf: 'flex-start',
  },
  insightBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entryContent: {
    fontSize: sf(15),
    color: '#999999',
    lineHeight: sf(22),
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
    borderRadius: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  viewInsightsButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewInsightsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
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
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: sf(20),
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: sf(14),
    color: '#6B6B6B',
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
    width: isTablet ? 80 : 64,
    height: isTablet ? 80 : 64,
    borderRadius: isTablet ? 40 : 32,
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
