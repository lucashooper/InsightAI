import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { onboardingAuthStyles as auth, ONBOARDING_AUTH_COLORS as colors } from '../../constants/onboardingAuthStyles';

export default function SignupUsernameScreen({ navigation }: any) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (!name.trim()) {
      return;
    }
    navigation.navigate('SignupEmail', { name: name.trim() });
  };

  return (
    <View style={auth.containerPadded}>
      <StatusBar barStyle="light-content" />
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
          <Text style={auth.title}>{t('auxiliary.signup.nameTitle')}</Text>
          <Text style={auth.subtitle}>{t('auxiliary.signup.nameSubtitle')}</Text>

          <TextInput
            style={[auth.input, { marginBottom: 0 }]}
            placeholder={t('auxiliary.common.name')}
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
            onSubmitEditing={handleContinue}
            returnKeyType="next"
          />
        </View>

        <View style={auth.bottomContainer}>
          <TouchableOpacity
            style={[auth.continueButton, !name.trim() && auth.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!name.trim()}
          >
            <Text style={auth.continueButtonText}>{t('auxiliary.common.continue')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
