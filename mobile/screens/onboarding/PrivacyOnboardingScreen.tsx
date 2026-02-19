import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');
const lockIcon = require('../../public/onboarding-icons/LockIcon2.webp');

const { width } = Dimensions.get('window');

interface PrivacyOnboardingScreenProps {
  navigation: any;
}

export default function PrivacyOnboardingScreen({ navigation }: PrivacyOnboardingScreenProps) {
  const handleContinue = () => {
    navigation.navigate('NotificationsOnboarding');
  };

  return (
    <View style={styles.container}>
      {/* Back Button - only show if can go back */}
      {navigation.canGoBack() && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#6b7280" />
        </TouchableOpacity>
      )}

      {/* Logo */}
      <Image source={insightLogo} style={styles.logo} />
      
      {/* Lock Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={lockIcon}
          style={styles.lockIcon}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Your notes are fully private</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        We use end-to-end encryption to keep your journal entries secure. Only you can read them.
      </Text>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <View style={styles.feature}>
          <Ionicons name="shield-checkmark" size={24} color="#8b5cf6" />
          <Text style={styles.featureText}>AES-256 encryption</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="key" size={24} color="#8b5cf6" />
          <Text style={styles.featureText}>Your password is the key</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="eye-off" size={24} color="#8b5cf6" />
          <Text style={styles.featureText}>We can't read your entries</Text>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7f2',
    paddingHorizontal: 24,
    paddingTop: 140,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    opacity: 0.9,
    position: 'absolute',
    top: 60,
  },
  iconContainer: {
    marginBottom: 0,
  },
  lockIcon: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  featureText: {
    fontSize: 16,
    color: '#1a1a2e',
    marginLeft: 16,
    fontWeight: '500',
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
  },
});
