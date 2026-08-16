import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

export type WellbeingTier = 'high' | 'mid' | 'low';

export function wellbeingTierFromScore(scoreOutOf100: number): WellbeingTier {
  if (scoreOutOf100 >= 67) return 'high';
  if (scoreOutOf100 >= 34) return 'mid';
  return 'low';
}

type Props = {
  tier: WellbeingTier;
  width?: number;
  height?: number;
};

/** Subtle premium SVG accents for the insights hero — tier-matched, never judgmental. */
export default function WellbeingIllustration({ tier, width = 96, height = 88 }: Props) {
  if (tier === 'high') {
    return (
      <Svg width={width} height={height} viewBox="0 0 96 88">
        <Circle cx="72" cy="22" r="14" fill="#FDE68A" opacity={0.95} />
        <Path d="M0 72 Q24 58 48 64 T96 56 V88 H0 Z" fill="#A7F3D0" opacity={0.55} />
        <Path d="M0 78 Q32 68 56 72 T96 66 V88 H0 Z" fill="#6EE7B7" opacity={0.45} />
        <Ellipse cx="58" cy="18" rx="18" ry="7" fill="#FFFFFF" opacity={0.7} />
      </Svg>
    );
  }

  if (tier === 'mid') {
    return (
      <Svg width={width} height={height} viewBox="0 0 96 88">
        <Circle cx="68" cy="24" r="11" fill="#E2E8F0" opacity={0.9} />
        <Ellipse cx="52" cy="20" rx="22" ry="8" fill="#FFFFFF" opacity={0.75} />
        <Ellipse cx="78" cy="28" rx="14" ry="6" fill="#F1F5F9" opacity={0.8} />
        <Path d="M0 70 Q28 62 52 66 T96 60 V88 H0 Z" fill="#CBD5E1" opacity={0.35} />
        <Path d="M0 76 Q36 70 60 74 T96 68 V88 H0 Z" fill="#94A3B8" opacity={0.25} />
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 96 88">
      <Rect x="0" y="0" width="96" height="88" fill="transparent" />
      <Ellipse cx="48" cy="18" rx="30" ry="10" fill="#94A3B8" opacity={0.35} />
      <Path
        d="M22 8 L24 28 M30 4 L32 24 M38 10 L40 30"
        stroke="#94A3B8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.45}
      />
      <Path d="M0 74 Q24 66 48 70 T96 64 V88 H0 Z" fill="#64748B" opacity={0.22} />
      <Path d="M0 80 Q32 74 56 78 T96 72 V88 H0 Z" fill="#475569" opacity={0.18} />
      <Circle cx="72" cy="52" r="3" fill="#94A3B8" opacity={0.5} />
      <Circle cx="80" cy="60" r="2.5" fill="#94A3B8" opacity={0.4} />
    </Svg>
  );
}
