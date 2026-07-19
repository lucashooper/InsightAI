import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { filterNotesForDisplayLocale } from '../utils/computeDashboardData';
import { supabase } from '../lib/supabase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePreloadedData } from '../contexts/PreloadContext';
import StandardContainer from '../components/shared/StandardContainer';
import HeroHomeOrb from '../components/shared/HeroHomeOrb';
import FirstTimeIntroOverlay from '../components/FirstTimeIntroOverlay';
import PinnedRoutineCard from '../components/dashboard/PinnedRoutineCard';
import PlaybookQuickAccessCard from '../components/dashboard/PlaybookQuickAccessCard';
import { isTablet, sf, ss, si, iPadContentStyle } from '../utils/responsive';
import { getTodayPrompt, DailyPrompt } from '../data/dailyPrompts';
import { APP_NAME } from '../constants/branding';
// Temporarily disabled for Expo Go testing
// import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
const insightLogo = require('../public/Insight-Logo-nobg.webp');

const { width } = Dimensions.get('window');
const HERO_ORB_SIZE = isTablet ? 600 : 340;

interface EmotionalState {
  mood: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

export default function DashboardScreenNew() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { data: preloaded } = usePreloadedData();
  const navigation = useNavigation<any>();
  const introCheckedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [emotionalState, setEmotionalState] = useState<EmotionalState>({
    mood: 'Balanced',
    score: 7,
    trend: 'stable'
  });
  const [streak, setStreak] = useState(0);
  const [recentPatterns, setRecentPatterns] = useState<string[]>([]);
  const [recentTopics, setRecentTopics] = useState<Array<{emoji: string, text: string, keyword: string, searchTerm: string}>>([]);
  const [todayInsights, setTodayInsights] = useState<Array<{icon: string, iconColor: string, title: string, description: string}>>([]);
  const [hasEntryToday, setHasEntryToday] = useState(false);
  const [userName, setUserName] = useState<string>('there');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showIntroOverlay, setShowIntroOverlay] = useState(false);
  const [dailyPrompt] = useState<DailyPrompt>(getTodayPrompt());

  // Use preloaded data immediately on mount — no network fetch needed
  useEffect(() => {
    if (!preloaded.isLoaded) return;
    if (preloaded.userName) setUserName(preloaded.userName);
    if (preloaded.profilePicture) setProfilePicture(preloaded.profilePicture);
    setLoading(false);
    if (!introCheckedRef.current) {
      introCheckedRef.current = true;
      checkFirstTimeUser();
    }
  }, [preloaded.isLoaded, preloaded.userName, preloaded.profilePicture]);

  // When preloaded notes update, debounce reprocessing to avoid blocking tab navigation
  useEffect(() => {
    if (!preloaded.notes) return;
    const timer = setTimeout(() => {
      processDashboardFromNotes(preloaded.notes!);
      applyTodayInsightsFromNotes(preloaded.notes!);
    }, 200);
    return () => clearTimeout(timer);
  }, [preloaded.notes, language]);

  // Reload username and profile picture from cache when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshProfile = async () => {
        if (!user?.id) return;
        const cachedName =
          (await AsyncStorage.getItem(`CACHED_USERNAME_${user.id}`)) ||
          (await AsyncStorage.getItem('CACHED_USERNAME'));
        const cachedPfp = await AsyncStorage.getItem(`CACHED_PROFILE_PICTURE_${user.id}`);
        if (cachedName && cachedName !== userName) {
          setUserName(cachedName);
        }
        if (cachedPfp) {
          setProfilePicture(cachedPfp);
        }
      };
      refreshProfile();
    }, [user?.id])
  );

  const checkFirstTimeUser = async () => {
    try {
      console.log('[Dashboard] Checking if first-time user...');
      const hasSeenIntro = await AsyncStorage.getItem('HAS_SEEN_DASHBOARD_INTRO');
      const needsEmailSignup = await AsyncStorage.getItem('NEEDS_EMAIL_SIGNUP');
      console.log('[Dashboard] HAS_SEEN_DASHBOARD_INTRO:', hasSeenIntro);
      console.log('[Dashboard] NEEDS_EMAIL_SIGNUP:', needsEmailSignup);
      
      if (!hasSeenIntro) {
        console.log('[Dashboard] First-time user detected, will show intro overlay');
        
        // Check if user needs to complete email signup (and doesn't already have one)
        const userHasEmail = user?.email && !user.email.includes('privaterelay');
        if (needsEmailSignup === 'true' && !userHasEmail) {
          console.log('[Dashboard] User skipped email signup, will show email prompt');
          // Show email signup prompt after a short delay
          setTimeout(() => {
            Alert.alert(
              t('home.welcomeTitle'),
              t('home.welcomeEmail'),
              [
                {
                  text: t('home.addEmail'),
                  onPress: async () => {
                    await AsyncStorage.setItem('HAS_SEEN_DASHBOARD_INTRO', 'true');
                    navigation.navigate('Profile');
                  }
                },
                {
                  text: t('common.later'),
                  style: 'cancel',
                  onPress: async () => {
                    await AsyncStorage.removeItem('NEEDS_EMAIL_SIGNUP');
                    setShowIntroOverlay(true);
                  }
                }
              ]
            );
          }, 1000);
        } else {
          // Show standard intro after a short delay to let dashboard load
          setTimeout(() => {
            console.log('[Dashboard] Showing intro overlay now');
            setShowIntroOverlay(true);
          }, 1000);
        }
      } else {
        console.log('[Dashboard] User has already seen intro, skipping');
      }
    } catch (error) {
      console.log('[Dashboard] Error checking first-time user:', error);
    }
  };

  const handleCloseIntro = async () => {
    try {
      await AsyncStorage.setItem('HAS_SEEN_DASHBOARD_INTRO', 'true');
      setShowIntroOverlay(false);
    } catch (error) {
      console.log('Error saving intro state:', error);
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username, profile_picture_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.username) {
        setUserName(data.username);
        AsyncStorage.setItem('CACHED_USERNAME', data.username);
      } else {
        const cachedName = await AsyncStorage.getItem('CACHED_USERNAME');
        setUserName(cachedName || user.email?.split('@')[0] || 'there');
      }
      
      // Only use profile picture if it's a valid URL (starts with http/https)
      if (data?.profile_picture_url && (data.profile_picture_url.startsWith('http://') || data.profile_picture_url.startsWith('https://'))) {
        setProfilePicture(data.profile_picture_url);
        AsyncStorage.setItem('CACHED_PROFILE_PICTURE', data.profile_picture_url);
      } else {
        const cachedPfp = await AsyncStorage.getItem('CACHED_PROFILE_PICTURE');
        setProfilePicture(cachedPfp || null);
      }
    } catch (error) {
      const cachedName = await AsyncStorage.getItem('CACHED_USERNAME');
      const cachedPfp = await AsyncStorage.getItem('CACHED_PROFILE_PICTURE');
      setUserName(cachedName || user.email?.split('@')[0] || 'there');
      setProfilePicture(cachedPfp || null);
    }
  };

  // Process notes into dashboard state (works with preloaded or refreshed notes)
  const processDashboardFromNotes = (notes: any[]) => {
    try {
      const scoped = filterNotesForDisplayLocale(notes, language);
      const limited = scoped.slice(0, 30);

      // Calculate emotional state from recent entries
      if (limited.length > 0) {
        const recentScores = limited
          .filter(n => n.ai_structured_insights?.wellbeingScore)
          .slice(0, 5)
          .map(n => n.ai_structured_insights.wellbeingScore);

        if (recentScores.length > 0) {
          const avgScore = recentScores.reduce((a: number, b: number) => a + b, 0) / recentScores.length;
          const trend = recentScores.length >= 2 
            ? recentScores[0] > recentScores[recentScores.length - 1] ? 'up' 
            : recentScores[0] < recentScores[recentScores.length - 1] ? 'down' 
            : 'stable'
            : 'stable';

          const mood = avgScore >= 7 ? 'Thriving' 
            : avgScore >= 5 ? 'Balanced' 
            : avgScore >= 3 ? 'Managing' 
            : 'Struggling';

          setEmotionalState({ mood, score: Math.round(avgScore), trend });
        }

        // Extract recent patterns
        const patterns: string[] = [];
        limited.slice(0, 5).forEach(note => {
          if (note.ai_structured_insights?.key_insights) {
            patterns.push(...note.ai_structured_insights.key_insights.slice(0, 1));
          }
        });
        setRecentPatterns(patterns.slice(0, 3));
      }

      // Calculate streak
      const sortedNotes = [...limited].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      let streakCount = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (const note of sortedNotes) {
        const noteDate = new Date(note.created_at);
        noteDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streakCount) {
          streakCount++;
        } else if (daysDiff > streakCount) {
          break;
        }
      }

      setStreak(streakCount);
    } catch (error) {
      console.error('Error processing dashboard notes:', error);
    }
  };

  const startRecording = async () => {
    // Navigate to CreateEntry in voice mode
    navigation.navigate('CreateEntry', { voiceMode: true });
  };

  const stopRecording = async () => {
    setIsRecording(false);
  };

  const applyTodayInsightsFromNotes = (notes: any[]) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.getTime();

      const todayNotes = notes.filter((n) => {
        const created = new Date(n.created_at).getTime();
        return created >= todayStart;
      });

      if (todayNotes.length === 0) {
        setHasEntryToday(false);
        setTodayInsights([]);
        return;
      }

      setHasEntryToday(true);

      const insights: Array<{icon: string, iconColor: string, title: string, description: string}> = [];
      const analyzedToday = todayNotes.find((n) => n.ai_structured_insights);

      if (analyzedToday?.ai_structured_insights) {
        const analysis = analyzedToday.ai_structured_insights;
        const primaryEmotion = analysis.mood_analysis?.primary_emotion;
        const secondaryEmotions = analysis.mood_analysis?.secondary_emotions || [];
        const energyLevel = analysis.mood_analysis?.energy_level;

        let insightText = '';

        if (primaryEmotion) {
          insightText = t('home.feeling', { emotion: primaryEmotion.toLowerCase() });

          if (secondaryEmotions.length > 0) {
            insightText += t('home.withNotes', { emotion: secondaryEmotions[0].toLowerCase() });
          }

          if (energyLevel) {
            if (energyLevel === 'low' || energyLevel === 'very_low') {
              insightText += t('home.lowEnergy');
            } else if (energyLevel === 'high' || energyLevel === 'very_high') {
              insightText += t('home.highEnergy');
            }
          }

          insightText += '.';

          let icon = 'pulse';
          let iconColor = '#8b5cf6';

          if (primaryEmotion.toLowerCase().includes('hop') || primaryEmotion.toLowerCase().includes('excit')) {
            icon = 'trending-up';
            iconColor = '#22c55e';
          } else if (primaryEmotion.toLowerCase().includes('anx') || primaryEmotion.toLowerCase().includes('stress')) {
            icon = 'alert-circle';
            iconColor = '#f59e0b';
          } else if (primaryEmotion.toLowerCase().includes('sad') || primaryEmotion.toLowerCase().includes('down')) {
            icon = 'trending-down';
            iconColor = '#ef4444';
          }

          insights.push({
            icon,
            iconColor,
            title: t('home.emotionalSnapshot'),
            description: insightText,
          });
        }
      }

      setTodayInsights(insights);
    } catch (error) {
      console.error('[HomeInsights] Error:', error);
      setHasEntryToday(false);
      setTodayInsights([]);
    }
  };

  const loadRecentTopics = async () => {
    if (!user) return;
    
    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('content, title, id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // Increased to get better sample

      if (error) {
        console.error('[HomeTopics] Error loading notes:', error);
        setRecentTopics([]);
        return;
      }

      if (!notes || notes.length === 0) {
        console.log('[HomeTopics] No notes found');
        setRecentTopics([]);
        return;
      }

      console.log('[HomeTopics] Analyzing', notes.length, 'notes for topics');

      // Extract topics ONLY if keywords actually exist in entries
      const topicKeywords = [
        { keyword: 'exercise|workout|gym|run|running|fitness|training', emoji: '🏃‍♂️', text: 'Exercise', searchTerm: 'exercise' },
        { keyword: 'relationship|friend|family|love|partner|dating', emoji: '💬', text: 'Relationships', searchTerm: 'relationship' },
        { keyword: 'work|job|career|project|meeting|office|boss', emoji: '💼', text: 'Work', searchTerm: 'work' },
        { keyword: 'meditation|mindful|calm|peace|breathe|zen', emoji: '🧘‍♀️', text: 'Mindfulness', searchTerm: 'meditation' },
        { keyword: 'sleep|tired|rest|dream|insomnia|exhausted', emoji: '😴', text: 'Sleep', searchTerm: 'sleep' },
        { keyword: 'stress|anxiety|worry|nervous|anxious|overwhelm', emoji: '😰', text: 'Stress', searchTerm: 'stress' },
        { keyword: 'happy|joy|excited|great|amazing|wonderful', emoji: '😊', text: 'Happiness', searchTerm: 'happy' },
        { keyword: 'sad|depressed|down|upset|crying|lonely', emoji: '😔', text: 'Sadness', searchTerm: 'sad' },
      ];

      const foundTopics: Array<{emoji: string, text: string, keyword: string, searchTerm: string}> = [];
      
      // Check each note individually to verify keywords exist
      topicKeywords.forEach(topic => {
        const regex = new RegExp(topic.keyword, 'i');
        let matchCount = 0;
        
        notes.forEach(note => {
          const content = ((note.content || '') + ' ' + (note.title || '')).toLowerCase();
          if (regex.test(content)) {
            matchCount++;
          }
        });
        
        // Only add topic if it appears in at least 1 note
        if (matchCount > 0 && foundTopics.length < 4) {
          console.log(`[HomeTopics] Found "${topic.text}" in ${matchCount} notes`);
          foundTopics.push({
            emoji: topic.emoji,
            text: topic.text,
            keyword: topic.keyword,
            searchTerm: topic.searchTerm
          });
        }
      });

      console.log('[HomeTopics] Final topics:', foundTopics.map(t => t.text).join(', ') || 'none');
      setRecentTopics(foundTopics);
    } catch (error) {
      console.error('[HomeTopics] Error:', error);
      setRecentTopics([]);
    }
  };

  // Using MindseraOrb with built-in palette and blur; no explicit colors required

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.colors.backgroundGradient as any}
        style={styles.backgroundGradient}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={insightLogo} style={styles.headerLogo} resizeMode="contain" />
            <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>{APP_NAME}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              onPress={() => setShowStreakModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.streakInline, !isDarkTheme(theme.name) && { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: '#E8E5DC', shadowColor: 'rgba(139, 92, 70, 0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8 }]}>
                <Text style={[styles.streakEmoji, { fontSize: !isDarkTheme(theme.name) ? 16 : 18 }]}>🔥</Text>
                <Text style={[styles.streakCount, { color: theme.colors.primaryText, fontSize: 14, fontWeight: !isDarkTheme(theme.name) ? '700' : '600' }]}>{streak > 0 ? streak : '-'}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.7}
              accessibilityLabel={t('accessibility.openProfile')}
            >
              {profilePicture && (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) ? (
                <Image source={{ uri: profilePicture }} style={styles.profilePicture} resizeMode="cover" />
              ) : (
                <View style={[styles.profilePlaceholder, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)' }]}>
                  <Ionicons name="person" size={20} color={theme.colors.secondaryText} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Orb Section with Centered Greeting — taps to AI Chat */}
        <TouchableOpacity 
          style={styles.orbSection} 
          onPress={() => navigation.navigate('AIChat')}
          activeOpacity={0.85}
        >
          <HeroHomeOrb
            size={HERO_ORB_SIZE}
            isDark={isDarkTheme(theme.name)}
            style={[styles.orbImage, { left: (width - HERO_ORB_SIZE) / 2 }]}
          />
          <View style={styles.greetingInOrb}>
            <Text style={[styles.greetingText, {
              color: '#FFFFFF',
              textShadowColor: isDarkTheme(theme.name) ? 'rgba(0, 0, 0, 0.42)' : 'rgba(61, 31, 72, 0.32)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 10,
            }]}>
              {(() => {
                const hour = new Date().getHours();
                const greeting = hour < 12 ? t('home.goodMorning') : hour < 18 ? t('home.goodAfternoon') : t('home.goodEvening');
                return `${greeting}${userName && userName !== 'there' ? `,\n${userName.charAt(0).toUpperCase() + userName.slice(1)}` : ''}`;
              })()}
            </Text>
          </View>
        </TouchableOpacity>


        {/* Primary Actions */}
        <View style={styles.actionsSection}>
          <View style={styles.actionItem}>
            <TouchableOpacity 
              style={styles.actionCircle}
              onPress={() => navigation.navigate('CreateEntry')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#a78bfa', '#8b5cf6', '#7c3aed']}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={styles.glassmorphicButton}
              >
                <LinearGradient colors={["rgba(255,255,255,0.38)", "rgba(255,255,255,0)"]} start={{x:0.2,y:0}} end={{x:0.75,y:0.9}} style={styles.innerHighlight} pointerEvents="none" />
                <View style={styles.iconWrap}>
                  <Ionicons name="create-outline" size={si(24)} color="#ffffff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: theme.colors.primaryText }]}>{t('home.write')}</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity 
              style={styles.actionCircle}
              onPress={startRecording}
              disabled={isRecording}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isRecording ? ['#f87171', '#ef4444', '#dc2626'] : ['#a78bfa', '#8b5cf6', '#7c3aed']}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={styles.glassmorphicButton}
              >
                <LinearGradient colors={["rgba(255,255,255,0.38)", "rgba(255,255,255,0)"]} start={{x:0.2,y:0}} end={{x:0.75,y:0.9}} style={styles.innerHighlight} pointerEvents="none" />
                <View style={styles.iconWrap}>
                  <Ionicons name={isRecording ? "mic" : "mic-outline"} size={si(24)} color="#ffffff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: theme.colors.primaryText }]}>{isRecording ? t('home.listening') : t('home.speak')}</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity 
              style={styles.actionCircle}
              onPress={() => Alert.alert(t('home.comingSoon'), t('home.scanSoon'))}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#a78bfa', '#8b5cf6', '#7c3aed']}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={styles.glassmorphicButton}
              >
                <LinearGradient colors={["rgba(255,255,255,0.38)", "rgba(255,255,255,0)"]} start={{x:0.2,y:0}} end={{x:0.75,y:0.9}} style={styles.innerHighlight} pointerEvents="none" />
                <View style={styles.iconWrap}>
                  <Ionicons name="scan-outline" size={si(24)} color="#ffffff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: theme.colors.primaryText }]}>{t('home.scan')}</Text>
          </View>
        </View>

        {/* Pinned Protocol from Playbook */}
        {user?.id && (
          <View style={styles.insightsSection}>
            <PinnedRoutineCard userId={user.id} />
          </View>
        )}

        {/* Recent Topics - REMOVED: Not working correctly, will be reimplemented properly */}

        {/* Today's Insights - Data-driven */}
        <View style={styles.insightsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>{t('home.todaysInsights')}</Text>
          {!hasEntryToday ? (
            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateEntry')}
              activeOpacity={0.7}
            >
              <StandardContainer style={[styles.insightCard, { borderColor: theme.colors.border }]}>
              <View style={styles.insightHeader}>
                <Ionicons name="create-outline" size={24} color={theme.colors.secondaryText} />
                <Text style={[styles.insightTitle, { color: theme.colors.primaryText, fontSize: sf(18) }]}>{t('home.noCheckIn')}</Text>
              </View>
              <Text style={[styles.insightText, { color: theme.colors.secondaryText }]}>{t('home.unlockInsights')}</Text>
              <View style={styles.ctaArrow}>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.tertiaryText} />
              </View>
              </StandardContainer>
            </TouchableOpacity>
          ) : todayInsights.length > 0 ? (
            todayInsights.map((insight, index) => (
              <StandardContainer key={index} style={[styles.insightCard, { borderColor: theme.colors.border }]}>
                <View style={styles.insightHeader}>
                  <Ionicons name={insight.icon as any} size={20} color={insight.iconColor} />
                  <Text style={[styles.insightTitle, { color: theme.colors.primaryText }]}>{insight.title}</Text>
                </View>
                <Text style={[styles.insightText, { color: theme.colors.secondaryText }]}>{insight.description}</Text>
              </StandardContainer>
            ))
          ) : (
            <StandardContainer style={[styles.insightCard, { borderColor: theme.colors.border }]}>
              <View style={styles.insightHeader}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <Text style={[styles.insightTitle, { color: theme.colors.primaryText }]}>{t('home.greatStart')}</Text>
              </View>
              <Text style={[styles.insightText, { color: theme.colors.secondaryText }]}>{t('home.journaledToday')}</Text>
            </StandardContainer>
          )}
        </View>

        {/* Daily Prompt */}
        <View style={styles.challengesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>{t('home.todaysPrompt')}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PromptEntry', { promptText: dailyPrompt.prompt + (dailyPrompt.followUp ? `\n\n${dailyPrompt.followUp}` : '') })}
            activeOpacity={0.7}
          >
            <StandardContainer style={[styles.insightCard, { borderColor: theme.colors.border }]}>
            <View style={styles.insightHeader}>
              <Text style={{ fontSize: 22 }}>{dailyPrompt.emoji}</Text>
              <View style={{ flex: 1, marginLeft: 4 }}>
                <Text style={[styles.insightTitle, { color: theme.colors.primaryText, fontSize: sf(15) }]}>{dailyPrompt.prompt}</Text>
                {dailyPrompt.followUp && (
                  <Text style={[styles.insightText, { color: theme.colors.tertiaryText, fontSize: sf(13), marginTop: 4 }]}>{dailyPrompt.followUp}</Text>
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <View style={[styles.compactCta, { borderColor: theme.colors.border, backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                <Text style={[styles.compactCtaText, { color: theme.colors.primaryText }]}>{t('home.startWriting')}</Text>
              </View>
              <View
                style={{
                  marginLeft: 12,
                  backgroundColor: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.15)' : 'rgba(17, 24, 39, 0.08)',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.2)' : 'rgba(17, 24, 39, 0.14)',
                }}
              >
                <Text
                  style={{
                    color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.9)' : 'rgba(17, 24, 39, 0.85)',
                    fontSize: sf(11),
                    fontWeight: '700',
                    textTransform: 'capitalize',
                    letterSpacing: 0.5,
                  }}
                >
                  {dailyPrompt.category.replace('-', ' ')}
                </Text>
              </View>
            </View>
            </StandardContainer>
          </TouchableOpacity>
        </View>

        {/* Suggested Challenges */}
        <View style={styles.challengesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
            {t('home.suggested')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Meditation')} activeOpacity={0.7}>
            <StandardContainer style={[styles.challengeCard, { borderColor: theme.colors.border }]}>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeEmoji}>🧘</Text>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, { color: theme.colors.primaryText }]}>{t('home.meditation')}</Text>
                <Text style={[styles.challengeSubtext, { color: theme.colors.tertiaryText }]}>{t('home.meditationDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.tertiaryText} />
            </StandardContainer>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Gratitude')} activeOpacity={0.7}>
            <StandardContainer style={[styles.challengeCard, { borderColor: theme.colors.border }]}>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeEmoji}>📝</Text>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, { color: theme.colors.primaryText }]}>{t('home.gratitude')}</Text>
                <Text style={[styles.challengeSubtext, { color: theme.colors.tertiaryText }]}>{t('home.gratitudeDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.tertiaryText} />
            </StandardContainer>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AmbientSounds')} activeOpacity={0.7}>
            <StandardContainer style={[styles.challengeCard, { borderColor: theme.colors.border }]}>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeEmoji}>🌧️</Text>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, { color: theme.colors.primaryText }]}>{t('home.ambient')}</Text>
                <Text style={[styles.challengeSubtext, { color: theme.colors.tertiaryText }]}>{t('home.ambientDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.tertiaryText} />
            </StandardContainer>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')} activeOpacity={0.7}>
            <StandardContainer style={[styles.challengeCard, { borderColor: theme.colors.border }]}>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeEmoji}>🔍</Text>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, { color: theme.colors.primaryText }]}>{t('home.articles')}</Text>
                <Text style={[styles.challengeSubtext, { color: theme.colors.tertiaryText }]}>{t('home.articlesDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.tertiaryText} />
            </StandardContainer>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Todo')} activeOpacity={0.7}>
            <StandardContainer style={[styles.challengeCard, { borderColor: theme.colors.border }]}>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeEmoji}>✅</Text>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, { color: theme.colors.primaryText }]}>{t('home.todo')}</Text>
                <Text style={[styles.challengeSubtext, { color: theme.colors.tertiaryText }]}>{t('home.todoDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.tertiaryText} />
            </StandardContainer>
          </TouchableOpacity>
        </View>

        {/* Recent Patterns */}
        {recentPatterns.length > 0 && (
          <View style={styles.patternsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
              {t('home.recentPatterns')}
            </Text>
            {recentPatterns.map((pattern, index) => (
              <View 
                key={index} 
                style={[styles.patternCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
              >
                <Ionicons name="bulb-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.patternText, { color: theme.colors.secondaryText }]}>
                  {pattern}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* First-time user introduction overlay */}
      <FirstTimeIntroOverlay 
        visible={showIntroOverlay}
        onClose={handleCloseIntro}
      />

      {/* Streak Modal */}
      {showStreakModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowStreakModal(false)}
          />
          <View style={styles.streakModalContainer}>
            <View style={styles.streakModalHeader}>
              <View style={styles.streakModalBrand}>
                <Image 
                  source={require('../public/Insight-Logo-nobg.webp')} 
                  style={styles.streakModalLogo}
                />
                <Text style={[styles.streakModalBrandText, { color: theme.colors.primaryText }]}>{APP_NAME}</Text>
              </View>
              <View style={styles.streakModalStreakBadge}>
                <Text style={styles.streakModalStreakEmoji}>🔥</Text>
                <Text style={[styles.streakModalStreakNumber, { color: '#1a1a1a' }]}>{streak}</Text>
              </View>
            </View>

            <View style={styles.streakModalContent}>
              <View style={styles.streakModalIconContainer}>
                <LinearGradient
                  colors={['#FFE5CC', '#FFD9B3', '#FFCC99']}
                  style={styles.streakModalIconGradient}
                >
                  <Text style={styles.streakModalFireIcon}>🔥</Text>
                  <Text style={styles.streakModalSparkle}>✨</Text>
                  <Text style={styles.streakModalSparkle2}>✨</Text>
                </LinearGradient>
              </View>

              <Text style={[styles.streakModalTitle, { color: '#E89B6C' }]}>
                {t('home.dayStreak', { count: streak })}
              </Text>

              <View style={styles.streakModalCalendar}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <View key={index} style={styles.streakModalDayContainer}>
                    <Text style={[styles.streakModalDayLabel, { color: theme.colors.tertiaryText }]}>{day}</Text>
                    <View style={[
                      styles.streakModalDayCircle,
                      index < streak && { backgroundColor: theme.colors.primary }
                    ]} />
                  </View>
                ))}
              </View>

              <Text style={[styles.streakModalMessage, { color: theme.colors.secondaryText }]}>
                {t('home.streakMessage')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.streakModalButton, { backgroundColor: theme.colors.primaryText }]}
              onPress={() => setShowStreakModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.streakModalButtonText}>{t('common.continue')}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 32 : 8,
    paddingTop: isTablet ? 60 : 50,
    paddingBottom: isTablet ? 28 : 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 100,
    height: 100,
  },
  headerTitle: {
    fontSize: sf(20),
    fontWeight: '500',
    letterSpacing: 0.3,
    marginLeft: -12,
  },
  logoIcon: {
    width: isTablet ? 80 : 64,
    height: isTablet ? 80 : 64,
    borderRadius: isTablet ? 16 : 12,
  },
  brandText: {
    fontSize: sf(24),
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profilePictureContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  profileGradientBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicture: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profilePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingInOrb: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: isTablet ? 20 : 10,
    height: isTablet ? 600 : 340,
    justifyContent: 'center',
    paddingHorizontal: isTablet ? 48 : 32,
  },
  greeting: {
    fontSize: sf(16),
    marginBottom: isTablet ? 12 : 8,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  userName: {
    fontSize: sf(32),
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  greetingText: {
    fontSize: isTablet ? 56 : 33,
    fontWeight: '600',
    letterSpacing: isTablet ? -0.4 : -0.25,
    textAlign: 'center',
    lineHeight: isTablet ? 68 : 41,
  },
  iconButton: {
    width: isTablet ? 56 : 44,
    height: isTablet ? 56 : 44,
    borderRadius: isTablet ? 28 : 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: isTablet ? 640 : 360,
    position: 'relative',
    marginBottom: isTablet ? 40 : 20,
  },
  orbLoader: {
    position: 'absolute',
    top: 180,
  },
  orbImage: {
    position: 'absolute',
    top: isTablet ? 20 : 10,
  },
  orbContent: {
    alignItems: 'center',
    gap: 12,
  },
  orbMood: {
    fontSize: sf(28),
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  orbScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  orbScore: {
    fontSize: sf(52),
    fontWeight: '300',
    letterSpacing: -1,
  },
  orbScoreMax: {
    fontSize: sf(18),
    fontWeight: '300',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 24,
  },
  streakEmoji: {
    fontSize: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: isTablet ? 60 : 36,
    gap: isTablet ? 40 : 24,
    marginBottom: isTablet ? 48 : 32,
    justifyContent: 'center',
  },
  actionItem: {
    alignItems: 'center',
    gap: isTablet ? 14 : 10,
  },
  actionCircle: {
    width: isTablet ? 88 : 64,
    height: isTablet ? 88 : 64,
    borderRadius: isTablet ? 44 : 32,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  glassmorphicButton: {
    width: '100%',
    height: '100%',
    borderRadius: isTablet ? 44 : 32,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  blurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  innerHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  iconWrap: {
    position: 'relative',
    zIndex: 1,
  },
  actionLabel: {
    fontSize: sf(14),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  patternsSection: {
    paddingHorizontal: isTablet ? 56 : 24,
  },
  sectionTitle: {
    fontSize: sf(20),
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: sf(24),
    marginBottom: isTablet ? 20 : 16,
  },
  patternCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isTablet ? 16 : 12,
    padding: isTablet ? 20 : 16,
    borderRadius: isTablet ? 16 : 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  patternText: {
    flex: 1,
    fontSize: sf(14),
    lineHeight: sf(20),
  },
  streakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakCount: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  moodLabelSection: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 32,
  },
  moodLabel: {
    fontSize: sf(24),
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  moodSubtext: {
    fontSize: sf(13),
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  recentTopicsSection: {
    paddingHorizontal: isTablet ? 56 : 24,
    marginBottom: isTablet ? 40 : 32,
  },
  topicsScroll: {
    marginTop: 12,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  topicChipGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    marginRight: 12,
  },
  topicEmoji: {
    fontSize: 14,
  },
  topicText: {
    fontSize: sf(13),
    fontWeight: '600',
  },
  insightsSection: {
    paddingHorizontal: isTablet ? 56 : 24,
    marginBottom: isTablet ? 40 : 32,
    gap: 4,
  },
  insightCard: {
    padding: isTablet ? 20 : 18,
    marginTop: 8,
    borderRadius: 18,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: sf(17),
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: sf(21),
  },
  insightText: {
    fontSize: sf(13),
    lineHeight: sf(19),
  },
  challengesSection: {
    paddingHorizontal: isTablet ? 56 : 24,
    marginBottom: isTablet ? 40 : 32,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isTablet ? 20 : 16,
    marginTop: 12,
  },
  compactCta: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  compactCtaText: {
    fontSize: sf(13),
    fontWeight: '600',
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  challengeEmoji: {
    fontSize: isTablet ? 36 : 28,
  },
  challengeInfo: {
    flex: 1,
    minWidth: 0,
  },
  challengeTitle: {
    fontSize: sf(17),
    fontWeight: '600',
    marginBottom: 2,
  },
  challengeSubtext: {
    fontSize: sf(12),
    lineHeight: sf(16),
  },
  noEntryCard: {
    position: 'relative',
  },
  ctaArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  streakModalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  streakModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  streakModalBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakModalLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  streakModalBrandText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  streakModalStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakModalStreakEmoji: {
    fontSize: 20,
  },
  streakModalStreakNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  streakModalContent: {
    alignItems: 'center',
  },
  streakModalIconContainer: {
    marginBottom: 20,
  },
  streakModalIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  streakModalFireIcon: {
    fontSize: 60,
  },
  streakModalSparkle: {
    position: 'absolute',
    top: 10,
    right: 15,
    fontSize: 24,
  },
  streakModalSparkle2: {
    position: 'absolute',
    bottom: 15,
    left: 10,
    fontSize: 20,
  },
  streakModalTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  streakModalCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  streakModalDayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  streakModalDayLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  streakModalDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8E5DC',
  },
  streakModalMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  streakModalButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  streakModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Patterns to Address & What's Working
  ptaSection: {
    paddingHorizontal: isTablet ? 32 : 20,
    marginTop: 8,
  },
  wkSection: {
    paddingHorizontal: isTablet ? 32 : 20,
    marginTop: 8,
  },
  patternsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  patternsSectionSub: {
    fontSize: sf(13),
    marginBottom: 12,
  },
  ptaCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  ptaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ptaPriorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  ptaPriorityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ptaText: {
    fontSize: sf(14),
    lineHeight: sf(21),
    marginBottom: 12,
  },
  ptaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ptaCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ptaCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ptaFrom: {
    fontSize: sf(12),
    flex: 1,
  },
  ptaViewAll: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  ptaViewAllText: {
    fontSize: sf(14),
    fontWeight: '600',
  },
  workingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
});
