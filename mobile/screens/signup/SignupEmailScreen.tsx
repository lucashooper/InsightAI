import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { onboardingAuthStyles as auth, ONBOARDING_AUTH_COLORS as colors } from '../../constants/onboardingAuthStyles';

export default function SignupEmailScreen({ navigation }: any) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [checking] = useState(false);

  const handleContinue = async () => {
    if (!email.trim() || !email.includes('@')) {
      return;
    }
    navigation.navigate('SignupPassword', { email: email.trim() });
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

        <View style={auth.contentCompact}>
          <Text style={auth.title}>{t('auxiliary.signup.emailTitle')}</Text>
          <Text style={auth.subtitle}>{t('auxiliary.signup.emailSubtitle')}</Text>

          <TextInput
            style={[auth.input, { marginBottom: 0 }]}
            placeholder={t('auxiliary.common.email')}
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoFocus
            onSubmitEditing={handleContinue}
            returnKeyType="next"
          />
        </View>

        <View style={auth.bottomContainer}>
          <TouchableOpacity
            style={[auth.continueButton, (!email.trim() || !email.includes('@') || checking) && auth.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!email.trim() || !email.includes('@') || checking}
          >
            {checking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={auth.continueButtonText}>{t('auxiliary.common.continue')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
