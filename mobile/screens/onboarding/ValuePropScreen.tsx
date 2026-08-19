import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import OnboardingBackButton from '../../components/onboarding/OnboardingBackButton';
import CachedImage from '../../components/shared/CachedImage';
import { INSIGHT_LOGO } from '../../constants/appAssets';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { sf } from '../../utils/responsive';
import { useOnboardingBottomInset } from '../../utils/onboardingInsets';

const noisyImage = require('../../public/noisy-image.webp');
const clarityImage = require('../../public/clarity-image.webp');

export default function ValuePropScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const noisyAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const clarityAnim = useRef(new Animated.Value(0)).current;
  const bulletAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;
  const bottomInset = useOnboardingBottomInset();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(noisyAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(arrowAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(clarityAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(bulletAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(footerAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [arrowAnim, bulletAnim, clarityAnim, footerAnim, noisyAnim]);

  return (
    <View style={styles.container}>
      <OnboardingAmbientBackground />

      {navigation.canGoBack() && (
        <OnboardingBackButton onPress={() => navigation.goBack()} />
      )}

      {/* Logo */}
      <CachedImage source={INSIGHT_LOGO} style={styles.logo} contentFit="contain" recyclingKey="value-prop-logo" />

      <View style={styles.content}>
        <View style={styles.mainContent}>
          {/* Headline */}
          <Text style={[styles.headline, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>
            {t('onboarding.valueProp.title')}
          </Text>

          <View style={styles.contrastContainer}>
            <Animated.View style={[
              styles.contrastColumn,
              {
                opacity: noisyAnim,
                transform: [{
                  translateY: noisyAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                }],
              },
            ]}>
              <View style={styles.imageContainer}>
                <CachedImage
                  source={noisyImage}
                  style={styles.contrastImage}
                  contentFit="cover"
                  recyclingKey="value-prop-noisy"
                />
              </View>
              <Text style={[styles.contrastLabel, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }]}>{t('onboarding.valueProp.mentalNoise')}</Text>
            </Animated.View>

            <Animated.Text style={[
              styles.arrow,
              {
                color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                opacity: arrowAnim,
                transform: [{
                  scale: arrowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1],
                  }),
                }],
              },
            ]}>→</Animated.Text>

            <Animated.View style={[
              styles.contrastColumn,
              {
                opacity: clarityAnim,
                transform: [{
                  translateY: clarityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                }],
              },
            ]}>
              <View style={styles.imageContainer}>
                <CachedImage
                  source={clarityImage}
                  style={styles.contrastImage}
                  contentFit="cover"
                  recyclingKey="value-prop-clarity"
                />
              </View>
              <Text style={[styles.contrastLabel, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }]}>{t('onboarding.valueProp.understanding')}</Text>
            </Animated.View>
          </View>

          <Animated.View style={{
            width: '100%',
            opacity: bulletAnim,
            transform: [{
              translateY: bulletAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            }],
          }}>
          <View style={styles.bulletContainer}>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={[styles.bulletText, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.7)' : '#4a4a4a' }]}> 
                {t('onboarding.valueProp.captureFeelings')}
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={[styles.bulletText, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.7)' : '#4a4a4a' }]}>
                {t('onboarding.valueProp.understandPatterns')}
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={[styles.bulletText, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.7)' : '#4a4a4a' }]}>
                {t('onboarding.valueProp.gainClarity')}
              </Text>
            </View>
          </View>
          </Animated.View>
        </View>
      </View>

      {/* Continue Button */}
      <Animated.View
        style={[
          styles.footer,
          { paddingBottom: bottomInset },
          {
            opacity: footerAnim,
            transform: [{
              translateY: footerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            }],
          },
        ]}
      >
        <OnboardingButton
          label={t('common.continue')}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('ValuePropPatterns');
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  mainContent: {
    alignItems: 'center',
  },
  headline: {
    fontSize: sf(32),
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    lineHeight: sf(40),
    letterSpacing: -0.6,
    marginBottom: 44,
  },
  contrastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 56,
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
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
