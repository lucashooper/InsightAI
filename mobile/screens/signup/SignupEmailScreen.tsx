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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { supabase } from '../../lib/supabase';

export default function SignupEmailScreen({ navigation, route }: any) {
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);

  const handleContinue = async () => {
    if (!email.trim() || !email.includes('@')) {
      return;
    }

    setChecking(true);
    
    try {
      // Check if email already exists in auth.users
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: 'dummy-password-check-12345', // Intentionally wrong password
      });

      // If no error, it means the email exists (wrong password error)
      // If error contains "Invalid login credentials", email exists
      // If error contains "Email not confirmed", email exists but not verified
      if (error && (error.message.includes('Invalid login') || error.message.includes('Email not confirmed'))) {
        setChecking(false);
        Alert.alert(
          'Account Already Exists',
          'This email is already registered. Please log in instead or use a different email.',
          [
            { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
            { text: 'Try Different Email', style: 'cancel' }
          ]
        );
        return;
      }
      
      // Email doesn't exist, proceed to password screen
      setChecking(false);
      navigation.navigate('SignupPassword', { email: email.trim() });
    } catch (err) {
      console.error('[SignupEmail] Error checking email:', err);
      setChecking(false);
      // On error, proceed anyway - will catch duplicate on actual signup
      navigation.navigate('SignupPassword', { email: email.trim() });
    }
  };

  return (
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
          <Ionicons name="arrow-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>What's your email?</Text>
          <Text style={styles.subtitle}>We'll send you a verification code</Text>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoFocus
            onSubmitEditing={handleContinue}
            returnKeyType="next"
          />
        </View>

        {/* Continue Button at Bottom */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.continueButton, (!email.trim() || !email.includes('@') || checking) && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!email.trim() || !email.includes('@') || checking}
          >
            {checking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
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
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 12,
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
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
