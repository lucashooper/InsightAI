import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import CachedImage from '../../components/shared/CachedImage';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import { INSIGHT_LOGO } from '../../constants/appAssets';
import { ONBOARDING_LIGHT, ONBOARDING_TEXT } from '../../constants/onboardingTheme';
import { ONBOARDING_LAYOUT } from '../../constants/onboardingLayout';
import { sf, ss, si, iPadContentStyle } from '../../utils/responsive';
import { useOnboardingBottomInset } from '../../utils/onboardingInsets';
import { useLanguage } from '../../contexts/LanguageContext';

const noisyImage = require('../../public/noisy-image.webp');
const clarityImage = require('../../public/clarity-image.webp');

export default function ValuePropScreen({ navigation }: any) {
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={[styles.backArrowCircle, { backgroundColor: ONBOARDING_LIGHT.backCircleBg, borderColor: ONBOARDING_LIGHT.backCircleBorder, borderWidth: 1 }]}>
            <Ionicons name="arrow-back" size={ONBOARDING_LAYOUT.backIconSize} color={ONBOARDING_LIGHT.backIcon} />
          </View>
        </TouchableOpacity>
      )}

      <CachedImage source={INSIGHT_LOGO} style={styles.logo} contentFit="contain" recyclingKey="value-prop-logo" />

      <View style={[styles.content, iPadContentStyle as any]}>
        <View style={styles.mainContent}>
          <Text style={[styles.headline, { color: ONBOARDING_TEXT.primary }]}>
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
              <Text style={[styles.contrastLabel, { color: ONBOARDING_TEXT.secondary }]}>{t('onboarding.valueProp.mentalNoise')}</Text>
            </Animated.View>

            <Animated.Text style={[
              styles.arrow,
              {
                color: 'rgba(0,0,0,0.2)',
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
              <Text style={[styles.contrastLabel, { color: ONBOARDING_TEXT.secondary }]}>{t('onboarding.valueProp.understanding')}</Text>
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
                <Text style={[styles.bulletText, { color: ONBOARDING_TEXT.body }]}>
                  {t('onboarding.valueProp.captureFeelings')}
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={[styles.bulletText, { color: ONBOARDING_TEXT.body }]}>
                  {t('onboarding.valueProp.understandPatterns')}
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={[styles.bulletText, { color: ONBOARDING_TEXT.body }]}>
                  {t('onboarding.valueProp.gainClarity')}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      <Animated.View
        style={[
          styles.footer,
          iPadContentStyle as any,
          { paddingBottom: Math.max(bottomInset, ONBOARDING_LAYOUT.footerBottom) },
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

const CONTRAST_IMAGE = ss(125);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backButton: {
    position: 'absolute',
    top: ONBOARDING_LAYOUT.backTop,
    left: ONBOARDING_LAYOUT.backLeft,
    zIndex: 10,
    padding: 4,
  },
  backArrowCircle: {
    width: ONBOARDING_LAYOUT.backSize,
    height: ONBOARDING_LAYOUT.backSize,
    borderRadius: ONBOARDING_LAYOUT.backRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: ONBOARDING_LAYOUT.logoSize,
    height: ONBOARDING_LAYOUT.logoSize,
    opacity: 0.9,
    position: 'absolute',
    top: ONBOARDING_LAYOUT.logoTop,
    alignSelf: 'center',
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: ONBOARDING_LAYOUT.contentHorizontal,
    paddingTop: ONBOARDING_LAYOUT.contentTop,
  },
  mainContent: {
    alignItems: 'center',
    width: '100%',
  },
  headline: {
    fontSize: sf(32),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: sf(40),
    letterSpacing: -0.6,
    marginBottom: ss(44),
    marginTop: ONBOARDING_LAYOUT.logoContentOffset,
  },
  contrastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ss(56),
    gap: ss(32),
  },
  contrastColumn: {
    alignItems: 'center',
    gap: ss(16),
  },
  imageContainer: {
    width: CONTRAST_IMAGE,
    height: CONTRAST_IMAGE,
    borderRadius: CONTRAST_IMAGE / 2,
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
    fontSize: sf(32),
    fontWeight: '300',
  },
  contrastLabel: {
    fontSize: sf(13),
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  bulletContainer: {
    gap: ss(16),
    alignItems: 'center',
    width: '100%',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ss(12),
  },
  bulletDot: {
    fontSize: sf(24),
    color: '#8b5cf6',
    fontWeight: '700',
  },
  bulletText: {
    fontSize: sf(16),
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  footer: {
    paddingHorizontal: ONBOARDING_LAYOUT.contentHorizontal,
    paddingTop: ONBOARDING_LAYOUT.footerTop,
  },
});
