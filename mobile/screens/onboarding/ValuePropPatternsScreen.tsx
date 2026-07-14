import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SunoGradient from '../../components/onboarding/SunoGradient';
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
  const { theme } = useTheme();
  const { t } = useLanguage();
  const dark = isDarkTheme(theme.name);

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      {dark ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
      ) : (
        <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
      )}

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={[styles.backArrowCircle, { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <Ionicons name="arrow-back" size={20} color={dark ? '#fff' : '#1a1a2e'} />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View>
          <Text style={[styles.eyebrow, { color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }]}>
            {t('onboarding.patterns.eyebrow')}
          </Text>
          <Text style={[styles.title, { color: dark ? '#ffffff' : '#1a1a2e' }]}> 
            {t('onboarding.patterns.title')}
          </Text>
          <Text style={[styles.subtitle, { color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>
            {t('onboarding.patterns.subtitle')}
          </Text>
        </View>

        {/* Pattern Pills */}
        <View style={styles.pillsContainer}>
          {PATTERNS.map((item, i) => (
            <Animated.View
              key={i}
              style={[
                styles.pill,
                {
                  backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)',
                  borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)',
                  opacity: pillAnims[i].opacity,
                  transform: [{ translateY: pillAnims[i].translateY }],
                },
              ]}
            >
              <View style={styles.frequencyBadge}>
                <Text style={styles.frequencyText}>{t('onboarding.patterns.frequency', { count: item.frequency })}</Text>
              </View>
              <Text style={styles.pillEmoji}>{item.emoji}</Text>
              <Text style={[styles.pillText, { color: dark ? 'rgba(255,255,255,0.85)' : '#1a1a2e' }]}>
                {t(`onboarding.patterns.${item.textKey}`)}
              </Text>
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
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('ValuePropWins');
          }}
        >
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>{t('common.continue')}</Text>
          </View>
        </TouchableOpacity>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: isTablet ? 48 : 28,
    paddingTop: isTablet ? 120 : 110,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: sf(13),
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    letterSpacing: -0.6,
    lineHeight: sf(40),
    marginBottom: 14,
  },
  subtitle: {
    fontSize: sf(16),
    lineHeight: sf(23),
    marginBottom: isTablet ? 48 : 36,
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
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 'auto',
  },
  frequencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
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
  },
  footer: {
    paddingHorizontal: isTablet ? 48 : 28,
    paddingBottom: isTablet ? 70 : 50,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    borderRadius: 28,
  },
  buttonText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.2,
  },
});
