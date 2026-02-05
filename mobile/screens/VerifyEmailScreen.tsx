import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import OTPInput from '../components/OTPInput';
import { useOnboarding } from '../contexts/OnboardingContext';

interface VerifyEmailScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
      type: 'signup' | 'email_change';
      username?: string;
    };
  };
}

export default function VerifyEmailScreen({ navigation, route }: VerifyEmailScreenProps) {
  const { email, type, username } = route.params;
  const { setUserName } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOTP = async (code: string) => {
    setLoading(true);
    setError(false);

    console.log('[OTP VERIFY] Starting verification');
    console.log('[OTP VERIFY] Code:', code);
    console.log('[OTP VERIFY] Email:', email);
    console.log('[OTP VERIFY] Type:', type);

    try {
      // For new signups, clear AsyncStorage flags BEFORE verifying
      // This prevents race condition where auth state changes before flags are cleared
      if (type === 'signup') {
        console.log('[OTP VERIFY] New signup - clearing AsyncStorage flags BEFORE verification');
        await AsyncStorage.removeItem('HAS_COMPLETED_ONBOARDING');
        await AsyncStorage.removeItem('HAS_SEEN_DASHBOARD_INTRO');
        console.log('[OTP VERIFY] AsyncStorage flags cleared');
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: type === 'signup' ? 'signup' : 'email_change',
      });

      if (verifyError) {
        console.error('[OTP VERIFY] ❌ Verification failed');
        console.error('[OTP VERIFY] Error:', verifyError);
        console.error('[OTP VERIFY] Error message:', verifyError.message);
        console.error('[OTP VERIFY] Error name:', verifyError.name);
        setError(true);
        setLoading(false);
        
        // Check if it's a network error
        if (verifyError.message.includes('Network request failed') || verifyError.name === 'AuthRetryableFetchError') {
          Alert.alert(
            'Connection Issue',
            'This is a known issue with Expo Go. The verification code is correct, but Expo Go has network limitations.\n\nSolutions:\n1. Wait 10 seconds and tap Retry\n2. Use a development build instead of Expo Go\n3. Try on a different network',
            [
              { 
                text: 'Retry', 
                onPress: () => {
                  // Wait a moment before retrying
                  setTimeout(() => handleVerifyOTP(code), 1000);
                }
              },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        } else if (verifyError.message.includes('expired') || verifyError.message.includes('invalid')) {
          Alert.alert(
            'Code Expired', 
            'This code has expired. Please request a new code.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Invalid Code', 'The code you entered is incorrect. Please try again or request a new code.');
        }
        return; // Don't navigate on error
      } else {
        console.log('[OTP VERIFY] ✅ Verification successful!');
        console.log('[OTP VERIFY] User:', data.user?.id);
        console.log('[OTP VERIFY] Session:', data.session ? 'Created' : 'None');
        
        // Pre-populate username from signup if available
        if (username) {
          console.log('[OTP VERIFY] Setting username from signup:', username);
          setUserName(username);
        }
        
        // Navigate to email verified confirmation screen
        console.log('[OTP VERIFY] Navigating to EmailVerified');
        navigation.reset({
          index: 0,
          routes: [{ name: 'EmailVerified' }],
        });
      }
    } catch (err: any) {
      console.error('[OTP VERIFY] ❌ Exception:', err);
      console.error('[OTP VERIFY] Exception message:', err.message);
      setError(true);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    console.log('[OTP RESEND] Starting resend');
    console.log('[OTP RESEND] Email:', email);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        console.error('[OTP RESEND] ❌ Resend failed');
        console.error('[OTP RESEND] Error:', resendError);
        Alert.alert('Error', 'Failed to resend code. Please try again.');
      } else {
        console.log('[OTP RESEND] ✅ Code resent successfully');
        Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
        setResendCooldown(60); // 60 second cooldown
      }
    } catch (err: any) {
      console.error('[OTP RESEND] ❌ Exception:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.content}>
          {/* Logo */}
          <Image source={require('../public/Insight-Logo-nobg.webp')} style={styles.logo} />
        
          <View style={styles.iconContainer}>
            <Image
              source={require('../public/onboarding-icons/Email-Icon2.webp')}
              style={styles.emailIcon}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Verify Your Email</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{' '}
            <Text style={styles.emailInline}>{email}</Text>
          </Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <OTPInput
              length={6}
              onComplete={handleVerifyOTP}
              error={error}
            />
          </View>

          {loading && (
            <ActivityIndicator size="small" color="#8b5cf6" style={styles.loader} />
          )}

          {/* Resend Button */}
          <TouchableOpacity
            style={[styles.resendButton, resendCooldown > 0 && styles.resendButtonDisabled]}
            onPress={handleResendCode}
            disabled={loading || resendCooldown > 0}
          >
            <Ionicons 
              name="refresh-outline" 
              size={18} 
              color={resendCooldown > 0 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.7)'} 
              style={styles.resendIcon}
            />
            <Text style={[styles.resendButtonText, resendCooldown > 0 && styles.resendButtonTextDisabled]}>
              {resendCooldown > 0
                ? `Resend code (${resendCooldown}s)`
                : 'Resend code'}
            </Text>
          </TouchableOpacity>

          {/* Change Email */}
          <TouchableOpacity
            style={styles.changeEmailButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.changeEmailText}>Change email address</Text>
          </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    opacity: 0.9,
    position: 'absolute',
    top: 16,
  },
  iconContainer: {
    marginBottom: 12,
  },
  emailIcon: {
    width: 280,
    height: 280,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailInline: {
    color: '#fff',
    fontWeight: '500',
  },
  otpContainer: {
    marginBottom: 24,
  },
  loader: {
    marginBottom: 16,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendIcon: {
    marginRight: 8,
  },
  resendButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  changeEmailButton: {
    paddingVertical: 12,
  },
  changeEmailText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
});
