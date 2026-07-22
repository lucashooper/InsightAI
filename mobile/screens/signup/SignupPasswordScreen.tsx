import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import { useTheme } from '../../contexts/ThemeContext';
import { onboardingAuthStyles as auth, ONBOARDING_AUTH_COLORS as colors } from '../../constants/onboardingAuthStyles';

export default function SignupPasswordScreen({ navigation, route }: any) {
  const { t } = useLanguage();
  const { theme } = useTheme();
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
    const { error } = await signUp(email, password, '');
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists') || error.message.includes('User already registered')) {
        Alert.alert(
          t('auxiliary.signup.accountExists'),
          t('auxiliary.signup.accountExistsMessage'),
          [
            { text: t('auxiliary.signup.goToLogin'), onPress: () => navigation.navigate('Login') },
            { text: t('auxiliary.signup.tryDifferentEmail'), style: 'cancel' },
          ]
        );
      } else {
        Alert.alert(t('auxiliary.signup.failed'), error.message);
      }
    } else {
      navigation.navigate('VerifyEmail', {
        email,
        type: 'signup',
        password,
      });
    }
  };

  return (
    <View style={auth.containerPadded}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={false} />
      <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={auth.keyboardView}
      >
        <TouchableOpacity
          style={auth.backButtonCompact}
          onPress={() => navigation.goBack()}
        >
          <View style={auth.backArrowCircle}>
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </View>
        </TouchableOpacity>

        <View style={[auth.contentCompact, { paddingTop: 80 }]}>
          <Text style={auth.title}>{t('auxiliary.signup.passwordTitle')}</Text>
          <Text style={auth.subtitle}>{t('auxiliary.signup.passwordSubtitle')}</Text>

          <View style={auth.passwordContainer}>
            <TextInput
              style={auth.passwordInput}
              placeholder={t('auxiliary.common.password')}
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            <TouchableOpacity
              style={auth.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.icon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={auth.bottomContainer}>
          <TouchableOpacity
            style={[
              auth.continueButton,
              (!password || password.length < 6) && auth.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!password || password.length < 6 || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={auth.continueButtonText}>{t('auxiliary.signup.createAccount')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
