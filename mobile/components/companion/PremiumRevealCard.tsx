import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Pattern,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { evidenceIconFor } from '../../utils/miraReveal';
import { PREMIUM } from '../../constants/premiumUI';
import { isTablet, sf, ss } from '../../utils/responsive';

export type PremiumRevealContent = {
  headline: string;
  answer: string;
  confidence?: number | null;
  evidence: string[];
  fromLabel?: string;
  strength?: string;
  recommendation?: string;
};

type Props = {
  reveal: PremiumRevealContent;
  actions?: React.ReactNode;
  explanationExpanded?: boolean;
  recommendationLabel?: string;
  evidenceLabel?: string;
  confidenceLabel?: string;
  showMoreLabel?: string;
  showLessLabel?: string;
};

/**
 * Shared premium reveal / core-pattern card.
 * Figma mesh radials + TYPE token typography — used in onboarding Mira
 * and main Mira chat so the visual standard stays one system.
 */
export default function PremiumRevealCard({
  reveal,
  actions,
  explanationExpanded = false,
  recommendationLabel = 'Recommendation',
  evidenceLabel = 'Evidence',
  confidenceLabel = 'confidence',
  showMoreLabel = 'Show more',
  showLessLabel = 'Show less',
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const evidence = useMemo(
    () =>
      reveal.evidence.map((line) => ({
        icon: evidenceIconFor(line),
        text: line.replace(/^[-•·]\s*/, '').trim(),
      })),
    [reveal.evidence],
  );

  const visibleEvidence = expanded || explanationExpanded ? evidence : evidence.slice(0, 2);

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id="prPurple" cx="48%" cy="28%" rx="72%" ry="62%">
              <Stop offset="0%" stopColor={PREMIUM.revealMesh.purple} stopOpacity="0.95" />
              <Stop offset="55%" stopColor={PREMIUM.revealMesh.purple} stopOpacity="0.35" />
              <Stop offset="100%" stopColor={PREMIUM.revealMesh.purple} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="prPink" cx="18%" cy="92%" rx="55%" ry="48%">
              <Stop offset="0%" stopColor={PREMIUM.revealMesh.pink} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={PREMIUM.revealMesh.pink} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="prCyan" cx="92%" cy="88%" rx="58%" ry="52%">
              <Stop offset="0%" stopColor={PREMIUM.revealMesh.cyan} stopOpacity="0.88" />
              <Stop offset="100%" stopColor={PREMIUM.revealMesh.cyan} stopOpacity="0" />
            </RadialGradient>
            <Pattern id="prGrain" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <Circle cx="0.6" cy="0.8" r="0.4" fill="rgba(255,255,255,0.07)" />
              <Circle cx="2.8" cy="2.2" r="0.35" fill="rgba(255,255,255,0.045)" />
              <Circle cx="1.5" cy="3.2" r="0.3" fill="rgba(0,0,0,0.06)" />
            </Pattern>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={PREMIUM.revealMesh.base} />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#prPurple)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#prPink)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#prCyan)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#prGrain)" opacity={0.55} />
        </Svg>

        <View style={styles.topSheen} pointerEvents="none" />

        <View style={styles.inner}>
          <Text style={styles.label}>{reveal.headline}</Text>
          <Text style={styles.heading}>{reveal.answer}</Text>

          <View style={styles.metaRow}>
            {reveal.confidence != null ? (
              <View style={styles.confidencePill}>
                <Text style={styles.confidenceText}>
                  {reveal.confidence}% {confidenceLabel}
                </Text>
              </View>
            ) : null}
            {reveal.fromLabel ? (
              <Text style={styles.fromLabel}>{reveal.fromLabel}</Text>
            ) : null}
          </View>

          <Text style={styles.label}>{evidenceLabel}</Text>
          <View style={styles.evidenceList}>
            {visibleEvidence.map((item, i) => (
              <View key={`${i}-${item.text.slice(0, 18)}`} style={styles.evidenceRow}>
                <Text style={styles.evidenceIcon}>{item.icon}</Text>
                <Text style={styles.body}>{item.text}</Text>
              </View>
            ))}
          </View>

          {reveal.strength ? (
            <View style={styles.strengthBlock}>
              <Text style={styles.label}>Strength signal</Text>
              <Text style={styles.strengthValue}>{reveal.strength}</Text>
            </View>
          ) : null}

          {evidence.length > 2 ? (
            <TouchableOpacity
              style={styles.showMore}
              onPress={() => setExpanded((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={styles.showMoreText}>
                {expanded || explanationExpanded ? showLessLabel : showMoreLabel}
              </Text>
              <Ionicons
                name={expanded || explanationExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={PREMIUM.text.secondary}
              />
            </TouchableOpacity>
          ) : null}

          {explanationExpanded && reveal.recommendation ? (
            <View style={styles.recBlock}>
              <Text style={[styles.label, { marginBottom: PREMIUM.space[1] }]}>
                {recommendationLabel}
              </Text>
              <Text style={styles.body}>{reveal.recommendation}</Text>
            </View>
          ) : null}

          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: isTablet ? 560 : undefined,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    borderRadius: PREMIUM.radius.xl,
    overflow: 'hidden',
    borderWidth: 0,
    minHeight: isTablet ? 240 : 220,
    backgroundColor: PREMIUM.revealMesh.base,
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    opacity: 0.55,
  },
  inner: {
    padding: isTablet ? ss(PREMIUM.space[3]) : PREMIUM.space[3],
  },
  label: {
    fontSize: sf(12),
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: PREMIUM.space[1],
  },
  heading: {
    fontSize: sf(26),
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: sf(32),
    color: '#FFFFFF',
    marginBottom: PREMIUM.space[2],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: PREMIUM.space[3],
  },
  confidencePill: {
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderRadius: PREMIUM.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  confidenceText: {
    fontSize: sf(13),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  fromLabel: {
    fontSize: sf(13),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 0.2,
    lineHeight: sf(18),
  },
  evidenceList: {
    gap: 12,
    marginBottom: PREMIUM.space[2],
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  evidenceIcon: {
    fontSize: sf(17),
    lineHeight: sf(24),
    marginRight: 8,
    marginTop: 1,
  },
  body: {
    fontSize: sf(15),
    fontWeight: '400',
    lineHeight: sf(24),
    letterSpacing: 0.2,
    color: 'rgba(255,255,255,0.88)',
    flex: 1,
  },
  strengthBlock: {
    marginTop: PREMIUM.space[2],
    marginBottom: PREMIUM.space[2],
    paddingTop: 2,
  },
  strengthValue: {
    fontSize: sf(18),
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: sf(26),
    color: PREMIUM.text.primary,
    marginTop: 6,
    paddingTop: 2,
  },
  showMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: PREMIUM.space[1],
  },
  showMoreText: {
    fontSize: sf(15),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  recBlock: {
    marginTop: PREMIUM.space[2],
    paddingTop: PREMIUM.space[2],
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 10,
    marginTop: PREMIUM.space[3],
    alignItems: 'center',
  },
});
