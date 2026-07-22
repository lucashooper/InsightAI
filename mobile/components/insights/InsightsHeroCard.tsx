import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { sf } from '../../utils/responsive';

type Props = {
  emotionLabel: string;
  emotion?: string | null;
  wellbeingLabel: string;
  wellbeingScore?: number;
  adjustLabel?: string;
  onWellbeingChange?: (score: number) => void;
};

const CARD_BG = '#13131A';

export default function InsightsHeroCard({
  emotionLabel,
  emotion,
  wellbeingLabel,
  wellbeingScore,
  adjustLabel = 'Adjust',
  onWellbeingChange,
}: Props) {
  const showWellbeing = wellbeingScore != null;
  const score = wellbeingScore ?? 0;
  const ringSize = 88;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const ringColor = score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444';
  const ringTrack = 'rgba(255,255,255,0.12)';

  const handleIncrement = () => {
    if (!onWellbeingChange) return;
    onWellbeingChange(Math.min(10, score + 1));
  };

  const handleDecrement = () => {
    if (!onWellbeingChange) return;
    onWellbeingChange(Math.max(1, score - 1));
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.emotionCol}>
          <Text style={styles.label}>{emotionLabel}</Text>
          <Text style={styles.emotionValue} numberOfLines={2}>
            {emotion || '—'}
          </Text>
        </View>

        {showWellbeing ? (
          <View style={styles.wellbeingCol}>
            <Text style={styles.label}>{wellbeingLabel}</Text>
            <View style={styles.ringWrap}>
              <Svg width={ringSize} height={ringSize} style={styles.ringSvg}>
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
              <View style={styles.ringInner}>
                <Text style={[styles.scoreText, { color: ringColor }]}>{score}</Text>
                <Text style={styles.scoreMax}>/10</Text>
              </View>
            </View>
            {onWellbeingChange ? (
              <View style={styles.adjustRow}>
                <TouchableOpacity onPress={handleDecrement} style={styles.adjustBtn} activeOpacity={0.7}>
                  <Text style={styles.adjustSymbol}>−</Text>
                </TouchableOpacity>
                <Text style={styles.adjustLabel}>{adjustLabel}</Text>
                <TouchableOpacity onPress={handleIncrement} style={styles.adjustBtn} activeOpacity={0.7}>
                  <Text style={styles.adjustSymbol}>+</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  emotionCol: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 88,
  },
  wellbeingCol: {
    alignItems: 'center',
    minWidth: 110,
  },
  label: {
    fontSize: sf(11),
    fontWeight: '700',
    letterSpacing: 1.1,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  emotionValue: {
    fontSize: sf(26),
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'capitalize',
    lineHeight: sf(32),
  },
  ringWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSvg: {
    position: 'absolute',
  },
  ringInner: {
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
    color: 'rgba(255,255,255,0.45)',
    marginTop: -2,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  adjustBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustSymbol: {
    fontSize: sf(18),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: sf(20),
  },
  adjustLabel: {
    fontSize: sf(11),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
  },
});
