import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AccessibilityInfo,
  Animated,
} from 'react-native';
import { MiraRevealPayload, REVEAL_GLOW } from '../../constants/miraReveal';
import { evidenceIconFor } from '../../utils/miraReveal';
import GlassCard from '../shared/GlassCard';
import PremiumButton from '../shared/PremiumButton';
import { PREMIUM, TYPE } from '../../constants/premiumUI';

type Props = {
  reveal: MiraRevealPayload;
  isDark: boolean;
  isRoast?: boolean;
  explanationExpanded: boolean;
  sharePrefix: string;
  labels: {
    confidence: string;
    evidence: string;
    recommendation: string;
    exploreWhy: string;
    askFollowUp: string;
    share: string;
    fromJournals: string;
  };
  onExploreWhy: () => void;
  onAskFollowUp: () => void;
};

export default React.memo(function MiraRevealCard({
  reveal,
  isDark,
  isRoast = false,
  explanationExpanded,
  labels,
  onExploreWhy,
  onAskFollowUp,
}: Props) {
  const announced = useRef(false);
  const enter = useRef(new Animated.Value(0)).current;
  const didAnimate = useRef(false);
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);

  const wash = isRoast
    ? 'rgba(239,68,68,0.07)'
    : isDark
      ? (REVEAL_GLOW[reveal.type] || REVEAL_GLOW.recurring_pattern)
      : 'rgba(139, 92, 246, 0.06)';

  const colors = isDark
    ? {
        eyebrow: PREMIUM.text.tertiary,
        answer: '#ffffff',
        confidenceBg: 'rgba(255, 255, 255, 0.08)',
        confidenceBorder: 'rgba(255, 255, 255, 0.12)',
        confidenceText: 'rgba(255,255,255,0.88)',
        fromJournals: PREMIUM.text.tertiary,
        section: PREMIUM.text.tertiary,
        evidence: 'rgba(255,255,255,0.82)',
        divider: 'rgba(255,255,255,0.08)',
        recommendation: 'rgba(255,255,255,0.72)',
      }
    : {
        eyebrow: 'rgba(26,26,26,0.45)',
        answer: '#1a1a1a',
        confidenceBg: 'rgba(139, 92, 246, 0.12)',
        confidenceBorder: 'rgba(139, 92, 246, 0.22)',
        confidenceText: '#5b21b6',
        fromJournals: 'rgba(26,26,26,0.45)',
        section: 'rgba(26,26,26,0.45)',
        evidence: 'rgba(26,26,26,0.72)',
        divider: 'rgba(0,0,0,0.08)',
        recommendation: 'rgba(26,26,26,0.7)',
      };

  const evidenceItems = reveal.evidence.slice(0, 4).map((line) => ({
    icon: evidenceIconFor(line),
    text: line.replace(/^[-•·]\s*/, '').trim(),
  }));

  useEffect(() => {
    if (announced.current) return;
    announced.current = true;
    const conf = reveal.confidence != null ? `, ${reveal.confidence}% confidence` : '';
    AccessibilityInfo.announceForAccessibility?.(`${reveal.headline}. ${reveal.answer}${conf}`);
  }, [reveal]);

  useEffect(() => {
    if (didAnimate.current) {
      enter.setValue(1);
      return;
    }
    didAnimate.current = true;
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: PREMIUM.motion.enterMs,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  useEffect(() => {
    if (explanationExpanded) setEvidenceExpanded(true);
  }, [explanationExpanded]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${reveal.headline}: ${reveal.answer}`}
    >
      <GlassCard variant="surface" wash={isDark || isRoast ? wash : undefined} noPad contentStyle={styles.inner}>
        <Text style={[styles.eyebrow, { color: colors.eyebrow }]}>{reveal.headline}</Text>
        <Text style={[styles.answer, { color: colors.answer }]}>{reveal.answer}</Text>

        <View style={styles.metaRow}>
          {reveal.confidence != null ? (
            <View style={[
              styles.confidencePill,
              { backgroundColor: colors.confidenceBg, borderColor: colors.confidenceBorder },
            ]}>
              <Text style={[styles.confidenceText, { color: colors.confidenceText }]}>
                {reveal.confidence}% {labels.confidence}
              </Text>
            </View>
          ) : null}
          <Text style={[styles.fromJournals, { color: colors.fromJournals }]}>
            {labels.fromJournals}
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.section }]}>{labels.evidence}</Text>
        <View style={styles.evidenceList}>
          {evidenceItems.map(({ icon, text }, i) => (
            <View key={`${i}-${text.slice(0, 16)}`} style={styles.evidenceRow}>
              <Text style={styles.evidenceIcon}>{icon}</Text>
              <Text
                style={[styles.evidenceLine, { color: colors.evidence }]}
                numberOfLines={evidenceExpanded ? undefined : 2}
              >
                {text}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.showMoreRow}>
          <PremiumButton
            variant="ghost"
            label={evidenceExpanded ? 'Show less' : 'Show more'}
            icon={evidenceExpanded ? 'chevron-up' : 'chevron-down'}
            onPress={() => setEvidenceExpanded((v) => !v)}
          />
        </View>

        {explanationExpanded && reveal.recommendation ? (
          <View style={styles.expandedBlock}>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <Text style={[styles.sectionLabel, { color: colors.section }]}>{labels.recommendation}</Text>
            <Text style={[styles.recommendation, { color: colors.recommendation }]}>
              {reveal.recommendation}
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <PremiumButton
            variant="primary"
            label={labels.exploreWhy}
            icon={explanationExpanded ? 'chevron-up' : 'search-outline'}
            onPress={onExploreWhy}
            style={styles.actionBtn}
          />
          <PremiumButton
            variant="secondary"
            label={labels.askFollowUp}
            icon="chatbubble-ellipses-outline"
            onPress={onAskFollowUp}
            style={styles.actionBtn}
          />
        </View>
      </GlassCard>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: PREMIUM.space[2],
  },
  inner: {
    padding: 20,
    gap: 0,
  },
  eyebrow: {
    ...TYPE.micro,
    marginBottom: 8,
  },
  answer: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  confidencePill: {
    borderRadius: PREMIUM.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  confidenceText: {
    ...TYPE.caption,
    fontWeight: '500',
  },
  fromJournals: {
    ...TYPE.caption,
  },
  sectionLabel: {
    ...TYPE.micro,
    marginBottom: 12,
  },
  evidenceList: {
    gap: 14,
    marginBottom: 4,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  evidenceIcon: {
    fontSize: 16,
    lineHeight: 22,
    width: 22,
    textAlign: 'center',
  },
  evidenceLine: {
    flex: 1,
    ...TYPE.secondary,
    lineHeight: 22,
  },
  showMoreRow: {
    marginTop: 4,
    marginLeft: -6,
  },
  expandedBlock: {
    marginTop: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  recommendation: {
    ...TYPE.body,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
