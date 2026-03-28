import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');
const bellIcon = require('../../public/onboarding-icons/BellIcon.webp');

const { width } = Dimensions.get('window');

interface NotificationsOnboardingScreenProps {
  navigation: any;
}

export default function NotificationsOnboardingScreen({ navigation }: NotificationsOnboardingScreenProps) {
  const { theme } = useTheme();
  const { userName } = useOnboarding();

  React.useEffect(() => {
    analytics.trackOnboardingScreen('notifications', 'viewed', userName || undefined);
  }, []);
  
  const handleAllowNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('[Notifications] Permission status:', status);
      analytics.trackOnboardingScreen('notifications', 'completed', userName || undefined);
      
      // Navigate to paywall screen
      navigation.navigate('RateUs');
    } catch (error) {
      console.error('[Notifications] Error requesting permissions:', error);
      analytics.trackOnboardingScreen('notifications', 'completed', userName || undefined);
      navigation.navigate('RateUs');
    }
  };

  const handleSkip = async () => {
    analytics.trackOnboardingScreen('notifications', 'skipped', userName || undefined);
    navigation.navigate('RateUs');
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
      
      {/* Bell Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={bellIcon}
          style={styles.bellIcon}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>Turn on notifications</Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>
        Get the most out of Insight by staying up to date with what's happening.
      </Text>

      {/* Allow Button */}
      <TouchableOpacity style={[styles.allowButton, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : '#fff', borderColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} onPress={handleAllowNotifications}>
        <Text style={[styles.allowButtonText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#000' }]}>Allow notifications</Text>
      </TouchableOpacity>

      {/* Skip */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={[styles.skipText, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.5)' : 'rgba(0, 0, 0, 0.5)' }]}>Skip for now →</Text>
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
    justifyContent: 'center',
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
    marginBottom: 60,
    opacity: 0.9,
    position: 'absolute',
    top: 60,
  },
  iconContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  bellIcon: {
    width: 280,
    height: 280,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 48,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  allowButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: '#fff',
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  allowButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
  },
});
