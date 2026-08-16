import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import GlassCard, { GlassVariant } from '../ui/GlassCard';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'nested' | 'hero' | 'recap';
  tint?: 'violet' | 'coral' | 'aqua' | 'gold';
  /** @deprecated */
  ambient?: string;
};

const TINT_WASH = {
  violet: 'rgba(139, 92, 246, 0.06)',
  coral: 'rgba(244, 122, 104, 0.05)',
  aqua: 'rgba(53, 185, 173, 0.05)',
  gold: 'rgba(241, 177, 91, 0.05)',
} as const;

/** @deprecated Prefer GlassCard directly — thin variant wrapper. */
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
    padding: padding ?? undefined,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingHorizontal,
    paddingVertical,
  };

  const glassVariant: GlassVariant =
    variant === 'recap'
      ? 'recap'
      : variant === 'hero'
        ? 'elevated'
        : variant === 'nested'
          ? 'overlay'
          : 'surface';

  return (
    <GlassCard
      style={rest as StyleProp<ViewStyle>}
      variant={glassVariant}
      wash={dark && tint ? TINT_WASH[tint] : undefined}
      noPad
      contentStyle={[
        contentPad,
        flexDirection ? { flexDirection, alignItems, justifyContent } : null,
      ]}
    >
      {children}
    </GlassCard>
  );
}
