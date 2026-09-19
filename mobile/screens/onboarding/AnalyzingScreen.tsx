import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingBackButton from '../../components/onboarding/OnboardingBackButton';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOnboardingBottomInset } from '../../utils/onboardingInsets';
import { safeGoBack } from '../../utils/navigationSafety';
import { isTablet, sf } from '../../utils/responsive';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route?: any;
};

const TOTAL_DURATION = 11000;
const RING = isTablet ? 220 : 188;
const STROKE = 11;
const RADIUS = (RING - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AnalyzingScreen({ navigation, route }: Props) {
  const { userName } = useOnboarding();
  const { t } = useLanguage();
  const bottomInset = useOnboardingBottomInset();
  const [percentage, setPercentage] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const didAdvance = useRef(false);

  const advance = () => {
    if (didAdvance.current) return;
    didAdvance.current = true;
    analytics.trackOnboardingScreen('analyzing', 'completed', userName || undefined);
    navigation.navigate('InsightIntro', {
      answers: route?.params?.answers || {},
      skipPersonality: route?.params?.skipPersonality || false,
    });
  };

  useEffect(() => {
    analytics.trackOnboardingScreen('analyzing', 'viewed', userName || undefined);
    const listenerId = progressAnim.addListener(({ value }) => {
      setPercentage(Math.round(value));
    });

    Animated.timing(progressAnim, {
      toValue: 100,
      duration: TOTAL_DURATION,
      easing: Easing.bezier(0.1, 0.3, 0.25, 1),
      useNativeDriver: false,
    }).start(() => {
      setPercentage(100);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(advance, 520);
    });

    return () => {
      progressAnim.removeListener(listenerId);
    };
  }, []);

  const dashOffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={styles.container}>
      <OnboardingAmbientBackground />
      <OnboardingBackButton onPress={() => navigation.canGoBack() && safeGoBack(navigation)} />

      <View style={styles.content}>
        <View style={styles.ringWrap}>
          <Svg width={RING} height={RING}>
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={RADIUS}
              stroke="rgba(91, 141, 239, 0.18)"
              strokeWidth={STROKE}
              fill="none"
            />
            <AnimatedCircle
              cx={RING / 2}
              cy={RING / 2}
              r={RADIUS}
              stroke="#5B8DEF"
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          </Svg>
          <Text style={styles.percentage}>{percentage}%</Text>
        </View>
        <Text style={styles.headline}>{t('onboarding.analyzing.headline')}</Text>
      </View>

      <View style={[styles.privacy, { paddingBottom: bottomInset + 8 }]}>
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={16} color="#34C759" />
        </View>
        <Text style={styles.privacyTitle}>{t('onboarding.analyzing.privacy')}</Text>
        <Text style={styles.privacyHint}>{t('onboarding.analyzing.privacyHint')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  ringWrap: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  percentage: {
    position: 'absolute',
    fontSize: sf(34),
    fontWeight: '700',
    letterSpacing: -1,
    color: '#1a1a2e',
  },
  headline: {
    fontSize: sf(26),
    fontWeight: '700',
    letterSpacing: -0.8,
    textAlign: 'center',
    color: '#1a1a2e',
    lineHeight: sf(32),
  },
  privacy: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 8,
  },
  lockBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 199, 89, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  privacyTitle: {
    fontSize: sf(15),
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  privacyHint: {
    marginTop: 4,
    fontSize: sf(13),
    color: 'rgba(26, 26, 46, 0.55)',
    textAlign: 'center',
    lineHeight: sf(18),
  },
});
