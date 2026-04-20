import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

type LoadingProps = {
  variant: 'loading';
  progress: Animated.AnimatedInterpolation<string> | Animated.Value;
  message: string;
  onCancel: () => void;
};

type ResultsProps = {
  variant: 'results';
  entryTitle?: string;
  insights?: {
    mood_analysis?: {
      primary_emotion?: string;
    };
    wellbeingScore?: number;
    strengths?: Array<{ strength: string; explanation: string }>;
    growth_areas?: Array<{ area: string; suggestion: string }>;
    key_themes?: Array<{ theme: string; description: string }>;
    insights_report?: {
      conversationalSummary?: string;
      insightCards?: Array<{
        type: string;
        text: string;
        short_label: string;
      }>;
    };
  };
  onDone: () => void;
  onWellbeingChange?: (score: number) => void;
  onAddToPlaybook?: (text: string, index: number) => void;
  addingToPlaybook?: string | null;
};

type Props = {
  visible: boolean;
  entryTitle?: string;
} & (LoadingProps | ResultsProps);

const { width } = Dimensions.get('window');

const gradientBg = require('../../public/cool-gradient-bg.png');

export default function ImmersiveAnalysisOverlay(props: Props) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const [strengthsExpanded, setStrengthsExpanded] = useState(true);
  const [growthExpanded, setGrowthExpanded] = useState(true);
  const [editedWellbeing, setEditedWellbeing] = useState<number | null>(null);

  // Reset edited wellbeing when insights change
  useEffect(() => {
    if (props.variant === 'results' && props.insights?.wellbeingScore !== undefined) {
      setEditedWellbeing(props.insights.wellbeingScore);
    }
  }, [props.variant === 'results' ? props.insights?.wellbeingScore : undefined]);

  useEffect(() => {
    if (!props.visible) {
      opacity.setValue(0);
      return;
    }

    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [props.visible, opacity]);

  const progressWidth = useMemo(() => {
    if (props.variant !== 'loading') return undefined;
    if (props.progress instanceof Animated.Value) {
      return props.progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
      });
    }
    return props.progress;
  }, [props]);

  if (!props.visible) return null;

  const dark = isDarkTheme(theme.name);
  const textPrimary = theme.colors.primaryText;
  const textSecondary = theme.colors.secondaryText;
  const textTertiary = theme.colors.tertiaryText;
  const cardBg = theme.colors.cardBackground;
  const cardBorder = theme.colors.border;
  const subtleBg = dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const ringTrack = dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

  if (!props.visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      {/* Cool gradient background */}
      <ImageBackground
        source={gradientBg}
        style={styles.background}
        resizeMode="cover"
        imageStyle={styles.backgroundImage}
      >
        {props.variant === 'loading' ? (
        <View style={styles.center}>
          <Text style={[styles.loadingText, { color: 'rgba(255, 255, 255, 0.95)' }]}>{props.message}</Text>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <TouchableOpacity onPress={props.onCancel} style={styles.cancelButton} activeOpacity={0.8}>
            <Text style={[styles.cancelText, { color: textSecondary }]}>Cancel analysis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, { color: 'rgba(255, 255, 255, 0.98)' }]} numberOfLines={2}>
            {props.entryTitle ? `"${props.entryTitle}"` : 'New Insights'}
          </Text>
          {props.entryTitle && (
            <Text style={[styles.resultsSubtitle, { color: 'rgba(255, 255, 255, 0.6)' }]}>Your personal insights</Text>
          )}
          
          <ScrollView 
            style={styles.resultsScroll}
            contentContainerStyle={styles.resultsScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Summary */}
            {props.insights?.insights_report?.conversationalSummary && (
              <View style={styles.glassmorphicCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderIcon}>📝</Text>
                  <Text style={[styles.cardHeaderTitle, { color: 'rgba(255, 255, 255, 0.95)' }]}>Summary</Text>
                </View>
                <Text style={[styles.summaryText, { color: 'rgba(255, 255, 255, 0.85)' }]}>
                  {props.insights.insights_report.conversationalSummary}
                </Text>
              </View>
            )}

            {/* Primary Emotion & Wellbeing Score */}
            <View style={styles.glassmorphicCard}>
              <View style={styles.emotionWellbeingRow}>
                <View style={styles.emotionSection}>
                  <Text style={[styles.resultsLabel, { color: 'rgba(255, 255, 255, 0.6)' }]}>PRIMARY EMOTION</Text>
                  <Text style={[styles.resultsValue, { color: 'rgba(255, 255, 255, 0.98)' }]}>
                    {props.insights?.mood_analysis?.primary_emotion || '—'}
                  </Text>
                </View>
                {props.insights?.wellbeingScore !== undefined && (() => {
                  const score = editedWellbeing ?? props.insights!.wellbeingScore!;
                  const ringSize = 90;
                  const strokeWidth = 6;
                  const radius = (ringSize - strokeWidth) / 2;
                  const circumference = 2 * Math.PI * radius;
                  const progress = (score / 10) * circumference;
                  const ringColor = score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444';

                  const handleIncrement = () => {
                    const newScore = Math.min(10, score + 1);
                    setEditedWellbeing(newScore);
                    if (props.variant === 'results' && props.onWellbeingChange) {
                      props.onWellbeingChange(newScore);
                    }
                  };
                  const handleDecrement = () => {
                    const newScore = Math.max(1, score - 1);
                    setEditedWellbeing(newScore);
                    if (props.variant === 'results' && props.onWellbeingChange) {
                      props.onWellbeingChange(newScore);
                    }
                  };

                  return (
                    <View style={styles.scoreSection}>
                      <Text style={[styles.resultsLabel, { color: 'rgba(255, 255, 255, 0.6)' }]}>WELLBEING</Text>
                      <View style={styles.scoreRingContainer}>
                        <Svg width={ringSize} height={ringSize} style={styles.scoreRingSvg}>
                          <Circle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={radius}
                            stroke={ringTrack}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                          />
                          <Circle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={radius}
                            stroke={ringColor}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${progress} ${circumference - progress}`}
                            strokeDashoffset={circumference * 0.25}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                          />
                        </Svg>
                        <View style={styles.scoreRingInner}>
                          <Text style={[styles.scoreText, { color: ringColor }]}>{score}</Text>
                          <Text style={[styles.scoreMax, { color: 'rgba(255, 255, 255, 0.6)' }]}>/10</Text>
                        </View>
                      </View>
                      <View style={styles.scoreAdjustRow}>
                        <TouchableOpacity onPress={handleDecrement} style={styles.scoreAdjustBtn} activeOpacity={0.7}>
                          <Text style={[styles.scoreAdjustText, { color: 'rgba(255, 255, 255, 0.7)' }]}>−</Text>
                        </TouchableOpacity>
                        <Text style={[styles.scoreAdjustLabel, { color: 'rgba(255, 255, 255, 0.6)' }]}>Adjust</Text>
                        <TouchableOpacity onPress={handleIncrement} style={styles.scoreAdjustBtn} activeOpacity={0.7}>
                          <Text style={[styles.scoreAdjustText, { color: 'rgba(255, 255, 255, 0.7)' }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })()}
              </View>
            </View>

            {/* Strengths & Wins Accordion */}
            {(() => {
              const strengthCards = props.insights?.insights_report?.insightCards?.filter(
                (card: any) => card.type === 'strength' || card.type === 'win'
              ) || [];
              
              if (strengthCards.length === 0) return null;
              
              return (
                <View style={styles.accordionSection}>
                  <TouchableOpacity 
                    style={styles.glassmorphicAccordionHeader}
                    onPress={() => setStrengthsExpanded(!strengthsExpanded)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accordionHeaderLeft}>
                      <Text style={styles.accordionIcon}>✨</Text>
                      <Text style={[styles.accordionTitle, { color: 'rgba(255, 255, 255, 0.95)' }]}>What's Working</Text>
                      <View style={styles.accordionBadge}>
                        <Text style={[styles.accordionBadgeText, { color: 'rgba(255, 255, 255, 0.8)' }]}>{strengthCards.length}</Text>
                      </View>
                    </View>
                    <Text style={[styles.accordionChevron, { color: 'rgba(255, 255, 255, 0.6)' }]}>{strengthsExpanded ? '▼' : '▶'}</Text>
                  </TouchableOpacity>
                  
                  {strengthsExpanded && strengthCards.map((card: any, idx: number) => {
                    return (
                      <View key={idx} style={styles.glassmorphicInsightCard}>
                        <View style={styles.growthCardInner}>
                          <View style={styles.growthBadge}>
                            <Text style={[styles.growthBadgeText, { color: 'rgba(255, 255, 255, 0.7)' }]}>
                              {card.short_label || card.type.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={[styles.insightDescription, { color: 'rgba(255, 255, 255, 0.85)' }]}>
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
              );
            })()}

            {/* Growth & Reflections Accordion */}
            {(() => {
              const growthCards = props.insights?.insights_report?.insightCards?.filter(
                (card: any) => card.type === 'growth' || card.type === 'reflection'
              ) || [];
              
              if (growthCards.length === 0) return null;

              const addToPlaybook = props.variant === 'results' ? props.onAddToPlaybook : undefined;
              const addingId = props.variant === 'results' ? props.addingToPlaybook : null;
              
              return (
                <View style={styles.accordionSection}>
                  <TouchableOpacity 
                    style={styles.glassmorphicAccordionHeader}
                    onPress={() => setGrowthExpanded(!growthExpanded)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accordionHeaderLeft}>
                      <Text style={styles.accordionIcon}>🌱</Text>
                      <Text style={[styles.accordionTitle, { color: 'rgba(255, 255, 255, 0.95)' }]}>Patterns to Address</Text>
                      <View style={styles.accordionBadge}>
                        <Text style={[styles.accordionBadgeText, { color: 'rgba(255, 255, 255, 0.8)' }]}>{growthCards.length}</Text>
                      </View>
                    </View>
                    <Text style={[styles.accordionChevron, { color: 'rgba(255, 255, 255, 0.6)' }]}>{growthExpanded ? '▼' : '▶'}</Text>
                  </TouchableOpacity>
                  
                  {growthExpanded && growthCards.map((card: any, idx: number) => {
                    const isGrowth = card.type === 'growth';
                    return (
                      <View key={idx} style={styles.glassmorphicInsightCard}>
                        <View style={styles.growthCardInner}>
                          <View style={styles.growthBadge}>
                            <Text style={[styles.growthBadgeText, { color: 'rgba(255, 255, 255, 0.7)' }]}>
                              {card.short_label || card.type.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={[styles.insightDescription, { color: 'rgba(255, 255, 255, 0.85)' }]}>
                            {card.text
                              .replace(/The user/g, 'You')
                              .replace(/the user/g, 'you')
                              .replace(/their/g, 'your')
                              .replace(/Their/g, 'Your')}
                          </Text>
                          {addToPlaybook && (
                            <TouchableOpacity
                              style={styles.overlayPlaybookBtn}
                              onPress={() => addToPlaybook(card.text, idx)}
                              disabled={addingId === `growth-${idx}`}
                              activeOpacity={0.7}
                            >
                              {addingId === `growth-${idx}` ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                              ) : (
                                <>
                                  <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
                                  <Text style={styles.overlayPlaybookText}>Add to Playbook</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })()}

            {/* Key Themes */}
            {props.insights?.key_themes && props.insights.key_themes.length > 0 && (
              <View style={styles.glassmorphicCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderIcon}>💭</Text>
                  <Text style={[styles.cardHeaderTitle, { color: 'rgba(255, 255, 255, 0.95)' }]}>Key Themes</Text>
                </View>
                {props.insights.key_themes.slice(0, 3).map((t, idx) => (
                  <View key={idx} style={styles.themeChip}>
                    <Text style={styles.themeChipText}>{t.theme}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity onPress={props.onDone} style={styles.doneButton} activeOpacity={0.9}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
        )}
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: '#000000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  orbsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  // Purple orb - top right
  purpleOrbWrapper: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 380,
    height: 380,
    opacity: 0.6,
    transform: [{ scaleX: 1.4 }],
  },
  purpleOrb: {
    width: '100%',
    height: '100%',
    borderRadius: 190,
  },
  // Green orb - bottom left
  greenOrbWrapper: {
    position: 'absolute',
    bottom: 40,
    left: -80,
    width: 340,
    height: 340,
    opacity: 0.5,
    transform: [{ scaleY: 1.3 }],
  },
  greenOrb: {
    width: '100%',
    height: '100%',
    borderRadius: 170,
  },
  // Amber orb - bottom right for depth
  amberOrbWrapper: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    width: 300,
    height: 300,
    opacity: 0.45,
    transform: [{ scaleX: 1.2 }, { scaleY: 1.1 }],
  },
  amberOrb: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 22,
  },
  progressTrack: {
    width: Math.min(320, width * 0.76),
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.75)',
  },
  cancelButton: {
    marginTop: 26,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    textDecorationLine: 'underline',
  },
  resultsContainer: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 20,
    zIndex: 10,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  resultsSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  resultsScroll: {
    flex: 1,
  },
  resultsScrollContent: {
    paddingBottom: 20,
  },
  resultsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  glassmorphicCard: {
    backgroundColor: 'rgba(88, 50, 150, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 8,
    overflow: 'hidden',
  },
  glassmorphicAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(88, 50, 150, 0.4)',
    borderWidth: 0,
    marginBottom: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  glassmorphicInsightCard: {
    backgroundColor: 'rgba(88, 50, 150, 0.35)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  accordionSection: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  strengthsAccordion: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  growthAccordion: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  accordionIcon: {
    fontSize: 18,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.3,
  },
  accordionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
  accordionChevron: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  accordionContent: {
    padding: 16,
    paddingTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  strengthsContent: {
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  growthContent: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  emotionWellbeingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  emotionSection: {
    flex: 1,
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreRingContainer: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  scoreRingSvg: {
    position: 'absolute',
  },
  scoreRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  scoreMax: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: -2,
  },
  scoreAdjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  scoreAdjustBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreAdjustText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  scoreAdjustLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardHeaderIcon: {
    fontSize: 20,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: -0.3,
  },
  insightItem: {
    marginBottom: 14,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  themeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#8b5cf6',
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  themeChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
  },
  resultsLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  resultsValue: {
    fontSize: 26,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  doneButton: {
    alignSelf: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 999,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  growthCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  growthCardBorder: {
    width: 4,
  },
  growthCardInner: {
    flex: 1,
    padding: 14,
  },
  growthBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  growthBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  overlayPlaybookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
  },
  overlayPlaybookText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
});
