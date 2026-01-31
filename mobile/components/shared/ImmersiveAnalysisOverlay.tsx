import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

type LoadingProps = {
  variant: 'loading';
  progress: Animated.AnimatedInterpolation<string> | Animated.Value;
  message: string;
  onCancel: () => void;
};

type ResultsProps = {
  variant: 'results';
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
};

type Props = {
  visible: boolean;
} & (LoadingProps | ResultsProps);

const { width } = Dimensions.get('window');

export default function ImmersiveAnalysisOverlay(props: Props) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const [strengthsExpanded, setStrengthsExpanded] = useState(true);
  const [growthExpanded, setGrowthExpanded] = useState(true);

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

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <LinearGradient
        colors={theme.colors.backgroundGradient as any}
        style={styles.background}
      />
      <View style={styles.scrim} />

      {props.variant === 'loading' ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>{props.message}</Text>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <TouchableOpacity onPress={props.onCancel} style={styles.cancelButton} activeOpacity={0.8}>
            <Text style={styles.cancelText}>Cancel analysis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>New Insights</Text>
          
          <ScrollView 
            style={styles.resultsScroll}
            contentContainerStyle={styles.resultsScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Summary */}
            {props.insights?.insights_report?.conversationalSummary && (
              <View style={styles.resultsCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderIcon}>📝</Text>
                  <Text style={styles.cardHeaderTitle}>Summary</Text>
                </View>
                <Text style={styles.summaryText}>
                  {props.insights.insights_report.conversationalSummary}
                </Text>
              </View>
            )}

            {/* Primary Emotion & Wellbeing Score */}
            <View style={styles.resultsCard}>
              <View style={styles.emotionWellbeingRow}>
                <View style={styles.emotionSection}>
                  <Text style={styles.resultsLabel}>PRIMARY EMOTION</Text>
                  <Text style={styles.resultsValue}>
                    {props.insights?.mood_analysis?.primary_emotion || '—'}
                  </Text>
                </View>
                {props.insights?.wellbeingScore !== undefined && (
                  <View style={styles.scoreSection}>
                    <Text style={styles.resultsLabel}>WELLBEING</Text>
                    <View style={styles.scoreCircle}>
                      <Text style={styles.scoreText}>{props.insights.wellbeingScore}</Text>
                      <Text style={styles.scoreMax}>/10</Text>
                    </View>
                  </View>
                )}
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
                    style={[styles.accordionHeader, styles.strengthsAccordion]}
                    onPress={() => setStrengthsExpanded(!strengthsExpanded)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accordionHeaderLeft}>
                      <Text style={styles.accordionIcon}>✨</Text>
                      <Text style={styles.accordionTitle}>Strengths & Wins</Text>
                      <View style={styles.accordionBadge}>
                        <Text style={styles.accordionBadgeText}>{strengthCards.length}</Text>
                      </View>
                    </View>
                    <Text style={styles.accordionChevron}>{strengthsExpanded ? '▼' : '▶'}</Text>
                  </TouchableOpacity>
                  
                  {strengthsExpanded && (
                    <View style={[styles.accordionContent, styles.strengthsContent]}>
                      {strengthCards.map((card: any, idx: number) => (
                        <View key={idx} style={styles.insightItem}>
                          <Text style={styles.insightTitle}>{card.short_label || card.type.toUpperCase()}</Text>
                          <Text style={styles.insightDescription}>{card.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })()}

            {/* Growth & Reflections Accordion */}
            {(() => {
              const growthCards = props.insights?.insights_report?.insightCards?.filter(
                (card: any) => card.type === 'growth' || card.type === 'reflection'
              ) || [];
              
              if (growthCards.length === 0) return null;
              
              return (
                <View style={styles.accordionSection}>
                  <TouchableOpacity 
                    style={[styles.accordionHeader, styles.growthAccordion]}
                    onPress={() => setGrowthExpanded(!growthExpanded)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accordionHeaderLeft}>
                      <Text style={styles.accordionIcon}>📈</Text>
                      <Text style={styles.accordionTitle}>Growth & Reflections</Text>
                      <View style={styles.accordionBadge}>
                        <Text style={styles.accordionBadgeText}>{growthCards.length}</Text>
                      </View>
                    </View>
                    <Text style={styles.accordionChevron}>{growthExpanded ? '▼' : '▶'}</Text>
                  </TouchableOpacity>
                  
                  {growthExpanded && (
                    <View style={[styles.accordionContent, styles.growthContent]}>
                      {growthCards.map((card: any, idx: number) => (
                        <View key={idx} style={styles.insightItem}>
                          <Text style={styles.insightTitle}>{card.short_label || card.type.toUpperCase()}</Text>
                          <Text style={styles.insightDescription}>{card.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })()}

            {/* Key Themes */}
            {props.insights?.key_themes && props.insights.key_themes.length > 0 && (
              <View style={styles.resultsCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderIcon}>💭</Text>
                  <Text style={styles.cardHeaderTitle}>Key Themes</Text>
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
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
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
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.85)',
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
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.8,
    marginBottom: 20,
    textAlign: 'center',
  },
  resultsScroll: {
    flex: 1,
  },
  resultsScrollContent: {
    paddingBottom: 20,
  },
  resultsCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(20, 20, 20, 0.75)',
    padding: 20,
    marginBottom: 14,
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  strengthsAccordion: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  growthAccordion: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
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
    borderTopWidth: 0,
    marginTop: -16,
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
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#8b5cf6',
    lineHeight: 32,
  },
  scoreMax: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(139, 92, 246, 0.7)',
    marginTop: -4,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  themeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(139, 92, 246, 0.95)',
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
});
