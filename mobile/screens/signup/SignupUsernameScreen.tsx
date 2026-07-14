import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useLanguage } from '../../contexts/LanguageContext';

export default function SignupUsernameScreen({ navigation }: any) {
  const { t } = useLanguage();
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (!name.trim()) {
      return;
    }
    navigation.navigate('SignupEmail', { name: name.trim() });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
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
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('auxiliary.signup.nameTitle')}</Text>
          <Text style={styles.subtitle}>{t('auxiliary.signup.nameSubtitle')}</Text>

          {/* Name Input */}
          <TextInput
            style={styles.input}
            placeholder={t('auxiliary.common.name')}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
            onSubmitEditing={handleContinue}
            returnKeyType="next"
          />
        </View>

        {/* Continue Button at Bottom */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.continueButton, !name.trim() && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!name.trim()}
          >
            <Text style={styles.continueButtonText}>{t('auxiliary.common.continue')}</Text>
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
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a2e',
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
