import React from 'react';

/**
 * App-root orb pre-mount.
 *
 * The companion is now the SVG `CloudMascot`, which needs no WebGL warm-up, so
 * this is intentionally a no-op. It stays mounted in App.tsx so the WebGL orb
 * can be re-enabled by restoring the previous implementation without touching
 * the provider tree.
 */
export default function OrbPreloader() {
  return null;
}
