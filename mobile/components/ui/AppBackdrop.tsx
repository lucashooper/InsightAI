import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PREMIUM } from '../../constants/premiumUI';
import { HOME_PAGE_GRADIENT } from '../../constants/appAssets';
import { isDarkTheme, useTheme } from '../../contexts/ThemeContext';

const LIGHT_BG = '#F5F3F8';

/** Convert a #RRGGBB colour to rgba() with the given alpha. */
function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Shared environmental backdrop for every glass-card screen.
 * Preloaded in App.tsx before the navigator renders.
 *
 * The gradient PNG has a transparent alpha edge that lands roughly at tab-bar
 * height on tall phones, which left a visible navy/grey strip above the
 * floating tab bar. A bottom fade into the base colour removes that edge.
 */
export default function AppBackdrop() {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);
  const base = dark ? PREMIUM.bg : LIGHT_BG;

  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: base }]} />
      <ExpoImage
        source={HOME_PAGE_GRADIENT}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
        recyclingKey="home-page-gradient"
      />
      {dark ? <View style={styles.darkOverlay} /> : null}
      <LinearGradient
        pointerEvents="none"
        colors={[withAlpha(base, 0), withAlpha(base, 0.85), base]}
        locations={[0, 0.7, 1]}
        style={styles.bottomFade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.52)',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '28%',
  },
});
