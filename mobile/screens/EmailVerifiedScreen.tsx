import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function EmailVerifiedScreen({ navigation }: any) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [isReady, setIsReady] = useState(false);

  // CRITICAL FIX: Wait for auth state to update after email verification
  useEffect(() => {
    console.log('[EmailVerified] Checking auth state...');
    console.log('[EmailVerified] User:', user?.id);
    console.log('[EmailVerified] Loading:', loading);

    // Wait for loading to complete and user to be present
    if (!loading && user) {
      console.log('[EmailVerified] ✅ Auth state ready, user authenticated');
      setIsReady(true);
    } else if (!loading && !user) {
      // If loading is done but still no user after a delay, something went wrong
      console.warn('[EmailVerified] ⚠️ Loading complete but no user found');
      const timeout = setTimeout(() => {
        if (!user) {
          console.error('[EmailVerified] ❌ User not authenticated after verification');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }, 2000); // Give it 2 seconds
      
      return () => clearTimeout(timeout);
    }
  }, [user, loading, navigation]);

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // User should be authenticated at this point
    if (user) {
      // Clear the email signup flag since user now has an email
      await AsyncStorage.removeItem('NEEDS_EMAIL_SIGNUP');
      
      // Check if user already completed onboarding (post-purchase flow)
      // If they already went through onboarding questions + purchased, go straight to MainTabs
      const hasCompletedOnboarding = await AsyncStorage.getItem('HAS_COMPLETED_ONBOARDING');
      console.log('[EmailVerified] HAS_COMPLETED_ONBOARDING:', hasCompletedOnboarding);
      
      if (hasCompletedOnboarding === 'true') {
        // Post-purchase flow: user already did onboarding, go to main app
        console.log('[EmailVerified] Post-purchase flow - navigating to MainTabs');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        // Normal signup flow: user needs to complete onboarding (start with theme selection)
        console.log('[EmailVerified] Normal flow - navigating to ChooseVibe');
        // Set the resume screen so navigation knows where to go after ChooseVibe
        await AsyncStorage.setItem('ONBOARDING_RESUME_SCREEN', 'ChooseVibe');
        navigation.reset({
          index: 0,
          routes: [{ name: 'ChooseVibe' }],
        });
      }
    } else {
      // Shouldn't happen, but fallback to login if not authenticated
      console.warn('[EmailVerified] User not authenticated, redirecting to login');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  // Show loading state while auth updates
  if (!isReady) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0a', '#1a0a2e', '#0a0a0a']}
          style={styles.gradient}
        />
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={[styles.subtitle, { marginTop: 16 }]}>
            {t('auxiliary.emailVerified.verifying')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a0a2e', '#0a0a0a']}
        style={styles.gradient}
      />

      <View style={styles.content}>
        {/* Checkmark Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={64} color="#10b981" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('auxiliary.emailVerified.title')}</Text>
        <Text style={styles.subtitle}>
          {t('auxiliary.emailVerified.subtitle')}
        </Text>
      </View>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8b5cf6', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.continueButtonText}>{t('auxiliary.common.continue')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
