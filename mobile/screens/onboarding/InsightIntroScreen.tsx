import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { OrbSlot } from '../../components/companion/OrbOverlayProvider';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import { ONBOARDING_GRADIENT } from '../../constants/onboardingTheme';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { computePersonality } from '../../utils/onboardingPersonality';
import { useLanguage } from '../../contexts/LanguageContext';
import { sf } from '../../utils/responsive';
import { useOnboardingBottomInset } from '../../utils/onboardingInsets';

const ORB_SIZE = 220;
const CHAR_DELAY = 40;
const SUBTEXT_DELAY = 600;
const BUTTON_DELAY = 1000;

function useTypewriter(
  text: string,
  active: boolean,
  onComplete?: () => void,
  withHaptics = false,
) {
  const [display, setDisplay] = useState('');
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  React.useEffect(() => {
    if (!active) {
      setDisplay('');
      doneRef.current = false;
      return;
    }

    let i = 0;
    setDisplay('');
    doneRef.current = false;

    const timer = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (withHaptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (i >= text.length) {
        clearInterval(timer);
        if (!doneRef.current) {
          doneRef.current = true;
          if (withHaptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          onCompleteRef.current?.();
        }
      }
    }, CHAR_DELAY);

    return () => clearInterval(timer);
  }, [text, active, withHaptics]);

  return display;
}

function lineThreeForPattern(primaryKey: string): string {
  if (primaryKey === 'anxiety') {
    return "You carry a lot. Let's start unpacking it.";
  }
  if (primaryKey === 'selfCompassion' || primaryKey === 'selfEsteem') {
    return "You're harder on yourself than you realise.";
  }
  if (primaryKey === 'boundaries') {
    return "Your patterns make sense. Let's explore them.";
  }
  return 'Your patterns are clearer than you think.';
}

export default function InsightIntroScreen({ navigation, route }: any) {
  const { t } = useLanguage();
  const { userName } = useOnboarding();
  const bottomInset = useOnboardingBottomInset();
  const answers = route?.params?.answers || {};
  const skipPersonality = route?.params?.skipPersonality === true;

  const profile = useMemo(() => computePersonality(answers, t), [answers, t]);
  const firstName = (userName || answers.name || '').trim().split(/\s+/)[0] || 'there';

  const line1Full = `Hi ${firstName}.`;
  const subtextFull = skipPersonality
    ? 'Your patterns are clearer than you think.'
    : lineThreeForPattern(profile.primaryKey);

  const [showSubtext, setShowSubtext] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  const onLine1Complete = useCallback(() => {
    setTimeout(() => {
      setShowSubtext(true);
      setTimeout(() => {
        setShowButton(true);
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, BUTTON_DELAY);
    }, SUBTEXT_DELAY);
  }, [buttonOpacity]);

  const line1 = useTypewriter(line1Full, true, onLine1Complete, true);
  const subtext = useTypewriter(subtextFull, showSubtext, undefined, true);

  const onContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.replace('MiraOnboardingChat', {
      answers,
      skipPersonality,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[...ONBOARDING_GRADIENT]} style={StyleSheet.absoluteFill} />
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.line1}>{line1 || ' '}</Text>

          <View style={styles.orbWrap}>
            <OrbSlot size={ORB_SIZE} personality="default" />
          </View>

          <View style={styles.subtextWrap}>
            {showSubtext ? (
              <Text style={styles.subtext}>{subtext || ' '}</Text>
            ) : (
              <View style={styles.subtextPlaceholder} />
            )}
          </View>
        </View>

        {showButton ? (
          <Animated.View style={[styles.footer, { paddingBottom: bottomInset, opacity: buttonOpacity }]}>
            <OnboardingButton label="Let's talk" onPress={onContinue} />
          </Animated.View>
        ) : (
          <View style={{ height: bottomInset + 72 }} />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  line1: {
    fontSize: sf(38),
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 0,
    minHeight: sf(46),
  },
  orbWrap: {
    marginTop: 52,
    marginBottom: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtextWrap: {
    minHeight: sf(56),
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  subtextPlaceholder: {
    height: sf(56),
  },
  subtext: {
    fontSize: sf(20),
    fontWeight: '500',
    color: '#7B5EA7',
    textAlign: 'center',
    lineHeight: sf(28),
    paddingHorizontal: 32,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
