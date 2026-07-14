import React, { useState } from 'react';
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
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useLanguage } from '../../contexts/LanguageContext';

export default function SignupPasswordScreen({ navigation, route }: any) {
  const { t } = useLanguage();
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleContinue = async () => {
    if (!password) {
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.signup.enterPassword'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.signup.passwordMinimum'));
      return;
    }

    setLoading(true);
    console.log('[SIGNUP] Creating account for:', email);

    // Create account without name - name will be collected after email verification
    const { error } = await signUp(email, password, '');
    setLoading(false);

    if (error) {
      console.error('[SIGNUP] Error:', error);
      
      // Check if user already exists
      if (error.message.includes('already registered') || error.message.includes('already exists') || error.message.includes('User already registered')) {
        Alert.alert(
          t('auxiliary.signup.accountExists'),
          t('auxiliary.signup.accountExistsMessage'),
          [
            { text: t('auxiliary.signup.goToLogin'), onPress: () => navigation.navigate('Login') },
            { text: t('auxiliary.signup.tryDifferentEmail'), style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(t('auxiliary.signup.failed'), error.message);
      }
    } else {
      console.log('[SIGNUP] Success! Navigating to verification...');
      // Navigate to email verification
      navigation.navigate('VerifyEmail', {
        email,
        type: 'signup',
        password,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
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
          {/* Progress Indicator - Hidden on last step */}

          {/* Title */}
          <Text style={styles.title}>{t('auxiliary.signup.passwordTitle')}</Text>
          <Text style={styles.subtitle}>{t('auxiliary.signup.passwordSubtitle')}</Text>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auxiliary.common.password')}
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="rgba(0, 0, 0, 0.6)"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Button at Bottom */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!password || password.length < 6) && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!password || password.length < 6 || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>{t('auxiliary.signup.createAccount')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
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
    paddingTop: 80,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    backgroundColor: '#8b5cf6',
  },
  progressDotComplete: {
    backgroundColor: '#10b981',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 32,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    paddingRight: 48,
    fontSize: 16,
    color: '#1a1a2e',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
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
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
