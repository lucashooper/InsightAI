import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, LayoutAnimation, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { sf } from '../../utils/responsive';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { wellbeingTierFromScore } from './WellbeingIllustrations';
import WellbeingHeroArt from './WellbeingHeroArt';
import EmotionPills from './EmotionPills';
import {
  wellbeingBadgeBg,
  wellbeingBadgeLabel,
  wellbeingRingColor,
  wellbeingToDisplay,
} from '../../utils/wellbeingDisplay';

const RING_SIZE = 96;
const ART_RESERVE = 80;

type Props = {
  emotion?: string | null;
  wellbeingScore?: number;
  adjustLabel?: string;
  onWellbeingChange?: (score: number) => void;
  summarySnippet?: string;
  onReadFullSummary?: () => void;
  readFullSummaryLabel?: string;
  emotions?: string[];
  showFullSummary?: boolean;
  fullSummary?: string;
};

export default function InsightsHeroCard({
  emotion,
  wellbeingScore,
  adjustLabel = 'Adjust',
  onWellbeingChange,
  summarySnippet,
  onReadFullSummary,
  readFullSummaryLabel = 'Read full summary',
  emotions = [],
  showFullSummary = false,
  fullSummary,
}: Props) {
  const { theme } = useTheme();
  const isDark = isDarkTheme(theme.name);
  const [showAdjust, setShowAdjust] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const showWellbeing = wellbeingScore != null;
  const score10 = wellbeingScore ?? 0;
  const score100 = wellbeingToDisplay(score10);
  const ringColor = wellbeingRingColor(score100);
  const tier = wellbeingTierFromScore(score100);
  const badgeLabel = wellbeingBadgeLabel(score100);
  const badgeBg = wellbeingBadgeBg(score100, isDark);

  const strokeWidth = 7;
  const radius = (RING_SIZE - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score100 / 100) * circumference;
  const ringTrack = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)';

  const cardBg = isDark ? theme.colors.cardBackground : '#FFFFFF';
  const cardBorder = isDark ? theme.colors.border : 'rgba(0,0,0,0.06)';
  const textPrimary = theme.colors.primaryText;
  const textSecondary = theme.colors.secondaryText;

  const pillEmotions = emotions.length > 0 ? emotions : emotion ? [emotion] : [];
  const displayEmotion = emotion
    ? emotion.charAt(0).toUpperCase() + emotion.slice(1)
    : null;
  const canAdjust = Boolean(onWellbeingChange);
  const canExpandSummary = Boolean(summarySnippet && !showFullSummary);
  const summaryNeedsExpand = Boolean(summarySnippet && summarySnippet.length > 80);

  const toggleExpanded = () => {
    if (!canExpandSummary) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((v) => !v);
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: cardBorder },
          Platform.OS === 'android' ? { elevation: 2 } : styles.cardShadow,
        ]}
      >
        <View style={styles.cardRow}>
          {showWellbeing ? (
            <View style={styles.scoreCol}>
              <TouchableOpacity
                onPress={() => canAdjust && setShowAdjust((v) => !v)}
                activeOpacity={canAdjust ? 0.85 : 1}
                disabled={!canAdjust}
                style={styles.ringWrap}
              >
                <Svg width={RING_SIZE} height={RING_SIZE}>
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={radius}
                    stroke={ringTrack}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={radius}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={`${progress} ${circumference - progress}`}
                    strokeDashoffset={circumference * 0.25}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  />
                </Svg>
                <View style={styles.ringInner}>
                  <Text style={[styles.scoreText, { color: ringColor }]}>{score100}</Text>
                  <Text style={[styles.scoreMax, { color: textSecondary }]}>/100</Text>
                </View>
              </TouchableOpacity>

              {showAdjust && canAdjust ? (
                <View
                  style={[
                    styles.adjustRow,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => onWellbeingChange!(Math.max(1, score10 - 1))}
                    style={styles.adjustBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.adjustSymbol, { color: textSecondary }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[styles.adjustLabel, { color: textSecondary }]}>{adjustLabel}</Text>
                  <TouchableOpacity
                    onPress={() => onWellbeingChange!(Math.min(10, score10 + 1))}
                    style={styles.adjustBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.adjustSymbol, { color: textSecondary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={[styles.contentCol, !showWellbeing && styles.contentColFull]}>
            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.badgeStar, { color: ringColor }]}>★</Text>
              <Text style={[styles.badgeText, { color: ringColor }]}>{badgeLabel}</Text>
            </View>

            {displayEmotion ? (
              <Text style={[styles.emotionValue, { color: textPrimary }]} numberOfLines={1}>
                {displayEmotion}
              </Text>
            ) : null}

            {summarySnippet && !showFullSummary ? (
              <TouchableOpacity
                activeOpacity={canExpandSummary ? 0.85 : 1}
                onPress={toggleExpanded}
                disabled={!canExpandSummary}
              >
                <Text
                  style={[styles.summarySnippet, { color: textSecondary }]}
                  numberOfLines={isExpanded ? undefined : 2}
                >
                  {summarySnippet}
                </Text>
                {canExpandSummary && summaryNeedsExpand ? (
                  <Text style={styles.expandHint}>
                    {isExpanded ? 'Show less ↑' : 'Show more ↓'}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ) : null}

            {showFullSummary && fullSummary ? (
              <Text style={[styles.fullSummary, { color: textSecondary }]}>{fullSummary}</Text>
            ) : null}

            {onReadFullSummary && !showFullSummary && summarySnippet ? (
              <TouchableOpacity style={styles.readMoreRow} onPress={onReadFullSummary} activeOpacity={0.75}>
                <Text style={[styles.readMoreText, { color: ringColor }]}>{readFullSummaryLabel}</Text>
                <Ionicons name="arrow-forward-circle" size={18} color={ringColor} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <WellbeingHeroArt tier={tier} cardBg={cardBg} isDark={isDark} />
      </View>

      {pillEmotions.length > 0 ? (
        <View style={styles.pillsOuter}>
          <EmotionPills emotions={pillEmotions} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  card: {
    position: 'relative',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    minHeight: 110,
    overflow: 'hidden',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  scoreCol: {
    alignItems: 'center',
    width: RING_SIZE,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: sf(28),
    fontWeight: '800',
    lineHeight: sf(30),
  },
  scoreMax: {
    fontSize: sf(12),
    fontWeight: '600',
    marginTop: -1,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
  },
  adjustBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustSymbol: { fontSize: sf(16), fontWeight: '600', lineHeight: sf(18) },
  adjustLabel: { fontSize: sf(10), fontWeight: '600' },
  contentCol: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: ART_RESERVE,
  },
  contentColFull: {
    marginLeft: 0,
    marginRight: ART_RESERVE,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 6,
  },
  badgeStar: { fontSize: sf(11) },
  badgeText: { fontSize: sf(12), fontWeight: '700' },
  emotionValue: {
    fontSize: sf(17),
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  summarySnippet: {
    fontSize: sf(14),
    lineHeight: sf(20),
  },
  expandHint: {
    fontSize: 12,
    color: '#7B5EA7',
    marginTop: 4,
    fontWeight: '600',
  },
  fullSummary: { fontSize: sf(14), lineHeight: sf(22), marginTop: 4 },
  readMoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  readMoreText: { fontSize: sf(13), fontWeight: '700' },
  pillsOuter: {
    marginTop: 10,
  },
});
