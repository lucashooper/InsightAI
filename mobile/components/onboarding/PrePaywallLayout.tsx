import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from './OnboardingAmbientBackground';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ONBOARDING_CTA } from '../../constants/onboardingTheme';
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
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <View style={styles.backArrowCircle}>
            <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
          </View>
        </TouchableOpacity>
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

        <TouchableOpacity style={styles.ctaButton} onPress={handleContinue} activeOpacity={0.9}>
          <Text style={styles.ctaText}>{ctaLabel ?? t('common.continue')}</Text>
        </TouchableOpacity>
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
    position: 'absolute',
    top: isTablet ? 60 : 50,
    left: 24,
    zIndex: 10,
    padding: 4,
  },
  backArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(200, 185, 255, 0.35)',
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
  ctaButton: {
    backgroundColor: ONBOARDING_CTA.background,
    borderRadius: ONBOARDING_CTA.borderRadius,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(123, 94, 167, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: ONBOARDING_CTA.text,
    letterSpacing: 0.2,
  },
});
