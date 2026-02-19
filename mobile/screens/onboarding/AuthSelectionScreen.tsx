import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SvgXml } from 'react-native-svg';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';
import SunoGradient from '../../components/onboarding/SunoGradient';

const GoogleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;

export default function AuthSelectionScreen({ navigation, route }: any) {
  const { user, signInWithGoogle, signInWithApple } = useAuth();
  const [socialLoading, setSocialLoading] = useState(false);
  const postPurchase = route?.params?.postPurchase === true;

  // Note: Onboarding completion is now handled in AuthContext for Apple/Google sign-ins
  // to ensure compliance with Apple's Sign in with Apple guidelines

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Continue to theme selection screen
    navigation.navigate('ChooseVibe');
  };

  const handleEmailAuth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to Signup screen for email/password entry
    navigation.navigate('Signup' as never);
  };

  const handleAppleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSocialLoading(true);
    // Set resume flag BEFORE sign-in so AppNavigator knows where to start
    // when the navigator switches from unauthenticated to authenticated stack
    await AsyncStorage.setItem('ONBOARDING_RESUME_SCREEN', 'ChooseVibe');
    const { error } = await signInWithApple();
    setSocialLoading(false);
    if (error) {
      await AsyncStorage.removeItem('ONBOARDING_RESUME_SCREEN');
      Alert.alert('Apple Sign-In Failed', error.message || 'An error occurred');
    } else {
      console.log('[AuthSelection] Apple Sign-In successful, navigator will resume at ChooseVibe');
    }
  };

  const handleGoogleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSocialLoading(true);
    // Set resume flag BEFORE sign-in so AppNavigator knows where to start
    await AsyncStorage.setItem('ONBOARDING_RESUME_SCREEN', 'ChooseVibe');
    const { error } = await signInWithGoogle();
    setSocialLoading(false);
    if (error) {
      await AsyncStorage.removeItem('ONBOARDING_RESUME_SCREEN');
      Alert.alert('Google Sign-In Failed', error.message || 'An error occurred');
    } else {
      console.log('[AuthSelection] Google Sign-In successful, navigator will resume at ChooseVibe');
    }
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // If user is already authenticated, go to MainTabs
    if (user) {
      navigation.replace('MainTabs');
    } else {
      // Navigate to Login - it should be in the unauthenticated stack
      navigation.navigate('Login' as never);
    }
  };

  return (
    <View style={styles.container}>
      <SunoGradient />
      <StatusBar barStyle="dark-content" />
      
      {/* Back Button - only show if can go back */}
      {navigation.canGoBack() && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#6b7280" />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{postPurchase ? 'Create your account' : 'Create an account'}</Text>
          <Text style={styles.subtitle}>{postPurchase ? 'Save your entries and access them across devices' : 'Select an option to get started'}</Text>
        </View>

        {/* Auth Options */}
        <View style={styles.authOptions}>
          {/* Apple Sign In */}
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleAppleAuth}
          >
            <Ionicons name="logo-apple" size={24} color="#1a1a2e" />
            <Text style={styles.authButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleGoogleAuth}
          >
            <SvgXml xml={GoogleSvg} width={20} height={20} />
            <Text style={styles.authButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Email Sign Up */}
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleEmailAuth}
          >
            <Ionicons name="mail-outline" size={20} color="#1a1a2e" />
            <Text style={styles.authButtonText}>Continue with email</Text>
          </TouchableOpacity>
        </View>

        {/* Already have account */}
        <TouchableOpacity
          style={styles.signInLink}
          onPress={handleSignIn}
        >
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInTextBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        {/* Skip for now - hide if post-purchase since they already have a subscription */}
        {!postPurchase && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7f2',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: isTablet ? 80 : 24,
    paddingTop: isTablet ? 140 : 120,
  },
  header: {
    marginBottom: isTablet ? 56 : 48,
  },
  title: {
    fontSize: sf(32),
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: sf(16),
    color: 'rgba(0, 0, 0, 0.5)',
  },
  authOptions: {
    gap: isTablet ? 16 : 12,
  },
  appleButton: {
    height: isTablet ? 64 : 56,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: isTablet ? 16 : 12,
    height: isTablet ? 64 : 56,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  authButtonText: {
    color: '#1a1a2e',
    fontSize: sf(16),
    fontWeight: '600',
  },
  googleLogoContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInLink: {
    alignItems: 'center',
    marginTop: 32,
  },
  signInText: {
    fontSize: sf(15),
    color: 'rgba(0, 0, 0, 0.5)',
  },
  signInTextBold: {
    fontWeight: '700',
    color: '#1a1a2e',
  },
  skipButton: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: sf(16),
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: '500',
  },
});
