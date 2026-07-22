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
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { translateEmotion } from '../../i18n/labels';
import StandardContainer from './StandardContainer';
import InsightsHeroCard from '../insights/InsightsHeroCard';
import PremiumButton from './PremiumButton';

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

export default function ImmersiveAnalysisOverlay(props: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
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

  if (!props.visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <LinearGradient colors={theme.colors.backgroundGradient as any} style={styles.background}>
        {props.variant === 'loading' ? (
        <View style={styles.center}>
          <Text style={[styles.loadingText, { color: textPrimary }]}>{props.message}</Text>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <TouchableOpacity onPress={props.onCancel} style={styles.cancelButton} activeOpacity={0.8}>
            <Text style={[styles.cancelText, { color: textSecondary }]}>{t('analysis.cancel')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, { color: textPrimary }]} numberOfLines={2}>
            {props.entryTitle ? `"${props.entryTitle}"` : t('analysis.newInsights')}
          </Text>
          {props.entryTitle && (
            <Text style={[styles.resultsSubtitle, { color: textSecondary }]}>{t('analysis.personal')}</Text>
          )}
          
          <ScrollView 
            style={styles.resultsScroll}
            contentContainerStyle={styles.resultsScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Summary */}
            {props.insights?.insights_report?.conversationalSummary && (
              <StandardContainer variant="nested" style={[styles.glassmorphicCard, { borderColor: cardBorder }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderIcon}>📝</Text>
                  <Text style={[styles.cardHeaderTitle, { color: textPrimary }]}>{t('analysis.summary')}</Text>
                </View>
                <Text style={[styles.summaryText, { color: textSecondary }]}>
                  {props.insights.insights_report.conversationalSummary}
                </Text>
              </StandardContainer>
            )}

            {/* Primary Emotion & Wellbeing Hero Card */}
            {(props.insights?.mood_analysis?.primary_emotion || props.insights?.wellbeingScore !== undefined) && (
              <InsightsHeroCard
                emotionLabel={t('insights.primaryEmotion')}
                emotion={translateEmotion(t, props.insights?.mood_analysis?.primary_emotion)}
                wellbeingLabel={t('insights.wellbeing')}
                wellbeingScore={editedWellbeing ?? props.insights?.wellbeingScore}
                onWellbeingChange={
                  props.variant === 'results' && props.onWellbeingChange
                    ? (newScore) => {
                        setEditedWellbeing(newScore);
                        props.onWellbeingChange!(newScore);
                      }
                    : undefined
                }
              />
            )}

            {/* Strengths & Wins Accordion */}
            {(() => {
              const strengthCards = props.insights?.insights_report?.insightCards?.filter(
                (card: any) => card.type === 'strength' || card.type === 'win'
              ) || [];
              
              if (strengthCards.length === 0) return null;
              
              return (
                <View style={styles.accordionSection}>
                  <StandardContainer variant="nested" style={[styles.accordionHeaderCard, { borderColor: cardBorder }]}>
                    <TouchableOpacity
                      style={styles.accordionHeaderRow}
                      onPress={() => setStrengthsExpanded(!strengthsExpanded)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.accordionHeaderLeft}>
                        <Ionicons name="sparkles-outline" size={18} color="#10b981" />
                        <Text style={[styles.accordionTitle, { color: textPrimary }]}>{t('analysis.working')}</Text>
                        <View style={[styles.accordionBadge, { backgroundColor: subtleBg }]}>
                          <Text style={[styles.accordionBadgeText, { color: textSecondary }]}>{strengthCards.length}</Text>
                        </View>
                      </View>
                      <Ionicons name={strengthsExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={textSecondary} />
                    </TouchableOpacity>
                  </StandardContainer>

                  {strengthsExpanded && strengthCards.map((card: any, idx: number) => (
                    <StandardContainer key={idx} variant="nested" style={[styles.insightCard, { borderColor: cardBorder, marginTop: 8 }]}>
                      <View style={[styles.growthBadge, { backgroundColor: subtleBg }]}>
                        <Text style={[styles.growthBadgeText, { color: textSecondary }]}>
                          {card.short_label || card.type.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.insightDescription, { color: textPrimary }]}>
                        {card.text
                          .replace(/The user/g, 'You')
                          .replace(/the user/g, 'you')
                          .replace(/their/g, 'your')
                          .replace(/Their/g, 'Your')}
                      </Text>
                    </StandardContainer>
                  ))}
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
                  <StandardContainer variant="nested" style={[styles.accordionHeaderCard, { borderColor: cardBorder }]}>
                    <TouchableOpacity
                      style={styles.accordionHeaderRow}
                      onPress={() => setGrowthExpanded(!growthExpanded)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.accordionHeaderLeft}>
                        <Ionicons name="leaf-outline" size={18} color="#f59e0b" />
                        <Text style={[styles.accordionTitle, { color: textPrimary }]}>{t('analysis.patterns')}</Text>
                        <View style={[styles.accordionBadge, { backgroundColor: subtleBg }]}>
                          <Text style={[styles.accordionBadgeText, { color: textSecondary }]}>{growthCards.length}</Text>
                        </View>
                      </View>
                      <Ionicons name={growthExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={textSecondary} />
                    </TouchableOpacity>
                  </StandardContainer>

                  {growthExpanded && growthCards.map((card: any, idx: number) => (
                    <StandardContainer key={idx} tint="violet" style={[styles.insightCard, { borderColor: cardBorder, marginTop: 10 }]}>
                      <View style={[styles.growthBadge, { backgroundColor: subtleBg }]}>
                        <Text style={[styles.growthBadgeText, { color: textSecondary }]}>
                          {card.short_label || card.type.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.insightDescription, { color: textPrimary }]}>
                        {card.text
                          .replace(/The user/g, 'You')
                          .replace(/the user/g, 'you')
                          .replace(/their/g, 'your')
                          .replace(/Their/g, 'Your')}
                      </Text>
                      {addToPlaybook && (
                        <LinearGradient
                          colors={['#9B6DFF', '#7C3AED', '#6D28D9']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[
                            styles.overlayPlaybookBtn,
                            addingId === `growth-${idx}` && styles.overlayPlaybookBtnDisabled,
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.overlayPlaybookBtnInner}
                            onPress={() => addToPlaybook(card.text, idx)}
                            disabled={addingId === `growth-${idx}`}
                            activeOpacity={0.78}
                          >
                            {addingId === `growth-${idx}` ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                                <Text style={styles.overlayPlaybookText}>{t('insights.addToPlaybook')}</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </LinearGradient>
                      )}
                    </StandardContainer>
                  ))}
                </View>
              );
            })()}

            {/* Key Themes */}
            {props.insights?.key_themes && props.insights.key_themes.length > 0 && (
              <StandardContainer variant="nested" style={[styles.glassmorphicCard, { borderColor: cardBorder }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="chatbubble-outline" size={18} color="#a78bfa" />
                  <Text style={[styles.cardHeaderTitle, { color: textPrimary }]}>{t('analysis.themes')}</Text>
                </View>
                {props.insights.key_themes.slice(0, 3).map((t, idx) => (
                  <View key={idx} style={[styles.themeChip, { backgroundColor: subtleBg }]}>
                    <Text style={[styles.themeChipText, { color: textPrimary }]}>{t.theme}</Text>
                  </View>
                ))}
              </StandardContainer>
            )}
          </ScrollView>

          <PremiumButton label={t('common.done')} onPress={props.onDone} style={styles.doneButtonWrap} />
        </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
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
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1.1,
    lineHeight: 40,
    marginBottom: 10,
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
    padding: 16,
    marginBottom: 12,
  },
  doneButtonWrap: {
    marginTop: 8,
    marginBottom: 24,
  },
  accordionHeaderCard: {
    padding: 0,
    marginBottom: 0,
  },
  accordionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  insightCard: {
    padding: 18,
    borderRadius: 18,
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
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 23,
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
    alignSelf: 'flex-start',
    marginTop: 16,
    borderRadius: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  overlayPlaybookBtnDisabled: {
    opacity: 0.62,
  },
  overlayPlaybookBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  overlayPlaybookText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});
