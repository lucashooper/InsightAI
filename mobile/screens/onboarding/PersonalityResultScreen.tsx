import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView, StatusBar } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { isTablet, sf } from '../../utils/responsive';

const { width } = Dimensions.get('window');

// ── Personality Dimensions (based on CBT / Schema Therapy research) ──
interface PersonalityProfile {
  primaryPattern: string;
  description: string;
  dimensions: {
    label: string;
    score: number; // 0-1
  }[];
}

// Map onboarding answers to personality dimensions
function computePersonality(answers: Record<string, string>): PersonalityProfile {
  // Dimensions based on Young's Schema Therapy (2003) & CBT irrational beliefs
  const dims = {
    perfectionism: 0.3,
    anxiety: 0.3,
    selfCompassion: 0.5,
    boundaries: 0.5,
    selfEsteem: 0.5,
  };

  // Goal-based scoring
  const goal = answers.goal || '';
  if (goal === 'stress') { dims.anxiety += 0.3; dims.selfCompassion -= 0.1; }
  if (goal === 'mood') { dims.selfEsteem -= 0.1; dims.anxiety += 0.15; }
  if (goal === 'habits') { dims.perfectionism += 0.2; dims.boundaries += 0.1; }
  if (goal === 'clarity') { dims.selfCompassion += 0.1; }

  // Wellbeing scoring
  const wellbeing = parseInt(answers.wellbeing || '7');
  if (wellbeing <= 4) {
    dims.anxiety += 0.25;
    dims.selfEsteem -= 0.2;
    dims.selfCompassion -= 0.15;
  } else if (wellbeing <= 6) {
    dims.anxiety += 0.1;
    dims.selfEsteem -= 0.05;
  } else if (wellbeing >= 8) {
    dims.selfCompassion += 0.15;
    dims.selfEsteem += 0.15;
    dims.boundaries += 0.1;
  }

  // Frequency scoring
  const freq = answers.frequency || '';
  if (freq === 'daily') { dims.perfectionism += 0.1; dims.selfCompassion += 0.1; }
  if (freq === 'as_needed') { dims.boundaries -= 0.1; }

  // Experience scoring
  const exp = answers.journalingExperience || '';
  if (exp === 'new') { dims.selfCompassion -= 0.05; }
  if (exp === '2+y') { dims.selfCompassion += 0.15; dims.selfEsteem += 0.1; }

  // Stress response (fight/flight/freeze / perfectionism patterns)
  const stressR = answers.stressResponse || '';
  if (stressR === 'ruminate') { dims.anxiety += 0.18; }
  if (stressR === 'self_blame') { dims.selfEsteem -= 0.12; dims.selfCompassion -= 0.12; }
  if (stressR === 'fixate') { dims.perfectionism += 0.2; dims.anxiety += 0.08; }
  if (stressR === 'step_back') { dims.boundaries += 0.12; dims.selfCompassion += 0.1; dims.anxiety -= 0.05; }

  // Inner voice / self-compassion (Neff-style self-compassion research)
  const talk = answers.selfTalk || '';
  if (talk === 'critical') { dims.selfCompassion -= 0.18; dims.selfEsteem -= 0.1; }
  if (talk === 'mixed') { dims.anxiety += 0.04; }
  if (talk === 'supportive') { dims.selfCompassion += 0.12; dims.selfEsteem += 0.1; dims.anxiety -= 0.06; }

  // Coping style
  const coping = answers.copingStyle || '';
  if (coping === 'social') { dims.boundaries += 0.08; dims.anxiety -= 0.04; }
  if (coping === 'physical') { dims.selfEsteem += 0.08; }
  if (coping === 'expressive') { dims.selfCompassion += 0.1; }
  if (coping === 'solitude') { dims.boundaries -= 0.06; }

  // Change response (resilience)
  const changeResp = answers.changeResponse || '';
  if (changeResp === 'resistant') { dims.anxiety += 0.12; dims.boundaries += 0.06; }
  if (changeResp === 'anxious_persevere') { dims.anxiety += 0.15; dims.perfectionism += 0.08; }
  if (changeResp === 'embrace') { dims.anxiety -= 0.1; dims.selfEsteem += 0.12; }
  if (changeResp === 'support_seeking') { dims.boundaries -= 0.08; }

  // Motivation driver
  const motivation = answers.motivationDriver || '';
  if (motivation === 'fear_based') { dims.anxiety += 0.2; dims.perfectionism += 0.12; }
  if (motivation === 'external') { dims.selfEsteem -= 0.08; }
  if (motivation === 'values_driven') { dims.selfCompassion += 0.12; dims.boundaries += 0.1; }
  if (motivation === 'passion') { dims.selfEsteem += 0.1; dims.anxiety -= 0.08; }

  // Optional deeper questions
  const relationship = answers.relationshipPatterns || '';
  if (relationship === 'anxious_attachment') { dims.anxiety += 0.15; dims.boundaries -= 0.1; }
  if (relationship === 'avoidant') { dims.boundaries += 0.12; dims.selfCompassion -= 0.08; }
  if (relationship === 'fearful_avoidant') { dims.anxiety += 0.12; dims.boundaries += 0.08; }
  if (relationship === 'secure') { dims.selfEsteem += 0.1; dims.anxiety -= 0.08; }

  const conflict = answers.conflictStyle || '';
  if (conflict === 'avoid') { dims.anxiety += 0.12; dims.boundaries -= 0.1; }
  if (conflict === 'accommodate') { dims.boundaries -= 0.15; dims.selfEsteem -= 0.08; }
  if (conflict === 'compete') { dims.boundaries += 0.08; dims.perfectionism += 0.1; }
  if (conflict === 'collaborate') { dims.selfCompassion += 0.1; dims.anxiety -= 0.06; }

  const rest = answers.restStyle || '';
  if (rest === 'guilt_rest') { dims.perfectionism += 0.15; dims.selfCompassion -= 0.12; }
  if (rest === 'solitude_rest') { dims.boundaries += 0.06; }
  if (rest === 'social_rest') { dims.boundaries -= 0.04; }
  if (rest === 'active_rest') { dims.selfEsteem += 0.06; }

  const identity = answers.identitySource || '';
  if (identity === 'achievement') { dims.perfectionism += 0.12; dims.selfEsteem -= 0.08; }
  if (identity === 'relationships') { dims.boundaries -= 0.08; }
  if (identity === 'values') { dims.selfCompassion += 0.1; dims.boundaries += 0.08; }
  if (identity === 'expression') { dims.selfEsteem += 0.08; }

  const failure = answers.failureResponse || '';
  if (failure === 'shame') { dims.selfEsteem -= 0.15; dims.selfCompassion -= 0.12; }
  if (failure === 'defensive') { dims.anxiety += 0.1; dims.boundaries += 0.06; }
  if (failure === 'analytical') { dims.perfectionism += 0.08; }
  if (failure === 'growth') { dims.selfEsteem += 0.12; dims.selfCompassion += 0.1; }

  const awareness = answers.emotionalAwareness || '';
  if (awareness === 'low_awareness') { dims.anxiety += 0.08; }
  if (awareness === 'moderate_awareness') { dims.selfCompassion += 0.04; }
  if (awareness === 'high_awareness') { dims.selfCompassion += 0.1; dims.selfEsteem += 0.06; }
  if (awareness === 'very_high_awareness') { dims.selfCompassion += 0.12; dims.anxiety -= 0.06; }

  const decision = answers.decisionMaking || '';
  if (decision === 'overthink') { dims.anxiety += 0.18; dims.perfectionism += 0.12; }
  if (decision === 'intuitive') { dims.boundaries += 0.06; }
  if (decision === 'external_validation') { dims.selfEsteem -= 0.1; dims.boundaries -= 0.08; }
  if (decision === 'systematic') { dims.perfectionism += 0.08; }

  // Clamp all values between 0.1 and 0.95
  const clamp = (v: number) => Math.min(0.95, Math.max(0.1, v));
  dims.perfectionism = clamp(dims.perfectionism);
  dims.anxiety = clamp(dims.anxiety);
  dims.selfCompassion = clamp(1 - dims.selfCompassion); // Invert: low self-compassion = high on chart
  dims.boundaries = clamp(1 - dims.boundaries); // Invert: weak boundaries = high on chart
  dims.selfEsteem = clamp(1 - dims.selfEsteem); // Invert: low self-esteem = high on chart

  // Determine primary pattern
  const scores = [
    { key: 'perfectionism', label: 'Perfectionism', score: dims.perfectionism },
    { key: 'anxiety', label: 'Anxiety', score: dims.anxiety },
    { key: 'selfCompassion', label: 'Lack of self-compassion', score: dims.selfCompassion },
    { key: 'boundaries', label: 'Lack of boundaries', score: dims.boundaries },
    { key: 'selfEsteem', label: 'Low self-esteem', score: dims.selfEsteem },
  ];

  const primary = scores.reduce((a, b) => a.score > b.score ? a : b);

  const DESCRIPTIONS: Record<string, string> = {
    perfectionism: 'Perfectionism is associated with chronic stress, procrastination, and burnout. It creates a cycle where nothing ever feels "good enough," keeping you in a constant state of tension.',
    anxiety: 'Anxiety patterns often stem from an overactive threat detection system. Your mind is trying to protect you, but it can become hypervigilant — scanning for problems even when you\'re safe.',
    selfCompassion: 'A lack of self-compassion means you hold yourself to standards you\'d never apply to others. Research shows self-compassion is more motivating than self-criticism.',
    boundaries: 'Difficulty setting boundaries often comes from a deep need to be liked or fear of conflict. This pattern can lead to resentment, exhaustion, and loss of identity.',
    selfEsteem: 'Low self-esteem affects how you interpret every interaction. It creates a filter where you discount positives and amplify negatives, reinforcing a distorted self-image.',
  };

  return {
    primaryPattern: primary.label,
    description: DESCRIPTIONS[primary.key] || DESCRIPTIONS.anxiety,
    dimensions: scores.map(s => ({ label: s.label, score: s.score })),
  };
}

// ── Radar Chart Component ─────────────────────────────────────
function RadarChart({ dimensions, dark }: { dimensions: { label: string; score: number }[]; dark: boolean }) {
  const chartSize = Math.min(width - 80, 300);
  const size = chartSize + 100; // Extra space for labels
  const center = size / 2;
  const radius = chartSize / 2 - 40;
  const n = dimensions.length;

  // Calculate points for each dimension
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * radius * value,
      y: center + Math.sin(angle) * radius * value,
    };
  };

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Data polygon points
  const dataPoints = dimensions.map((d, i) => getPoint(i, d.score));
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Grid polygon for each ring
  const gridColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const axisColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const labelColor = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const dotColor = '#f59e0b';

  return (
    <View style={{ alignItems: 'center', marginVertical: 16 }}>
      <Svg width={chartSize} height={chartSize} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {rings.map((r, ri) => {
          const pts = Array.from({ length: n }, (_, i) => getPoint(i, r));
          const poly = pts.map(p => `${p.x},${p.y}`).join(' ');
          return (
            <Polygon
              key={`ring-${ri}`}
              points={poly}
              fill="none"
              stroke={gridColor}
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const p = getPoint(i, 1);
          return (
            <Line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke={axisColor}
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={dataPolygon}
          fill="rgba(16, 185, 129, 0.25)"
          stroke="#10b981"
          strokeWidth={2}
        />

        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <Circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={dotColor}
            stroke="#fff"
            strokeWidth={1.5}
          />
        ))}

        {/* Center icon circle */}
        <Circle cx={center} cy={center} r={14} fill={dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'} />

        {/* Labels */}
        {dimensions.map((d, i) => {
          const labelPoint = getPoint(i, 1.55);
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          let anchor: 'start' | 'middle' | 'end' = 'middle';
          if (Math.cos(angle) > 0.3) anchor = 'start';
          if (Math.cos(angle) < -0.3) anchor = 'end';

          // Split long labels into multiple lines
          const words = d.label.split(' ');
          const lines: string[] = [];
          let currentLine = '';
          const maxCharsPerLine = 12;
          words.forEach(word => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (testLine.length > maxCharsPerLine && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          });
          if (currentLine) lines.push(currentLine);

          return lines.map((line, lineIdx) => (
            <SvgText
              key={`label-${i}-${lineIdx}`}
              x={labelPoint.x}
              y={labelPoint.y + (lineIdx * 16)}
              textAnchor={anchor}
              alignmentBaseline="middle"
              fontSize={12}
              fontWeight="500"
              fill={labelColor}
            >
              {line}
            </SvgText>
          ));
        })}
      </Svg>
    </View>
  );
}
// ── Main Screen ───────────────────────────────────────────────
export default function PersonalityResultScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);
  const answers = route?.params?.answers || {};
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const chartScale = useRef(new Animated.Value(0.8)).current;

  const profile = computePersonality(answers);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(chartScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkTheme(theme.name) ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent={false} />
            {isDarkTheme(theme.name) ? (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
            ) : (
                <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
            )}

      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('OnboardingSummary', { answers });
        }}
      >
        <Ionicons name="chevron-back" size={24} color={dark ? '#fff' : '#1a1a2e'} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header text */}
          <Text style={[styles.subtitle, { color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>
            Your primary pattern
          </Text>

          <Text style={[styles.primaryPattern, { color: dark ? '#fff' : '#1a1a2e' }]}>
            {profile.primaryPattern}
          </Text>

          {/* Radar Chart */}
          <Animated.View style={{ transform: [{ scale: chartScale }] }}>
            <RadarChart dimensions={profile.dimensions} dark={dark} />
          </Animated.View>

          {/* Description */}
          <Text style={[styles.description, { color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
            {profile.description}
          </Text>

          {/* Insight note */}
          <View style={[styles.insightCard, {
            backgroundColor: dark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.06)',
            borderColor: dark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.12)',
          }]}>
            <Ionicons name="sparkles" size={18} color="#8b5cf6" style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={[styles.insightText, { color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
              We'll track how this evolves and help you work through it.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Continue button */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('OnboardingSummary', { answers });
          }}
        >
          <View style={styles.ctaGradient}>
            <Text style={styles.ctaText}>Continue</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: isTablet ? 60 : 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isTablet ? 48 : 28,
    paddingTop: isTablet ? 110 : 100,
    paddingBottom: 120,
  },
  subtitle: {
    fontSize: sf(16),
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: sf(22),
    marginBottom: 12,
  },
  primaryPattern: {
    fontSize: sf(32),
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  description: {
    fontSize: sf(16),
    lineHeight: sf(24),
    textAlign: 'left',
    marginTop: 8,
    marginBottom: 24,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  insightText: {
    flex: 1,
    fontSize: sf(14),
    lineHeight: sf(20),
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    borderRadius: 28,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.2,
  },
});
