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
  Modal,
  ImageBackground,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { mobileAiService } from '../services/mobileAiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePreloadedData } from '../contexts/PreloadContext';
import StandardContainer from '../components/shared/StandardContainer';
import PageHeader from '../components/shared/PageHeader';
import { isTablet, sf, ss, iPadWideContentStyle } from '../utils/responsive';

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

  // Use preloaded data on mount — no network fetch needed initially
  useEffect(() => {
    if (preloaded.isLoaded && user) {
      if (preloaded.userName) setUserName(preloaded.userName);
      // loadStats processes preloaded.notes if available, otherwise fetches
      loadStats();
    }
  }, [preloaded.isLoaded, user]);

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
    if (score == null || Number.isNaN(score)) return 'No recent data';
    if (score <= 3) return 'Running low – be gentle with yourself';
    if (score <= 6) return 'Stable but with room to grow';
    return 'Stable but with room to grow';
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
            title: n.title || 'Untitled entry',
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

  // Helper: capitalize first letter of a string
  const capitalizeFirst = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

  // Helper: make text more personal (replace third-person references)
  const personalizeText = (text: string) => {
    return capitalizeFirst(
      text
        .replace(/The user/g, 'You')
        .replace(/the user/g, 'you')
        .replace(/their /g, 'your ')
        .replace(/Their /g, 'Your ')
        .replace(/they /g, 'you ')
        .replace(/They /g, 'You ')
        .replace(/them /g, 'you ')
        .replace(/his\/her/g, 'your')
    );
  };

  // Helper: get a short origin label from entry content
  const getOriginLabel = (n: any) => {
    const title = n.title || n.content || '';
    const cleaned = title.replace(/^["']|["']$/g, '').trim();
    return cleaned.length > 50 ? cleaned.substring(0, 47) + '...' : cleaned;
  };

  // --- Smart semantic grouping for patterns/strengths ---

  // Stop words to ignore when extracting keywords
  const STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'between',
    'through', 'during', 'before', 'after', 'and', 'but', 'or', 'not',
    'no', 'so', 'if', 'then', 'than', 'too', 'very', 'just', 'also',
    'more', 'most', 'some', 'any', 'all', 'each', 'every', 'this', 'that',
    'these', 'those', 'it', 'its', 'you', 'your', 'yours', 'i', 'my',
    'me', 'we', 'our', 'they', 'their', 'them', 'he', 'she', 'his', 'her',
    'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why',
    'up', 'out', 'off', 'over', 'under', 'again', 'further', 'once',
    'here', 'there', 'both', 'few', 'own', 'same', 'other', 'such',
    'only', 'still', 'get', 'got', 'make', 'made', 'take', 'try',
    'need', 'want', 'like', 'know', 'think', 'feel', 'keep', 'let',
    'begin', 'seem', 'help', 'show', 'tend', 'able', 'way', 'well',
    'even', 'new', 'now', 'one', 'two', 'really', 'often', 'much',
  ]);

  // Extract meaningful keywords from text
  const extractKeywords = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  };

  // Calculate similarity between two keyword sets (Jaccard-like)
  const keywordSimilarity = (a: string[], b: string[]): number => {
    if (a.length === 0 || b.length === 0) return 0;
    const setA = new Set(a);
    const setB = new Set(b);
    let shared = 0;
    setA.forEach(w => { if (setB.has(w)) shared++; });
    const union = new Set([...a, ...b]).size;
    return union > 0 ? shared / union : 0;
  };

  // Check if text is a short actionable title (vs a long descriptive paragraph)
  const isShortTitle = (text: string): boolean => text.length < 60 && !text.includes('. ');

  // Generate a clean title from a group of related texts
  const pickBestTitle = (texts: string[]): string => {
    // Prefer short, actionable titles
    const shortOnes = texts.filter(isShortTitle);
    if (shortOnes.length > 0) {
      // Pick the most descriptive short one
      return shortOnes.sort((a, b) => b.length - a.length)[0];
    }
    // Fallback: take first sentence of longest text
    const longest = texts.sort((a, b) => b.length - a.length)[0];
    const firstSentence = longest.split(/\.\s/)[0];
    return firstSentence.length > 80 ? firstSentence.substring(0, 77) + '...' : firstSentence;
  };

  // Pick the best suggestion/description from a group
  const pickBestDescription = (texts: string[]): string | null => {
    // Find the longest text that reads like advice (has action words)
    const actionWords = ['try', 'consider', 'practice', 'establish', 'set', 'create', 'build', 'develop', 'focus', 'start', 'work', 'take', 'make', 'explore', 'reflect'];
    const descriptive = texts
      .filter(t => t.length > 50)
      .sort((a, b) => {
        const aScore = actionWords.filter(w => a.toLowerCase().includes(w)).length;
        const bScore = actionWords.filter(w => b.toLowerCase().includes(w)).length;
        return bScore - aScore || b.length - a.length;
      });
    if (descriptive.length > 0) {
      const best = descriptive[0];
      // If the title is the same as description, skip
      return best.length > 80 ? best.substring(0, 120) + '...' : best;
    }
    return null;
  };

  // Group raw items by semantic similarity
  const groupBySimilarity = (items: Array<{ text: string; entryId: string; entryIds?: string[]; originLabel: string; date: string }>, threshold = 0.25) => {
    const groups: Array<{
      texts: string[];
      entryIds: string[];
      originLabels: string[];
      dates: string[];
      keywords: string[];
    }> = [];

    items.forEach(item => {
      const keywords = extractKeywords(item.text);
      let bestGroupIdx = -1;
      let bestSim = 0;

      for (let i = 0; i < groups.length; i++) {
        const sim = keywordSimilarity(keywords, groups[i].keywords);
        if (sim > bestSim && sim >= threshold) {
          bestSim = sim;
          bestGroupIdx = i;
        }
      }

      if (bestGroupIdx >= 0) {
        const g = groups[bestGroupIdx];
        g.texts.push(personalizeText(item.text));
        if (!g.entryIds.includes(item.entryId)) g.entryIds.push(item.entryId);
        if (item.originLabel && !g.originLabels.includes(item.originLabel)) g.originLabels.push(item.originLabel);
        g.dates.push(item.date);
        // Merge keywords
        keywords.forEach(k => { if (!g.keywords.includes(k)) g.keywords.push(k); });
      } else {
        groups.push({
          texts: [personalizeText(item.text)],
          entryIds: [item.entryId],
          originLabels: item.originLabel ? [item.originLabel] : [],
          dates: [item.date],
          keywords,
        });
      }
    });

    return groups;
  };

  const loadPatternsData = async (notes: any[]) => {
    try {
      const rawPatterns: Array<{ text: string; entryId: string; originLabel: string; date: string }> = [];
      const rawStrengths: Array<{ text: string; entryId: string; originLabel: string; date: string }> = [];

      console.log('[Dashboard:Patterns] Processing', notes.length, 'notes for patterns');

      notes.forEach(n => {
        if (!n.ai_structured_insights) return;
        const insights = n.ai_structured_insights;
        const entryDate = new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const originLabel = getOriginLabel(n);

        const addRawPattern = (text: string) => {
          if (!text || text === '{}' || text.length < 5) return;
          rawPatterns.push({ text: text.substring(0, 300), entryId: n.id, originLabel, date: entryDate });
        };
        const addRawStrength = (text: string) => {
          if (!text || text === '{}' || text.length < 5) return;
          rawStrengths.push({ text: text.substring(0, 300), entryId: n.id, originLabel, date: entryDate });
        };

        // === AREAS TO IMPROVE / PATTERNS TO ADDRESS ===

        // 1. progress_indicators.areas_for_growth
        if (insights.progress_indicators?.areas_for_growth) {
          const areas = Array.isArray(insights.progress_indicators.areas_for_growth)
            ? insights.progress_indicators.areas_for_growth : [];
          areas.forEach((area: any) => {
            const text = typeof area === 'string' ? area : String(area.description || area.area || JSON.stringify(area));
            addRawPattern(text);
          });
        }

        // 2. coping_strategies.suggested
        if (insights.coping_strategies?.suggested) {
          const suggested = Array.isArray(insights.coping_strategies.suggested)
            ? insights.coping_strategies.suggested : [];
          suggested.forEach((s: any) => {
            const text = typeof s === 'string' ? s : String(s.strategy || s.description || JSON.stringify(s));
            addRawPattern(text);
          });
        }

        // 3. insights_report.insightCards with type "growth" or "reflection"
        if (insights.insights_report?.insightCards) {
          const cards = Array.isArray(insights.insights_report.insightCards)
            ? insights.insights_report.insightCards : [];
          cards.forEach((card: any) => {
            if (card.type === 'growth' || card.type === 'reflection') {
              const text = typeof card === 'string' ? card : String(card.text || card.description || '');
              addRawPattern(text);
            }
          });
        }

        // 4. thought_patterns
        if (Array.isArray(insights.thought_patterns)) {
          insights.thought_patterns.forEach((tp: any) => {
            const text = typeof tp === 'string' ? tp : String(tp.pattern || tp.description || '');
            addRawPattern(text);
          });
        }

        // === WHAT'S WORKING / STRENGTHS ===

        // 1. progress_indicators.positive_signals
        if (insights.progress_indicators?.positive_signals) {
          const signals = Array.isArray(insights.progress_indicators.positive_signals)
            ? insights.progress_indicators.positive_signals : [];
          signals.forEach((signal: any) => {
            const text = typeof signal === 'string' ? signal : String(signal.description || JSON.stringify(signal));
            addRawStrength(text);
          });
        }

        // 2. insights_report.insightCards with type "strength" or "win"
        if (insights.insights_report?.insightCards) {
          const cards = Array.isArray(insights.insights_report.insightCards)
            ? insights.insights_report.insightCards : [];
          cards.forEach((card: any) => {
            if (card.type === 'strength' || card.type === 'win') {
              const text = typeof card === 'string' ? card : String(card.text || card.description || '');
              addRawStrength(text);
            }
          });
        }

        // 3. coping_strategies.current
        if (insights.coping_strategies?.current) {
          const current = Array.isArray(insights.coping_strategies.current)
            ? insights.coping_strategies.current : [];
          current.forEach((c: any) => {
            const text = typeof c === 'string' ? c : String(c.strategy || c.description || JSON.stringify(c));
            addRawStrength(text);
          });
        }
      });

      // --- Smart grouping ---
      const patternGroups = groupBySimilarity(rawPatterns, 0.2);
      const strengthGroups = groupBySimilarity(rawStrengths, 0.2);

      // Convert groups to display items
      const patterns = patternGroups
        .map((g, i) => {
          const title = pickBestTitle(g.texts);
          const description = g.texts.length > 1 ? pickBestDescription(g.texts.filter(t => t !== title)) : null;
          return {
            id: `pattern_${i}`,
            summary: title,
            description: description && description !== title ? description : null,
            date: g.dates[0],
            entryId: g.entryIds[0],
            entryIds: g.entryIds,
            originLabel: g.originLabels[0] || '',
            count: g.entryIds.length,
            rawCount: g.texts.length,
          };
        })
        .sort((a, b) => b.count - a.count || b.rawCount - a.rawCount)
        .slice(0, 15);

      const strengths = strengthGroups
        .map((g, i) => {
          const title = pickBestTitle(g.texts);
          const description = g.texts.length > 1 ? pickBestDescription(g.texts.filter(t => t !== title)) : null;
          return {
            id: `strength_${i}`,
            summary: title,
            description: description && description !== title ? description : null,
            date: g.dates[0],
            entryId: g.entryIds[0],
            entryIds: g.entryIds,
            originLabel: g.originLabels[0] || '',
            count: g.entryIds.length,
            rawCount: g.texts.length,
          };
        })
        .sort((a, b) => b.count - a.count || b.rawCount - a.rawCount)
        .slice(0, 12);

      console.log('[Dashboard:Patterns] Grouped:', patterns.length, 'pattern groups from', rawPatterns.length, 'raw items;', strengths.length, 'strength groups from', rawStrengths.length, 'raw items');

      setPatternsToAddress(patterns);
      setWhatsWorking(strengths);
    } catch (error) {
      console.error('[Dashboard:Patterns] Error:', error);
    }
  };

  const aggregateInsights = async (notes: any[]) => {
    try {
      // Aggregate strengths across all entries
      const strengthsMap: { [key: string]: { count: number; text: string; entries: string[] } } = {};
      const growthMap: { [key: string]: { count: number; text: string; entries: string[] } } = {};

      notes.forEach((n: any) => {
        if (!n.ai_structured_insights) return;
        const insights = n.ai_structured_insights;

        // === Aggregate strengths ===

        // 1. progress_indicators.positive_signals
        const posSignals = insights.progress_indicators?.positive_signals;
        if (Array.isArray(posSignals)) {
          posSignals.forEach((signal: any) => {
            const text = typeof signal === 'string' ? signal : String(signal.description || JSON.stringify(signal));
            const key = text.toLowerCase().substring(0, 30);
            if (!strengthsMap[key]) strengthsMap[key] = { count: 0, text, entries: [] };
            strengthsMap[key].count++;
            strengthsMap[key].entries.push(n.id);
          });
        }

        // 2. coping_strategies.current
        const currentStrats = insights.coping_strategies?.current;
        if (Array.isArray(currentStrats)) {
          currentStrats.forEach((c: any) => {
            const text = typeof c === 'string' ? c : String(c.strategy || c.description || JSON.stringify(c));
            const key = text.toLowerCase().substring(0, 30);
            if (!strengthsMap[key]) strengthsMap[key] = { count: 0, text, entries: [] };
            strengthsMap[key].count++;
            strengthsMap[key].entries.push(n.id);
          });
        }

        // 3. insightCards with type strength/win
        const insightCards = insights.insights_report?.insightCards;
        if (Array.isArray(insightCards)) {
          insightCards.forEach((card: any) => {
            if (card.type === 'strength' || card.type === 'win') {
              const text = typeof card === 'string' ? card : String(card.text || card.description || '');
              if (text) {
                const key = text.toLowerCase().substring(0, 30);
                if (!strengthsMap[key]) strengthsMap[key] = { count: 0, text, entries: [] };
                strengthsMap[key].count++;
                strengthsMap[key].entries.push(n.id);
              }
            }
          });
        }

        // === Aggregate growth areas ===

        // 1. progress_indicators.areas_for_growth
        const areasForGrowth = insights.progress_indicators?.areas_for_growth;
        if (Array.isArray(areasForGrowth)) {
          areasForGrowth.forEach((area: any) => {
            const text = typeof area === 'string' ? area : String(area.description || area.area || JSON.stringify(area));
            const key = text.toLowerCase().substring(0, 30);
            if (!growthMap[key]) growthMap[key] = { count: 0, text, entries: [] };
            growthMap[key].count++;
            growthMap[key].entries.push(n.id);
          });
        }

        // 2. coping_strategies.suggested
        const suggestedStrats = insights.coping_strategies?.suggested;
        if (Array.isArray(suggestedStrats)) {
          suggestedStrats.forEach((s: any) => {
            const text = typeof s === 'string' ? s : String(s.strategy || s.description || JSON.stringify(s));
            const key = text.toLowerCase().substring(0, 30);
            if (!growthMap[key]) growthMap[key] = { count: 0, text, entries: [] };
            growthMap[key].count++;
            growthMap[key].entries.push(n.id);
          });
        }

        // 3. insightCards with type growth/reflection
        if (Array.isArray(insightCards)) {
          insightCards.forEach((card: any) => {
            if (card.type === 'growth' || card.type === 'reflection') {
              const text = typeof card === 'string' ? card : String(card.text || card.description || '');
              if (text) {
                const key = text.toLowerCase().substring(0, 30);
                if (!growthMap[key]) growthMap[key] = { count: 0, text, entries: [] };
                growthMap[key].count++;
                growthMap[key].entries.push(n.id);
              }
            }
          });
        }

        // 4. thought_patterns
        if (Array.isArray(insights.thought_patterns)) {
          insights.thought_patterns.forEach((tp: any) => {
            const text = typeof tp === 'string' ? tp : String(tp.pattern || tp.description || '');
            if (text) {
              const key = text.toLowerCase().substring(0, 30);
              if (!growthMap[key]) growthMap[key] = { count: 0, text, entries: [] };
              growthMap[key].count++;
              growthMap[key].entries.push(n.id);
            }
          });
        }
      });

      // Convert to arrays and sort by frequency
      const topStrengths = Object.values(strengthsMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((s, i) => ({
          id: `strength_${i}`,
          text: s.text,
          count: s.count,
          frequency: s.count > 3 ? 'Recurring strength' : 'Emerging pattern',
          entryIds: s.entries
        }));

      const topGrowth = Object.values(growthMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((g, i) => ({
          id: `growth_${i}`,
          text: g.text,
          count: g.count,
          frequency: g.count > 2 ? 'Pattern to address' : 'Area to explore',
          entryIds: g.entries
        }));

      setAggregateStrengths(topStrengths);
      setAggregateGrowth(topGrowth);
      
      // Set monthly aggregated insights for new sections
      const monthlyStrengthsData = Object.values(strengthsMap)
        .filter(s => s.count >= 2) // Show patterns with 2+ mentions
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(s => ({
          summary: s.text,
          count: s.count,
          entries: s.entries
        }));
      
      const monthlyGrowthData = Object.values(growthMap)
        .filter(g => g.count >= 2) // Show patterns with 2+ mentions
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(g => ({
          summary: g.text,
          count: g.count,
          entries: g.entries
        }));
      
      setMonthlyStrengths(monthlyStrengthsData);
      setMonthlyGrowthAreas(monthlyGrowthData);
    } catch (error) {
      console.error('[Dashboard] Error aggregating insights:', error);
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

  const getOppositeEmotion = (emotion: string): string => {
    const opposites: Record<string, string> = {
      'anxious': 'calm',
      'frustrated': 'content',
      'sad': 'joy',
      'angry': 'peace',
      'overwhelmed': 'clarity',
      'tired': 'energized',
      'stressed': 'relaxed',
    };
    return opposites[emotion.toLowerCase()] || 'balance';
  };

  // Show cards instantly — no staggered animation to prevent janky load-in
  useEffect(() => {
    if (stats) {
      cardAnimations.forEach(anim => anim.setValue(1));
    }
  }, [stats]);

  const loadStats = async () => {
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

      // Store all notes for other features
      setAllNotes(notes || []);

      // Build dominant emotions synchronously (fast) so UI shows immediately
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
      setLoading(false);

      // Check for milestone streaks
      const milestones = [7, 14, 30, 60, 90, 180, 365];
      if (milestones.includes(streak)) {
        setMilestoneStreak(streak);
      }

      // Run heavy async operations in background (UI already visible)
      loadMonthlyStory(notes || []).catch(e => console.error('[Dashboard] Monthly story error:', e));
      checkRememberWhen(notes || []).catch(e => console.error('[Dashboard] Remember when error:', e));
      loadPatternsData(notes || []).catch(e => console.error('[Dashboard] Patterns error:', e));
      aggregateInsights(notes || []).catch(e => console.error('[Dashboard] Aggregate error:', e));

    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Active Theme Background */}
      <LinearGradient
        colors={theme.colors.backgroundGradient as any}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <PageHeader title="Dashboard" />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer} />
        ) : stats ? (
          <>
            {/* Emotion Bubble Map - Enhanced */}
            <Animated.View style={{ opacity: cardAnimations[1], transform: [{ translateY: cardAnimations[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <StandardContainer style={[styles.bubbleMapCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                <View style={styles.bubbleMapHeader}>
                  <Text style={[styles.bubbleMapTitle, { color: theme.colors.primaryText }]}>Emotional landscape</Text>
                  <Text style={[styles.bubbleMapSubtitle, { color: theme.colors.secondaryText }]}>
                    {dominantEmotions.length > 0 ? 'Tap to explore' : 'Track your emotions'}
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
                        
                        return (
                          <TouchableOpacity
                            key={item.emotion}
                            style={[styles.emotionBubble, { width: size, height: size, borderRadius: size / 2, ...position }]}
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
                      
                      <TouchableOpacity
                        style={[styles.emotionBubble, styles.addBubble, { width: 50, height: 50, borderRadius: 25, top: 140, right: 30 }]}
                        activeOpacity={0.8}
                        onPress={() => console.log('[Dashboard] Add emotion tapped')}
                      >
                        <View style={[styles.addBubbleInner, { borderColor: theme.colors.border }]}>
                          <Text style={[styles.addBubbleText, { color: theme.colors.secondaryText }]}>+</Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Enhanced Insights Below Bubbles */}
                    <View style={[styles.emotionInsightSection, { borderTopColor: theme.colors.divider }]}>
                      <Text style={[styles.emotionInsightText, { color: theme.colors.secondaryText }]}>
                        Most recurring: <Text style={[styles.emotionInsightEmphasis, { color: theme.colors.primaryText }]}>{dominantEmotions[0].emotion}</Text> ({dominantEmotions[0].percentage}%)
                      </Text>
                      <Text style={[styles.emotionPromptText, { color: theme.colors.tertiaryText }]}>
                        You've been {dominantEmotions[0].emotion.toLowerCase()} this week. Want to explore what brings you more {getOppositeEmotion(dominantEmotions[0].emotion)}?
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyBubbleContainer}>
                    <Ionicons name="happy-outline" size={48} color={theme.colors.secondaryText} />
                    <Text style={[styles.emptyBubbleText, { color: theme.colors.secondaryText }]}>
                      Your emotions will appear here as you journal
                    </Text>
                  </View>
                )}
              </StandardContainer>
            </Animated.View>

            {/* Patterns to Address */}
            {patternsToAddress.length > 0 && (
              <StandardContainer style={[styles.patternsCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                <TouchableOpacity 
                  style={styles.patternsHeader}
                  onPress={() => setPatternsExpanded(!patternsExpanded)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="leaf-outline" size={20} color="#10b981" />
                    <Text style={[styles.patternsTitle, { color: theme.colors.primaryText }]}>Patterns to Address ({patternsToAddress.length})</Text>
                  </View>
                  <Ionicons 
                    name={patternsExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={theme.colors.secondaryText} 
                  />
                </TouchableOpacity>
                <Text style={[styles.patternSubtitle, { color: theme.colors.tertiaryText }]}>Top priorities based on your recent entries</Text>
                
                <View style={styles.patternsContent}>
                  {patternsToAddress.slice(0, patternsExpanded ? patternsToAddress.length : 2).map((pattern) => (
                    <TouchableOpacity
                      key={pattern.id}
                      style={[styles.patternCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                      onPress={() => {
                        const entry = allNotes.find((n: any) => n.id === pattern.entryId);
                        if (entry) {
                          navigation.navigate('EntryDetail', { entry, highlightText: pattern.summary });
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      {pattern.count > 1 && (
                        <View style={styles.frequencyBadge}>
                          <Ionicons name="flame" size={13} color="#ef4444" />
                          <Text style={styles.frequencyText}>x{pattern.count}</Text>
                        </View>
                      )}
                      <Text style={[styles.patternSummary, { color: theme.colors.primaryText }]}>{pattern.summary}</Text>
                      {pattern.description ? (
                        <Text style={[styles.patternDescription, { color: theme.colors.secondaryText }]} numberOfLines={3}>
                          {pattern.description}
                        </Text>
                      ) : null}
                      {pattern.originLabel ? (
                        <Text style={[styles.patternOrigin, { color: theme.colors.tertiaryText }]} numberOfLines={1}>
                          from "{pattern.originLabel}"
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                  
                  {!patternsExpanded && patternsToAddress.length > 2 && (
                    <TouchableOpacity
                      style={[styles.viewAllButton, { borderColor: theme.colors.border }]}
                      onPress={() => setPatternsExpanded(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.viewAllText, { color: isDarkTheme(theme.name) ? theme.colors.primary : '#8b5cf6' }]}>View {patternsToAddress.length - 2} More Focus Areas →</Text>
                    </TouchableOpacity>
                  )}
                  {patternsExpanded && patternsToAddress.length > 2 && (
                    <TouchableOpacity
                      style={[styles.viewAllButton, { borderColor: theme.colors.border }]}
                      onPress={() => setPatternsExpanded(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.viewAllText, { color: isDarkTheme(theme.name) ? theme.colors.primary : '#8b5cf6' }]}>Show Less</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </StandardContainer>
            )}

            {/* What's Working */}
            {whatsWorking.length > 0 && (
              <StandardContainer style={[styles.workingCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                <TouchableOpacity 
                  style={styles.workingHeader}
                  onPress={() => setWorkingExpanded(!workingExpanded)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="sparkles-outline" size={20} color="#f59e0b" />
                    <Text style={[styles.workingTitle, { color: theme.colors.primaryText }]}>What's Working ({whatsWorking.length})</Text>
                  </View>
                  <Ionicons 
                    name={workingExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={theme.colors.secondaryText} 
                  />
                </TouchableOpacity>
                <Text style={[styles.patternSubtitle, { color: theme.colors.tertiaryText }]}>Strategies that are helping you thrive</Text>
                
                <View style={styles.workingContent}>
                  {whatsWorking.slice(0, workingExpanded ? whatsWorking.length : 2).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.workingItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                      onPress={() => {
                        const entry = allNotes.find((n: any) => n.id === item.entryId);
                        if (entry) {
                          navigation.navigate('EntryDetail', { entry, highlightText: item.summary });
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      {item.count > 1 && (
                        <View style={[styles.frequencyBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                          <Ionicons name="flame" size={13} color="#10b981" />
                          <Text style={[styles.frequencyText, { color: '#10b981' }]}>x{item.count}</Text>
                        </View>
                      )}
                      <Text style={[styles.workingSummary, { color: theme.colors.primaryText }]}>{item.summary}</Text>
                      {item.description ? (
                        <Text style={[styles.patternDescription, { color: theme.colors.secondaryText }]} numberOfLines={3}>
                          {item.description}
                        </Text>
                      ) : null}
                      {item.originLabel ? (
                        <Text style={[styles.patternOrigin, { color: theme.colors.tertiaryText }]} numberOfLines={1}>
                          from "{item.originLabel}"
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}

                  {!workingExpanded && whatsWorking.length > 2 && (
                    <TouchableOpacity
                      style={[styles.viewAllButton, { borderColor: theme.colors.border }]}
                      onPress={() => setWorkingExpanded(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.viewAllText, { color: isDarkTheme(theme.name) ? theme.colors.primary : '#8b5cf6' }]}>View {whatsWorking.length - 2} More Strengths →</Text>
                    </TouchableOpacity>
                  )}
                  {workingExpanded && whatsWorking.length > 2 && (
                    <TouchableOpacity
                      style={[styles.viewAllButton, { borderColor: theme.colors.border }]}
                      onPress={() => setWorkingExpanded(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.viewAllText, { color: isDarkTheme(theme.name) ? theme.colors.primary : '#8b5cf6' }]}>Show Less</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </StandardContainer>
            )}

            {/* Refined This Week Card - Horizontal Layout */}
            <StandardContainer style={[styles.heroCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
              <Text style={[styles.heroTitle, { color: theme.colors.primaryText }]}>This week at a glance</Text>
              
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <View style={styles.metricIconValue}>
                    <Text style={styles.metricEmoji}>🔥</Text>
                    <Text style={[styles.metricValue, { color: theme.colors.primaryText }]}>
                      {stats.currentStreak > 0 ? stats.currentStreak : '-'}
                    </Text>
                  </View>
                  <Text style={[styles.metricLabel, { color: theme.colors.secondaryText }]}>DAY STREAK</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <View style={styles.metricIconValue}>
                    <Text style={styles.metricEmoji}>😊</Text>
                    <Text style={[styles.metricValue, { color: theme.colors.primaryText }]}>
                      {stats.avgWellbeingScore > 0 ? `${stats.avgWellbeingScore}/10` : '-'}
                    </Text>
                  </View>
                  <Text style={[styles.metricLabel, { color: theme.colors.secondaryText }]}>AVG MOOD</Text>
                </View>
              </View>
              
              {/* Interpretive sentence */}
              <Text style={[styles.interpretiveSentence, { color: theme.colors.secondaryText }]}> 
                {stats.totalEntries === 0
                  ? 'Start your journey by creating your first entry.'
                  : stats.avgWellbeingScore >= 7 
                  ? 'A steady week with consistent emotional balance.'
                  : stats.avgWellbeingScore >= 5
                  ? 'A steady week overall.'
                  : stats.avgWellbeingScore > 0
                  ? 'You\'ve been navigating some challenges this week.'
                  : 'Begin tracking your mood to see insights here.'}
              </Text>
            </StandardContainer>

            {/* Progress Story Card - Enhanced with Inline Highlights */}
            {monthlyStory && (
              <Animated.View style={{ opacity: cardAnimations[0], transform: [{ translateY: cardAnimations[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <StandardContainer style={[styles.progressStoryCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
                  <Text style={[styles.progressStoryTitle, { color: theme.colors.primaryText }]}>Your {new Date().toLocaleDateString('en-US', { month: 'long' })} Story</Text>
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
                              <Text style={styles.inlineHighlightIcon}>✨</Text>
                              <Text style={[styles.inlineHighlightText, { color: theme.colors.secondaryText }]}>
                                Strongest day: <Text style={[styles.inlineHighlightValue, { color: theme.colors.primary }]}>{narrativeHighlights.strongestResilience.date}</Text>
                              </Text>
                            </View>
                          )}
                          {narrativeHighlights.keyTheme && (
                            <View style={styles.inlineHighlightRow}>
                              <Text style={styles.inlineHighlightIcon}>💭</Text>
                              <Text style={[styles.inlineHighlightText, { color: theme.colors.secondaryText }]}>
                                Key theme: <Text style={[styles.inlineHighlightValue, { color: theme.colors.primary }]}>{narrativeHighlights.keyTheme.theme}</Text> ({narrativeHighlights.keyTheme.count} entries)
                              </Text>
                            </View>
                          )}
                          {narrativeHighlights.newStrategy && (
                            <View style={styles.inlineHighlightRow}>
                              <Text style={styles.inlineHighlightIcon}>🌱</Text>
                              <Text style={[styles.inlineHighlightText, { color: theme.colors.secondaryText }]}>
                                Strategy: <Text style={[styles.inlineHighlightValue, { color: theme.colors.primary }]}>{narrativeHighlights.newStrategy}</Text>
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                      
                      <TouchableOpacity 
                        style={styles.readFullStoryButton}
                        onPress={() => setShowFullStory(true)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#8b5cf6', '#7c3aed']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.readFullStoryGradient}
                        >
                          <Text style={styles.readFullStoryText}>Read Full Story →</Text>
                        </LinearGradient>
                      </TouchableOpacity>
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
                  <Text style={styles.milestoneIcon}>🌱</Text>
                  <Text style={styles.milestoneTitle}>Quiet Achievement</Text>
                  <Text style={styles.milestoneMessage}>
                    You've reflected for {milestoneStreak} days in a row. That's a real commitment to understanding yourself.
                  </Text>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Remember When Callback */}
            {rememberWhenCard && (
              <Animated.View style={{ opacity: cardAnimations[3], transform: [{ translateY: cardAnimations[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <StandardContainer style={styles.rememberWhenCard}>
                  <Text style={styles.rememberWhenIcon}>💭</Text>
                  <Text style={[styles.rememberWhenTitle, { color: theme.colors.primaryText }]}>You've been here before</Text>
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
                    <Text style={[styles.viewEntryText, { color: theme.colors.primaryText }]}>View That Entry →</Text>
                  </TouchableOpacity>
                </StandardContainer>
              </Animated.View>
            )}

          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart" size={64} color="#666" />
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        )}
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
                      {userName ? `${userName}'s ${new Date().toLocaleDateString('en-US', { month: 'long' })} Story` : `Your ${new Date().toLocaleDateString('en-US', { month: 'long' })} Story`}
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
                      {userName ? `${userName}'s ${new Date().toLocaleDateString('en-US', { month: 'long' })} Story` : `Your ${new Date().toLocaleDateString('en-US', { month: 'long' })} Story`}
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
                      <Text style={styles.premiumSectionTitle}>NARRATIVE HIGHLIGHTS</Text>
                    }
                  >
                    <LinearGradient
                      colors={['#FFFFFF', '#D4AF37']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ height: 30 }}
                    >
                      <Text style={[styles.premiumSectionTitle, { opacity: 0 }]}>NARRATIVE HIGHLIGHTS</Text>
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
                            <Text style={styles.premiumHighlightIcon}>✨</Text>
                          </LinearGradient>
                        </View>
                        <View style={styles.highlightTextContainer}>
                          <Text style={styles.premiumHighlightText}>
                            <Text style={styles.premiumHighlightLabel}>Strongest Resilience: </Text>
                            <Text style={styles.premiumHighlightValue}>{narrativeHighlights.strongestResilience.date}</Text>
                          </Text>
                          <Text style={styles.premiumHighlightSubtext}>"{narrativeHighlights.strongestResilience.title}" • Tap to view</Text>
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
                            <Text style={styles.premiumHighlightIcon}>💭</Text>
                          </LinearGradient>
                        </View>
                        <View style={styles.highlightTextContainer}>
                          <Text style={styles.premiumHighlightText}>
                            <Text style={styles.premiumHighlightLabel}>Key Theme: </Text>
                            <Text style={styles.premiumHighlightValue}>{narrativeHighlights.keyTheme.theme}</Text>
                            <Text style={styles.premiumHighlightMeta}> ({narrativeHighlights.keyTheme.count} entries)</Text>
                          </Text>
                        </View>
                      </View>
                    )}

                    {narrativeHighlights.newStrategy && (
                      <View style={styles.premiumHighlightRow}>
                        <Text style={styles.premiumHighlightText}>
                          <Text style={styles.premiumHighlightIcon}>🌱 </Text>
                          <Text style={styles.premiumHighlightLabel}>Strategy: </Text>
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
                      <Text style={styles.premiumSectionTitle}>YOUR DATA THIS MONTH</Text>
                    }
                  >
                    <LinearGradient
                      colors={['#FFFFFF', '#D4AF37']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ height: 30 }}
                    >
                      <Text style={[styles.premiumSectionTitle, { opacity: 0 }]}>YOUR DATA THIS MONTH</Text>
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
                          <Text style={styles.statIcon}>📊</Text>
                        </LinearGradient>
                        <View style={styles.statTextContainer}>
                          <Text style={styles.statValue}>{monthlyStats.totalReflections}</Text>
                          <Text style={styles.statLabel}>Total reflections</Text>
                        </View>
                      </View>
                      
                      <View style={styles.statCompactCard}>
                        <LinearGradient
                          colors={['rgba(255, 100, 50, 0.3)', 'rgba(255, 100, 50, 0.1)']}
                          style={styles.statIconGlow}
                        >
                          <Text style={styles.statIcon}>🔥</Text>
                        </LinearGradient>
                        <View style={styles.statTextContainer}>
                          <Text style={styles.statValue}>{monthlyStats.longestStreak}</Text>
                          <Text style={styles.statLabel}>Longest streak</Text>
                        </View>
                      </View>
                      
                      {monthlyStats.bestDay && (
                        <View style={styles.statCompactCard}>
                          <LinearGradient
                            colors={['rgba(255, 200, 80, 0.3)', 'rgba(255, 200, 80, 0.1)']}
                            style={styles.statIconGlow}
                          >
                            <Text style={styles.statIcon}>😊</Text>
                          </LinearGradient>
                          <View style={styles.statTextContainer}>
                            <Text style={styles.statValue}>{monthlyStats.bestDay.score}/10</Text>
                            <Text style={styles.statLabel}>Best day</Text>
                            <Text style={styles.statMeta}>({monthlyStats.bestDay.date})</Text>
                          </View>
                        </View>
                      )}
                      
                      <View style={styles.statCompactCard}>
                        <LinearGradient
                          colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)']}
                          style={styles.statIconGlow}
                        >
                          <Text style={styles.statIcon}>💪</Text>
                        </LinearGradient>
                        <View style={styles.statTextContainer}>
                          <Text style={styles.statValue}>{monthlyStats.avgResilience}/10</Text>
                          <Text style={styles.statLabel}>Avg resilience</Text>
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
    padding: isTablet ? 40 : 20,
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
  statValue: {
    fontSize: sf(40),
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
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  bubbleEmotionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 16,
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
  inlineHighlightIcon: {
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
  milestoneIcon: {
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
  rememberWhenIcon: {
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
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(128, 128, 128, 0.3)',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  priorityMedium: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  priorityLow: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
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
    marginBottom: 8,
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
  patternOrigin: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
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
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  workingFrequency: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
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
  aggregateContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  aggregateItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  aggregateItemText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  aggregateItemCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  aggregateItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  addToPlaybookButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  addToPlaybookText: {
    fontSize: 12,
    fontWeight: '600',
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
