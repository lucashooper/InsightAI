import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SunoGradient from '../components/onboarding/SunoGradient';
import OTPInput from '../components/OTPInput';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

type RecoveryStep = 'email' | 'code' | 'password' | 'success';
const PASSWORD_RECOVERY_ACTIVE_KEY = 'PASSWORD_RECOVERY_ACTIVE';
const PASSWORD_RECOVERY_STAGE_KEY = 'PASSWORD_RECOVERY_STAGE';
const PASSWORD_RECOVERY_EMAIL_KEY = 'PASSWORD_RECOVERY_EMAIL';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { t } = useLanguage();
  const [step, setStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [recoveryVerified, setRecoveryVerified] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const normalizedEmail = email.trim().toLowerCase();

  useEffect(() => {
    const restoreRecoveryState = async () => {
      try {
        const [active, storedStage, storedEmail] = await Promise.all([
          AsyncStorage.getItem(PASSWORD_RECOVERY_ACTIVE_KEY),
          AsyncStorage.getItem(PASSWORD_RECOVERY_STAGE_KEY),
          AsyncStorage.getItem(PASSWORD_RECOVERY_EMAIL_KEY),
        ]);

        if (storedEmail) {
          setEmail(storedEmail);
        }

        if (active === 'true' && storedStage === 'password' && storedEmail) {
          setRecoveryVerified(true);
          setStep('password');
        }
      } catch (err) {
        console.error('[PASSWORD RESET] Failed to restore recovery state:', err);
      }
    };

    restoreRecoveryState();
  }, []);

  const sendRecoveryCode = async () => {
    if (!normalizedEmail) {
      Alert.alert(t('auxiliary.forgotPassword.enterEmail'), t('auxiliary.forgotPassword.enterEmailMessage'));
      return false;
    }

    if (!normalizedEmail.includes('@')) {
      Alert.alert(t('auxiliary.forgotPassword.invalidEmail'), t('auxiliary.forgotPassword.invalidEmailMessage'));
      return false;
    }

    setLoading(true);
    setCodeError(false);
    console.log('[PASSWORD RESET] Sending recovery code to:', normalizedEmail);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
      if (error) {
        console.error('[PASSWORD RESET] Error sending recovery code:', error);
        Alert.alert(t('auxiliary.common.error'), t('auxiliary.forgotPassword.sendFailed'));
        return false;
      }

      setStep('code');
      setRecoveryVerified(false);
      setResendCooldown(60);
      await AsyncStorage.setItem(PASSWORD_RECOVERY_EMAIL_KEY, normalizedEmail);
      return true;
    } catch (err: any) {
      console.error('[PASSWORD RESET] Exception sending recovery code:', err);
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.common.tryAgain'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearRecoverySession = async () => {
    try {
      await AsyncStorage.removeItem(PASSWORD_RECOVERY_ACTIVE_KEY);
      await AsyncStorage.removeItem(PASSWORD_RECOVERY_STAGE_KEY);
      await AsyncStorage.removeItem(PASSWORD_RECOVERY_EMAIL_KEY);
      if (recoveryVerified) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('[PASSWORD RESET] Failed to clear recovery session:', err);
    } finally {
      setRecoveryVerified(false);
    }
  };

  const finishRecoveryAndReturnToLogin = async () => {
    setLoading(true);
    await clearRecoverySession();
    setLoading(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleVerifyCode = async (code: string) => {
    setLoading(true);
    setCodeError(false);

    try {
      await AsyncStorage.setItem(PASSWORD_RECOVERY_ACTIVE_KEY, 'true');
      await AsyncStorage.setItem(PASSWORD_RECOVERY_EMAIL_KEY, normalizedEmail);
      const { error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: code,
        type: 'recovery',
      });

      if (error) {
        console.error('[PASSWORD RESET] Recovery code verification failed:', error);
        await AsyncStorage.removeItem(PASSWORD_RECOVERY_ACTIVE_KEY);
        setCodeError(true);
        Alert.alert(t('auxiliary.forgotPassword.invalidCode'), t('auxiliary.forgotPassword.invalidCodeMessage'));
        return;
      }

      setRecoveryVerified(true);
      await AsyncStorage.setItem(PASSWORD_RECOVERY_STAGE_KEY, 'password');
      setStep('password');
    } catch (err: any) {
      console.error('[PASSWORD RESET] Exception verifying recovery code:', err);
      await AsyncStorage.removeItem(PASSWORD_RECOVERY_ACTIVE_KEY);
      setCodeError(true);
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.common.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password || password.length < 8) {
      Alert.alert(t('auxiliary.forgotPassword.tooShort'), t('auxiliary.forgotPassword.tooShortMessage'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('auxiliary.forgotPassword.mismatch'), t('auxiliary.forgotPassword.mismatchMessage'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.error('[PASSWORD RESET] Failed to update password:', error);
        Alert.alert(t('auxiliary.common.error'), error.message || t('auxiliary.forgotPassword.updateFailed'));
        return;
      }

      setStep('success');
      await AsyncStorage.setItem(PASSWORD_RECOVERY_STAGE_KEY, 'success');
    } catch (err: any) {
      console.error('[PASSWORD RESET] Exception updating password:', err);
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.common.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'success') {
      finishRecoveryAndReturnToLogin();
      return;
    }

    if (step === 'password') {
      setPassword('');
      setConfirmPassword('');
      setStep('code');
      return;
    }

    if (step === 'code') {
      setCodeError(false);
      if (recoveryVerified) {
        clearRecoverySession().finally(() => {
          setStep('email');
        });
      } else {
        setStep('email');
      }
      return;
    }

    navigation.goBack();
  };

  const renderIcon = () => {
    if (step === 'password') {
      return (
        <View style={styles.inlineIconCircle}>
          <Ionicons name="key-outline" size={34} color="#1a1a2e" />
        </View>
      );
    }

    if (step === 'success') {
      return (
        <View style={styles.inlineIconCircle}>
          <Ionicons name="checkmark" size={34} color="#1a1a2e" />
        </View>
      );
    }

    return (
      <Image
        source={require('../public/onboarding-icons/Email-Icon2.webp')}
        style={styles.emailIcon}
        resizeMode="contain"
      />
    );
  };

  const renderTitle = () => {
    switch (step) {
      case 'code':
        return t('auxiliary.forgotPassword.checkEmail');
      case 'password':
        return t('auxiliary.forgotPassword.createPassword');
      case 'success':
        return t('auxiliary.forgotPassword.updated');
      default:
        return t('auxiliary.forgotPassword.reset');
    }
  };

  const renderSubtitle = () => {
    switch (step) {
      case 'code':
        return (
          <Text style={styles.subtitle}>
            {t('auxiliary.forgotPassword.codeSentTo')}{' '}
            <Text style={styles.emailInline}>{normalizedEmail}</Text>
          </Text>
        );
      case 'password':
        return (
          <Text style={styles.subtitle}>
            {t('auxiliary.forgotPassword.chooseNew')}
          </Text>
        );
      case 'success':
        return (
          <Text style={styles.subtitle}>
            {t('auxiliary.forgotPassword.successMessage')}
          </Text>
        );
      default:
        return (
          <Text style={styles.subtitle}>
            {t('auxiliary.forgotPassword.instructions')}
          </Text>
        );
    }
  };

  const renderBody = () => {
    if (step === 'code') {
      return (
        <>
          <View style={styles.otpContainer}>
            <OTPInput length={6} onComplete={handleVerifyCode} error={codeError} />
          </View>
          {loading && <ActivityIndicator size="small" color="#1a1a1a" style={styles.loader} />}
          <TouchableOpacity
            style={[styles.secondaryButton, resendCooldown > 0 && styles.secondaryButtonDisabled]}
            onPress={sendRecoveryCode}
            disabled={loading || resendCooldown > 0}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={resendCooldown > 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.6)'}
              style={styles.secondaryButtonIcon}
            />
            <Text style={[styles.secondaryButtonText, resendCooldown > 0 && styles.secondaryButtonTextDisabled]}>
              {resendCooldown > 0 ? t('auxiliary.verifyEmail.resendCountdown', { seconds: resendCooldown }) : t('auxiliary.verifyEmail.resend')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              if (recoveryVerified) {
                clearRecoverySession().finally(() => setStep('email'));
              } else {
                setStep('email');
              }
            }}
          >
            <Text style={styles.linkButtonText}>{t('auxiliary.verifyEmail.changeEmail')}</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (step === 'password') {
      return (
        <>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('auxiliary.forgotPassword.newPassword')}
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="rgba(0, 0, 0, 0.6)"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('auxiliary.forgotPassword.confirmPassword')}
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              onSubmitEditing={handleUpdatePassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="rgba(0, 0, 0, 0.6)"
              />
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (step === 'success') {
      return null;
    }

    return (
      <TextInput
        style={styles.input}
        placeholder={t('auxiliary.common.email')}
        placeholderTextColor="rgba(0, 0, 0, 0.4)"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={sendRecoveryCode}
      />
    );
  };

  const renderPrimaryButton = () => {
    const buttonText =
      step === 'code'
        ? t('auxiliary.forgotPassword.enterCodeAbove')
        : step === 'password'
          ? t('auxiliary.forgotPassword.updatePassword')
          : step === 'success'
            ? t('auxiliary.forgotPassword.backToSignIn')
            : t('auxiliary.forgotPassword.sendCode');

    const onPress =
      step === 'password'
        ? handleUpdatePassword
        : step === 'success'
          ? finishRecoveryAndReturnToLogin
          : sendRecoveryCode;

    const disabled = loading || step === 'code';

    return (
        <TouchableOpacity
        style={[styles.continueButton, disabled && styles.continueButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        {loading && step !== 'code' ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.continueButtonText}>{buttonText}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
        <SunoGradient />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
          style={styles.keyboardView}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View style={styles.backArrowCircle}>
              <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
            </View>
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>{renderIcon()}</View>
              <Text style={styles.title}>{renderTitle()}</Text>
              {renderSubtitle()}
              {renderBody()}
              {step === 'password' && <View style={styles.inlineButtonWrap}>{renderPrimaryButton()}</View>}
            </View>
          </ScrollView>

          {step !== 'password' && <View style={styles.bottomContainer}>{renderPrimaryButton()}</View>}
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7f2',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    alignItems: 'center',
    paddingBottom: 24,
  },
  iconContainer: {
    marginBottom: 12,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailIcon: {
    width: 180,
    height: 180,
  },
  inlineIconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
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
    maxWidth: 320,
  },
  emailInline: {
    color: '#1a1a2e',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a2e',
  },
  otpContainer: {
    marginBottom: 24,
  },
  loader: {
    marginBottom: 16,
  },
  secondaryButton: {
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
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryButtonIcon: {
    marginRight: 8,
  },
  secondaryButtonText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButtonTextDisabled: {
    color: 'rgba(0, 0, 0, 0.3)',
  },
  linkButton: {
    paddingVertical: 12,
  },
  linkButtonText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#1a1a2e',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  inlineButtonWrap: {
    width: '100%',
    marginTop: 12,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 28,
    paddingVertical: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.45,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
