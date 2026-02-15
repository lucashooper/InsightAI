import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');
const bellIcon = require('../../public/onboarding-icons/BellIcon.webp');

const { width } = Dimensions.get('window');

interface NotificationsOnboardingScreenProps {
  navigation: any;
}

export default function NotificationsOnboardingScreen({ navigation }: NotificationsOnboardingScreenProps) {
  const handleAllowNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('[Notifications] Permission status:', status);
      
      // Navigate to value prop screen
      navigation.navigate('ValueProp');
    } catch (error) {
      console.error('[Notifications] Error requesting permissions:', error);
      // Still continue to value prop even if notification permission fails
      navigation.navigate('ValueProp');
    }
  };

  const handleSkip = async () => {
    // Navigate to value prop screen
    navigation.navigate('ValueProp');
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={28} color="#6b7280" />
      </TouchableOpacity>

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
      <Text style={styles.title}>Turn on notifications</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Get the most out of Insight by staying up to date with what's happening.
      </Text>

      {/* Allow Button */}
      <TouchableOpacity style={styles.allowButton} onPress={handleAllowNotifications}>
        <Text style={styles.allowButtonText}>Allow notifications</Text>
      </TouchableOpacity>

      {/* Skip */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip for now →</Text>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
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
