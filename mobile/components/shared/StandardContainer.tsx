import React from 'react';

import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { BlurView } from 'expo-blur';

import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';



type Props = {

  children: React.ReactNode;

  style?: StyleProp<ViewStyle>;

  variant?: 'default' | 'nested';

};



export default function StandardContainer({ children, style, variant = 'default' }: Props) {

  const { theme } = useTheme();

  const isThemeDark = isDarkTheme(theme.name);

  const isNested = variant === 'nested';



  const gradientColors = isNested

    ? (isThemeDark

      ? ['rgba(28, 28, 36, 0.55)', 'rgba(18, 18, 24, 0.50)'] as const

      : ['rgba(255, 255, 255, 0.55)', 'rgba(248, 248, 252, 0.48)'] as const)

    : (isThemeDark

      ? ['rgba(22, 22, 28, 0.72)', 'rgba(14, 14, 18, 0.68)'] as const

      : ['rgba(255, 255, 255, 0.82)', 'rgba(245, 245, 248, 0.78)'] as const);



  const borderColor = isNested

    ? (isThemeDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)')

    : (isThemeDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.07)');



  const highlightColor = isThemeDark

    ? 'rgba(255, 255, 255, 0.06)'

    : 'rgba(255, 255, 255, 0.65)';



  const flatStyle = StyleSheet.flatten(style) || {};
  const {
    backgroundColor: _ignored,
    flexDirection,
    alignItems,
    justifyContent,
    ...containerStyle
  } = flatStyle;

  return (
    <View style={[styles.container, isNested && styles.nested, { borderColor }, containerStyle]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={isNested ? (isThemeDark ? 22 : 28) : (isThemeDark ? 28 : 36)}
          tint={isThemeDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <LinearGradient colors={gradientColors as any} style={styles.gradient} />
      <View style={[styles.highlight, { backgroundColor: highlightColor }]} />
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

    borderRadius: 20,

    borderWidth: 1,

    overflow: 'hidden',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 14 },

    shadowOpacity: 0.28,

    shadowRadius: 24,

    elevation: 8,

  },

  nested: {

    borderRadius: 14,

    shadowOffset: { width: 0, height: 6 },

    shadowOpacity: 0.18,

    shadowRadius: 12,

    elevation: 4,

  },

  gradient: {

    ...StyleSheet.absoluteFillObject,

  },

  highlight: {

    position: 'absolute',

    top: 0,

    left: 16,

    right: 16,

    height: 1,

    borderRadius: 1,

  },

  content: {

    position: 'relative',

    width: '100%',

  },

});


