import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StandardContainer from '../components/shared/StandardContainer';
import FirstTimeIntroOverlay from '../components/FirstTimeIntroOverlay';
import { isTablet, sf, ss, si, iPadContentStyle } from '../utils/responsive';
import { getTodayPrompt, DailyPrompt } from '../data/dailyPrompts';
// Temporarily disabled for Expo Go testing
// import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
const orbImage = require('../public/InsightAI-Orb.png');
const insightLogo = require('../public/Insight-Logo-nobg.webp');

const { width } = Dimensions.get('window');

interface EmotionalState {
  mood: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

export default function DashboardScreenNew() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [orbImageLoaded, setOrbImageLoaded] = useState(false);
  const navigation = useNavigation<any>();
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

  // Reload username from cache when screen comes into focus (instant Settings updates)
  useFocusEffect(
    React.useCallback(() => {
      const refreshName = async () => {
        const cachedName = await AsyncStorage.getItem('CACHED_USERNAME');
        if (cachedName && cachedName !== userName) {
          setUserName(cachedName);
        }
      };
      refreshName();
    }, [])
  );

  useEffect(() => {
    loadDashboardData();
    loadUserProfile();
    loadRecentTopics();
    loadTodayInsights();
    checkFirstTimeUser();

    // Check speech recognition availability (disabled for Expo Go)
    // const checkPermissions = async () => {
    //   try {
    //     const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    //     console.log('Speech recognition permissions:', result);
    //   } catch (error) {
    //     console.log('Speech recognition not available:', error);
    //   }
    // };
    // checkPermissions();

    return () => {
      // Cleanup if needed
    };
  }, [user]);

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
              'Welcome to Insight! 🎉',
              'To get the most out of Insight and ensure you never lose access to your journal, please add your email address.',
              [
                {
                  text: 'Add Email',
                  onPress: () => {
                    // Navigate to email signup
                    navigation.navigate('Settings');
                  }
                },
                {
                  text: 'Later',
                  style: 'cancel',
                  onPress: async () => {
                    await AsyncStorage.removeItem('NEEDS_EMAIL_SIGNUP');
                    await AsyncStorage.setItem('HAS_SEEN_DASHBOARD_INTRO', 'true');
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

  useEffect(() => {
    // Subtle slow rotation animation (45s cycle)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 45000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

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

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Calculate emotional state from recent entries
      if (notes && notes.length > 0) {
        const recentScores = notes
          .filter(n => n.ai_structured_insights?.wellbeingScore)
          .slice(0, 5)
          .map(n => n.ai_structured_insights.wellbeingScore);

        if (recentScores.length > 0) {
          const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
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
        notes.slice(0, 5).forEach(note => {
          if (note.ai_structured_insights?.key_insights) {
            patterns.push(...note.ai_structured_insights.key_insights.slice(0, 1));
          }
        });
        setRecentPatterns(patterns.slice(0, 3));
      }

      // Calculate streak
      const sortedNotes = notes?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [];
      
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
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    // Navigate to CreateEntry in voice mode
    navigation.navigate('CreateEntry', { voiceMode: true });
  };

  const stopRecording = async () => {
    setIsRecording(false);
  };

  const loadTodayInsights = async () => {
    if (!user) return;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayNotes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[HomeInsights] Error loading today entries:', error);
        setHasEntryToday(false);
        setTodayInsights([]);
        return;
      }

      console.log('[HomeInsights] Today entries count:', todayNotes?.length || 0);
      
      if (!todayNotes || todayNotes.length === 0) {
        setHasEntryToday(false);
        setTodayInsights([]);
        return;
      }

      setHasEntryToday(true);

      // Pull insights from ACTUAL AI analysis (ai_structured_insights)
      const insights: Array<{icon: string, iconColor: string, title: string, description: string}> = [];

      // Get most recent analyzed entry from today
      const analyzedToday = todayNotes.find(n => n.ai_structured_insights);
      
      if (analyzedToday && analyzedToday.ai_structured_insights) {
        const analysis = analyzedToday.ai_structured_insights;
        console.log('[HomeInsights] Found analyzed entry:', analyzedToday.id);
        
        // Extract emotional trend from mood_analysis
        const primaryEmotion = analysis.mood_analysis?.primary_emotion;
        const secondaryEmotions = analysis.mood_analysis?.secondary_emotions || [];
        const wellbeingScore = analysis.wellbeingScore;
        const energyLevel = analysis.mood_analysis?.energy_level;
        
        // Build insight from actual analysis data
        let insightText = '';
        
        if (primaryEmotion) {
          insightText = `You're feeling ${primaryEmotion.toLowerCase()}`;
          
          // Add context from secondary emotions or energy
          if (secondaryEmotions.length > 0) {
            insightText += `, with notes of ${secondaryEmotions[0].toLowerCase()}`;
          }
          
          // Add energy context if available
          if (energyLevel) {
            if (energyLevel === 'low' || energyLevel === 'very_low') {
              insightText += ', but low energy is holding you back';
            } else if (energyLevel === 'high' || energyLevel === 'very_high') {
              insightText += ', with strong energy driving you forward';
            }
          }
          
          insightText += '.';
          
          // Determine icon based on emotion
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
            title: 'Emotional snapshot',
            description: insightText
          });
        }
        
        console.log('[HomeInsights] Generated from AI analysis:', insights.length);
      } else {
        console.log('[HomeInsights] No analyzed entry today yet');
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
            <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>Insight</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowStreakModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.streakInline, theme.name === 'light' && { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: '#E8E5DC', shadowColor: 'rgba(139, 92, 70, 0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8 }]}>
              <Text style={[styles.streakEmoji, { fontSize: theme.name === 'light' ? 16 : 18 }]}>🔥</Text>
              <Text style={[styles.streakCount, { color: theme.colors.primaryText, fontSize: theme.name === 'light' ? 14 : 14, fontWeight: theme.name === 'light' ? '700' : '600' }]}>{streak > 0 ? streak : '-'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Orb Section with Centered Greeting — taps to AI Chat */}
        <TouchableOpacity 
          style={styles.orbSection} 
          onPress={() => navigation.navigate('AIChat')}
          activeOpacity={0.85}
        >
          {!orbImageLoaded && (
            <ActivityIndicator 
              size="large" 
              color="#a855f7" 
              style={styles.orbLoader}
            />
          )}
          <Animated.Image 
            source={orbImage} 
            style={[
              styles.orbImage,
              {
                opacity: orbImageLoaded ? 1 : 0,
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }
            ]}
            resizeMode="contain"
            onLoad={() => setOrbImageLoaded(true)}
          />
          <View style={styles.greetingInOrb}>
            <Text style={[styles.greetingText, { 
              color: '#FFFFFF',
              textShadowColor: theme.name === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
              fontWeight: '400',
              letterSpacing: 0.5
            }]}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}{userName && userName !== 'there' ? `,\n${userName.charAt(0).toUpperCase() + userName.slice(1)}` : ''}
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
                colors={['rgba(139, 92, 246, 0.5)', 'rgba(124, 58, 237, 0.4)']}
                style={styles.glassmorphicButton}
              >
                <LinearGradient colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"]} start={{x:0.2,y:0}} end={{x:0.8,y:1}} style={styles.innerHighlight} pointerEvents="none" />
                <View style={styles.iconWrap}>
                  <Ionicons name="create-outline" size={si(24)} color="rgba(255, 255, 255, 0.98)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: theme.colors.primaryText }]}>Write</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity 
              style={styles.actionCircle}
              onPress={startRecording}
              disabled={isRecording}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isRecording ? ['rgba(239, 68, 68, 0.5)', 'rgba(220, 38, 38, 0.4)'] : ['rgba(139, 92, 246, 0.5)', 'rgba(124, 58, 237, 0.4)']}
                style={styles.glassmorphicButton}
              >
                <LinearGradient colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"]} start={{x:0.2,y:0}} end={{x:0.8,y:1}} style={styles.innerHighlight} pointerEvents="none" />
                <View style={styles.iconWrap}>
                  <Ionicons name={isRecording ? "mic" : "mic-outline"} size={si(24)} color="rgba(255, 255, 255, 0.98)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: theme.colors.primaryText }]}>{isRecording ? 'Listening...' : 'Speak'}</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity 
              style={styles.actionCircle}
              onPress={() => Alert.alert('Coming Soon', 'Document scanning will be available soon!')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.5)', 'rgba(124, 58, 237, 0.4)']}
                style={styles.glassmorphicButton}
              >
                <LinearGradient colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"]} start={{x:0.2,y:0}} end={{x:0.8,y:1}} style={styles.innerHighlight} pointerEvents="none" />
                <View style={styles.iconWrap}>
                  <Ionicons name="scan-outline" size={si(24)} color="rgba(255, 255, 255, 0.98)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: theme.colors.primaryText }]}>Scan</Text>
          </View>
        </View>

        {/* Recent Topics - REMOVED: Not working correctly, will be reimplemented properly */}

        {/* Today's Insights - Data-driven */}
        <View style={styles.insightsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>Today's insights</Text>
          {!hasEntryToday ? (
            <TouchableOpacity 
              style={[styles.insightCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
              onPress={() => navigation.navigate('CreateEntry')}
              activeOpacity={0.7}
            >
              <View style={styles.insightHeader}>
                <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.insightTitle, { color: theme.colors.primaryText, fontSize: sf(18) }]}>No check-in yet</Text>
              </View>
              <Text style={[styles.insightText, { color: theme.colors.secondaryText }]}>Write now to unlock insights</Text>
              <View style={styles.ctaArrow}>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.tertiaryText} />
              </View>
            </TouchableOpacity>
          ) : todayInsights.length > 0 ? (
            todayInsights.map((insight, index) => (
              <View key={index} style={[styles.insightCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                <View style={styles.insightHeader}>
                  <Ionicons name={insight.icon as any} size={20} color={insight.iconColor} />
                  <Text style={[styles.insightTitle, { color: theme.colors.primaryText }]}>{insight.title}</Text>
                </View>
                <Text style={[styles.insightText, { color: theme.colors.secondaryText }]}>{insight.description}</Text>
              </View>
            ))
          ) : (
            <View style={[styles.insightCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
              <View style={styles.insightHeader}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <Text style={[styles.insightTitle, { color: theme.colors.primaryText }]}>Great start!</Text>
              </View>
              <Text style={[styles.insightText, { color: theme.colors.secondaryText }]}>You've journaled today. Keep it up!</Text>
            </View>
          )}
        </View>

        {/* Daily Prompt */}
        <View style={styles.challengesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>Today's prompt</Text>
          <TouchableOpacity
            style={[styles.insightCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('CreateEntry', { prefillPrompt: dailyPrompt.prompt + (dailyPrompt.followUp ? `\n\n${dailyPrompt.followUp}` : '') })}
            activeOpacity={0.7}
          >
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
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20 }}
              >
                <Text style={{ color: '#ffffff', fontSize: sf(13), fontWeight: '600' }}>Start writing →</Text>
              </LinearGradient>
              <View style={{ marginLeft: 12, backgroundColor: 'rgba(139, 92, 246, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#8b5cf6', fontSize: sf(11), fontWeight: '600', textTransform: 'capitalize' }}>{dailyPrompt.category.replace('-', ' ')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Suggested Challenges */}
        <View style={styles.challengesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
            Suggested for you
          </Text>
          <TouchableOpacity 
            style={[styles.challengeCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Meditation')}
            activeOpacity={0.7}
          >
            <View style={styles.challengeContent}>
              <Text style={styles.challengeEmoji}>🧘</Text>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, { color: theme.colors.primaryText }]}>5-minute meditation</Text>
                <Text style={[styles.challengeSubtext, { color: theme.colors.tertiaryText }]}>Start your day mindfully</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.tertiaryText} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.challengeCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Gratitude')}
            activeOpacity={0.7}
          >
            <View style={styles.challengeContent}>
              <Text style={styles.challengeEmoji}>📝</Text>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, { color: theme.colors.primaryText }]}>Gratitude practice</Text>
                <Text style={[styles.challengeSubtext, { color: theme.colors.tertiaryText }]}>List 3 things you're grateful for</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.tertiaryText} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.challengeCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('AmbientSounds')}
            activeOpacity={0.7}
          >
            <View style={styles.challengeContent}>
              <Text style={styles.challengeEmoji}>🌧️</Text>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, { color: theme.colors.primaryText }]}>Ambient sounds</Text>
                <Text style={[styles.challengeSubtext, { color: theme.colors.tertiaryText }]}>Relax with calming nature sounds</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.tertiaryText} />
          </TouchableOpacity>
        </View>

        {/* Recent Patterns */}
        {recentPatterns.length > 0 && (
          <View style={styles.patternsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
              Recent Patterns
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
                <Text style={[styles.streakModalBrandText, { color: theme.colors.primaryText }]}>Insight</Text>
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
                {streak} Day streak
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
                You're building momentum! The more you journal, the deeper your self-understanding grows.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.streakModalButton, { backgroundColor: theme.colors.primaryText }]}
              onPress={() => setShowStreakModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.streakModalButtonText}>Continue</Text>
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
    fontSize: sf(24),
    fontWeight: '700',
    letterSpacing: 0.5,
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
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profilePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingInOrb: {
    alignItems: 'center',
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
    fontSize: isTablet ? 52 : 28,
    fontWeight: '600',
    letterSpacing: 1.2,
    textAlign: 'center',
    lineHeight: isTablet ? 62 : 36,
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
    width: isTablet ? 580 : 320,
    height: isTablet ? 580 : 320,
    position: 'absolute',
    top: isTablet ? 30 : 20,
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
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  glassmorphicButton: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: sf(11),
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  patternsSection: {
    paddingHorizontal: isTablet ? 56 : 24,
  },
  sectionTitle: {
    fontSize: sf(20),
    fontWeight: '700',
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
  },
  insightCard: {
    padding: isTablet ? 20 : 16,
    borderRadius: isTablet ? 16 : 12,
    borderWidth: 1,
    marginTop: 12,
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
  },
  insightText: {
    fontSize: sf(13),
    lineHeight: sf(18),
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
    borderRadius: isTablet ? 16 : 12,
    borderWidth: 1,
    marginTop: 12,
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
});
