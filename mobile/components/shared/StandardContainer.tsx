import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import GlassSurface, { GlassVariant } from './GlassSurface';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';
import { PREMIUM } from '../../constants/premiumUI';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'nested' | 'hero';
  tint?: 'violet' | 'coral' | 'aqua' | 'gold';
  /** @deprecated — coloured outline halos removed */
  ambient?: string;
};

const TINT_WASH = {
  violet: 'rgba(139, 92, 246, 0.06)',
  coral: 'rgba(244, 122, 104, 0.05)',
  aqua: 'rgba(53, 185, 173, 0.05)',
  gold: 'rgba(241, 177, 91, 0.05)',
} as const;

/**
 * Card shell for screens that still import StandardContainer.
 * Dark mode → GlassSurface. Light mode keeps a simple frosted panel.
 */
export default function StandardContainer({
  children,
  style,
  variant = 'default',
  tint,
}: Props) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);

  const flat = StyleSheet.flatten(style) || {};
  const {
    backgroundColor: _bg,
    borderColor: _bc,
    borderWidth: _bw,
    flexDirection,
    alignItems,
    justifyContent,
    padding,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingHorizontal,
    paddingVertical,
    ...rest
  } = flat as ViewStyle & Record<string, unknown>;

  const contentPad = {
    padding: padding ?? PREMIUM.layout.cardPad,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingHorizontal,
    paddingVertical,
  };

  const glassVariant: GlassVariant =
    variant === 'hero' ? 'elevated' : variant === 'nested' ? 'overlay' : 'surface';

  if (dark) {
    return (
      <GlassSurface
        style={rest as StyleProp<ViewStyle>}
        variant={glassVariant}
        wash={tint ? TINT_WASH[tint] : undefined}
        noPad
        contentStyle={[
          contentPad,
          flexDirection ? { flexDirection, alignItems, justifyContent } : null,
        ]}
      >
        {children}
      </GlassSurface>
    );
  }

  // Light theme fallback
  return (
    <View
      style={[
        styles.lightShell,
        rest as ViewStyle,
        { borderRadius: PREMIUM.radius.card },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.86)' }]} />
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View
        style={[
          contentPad,
          flexDirection ? { flexDirection, alignItems, justifyContent } : null,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lightShell: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(122, 86, 160, 0.12)',
    backgroundColor: 'transparent',
  },
});
