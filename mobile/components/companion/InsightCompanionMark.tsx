import React from 'react';
import AuroraOrb from '../shared/AuroraOrb';

type Props = {
  size?: number;
  isDark?: boolean;
};

/** Small companion avatar — clipped AuroraOrb matching the home-screen orb palette. */
export default function InsightCompanionMark({ size = 64, isDark = true }: Props) {
  return (
    <AuroraOrb
      size={size}
      isDark={isDark}
      clipToCircle
      compact
      vivid
    />
  );
}
