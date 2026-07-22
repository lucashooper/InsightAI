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
import { SvgXml } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SunoGradient from '../components/onboarding/SunoGradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { onboardingAuthStyles as auth, ONBOARDING_AUTH_COLORS as colors } from '../constants/onboardingAuthStyles';

const GoogleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;

export default function LoginScreen({ navigation }: any) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.login.fillAllFields'));
      return;
    }

    setLoading(true);
    let loginEmail = emailOrUsername;

    if (!emailOrUsername.includes('@')) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('username', emailOrUsername)
          .single();

        if (error || !data) {
          setLoading(false);
          Alert.alert(t('auxiliary.login.failed'), t('auxiliary.login.usernameNotFound'));
          return;
        }

        loginEmail = data.email;
      } catch {
        setLoading(false);
        Alert.alert(t('auxiliary.login.failed'), t('auxiliary.login.usernameLookupFailed'));
        return;
      }
    }

    await AsyncStorage.setItem('HAS_COMPLETED_ONBOARDING', 'true');
    const { error } = await signIn(loginEmail, password);
    setLoading(false);

    if (error) {
      await AsyncStorage.removeItem('HAS_COMPLETED_ONBOARDING');
      Alert.alert(t('auxiliary.login.failed'), error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(true);
    const { error } = await signInWithGoogle();
    setSocialLoading(false);
    if (error) {
      Alert.alert(t('auxiliary.login.googleFailed'), error.message || t('auxiliary.common.genericError'));
    }
  };

  const handleAppleSignIn = async () => {
    setSocialLoading(true);
    const { error } = await signInWithApple();
    setSocialLoading(false);
    if (error) {
      Alert.alert(t('auxiliary.login.appleFailed'), error.message || t('auxiliary.common.genericError'));
    }
  };

  return (
    <View style={auth.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={false} />
      <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={auth.keyboardView}
      >
        <TouchableOpacity
          style={auth.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Welcome');
            }
          }}
        >
          <View style={auth.backArrowCircle}>
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </View>
        </TouchableOpacity>

        <View style={auth.content}>
          <Text style={[auth.title, { marginBottom: 32 }]}>{t('auxiliary.common.signIn')}</Text>

          <TextInput
            style={auth.input}
            placeholder={t('auxiliary.login.emailOrUsername')}
            placeholderTextColor={colors.placeholder}
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
          />

          <View style={auth.passwordContainer}>
            <TextInput
              style={auth.passwordInput}
              placeholder={t('auxiliary.common.password')}
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              style={auth.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.icon}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ alignSelf: 'flex-end', marginTop: 4 }}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={auth.linkText}>{t('auxiliary.login.forgotPassword')}</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 24 }}>
            <View style={auth.dividerContainer}>
              <View style={auth.divider} />
              <Text style={auth.dividerText}>{t('auxiliary.common.or')}</Text>
              <View style={auth.divider} />
            </View>

            <TouchableOpacity
              style={auth.socialButton}
              onPress={handleAppleSignIn}
              disabled={socialLoading}
            >
              <Ionicons name="logo-apple" size={24} color="#ffffff" />
              <Text style={auth.socialButtonText}>{t('auxiliary.login.apple')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[auth.socialButton, { marginBottom: 0 }]}
              onPress={handleGoogleSignIn}
              disabled={socialLoading}
            >
              <SvgXml xml={GoogleSvg} width={20} height={20} />
              <Text style={auth.socialButtonText}>{t('auxiliary.login.google')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignItems: 'center', marginTop: 24 }}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={auth.linkText}>
                {t('auxiliary.login.noAccount')}{' '}
                <Text style={auth.linkTextBold}>{t('auxiliary.login.signUp')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={auth.bottomContainer}>
          <TouchableOpacity
            style={auth.continueButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={auth.continueButtonText}>{t('auxiliary.common.continue')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
