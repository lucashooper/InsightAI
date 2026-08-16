import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '../../contexts/LanguageContext';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import { ONBOARDING_TEXT } from '../../constants/onboardingTheme';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';

const PATTERNS = [
  { emoji: '😴', textKey: 'adjustSleep', frequency: 8 },
  { emoji: '🧘', textKey: 'selfCompassion', frequency: 6 },
  { emoji: '📵', textKey: 'reduceScreenTime', frequency: 5 },
  { emoji: '🍃', textKey: 'manageStress', frequency: 4 },
  { emoji: '🗣️', textKey: 'setBoundaries', frequency: 3 },
  { emoji: '💭', textKey: 'challengeSelfTalk', frequency: 2 },
];

export default function ValuePropPatternsScreen({ navigation }: any) {
  const { t } = useLanguage();

  const pillAnims = useRef(PATTERNS.map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(16),
  }))).current;
  const footerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pillAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(120 + i * 140),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(anim.translateY, { toValue: 0, duration: 320, useNativeDriver: true }),
        ]),
      ]).start();
    });

    Animated.sequence([
      Animated.delay(160 + PATTERNS.length * 140 + 80),
      Animated.timing(footerFade, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <OnboardingAmbientBackground />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backArrowCircle}>
          <Ionicons name="arrow-back" size={20} color={ONBOARDING_TEXT.primary} />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View>
          <Text style={styles.eyebrow}>{t('onboarding.patterns.eyebrow')}</Text>
          <Text style={styles.title}>{t('onboarding.patterns.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.patterns.subtitle')}</Text>
        </View>

        {/* Pattern Pills */}
        <View style={styles.pillsContainer}>
          {PATTERNS.map((item, i) => (
            <Animated.View
              key={i}
              style={[
                styles.pill,
                {
                  backgroundColor: 'rgba(255,255,255,0.75)',
                  borderColor: i === 0 ? 'rgba(123, 94, 167, 0.4)' : 'rgba(0,0,0,0.07)',
                  opacity: pillAnims[i].opacity,
                  transform: [{ translateY: pillAnims[i].translateY }],
                },
              ]}
            >
              <View style={styles.frequencyBadge}>
                <Text style={styles.frequencyText}>{t('onboarding.patterns.frequency', { count: item.frequency })}</Text>
              </View>
              <Text style={styles.pillEmoji}>{item.emoji}</Text>
              <Text style={styles.pillText}>{t(`onboarding.patterns.${item.textKey}`)}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Footer */}
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
            navigation.navigate('ValuePropWins');
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
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: isTablet ? 120 : 110,
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
    marginBottom: isTablet ? 48 : 36,
    color: ONBOARDING_TEXT.body,
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
  },
  frequencyBadge: {
    backgroundColor: 'rgba(123, 94, 167, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(123, 94, 167, 0.3)',
    marginRight: 'auto',
  },
  frequencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7B5EA7',
    letterSpacing: 0.3,
  },
  pillEmoji: {
    fontSize: 22,
    marginLeft: 12,
  },
  pillText: {
    fontSize: sf(15),
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
    color: ONBOARDING_TEXT.primary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: isTablet ? 70 : 50,
  },
});
