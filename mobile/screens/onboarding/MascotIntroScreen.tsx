import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import CloudMascot from '../../components/companion/CloudMascot';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';
import { useOnboardingBottomInset } from '../../utils/onboardingInsets';
import { ONBOARDING_TEXT, ONBOARDING_BRAND } from '../../constants/onboardingTheme';

export default function MascotIntroScreen({ navigation }: any) {
  const { t } = useLanguage();
  const bottomInset = useOnboardingBottomInset();

  return (
    <View style={styles.container}>
      <OnboardingAmbientBackground />
      <StatusBar barStyle="dark-content" />

      <View style={[styles.body, iPadContentStyle as any]}>
        <View style={styles.copyBlock}>
          <Text style={styles.greeting}>{t('onboarding.mascotIntro.greeting')}</Text>
          <Text style={styles.headline}>{t('onboarding.mascotIntro.headline')}</Text>
          <Text style={styles.subline}>{t('onboarding.mascotIntro.subline')}</Text>
        </View>

        <View style={styles.mascotStage}>
          <CloudMascot
            size={isTablet ? 240 : 210}
            valence={0.9}
            animated
            shadow={false}
            glow={false}
          />
        </View>
      </View>

      <View style={[styles.footer, iPadContentStyle as any, { paddingBottom: bottomInset + 8 }]}>
        <OnboardingButton
          label={t('onboarding.mascotIntro.cta')}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('OnboardingQuestion');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: isTablet ? 72 : 64,
  },
  copyBlock: {
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  greeting: {
    fontSize: sf(34),
    fontWeight: '700',
    color: ONBOARDING_TEXT.primary,
    letterSpacing: -1.2,
    lineHeight: sf(40),
    marginBottom: 12,
  },
  headline: {
    fontSize: sf(22),
    fontWeight: '600',
    color: ONBOARDING_BRAND.purple,
    letterSpacing: -0.4,
    lineHeight: sf(30),
    marginBottom: 10,
  },
  subline: {
    fontSize: sf(17),
    fontWeight: '400',
    color: ONBOARDING_TEXT.body,
    lineHeight: sf(26),
    maxWidth: 340,
  },
  mascotStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isTablet ? 12 : 8,
    marginBottom: isTablet ? 24 : 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    width: '100%',
  },
});
