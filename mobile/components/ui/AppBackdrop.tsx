import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { PREMIUM } from '../../constants/premiumUI';
import { HOME_PAGE_GRADIENT } from '../../constants/appAssets';
import { isDarkTheme, useTheme } from '../../contexts/ThemeContext';

/**
 * Shared environmental backdrop for every glass-card screen.
 * Preloaded in App.tsx before the navigator renders.
 */
export default function AppBackdrop() {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);

  return (
    <View pointerEvents="none" style={styles.root}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: dark ? PREMIUM.bg : '#F5F3F8' },
        ]}
      />
      <Image
        source={HOME_PAGE_GRADIENT}
        style={styles.image}
        resizeMode="cover"
        fadeDuration={0}
      />
      {dark ? <View style={styles.darkOverlay} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
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
});
