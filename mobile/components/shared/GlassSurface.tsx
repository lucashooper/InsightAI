import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { PREMIUM } from '../../constants/premiumUI';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

export type GlassVariant = 'surface' | 'elevated' | 'overlay';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  variant?: GlassVariant;
  /**
   * Optional soft colour wash INSIDE the glass (never a coloured outline).
   * Keep very low opacity — atmosphere, not a border.
   */
  wash?: string;
  /** Skip default content padding (24) when parent manages spacing */
  noPad?: boolean;
};

const FILL_DARK: Record<GlassVariant, string> = {
  surface: PREMIUM.glass.fill,
  elevated: PREMIUM.glass.fillElevated,
  overlay: PREMIUM.glass.fillOverlay,
};

/**
 * Glass material — dark frosted glass, or light frosted panel.
 * Light theme must never inherit the dark charcoal fill.
 */
export default function GlassSurface({
  children,
  style,
  contentStyle,
  variant = 'surface',
  wash,
  noPad = false,
}: Props) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);

  if (!dark) {
    return (
      <View style={[styles.lightShell, style]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.88)' }]} />
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[!noPad && styles.pad, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.shell, PREMIUM.shadow.soft, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={PREMIUM.glass.blur}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: PREMIUM.glass.fillElevated }]}
        />
      )}

      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: FILL_DARK[variant] }]}
      />

      {wash ? (
        <LinearGradient
          pointerEvents="none"
          colors={[wash, 'transparent']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View style={[!noPad && styles.pad, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: PREMIUM.radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PREMIUM.glass.border,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  lightShell: {
    borderRadius: PREMIUM.radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(122, 86, 160, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  pad: {
    padding: PREMIUM.layout.cardPad,
  },
});
