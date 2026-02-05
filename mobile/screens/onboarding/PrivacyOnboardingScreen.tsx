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
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingTop: 140,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    opacity: 0.9,
    position: 'absolute',
    top: 60,
  },
  iconContainer: {
    marginBottom: 8,
  },
  lockIcon: {
    width: 240,
    height: 240,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
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
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});
