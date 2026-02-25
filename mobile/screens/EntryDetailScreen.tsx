import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, LayoutAnimation, Platform, UIManager, Animated, Modal, KeyboardAvoidingView, Image, Keyboard, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Purchases from 'react-native-purchases';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { mobileAiService } from '../services/mobileAiService';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ImmersiveAnalysisOverlay from '../components/shared/ImmersiveAnalysisOverlay';
import PremiumUpsellOverlay from '../components/PremiumUpsellOverlay';
import * as Haptics from 'expo-haptics';
import { isTablet, sf, ss, si } from '../utils/responsive';

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
const getInsightCardStyle = (type: string) => {
  switch (type) {
    case 'strength':
    case 'win':
      // Emerald/Green for positive insights
      return {
        container: { backgroundColor: 'rgba(16, 185, 129, 0.08)' },
        border: { backgroundColor: '#10b981' },
        badge: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
        badgeText: { color: '#10b981' },
        button: { borderColor: '#10b981' },
        buttonColor: '#10b981',
      };
    case 'growth':
    case 'reflection':
      // Amber/Orange for growth opportunities
      return {
        container: { backgroundColor: 'rgba(245, 158, 11, 0.08)' },
        border: { backgroundColor: '#f59e0b' },
        badge: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
        badgeText: { color: '#f59e0b' },
        button: { borderColor: '#f59e0b' },
        buttonColor: '#f59e0b',
      };
    default:
      // Purple fallback
      return {
        container: { backgroundColor: 'rgba(139, 92, 246, 0.08)' },
        border: { backgroundColor: '#8b5cf6' },
        badge: { backgroundColor: 'rgba(139, 92, 246, 0.15)' },
        badgeText: { color: '#8b5cf6' },
        button: { borderColor: '#8b5cf6' },
        buttonColor: '#8b5cf6',
      };
  }
};

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EntryDetailScreenNew({ route, navigation }: any) {
  const { entry: initialEntry, entryId, shouldAnalyze } = route.params || {};
  const { theme } = useTheme();
  const { user } = useAuth();
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
  const [analysisOverlayMessage, setAnalysisOverlayMessage] = useState('Connecting with your thoughts...');
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
  const [attachedPhotos, setAttachedPhotos] = useState<Array<{ uri: string; width: number; height: number }>>([]);
  const quickActionsAnim = useRef(new Animated.Value(0)).current;
  const controlsBottomAnim = useRef(new Animated.Value(20)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
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

  useEffect(() => {
    if (initialEntry) {
      setEntry(initialEntry);
      setEditableContent(initialEntry.content || '');
      setEditableTitle(initialEntry.title || '');
      
      if (shouldAnalyze && !initialEntry.ai_structured_insights) {
        handleAnalyzeEntry(initialEntry);
      }
    } else if (entryId) {
      loadEntry();
    }
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
        setEntry(data);
        setEditableContent(data.content || '');
        setEditableTitle(data.title || '');
        
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

  useEffect(() => {
    if (!isModified || !entry) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('notes')
          .update({
            title: editableTitle.trim() || 'Untitled Entry',
            content: editableContent.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', entry.id);

        if (!error) {
          entry.title = editableTitle.trim() || 'Untitled Entry';
          entry.content = editableContent.trim();
          setIsModified(false);
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editableContent, editableTitle, isModified]);

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

    // Check subscription status BEFORE starting animation
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
    } catch (error) {
      console.error('[EntryDetail] Error checking subscription:', error);
      // If we can't check subscription, show premium overlay to be safe
      setPremiumUpsellVisible(true);
      return;
    }

    // Check daily usage limit (2 per day for ALL users)
    // Exception: unlimited for developer/tester accounts
    const UNLIMITED_EMAILS = ['edwardsjonny547@gmail.com'];
    const isUnlimited = UNLIMITED_EMAILS.includes(user?.email?.toLowerCase() || '') || __DEV__;
    
    if (!isUnlimited) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { count, error: countError } = await supabase
          .from('usage_tracking')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id)
          .eq('action_type', 'ai_analysis')
          .gte('created_at', today);

        if (!countError && (count || 0) >= 2) {
          console.log('[EntryDetail] Daily usage limit reached:', count);
          Alert.alert(
            'Daily Limit Reached',
            'You\'ve used your 2 AI analyses for today. Come back tomorrow for more insights!',
            [{ text: 'OK' }]
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
      'Connecting with your thoughts...',
      'Synthesizing patterns...',
      'Finding the emotions underneath...',
      'Turning reflection into clarity...',
      'Finalizing your insights...',
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
            const description = `${protocol.practice}\n\n**Why it works:** ${protocol.why}`;
            const { error: suggestError } = await supabase.from('actionable_insights').insert({
              user_id: user.id,
              title: protocol.name,
              description,
              category: 'general',
              difficulty: 'moderate',
              emoji: card.type === 'growth' ? '🌱' : '💭',
              status: 'suggested',
              source: 'ai_suggested',
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
      const errorMessage = err?.message || 'Something went wrong while analyzing this entry.';
      
      // Check if this is a subscription error
      if (errorMessage.includes('Subscription required') || errorMessage.includes('subscription')) {
        // Show premium upsell overlay
        setPremiumUpsellVisible(true);
      } else {
        // Show generic error alert
        Alert.alert('Analysis failed', errorMessage);
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
        description: `${protocol.practice}\n\nWhy it works: ${protocol.why}`,
        emoji: '📈',
      });
      setPlaybookPreviewVisible(true);
    } catch (error) {
      console.error('[EntryDetail] Error generating protocol:', error);
      Alert.alert('Error', 'Failed to create protocol. Please try again.');
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
          source: 'ai_suggested',
        });

      if (error) {
        console.error('[EntryDetail] Error saving protocol:', error);
        Alert.alert('Error', 'Failed to add protocol to Playbook.');
        return;
      }

      setPlaybookPreviewVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Added to Playbook!',
        `"${playbookDraft.title}" has been added to your Daily Protocols.`,
        [
          { text: 'View Playbook', onPress: () => navigation.navigate('Playbook') },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('[EntryDetail] Error saving protocol:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const MOODS = ['😊', '😌', '😔', '😤', '😰', '🥰', '😴', '🤔', '😢', '🙂', '😁', '😐'];

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
        Alert.alert('Photos Access', 'Please allow photo library access in Settings to add photos.');
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
      Alert.alert('Error', 'Failed to open photo library.');
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
                  {structuredInsights ? 'Re-analyze' : 'Analyze'}
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
                <Text style={styles.moodPickerTitle}>How are you feeling?</Text>
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

      <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.entryContainer}>
          <TextInput
            style={[styles.titleInput, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}
            value={editableTitle}
            onChangeText={setEditableTitle}
            placeholder="Untitled Entry"
            placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
            autoFocus={false}
          />
          <Text style={[styles.metaLine, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0,0,0,0.4)' }]}>
            {formatDate(entry.created_at)}
          </Text>

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
            const promptMatch = editableContent.match(/\[Insight Prompt: ([^\]]+)\]/);
            if (promptMatch && entry?.entry_type === 'prompt') {
              const promptText = promptMatch[1];
              const userResponse = editableContent.replace(/\[Insight Prompt: [^\]]+\]\n\n/, '');
              return (
                <>
                  <View style={[styles.promptDisplayCard, { 
                    backgroundColor: isDarkTheme(theme.name) ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
                    borderColor: isDarkTheme(theme.name) ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'
                  }]}>
                    <View style={styles.promptBadgeRow}>
                      <Ionicons name="bulb" size={18} color="#8b5cf6" />
                      <Text style={[styles.promptBadgeLabel, { color: isDarkTheme(theme.name) ? 'rgba(139, 92, 246, 0.9)' : '#7c3aed' }]}>
                        Today's Insight
                      </Text>
                    </View>
                    <Text style={[styles.promptQuestionText, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}>
                      {promptText}
                    </Text>
                  </View>
                  <Text style={[styles.responseLabel, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>
                    Your Reflection
                  </Text>
                  <TextInput
                    style={[styles.contentInput, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}
                    value={userResponse}
                    onChangeText={(text) => setEditableContent(`[Insight Prompt: ${promptText}]\n\n${text}`)}
                    multiline
                    textAlignVertical="top"
                    placeholder="Your thoughts..."
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
                placeholder="What's on your mind?"
                placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                autoFocus={false}
              />
            );
          })()}
          
          {structuredInsights && (
            <View style={styles.inlineInsightsSection}>
              <View style={styles.insightsDivider} />
              <Text style={[styles.inlineInsightsTitle, { color: theme.colors.primary }]}>Insights</Text>
              
              {/* Primary Emotion & Wellbeing Row */}
              {(moodAnalysis || structuredInsights?.wellbeingScore != null) && (
                <View style={styles.emotionWellbeingRow}>
                  {moodAnalysis && (
                    <View style={[
                      styles.inlineMoodCard,
                      styles.inlineMoodCardTop,
                      getSentimentStyle(moodAnalysis.primary_emotion),
                      { flex: 1 }
                    ]}>
                      <View style={styles.emotionBadge}>
                        <Text style={[styles.inlineMoodLabel, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.6)' : '#6B6B6B' }]}>PRIMARY EMOTION</Text>
                        <Text style={[styles.inlineMoodEmotion, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.98)' : '#1a1a1a' }]}>{moodAnalysis.primary_emotion}</Text>
                      </View>
                    </View>
                  )}
                  {structuredInsights?.wellbeingScore != null && (
                    <View style={[styles.inlineWellbeingCard, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)', borderColor: isDarkTheme(theme.name) ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)' }]}>
                      <Text style={[styles.inlineMoodLabel, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.6)' : '#6B6B6B' }]}>WELLBEING</Text>
                      <Text style={[styles.inlineWellbeingScore, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.98)' : '#1a1a1a' }]}>{structuredInsights.wellbeingScore}<Text style={styles.inlineWellbeingMax}>/10</Text></Text>
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
                    </View>
                  )}
                </View>
              )}
              
              {/* Summary */}
              {structuredInsights?.insights_report?.conversationalSummary && (
                <View style={styles.inlineBriefingCard}>
                  <View style={styles.insightHeader}>
                    <Ionicons name="sparkles" size={20} color="#a855f7" />
                    <Text style={styles.insightHeaderText}>Summary</Text>
                  </View>
                  <Text style={[styles.inlineBriefingText, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.9)' : '#2C2C2C' }]}>
                    {structuredInsights.insights_report.conversationalSummary
                      .replace(/The user/g, 'You')
                      .replace(/the user/g, 'you')
                      .replace(/their/g, 'your')
                      .replace(/Their/g, 'Your')}
                  </Text>
                </View>
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
                  <View style={styles.insightCardsContainer}>
                    {/* Strengths & Wins Accordion */}
                    {strengthCards.length > 0 && (
                      <View style={styles.accordionSection}>
                        <TouchableOpacity 
                          style={styles.accordionHeader}
                          onPress={() => toggleAccordion('strengths')}
                        >
                          <View style={styles.accordionHeaderLeft}>
                            <Ionicons name="sparkles" size={20} color="#10b981" />
                            <Text style={[styles.accordionHeaderText, { color: '#10b981' }]}>
                              Strengths & Wins
                            </Text>
                            <View style={styles.accordionBadge}>
                              <Text style={styles.accordionBadgeText}>{strengthCards.length}</Text>
                            </View>
                          </View>
                          <Ionicons 
                            name={strengthsExpanded ? 'chevron-up' : 'chevron-down'} 
                            size={20} 
                            color="#10b981" 
                          />
                        </TouchableOpacity>
                        
                        {strengthsExpanded && (
                          <View style={styles.accordionContent}>
                            {strengthCards.map((card: any, index: number) => {
                              const cardStyle = getInsightCardStyle(card.type);
                              return (
                                <View key={index} style={[styles.insightCard, cardStyle.container]}>
                                  <View style={[styles.insightCardBorder, cardStyle.border]} />
                                  <View style={styles.insightCardContent}>
                                    <View style={[styles.insightBadge, cardStyle.badge]}>
                                      <Text style={[styles.insightBadgeText, cardStyle.badgeText]}>
                                        {card.short_label || card.type.toUpperCase()}
                                      </Text>
                                    </View>
                                    <Text style={[styles.insightCardText, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.9)' : '#2C2C2C' }]}>
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
                    
                    {/* Growth & Reflections Accordion */}
                    {growthCards.length > 0 && (
                      <View style={styles.accordionSection}>
                        <TouchableOpacity 
                          style={styles.accordionHeader}
                          onPress={() => toggleAccordion('growth')}
                        >
                          <View style={styles.accordionHeaderLeft}>
                            <Ionicons name="trending-up" size={20} color="#f59e0b" />
                            <Text style={[styles.accordionHeaderText, { color: '#f59e0b' }]}>
                              Growth & Reflections
                            </Text>
                            <View style={styles.accordionBadge}>
                              <Text style={styles.accordionBadgeText}>{growthCards.length}</Text>
                            </View>
                          </View>
                          <Ionicons 
                            name={growthExpanded ? 'chevron-up' : 'chevron-down'} 
                            size={20} 
                            color="#f59e0b" 
                          />
                        </TouchableOpacity>
                        
                        {growthExpanded && (
                          <View style={styles.accordionContent}>
                            {growthCards.map((card: any, index: number) => {
                              const cardStyle = getInsightCardStyle(card.type);
                              const isGrowthOrReflection = card.type === 'growth' || card.type === 'reflection';
                              return (
                                <View key={index} style={[styles.insightCard, cardStyle.container]}>
                                  <View style={[styles.insightCardBorder, cardStyle.border]} />
                                  <View style={styles.insightCardContent}>
                                    <View style={[styles.insightBadge, cardStyle.badge]}>
                                      <Text style={[styles.insightBadgeText, cardStyle.badgeText]}>
                                        {card.short_label || card.type.toUpperCase()}
                                      </Text>
                                    </View>
                                    <Text style={[styles.insightCardText, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.9)' : '#2C2C2C' }]}>
                                      {card.text
                                        .replace(/The user/g, 'You')
                                        .replace(/the user/g, 'you')
                                        .replace(/their/g, 'your')
                                        .replace(/Their/g, 'Your')}
                                    </Text>
                                    {isGrowthOrReflection && (
                                      <TouchableOpacity 
                                        style={[styles.playbookButton, cardStyle.button]}
                                        onPress={() => handleAddToPlaybook(card.text, index)}
                                        disabled={addingToPlaybook === `growth-${index}`}
                                      >
                                        {addingToPlaybook === `growth-${index}` ? (
                                          <ActivityIndicator size="small" color={cardStyle.buttonColor} />
                                        ) : (
                                          <>
                                            <Ionicons name="add-circle-outline" size={16} color={cardStyle.buttonColor} />
                                            <Text style={[styles.playbookButtonText, { color: cardStyle.buttonColor }]}>
                                              Add to Playbook
                                            </Text>
                                          </>
                                        )}
                                      </TouchableOpacity>
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
                <Text style={styles.quickActionText}>Add photos</Text>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      )}

      {/* Bottom-Right Go Deeper Button */}
      <Animated.View style={[styles.sparkleButton, { bottom: controlsBottomAnim }]}>
        <TouchableOpacity
          onPress={() => handleAnalyzeEntry()}
          disabled={analyzing || !editableContent?.trim()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8b5cf6', '#6d28d9']}
            style={[styles.sparkleFabGradient, (!editableContent?.trim() || analyzing) && { opacity: 0.4 }]}
          >
            {analyzing ? (
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
          <View style={styles.playbookOverlay}>
            <View style={[styles.playbookModal, { backgroundColor: theme.colors.cardBackground }]}>
              <View style={styles.playbookModalHeader}>
                <Text style={[styles.playbookModalTitle, { color: theme.colors.primaryText }]}>Add to Playbook</Text>
                <TouchableOpacity onPress={() => setPlaybookPreviewVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.secondaryText} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.playbookModalBody} keyboardShouldPersistTaps="handled">
                {/* Emoji Picker */}
                <Text style={[styles.playbookLabel, { color: theme.colors.secondaryText }]}>Icon</Text>
                <View style={styles.playbookEmojiRow}>
                  {['📈', '🌱', '💭', '🧘', '💪', '🎯', '🔥', '✨', '🌟', '💡', '🌈', '☕'].map((e) => (
                    <TouchableOpacity
                      key={e}
                      style={[
                        styles.playbookEmojiOption,
                        playbookDraft.emoji === e && styles.playbookEmojiActive,
                      ]}
                      onPress={() => setPlaybookDraft({ ...playbookDraft, emoji: e })}
                    >
                      <Text style={{ fontSize: 22 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Title */}
                <Text style={[styles.playbookLabel, { color: theme.colors.secondaryText }]}>Title</Text>
                <TextInput
                  style={[styles.playbookInput, { color: theme.colors.primaryText, borderColor: theme.colors.border }]}
                  value={playbookDraft.title}
                  onChangeText={(t) => setPlaybookDraft({ ...playbookDraft, title: t })}
                  placeholder="Protocol title"
                  placeholderTextColor={theme.colors.secondaryText}
                />

                {/* Description */}
                <Text style={[styles.playbookLabel, { color: theme.colors.secondaryText }]}>Description</Text>
                <TextInput
                  style={[styles.playbookInput, styles.playbookTextArea, { color: theme.colors.primaryText, borderColor: theme.colors.border }]}
                  value={playbookDraft.description}
                  onChangeText={(t) => setPlaybookDraft({ ...playbookDraft, description: t })}
                  placeholder="Describe the daily practice..."
                  placeholderTextColor={theme.colors.secondaryText}
                  multiline
                  textAlignVertical="top"
                />

                {/* Confirm Button */}
                <TouchableOpacity onPress={confirmAddToPlaybook} style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden' }}>
                  <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.playbookConfirmBtn}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.playbookConfirmText}>Add to Daily Protocols</Text>
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
    paddingBottom: 100,
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
  inlineInsightsTitle: {
    fontSize: sf(20),
    fontWeight: '600',
    color: 'rgba(139, 92, 246, 0.95)',
    marginBottom: isTablet ? 20 : 16,
  },
  inlineBriefingCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: isTablet ? 20 : 16,
    padding: isTablet ? 28 : 20,
    marginBottom: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  insightHeaderText: {
    fontSize: sf(14),
    fontWeight: '700',
    color: 'rgba(168, 85, 247, 0.95)',
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
  insightCardBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  insightCardContent: {
    paddingLeft: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  playbookModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  playbookModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  playbookEmojiActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
    borderWidth: 2,
  },
  playbookInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
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
