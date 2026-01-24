import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, LayoutAnimation, Platform, UIManager, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { mobileAiService } from '../services/mobileAiService';
import { useTheme } from '../contexts/ThemeContext';
import ImmersiveAnalysisOverlay from '../components/shared/ImmersiveAnalysisOverlay';

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
  const [analyzing, setAnalyzing] = useState(false);
  const [entry, setEntry] = useState<any>(initialEntry || null);
  const [editableContent, setEditableContent] = useState(initialEntry?.content || '');
  const [editableTitle, setEditableTitle] = useState(initialEntry?.title || '');
  const [isModified, setIsModified] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [strengthsExpanded, setStrengthsExpanded] = useState(true);
  const [growthExpanded, setGrowthExpanded] = useState(false);

  const [analysisOverlayVisible, setAnalysisOverlayVisible] = useState(false);
  const [analysisOverlayMode, setAnalysisOverlayMode] = useState<'loading' | 'results'>('loading');
  const [analysisOverlayMessage, setAnalysisOverlayMessage] = useState('Connecting with your thoughts...');
  const [analysisOverlayInsights, setAnalysisOverlayInsights] = useState<any>(undefined);
  const analysisProgress = useRef(new Animated.Value(0)).current;
  const analysisAbortRef = useRef<AbortController | null>(null);
  const analysisMessageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
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
        Alert.alert('Analysis failed', 'Unable to save AI insights.');
        return;
      }

      targetEntry.ai_structured_insights = analysis;
      targetEntry.ai_last_analyzed = new Date().toISOString();
      setEntry({ ...targetEntry });

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
      Alert.alert('Analysis failed', 'Something went wrong while analyzing this entry.');
    } finally {
      analysisAbortRef.current = null;
      setAnalyzing(false);
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

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 100 }} />
      </View>
    );
  }

  const structuredInsights = entry.ai_structured_insights || null;
  const moodAnalysis = structuredInsights?.mood_analysis || null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {!structuredInsights && (
            <TouchableOpacity 
              onPress={() => handleAnalyzeEntry()}
              disabled={analyzing}
              style={[
                styles.analyzeHeaderButton,
                (!entry?.content || analyzing) && styles.analyzeHeaderButtonDisabled
              ]}
            >
              {analyzing ? (
                <ActivityIndicator size="small" color="#a78bfa" />
              ) : (
                <Text style={[
                  styles.analyzeHeaderText,
                  !entry?.content && styles.analyzeHeaderTextDisabled
                ]}>
                  Analyze
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.entryContainer}>
          <TextInput
            style={styles.titleInput}
            value={editableTitle}
            onChangeText={setEditableTitle}
            placeholder="Untitled Entry"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            autoFocus={false}
          />
          <Text style={styles.metaLine}>
            {formatDate(entry.created_at)}
          </Text>
          <TextInput
            style={styles.contentInput}
            value={editableContent}
            onChangeText={setEditableContent}
            multiline
            textAlignVertical="top"
            placeholder="What's on your mind?"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            autoFocus={false}
          />
          
          {structuredInsights && (
            <View style={styles.inlineInsightsSection}>
              <View style={styles.insightsDivider} />
              <Text style={styles.inlineInsightsTitle}>Insights</Text>
              
              {/* Primary Emotion Badge - MOVED TO TOP */}
              {moodAnalysis && (
                <View style={[
                  styles.inlineMoodCard,
                  styles.inlineMoodCardTop,
                  getSentimentStyle(moodAnalysis.primary_emotion)
                ]}>
                  <View style={styles.emotionBadge}>
                    <Text style={styles.inlineMoodLabel}>PRIMARY EMOTION</Text>
                    <Text style={styles.inlineMoodEmotion}>{moodAnalysis.primary_emotion}</Text>
                  </View>
                </View>
              )}
              
              {/* Summary */}
              {structuredInsights?.insights_report?.conversationalSummary && (
                <View style={styles.inlineBriefingCard}>
                  <View style={styles.insightHeader}>
                    <Ionicons name="sparkles" size={20} color="#a855f7" />
                    <Text style={styles.insightHeaderText}>Summary</Text>
                  </View>
                  <Text style={styles.inlineBriefingText}>
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
                                    <Text style={styles.insightCardText}>
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
                                    <Text style={styles.insightCardText}>
                                      {card.text
                                        .replace(/The user/g, 'You')
                                        .replace(/the user/g, 'you')
                                        .replace(/their/g, 'your')
                                        .replace(/Their/g, 'Your')}
                                    </Text>
                                    {isGrowthOrReflection && (
                                      <TouchableOpacity style={[styles.playbookButton, cardStyle.button]}>
                                        <Ionicons name="add-circle-outline" size={16} color={cardStyle.buttonColor} />
                                        <Text style={[styles.playbookButtonText, { color: cardStyle.buttonColor }]}>
                                          Add to Playbook
                                        </Text>
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

      <ImmersiveAnalysisOverlay
        visible={analysisOverlayVisible}
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
            })}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analyzeHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    minWidth: 80,
    alignItems: 'center',
  },
  analyzeHeaderButtonDisabled: {
    opacity: 0.3,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  analyzeHeaderText: {
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeHeaderTextDisabled: {
    color: 'rgba(139, 92, 246, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  entryContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
    padding: 0,
  },
  metaLine: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
  },
  contentInput: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 26,
    minHeight: 200,
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
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(139, 92, 246, 0.95)',
    marginBottom: 16,
  },
  inlineBriefingCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(168, 85, 247, 0.95)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inlineBriefingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  inlineMoodCard: {
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inlineMoodCardTop: {
    marginBottom: 20,
  },
  emotionBadge: {
    alignItems: 'center',
  },
  inlineMoodLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inlineMoodEmotion: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.98)',
    textTransform: 'capitalize',
  },
  insightCardsContainer: {
    gap: 12,
    marginTop: 12,
  },
  insightCard: {
    borderRadius: 12,
    padding: 16,
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
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  insightCardText: {
    fontSize: 15,
    lineHeight: 22,
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
    fontSize: 13,
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  accordionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  accordionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  accordionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  accordionContent: {
    marginTop: 12,
    gap: 12,
  },
});
