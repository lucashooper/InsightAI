import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import GlassSurface, { GlassVariant } from './GlassSurface';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** @deprecated — use variant="elevated" */
  strong?: boolean;
  /** Soft internal colour wash (not a border) */
  wash?: string;
  /** @deprecated — ignored; coloured outlines removed from the system */
  ambient?: string;
  /** @deprecated — ignored */
  tint?: string;
  noPad?: boolean;
  variant?: GlassVariant;
};

/**
 * Thin alias over GlassSurface for existing imports.
 * All glass goes through one material.
 */
export default function GlassCard({
  children,
  style,
  contentStyle,
  strong,
  wash,
  noPad,
  variant,
}: Props) {
  return (
    <GlassSurface
      style={style}
      contentStyle={contentStyle}
      variant={variant || (strong ? 'elevated' : 'surface')}
      wash={wash}
      noPad={noPad}
    >
      {children}
    </GlassSurface>
  );
}
