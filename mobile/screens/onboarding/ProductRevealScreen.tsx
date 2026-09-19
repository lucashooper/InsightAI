import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { isTablet, sf, screenPadding, iPadContentStyle } from '../../utils/responsive';
import LanguagePicker from '../../components/LanguagePicker';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOnboardingBottomInset, useOnboardingTopInset } from '../../utils/onboardingInsets';
import { INK, TYPO } from '../../constants/typography';
import PillButton from '../../components/ui/PillButton';
import PressableScale from '../../components/ui/PressableScale';
import StaggerIn from '../../components/shared/StaggerIn';
import CloudMascot from '../../components/companion/CloudMascot';

const LANDSCAPE = require('../../assets/generated/onboarding-landscape.png');

/**
 * Welcome — pastel landscape, live companion in the sky, one headline,
 * charcoal CTA. Screen-to-screen motion is owned by the stack (slide).
 */
export default function ProductRevealScreen({ navigation }: any) {
  const { t } = useLanguage();
  const bottomInset = useOnboardingBottomInset();
  const topInset = useOnboardingTopInset();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Image
        source={LANDSCAPE}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="bottom"
        cachePolicy="memory-disk"
        transition={200}
        accessibilityIgnoresInvertColors
      />
      {/* Soft lift behind the CTA block so type stays crisp over the hills */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0.7)']}
        locations={[0, 0.55, 1]}
        style={styles.bottomLift}
      />

      <View style={[styles.languageAnchor, { top: topInset + (isTablet ? 16 : 10) }]}>
        <LanguagePicker variant="pill" size="large" />
      </View>

      <StaggerIn delay={40} style={[styles.brand, { paddingTop: topInset + (isTablet ? 30 : 22) }]}>
        <CloudMascot size={isTablet ? 96 : 82} valence={0.88} animated shadow />
        <Text style={styles.tagline}>{t('onboarding.heroTagline')}</Text>
      </StaggerIn>

      {/* Headline sits over the horizon glow */}
      <View style={styles.hero} pointerEvents="none">
        <StaggerIn delay={180}>
          <Text style={styles.headline} allowFontScaling={false}>
            {t('onboarding.heroHeadline')}
          </Text>
        </StaggerIn>
      </View>

      {/* CTA block */}
      <StaggerIn delay={300} style={[styles.bottomBlock, { paddingBottom: bottomInset + 6 }]}>
        <PillButton
          label={t('onboarding.getStarted')}
          block
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('MascotIntro');
          }}
        />
        <PressableScale
          onPress={() => navigation.navigate('Login')}
          style={styles.signInLink}
          haptic={false}
          scaleTo={0.98}
          accessibilityRole="button"
        >
          <Text style={styles.signInText}>{t('onboarding.alreadyHaveAccount')}</Text>
        </PressableScale>
        <Text style={styles.legal}>{t('onboarding.heroLegal')}</Text>
      </StaggerIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DDE6FA',
  },
  bottomLift: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '34%',
  },
  languageAnchor: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  brand: {
    alignItems: 'center',
  },
  tagline: {
    ...TYPO.title,
    color: INK.secondary,
    marginTop: -4,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    // Bias the headline toward the horizon glow rather than dead centre.
    paddingTop: '10%',
  },
  headline: {
    ...TYPO.displayLg,
    fontSize: sf(isTablet ? 84 : 68),
    lineHeight: sf(isTablet ? 86 : 70),
    letterSpacing: -3,
    textAlign: 'center',
    color: INK.primary,
  },
  bottomBlock: {
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    gap: 4,
    ...(iPadContentStyle as any),
  },
  signInLink: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  signInText: {
    ...TYPO.title,
    textAlign: 'center',
    color: INK.primary,
  },
  legal: {
    ...TYPO.caption,
    lineHeight: sf(17),
    textAlign: 'center',
    color: INK.tertiary,
    maxWidth: 300,
    marginTop: 4,
  },
});
