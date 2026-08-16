import React from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { PREMIUM } from '../../constants/premiumUI';
import { androidGlassCardBackground } from '../../constants/androidGlass';
import { isDarkTheme, useTheme } from '../../contexts/ThemeContext';

export type GlassVariant =
  | 'surface'
  | 'elevated'
  | 'overlay'
  | 'hero'
  | 'nested';
export type GlassTint = 'violet' | 'coral' | 'aqua' | 'gold';

type Props = Omit<ViewProps, 'style'> & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  variant?: GlassVariant;
  tint?: GlassTint;
  wash?: string;
  noPad?: boolean;
  /** @deprecated Use variant="elevated". */
  strong?: boolean;
};

const TINT_WASH: Record<GlassTint, string> = {
  violet: 'rgba(139, 92, 246, 0.06)',
  coral: 'rgba(244, 122, 104, 0.05)',
  aqua: 'rgba(53, 185, 173, 0.05)',
  gold: 'rgba(241, 177, 91, 0.05)',
};

/**
 * The sole card material for Home, Journal, Playbook, and Dashboard.
 * Do not override its fill, border, radius, blur, or shadow per screen.
 */
export default function GlassCard({
  children,
  style,
  contentStyle,
  variant = 'surface',
  tint,
  wash,
  noPad = false,
  strong,
  ...viewProps
}: Props) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);
  const resolvedVariant =
    strong || variant === 'hero'
      ? 'elevated'
      : variant === 'nested'
        ? 'overlay'
        : variant;
  const resolvedWash = wash ?? (tint ? TINT_WASH[tint] : undefined);
  const darkFill =
    resolvedVariant === 'elevated'
      ? PREMIUM.glass.fillElevated
      : resolvedVariant === 'overlay'
        ? PREMIUM.glass.fillOverlay
        : PREMIUM.glass.fill;
  const fillColor = dark ? darkFill : PREMIUM.lightGlass.fill;
  const isAndroid = Platform.OS === 'android';

  return (
    <View
      {...viewProps}
      style={[
        style,
        dark ? styles.darkShell : styles.lightShell,
        isAndroid && styles.androidShell,
        isAndroid && { backgroundColor: androidGlassCardBackground(dark) },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <>
          <BlurView
            intensity={dark ? PREMIUM.glass.blur : PREMIUM.lightGlass.blur}
            tint={dark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: fillColor }]}
          />
        </>
      ) : null}

      {dark && resolvedWash ? (
        <LinearGradient
          pointerEvents="none"
          colors={[resolvedWash, 'transparent']}
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
  lightShell: {
    borderRadius: PREMIUM.radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PREMIUM.lightGlass.border,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: PREMIUM.lightGlass.shadowOpacity,
    shadowRadius: 16,
    elevation: 3,
  },
  darkShell: {
    borderRadius: PREMIUM.radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PREMIUM.glass.border,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: PREMIUM.glass.shadowOpacity,
    shadowRadius: 16,
    elevation: 6,
  },
  androidShell: {
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  pad: {
    padding: PREMIUM.layout.cardPad,
  },
});
