import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');
const lockIcon = require('../../public/onboarding-icons/LockIcon2.webp');

// Preload icons to prevent janky late-loading
Asset.fromModule(insightLogo).downloadAsync();
Asset.fromModule(lockIcon).downloadAsync();

const { width } = Dimensions.get('window');

interface PrivacyOnboardingScreenProps {
  navigation: any;
}

export default function PrivacyOnboardingScreen({ navigation }: PrivacyOnboardingScreenProps) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const handleContinue = () => {
    navigation.navigate('NotificationsOnboarding');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isDarkTheme(theme.name) ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
      ) : (
        <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
      )}
      
      {/* Back Button - Circular style matching other onboarding pages */}
      {navigation.canGoBack() && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={[styles.backArrowCircle, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Ionicons name="arrow-back" size={20} color={isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e'} />
          </View>
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

      {/* Animated content below lock icon */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%', alignItems: 'center' }}>
      {/* Title */}
      <Text style={[styles.title, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>Your notes are fully private</Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>
        We use end-to-end encryption to keep your journal entries secure. Only you can read them.
      </Text>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <View style={[styles.feature, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.5)', borderColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
          <Ionicons name="shield-checkmark" size={24} color="#8b5cf6" />
          <Text style={[styles.featureText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>AES-256 encryption</Text>
        </View>
        <View style={[styles.feature, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.5)', borderColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
          <Ionicons name="key" size={24} color="#8b5cf6" />
          <Text style={[styles.featureText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>Your password is the key</Text>
        </View>
        <View style={[styles.feature, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.5)', borderColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
          <Ionicons name="eye-off" size={24} color="#8b5cf6" />
          <Text style={[styles.featureText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>We can't read your entries</Text>
        </View>
      </View>
      </Animated.View>

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
    justifyContent: 'space-between',
    paddingBottom: 60,
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
    marginBottom: 8,
    marginTop: 20,
  },
  lockIcon: {
    width: 220,
    height: 220,
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
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 'auto',
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
    paddingVertical: 18,
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
    alignItems: 'center',
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
