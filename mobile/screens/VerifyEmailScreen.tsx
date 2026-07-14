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
import SunoGradient from '../components/onboarding/SunoGradient';
import { useLanguage } from '../contexts/LanguageContext';

interface VerifyEmailScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
      type: 'signup' | 'email_change';
      username?: string;
      password?: string;
    };
  };
}

export default function VerifyEmailScreen({ navigation, route }: VerifyEmailScreenProps) {
  const { t } = useLanguage();
  const { email, type, username, password } = route.params;
  const { userName, setUserName } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const resolvePreferredUsername = async () => {
    const pendingName = await AsyncStorage.getItem('PENDING_ONBOARDING_NAME');
    return username || userName || pendingName || '';
  };

  const persistVerifiedUserProfile = async (verifiedUser: any) => {
    const preferredUsername = (await resolvePreferredUsername()).trim();
    if (!verifiedUser?.id || !preferredUsername) {
      return;
    }

    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id, username')
        .eq('user_id', verifiedUser.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from('user_profiles')
          .update({
            username: preferredUsername,
            email: verifiedUser.email,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', verifiedUser.id);
      } else {
        await supabase
          .from('user_profiles')
          .insert({
            user_id: verifiedUser.id,
            username: preferredUsername,
            email: verifiedUser.email,
          });
      }

      await AsyncStorage.setItem('CACHED_USERNAME', preferredUsername);
      await AsyncStorage.removeItem('PENDING_ONBOARDING_NAME');
      console.log('[OTP VERIFY] ✅ Persisted verified user profile name:', preferredUsername);
    } catch (profileError) {
      console.error('[OTP VERIFY] Failed to persist verified profile name:', profileError);
    }
  };

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
      // For new signups, set AsyncStorage flags BEFORE verifying
      // CRITICAL: verifyOtp triggers onAuthStateChange immediately, which causes
      // the navigator to re-check onboarding status. Flags MUST be set before this.
      const needsEmailSignup = await AsyncStorage.getItem('NEEDS_EMAIL_SIGNUP');
      const isPostPurchase = needsEmailSignup === 'true';
      
      if (type === 'signup') {
        if (isPostPurchase) {
          console.log('[OTP VERIFY] Post-purchase signup - setting HAS_COMPLETED_ONBOARDING BEFORE verification');
          // Set the flag BEFORE verifyOtp so the navigator finds it immediately
          await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
          // Keep NEEDS_EMAIL_SIGNUP as fallback - navigator also checks this
        } else {
          console.log('[OTP VERIFY] New signup - clearing AsyncStorage flags BEFORE verification');
          await AsyncStorage.removeItem('HAS_COMPLETED_ONBOARDING');
          await AsyncStorage.removeItem('HAS_SEEN_DASHBOARD_INTRO');
          // CRITICAL: Set resume screen BEFORE verifyOtp fires onAuthStateChange
          // The navigator checks this key the moment the user changes, so it must
          // already be set or the profile check (which finds nothing) will default to Welcome
          await AsyncStorage.setItem('ONBOARDING_RESUME_SCREEN', 'EmailVerified');
          console.log('[OTP VERIFY] Set ONBOARDING_RESUME_SCREEN=EmailVerified before auth fires');
        }
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
            t('auxiliary.verifyEmail.connectionIssue'),
            t('auxiliary.verifyEmail.connectionIssueMessage'),
            [
              { 
                text: t('auxiliary.common.retry'),
                onPress: () => {
                  // Wait a moment before retrying
                  setTimeout(() => handleVerifyOTP(code), 1000);
                }
              },
              { text: t('auxiliary.common.cancel'), style: 'cancel' }
            ]
          );
        } else if (verifyError.message.includes('expired') || verifyError.message.includes('invalid')) {
          Alert.alert(
            t('auxiliary.verifyEmail.codeExpired'),
            t('auxiliary.verifyEmail.codeExpiredMessage'),
            [{ text: t('auxiliary.common.ok') }]
          );
        } else {
          Alert.alert(t('auxiliary.verifyEmail.invalidCode'), t('auxiliary.verifyEmail.invalidCodeMessage'));
        }
        return; // Don't navigate on error
      } else {
        console.log('[OTP VERIFY] ✅ Verification successful!');
        console.log('[OTP VERIFY] User:', data.user?.id);
        console.log('[OTP VERIFY] Session:', data.session ? 'Created' : 'None');
        
        const preferredUsername = await resolvePreferredUsername();
        if (preferredUsername) {
          console.log('[OTP VERIFY] Setting username after verification:', preferredUsername);
          setUserName(preferredUsername);
        }

        await persistVerifiedUserProfile(data.user);
        
        if (isPostPurchase) {
          // Post-purchase flow: onboarding is already complete
          // HAS_COMPLETED_ONBOARDING was set BEFORE verifyOtp above
          // Clean up NEEDS_EMAIL_SIGNUP now that we're done with it
          console.log('[OTP VERIFY] Post-purchase flow - navigating to EmailVerified');
          await AsyncStorage.removeItem('NEEDS_EMAIL_SIGNUP');
          // Ensure flag is still set (belt and suspenders)
          await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
          navigation.reset({
            index: 0,
            routes: [{ name: 'EmailVerified' }],
          });
        } else {
          // Normal signup flow: show email verified confirmation screen
          console.log('[OTP VERIFY] Navigating to EmailVerified');
          navigation.reset({
            index: 0,
            routes: [{ name: 'EmailVerified' }],
          });
        }
      }
    } catch (err: any) {
      console.error('[OTP VERIFY] ❌ Exception:', err);
      console.error('[OTP VERIFY] Exception message:', err.message);
      setError(true);
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.common.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  const resendErrorMessage = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes('rate limit') || lower.includes('once every')) {
      return t('auxiliary.verifyEmail.waitBeforeResend');
    }
    if (lower.includes('smtp') || lower.includes('email')) {
      return t('auxiliary.verifyEmail.emailSendFailed');
    }
    if (lower.includes('already registered') || lower.includes('already exists')) {
      return t('auxiliary.verifyEmail.alreadyRegistered');
    }
    return t('auxiliary.verifyEmail.resendFailed');
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    console.log('[OTP RESEND] Starting resend');
    console.log('[OTP RESEND] Email:', email);
    console.log('[OTP RESEND] Type:', type);

    try {
      const resendType = type === 'email_change' ? 'email_change' : 'signup';
      let { error: resendError } = await supabase.auth.resend({
        type: resendType,
        email,
      });

      // Fallback: re-trigger signup confirmation for unverified accounts
      if (resendError && type === 'signup' && password) {
        console.log('[OTP RESEND] auth.resend failed, trying signUp fallback');
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });
        resendError = signupError;
      }

      if (resendError) {
        console.error('[OTP RESEND] ❌ Resend failed');
        console.error('[OTP RESEND] Error:', resendError);
        Alert.alert(t('auxiliary.verifyEmail.couldNotResend'), resendErrorMessage(resendError.message));
      } else {
        console.log('[OTP RESEND] ✅ Code resent successfully');
        Alert.alert(t('auxiliary.verifyEmail.codeSent'), t('auxiliary.verifyEmail.codeSentMessage'));
        setResendCooldown(60);
      }
    } catch (err: any) {
      console.error('[OTP RESEND] ❌ Exception:', err);
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.common.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SunoGradient />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backArrowCircle}>
              <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
            </View>
          </TouchableOpacity>

          <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../public/onboarding-icons/Email-Icon2.webp')}
              style={styles.emailIcon}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('auxiliary.verifyEmail.title')}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {t('auxiliary.verifyEmail.sentCodeTo')}{' '}
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
            <ActivityIndicator size="small" color="#1a1a1a" style={styles.loader} />
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
              color={resendCooldown > 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.6)'} 
              style={styles.resendIcon}
            />
            <Text style={[styles.resendButtonText, resendCooldown > 0 && styles.resendButtonTextDisabled]}>
              {resendCooldown > 0
                ? t('auxiliary.verifyEmail.resendCountdown', { seconds: resendCooldown })
                : t('auxiliary.verifyEmail.resend')}
            </Text>
          </TouchableOpacity>

          {/* Change Email */}
          <TouchableOpacity
            style={styles.changeEmailButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.changeEmailText}>{t('auxiliary.verifyEmail.changeEmail')}</Text>
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
    backgroundColor: '#fef7f2',
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
    padding: 4,
  },
  backArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  emailIcon: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailInline: {
    color: '#1a1a2e',
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
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendIcon: {
    marginRight: 8,
  },
  resendButtonText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: 15,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: 'rgba(0, 0, 0, 0.3)',
  },
  changeEmailButton: {
    paddingVertical: 12,
  },
  changeEmailText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
});
