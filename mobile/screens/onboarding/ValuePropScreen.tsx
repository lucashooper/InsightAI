import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

const noisyImage = require('../../public/noisy-image.webp');
const clarityImage = require('../../public/clarity-image.webp');
const insightLogo = require('../../public/Insight-Logo-nobg.webp');

const { width } = Dimensions.get('window');

export default function ValuePropScreen({ navigation }: any) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  const bullet1Anim = useRef(new Animated.Value(0)).current;
  const bullet2Anim = useRef(new Animated.Value(0)).current;
  const bullet3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(600),
      Animated.timing(bullet1Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.timing(bullet2Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.timing(bullet3Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isDarkTheme(theme.name) ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
      ) : (
        <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
      )}

      {/* Back Button - Circular style matching other onboarding pages */}
      {navigation.canGoBack() && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={[styles.backArrowCircle, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Ionicons name="arrow-back" size={20} color={isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e'} />
          </View>
        </TouchableOpacity>
      )}

      {/* Logo */}
      <Image source={insightLogo} style={styles.logo} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Headline */}
          <Text style={[styles.headline, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>
            Insight turns thoughts{' '}into clarity
          </Text>

          {/* Visual Contrast */}
          <View style={styles.contrastContainer}>
            <View style={styles.contrastColumn}>
              <View style={styles.imageContainer}>
                <Image 
                  source={noisyImage} 
                  style={styles.contrastImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[styles.contrastLabel, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }]}>Mental noise</Text>
            </View>

            <Text style={[styles.arrow, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}>→</Text>

            <View style={styles.contrastColumn}>
              <View style={styles.imageContainer}>
                <Image 
                  source={clarityImage} 
                  style={styles.contrastImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[styles.contrastLabel, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }]}>Understanding</Text>
            </View>
          </View>

          {/* Supporting text with staggered animations */}
          <View style={styles.bulletContainer}>
            <Animated.View style={{ opacity: bullet1Anim, transform: [{ translateY: bullet1Anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={[styles.bulletText, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.7)' : '#4a4a4a' }]}>
                  Capture how you feel
                </Text>
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: bullet2Anim, transform: [{ translateY: bullet2Anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={[styles.bulletText, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.7)' : '#4a4a4a' }]}>
                  Understand patterns over time
                </Text>
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: bullet3Anim, transform: [{ translateY: bullet3Anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={[styles.bulletText, styles.bulletTextPurple]}>
                  Gain clarity — not clutter
                </Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('RateUs');
          }}
        >
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>Continue</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7f2',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  backArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    opacity: 0.9,
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 80,
  },
  mainContent: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 44,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    lineHeight: 54,
    letterSpacing: -0.5,
    marginBottom: 56,
  },
  contrastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 64,
    gap: 32,
  },
  contrastColumn: {
    alignItems: 'center',
    gap: 16,
  },
  imageContainer: {
    width: 125,
    height: 125,
    borderRadius: 63,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  contrastImage: {
    width: '100%',
    height: '100%',
  },
  arrow: {
    fontSize: 32,
    color: 'rgba(0, 0, 0, 0.2)',
    fontWeight: '300',
  },
  contrastLabel: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.45)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  bulletContainer: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulletDot: {
    fontSize: 24,
    color: '#8b5cf6',
    fontWeight: '700',
  },
  bulletText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  bulletTextGrey: {
    color: '#4a4a4a',
  },
  bulletTextPurple: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 50,
    paddingTop: 16,
  },
  button: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    borderRadius: 28,
    gap: 10,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
