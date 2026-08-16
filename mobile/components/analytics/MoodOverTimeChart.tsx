import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { sf } from '../../utils/responsive';
import { getMoodIndicator } from '../../utils/moodIndicators';
import { computeWeeklyMoodStats, pickDateLabelIndices } from '../../utils/moodTrendData';
import PremiumButton from '../shared/PremiumButton';

export type MoodTrendPoint = {
  id: string;
  date: string;
  displayDate?: string;
  wellbeing: number;
  entryCount?: number;
  primaryEmotion?: string;
  entry: any;
};

type Props = {
  points: MoodTrendPoint[];
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  cardBorder: string;
  title: string;
  subtitle?: string;
  weeklyRecapLabel: string;
  weeklyAvgLabel: string;
  daysTrackedLabel: string;
  bestDayLabel: string;
  selectedDayLabel: string;
  viewEntryLabel: string;
  onSeeAdvice: (point: MoodTrendPoint) => void;
  chartOpacity?: Animated.Value;
};

const CHART_WIDTH = Dimensions.get('window').width - 88;
const CHART_HEIGHT = 168;
const PAD_LEFT = 44;
const PAD_RIGHT = 44;
const PAD_TOP = 22;
const PAD_BOTTOM = 34;
const PLOT_W = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

const Y_ZONES = [
  { score: 8, emoji: '😊', label: '8' },
  { score: 5, emoji: '😐', label: '5' },
  { score: 2, emoji: '😔', label: '2' },
];

function scoreToY(score10: number): number {
  const clamped = Math.max(1, Math.min(10, score10));
  const normalized = (clamped - 1) / 9;
  return PAD_TOP + PLOT_H - normalized * PLOT_H;
}

function indexToX(index: number, count: number): number {
  if (count <= 1) return PAD_LEFT + PLOT_W / 2;
  return PAD_LEFT + (index / (count - 1)) * PLOT_W;
}

function formatPointDate(point: MoodTrendPoint): string {
  if (point.displayDate) return point.displayDate;
  const d = new Date(point.date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const LABEL_WIDTH = 56;

function labelStyleForIndex(
  index: number,
  count: number,
  x: number,
): { left: number; width: number; textAlign: 'center' } {
  return {
    left: x - LABEL_WIDTH / 2,
    width: LABEL_WIDTH,
    textAlign: 'center',
  };
}

function InfoStrip({
  title,
  body,
  bodyHighlight,
  isDark,
  textPrimary,
  textSecondary,
  action,
}: {
  title: string;
  body?: string;
  bodyHighlight?: string;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  action?: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.infoStrip,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(79,70,229,0.05)' },
      ]}
    >
      <View style={styles.infoStripText}>
        <Text style={[styles.infoStripTitle, { color: textPrimary }]}>{title}</Text>
        {bodyHighlight ? (
          <Text style={[styles.infoStripBody, { color: textSecondary }]}>
            <Text style={styles.infoStripHighlight}>{bodyHighlight}</Text>
            {body ? ` · ${body}` : ''}
          </Text>
        ) : body ? (
          <Text style={[styles.infoStripBody, { color: textSecondary }]}>{body}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export default function MoodOverTimeChart({
  points,
  isDark,
  textPrimary,
  textSecondary,
  cardBg,
  cardBorder,
  title,
  subtitle,
  weeklyRecapLabel,
  weeklyAvgLabel,
  daysTrackedLabel,
  bestDayLabel,
  selectedDayLabel,
  viewEntryLabel,
  onSeeAdvice,
  chartOpacity,
}: Props) {
  const weekly = useMemo(() => computeWeeklyMoodStats(points), [points]);
  const labelIndices = useMemo(() => pickDateLabelIndices(points.length), [points.length]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points
      .map((p, i) => {
        const x = indexToX(i, points.length);
        const y = scoreToY(p.wellbeing);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [points]);

  const selected = selectedIndex != null ? points[selectedIndex] : null;
  const selectedScore10 = selected?.wellbeing ?? 0;
  const selectedIndicator = selected?.primaryEmotion
    ? getMoodIndicator({ mood_analysis: { primary_emotion: selected.primaryEmotion } })
    : null;
  const isBestSelected = selectedIndex === weekly.bestIndex;
  const bestPoint = points[weekly.bestIndex];
  const bestIndicator = bestPoint?.primaryEmotion
    ? getMoodIndicator({ mood_analysis: { primary_emotion: bestPoint.primaryEmotion } })
    : null;

  const dotFill = cardBg === 'transparent' ? (isDark ? '#1a1528' : '#FFFFFF') : cardBg;
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const lineColor = isDark ? '#818cf8' : '#4f46e5';
  const dotColor = isDark ? '#818cf8' : '#4f46e5';

  const daysLabel = daysTrackedLabel.replace('{{count}}', String(points.length));

  const content = (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: textSecondary }]}>{subtitle}</Text>
      ) : null}

      <View style={styles.chartWrap}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {Y_ZONES.map(({ score, emoji, label }) => {
            const y = scoreToY(score);
            return (
              <React.Fragment key={score}>
                <Line
                  x1={PAD_LEFT}
                  y1={y}
                  x2={CHART_WIDTH - PAD_RIGHT}
                  y2={y}
                  stroke={gridColor}
                  strokeWidth={1}
                  strokeDasharray="4 6"
                />
                <SvgText x={4} y={y + 5} fontSize={13}>{emoji}</SvgText>
                <SvgText
                  x={26}
                  y={y + 4}
                  fontSize={9}
                  fill={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.28)'}
                  fontWeight="600"
                >
                  {label}
                </SvgText>
              </React.Fragment>
            );
          })}

          {linePath ? (
            <Path
              d={linePath}
              stroke={lineColor}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map((p, i) => {
            const x = indexToX(i, points.length);
            const y = scoreToY(p.wellbeing);
            const isSelected = i === selectedIndex;
            const isBest = i === weekly.bestIndex;
            return (
              <React.Fragment key={p.id}>
                {isBest ? (
                  <Circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill={isDark ? 'rgba(129,140,248,0.12)' : 'rgba(79,70,229,0.1)'}
                  />
                ) : null}
                <Circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 6.5 : 5}
                  fill={isSelected ? dotColor : dotFill}
                  stroke={dotColor}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
              </React.Fragment>
            );
          })}
        </Svg>

        {points.map((p, i) => {
          const x = indexToX(i, points.length);
          const y = scoreToY(p.wellbeing);
          return (
            <Pressable
              key={`tap-${p.id}`}
              style={[styles.dotHit, { left: x - 16, top: y - 16 }]}
              onPress={() => setSelectedIndex((prev) => (prev === i ? null : i))}
              hitSlop={6}
            />
          );
        })}

        <View style={[styles.xLabelsRow, { width: CHART_WIDTH, height: 18 }]}>
          {labelIndices.map((i) => {
            const x = indexToX(i, points.length);
            const labelPos = labelStyleForIndex(i, points.length, x);
            return (
              <Text
                key={points[i].id}
                style={[
                  styles.xLabel,
                  { color: textSecondary, ...labelPos },
                ]}
              >
                {formatPointDate(points[i])}
              </Text>
            );
          })}
        </View>
      </View>

      <InfoStrip
        title={weeklyRecapLabel}
        bodyHighlight={`${weeklyAvgLabel}: ${weekly.avg}/10`}
        body={daysLabel}
        isDark={isDark}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />

      {bestPoint ? (
        <InfoStrip
          title={bestDayLabel}
          body={`${formatPointDate(bestPoint)} · ${bestPoint.wellbeing}/10${
            bestPoint.primaryEmotion
              ? ` · ${bestIndicator?.emoji ?? ''} ${bestPoint.primaryEmotion}`
              : ''
          }`}
          isDark={isDark}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          action={
            <PremiumButton
              label={viewEntryLabel}
              onPress={() => onSeeAdvice(bestPoint)}
              style={styles.stripButton}
            />
          }
        />
      ) : null}

      {selected && selectedIndex != null && !isBestSelected ? (
        <InfoStrip
          title={selectedDayLabel}
          body={`${formatPointDate(selected)} · ${selectedScore10}/10${
            selected.primaryEmotion
              ? ` · ${selectedIndicator?.emoji ?? ''} ${selected.primaryEmotion}`
              : ''
          }`}
          isDark={isDark}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          action={
            <PremiumButton
              label={viewEntryLabel}
              onPress={() => onSeeAdvice(selected)}
              style={styles.stripButton}
            />
          }
        />
      ) : null}
    </View>
  );

  if (chartOpacity) {
    return <Animated.View style={{ opacity: chartOpacity }}>{content}</Animated.View>;
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: sf(17),
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: sf(13),
    lineHeight: sf(18),
    marginBottom: 12,
  },
  chartWrap: {
    position: 'relative',
    overflow: 'visible',
    paddingHorizontal: 4,
  },
  dotHit: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  xLabelsRow: {
    position: 'relative',
    marginTop: 2,
  },
  xLabel: {
    position: 'absolute',
    fontSize: sf(10),
    fontWeight: '500',
  },
  infoStrip: {
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoStripText: {
    flex: 1,
    minWidth: 0,
  },
  infoStripTitle: {
    fontSize: sf(15),
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  infoStripBody: {
    fontSize: sf(14),
    lineHeight: sf(20),
  },
  infoStripHighlight: {
    fontSize: sf(14),
    fontWeight: '700',
    lineHeight: sf(20),
  },
  stripButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    minHeight: 0,
  },
});
