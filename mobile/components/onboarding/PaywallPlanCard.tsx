import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  selected?: boolean;
  onPress: () => void;
  children: ReactNode;
  badge?: ReactNode;
  style?: StyleProp<ViewStyle>;
  light?: boolean;
};

/** Frosted glass plan card — badge overlaps top edge, glass clipped inside. */
export default function PaywallPlanCard({
  selected,
  onPress,
  children,
  badge,
  style,
  light = true,
}: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[styles.touchable, selected && styles.touchableSelected]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={light ? 32 : 24}
            tint={light ? 'light' : 'dark'}
            style={styles.blur}
          />
        ) : null}
        <LinearGradient
          colors={
            light
              ? selected
                ? ['rgba(255,255,255,0.82)', 'rgba(243,232,255,0.72)']
                : ['rgba(255,255,255,0.74)', 'rgba(249,242,255,0.64)']
              : selected
                ? ['rgba(139,92,246,0.22)', 'rgba(30,30,40,0.88)']
                : ['rgba(30,30,40,0.82)', 'rgba(20,20,28,0.9)']
          }
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          style={styles.fill}
        />
        <LinearGradient
          colors={
            light
              ? ['rgba(255,255,255,0.88)', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']
              : ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0.75, y: 0.85 }}
          style={styles.fill}
          pointerEvents="none"
        />
        {selected ? (
          <LinearGradient
            colors={
              light
                ? ['rgba(160,108,255,0.16)', 'rgba(160,108,255,0.04)', 'rgba(255,255,255,0)']
                : ['rgba(139,92,246,0.18)', 'rgba(139,92,246,0.05)', 'rgba(0,0,0,0)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fill}
            pointerEvents="none"
          />
        ) : null}
        <View style={styles.content}>{children}</View>
      </TouchableOpacity>
      {badge ? (
        <View style={styles.badgeOverlay} pointerEvents="none">
          {badge}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'visible',
  },
  touchable: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 86, 160, 0.12)',
    overflow: 'hidden',
    minHeight: 88,
    shadowColor: '#8f6aa8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  touchableSelected: {
    borderColor: '#8b5cf6',
    borderWidth: 2,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeOverlay: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
});
