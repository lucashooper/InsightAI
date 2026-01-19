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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
// TODO: Uncomment when using development build (not Expo Go)
// import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
const orbImage = require('../public/InsightAI-Orb.png');

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

  useEffect(() => {
    loadDashboardData();
    loadUserProfile();
    loadRecentTopics();
    loadTodayInsights();

    // TODO: Uncomment when using development build (not Expo Go)
    // Check speech recognition availability
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
      } else {
        setUserName(user.email?.split('@')[0] || 'there');
      }
      
      if (data?.profile_picture_url) {
        setProfilePicture(data.profile_picture_url);
      }
    } catch (error) {
      setUserName(user.email?.split('@')[0] || 'there');
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

  // TODO: Uncomment when using development build (not Expo Go)
  // Speech-to-text implementation ready for development build
  const startRecording = async () => {
    // Placeholder for Expo Go - shows coming soon message
    Alert.alert(
      'Coming Soon',
      'Voice journaling will be available when you create a development build. This feature requires native modules that are not available in Expo Go.',
      [
        { text: 'OK' },
        { text: 'Learn More', onPress: () => console.log('See: https://docs.expo.dev/develop/development-builds/introduction/') }
      ]
    );
    
    /* DEVELOPMENT BUILD CODE - Uncomment when ready:
    try {
      setRecognizedText('');
      setIsRecording(true);
      
      const result = await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
      });
      
      console.log('Speech recognition started:', result);
      
      // Listen for results
      const timeout = setTimeout(() => {
        stopRecording();
      }, 10000); // 10 second timeout
      
    } catch (error) {
      console.error('Error with voice recognition:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Could not start voice recognition. Please check microphone permissions.');
    }
    */
  };

  const stopRecording = async () => {
    /* DEVELOPMENT BUILD CODE - Uncomment when ready:
    try {
      await ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
      
      if (recognizedText) {
        navigation.navigate('CreateEntry', { initialContent: recognizedText });
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      setIsRecording(false);
    }
    */
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
        colors={theme.colors.backgroundGradient}
        style={styles.backgroundGradient}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Profile Picture */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.profilePictureContainer}
            onPress={() => {
              console.log('[NAV] PFP tapped -> Settings');
              navigation.navigate('Settings');
            }}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.6)', 'rgba(99, 102, 241, 0.4)']}
              style={styles.profileGradientBorder}
            >
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Ionicons name="person" size={24} color="rgba(255, 255, 255, 0.6)" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.headerIcons}>
            <View style={styles.streakInline}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakCount}>{streak}</Text>
            </View>
          </View>
        </View>

        {/* Orb Section with Centered Greeting */}
        <View style={styles.orbSection}>
          <Animated.Image 
            source={orbImage} 
            style={[
              styles.orbImage,
              {
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }
            ]}
            resizeMode="contain"
          />
          <View style={styles.greetingInOrb}>
            <Text style={styles.greetingText}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
            </Text>
          </View>
        </View>


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
                  <Ionicons name="create-outline" size={24} color="rgba(255, 255, 255, 0.98)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: 'rgba(255, 255, 255, 0.8)' }]}>Write</Text>
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
                  <Ionicons name={isRecording ? "mic" : "mic-outline"} size={24} color="rgba(255, 255, 255, 0.98)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: 'rgba(255, 255, 255, 0.8)' }]}>{isRecording ? 'Listening...' : 'Speak'}</Text>
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
                  <Ionicons name="scan-outline" size={24} color="rgba(255, 255, 255, 0.98)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.actionLabel, { color: 'rgba(255, 255, 255, 0.8)' }]}>Scan</Text>
          </View>
        </View>

        {/* Recent Topics - REMOVED: Not working correctly, will be reimplemented properly */}

        {/* Today's Insights - Data-driven */}
        <View style={styles.insightsSection}>
          <Text style={[styles.sectionTitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
            Today's insights
          </Text>
          {!hasEntryToday ? (
            <TouchableOpacity
              style={[styles.insightCard, styles.noEntryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => {
                console.log('[HomeInsights] No entry CTA tapped -> CreateEntry');
                navigation.navigate('CreateEntry');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.insightHeader}>
                <Ionicons name="create-outline" size={24} color="#8b5cf6" />
                <Text style={[styles.insightTitle, { color: 'rgba(255, 255, 255, 0.95)', fontSize: 18 }]}>No check-in yet</Text>
              </View>
              <Text style={[styles.insightText, { color: 'rgba(255, 255, 255, 0.6)' }]}>Write now to unlock insights</Text>
              <View style={styles.ctaArrow}>
                <Ionicons name="arrow-forward" size={20} color="#8b5cf6" />
              </View>
            </TouchableOpacity>
          ) : todayInsights.length > 0 ? (
            todayInsights.map((insight, index) => (
              <View key={index} style={[styles.insightCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.insightHeader}>
                  <Ionicons name={insight.icon as any} size={20} color={insight.iconColor} />
                  <Text style={[styles.insightTitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>{insight.title}</Text>
                </View>
                <Text style={[styles.insightText, { color: 'rgba(255, 255, 255, 0.5)' }]}>{insight.description}</Text>
              </View>
            ))
          ) : (
            <View style={[styles.insightCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.insightHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text style={[styles.insightTitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>Great start!</Text>
              </View>
              <Text style={[styles.insightText, { color: 'rgba(255, 255, 255, 0.5)' }]}>You've checked in today. Keep journaling to unlock more insights.</Text>
            </View>
          )}
        </View>

        {/* Suggested Challenges */}
        <View style={styles.challengesSection}>
          <Text style={[styles.sectionTitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
            Suggested for you
          </Text>
          <TouchableOpacity 
            style={[styles.challengeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Meditation')}
            activeOpacity={0.7}
          >
            <View style={styles.challengeContent}>
              <Text style={styles.challengeEmoji}>🧘</Text>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, { color: 'rgba(255, 255, 255, 0.95)' }]}>5-minute meditation</Text>
                <Text style={[styles.challengeSubtext, { color: 'rgba(255, 255, 255, 0.4)' }]}>Start your day mindfully</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.challengeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Gratitude')}
            activeOpacity={0.7}
          >
            <View style={styles.challengeContent}>
              <Text style={styles.challengeEmoji}>📝</Text>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, { color: 'rgba(255, 255, 255, 0.95)' }]}>Gratitude practice</Text>
                <Text style={[styles.challengeSubtext, { color: 'rgba(255, 255, 255, 0.4)' }]}>List 3 things you're grateful for</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
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
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingInOrb: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  greetingText: {
    fontSize: 32,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.98)',
    letterSpacing: 1.2,
    textAlign: 'center',
    lineHeight: 42,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 360,
    position: 'relative',
    marginBottom: 20,
  },
  orbImage: {
    width: 320,
    height: 320,
    position: 'absolute',
    top: 20,
  },
  orbContent: {
    alignItems: 'center',
    gap: 12,
  },
  orbMood: {
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  orbScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  orbScore: {
    fontSize: 52,
    fontWeight: '300',
    letterSpacing: -1,
  },
  orbScoreMax: {
    fontSize: 18,
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
    paddingHorizontal: 36,
    gap: 24,
    marginBottom: 32,
    justifyContent: 'center',
  },
  actionItem: {
    alignItems: 'center',
    gap: 10,
  },
  actionCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  patternsSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  patternCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  patternText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  moodSubtext: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  recentTopicsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
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
    fontSize: 13,
    fontWeight: '600',
  },
  insightsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
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
    fontSize: 15,
    fontWeight: '600',
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  challengesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
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
    fontSize: 28,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  challengeSubtext: {
    fontSize: 12,
    lineHeight: 16,
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
});
