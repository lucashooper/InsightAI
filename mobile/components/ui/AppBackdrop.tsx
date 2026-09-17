import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PREMIUM } from '../../constants/premiumUI';
import { HOME_PAGE_GRADIENT } from '../../constants/appAssets';
import { isDarkTheme, useTheme } from '../../contexts/ThemeContext';

const LIGHT_BG = '#F5F3F8';

/**
 * Shared environmental backdrop for every glass-card screen.
 * Preloaded in App.tsx before the navigator renders.
 *
 * The gradient PNG has a transparent alpha edge that lands roughly at tab-bar
 * height on tall phones. Earlier builds masked it with a solid fade into the
 * base colour, but on light mode that fade itself rendered as a grey slab
 * above the floating tab bar. Instead the image is oversized so its edge
 * sits below the viewport, and a barely-there tint keeps the bottom of the
 * screen calm behind the bar without introducing a visible band.
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
        contentPosition="top"
        cachePolicy="memory-disk"
        transition={0}
        recyclingKey="home-page-gradient"
      />
      {dark ? <View style={styles.darkOverlay} /> : null}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.10)']}
        locations={[0, 1]}
        style={styles.softenBottom}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Oversize so the PNG's alpha edge falls below the screen.
    height: '118%',
    width: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 9, 11, 0.52)',
  },
  softenBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '18%',
  },
});
