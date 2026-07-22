import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import SunoGradient from '../components/onboarding/SunoGradient';
import { onboardingAuthStyles as auth } from '../constants/onboardingAuthStyles';

export default function EmailVerifiedScreen({ navigation }: any) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
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

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (user) {
      await AsyncStorage.removeItem('NEEDS_EMAIL_SIGNUP');
      const hasCompletedOnboarding = await AsyncStorage.getItem('HAS_COMPLETED_ONBOARDING');

      if (hasCompletedOnboarding === 'true') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        await setTheme('dark');
        await AsyncStorage.setItem('ONBOARDING_RESUME_SCREEN', 'OnboardingQuestion');
        navigation.reset({
          index: 0,
          routes: [{ name: 'OnboardingQuestion' }],
        });
      }
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  if (!isReady) {
    return (
      <View style={auth.container}>
        <StatusBar barStyle="light-content" />
        <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
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
      <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />

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
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
