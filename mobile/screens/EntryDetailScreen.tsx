import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, LayoutAnimation, Platform, UIManager, Animated, Modal, KeyboardAvoidingView, Image, Keyboard, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Purchases from 'react-native-purchases';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { navigateToPlaybook } from '../utils/navigateToPlaybook';
import { mobileAiService } from '../services/mobileAiService';
import { checkAIConsent } from '../services/aiConsentService';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ImmersiveAnalysisOverlay from '../components/shared/ImmersiveAnalysisOverlay';
import StandardContainer from '../components/shared/StandardContainer';
import PremiumUpsellOverlay from '../components/PremiumUpsellOverlay';
import * as Haptics from 'expo-haptics';
import { isTablet, sf, ss, si } from '../utils/responsive';
import SunoGradient from '../components/onboarding/SunoGradient';
import { decryptEntryFieldsCached } from '../utils/decryptBatch';
import { setCachedEntry, entryVersion } from '../utils/decryptCache';
import MoodIcon from '../components/checkin/MoodIcon';
import { fetchCheckInForNote, StoredCheckIn } from '../services/checkInService';
import { useLanguage } from '../contexts/LanguageContext';
import { withContentLocale } from '../i18n/contentLocale';
import { translateEmotion } from '../i18n/labels';
import GoDeeperThread from '../components/editor/GoDeeperThread';
import InsightCompanionMark from '../components/companion/InsightCompanionMark';
import { formatJournalPromptContent, extractJournalPromptText, stripJournalPromptTag } from '../constants/branding';
import { useEditorKeyboardPadding } from '../hooks/useEditorKeyboardPadding';
import { useTypewriterReveal } from '../hooks/useTypewriterReveal';
import {
  loadGoDeeperConversation,
  saveGoDeeperConversation,
  createGoDeeperMessage,
  type GoDeeperMessage,
} from '../services/goDeeperConversationService';

// Helper function to get color styling based on emotion sentiment
const getSentimentStyle = (emotion: string) => {
  const emotionLower = emotion.toLowerCase();
  
  // Positive emotions - green/purple tint
  if (emotionLower.includes('content') || emotionLower.includes('happy') || 
      emotionLower.includes('joy') || emotionLower.includes('excited') ||
      emotionLower.includes('grateful') || emotionLower.includes('hopeful')) {
    return {
      backgroundColor: 'rgba(34, 197, 94, 0.12)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
    };
  }
  
  // Stressful/anxious emotions - orange/amber tint
  if (emotionLower.includes('stress') || emotionLower.includes('anxious') ||
      emotionLower.includes('worried') || emotionLower.includes('overwhelm')) {
    return {
      backgroundColor: 'rgba(251, 146, 60, 0.12)',
      borderColor: 'rgba(251, 146, 60, 0.3)',
    };
  }
  
  // Sad/down emotions - soft blue tint
  if (emotionLower.includes('sad') || emotionLower.includes('down') ||
      emotionLower.includes('depressed') || emotionLower.includes('lonely')) {
    return {
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
    };
  }
  
  // Default - purple tint
  return {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  };
};

// Helper function to get styling for insight cards based on type
// Uses theme-consistent glassmorphic styling — no colored text
const getInsightCardStyle = (_type: string) => {
  // All card types use the same neutral glassmorphic style
  // Differentiation comes from the badge label text, not colors
  return {
    container: {},
    border: {},
    badge: {},
    badgeText: {},
    button: {},
    buttonColor: 'rgba(255, 255, 255, 0.7)',
  };
};

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EntryDetailScreenNew({ route, navigation }: any) {
  const { entry: initialEntry, entryId, shouldAnalyze, highlightText } = route.params || {};
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t, formatDate: formatLocalizedDate, language } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [entry, setEntry] = useState<any>(initialEntry || null);
  const [editableContent, setEditableContent] = useState(initialEntry?.content || '');
  const [editableTitle, setEditableTitle] = useState(initialEntry?.title || '');
  const [isModified, setIsModified] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [strengthsExpanded, setStrengthsExpanded] = useState(true);
  const [growthExpanded, setGrowthExpanded] = useState(true);
  const [addingToPlaybook, setAddingToPlaybook] = useState<string | null>(null);

  const [analysisOverlayVisible, setAnalysisOverlayVisible] = useState(false);
  const [analysisOverlayMode, setAnalysisOverlayMode] = useState<'loading' | 'results'>('loading');
  const [analysisOverlayMessage, setAnalysisOverlayMessage] = useState(() => t('entry.loadingAnalysis'));
  const [analysisOverlayInsights, setAnalysisOverlayInsights] = useState<any>(undefined);
  const analysisProgress = useRef(new Animated.Value(0)).current;
  const analysisAbortRef = useRef<AbortController | null>(null);
  const analysisMessageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [premiumUpsellVisible, setPremiumUpsellVisible] = useState(false);
  const [playbookPreviewVisible, setPlaybookPreviewVisible] = useState(false);
  const [playbookDraft, setPlaybookDraft] = useState({ title: '', description: '', emoji: '📈' });
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [mood, setMood] = useState(initialEntry?.mood || '');
  const [linkedCheckIn, setLinkedCheckIn] = useState<StoredCheckIn | null>(null);
  const [attachedPhotos, setAttachedPhotos] = useState<Array<{ uri: string; width: number; height: number }>>([]);
  const quickActionsAnim = useRef(new Animated.Value(0)).current;
  const controlsBottomAnim = useRef(new Animated.Value(20)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const insightsSectionY = useRef<number>(0);
  const [goDeeperMessages, setGoDeeperMessages] = useState<GoDeeperMessage[]>([]);
  const [goDeeperReply, setGoDeeperReply] = useState('');
  const [isGoDeeperLoading, setIsGoDeeperLoading] = useState(false);
  const { scrollPaddingBottom } = useEditorKeyboardPadding();
  const { activeId: typingMessageId, displayText: typingDisplayText, startReveal } = useTypewriterReveal();
  const [highlightedCardText, setHighlightedCardText] = useState<string | null>(highlightText || null);

  // Auto-scroll to insights when navigating from Dashboard with highlightText
  useEffect(() => {
    if (highlightText && entry?.ai_structured_insights) {
      // Ensure both accordions are expanded so user can see the highlighted card
      setStrengthsExpanded(true);
      setGrowthExpanded(true);
      // Scroll to insights section after a short delay for layout
      setTimeout(() => {
        if (insightsSectionY.current > 0) {
          scrollViewRef.current?.scrollTo({ y: insightsSectionY.current - 80, animated: true });
        }
      }, 500);
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedCardText(null), 3000);
    }
  }, [highlightText, entry]);

  const toggleAccordion = (section: 'strengths' | 'growth') => {
    // Configure smooth animation
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Toggle state
    if (section === 'strengths') {
      setStrengthsExpanded(!strengthsExpanded);
    } else {
      setGrowthExpanded(!growthExpanded);
    }
  };

  const loadLinkedCheckIn = (noteId: string) => {
    if (!user?.id) return;
    fetchCheckInForNote(user.id, noteId)
      .then((checkIn) => setLinkedCheckIn(checkIn))
      .catch((error) => {
        console.warn('[EntryDetail] Linked check-in skipped:', error?.message || error);
      });
  };

  useEffect(() => {
    const hydrateEntry = async () => {
      if (initialEntry) {
        const decrypted = user?.id
          ? await decryptEntryFieldsCached(initialEntry, user.id)
          : initialEntry;
        setEntry(decrypted);
        setEditableContent(decrypted.content || '');
        setEditableTitle(decrypted.title || '');
        loadLinkedCheckIn(decrypted.id);

        if (shouldAnalyze && !decrypted.ai_structured_insights) {
          handleAnalyzeEntry(decrypted);
        }
      } else if (entryId) {
        loadEntry();
      }
    };

    hydrateEntry();
  }, [entryId, initialEntry]);

  useEffect(() => {
    return () => {
      if (analysisMessageIntervalRef.current) {
        clearInterval(analysisMessageIntervalRef.current);
      }
      if (analysisAbortRef.current) {
        analysisAbortRef.current.abort();
      }
    };
  }, []);

  const loadEntry = async () => {
    if (!entryId) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', entryId)
        .single();
      
      if (!error && data) {
        const decrypted = user?.id
          ? await decryptEntryFieldsCached(data, user.id)
          : data;
        setEntry(decrypted);
        setEditableContent(decrypted.content || '');
        setEditableTitle(decrypted.title || '');
        loadLinkedCheckIn(decrypted.id);
        
        if (shouldAnalyze && !data.ai_structured_insights) {
          handleAnalyzeEntry(data);
        }
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    }
  };

  useEffect(() => {
    if (!entry) return;
    const hasChanged = editableContent !== entry?.content || editableTitle !== entry?.title;
    setIsModified(hasChanged);
  }, [editableContent, editableTitle, entry]);

  const saveEntry = async () => {
    if (!entry) return;
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: editableTitle.trim() || t('entry.untitled'),
          content: editableContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', entry.id);

      if (!error) {
        const savedTitle = editableTitle.trim() || t('entry.untitled');
        const savedContent = editableContent.trim();
        const savedAt = new Date().toISOString();
        entry.title = savedTitle;
        entry.content = savedContent;
        entry.updated_at = savedAt;
        if (user?.id && entry.id) {
          setCachedEntry(
            user.id,
            entry.id,
            entryVersion({ ...entry, updated_at: savedAt, content: savedContent, title: savedTitle }),
            savedTitle,
            savedContent,
          );
        }
        setIsModified(false);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  useEffect(() => {
    if (!isModified || !entry) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveEntry();
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editableContent, editableTitle, isModified]);

  // Force save when navigating away
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      if (isModified && entry) {
        saveEntry();
      }
    });
    return unsubscribe;
  }, [navigation, editableContent, editableTitle, isModified, entry]);

  const handleCancelAnalysis = () => {
    if (analysisMessageIntervalRef.current) {
      clearInterval(analysisMessageIntervalRef.current);
      analysisMessageIntervalRef.current = null;
    }
    if (analysisAbortRef.current) {
      analysisAbortRef.current.abort();
      analysisAbortRef.current = null;
    }
    analysisProgress.stopAnimation();
    analysisProgress.setValue(0);
    setAnalysisOverlayVisible(false);
    setAnalyzing(false);
  };

  const handleAnalyzeEntry = async (entryData?: any) => {
    const targetEntry = entryData || entry;
    if (!targetEntry?.content || analyzing) return;

    // Dismiss keyboard immediately when analysis starts
    Keyboard.dismiss();

    // Check admin/unlimited emails FIRST (before subscription check)
    const UNLIMITED_EMAILS = ['edwardsjonny547@gmail.com'];
    const ADMIN_EMAILS = ['orwellmax24@gmail.com'];
    const DEMO_EMAILS: string[] = ['insight@gmail.com']; // Jonas demo account
    const userEmail = user?.email?.toLowerCase() || '';
    const isUnlimited = UNLIMITED_EMAILS.includes(userEmail) || __DEV__;
    const isAdmin = ADMIN_EMAILS.includes(userEmail);
    const isDemoUser = DEMO_EMAILS.includes(userEmail);

    // Check subscription status (skip for admin/unlimited/demo users)
    if (!isUnlimited && !isAdmin && !isDemoUser) {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const ENTITLEMENT_ID = 'Insight Pro';
        const isProActive = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
        const hasAnyActiveEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
        
        // If user doesn't have subscription, show premium overlay immediately
        if (!isProActive && !hasAnyActiveEntitlement) {
          console.log('[EntryDetail] User has no subscription - showing premium overlay');
          setPremiumUpsellVisible(true);
          return;
        }
        
        // CRITICAL: Verify subscription belongs to THIS user, not another account on same device
        const originalOwner = customerInfo.originalAppUserId;
        const currentUserId = user?.id;
        if (currentUserId && originalOwner && originalOwner !== currentUserId && !originalOwner.startsWith('$RCAnonymousID:')) {
          console.log('[EntryDetail] Subscription belongs to different user:', originalOwner, 'current:', currentUserId);
          setPremiumUpsellVisible(true);
          return;
        }
      } catch (error) {
        console.error('[EntryDetail] Error checking subscription:', error);
        // If we can't check subscription, show premium overlay to be safe
        setPremiumUpsellVisible(true);
        return;
      }
    } else {
      console.log('[EntryDetail] ✅ Admin/Unlimited/Demo user - bypassing subscription check');
    }
    const dailyLimit = isDemoUser ? 3 : (isAdmin ? 10 : 2);
    
    if (!isUnlimited) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { count, error: countError } = await supabase
          .from('usage_tracking')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id)
          .eq('action_type', 'ai_analysis')
          .gte('created_at', today);

        if (!countError && (count || 0) >= dailyLimit) {
          console.log('[EntryDetail] Daily usage limit reached:', count, '/', dailyLimit);
          Alert.alert(
            t('entry.dailyLimit'),
            t('entry.dailyLimitMessage', { limit: dailyLimit }),
            [{ text: t('common.ok') }]
          );
          return;
        }
      } catch (err) {
        console.warn('[EntryDetail] Error checking usage limit:', err);
        // Don't block on error — allow analysis to proceed
      }
    }

    const ANALYSIS_MIN_MS = 10000;
    const messages = [
      t('entry.loadingAnalysis'), t('entry.synthesizing'), t('entry.emotions'),
      t('entry.clarity'), t('entry.finalizing'),
    ];

    try {
      setAnalyzing(true);

      // Start immersive overlay immediately
      setAnalysisOverlayMode('loading');
      setAnalysisOverlayVisible(true);
      setAnalysisOverlayInsights(undefined);
      analysisProgress.setValue(0);
      setAnalysisOverlayMessage(messages[0]);

      // Rotate text while loading
      let messageIndex = 0;
      if (analysisMessageIntervalRef.current) {
        clearInterval(analysisMessageIntervalRef.current);
      }
      analysisMessageIntervalRef.current = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setAnalysisOverlayMessage(messages[messageIndex]);
      }, 2200);

      // Progress bar takes exactly 10 seconds
      Animated.timing(analysisProgress, {
        toValue: 1,
        duration: ANALYSIS_MIN_MS,
        useNativeDriver: false,
      }).start();

      // Cancel support via AbortController
      const abortController = new AbortController();
      analysisAbortRef.current = abortController;

      const startedAt = Date.now();
      const minDelay = new Promise((resolve) => setTimeout(resolve, ANALYSIS_MIN_MS));
      const analysisPromise = mobileAiService.analyzeEntry(targetEntry.content, { signal: abortController.signal });

      const [analysis] = (await Promise.all([analysisPromise, minDelay])) as any;

      // Check if analysis was successful
      if (!analysis || typeof analysis !== 'object') {
        throw new Error('Invalid analysis response from AI service');
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed < ANALYSIS_MIN_MS) {
        await new Promise((resolve) => setTimeout(resolve, ANALYSIS_MIN_MS - elapsed));
      }

      const { error } = await supabase
        .from('notes')
        .update({
          ai_insights: analysis,
          ai_structured_insights: analysis,
          ai_last_analyzed: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetEntry.id);

      if (error) {
        console.error('[EntryDetail] Supabase update error:', error);
        throw new Error(`Failed to save analysis: ${error.message}`);
      }

      targetEntry.ai_structured_insights = analysis;
      targetEntry.ai_last_analyzed = new Date().toISOString();
      setEntry({ ...targetEntry });

      // Track usage for daily limit counter
      if (user) {
        supabase.from('usage_tracking').insert({
          user_id: user.id,
          action_type: 'ai_analysis',
        }).then(({ error: trackError }) => {
          if (trackError) console.warn('[EntryDetail] Usage tracking insert failed:', JSON.stringify(trackError));
          else console.log('[EntryDetail] Usage tracking recorded successfully');
        });

        // Save growth recommendations as suggested strategies for the Playbook
        // Generate proper actionable protocols via AI (non-blocking, parallel)
        const allCards = analysis?.insights_report?.insightCards || [];
        const growthCards = allCards.filter((c: any) => c.type === 'growth' || c.type === 'reflection');
        Promise.all(growthCards.map(async (card: any) => {
          if (!card.text) return;
          try {
            const protocol = await mobileAiService.generateProtocol(card.text);
            const description = `${protocol.practice}\n\n**${t('entry.whyItWorks')}:** ${protocol.why}`;
            const { error: suggestError } = await supabase.from('actionable_insights').insert({
              user_id: user.id,
              title: protocol.name,
              description,
              category: 'general',
              difficulty: 'moderate',
              emoji: card.type === 'growth' ? '🌱' : '💭',
              status: 'suggested',
              source: withContentLocale('ai_suggested', language),
              source_entry_id: targetEntry.id,
            });
            if (suggestError) console.warn('[EntryDetail] Suggested strategy insert failed:', JSON.stringify(suggestError));
            else console.log('[EntryDetail] Suggested strategy saved:', protocol.name);
          } catch (err) {
            console.warn('[EntryDetail] Failed to generate suggested protocol:', err);
          }
        })).catch(err => console.warn('[EntryDetail] Suggested strategies batch error:', err));
      }

      // Stop rotating messages
      if (analysisMessageIntervalRef.current) {
        clearInterval(analysisMessageIntervalRef.current);
        analysisMessageIntervalRef.current = null;
      }

      // Show interim results overlay with full insights
      setAnalysisOverlayInsights(analysis);
      setAnalysisOverlayMode('results');
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // Cancelled by user
        return;
      }
      
      // Stop rotating messages
      if (analysisMessageIntervalRef.current) {
        clearInterval(analysisMessageIntervalRef.current);
        analysisMessageIntervalRef.current = null;
      }
      
      // Close the analysis overlay
      setAnalysisOverlayVisible(false);
      analysisProgress.setValue(0);
      
      // Show specific error message from the service
      const errorMessage = err?.message || t('entry.analysisError');
      
      // Check if this is a subscription error
      if (errorMessage.includes('Subscription required') || errorMessage.includes('subscription')) {
        // Show premium upsell overlay
        setPremiumUpsellVisible(true);
      } else {
        // Show generic error alert
        Alert.alert(t('entry.analysisFailed'), errorMessage);
      }
    } finally {
      analysisAbortRef.current = null;
      setAnalyzing(false);
    }
  };

  const handleAddToPlaybook = async (growthText: string, cardIndex: number) => {
    if (!user || addingToPlaybook) return;

    try {
      setAddingToPlaybook(`growth-${cardIndex}`);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Generate actionable protocol using AI
      const protocol = await mobileAiService.generateProtocol(growthText);

      // Show preview overlay so user can review/edit before saving
      setPlaybookDraft({
        title: protocol.name,
        description: `${protocol.practice}\n\n${t('entry.whyItWorks')}: ${protocol.why}`,
        emoji: '📈',
      });
      setPlaybookPreviewVisible(true);
    } catch (error) {
      console.error('[EntryDetail] Error generating protocol:', error);
      Alert.alert(t('common.error'), t('entry.protocolFailed'));
    } finally {
      setAddingToPlaybook(null);
    }
  };

  const confirmAddToPlaybook = async () => {
    if (!user || !playbookDraft.title.trim()) return;

    try {
      const { error } = await supabase
        .from('actionable_insights')
        .insert({
          user_id: user.id,
          title: playbookDraft.title.trim(),
          description: playbookDraft.description.trim(),
          category: 'general',
          difficulty: 'moderate',
          emoji: playbookDraft.emoji,
          status: 'active',
          source: withContentLocale('ai_suggested', language),
        });

      if (error) {
        console.error('[EntryDetail] Error saving protocol:', error);
        Alert.alert(t('common.error'), t('entry.addFailed'));
        return;
      }

      setPlaybookPreviewVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('entry.added'),
        t('entry.addedMessage', { title: playbookDraft.title }),
        [
          { text: t('entry.viewPlaybook'), onPress: () => navigateToPlaybook(navigation) },
          { text: t('common.ok'), style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('[EntryDetail] Error saving protocol:', error);
      Alert.alert(t('common.error'), t('entry.saveFailed'));
    }
  };

  const formatDate = (dateString: string) => {
    return formatLocalizedDate(dateString, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const MOODS = ['😊', '😌', '😔', '😤', '😰', '🥰', '😴', '🤔', '😢', '🙂', '😁', '😐'];

  useEffect(() => {
    if (!user?.id || !entry?.id) return;
    loadGoDeeperConversation(user.id, entry.id).then(setGoDeeperMessages);
  }, [user?.id, entry?.id]);

  const persistGoDeeper = async (messages: GoDeeperMessage[]) => {
    if (!user?.id || !entry?.id) return;
    await saveGoDeeperConversation(user.id, messages, entry.id);
  };

  const getJournalBodyForGoDeeper = () => {
    const promptText = extractJournalPromptText(editableContent);
    if (promptText && entry?.entry_type === 'prompt') {
      return stripJournalPromptTag(editableContent);
    }
    return editableContent.trim();
  };

  const handleGoDeeper = async () => {
    const body = getJournalBodyForGoDeeper();
    if (!body || isGoDeeperLoading) return;

    setIsGoDeeperLoading(true);
    try {
      const response = await mobileAiService.generateFollowUpQuestions(body);
      const text = mobileAiService.formatGoDeeperReflection(response.reflection, response.questions);
      const msg = createGoDeeperMessage('assistant', text);
      setGoDeeperMessages((prev) => [...prev, msg]);
      startReveal(msg.id, text, () => {
        setGoDeeperMessages((prev) => {
          persistGoDeeper(prev);
          return prev;
        });
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
      });
    } catch (error) {
      console.error('[EntryDetail] Go Deeper error:', error);
    } finally {
      setIsGoDeeperLoading(false);
    }
  };

  const handleGoDeeperReply = async () => {
    const reply = goDeeperReply.trim();
    const body = getJournalBodyForGoDeeper();
    if (!reply || isGoDeeperLoading || !body) return;

    setGoDeeperReply('');
    const userMsg = createGoDeeperMessage('user', reply);
    const withUser = [...goDeeperMessages, userMsg];
    setGoDeeperMessages(withUser);
    setIsGoDeeperLoading(true);

    try {
      const assistantText = await mobileAiService.continueGoDeeperChat(body, withUser);
      const assistantMsg = createGoDeeperMessage('assistant', assistantText);
      const full = [...withUser, assistantMsg];
      setGoDeeperMessages(full);
      startReveal(assistantMsg.id, assistantText, () => {
        persistGoDeeper(full);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
      });
    } catch (error) {
      console.error('[EntryDetail] Go Deeper reply error:', error);
    } finally {
      setIsGoDeeperLoading(false);
    }
  };

  const toggleQuickActions = () => {
    const toValue = showQuickActions ? 0 : 1;
    setShowQuickActions(!showQuickActions);
    Animated.spring(quickActionsAnim, { toValue, useNativeDriver: true, friction: 8 }).start();
  };

  const handleAddPhotos = async () => {
    setShowQuickActions(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('editor.photosTitle'), t('editor.photosMessage'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        const newPhotos = result.assets.map(a => ({ uri: a.uri, width: a.width || 300, height: a.height || 300 }));
        setAttachedPhotos(prev => [...prev, ...newPhotos]);
        setIsModified(true);
      }
    } catch (error) {
      console.error('[EntryDetail] Photo picker error:', error);
      Alert.alert(t('common.error'), t('editor.photoOpenFailed'));
    }
  };

  const handleMoodSelect = (selectedMood: string) => {
    setMood(selectedMood);
    setShowMoodPicker(false);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      Animated.timing(controlsBottomAnim, { toValue: e.endCoordinates.height - 20, duration: 250, useNativeDriver: false }).start();
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      Animated.timing(controlsBottomAnim, { toValue: 20, duration: 250, useNativeDriver: false }).start();
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {isDarkTheme(theme.name) ? (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
        ) : (
          <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
        )}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.7)' : '#1a1a1a'} />
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
      </View>
    );
  }

  const structuredInsights = entry.ai_structured_insights || null;
  const moodAnalysis = structuredInsights?.mood_analysis || null;
  const dark = isDarkTheme(theme.name);
  const playbookScrim = dark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(118, 100, 150, 0.24)';
  const playbookModalBg = dark ? theme.colors.cardBackground : '#FFFFFF';
  const playbookHeaderBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const playbookEmojiBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.92)';
  const playbookEmojiBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(139,92,246,0.14)';
  const playbookInputBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(248,245,255,0.98)';
  const playbookInputBorder = dark ? theme.colors.border : 'rgba(139,92,246,0.16)';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isDarkTheme(theme.name) ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
      ) : (
        <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
      )}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.7)' : '#1a1a1a'} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => setShowMoodPicker(!showMoodPicker)} 
            style={styles.backButton}
          >
            {mood ? (
              <Text style={{ fontSize: 24 }}>{mood}</Text>
            ) : (
              <Ionicons name="happy-outline" size={24} color={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.7)' : theme.colors.primaryText} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleAnalyzeEntry()}
            disabled={analyzing}
            style={[
              styles.analyzeHeaderButton,
              (!editableContent?.trim() || analyzing) && styles.analyzeHeaderButtonDisabled
            ]}
            activeOpacity={0.8}
          >
            {analyzing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.analyzeHeaderGradient}
              >
                <Text style={styles.analyzeHeaderText}>
                  {structuredInsights ? t('editor.reanalyze') : t('editor.analyze')}
                </Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Mood Picker Overlay */}
      {showMoodPicker && (
        <>
          <Pressable style={styles.overlayBackdrop} onPress={() => setShowMoodPicker(false)} />
          <View style={styles.moodPickerOverlay}>
            <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
              <LinearGradient colors={['rgba(139, 92, 246, 0.15)', 'rgba(99, 102, 241, 0.1)']} style={styles.glassmorphicContainer}>
                <Text style={styles.moodPickerTitle}>{t('editor.howFeeling')}</Text>
                <View style={styles.moodGrid}>
                  {MOODS.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.moodOption, mood === m && styles.moodOptionActive]}
                      onPress={() => handleMoodSelect(m)}
                    >
                      <Text style={styles.moodEmoji}>{m}</Text>
                      {mood === m && (
                        <View style={styles.checkmarkContainer}>
                          <Ionicons name="checkmark-circle" size={16} color="#8b5cf6" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </>
      )}

      <ScrollView 
        ref={scrollViewRef} 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.entryContainer}>
          <TextInput
            style={[styles.titleInput, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}
            value={editableTitle}
            onChangeText={setEditableTitle}
            placeholder={t('editor.untitled')}
            placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
            autoFocus={false}
          />
          <Text style={[styles.metaLine, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0,0,0,0.4)' }]}>
            {formatDate(entry.created_at)}
          </Text>

          {linkedCheckIn && (
            <StandardContainer variant="nested" style={styles.checkInCard}>
              <View style={styles.checkInCardRow}>
                <MoodIcon tier={linkedCheckIn.moodTier} size={30} />
                <View style={styles.checkInCardCopy}>
                  <Text style={[styles.checkInCardEyebrow, { color: theme.colors.secondaryText }]}>
                    {t('entry.checkIn')}
                  </Text>
                  <Text style={[styles.checkInCardText, { color: theme.colors.primaryText }]}>
                    {t('editor.checkInFeeling', {
                      mood: t(`checkIn.${linkedCheckIn.moodTier}`),
                      feelings: linkedCheckIn.feelings.length > 0 ? `, ${linkedCheckIn.feelings.join(', ')}` : '',
                    })}
                  </Text>
                </View>
              </View>
            </StandardContainer>
          )}

          {/* Attached Photo Thumbnails - inline above content */}
          {attachedPhotos.length > 0 && (
            <View style={styles.photoGrid}>
              {attachedPhotos.map((photo, index) => (
                <View key={index} style={styles.photoThumbWrap}>
                  <Image source={{ uri: photo.uri }} style={styles.photoThumb} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.photoRemoveBtn}
                    onPress={() => setAttachedPhotos(prev => prev.filter((_, i) => i !== index))}
                  >
                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Beautiful Prompt Display for prompt entries */}
          {(() => {
            const promptText = extractJournalPromptText(editableContent);
            if (promptText && entry?.entry_type === 'prompt') {
              const userResponse = stripJournalPromptTag(editableContent);
              return (
                <>
                  <View style={[styles.promptDisplayCard, { 
                    backgroundColor: isDarkTheme(theme.name) ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
                    borderColor: isDarkTheme(theme.name) ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'
                  }]}>
                    <View style={styles.promptBadgeRow}>
                      <InsightCompanionMark size={20} isDark={isDarkTheme(theme.name)} />
                      <Text style={[styles.promptBadgeLabel, { color: isDarkTheme(theme.name) ? 'rgba(139, 92, 246, 0.9)' : '#7c3aed' }]}>
                        {t('entry.todaysInsight')}
                      </Text>
                    </View>
                    <Text style={[styles.promptQuestionText, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}>
                      {promptText}
                    </Text>
                  </View>
                  <Text style={[styles.responseLabel, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>
                    {t('entry.yourReflection')}
                  </Text>
                  <TextInput
                    style={[styles.contentInput, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}
                    value={userResponse}
                    onChangeText={(text) => setEditableContent(formatJournalPromptContent(promptText, text))}
                    multiline
                    textAlignVertical="top"
                    placeholder={t('editor.yourThoughts')}
                    placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                    autoFocus={false}
                  />
                </>
              );
            }
            return (
              <TextInput
                style={[styles.contentInput, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}
                value={editableContent}
                onChangeText={setEditableContent}
                multiline
                textAlignVertical="top"
                placeholder={t('editor.prompts.mind')}
                placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                autoFocus={false}
              />
            );
          })()}

          <GoDeeperThread
            messages={goDeeperMessages}
            replyText={goDeeperReply}
            onReplyChange={setGoDeeperReply}
            onSendReply={handleGoDeeperReply}
            isLoading={isGoDeeperLoading}
            isDark={isDarkTheme(theme.name)}
            replyPlaceholder={t('editor.goDeeperReply')}
            typingMessageId={typingMessageId}
            typingDisplayText={typingDisplayText}
          />
          
          {structuredInsights && (
            <View style={styles.inlineInsightsSection}>
              <View style={styles.insightsDivider} />
              <View style={styles.insightsHeaderRow}>
                <Text style={[styles.inlineInsightsTitle, { color: theme.colors.primaryText }]}>{t('entry.insights')}</Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAnalysisOverlayInsights(structuredInsights);
                    setAnalysisOverlayMode('results');
                    setAnalysisOverlayVisible(true);
                  }}
                  style={[styles.reopenInsightsButton, { backgroundColor: isDarkTheme(theme.name) ? theme.colors.surface : 'rgba(0,0,0,0.05)', borderColor: theme.colors.border }]}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="expand-outline" 
                    size={20} 
                    color={isDarkTheme(theme.name) ? 'rgba(255,255,255,0.7)' : '#1a1a1a'} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Primary Emotion & Wellbeing Row */}
              {(moodAnalysis || structuredInsights?.wellbeingScore != null) && (
                <View style={styles.emotionWellbeingRow}>
                  {moodAnalysis && (
                    <StandardContainer variant="nested" style={[styles.inlineMoodCard, styles.inlineMoodCardTop, { flex: 1, borderColor: theme.colors.border }]}>
                      <View style={styles.emotionBadge}>
                        <Text style={[styles.inlineMoodLabel, { color: theme.colors.secondaryText }]}>{t('entry.primaryEmotion')}</Text>
                        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={[styles.inlineMoodEmotion, { color: theme.colors.primaryText }]}>{translateEmotion(t, moodAnalysis.primary_emotion)}</Text>
                      </View>
                    </StandardContainer>
                  )}
                  {structuredInsights?.wellbeingScore != null && (
                    <StandardContainer variant="nested" style={[styles.inlineWellbeingCard, { borderColor: theme.colors.border }]}>
                      <Text style={[styles.inlineMoodLabel, { color: theme.colors.secondaryText }]}>{t('entry.wellbeing')}</Text>
                      <Text style={[styles.inlineWellbeingScore, { color: theme.colors.primaryText }]}>{structuredInsights.wellbeingScore}<Text style={[styles.inlineWellbeingScore, { color: theme.colors.secondaryText }]}>/10</Text></Text>
                      <View style={styles.inlineWellbeingAdjust}>
                        <TouchableOpacity
                          onPress={async () => {
                            const newScore = Math.max(1, (structuredInsights.wellbeingScore || 5) - 1);
                            const updatedInsights = { ...structuredInsights, wellbeingScore: newScore };
                            const updatedEntry = { ...entry, ai_structured_insights: updatedInsights };
                            setEntry(updatedEntry);
                            await supabase.from('notes').update({ ai_structured_insights: updatedInsights }).eq('id', entry.id);
                          }}
                          style={styles.wellbeingAdjustBtn}
                        >
                          <Ionicons name="remove-circle-outline" size={20} color={isDarkTheme(theme.name) ? 'rgba(255,255,255,0.5)' : '#6B6B6B'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={async () => {
                            const newScore = Math.min(10, (structuredInsights.wellbeingScore || 5) + 1);
                            const updatedInsights = { ...structuredInsights, wellbeingScore: newScore };
                            const updatedEntry = { ...entry, ai_structured_insights: updatedInsights };
                            setEntry(updatedEntry);
                            await supabase.from('notes').update({ ai_structured_insights: updatedInsights }).eq('id', entry.id);
                          }}
                          style={styles.wellbeingAdjustBtn}
                        >
                          <Ionicons name="add-circle-outline" size={20} color={isDarkTheme(theme.name) ? 'rgba(255,255,255,0.5)' : '#6B6B6B'} />
                        </TouchableOpacity>
                      </View>
                    </StandardContainer>
                  )}
                </View>
              )}
              
              {/* Summary */}
              {structuredInsights?.insights_report?.conversationalSummary && (
                <StandardContainer variant="nested" style={[styles.inlineBriefingCard, { borderColor: theme.colors.border }]}>
                  <View style={styles.insightHeader}>
                    <Ionicons name="sparkles" size={20} color="#f59e0b" />
                    <Text style={[styles.insightHeaderText, { color: theme.colors.secondaryText }]}>{t('entry.summary')}</Text>
                  </View>
                  <Text style={[styles.inlineBriefingText, { color: theme.colors.primaryText }]}>
                    {structuredInsights.insights_report.conversationalSummary
                      .replace(/The user/g, 'You')
                      .replace(/the user/g, 'you')
                      .replace(/their/g, 'your')
                      .replace(/Their/g, 'Your')}
                  </Text>
                </StandardContainer>
              )}
              
              {/* Structured Insight Cards with Accordions */}
              {structuredInsights?.insights_report?.insightCards && structuredInsights.insights_report.insightCards.length > 0 && (() => {
                const strengthCards = structuredInsights.insights_report.insightCards.filter(
                  (card: any) => card.type === 'strength' || card.type === 'win'
                );
                const growthCards = structuredInsights.insights_report.insightCards.filter(
                  (card: any) => card.type === 'growth' || card.type === 'reflection'
                );
                
                return (
                  <View style={styles.insightCardsContainer} onLayout={(e) => { insightsSectionY.current = e.nativeEvent.layout.y; }}>
                    {/* Strengths & Wins Accordion */}
                    {strengthCards.length > 0 && (
                      <View style={styles.accordionSection}>
                        <TouchableOpacity 
                          style={[styles.accordionHeader, {
                            backgroundColor: isDarkTheme(theme.name) ? theme.colors.cardBackground : 'rgba(16, 185, 129, 0.08)',
                            borderColor: isDarkTheme(theme.name) ? theme.colors.border : 'rgba(16, 185, 129, 0.25)',
                          }]}
                          onPress={() => toggleAccordion('strengths')}
                        >
                          <View style={styles.accordionHeaderLeft}>
                            <Text style={{ fontSize: 18 }}>✨</Text>
                            <Text style={[styles.accordionHeaderText, { color: theme.colors.primaryText }]}>
                              {t('entry.working')}
                            </Text>
                            <View style={[styles.accordionBadge, { backgroundColor: theme.colors.surface }]}>
                              <Text style={[styles.accordionBadgeText, { color: theme.colors.primaryText }]}>{strengthCards.length}</Text>
                            </View>
                          </View>
                          <Ionicons 
                            name={strengthsExpanded ? 'chevron-up' : 'chevron-down'} 
                            size={20} 
                            color={theme.colors.tertiaryText} 
                          />
                        </TouchableOpacity>
                        
                        {strengthsExpanded && (
                          <View style={styles.accordionContent}>
                            {strengthCards.map((card: any, index: number) => {
                              const cardStyle = getInsightCardStyle(card.type);
                              const isHighlighted = highlightedCardText && card.text?.toLowerCase().includes(highlightedCardText.toLowerCase().substring(0, 30));
                              return (
                                <View key={index} style={[styles.insightCard, { backgroundColor: theme.colors.cardBackground, borderWidth: isHighlighted ? 2 : 1, borderColor: isHighlighted ? '#10b981' : theme.colors.border }]}>
                                  <View style={styles.insightCardContent}>
                                    <View style={[styles.insightBadge, { backgroundColor: theme.colors.surface }]}>
                                      <Text style={[styles.insightBadgeText, { color: theme.colors.secondaryText }]}>
                                        {card.short_label || card.type.toUpperCase()}
                                      </Text>
                                    </View>
                                    <Text style={[styles.insightCardText, { color: theme.colors.secondaryText }]}>
                                      {card.text
                                        .replace(/The user/g, 'You')
                                        .replace(/the user/g, 'you')
                                        .replace(/their/g, 'your')
                                        .replace(/Their/g, 'Your')}
                                    </Text>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    )}
                    
                    {/* Patterns to Address Accordion */}
                    {growthCards.length > 0 && (
                      <View style={styles.accordionSection}>
                        <TouchableOpacity 
                          style={[styles.accordionHeader, {
                            backgroundColor: isDarkTheme(theme.name) ? theme.colors.cardBackground : 'rgba(217, 119, 6, 0.08)',
                            borderColor: isDarkTheme(theme.name) ? theme.colors.border : 'rgba(217, 119, 6, 0.25)',
                          }]}
                          onPress={() => toggleAccordion('growth')}
                        >
                          <View style={styles.accordionHeaderLeft}>
                            <Text style={{ fontSize: 18 }}>🌱</Text>
                            <Text style={[styles.accordionHeaderText, { color: theme.colors.primaryText }]}>
                              {t('entry.patterns')}
                            </Text>
                            <View style={[styles.accordionBadge, { backgroundColor: theme.colors.surface }]}>
                              <Text style={[styles.accordionBadgeText, { color: theme.colors.primaryText }]}>{growthCards.length}</Text>
                            </View>
                          </View>
                          <Ionicons 
                            name={growthExpanded ? 'chevron-up' : 'chevron-down'} 
                            size={20} 
                            color={theme.colors.tertiaryText} 
                          />
                        </TouchableOpacity>
                        
                        {growthExpanded && (
                          <View style={styles.accordionContent}>
                            {growthCards.map((card: any, index: number) => {
                              const cardStyle = getInsightCardStyle(card.type);
                              const isGrowthOrReflection = card.type === 'growth' || card.type === 'reflection';
                              const isHighlighted = highlightedCardText && card.text?.toLowerCase().includes(highlightedCardText.toLowerCase().substring(0, 30));
                              return (
                                <View key={index} style={[styles.insightCard, { backgroundColor: isHighlighted ? 'rgba(217, 119, 6, 0.08)' : theme.colors.cardBackground, borderWidth: isHighlighted ? 2 : 1, borderColor: isHighlighted ? '#d97706' : theme.colors.border }]}>
                                  <View style={styles.insightCardContent}>
                                    <View style={[styles.insightBadge, { backgroundColor: theme.colors.surface }]}>
                                      <Text style={[styles.insightBadgeText, { color: theme.colors.secondaryText }]}>
                                        {card.short_label || card.type.toUpperCase()}
                                      </Text>
                                    </View>
                                    <Text style={[styles.insightCardText, { color: theme.colors.secondaryText }]}>
                                      {card.text
                                        .replace(/The user/g, 'You')
                                        .replace(/the user/g, 'you')
                                        .replace(/their/g, 'your')
                                        .replace(/Their/g, 'Your')}
                                    </Text>
                                    {isGrowthOrReflection && (
                                      <LinearGradient
                                        colors={['#8b5cf6', '#7c3aed']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.playbookButton}
                                      >
                                        <TouchableOpacity 
                                          style={styles.playbookButtonInner}
                                          onPress={() => handleAddToPlaybook(card.text, index)}
                                          disabled={addingToPlaybook === `growth-${index}`}
                                          activeOpacity={0.8}
                                        >
                                          {addingToPlaybook === `growth-${index}` ? (
                                            <ActivityIndicator size="small" color="#ffffff" />
                                          ) : (
                                            <>
                                              <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
                                              <Text style={[styles.playbookButtonText, { color: '#ffffff' }]}>
                                                {t('entry.addToPlaybook')}
                                              </Text>
                                            </>
                                          )}
                                        </TouchableOpacity>
                                      </LinearGradient>
                                    )}
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })()}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom-Left Quick Actions Button */}
      <Animated.View style={[styles.quickActionsButton, { bottom: controlsBottomAnim }]} pointerEvents="box-none">
        <TouchableOpacity onPress={toggleQuickActions} activeOpacity={0.8}>
          <LinearGradient
            colors={isDarkTheme(theme.name) ? ['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.2)'] : ['#8b5cf6', '#7c3aed']}
            style={styles.fabGradient}
          >
            <Ionicons name={showQuickActions ? 'close' : 'add'} size={28} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Quick Actions Overlay */}
      {showQuickActions && (
        <Animated.View style={[styles.quickActionsOverlay, { opacity: quickActionsAnim, transform: [{ translateY: quickActionsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <BlurView intensity={80} tint="dark" style={styles.quickActionsBlur}>
            <LinearGradient colors={['rgba(139, 92, 246, 0.15)', 'rgba(99, 102, 241, 0.1)']} style={styles.quickActionsContainer}>
              <TouchableOpacity style={styles.quickActionItem} onPress={handleAddPhotos}>
                <Ionicons name="image" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.quickActionText}>{t('editor.addPhotos')}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      )}

      {/* Bottom-Right Go Deeper Button */}
      <Animated.View style={[styles.sparkleButton, { bottom: controlsBottomAnim }]}>
        <TouchableOpacity
          onPress={handleGoDeeper}
          disabled={isGoDeeperLoading || !getJournalBodyForGoDeeper()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8b5cf6', '#6d28d9']}
            style={[styles.sparkleFabGradient, (!getJournalBodyForGoDeeper() || isGoDeeperLoading) && { opacity: 0.4 }]}
          >
            {isGoDeeperLoading ? (
              <Ionicons name="hourglass" size={24} color="#ffffff" />
            ) : (
              <Ionicons name="sparkles" size={24} color="#ffffff" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <ImmersiveAnalysisOverlay
        visible={analysisOverlayVisible}
        entryTitle={editableTitle || entry?.title}
        {...(analysisOverlayMode === 'loading'
          ? {
              variant: 'loading' as const,
              progress: analysisProgress,
              message: analysisOverlayMessage,
              onCancel: handleCancelAnalysis,
            }
          : {
              variant: 'results' as const,
              insights: analysisOverlayInsights,
              onDone: () => {
                setAnalysisOverlayVisible(false);
              },
              onAddToPlaybook: handleAddToPlaybook,
              addingToPlaybook,
              onWellbeingChange: async (newScore: number) => {
                if (!entry?.id) return;
                try {
                  // Update local state
                  const updatedInsights = { ...analysisOverlayInsights, wellbeingScore: newScore };
                  setAnalysisOverlayInsights(updatedInsights);
                  if (entry) {
                    const updatedEntry = { ...entry };
                    if (updatedEntry.ai_structured_insights) {
                      updatedEntry.ai_structured_insights.wellbeingScore = newScore;
                    }
                    if (updatedEntry.ai_insights) {
                      updatedEntry.ai_insights.wellbeingScore = newScore;
                    }
                    setEntry(updatedEntry);
                  }
                  // Persist to database
                  await supabase
                    .from('notes')
                    .update({
                      ai_structured_insights: { ...entry.ai_structured_insights, wellbeingScore: newScore },
                      ai_insights: { ...entry.ai_insights, wellbeingScore: newScore },
                    })
                    .eq('id', entry.id);
                } catch (err) {
                  console.error('[EntryDetail] Error saving wellbeing score:', err);
                }
              },
            })}
      />

      {/* Playbook Preview/Edit Overlay */}
      <Modal
        visible={playbookPreviewVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPlaybookPreviewVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={[styles.playbookOverlay, { backgroundColor: playbookScrim }]}>
            <View style={[styles.playbookModal, { backgroundColor: playbookModalBg }]}>
              <View style={[styles.playbookModalHeader, { borderBottomColor: playbookHeaderBorder }]}>
                <Text style={[styles.playbookModalTitle, { color: theme.colors.primaryText }]}>{t('entry.addToPlaybook')}</Text>
                <TouchableOpacity onPress={() => setPlaybookPreviewVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.secondaryText} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.playbookModalBody} keyboardShouldPersistTaps="handled">
                {/* Emoji Picker */}
                <Text style={[styles.playbookLabel, { color: theme.colors.secondaryText }]}>{t('entry.icon')}</Text>
                <View style={styles.playbookEmojiRow}>
                  {['📈', '🌱', '💭', '🧘', '💪', '🎯', '🔥', '✨', '🌟', '💡', '🌈', '☕'].map((e) => (
                    <TouchableOpacity
                      key={e}
                      style={[
                        styles.playbookEmojiOption,
                        { backgroundColor: playbookEmojiBg, borderColor: playbookEmojiBorder },
                        playbookDraft.emoji === e && styles.playbookEmojiActive,
                      ]}
                      onPress={() => setPlaybookDraft({ ...playbookDraft, emoji: e })}
                    >
                      <Text style={{ fontSize: 22 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Title */}
                <Text style={[styles.playbookLabel, { color: theme.colors.secondaryText }]}>{t('entry.title')}</Text>
                <TextInput
                  style={[styles.playbookInput, { color: theme.colors.primaryText, borderColor: playbookInputBorder, backgroundColor: playbookInputBg }]}
                  value={playbookDraft.title}
                  onChangeText={(t) => setPlaybookDraft({ ...playbookDraft, title: t })}
                  placeholder={t('entry.protocolTitle')}
                  placeholderTextColor={theme.colors.secondaryText}
                />

                {/* Description */}
                <Text style={[styles.playbookLabel, { color: theme.colors.secondaryText }]}>{t('entry.description')}</Text>
                <TextInput
                  style={[styles.playbookInput, styles.playbookTextArea, { color: theme.colors.primaryText, borderColor: playbookInputBorder, backgroundColor: playbookInputBg }]}
                  value={playbookDraft.description}
                  onChangeText={(t) => setPlaybookDraft({ ...playbookDraft, description: t })}
                  placeholder={t('entry.protocolDescription')}
                  placeholderTextColor={theme.colors.secondaryText}
                  multiline
                  textAlignVertical="top"
                />

                {/* Confirm Button */}
                <TouchableOpacity onPress={confirmAddToPlaybook} style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden' }}>
                  <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.playbookConfirmBtn}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.playbookConfirmText}>{t('entry.addDailyProtocols')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <PremiumUpsellOverlay
        visible={premiumUpsellVisible}
        onUpgrade={() => {
          setPremiumUpsellVisible(false);
          navigation.navigate('Paywall', { fromSettings: true });
        }}
        onDismiss={() => {
          setPremiumUpsellVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? 32 : 20,
    paddingTop: isTablet ? 70 : 60,
    paddingBottom: isTablet ? 20 : 16,
  },
  backButton: {
    width: isTablet ? 52 : 44,
    height: isTablet ? 52 : 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analyzeHeaderButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  analyzeHeaderButtonDisabled: {
    opacity: 0.4,
  },
  analyzeHeaderGradient: {
    paddingHorizontal: isTablet ? 24 : 16,
    paddingVertical: isTablet ? 14 : 10,
    borderRadius: 12,
    minWidth: isTablet ? 100 : 80,
    alignItems: 'center',
  },
  analyzeHeaderText: {
    color: '#ffffff',
    fontSize: sf(15),
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: isTablet ? 250 : 200,
    flexGrow: 1,
    minHeight: '100%',
  },
  entryContainer: {
    flex: 1,
    paddingHorizontal: isTablet ? 40 : 24,
    paddingTop: isTablet ? 28 : 20,
  },
  titleInput: {
    fontSize: sf(28),
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: isTablet ? 16 : 12,
    padding: 0,
  },
  metaLine: {
    fontSize: sf(14),
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: isTablet ? 32 : 24,
  },
  checkInCard: {
    marginBottom: isTablet ? 28 : 22,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  checkInCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkInCardCopy: {
    flex: 1,
    gap: 3,
  },
  checkInCardEyebrow: {
    fontSize: sf(10),
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  checkInCardText: {
    fontSize: sf(15),
    fontWeight: '600',
    lineHeight: sf(21),
  },
  contentInput: {
    fontSize: sf(17),
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: sf(28),
    minHeight: isTablet ? 300 : 200,
    padding: 0,
  },
  inlineInsightsSection: {
    marginTop: 16,
    paddingTop: 16,
  },
  insightsDivider: {
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    marginBottom: 20,
  },
  insightsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isTablet ? 20 : 16,
  },
  inlineInsightsTitle: {
    fontSize: sf(20),
    fontWeight: '600',
  },
  reopenInsightsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  inlineBriefingCard: {
    borderRadius: isTablet ? 20 : 16,
    padding: isTablet ? 28 : 20,
    marginBottom: isTablet ? 20 : 16,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.15)',
  },
  insightHeaderText: {
    fontSize: sf(14),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inlineBriefingText: {
    fontSize: sf(16),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: sf(26),
  },
  inlineMoodCard: {
    borderRadius: isTablet ? 18 : 14,
    padding: isTablet ? 28 : 20,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inlineMoodCardTop: {
    marginBottom: 0,
  },
  emotionWellbeingRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  inlineWellbeingCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  inlineWellbeingScore: {
    fontSize: sf(28),
    fontWeight: '700',
  },
  inlineWellbeingMax: {
    fontSize: sf(16),
    fontWeight: '500',
    color: 'rgba(139, 92, 246, 0.6)',
  },
  inlineWellbeingAdjust: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  wellbeingAdjustBtn: {
    padding: 4,
  },
  emotionBadge: {
    alignItems: 'center',
  },
  inlineMoodLabel: {
    fontSize: sf(11),
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: isTablet ? 12 : 8,
  },
  inlineMoodEmotion: {
    fontSize: sf(24),
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.98)',
    textTransform: 'capitalize',
  },
  insightCardsContainer: {
    gap: 12,
    marginTop: 12,
  },
  insightCard: {
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 22 : 16,
    position: 'relative',
    overflow: 'hidden',
  },
  insightCardContent: {
    paddingLeft: 0,
  },
  insightBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  insightBadgeText: {
    fontSize: sf(10),
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  insightCardText: {
    fontSize: sf(15),
    lineHeight: sf(24),
    color: 'rgba(255, 255, 255, 0.9)',
  },
  playbookButton: {
    borderRadius: 20,
    marginTop: sf(12),
    alignSelf: 'flex-start',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  playbookButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: sf(8),
    paddingHorizontal: sf(14),
  },
  playbookButtonText: {
    fontSize: sf(13),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  accordionSection: {
    marginBottom: 12,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isTablet ? 22 : 16,
    borderRadius: isTablet ? 16 : 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  accordionHeaderText: {
    fontSize: sf(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  accordionBadge: {
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  accordionBadgeText: {
    fontSize: sf(12),
    fontWeight: '700',
  },
  accordionContent: {
    marginTop: 12,
    gap: 12,
  },
  // Playbook Preview Overlay
  playbookOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  playbookModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 40,
    shadowColor: '#6B5B95',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  playbookModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  playbookModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  playbookModalBody: {
    padding: 20,
  },
  playbookLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  playbookEmojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playbookEmojiOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  playbookEmojiActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
    borderWidth: 2,
  },
  playbookInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  playbookTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  playbookConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderRadius: 12,
  },
  playbookConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Mood picker
  overlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
  },
  moodPickerOverlay: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    zIndex: 100,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassmorphicContainer: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  moodPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  moodOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  moodOptionActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 28,
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  // Photo thumbnails
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  photoThumbWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 11,
  },
  // Quick actions & FAB buttons
  quickActionsButton: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    zIndex: 10,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionsOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    zIndex: 9,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionsBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionsContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    gap: 4,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 8,
  },
  quickActionText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 15,
    fontWeight: '500',
  },
  sparkleButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    zIndex: 10,
  },
  sparkleFabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  promptDisplayCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  promptBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  promptBadgeLabel: {
    fontSize: sf(13),
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  promptQuestionText: {
    fontSize: sf(18),
    fontWeight: '600',
    lineHeight: sf(26),
    letterSpacing: -0.3,
  },
  responseLabel: {
    fontSize: sf(14),
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
});
