import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function AuthSelectionScreen({ navigation }: any) {
  const { user, signInWithGoogle, signInWithApple } = useAuth();
  const [socialLoading, setSocialLoading] = useState(false);

  // If user is already authenticated, redirect to MainTabs
  React.useEffect(() => {
    if (user) {
      navigation.replace('MainTabs');
    }
  }, [user, navigation]);

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Continue to onboarding questions without auth
    navigation.navigate('OnboardingQuestion');
  };

  const handleEmailAuth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to Signup screen for email/password entry
    navigation.navigate('Signup' as never);
  };

  const handleAppleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSocialLoading(true);
    const { error } = await signInWithApple();
    setSocialLoading(false);
    if (error) {
      Alert.alert('Apple Sign-In Failed', error.message || 'An error occurred');
    }
  };

  const handleGoogleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSocialLoading(true);
    const { error } = await signInWithGoogle();
    setSocialLoading(false);
    if (error) {
      Alert.alert('Google Sign-In Failed', error.message || 'An error occurred');
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
      <StatusBar barStyle="light-content" />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>Select an option to get started</Text>
        </View>

        {/* Auth Options */}
        <View style={styles.authOptions}>
          {/* Apple Sign In */}
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleAppleAuth}
          >
            <Ionicons name="logo-apple" size={20} color="#fff" />
            <Text style={styles.authButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleGoogleAuth}
          >
            <View style={styles.googleLogoContainer}>
              <Ionicons name="logo-google" size={20} color="#4285F4" />
            </View>
            <Text style={styles.authButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Email Sign Up */}
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleEmailAuth}
          >
            <Ionicons name="mail-outline" size={20} color="#fff" />
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

        {/* Skip for now */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    paddingHorizontal: 24,
    paddingTop: 120,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  authOptions: {
    gap: 12,
  },
  appleButton: {
    height: 56,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    height: 56,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
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
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  signInTextBold: {
    fontWeight: '700',
    color: '#fff',
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
    fontSize: 16,
    color: '#60a5fa',
    fontWeight: '500',
  },
});
