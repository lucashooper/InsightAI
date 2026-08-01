import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import OnboardingAmbientBackground from '../components/onboarding/OnboardingAmbientBackground';
import { onboardingAuthStyles as auth } from '../constants/onboardingAuthStyles';
import { supabase } from '../lib/supabase';

/**
 * After email OTP confirmation, route to MainTabs when onboarding was already
 * completed (post-paywall signup). Never bounce verified users back to the
 * name / quiz screens.
 */
export default function EmailVerifiedScreen({ navigation }: any) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setIsReady(true);
    } else if (!loading && !user) {
      const timeout = setTimeout(() => {
        if (!user) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [user, loading, navigation]);

  const shouldEnterApp = async (): Promise<boolean> => {
    const [hasCompleted, needsEmailSignup, resumeScreen] = await Promise.all([
      AsyncStorage.getItem('HAS_COMPLETED_ONBOARDING'),
      AsyncStorage.getItem('NEEDS_EMAIL_SIGNUP'),
      AsyncStorage.getItem('ONBOARDING_RESUME_SCREEN'),
    ]);

    if (hasCompleted === 'true') return true;
    if (needsEmailSignup === 'true') return true;
    // Resume was only set to park on this confirmation screen — not to restart quiz
    if (resumeScreen === 'EmailVerified') return true;

    if (user?.id) {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('user_id', user.id)
          .maybeSingle();
        if (profile?.username) return true;
      } catch {
        // fall through
      }
    }

    return false;
  };

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!user) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      return;
    }

    const enterApp = await shouldEnterApp();

    // Always clear transient signup flags so navigator doesn't re-open onboarding
    await AsyncStorage.multiRemove([
      'NEEDS_EMAIL_SIGNUP',
      'ONBOARDING_RESUME_SCREEN',
    ]);

    if (enterApp) {
      await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
      console.log('[EmailVerified] Onboarding complete — routing to MainTabs');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      return;
    }

    // Genuine mid-onboarding signup (rare): continue quiz, do not restart at name
    console.log('[EmailVerified] Mid-onboarding signup — continuing quiz flow');
    navigation.reset({
      index: 0,
      routes: [{ name: 'OnboardingQuestion' }],
    });
  };

  if (!isReady) {
    return (
      <View style={auth.container}>
        <StatusBar barStyle="light-content" />
        <OnboardingAmbientBackground />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={auth.subtitleCentered}>{t('auxiliary.emailVerified.verifying')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={auth.container}>
      <StatusBar barStyle="light-content" />
      <OnboardingAmbientBackground />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={64} color="#10b981" />
          </View>
        </View>

        <Text style={auth.titleCentered}>{t('auxiliary.emailVerified.title')}</Text>
        <Text style={auth.subtitleCentered}>{t('auxiliary.emailVerified.subtitle')}</Text>
      </View>

      <View style={auth.bottomContainer}>
        <TouchableOpacity
          style={auth.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={auth.continueButtonText}>{t('auxiliary.common.continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
