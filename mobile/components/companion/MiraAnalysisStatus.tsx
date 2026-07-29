import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ANALYSIS_STATUS_LINES } from '../../constants/miraReveal';
import InsightCompanionMark from './InsightCompanionMark';
import { sf } from '../../utils/responsive';

type Props = {
  isDark: boolean;
  isRoast?: boolean;
  lines?: string[];
};

/**
 * Subtle rotating status while Mira builds a reveal card.
 * Tasteful — no flashy spinners.
 */
export default function MiraAnalysisStatus({
  isDark,
  isRoast = false,
  lines = ANALYSIS_STATUS_LINES,
}: Props) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulse]);

  useEffect(() => {
    if (lines.length <= 1) return;
    const id = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        setIndex((i) => (i + 1) % lines.length);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    }, 1100);
    return () => clearInterval(id);
  }, [lines, opacity]);

  const muted = isRoast
    ? 'rgba(252,165,165,0.85)'
    : isDark
      ? 'rgba(255,255,255,0.62)'
      : 'rgba(0,0,0,0.5)';

  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={lines[index]}
      accessibilityLiveRegion="polite"
    >
      <Animated.View style={{ opacity: pulse }}>
        <InsightCompanionMark size={26} isDark={isDark || isRoast} roast={isRoast} />
      </Animated.View>
      <Animated.View style={[styles.textWrap, { opacity }]}>
        <Text style={[styles.text, { color: muted }]}>{lines[index]}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  textWrap: {
    flex: 1,
  },
  text: {
    fontSize: sf(14),
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
