import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

type SkeletonBlockProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function SkeletonBlock({
  width = '100%',
  height = 16,
  borderRadius = 10,
  style,
}: SkeletonBlockProps) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;
  const dark = isDarkTheme(theme.name);
  const baseColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.75, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity,
        },
        style,
      ]}
    />
  );
}

type JournalListSkeletonProps = {
  count?: number;
};

export function JournalListSkeleton({ count = 4 }: JournalListSkeletonProps) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <SkeletonBlock width={72} height={14} borderRadius={6} />
          <SkeletonBlock width="92%" height={18} borderRadius={8} style={styles.gap} />
          <SkeletonBlock width="68%" height={14} borderRadius={8} />
        </View>
      ))}
    </View>
  );
}

type DashboardSkeletonProps = {
  style?: ViewStyle;
};

export function DashboardSkeleton({ style }: DashboardSkeletonProps) {
  return (
    <View style={[styles.dashboard, style]}>
      <SkeletonBlock width="100%" height={220} borderRadius={20} />
      <SkeletonBlock width="100%" height={140} borderRadius={20} style={styles.gapLg} />
      <SkeletonBlock width="100%" height={120} borderRadius={20} style={styles.gapLg} />
      <View style={styles.row}>
        <SkeletonBlock width="48%" height={88} borderRadius={16} />
        <SkeletonBlock width="48%" height={88} borderRadius={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  gap: {
    marginTop: 10,
  },
  gapLg: {
    marginTop: 16,
  },
  dashboard: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
