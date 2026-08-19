import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from './OnboardingAmbientBackground';
import OnboardingBackButton from './OnboardingBackButton';
import OnboardingButton from './OnboardingButton';
import { isTablet, iPadContentStyle } from '../../utils/responsive';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useOnboardingBottomInset } from '../../utils/onboardingInsets';

type Props = {
  step: 0 | 1;
  onContinue: () => void;
  children: React.ReactNode;
  ctaLabel?: string;
  showBack?: boolean;
  onBack?: () => void;
};

const TOTAL_STEPS = 2;

export default function PrePaywallLayout({
  step,
  onContinue,
  children,
  ctaLabel,
  showBack = true,
  onBack,
}: Props) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const bottomInset = useOnboardingBottomInset();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [step, fadeAnim, slideAnim]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onContinue();
  };

  return (
    <View style={styles.container}>
      <OnboardingAmbientBackground />
      <StatusBar barStyle="dark-content" />

      {showBack && onBack && (
        <OnboardingBackButton onPress={onBack} style={styles.backButton} />
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {children}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset }]}>
        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <View
              key={index}
              style={[styles.progressDot, step === index && styles.progressDotActive]}
            />
          ))}
        </View>

        <OnboardingButton label={ctaLabel ?? t('common.continue')} onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backButton: {
    top: isTablet ? 60 : 50,
    left: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: isTablet ? 108 : 96,
    paddingBottom: 24,
    justifyContent: 'center',
    ...(iPadContentStyle as object),
  },
  footer: {
    paddingHorizontal: 24,
    gap: 16,
    ...(iPadContentStyle as object),
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(123, 94, 167, 0.25)',
  },
  progressDotActive: {
    width: 22,
    backgroundColor: '#7B5EA7',
  },
});
