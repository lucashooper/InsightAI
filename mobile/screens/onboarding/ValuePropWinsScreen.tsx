import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../../contexts/LanguageContext';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import { ONBOARDING_LIGHT, ONBOARDING_TEXT } from '../../constants/onboardingTheme';
import { ONBOARDING_LAYOUT } from '../../constants/onboardingLayout';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';

const WINS = [
  { emoji: '🏋️', textKey: 'gym' },
  { emoji: '📚', textKey: 'reading' },
  { emoji: '🤝', textKey: 'openingUp' },
  { emoji: '🧠', textKey: 'calm' },
  { emoji: '🌅', textKey: 'morningRoutine' },
  { emoji: '💪', textKey: 'perseverance' },
];

export default function ValuePropWinsScreen({ navigation }: any) {
  const { t } = useLanguage();

  const pillAnims = useRef(WINS.map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(16),
  }))).current;
  const footerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    WINS.forEach((_, i) => {
      Animated.sequence([
        Animated.delay(120 + i * 140),
        Animated.parallel([
          Animated.timing(pillAnims[i].opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(pillAnims[i].translateY, { toValue: 0, duration: 320, useNativeDriver: true }),
        ]),
      ]).start();
    });

    Animated.sequence([
      Animated.delay(160 + WINS.length * 140 + 80),
      Animated.timing(footerFade, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <OnboardingAmbientBackground />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={[styles.backArrowCircle, { backgroundColor: ONBOARDING_LIGHT.backCircleBg, borderColor: ONBOARDING_LIGHT.backCircleBorder, borderWidth: 1 }]}>
          <Ionicons name="arrow-back" size={ONBOARDING_LAYOUT.backIconSize} color={ONBOARDING_LIGHT.backIcon} />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View>
          <Text style={styles.eyebrow}>{t('onboarding.wins.eyebrow')}</Text>
          <Text style={styles.title}>{t('onboarding.wins.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.wins.subtitle')}</Text>
        </View>

        <View style={styles.pillsContainer}>
          {WINS.map((item, i) => (
            <Animated.View
              key={i}
              style={[
                styles.pill,
                {
                  opacity: pillAnims[i].opacity,
                  transform: [{ translateY: pillAnims[i].translateY }],
                },
              ]}
            >
              <Text style={styles.pillEmoji}>{item.emoji}</Text>
              <Text style={styles.pillText}>{t(`onboarding.wins.${item.textKey}`)}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View style={[styles.footer, {
        opacity: footerFade,
        transform: [{
          translateY: footerFade.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          }),
        }],
      }, iPadContentStyle as any]}>
        <OnboardingButton
          label={t('common.continue')}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('NotificationsOnboarding');
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    flex: 1,
    paddingHorizontal: ONBOARDING_LAYOUT.contentHorizontal,
    paddingTop: ONBOARDING_LAYOUT.contentTop,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: sf(13),
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    color: ONBOARDING_TEXT.secondary,
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    letterSpacing: -1.28,
    lineHeight: sf(40),
    marginBottom: 14,
    color: ONBOARDING_TEXT.primary,
  },
  subtitle: {
    fontSize: sf(16),
    lineHeight: sf(23),
    marginBottom: ONBOARDING_LAYOUT.subtitleGap,
    color: ONBOARDING_TEXT.secondary,
  },
  pillsContainer: {
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    backgroundColor: 'rgba(52,211,153,0.10)',
    borderColor: 'rgba(52,211,153,0.25)',
  },
  pillEmoji: {
    fontSize: isTablet ? 28 : 22,
  },
  pillText: {
    fontSize: sf(15),
    fontWeight: '500',
    color: ONBOARDING_TEXT.primary,
  },
  footer: {
    paddingHorizontal: ONBOARDING_LAYOUT.contentHorizontal,
    paddingBottom: ONBOARDING_LAYOUT.footerBottom,
  },
});
