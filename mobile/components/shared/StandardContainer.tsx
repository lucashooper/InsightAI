import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'nested' | 'hero';
  tint?: 'violet' | 'coral' | 'aqua' | 'gold';
};

const TINT_COLORS = {
  violet: '160, 108, 255',
  coral: '244, 122, 104',
  aqua: '53, 185, 173',
  gold: '241, 177, 91',
} as const;

export default function StandardContainer({ children, style, variant = 'default', tint }: Props) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);
  const isNested = variant === 'nested';
  const isHero = variant === 'hero';

  const gradientColors = isHero
    ? dark
      ? ['rgba(6, 6, 9, 0.90)', 'rgba(2, 2, 5, 0.94)']
      : ['rgba(244, 226, 255, 0.94)', 'rgba(255, 229, 224, 0.90)', 'rgba(229, 248, 246, 0.88)']
    : isNested
      ? dark
        ? ['rgba(6, 6, 9, 0.86)', 'rgba(2, 2, 5, 0.91)']
        : ['rgba(255, 255, 255, 0.74)', 'rgba(249, 242, 255, 0.64)']
      : dark
        ? ['rgba(14, 14, 22, 0.88)', 'rgba(9, 9, 15, 0.94)']
        : ['rgba(255, 255, 255, 0.86)', 'rgba(251, 248, 253, 0.76)'];

  const borderColor = isHero
    ? dark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(150, 100, 190, 0.16)'
    : isNested
      ? dark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(122, 86, 160, 0.10)'
      : dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(122, 86, 160, 0.13)';

  const flatStyle = StyleSheet.flatten(style) || {};
  const {
    backgroundColor: _ignored,
    flexDirection,
    alignItems,
    justifyContent,
    ...containerStyle
  } = flatStyle;

  const blurIntensity = isHero ? (dark ? 42 : 46) : isNested ? (dark ? 24 : 30) : (dark ? 34 : 40);
  const radius = typeof flatStyle.borderRadius === 'number' ? flatStyle.borderRadius : isNested ? 14 : 16;
  const materialLayerStyle = { borderRadius: radius, overflow: 'hidden' as const };
  const shadowStyle = isHero
    ? dark ? styles.heroShadowDark : styles.heroShadowLight
    : isNested ? styles.nestedShadow
    : dark ? styles.defaultShadowDark : styles.defaultShadowLight;

  return (
    <View
      style={[
        styles.container,
        isNested && styles.nested,
        isHero && styles.hero,
        shadowStyle,
        { borderColor },
        containerStyle,
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={blurIntensity}
          tint={dark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, materialLayerStyle]}
        />
      ) : null}
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={[styles.gradient, materialLayerStyle]}
      />
      <LinearGradient
        colors={
          dark
            ? ['rgba(255,255,255,0.045)', 'rgba(255,255,255,0.012)', 'rgba(255,255,255,0)']
            : ['rgba(255,255,255,0.88)', 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0.75, y: 0.8 }}
        style={[styles.innerLight, materialLayerStyle]}
        pointerEvents="none"
      />
      {tint && (
        <LinearGradient
          colors={
            dark
              ? [`rgba(${TINT_COLORS[tint]}, 0.035)`, `rgba(${TINT_COLORS[tint]}, 0.012)`, 'rgba(0,0,0,0)']
              : [`rgba(${TINT_COLORS[tint]}, 0.22)`, `rgba(${TINT_COLORS[tint]}, 0.07)`, 'rgba(255,255,255,0)']
          }
          locations={[0, 0.48, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          style={[styles.tintLight, materialLayerStyle]}
          pointerEvents="none"
        />
      )}
      {isHero && (
        <LinearGradient
          colors={
            dark
              ? ['rgba(180, 124, 255, 0.045)', 'rgba(255, 118, 105, 0.025)', 'rgba(53, 210, 190, 0.018)']
              : ['rgba(184, 120, 255, 0.22)', 'rgba(255, 137, 114, 0.15)', 'rgba(73, 201, 187, 0.10)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroLight, materialLayerStyle]}
          pointerEvents="none"
        />
      )}
      <View
        style={[
          styles.content,
          flexDirection ? { flexDirection, alignItems, justifyContent } : null,
        ]}
      >
        {children}
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
  },
  hero: {
    borderRadius: 16,
  },
  nested: {
    borderRadius: 14,
  },
  defaultShadowDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  defaultShadowLight: {
    shadowColor: '#8f6aa8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },
  nestedShadow: {
    shadowColor: '#09070d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.20,
    shadowRadius: 5,
    elevation: 4,
  },
  heroShadowDark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.42,
    shadowRadius: 8,
    elevation: 9,
  },
  heroShadowLight: {
    shadowColor: '#b266d4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 7,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  innerLight: {
    ...StyleSheet.absoluteFillObject,
  },
  heroLight: {
    ...StyleSheet.absoluteFillObject,
  },
  tintLight: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'relative',
    width: '100%',
  },
});