import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Animated,
  Modal,
  ImageBackground,
  ActionSheetIOS,
  Platform,
  Alert,
  InteractionManager,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { mobileAiService } from '../services/mobileAiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePreloadedData } from '../contexts/PreloadContext';
import StandardContainer from '../components/shared/StandardContainer';
import PremiumButton from '../components/shared/PremiumButton';
import PremiumGradientText from '../components/shared/PremiumGradientText';
import DashboardHeaderHero from '../components/dashboard/DashboardHeaderHero';
import EmptyState from '../components/shared/EmptyState';
import { DashboardSkeleton } from '../components/shared/SkeletonBlock';
import { isTablet, sf, ss, iPadWideContentStyle } from '../utils/responsive';
import { yieldToUI } from '../utils/yieldToUI';
import { notesSignature, computeDeferredDashboardData, filterNotesForDisplayLocale } from '../utils/computeDashboardData';
import { sectionSubtitleForItems } from '../utils/patternGrouping';
import {
  getDashboardDeferredCache,
  setDashboardDeferredCache,
} from '../utils/dashboardCache';
import { navigateToPlaybook } from '../utils/navigateToPlaybook';
import { setPlaybookPrefill } from '../utils/playbookPrefill';
import {
  clearPatternAction,
  getPatternKey,
  isPatternHidden,
  isPatternWorking,
  loadPatternActions,
  setPatternAction,
  type PatternAction,
} from '../services/patternActionsService';
import { translateEmotion } from '../i18n/labels';
import * as Haptics from 'expo-haptics';

const screenWidth = Dimensions.get('window').width;
const SHOW_DASHBOARD_STORY_SECTIONS = false;

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
  const { t, formatDate, language } = useLanguage();
  const labelEmotion = (emotion: string) => translateEmotion(t, emotion);
  const isFocused = useIsFocused();
  const { data: preloaded } = usePreloadedData();
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
  const [monthlyStory, setMonthlyStory] = useState<string>('');
  const [showPatternsSection, setShowPatternsSection] = useState(false);
  const patternsScrollRef = useRef<any>(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [showFullStory, setShowFullStory] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState<number | null>(null);
  const [rememberWhenCard, setRememberWhenCard] = useState<{
    emotion: string;
    topic: string;
    date: string;
    strategy: string;
    entryId: string;
  } | null>(null);
  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<{
    totalReflections: number;
    longestStreak: number;
    bestDay: { date: string; score: number } | null;
    avgResilience: number;
    avgWellbeing: number;
  } | null>(null);
  const [narrativeHighlights, setNarrativeHighlights] = useState<{
    strongestResilience: { date: string; title: string; entryId: string } | null;
    keyTheme: { theme: string; count: number } | null;
    newStrategy: string | null;
  } | null>(null);
  const [patternsToAddress, setPatternsToAddress] = useState<any[]>([]);
  const [whatsWorking, setWhatsWorking] = useState<any[]>([]);
  const [patternsExpanded, setPatternsExpanded] = useState(false);
  const [workingPatternsExpanded, setWorkingPatternsExpanded] = useState(false);
  const [patternActions, setPatternActions] = useState<Record<string, PatternAction>>({});
  const [workingExpanded, setWorkingExpanded] = useState(false);
  const [aggregateStrengths, setAggregateStrengths] = useState<any[]>([]);
  const [aggregateGrowth, setAggregateGrowth] = useState<any[]>([]);
  const [strengthsExpanded, setStrengthsExpanded] = useState(false);
  const [growthExpanded, setGrowthExpanded] = useState(false);
  const [monthlyStrengths, setMonthlyStrengths] = useState<Array<{summary: string; count: number; entries: string[]}>>([]);
  const [monthlyGrowthAreas, setMonthlyGrowthAreas] = useState<Array<{summary: string; count: number; entries: string[]}>>([]);
  const [strengthsSectionExpanded, setStrengthsSectionExpanded] = useState(false);
  const [growthSectionExpanded, setGrowthSectionExpanded] = useState(false);
  const [userName, setUserName] = useState<string>('');

  const chartOpacity = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  
  // Modal animation values
  const modalBackgroundOpacity = useRef(new Animated.Value(0)).current;
  const modalTitleTranslateY = useRef(new Animated.Value(-20)).current;
  const modalContentOpacity = useRef(new Animated.Value(0)).current;
  const modalCard1TranslateY = useRef(new Animated.Value(30)).current;
  const modalCard2TranslateY = useRef(new Animated.Value(30)).current;
  const loadGenRef = useRef(0);
  const deferredLoadedRef = useRef(false);
  const lastLoadedSigRef = useRef<string | null>(null);

  const reloadPatternActions = useCallback(async () => {
    setPatternActions(await loadPatternActions());
  }, []);

  useEffect(() => {
    if (isFocused) {
      reloadPatternActions();
    }
  }, [isFocused, reloadPatternActions]);

  const visiblePatternsToAddress = patternsToAddress.filter(
    (pattern) => !isPatternHidden(patternActions[getPatternKey(pattern.summary)]),
  );
  const workingPatterns = patternsToAddress.filter((pattern) =>
    isPatternWorking(patternActions[getPatternKey(pattern.summary)]),
  );

  const handlePatternWorkingToggle = async (pattern: any) => {
    const key = getPatternKey(pattern.summary);
    const current = patternActions[key];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPatternWorking(current)) {
      setPatternActions(await clearPatternAction(pattern.summary));
      return;
    }
    setPatternActions(await setPatternAction(pattern.summary, 'working'));
  };

  const handleAddPatternToPlaybook = async (pattern: any) => {
    await setPlaybookPrefill(pattern.summary, pattern.description || pattern.summary);
    await setPatternAction(pattern.summary, 'working');
    setPatternActions(await loadPatternActions());
    navigateToPlaybook(navigation);
  };

  const handleDismissPattern = async (pattern: any) => {
    setPatternActions(await setPatternAction(pattern.summary, 'dismissed'));
  };

  const handleResolvePattern = async (pattern: any) => {
    setPatternActions(await setPatternAction(pattern.summary, 'resolved'));
  };

  const showPatternActionMenu = (pattern: any) => {
    const options = [
      t('dashboard.patternAddPlaybook'),
      t('dashboard.patternDismiss'),
      t('dashboard.patternResolved'),
      t('common.cancel'),
    ];
    const cancelIndex = 3;

    const onSelect = (index: number) => {
      if (index === 0) handleAddPatternToPlaybook(pattern);
      if (index === 1) handleDismissPattern(pattern);
      if (index === 2) handleResolvePattern(pattern);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex },
        onSelect,
      );
      return;
    }

    Alert.alert(t('dashboard.patternActionsTitle'), pattern.summary, [
      { text: options[0], onPress: () => onSelect(0) },
      { text: options[1], onPress: () => onSelect(1) },
      { text: options[2], onPress: () => onSelect(2) },
      { text: options[3], style: 'cancel' },
    ]);
  };

  const applyDeferredCache = (cached: ReturnType<typeof getDashboardDeferredCache>) => {
    if (!cached) return;
    setPatternsToAddress(cached.patternsToAddress);
    setWhatsWorking(cached.whatsWorking);
    setAggregateStrengths(cached.aggregateStrengths);
    setAggregateGrowth(cached.aggregateGrowth);
    setMonthlyStrengths(cached.monthlyStrengths);
    setMonthlyGrowthAreas(cached.monthlyGrowthAreas);
    deferredLoadedRef.current = true;
  };

  // Load stats when Dashboard tab is focused — use cache to avoid reprocessing on every visit
  useEffect(() => {
    if (!isFocused || !preloaded.isLoaded || !user?.id) return;
    if (preloaded.userName) setUserName(preloaded.userName);
  }, [preloaded.userName]);

  useEffect(() => {
    if (!isFocused || !preloaded.isLoaded || !user?.id) return;
    const sig = notesSignature(preloaded.notes);
    const cached = getDashboardDeferredCache(user.id, sig);
    if (cached) {
      applyDeferredCache(cached);
    }

    // Skip full reload when stats already computed for this notes snapshot
    const localeSig = `${sig}:${language}`;
    if (lastLoadedSigRef.current === localeSig && stats) {
      setLoading(false);
      return;
    }

    const handle = InteractionManager.runAfterInteractions(() => {
      const gen = ++loadGenRef.current;
      console.log('[Perf:Dashboard] loadStats starting after tab transition');
      loadStats(gen, localeSig);
    });

    return () => {
      loadGenRef.current++;
      handle.cancel();
    };
  }, [isFocused, preloaded.isLoaded, user?.id, language, notesSignature(preloaded.notes)]);

  // Trigger modal animations when modal opens
  useEffect(() => {
    if (showFullStory) {
      // Reset all animations - slide from top
      modalBackgroundOpacity.setValue(0);
      modalTitleTranslateY.setValue(-30);
      modalContentOpacity.setValue(0);
      modalCard1TranslateY.setValue(-20);
      modalCard2TranslateY.setValue(-20);

      // Sequential animations - professional top-to-bottom slide
      Animated.sequence([
        Animated.timing(modalBackgroundOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(modalTitleTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(modalContentOpacity, {
            toValue: 1,
            duration: 350,
            delay: 50,
            useNativeDriver: true,
          }),
        ]),
        Animated.stagger(100, [
          Animated.timing(modalCard1TranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(modalCard2TranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [showFullStory]);

  const loadUserProfile = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserName(data.username || '');
      }
    } catch (error) {
      console.error('[Dashboard] Error loading user profile:', error);
    }
  };

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
    if (score == null || Number.isNaN(score)) return t('dashboard.noRecentData');
    if (score <= 3) return t('dashboard.runningLow');
    if (score <= 6) return t('dashboard.stable');
    return t('dashboard.stable');
  };

  const loadMonthlyStory = async (notes: any[]) => {
    try {
      // Check cache first (24 hour cache)
      const cacheKey = `monthly_story_${user?.id}_${new Date().toISOString().slice(0, 7)}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        setMonthlyStory(cached);
      } else {
        // Get last 30 days of entries
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentNotes = notes.filter(n => 
          new Date(n.created_at) >= thirtyDaysAgo && n.ai_structured_insights
        );

        if (recentNotes.length === 0) {
          setMonthlyStory("You're just beginning your journey. Each entry you write adds to your story.");
        } else {
          setStoryLoading(true);
          const story = await mobileAiService.generateMonthlyStory(recentNotes);
          setMonthlyStory(story);
          
          // Cache for 24 hours
          await AsyncStorage.setItem(cacheKey, story);
        }
      }

      // Calculate monthly stats and highlights
      await calculateMonthlyData(notes);
    } catch (error) {
      console.error('[Dashboard] Error loading monthly story:', error);
      setMonthlyStory("You've been showing up for yourself. That's what matters.");
    } finally {
      setStoryLoading(false);
    }
  };

  const calculateMonthlyData = async (notes: any[]) => {
    try {
      // Get current month entries
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthNotes = notes.filter(n => {
        const noteDate = new Date(n.created_at);
        return noteDate.getMonth() === currentMonth && noteDate.getFullYear() === currentYear;
      });

      if (monthNotes.length === 0) return;

      // Calculate stats
      const totalReflections = monthNotes.length;
      
      // Find longest streak in this month
      let longestStreak = 0;
      let currentStreak = 0;
      const sortedByDate = [...monthNotes].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      for (let i = 0; i < sortedByDate.length; i++) {
        if (i === 0) {
          currentStreak = 1;
        } else {
          const prevDate = new Date(sortedByDate[i - 1].created_at);
          const currDate = new Date(sortedByDate[i].created_at);
          const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);

      // Find best day (highest wellbeing score)
      let bestDay = null;
      let highestScore = 0;
      monthNotes.forEach(n => {
        const score = n.ai_structured_insights?.wellbeingScore || n.ai_insights?.wellbeingScore || 0;
        if (score > highestScore) {
          highestScore = score;
          bestDay = {
            date: new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: Math.round(score)
          };
        }
      });

      // Calculate averages
      const withScores = monthNotes.filter(n => 
        n.ai_structured_insights?.resilienceScore || n.ai_insights?.resilienceScore
      );
      
      const avgResilience = withScores.length > 0
        ? Math.round(withScores.reduce((sum, n) => 
            sum + (n.ai_structured_insights?.resilienceScore || n.ai_insights?.resilienceScore || 0), 0
          ) / withScores.length)
        : 0;
      
      const avgWellbeing = withScores.length > 0
        ? Math.round(withScores.reduce((sum, n) => 
            sum + (n.ai_structured_insights?.wellbeingScore || n.ai_insights?.wellbeingScore || 0), 0
          ) / withScores.length)
        : 0;

      setMonthlyStats({
        totalReflections,
        longestStreak,
        bestDay,
        avgResilience,
        avgWellbeing
      });

      // Find narrative highlights
      // 1. Strongest resilience entry
      let strongestEntry = null;
      let highestResilience = 0;
      monthNotes.forEach(n => {
        const resilience = n.ai_structured_insights?.resilienceScore || n.ai_insights?.resilienceScore || 0;
        if (resilience > highestResilience) {
          highestResilience = resilience;
          strongestEntry = {
            date: new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            title: n.title || t('dashboard.untitled'),
            entryId: n.id
          };
        }
      });

      // 2. Key theme (most common)
      const themeCounts: Record<string, number> = {};
      monthNotes.forEach(n => {
        const themes = n.ai_structured_insights?.key_themes || [];
        themes.forEach((t: any) => {
          const theme = t.theme || t;
          if (theme) {
            themeCounts[theme] = (themeCounts[theme] || 0) + 1;
          }
        });
      });
      
      let keyTheme = null;
      if (Object.keys(themeCounts).length > 0) {
        const topTheme = Object.entries(themeCounts).sort((a, b) => b[1] - a[1])[0];
        keyTheme = { theme: topTheme[0], count: topTheme[1] };
      }

      // 3. New strategy from recent growth insights
      let newStrategy = null;
      const recentWithGrowth = monthNotes
        .filter(n => {
          const suggested = n.ai_structured_insights?.coping_strategies?.suggested;
          const areas = n.ai_structured_insights?.progress_indicators?.areas_for_growth;
          return (Array.isArray(suggested) && suggested.length > 0) ||
                 (Array.isArray(areas) && areas.length > 0);
        })
        .slice(0, 3);
      
      if (recentWithGrowth.length > 0) {
        const insights = recentWithGrowth[0].ai_structured_insights;
        const suggested = insights?.coping_strategies?.suggested;
        const areas = insights?.progress_indicators?.areas_for_growth;
        if (Array.isArray(suggested) && suggested.length > 0) {
          const s = suggested[0];
          newStrategy = typeof s === 'string' ? s : (s.strategy || s.description || null);
        } else if (Array.isArray(areas) && areas.length > 0) {
          const a = areas[0];
          newStrategy = typeof a === 'string' ? a : (a.description || null);
        }
      }

      setNarrativeHighlights({
        strongestResilience: strongestEntry,
        keyTheme,
        newStrategy
      });

    } catch (error) {
      console.error('[Dashboard] Error calculating monthly data:', error);
    }
  };

  const loadPatternsData = async (notes: any[], gen: number, sig: string) => {
    try {
      if (gen !== loadGenRef.current) return;
      const deferred = computeDeferredDashboardData(notes, language);
      if (gen !== loadGenRef.current) return;

      setPatternsToAddress(deferred.patternsToAddress);
      setWhatsWorking(deferred.whatsWorking);
      setAggregateStrengths(deferred.aggregateStrengths);
      setAggregateGrowth(deferred.aggregateGrowth);
      setMonthlyStrengths(deferred.monthlyStrengths);
      setMonthlyGrowthAreas(deferred.monthlyGrowthAreas);
      deferredLoadedRef.current = true;

      if (user?.id) {
        setDashboardDeferredCache(user.id, { signature: sig, ...deferred });
      }
    } catch (error) {
      console.error('[Dashboard:Patterns] Error:', error);
    }
  };

  const checkRememberWhen = async (notes: any[]) => {
    try {
      if (notes.length < 5) return; // Need at least 5 entries

      const recentNote = notes[0];
      if (!recentNote?.ai_structured_insights) return;

      const recentEmotion = recentNote.ai_structured_insights.mood_analysis?.primary_emotion;
      const recentThemes = recentNote.ai_structured_insights.key_themes?.map((t: any) => t.theme) || [];

      // Look for similar past entries (simple keyword matching)
      const olderNotes = notes.slice(1, 20); // Check last 20 entries
      
      for (const oldNote of olderNotes) {
        if (!oldNote?.ai_structured_insights) continue;
        
        const oldEmotion = oldNote.ai_structured_insights.mood_analysis?.primary_emotion;
        const oldThemes = oldNote.ai_structured_insights.key_themes?.map((t: any) => t.theme) || [];
        
        // Check if emotions match
        if (oldEmotion?.toLowerCase() === recentEmotion?.toLowerCase()) {
          // Check if any themes overlap
          const overlap = recentThemes.some((theme: string) => 
            oldThemes.some((oldTheme: string) => 
              oldTheme.toLowerCase().includes(theme.toLowerCase()) ||
              theme.toLowerCase().includes(oldTheme.toLowerCase())
            )
          );
          
          if (overlap) {
            // Found a match! Extract strategy from old entry
            const strategy = oldNote.ai_structured_insights.coping_strategies?.current?.[0] || 
                           oldNote.ai_structured_insights.progress_indicators?.positive_signals?.[0] ||
                           'taking time to reflect';
            
            setRememberWhenCard({
              emotion: recentEmotion,
              topic: recentThemes[0] || 'this',
              date: new Date(oldNote.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              strategy: strategy,
              entryId: oldNote.id,
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error('[Dashboard] Error checking remember when:', error);
    }
  };

  const getOppositeEmotionKey = (emotion: string): string => {
    const opposites: Record<string, string> = {
      anxious: 'calm',
      frustrated: 'content',
      sad: 'joyful',
      angry: 'peaceful',
      overwhelmed: 'clear',
      tired: 'energized',
      stressed: 'calm',
      hopeful: 'balanced',
      reflective: 'energized',
    };
    return opposites[emotion.toLowerCase()] || 'balance';
  };

  // Show cards instantly — no staggered animation to prevent janky load-in
  useEffect(() => {
    if (stats) {
      cardAnimations.forEach(anim => anim.setValue(1));
    }
  }, [stats]);

  const loadStats = async (gen: number, sig: string) => {
    if (!user) return;

    try {
      // Use preloaded notes if available (instant), otherwise fetch from network
      let notes = preloaded.notes;
      if (!notes) {
        console.log('[Dashboard] No preloaded notes, fetching from network...');
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        notes = data || [];
      } else {
        console.log('[Dashboard] Using preloaded notes:', notes.length);
      }

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
      const sortedNotes = [...(notes ?? [])].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
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

      // Store all notes for other features
      setAllNotes(notes || []);

      const dashboardNotes = filterNotesForDisplayLocale(notes || [], language);

      // Build dominant emotions synchronously (fast) so UI shows immediately
      const emotionCounts: Record<string, number> = {};
      const entriesByEmotion: Record<string, any[]> = {};
      dashboardNotes
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

      // Prepare chart data synchronously (fast)
      const sentimentNotes =
        notes?.filter((n: any) => n.ai_insights && (n.ai_insights.wellbeingScore || n.ai_insights.resilienceScore)) || [];

      if (sentimentNotes.length > 0) {
        const recent = sentimentNotes
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .slice(-8);

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
              color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
            },
            {
              data: resilienceSeries,
              color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
            },
          ],
        };

        console.log('[Mobile Dashboard] chartData', chartPayload);
        setChartData(chartPayload);
        setTrendPoints(trendPointsPayload);
      } else {
        setChartData(null);
      }

      // Clear loading IMMEDIATELY so UI renders with stats + emotions + chart
      if (gen !== loadGenRef.current) return;
      setLoading(false);

      const milestones = [7, 14, 30, 60, 90, 180, 365];
      if (milestones.includes(streak)) {
        setMilestoneStreak(streak);
      }

      lastLoadedSigRef.current = sig;

      // Defer heavy work until after tab transition / interactions complete
      InteractionManager.runAfterInteractions(() => {
        if (gen !== loadGenRef.current) return;
        runDeferredDashboardWork(notes || [], gen, sig);
      });

    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const runDeferredDashboardWork = async (notes: any[], gen: number, sig: string) => {
    try {
      const hasDeferredCache = !!(user?.id && getDashboardDeferredCache(user.id, sig));

      await yieldToUI();
      if (gen !== loadGenRef.current) return;
      checkRememberWhen(notes).catch(e => console.error('[Dashboard] Remember when error:', e));

      if (!hasDeferredCache) {
        await yieldToUI();
        if (gen !== loadGenRef.current) return;
        await loadPatternsData(notes, gen, sig);
      }

      await yieldToUI();
      if (gen !== loadGenRef.current) return;
      loadMonthlyStory(notes).catch(e => console.error('[Dashboard] Monthly story error:', e));
    } catch (error) {
      console.error('[Dashboard] Deferred work error:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Active Theme Background */}
      <LinearGradient
        colors={theme.colors.backgroundGradient as any}
        style={styles.backgroundGradient}
      />

      {/* Header image lives inside scroll for full-bleed fade */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <DashboardHeaderHero title={t('dashboard.title')} />
        <View style={styles.dashboardBody}>
        {loading ? (
          <DashboardSkeleton />
        ) : stats ? (
          <>
            {/* Emotion Bubble Map - Enhanced */}
            <Animated.View style={{ opacity: cardAnimations[1], transform: [{ translateY: cardAnimations[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <StandardContainer variant="hero" style={[styles.bubbleMapCard, { backgroundColor: theme.colors.cardBackground }]}>
                <View style={styles.bubbleMapHeader}>
                  <Text style={[styles.bubbleMapTitle, { color: theme.colors.primaryText }]}>{t('dashboard.emotionalLandscape')}</Text>
                  <Text style={[styles.bubbleMapSubtitle, { color: theme.colors.secondaryText }]}>
                    {dominantEmotions.length > 0 ? t('dashboard.tapExplore') : t('dashboard.trackEmotions')}
                  </Text>
                </View>
                
                {dominantEmotions.length > 0 ? (
                  <>
                    <View style={styles.bubbleMapContainer}>
                      {dominantEmotions.map((item, index) => {
                        const baseSize = 60;
                        const size = baseSize + (item.percentage * 0.8);
                        const positions = [
                          { top: 20, left: 30 },
                          { top: 60, right: 40 },
                          { top: 120, left: 60 },
                          { top: 100, right: 80 },
                          { top: 160, left: 120 },
                        ];
                        const position = positions[index] || { top: 80, left: 80 };

                        // Cohesive warm-purple bubble palette; each emotion gets its own hue
                        const bubblePalette = [
                          { highlight: '216, 180, 254', core: '139, 92, 246', depth: '91, 33, 182', glow: '#A78BFA' },
                          { highlight: '251, 182, 206', core: '225, 105, 154', depth: '159, 63, 112', glow: '#F09AB9' },
                          { highlight: '255, 199, 163', core: '244, 128, 91', depth: '190, 73, 54', glow: '#FB9B78' },
                          { highlight: '177, 184, 255', core: '99, 102, 241', depth: '67, 56, 202', glow: '#818CF8' },
                          { highlight: '153, 246, 232', core: '45, 190, 191', depth: '22, 124, 139', glow: '#5EEAD4' },
                        ];
                        const palette = bubblePalette[index % bubblePalette.length];
                        // Larger, more dominant emotions carry more light/weight
                        const weight = item.percentage / 100;
                        const highlightAlpha = 0.76 + weight * 0.2;
                        const coreAlpha = 0.72 + weight * 0.24;
                        const depthAlpha = 0.68 + weight * 0.22;
                        const glowOpacity = 0.35 + weight * 0.5;
                        const glowRadius = 12 + item.percentage * 0.5;

                        return (
                          <TouchableOpacity
                            key={item.emotion}
                            style={[
                              styles.emotionBubble,
                              {
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                shadowColor: palette.glow,
                                shadowOpacity: glowOpacity,
                                shadowRadius: glowRadius,
                                ...position,
                              },
                            ]}
                            activeOpacity={0.8}
                            onPress={() => {
                              navigation.navigate('EmotionDetail', {
                                emotion: item.emotion,
                                percentage: item.percentage,
                                entries: emotionEntriesByEmotion[item.emotion] || [],
                              });
                            }}
                          >
                            <LinearGradient
                              colors={[
                                `rgba(${palette.highlight}, ${highlightAlpha})`,
                                `rgba(${palette.core}, ${coreAlpha})`,
                                `rgba(${palette.depth}, ${depthAlpha})`,
                              ]}
                              locations={[0, 0.5, 1]}
                              start={{ x: 0.16, y: 0.08 }}
                              end={{ x: 0.88, y: 0.96 }}
                              style={[styles.bubbleGradient, { borderColor: `rgba(${palette.highlight}, 0.62)` }]}
                            >
                              <LinearGradient
                                colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
                                locations={[0, 0.42, 1]}
                                start={{ x: 0.2, y: 0 }}
                                end={{ x: 0.72, y: 0.78 }}
                                style={styles.bubbleSheen}
                                pointerEvents="none"
                              />
                              <View style={styles.bubbleInnerRim} pointerEvents="none" />
                              <Text style={styles.bubbleEmotionText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>{labelEmotion(item.emotion)}</Text>
                              <Text style={styles.bubblePercentageText}>{item.percentage}%</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        );
                      })}
                      
                      <TouchableOpacity
                        style={[styles.emotionBubble, styles.addBubble, { width: 50, height: 50, borderRadius: 25, top: 140, right: 30 }]}
                        activeOpacity={0.8}
                        onPress={() => console.log('[Dashboard] Add emotion tapped')}
                      >
                        <View style={[styles.addBubbleInner, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                          <Text style={[styles.addBubbleText, { color: theme.colors.secondaryText }]}>+</Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Enhanced Insights Below Bubbles */}
                    <View style={[styles.emotionInsightSection, { borderTopColor: theme.colors.divider }]}>
                      <Text style={[styles.emotionInsightText, { color: theme.colors.secondaryText }]}>
                        {t('dashboard.mostRecurring')}: <Text style={[styles.emotionInsightEmphasis, { color: theme.colors.primaryText }]}>{labelEmotion(dominantEmotions[0].emotion)}</Text> ({dominantEmotions[0].percentage}%)
                      </Text>
                      <Text style={[styles.emotionPromptText, { color: theme.colors.tertiaryText }]}>
                        {t('dashboard.emotionWeekPrompt', {
                          emotion: labelEmotion(dominantEmotions[0].emotion).toLowerCase(),
                          opposite: (() => {
                            const oppositeKey = getOppositeEmotionKey(dominantEmotions[0].emotion);
                            return oppositeKey === 'balance'
                              ? t('dashboard.balance')
                              : labelEmotion(oppositeKey).toLowerCase();
                          })(),
                        })}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyBubbleContainer}>
                    <Ionicons name="happy-outline" size={48} color={theme.colors.secondaryText} />
                    <Text style={[styles.emptyBubbleText, { color: theme.colors.secondaryText }]}>
                      {t('dashboard.emotionsEmpty')}
                    </Text>
                  </View>
                )}
              </StandardContainer>
            </Animated.View>

            {/* Patterns to Address */}
            {visiblePatternsToAddress.length > 0 && (
              <StandardContainer tint="coral" style={[styles.patternsCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                <TouchableOpacity 
                  style={styles.patternsHeader}
                  onPress={() => setPatternsExpanded(!patternsExpanded)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="leaf-outline" size={20} color="#10b981" />
                    <Text style={[styles.patternsTitle, { color: theme.colors.primaryText }]}>{t('dashboard.patternsToAddressCount', { count: visiblePatternsToAddress.length })}</Text>
                  </View>
                  <Ionicons 
                    name={patternsExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={theme.colors.secondaryText} 
                  />
                </TouchableOpacity>
                <Text style={[styles.patternSubtitle, { color: theme.colors.tertiaryText }]}>
                  {sectionSubtitleForItems(visiblePatternsToAddress, t('dashboard.prioritiesSubtitle'))}
                </Text>
                
                <View style={styles.patternsContent}>
                  {visiblePatternsToAddress.slice(0, patternsExpanded ? visiblePatternsToAddress.length : 2).map((pattern) => (
                    <View key={pattern.id} style={styles.patternCardWrap}>
                      <TouchableOpacity
                        onPress={() => {
                          const entry = allNotes.find((n: any) => n.id === pattern.entryId);
                          if (entry) {
                            navigation.navigate('EntryDetail', { entry, highlightText: pattern.summary });
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <StandardContainer variant="nested" style={styles.patternCard}>
                        <View style={styles.patternCardHeader}>
                          <View style={styles.frequencyBadge}>
                            <Ionicons name="flame" size={13} color="#ef4444" />
                            <Text style={styles.frequencyText}>x{pattern.rawCount || pattern.count}</Text>
                          </View>
                          {pattern.priority === 'HIGH' && (
                            <View style={[styles.priorityBadge, styles.priorityBadgeHighGlow]}>
                              <Text style={styles.priorityBadgeText}>{t('dashboard.highPriority')}</Text>
                            </View>
                          )}
                          {pattern.priority === 'MEDIUM' && (
                            <View style={[styles.priorityBadge, styles.priorityBadgeMedium]}>
                              <Text style={[styles.priorityBadgeText, styles.priorityBadgeTextMedium]}>{t('dashboard.medium')}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.patternSummary, { color: theme.colors.primaryText }]}>{pattern.summary}</Text>
                        {pattern.description ? (
                          <Text style={[styles.patternDescription, { color: theme.colors.secondaryText }]} numberOfLines={3}>
                            {pattern.description}
                          </Text>
                        ) : null}
                        {pattern.originLabel && !pattern.originLabel.includes('related entries') ? (
                          <Text style={[styles.patternOrigin, { color: theme.colors.tertiaryText }]} numberOfLines={1}>
                            {t('dashboard.patternFrom', { label: pattern.originLabel })}
                          </Text>
                        ) : pattern.count > 1 ? (
                          <Text style={[styles.patternOrigin, { color: theme.colors.tertiaryText }]} numberOfLines={1}>
                            {t('dashboard.patternMentionedAcross', { count: pattern.count })}
                          </Text>
                        ) : null}
                        </StandardContainer>
                      </TouchableOpacity>
                      <View style={styles.patternActionRow}>
                        <TouchableOpacity
                          style={[
                            styles.patternCheckRow,
                            isPatternWorking(patternActions[getPatternKey(pattern.summary)]) && styles.patternCheckRowActive,
                          ]}
                          onPress={() => handlePatternWorkingToggle(pattern)}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            styles.patternCheckbox,
                            { borderColor: theme.colors.border },
                            isPatternWorking(patternActions[getPatternKey(pattern.summary)]) && styles.patternCheckboxActive,
                          ]}>
                            {isPatternWorking(patternActions[getPatternKey(pattern.summary)]) ? (
                              <Ionicons name="checkmark" size={14} color="#ffffff" />
                            ) : null}
                          </View>
                          <Text style={[styles.patternCheckLabel, { color: theme.colors.secondaryText }]}>
                            {t('dashboard.patternWorkingOn')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => showPatternActionMenu(pattern)}
                          style={styles.patternMenuBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.secondaryText} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {!patternsExpanded && visiblePatternsToAddress.length > 2 && (
                    <TouchableOpacity
                      style={[styles.viewAllButton, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
                      onPress={() => setPatternsExpanded(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.viewAllText, { color: theme.colors.secondaryText }]}>{t('dashboard.viewMoreFocusAreas', { count: visiblePatternsToAddress.length - 2 })}</Text>
                      <Ionicons name="chevron-forward" size={14} color={theme.colors.secondaryText} />
                    </TouchableOpacity>
                  )}
                  {patternsExpanded && visiblePatternsToAddress.length > 2 && (
                    <TouchableOpacity
                      style={[styles.viewAllButton, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
                      onPress={() => setPatternsExpanded(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.viewAllText, { color: theme.colors.secondaryText }]}>{t('dashboard.showLess')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </StandardContainer>
            )}

            {workingPatterns.length > 0 && (
              <StandardContainer variant="nested" style={[styles.workingPatternsCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.cardBackground }]}>
                <TouchableOpacity
                  style={styles.workingPatternsHeader}
                  onPress={() => setWorkingPatternsExpanded(!workingPatternsExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.workingPatternsTitle, { color: theme.colors.secondaryText }]}>
                    {t('dashboard.patternsWorkingSection', { count: workingPatterns.length })}
                  </Text>
                  <Ionicons
                    name={workingPatternsExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={theme.colors.secondaryText}
                  />
                </TouchableOpacity>
                {workingPatternsExpanded ? (
                  <View style={styles.workingPatternsList}>
                    {workingPatterns.map((pattern) => (
                      <View key={`working-${pattern.id}`} style={styles.workingPatternItem}>
                        <Text style={[styles.workingPatternText, { color: theme.colors.primaryText }]} numberOfLines={2}>
                          {pattern.summary}
                        </Text>
                        <TouchableOpacity onPress={() => handlePatternWorkingToggle(pattern)}>
                          <Text style={styles.workingPatternRestore}>{t('dashboard.patternRestore')}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : null}
              </StandardContainer>
            )}

            {/* What's Working */}
            {whatsWorking.length > 0 && (
              <StandardContainer tint="aqua" style={[styles.workingCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                <TouchableOpacity 
                  style={styles.workingHeader}
                  onPress={() => setWorkingExpanded(!workingExpanded)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="sparkles-outline" size={20} color="#f59e0b" />
                    <Text style={[styles.workingTitle, { color: theme.colors.primaryText }]}>{t('dashboard.whatsWorkingCount', { count: whatsWorking.length })}</Text>
                  </View>
                  <Ionicons 
                    name={workingExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={theme.colors.secondaryText} 
                  />
                </TouchableOpacity>
                <Text style={[styles.patternSubtitle, { color: theme.colors.tertiaryText }]}>
                  {sectionSubtitleForItems(whatsWorking, t('dashboard.strategiesSubtitle'))}
                </Text>
                
                <View style={styles.workingContent}>
                  {whatsWorking.slice(0, workingExpanded ? whatsWorking.length : 2).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.patternCardWrap}
                      onPress={() => {
                        const entry = allNotes.find((n: any) => n.id === item.entryId);
                        if (entry) {
                          navigation.navigate('EntryDetail', { entry, highlightText: item.summary });
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <StandardContainer variant="nested" style={styles.patternCard}>
                      <View style={styles.patternCardHeader}>
                        <View style={[styles.frequencyBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                          <Ionicons name="flame" size={13} color="#10b981" />
                          <Text style={[styles.frequencyText, { color: '#10b981' }]}>x{item.rawCount || item.count}</Text>
                        </View>
                        {item.priority === 'HIGH' && (
                          <View style={[styles.priorityBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <Text style={[styles.priorityBadgeText, { color: '#10b981' }]}>{t('dashboard.highImpact')}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.workingSummary, { color: theme.colors.primaryText }]}>{item.summary}</Text>
                      {item.description ? (
                        <Text style={[styles.patternDescription, { color: theme.colors.secondaryText }]} numberOfLines={3}>
                          {item.description}
                        </Text>
                      ) : null}
                      {item.originLabel && !item.originLabel.includes('related entries') ? (
                        <Text style={[styles.patternOrigin, { color: theme.colors.tertiaryText }]} numberOfLines={1}>
                          from "{item.originLabel}"
                        </Text>
                      ) : item.count > 1 ? (
                        <Text style={[styles.patternOrigin, { color: theme.colors.tertiaryText }]} numberOfLines={1}>
                          Mentioned across {item.count} entries
                        </Text>
                      ) : null}
                      </StandardContainer>
                    </TouchableOpacity>
                  ))}

                  {!workingExpanded && whatsWorking.length > 2 && (
                    <TouchableOpacity
                      style={[styles.viewAllButton, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
                      onPress={() => setWorkingExpanded(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.viewAllText, { color: theme.colors.secondaryText }]}>View {whatsWorking.length - 2} More Strengths</Text>
                      <Ionicons name="chevron-forward" size={14} color={theme.colors.secondaryText} />
                    </TouchableOpacity>
                  )}
                  {workingExpanded && whatsWorking.length > 2 && (
                    <TouchableOpacity
                      style={[styles.viewAllButton, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
                      onPress={() => setWorkingExpanded(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.viewAllText, { color: theme.colors.secondaryText }]}>{t('dashboard.showLess')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </StandardContainer>
            )}

            {/* Refined This Week Card - Horizontal Layout */}
            {SHOW_DASHBOARD_STORY_SECTIONS && (
              <StandardContainer tint="gold" style={[styles.heroCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                <Text style={[styles.heroTitle, { color: theme.colors.primaryText }]}>{t('dashboard.weekGlance')}</Text>
                
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <View style={styles.metricIconValue}>
                      <Ionicons name="flame" size={22} color="#f97316" />
                      <Text style={[styles.metricValue, { color: theme.colors.primaryText }]}>
                        {stats.currentStreak > 0 ? stats.currentStreak : '-'}
                      </Text>
                    </View>
                    <Text style={[styles.metricLabel, { color: theme.colors.secondaryText }]}>{t('dashboard.dayStreak')}</Text>
                  </View>

                  <View style={styles.metricItem}>
                    <View style={styles.metricIconValue}>
                      <Ionicons name="happy-outline" size={22} color="#fbbf24" />
                      <Text style={[styles.metricValue, { color: theme.colors.primaryText }]}>
                        {stats.avgWellbeingScore > 0 ? `${stats.avgWellbeingScore}/10` : '-'}
                      </Text>
                    </View>
                    <Text style={[styles.metricLabel, { color: theme.colors.secondaryText }]}>{t('dashboard.averageMood')}</Text>
                  </View>
                </View>
                <Text style={[styles.interpretiveSentence, { color: theme.colors.secondaryText }]}>
                  {stats.totalEntries === 0
                    ? t('dashboard.firstEntry')
                    : stats.avgWellbeingScore >= 7
                    ? 'A steady week with consistent emotional balance.'
                    : stats.avgWellbeingScore >= 5
                    ? 'A steady week overall.'
                    : stats.avgWellbeingScore > 0
                    ? t('dashboard.challengesWeek')
                    : t('dashboard.beginMood')}
                </Text>
              </StandardContainer>
            )}

            {/* Progress Story Card - Enhanced with Inline Highlights */}
            {SHOW_DASHBOARD_STORY_SECTIONS && monthlyStory && (
              <Animated.View style={{ opacity: cardAnimations[0], transform: [{ translateY: cardAnimations[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <StandardContainer tint="violet" style={[styles.progressStoryCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                  <PremiumGradientText variant="warm" style={styles.progressStoryTitle}>
                    {t('dashboard.yourMonthStory', { month: formatDate(new Date(), { month: 'long' }) })}
                  </PremiumGradientText>
                  {storyLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 12 }} />
                  ) : (
                    <>
                      <Text style={[styles.progressStoryText, { color: theme.colors.secondaryText }]} numberOfLines={2}>
                        {monthlyStory}
                      </Text>
                      
                      {/* Inline Highlights */}
                      {narrativeHighlights && (
                        <View style={styles.inlineHighlights}>
                          {narrativeHighlights.strongestResilience && (
                            <View style={styles.inlineHighlightRow}>
                              <Ionicons name="sparkles" size={14} color="#fbbf24" style={styles.inlineHighlightIconIon} />
                              <Text style={[styles.inlineHighlightText, { color: theme.colors.secondaryText }]}>
                                Strongest day: <Text style={[styles.inlineHighlightValue, { color: theme.colors.primaryText }]}>{narrativeHighlights.strongestResilience.date}</Text>
                              </Text>
                            </View>
                          )}
                          {narrativeHighlights.keyTheme && (
                            <View style={styles.inlineHighlightRow}>
                              <Ionicons name="bulb-outline" size={14} color="#a78bfa" style={styles.inlineHighlightIconIon} />
                              <Text style={[styles.inlineHighlightText, { color: theme.colors.secondaryText }]}>
                                Key theme: <Text style={[styles.inlineHighlightValue, { color: theme.colors.primaryText }]}>{narrativeHighlights.keyTheme.theme}</Text> ({narrativeHighlights.keyTheme.count} entries)
                              </Text>
                            </View>
                          )}
                          {narrativeHighlights.newStrategy && (
                            <View style={styles.inlineHighlightRow}>
                              <Ionicons name="leaf-outline" size={14} color="#10b981" style={styles.inlineHighlightIconIon} />
                              <Text style={[styles.inlineHighlightText, { color: theme.colors.secondaryText }]}>
                                Strategy: <Text style={[styles.inlineHighlightValue, { color: theme.colors.primaryText }]}>{narrativeHighlights.newStrategy}</Text>
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                      
                      <PremiumButton
                        label={t('dashboard.readFullStory')}
                        onPress={() => setShowFullStory(true)}
                        variant="secondary"
                        style={{ marginTop: 12 }}
                      />
                    </>
                  )}
                </StandardContainer>
              </Animated.View>
            )}

            {/* Quiet Achievement Milestone */}
            {milestoneStreak && (
              <Animated.View style={{ opacity: cardAnimations[2], transform: [{ translateY: cardAnimations[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <LinearGradient
                  colors={['#4A1F1F', '#5A2A2A', '#3A1515']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.milestoneCard}
                >
                  <Ionicons name="leaf" size={28} color="#fbbf24" style={styles.milestoneIconIon} />
                  <Text style={styles.milestoneTitle}>{t('dashboard.achievement')}</Text>
                  <Text style={styles.milestoneMessage}>
                    You've reflected for {milestoneStreak} days in a row. That's a real commitment to understanding yourself.
                  </Text>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Remember When Callback */}
            {rememberWhenCard && (
              <Animated.View style={{ opacity: cardAnimations[3], transform: [{ translateY: cardAnimations[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <StandardContainer tint="violet" style={styles.rememberWhenCard}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#a78bfa" style={styles.rememberWhenIconIon} />
                  <Text style={[styles.rememberWhenTitle, { color: theme.colors.primaryText }]}>{t('dashboard.rememberWhenTitle')}</Text>
                  <Text style={[styles.rememberWhenMessage, { color: theme.colors.secondaryText }]}>
                    Last time you felt {rememberWhenCard.emotion.toLowerCase()} about {rememberWhenCard.topic} ({rememberWhenCard.date}), you found that {rememberWhenCard.strategy} helped. Worth trying again?
                  </Text>
                  <TouchableOpacity
                    style={[styles.viewEntryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                    onPress={() => {
                      const entry = allNotes.find(n => n.id === rememberWhenCard.entryId);
                      if (entry) {
                        navigation.navigate('EntryDetail', { entry });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.viewEntryText, { color: theme.colors.primaryText }]}>{t('dashboard.viewThatEntry')}</Text>
                    <Ionicons name="chevron-forward" size={14} color={theme.colors.secondaryText} />
                  </TouchableOpacity>
                </StandardContainer>
              </Animated.View>
            )}

          </>
        ) : (
          <EmptyState
            icon="analytics-outline"
            title={t('dashboard.noData')}
            subtitle={t('dashboard.noDataSubtitle')}
            actionLabel={t('journal.createEntry')}
            onAction={() => navigation.navigate('CreateEntry' as never)}
          />
        )}
        </View>
      </ScrollView>

      {/* Full Story Modal - Premium Enhanced */}
      <Modal
        visible={showFullStory}
        animationType="fade"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFullStory(false)}
      >
        <ImageBackground
          source={require('../public/cool-gradient-bg.png')}
          style={styles.modalBackgroundGradient}
          resizeMode="cover"
        >
          <Animated.View style={[styles.modalContainer, { opacity: modalBackgroundOpacity }]}>
          <View style={styles.premiumModalBackground}>
              <Animated.View style={[styles.modalHeader, { transform: [{ translateY: modalTitleTranslateY }] }]}>
                <TouchableOpacity 
                  onPress={() => setShowFullStory(false)} 
                  style={styles.modalBackButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={28} color="rgba(255, 255, 255, 0.9)" />
                </TouchableOpacity>
                <MaskedView
                  maskElement={
                    <Text style={styles.modalTitle}>
                      {userName
                        ? t('dashboard.userMonthStory', { name: userName, month: formatDate(new Date(), { month: 'long' }) })
                        : t('dashboard.yourMonthStory', { month: formatDate(new Date(), { month: 'long' }) })}
                    </Text>
                  }
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#D4AF37']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  >
                    <Text style={[styles.modalTitle, { opacity: 0 }]}>
                      {userName
                        ? t('dashboard.userMonthStory', { name: userName, month: formatDate(new Date(), { month: 'long' }) })
                        : t('dashboard.yourMonthStory', { month: formatDate(new Date(), { month: 'long' }) })}
                    </Text>
                  </LinearGradient>
                </MaskedView>
                <View style={styles.modalHeaderSpacer} />
              </Animated.View>
              <Animated.ScrollView 
                style={[styles.modalContent, { opacity: modalContentOpacity }]} 
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Opening Narrative - Personalized */}
                <Text style={styles.modalStoryText}>
                  {userName && monthlyStory ? monthlyStory.replace(/^You've/, `${userName}, you've`).replace(/^You /, `${userName}, you `) : monthlyStory}
                </Text>

              {/* Narrative Highlights - Premium Card */}
              {narrativeHighlights && (
                <Animated.View style={[styles.premiumSection, { transform: [{ translateY: modalCard1TranslateY }] }]}>
                  <MaskedView
                    maskElement={
                      <Text style={styles.premiumSectionTitle}>{t('dashboard.narrativeHighlights')}</Text>
                    }
                  >
                    <LinearGradient
                      colors={['#FFFFFF', '#D4AF37']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ height: 30 }}
                    >
                      <Text style={[styles.premiumSectionTitle, { opacity: 0 }]}>{t('dashboard.narrativeHighlights')}</Text>
                    </LinearGradient>
                  </MaskedView>
                  
                  <LinearGradient
                    colors={['rgba(88, 50, 150, 0.4)', 'rgba(60, 30, 100, 0.35)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.premiumCard}
                  >
                    {narrativeHighlights.strongestResilience && (
                      <TouchableOpacity 
                        style={styles.premiumHighlightRow}
                        onPress={() => {
                          const entry = allNotes.find(n => n.id === narrativeHighlights.strongestResilience?.entryId);
                          if (entry) {
                            setShowFullStory(false);
                            navigation.navigate('EntryDetail', { entry });
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.highlightIconContainer}>
                          <LinearGradient
                            colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)']}
                            style={styles.iconGlowCircle}
                          >
                            <Ionicons name="sparkles" size={20} color="#fbbf24" />
                          </LinearGradient>
                        </View>
                        <View style={styles.highlightTextContainer}>
                          <Text style={styles.premiumHighlightText}>
                            <Text style={styles.premiumHighlightLabel}>{t('dashboard.strongestResilience')}</Text>
                            <Text style={styles.premiumHighlightValue}>{narrativeHighlights.strongestResilience.date}</Text>
                          </Text>
                          <Text style={styles.premiumHighlightSubtext}>"{narrativeHighlights.strongestResilience.title}" · Tap to view</Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    {narrativeHighlights.keyTheme && (
                      <View style={styles.premiumHighlightRow}>
                        <View style={styles.highlightIconContainer}>
                          <LinearGradient
                            colors={['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)']}
                            style={styles.iconGlowCircle}
                          >
                            <Ionicons name="bulb-outline" size={20} color="#a78bfa" />
                          </LinearGradient>
                        </View>
                        <View style={styles.highlightTextContainer}>
                          <Text style={styles.premiumHighlightText}>
                            <Text style={styles.premiumHighlightLabel}>{t('dashboard.keyTheme')}</Text>
                            <Text style={styles.premiumHighlightValue}>{narrativeHighlights.keyTheme.theme}</Text>
                            <Text style={styles.premiumHighlightMeta}> ({narrativeHighlights.keyTheme.count} entries)</Text>
                          </Text>
                        </View>
                      </View>
                    )}

                    {narrativeHighlights.newStrategy && (
                        <View style={styles.premiumHighlightRow}>
                        <Ionicons name="leaf-outline" size={18} color="#10b981" style={{ marginRight: 8 }} />
                        <Text style={styles.premiumHighlightText}>
                          <Text style={styles.premiumHighlightLabel}>{t('dashboard.strategy')}</Text>
                          <Text style={styles.premiumHighlightValue}>{narrativeHighlights.newStrategy}</Text>
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </Animated.View>
              )}

              {/* Monthly Stats - Premium Card */}
              {monthlyStats && (
                <Animated.View style={[styles.premiumSection, { transform: [{ translateY: modalCard2TranslateY }] }]}>
                  <MaskedView
                    maskElement={
                      <Text style={styles.premiumSectionTitle}>{t('dashboard.dataMonth')}</Text>
                    }
                  >
                    <LinearGradient
                      colors={['#FFFFFF', '#D4AF37']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ height: 30 }}
                    >
                      <Text style={[styles.premiumSectionTitle, { opacity: 0 }]}>{t('dashboard.dataMonth')}</Text>
                    </LinearGradient>
                  </MaskedView>
                  
                  <LinearGradient
                    colors={['rgba(88, 50, 150, 0.4)', 'rgba(60, 30, 100, 0.35)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.premiumCard}
                  >
                    <View style={styles.premiumStatsGrid}>
                      <View style={styles.statCompactCard}>
                        <LinearGradient
                          colors={['rgba(80, 120, 200, 0.3)', 'rgba(80, 120, 200, 0.1)']}
                          style={styles.statIconGlow}
                        >
                          <Ionicons name="bar-chart-outline" size={22} color="#8b5cf6" />
                        </LinearGradient>
                        <View style={styles.statTextContainer}>
                          <Text style={styles.statValue}>{monthlyStats.totalReflections}</Text>
                          <Text style={styles.statLabel}>{t('dashboard.totalReflections')}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.statCompactCard}>
                        <LinearGradient
                          colors={['rgba(255, 100, 50, 0.3)', 'rgba(255, 100, 50, 0.1)']}
                          style={styles.statIconGlow}
                        >
                          <Ionicons name="flame" size={22} color="#f97316" />
                        </LinearGradient>
                        <View style={styles.statTextContainer}>
                          <Text style={styles.statValue}>{monthlyStats.longestStreak}</Text>
                          <Text style={styles.statLabel}>{t('dashboard.longestStreak')}</Text>
                        </View>
                      </View>
                      
                      {monthlyStats.bestDay && (
                        <View style={styles.statCompactCard}>
                          <LinearGradient
                            colors={['rgba(255, 200, 80, 0.3)', 'rgba(255, 200, 80, 0.1)']}
                            style={styles.statIconGlow}
                          >
                            <Ionicons name="happy-outline" size={22} color="#fbbf24" />
                          </LinearGradient>
                          <View style={styles.statTextContainer}>
                            <Text style={styles.statValue}>{monthlyStats.bestDay.score}/10</Text>
                            <Text style={styles.statLabel}>{t('dashboard.bestDay')}</Text>
                            <Text style={styles.statMeta}>({monthlyStats.bestDay.date})</Text>
                          </View>
                        </View>
                      )}
                      
                      <View style={styles.statCompactCard}>
                        <LinearGradient
                          colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)']}
                          style={styles.statIconGlow}
                        >
                          <Ionicons name="fitness-outline" size={22} color="#10b981" />
                        </LinearGradient>
                        <View style={styles.statTextContainer}>
                          <Text style={styles.statValue}>{monthlyStats.avgResilience}/10</Text>
                          <Text style={styles.statLabel}>{t('dashboard.averageResilience')}</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>
              )}

                {/* Closing reflection prompt */}
                <View style={styles.modalDivider} />
                <Text style={styles.modalReflectionPrompt}>
                  Take a moment to reflect on this journey. What patterns do you notice? What might you want to explore further?
                </Text>
              </Animated.ScrollView>
            </View>
          </Animated.View>
        </ImageBackground>
      </Modal>

      {/* Emotion Detail Bottom Sheet */}
      {emotionDetail && (
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setEmotionDetail(null)}
          />
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
                <Text style={styles.sheetEntriesTitle}>{t('dashboard.recentEntries')}</Text>
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
                      {entry.title || t('dashboard.untitled')}
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
                  navigateToPlaybook(navigation);
                }}
              >
                <Text style={styles.sheetCtaPrimaryText}>{t('dashboard.openPlaybook')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetCloseArea}
              onPress={() => setEmotionDetail(null)}
            >
              <Text style={styles.sheetCloseText}>{t('common.close')}</Text>
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
    fontSize: 20,
    fontWeight: '500',
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
    paddingBottom: 100,
  },
  dashboardBody: {
    paddingHorizontal: isTablet ? 40 : 20,
    paddingTop: 8,
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
    fontSize: sf(18),
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 8,
    paddingTop: 2,
  },
  heroSubtitle: {
    fontSize: sf(13),
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
    fontSize: sf(18),
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
    fontSize: sf(15),
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
  statSubLabel: {
    marginTop: 6,
    fontSize: 11,
    color: '#8b8b8b',
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
    fontSize: sf(16),
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
    fontSize: sf(16),
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
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
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
  sheetBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
    padding: isTablet ? 24 : 20,
  },
  bubbleSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  bubbleInnerRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  bubbleMapHeader: {
    marginBottom: 16,
  },
  bubbleMapTitle: {
    fontSize: sf(18),
    fontWeight: '700',
    marginBottom: 4,
  },
  bubbleMapSubtitle: {
    fontSize: sf(13),
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  bubbleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.25,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  bubbleEmotionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 6,
    lineHeight: 14,
    width: '100%',
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
    fontSize: sf(24),
  },
  metricValue: {
    fontSize: sf(24),
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: sf(11),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  interpretiveSentence: {
    fontSize: sf(14),
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyBubbleContainer: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyBubbleText: {
    fontSize: sf(14),
    lineHeight: sf(20),
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 16,
    marginTop: 8,
    paddingBottom: 4,
  },
  // Progress Story Card
  progressStoryCard: {
    marginBottom: 16,
    borderRadius: 20,
    padding: isTablet ? 24 : 20,
    width: '100%',
    minHeight: isTablet ? 240 : 220,
  },
  progressStoryTitle: {
    fontSize: sf(18),
    fontWeight: '700',
    marginBottom: 12,
  },
  progressStoryText: {
    fontSize: sf(15),
    lineHeight: sf(22),
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 16,
  },
  readFullStoryButton: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  readFullStoryGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  readFullStoryText: {
    fontSize: sf(15),
    fontWeight: '600',
    color: '#ffffff',
  },
  inlineHighlights: {
    marginTop: 16,
    marginBottom: 16,
    gap: 10,
  },
  inlineHighlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  inlineHighlightIconIon: {
    fontSize: 16,
    lineHeight: 20,
  },
  inlineHighlightText: {
    flex: 1,
    fontSize: sf(13),
    lineHeight: sf(20),
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inlineHighlightValue: {
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  // Enhanced Emotional Landscape Insights
  emotionInsightSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  emotionInsightText: {
    fontSize: sf(14),
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  emotionInsightEmphasis: {
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  emotionPromptText: {
    fontSize: sf(14),
    lineHeight: sf(20),
    color: 'rgba(255, 255, 255, 0.65)',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  explorePatternsButton: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  explorePatternsGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  explorePatternsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Quiet Achievement Milestone
  milestoneCard: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    shadowColor: '#4A1F1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  milestoneIconIon: {
    fontSize: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  milestoneMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  // Remember When Card
  rememberWhenCard: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  rememberWhenIconIon: {
    fontSize: 28,
    marginBottom: 12,
  },
  rememberWhenTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
  },
  rememberWhenMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 16,
  },
  viewEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  viewEntryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Full Story Modal - Premium Glassmorphic Design
  modalContainer: {
    flex: 1,
  },
  modalBackgroundGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  starscapeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
  },
  premiumModalBackground: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 0,
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: sf(60),
    paddingBottom: 16,
    zIndex: 1,
  },
  modalBackButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalHeaderSpacer: {
    width: 44,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalStoryText: {
    fontSize: 16,
    lineHeight: 25.6,
    color: 'rgba(245, 241, 232, 0.9)',
    fontWeight: '400',
    marginBottom: 8,
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 24,
  },
  modalReflectionPrompt: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.65)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Premium Modal Card Design
  premiumSection: {
    marginTop: 24,
  },
  premiumSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  premiumCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 8,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  premiumHighlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  highlightIconContainer: {
    marginRight: 12,
  },
  iconGlowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(139, 92, 246, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  highlightTextContainer: {
    flex: 1,
  },
  premiumHighlightText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  premiumHighlightIconIon: {
    marginRight: 10,
  },
  premiumHighlightIcon: {
    fontSize: 20,
  },
  premiumHighlightLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },
  premiumHighlightValue: {
    fontWeight: '600',
    color: '#ffffff',
  },
  premiumHighlightMeta: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  premiumHighlightSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  premiumStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCompactCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(88, 50, 150, 0.2)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  statTextContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  statIconGlow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(255, 255, 255, 0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  statIcon: {
    fontSize: 22,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 32,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
  statMeta: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  // Pattern Recognition Section Styles
  patternsAnalysisCard: {
    padding: 24,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  patternsAnalysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patternsAnalysisTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  patternsAnalysisSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  recurringThemesSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  themeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  themeText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    marginRight: 12,
  },
  themeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeFrequency: {
    fontSize: 13,
  },
  patternInsightsSection: {
    marginBottom: 24,
  },
  patternInsightCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  patternInsightText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  explorePatternButton: {
    alignSelf: 'flex-start',
  },
  explorePatternText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emotionalPatternsSection: {
    marginBottom: 0,
  },
  emotionalPatternText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  emotionalPatternSuggestion: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  // Enhanced Modal Sections (legacy - keeping for compatibility)
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 32,
    marginBottom: 16,
  },
  highlightCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  highlightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  highlightSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  highlightTap: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  highlightNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  modalStatItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalStatIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
  },
  // Patterns to Address Section
  patternsCard: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  patternsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  patternsTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  patternSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    paddingHorizontal: 20,
    marginTop: -8,
    marginBottom: 12,
  },
  patternsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  patternCard: {
    padding: 16,
  },
  patternCardWrap: {
    marginBottom: 12,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  patternDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  patternSummary: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 4,
  },
  patternDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
  },
  patternCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  priorityBadgeHighGlow: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: 'rgba(239, 68, 68, 0.45)',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 9,
    elevation: 4,
  },
  priorityBadgeMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  priorityBadgeTextMedium: {
    color: '#f59e0b',
  },
  patternOrigin: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  patternActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  patternCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  patternCheckRowActive: {
    opacity: 1,
  },
  patternCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternCheckboxActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  patternCheckLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  patternMenuBtn: {
    padding: 4,
  },
  workingPatternsCard: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
  },
  workingPatternsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workingPatternsTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  workingPatternsList: {
    marginTop: 10,
    gap: 10,
  },
  workingPatternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  workingPatternText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  workingPatternRestore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  patternCategory: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  patternFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  patternCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  patternCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  viewAllButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  keepGoingButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  keepGoingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // What's Working Section
  workingCard: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  workingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  workingTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  workingContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  workingItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  workingSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  workingFrequency: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  // Aggregate Insights Sections
  aggregateCard: {
    marginBottom: 20,
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  aggregateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  aggregateHeaderLeft: {
    flex: 1,
  },
  aggregateSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  aggregateCount: {
    fontSize: 13,
    fontWeight: '400',
  },
  aggregateItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  aggregateItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  strengthsTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  growthTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  aggregateContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  aggregateItemCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  aggregateItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  strengthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  strengthBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  growthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  growthBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  aggregateItemMeta: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  aggregateItemText: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  aggregateItemCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  addToPlaybookButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginTop: 4,
  },
  addToPlaybookText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
