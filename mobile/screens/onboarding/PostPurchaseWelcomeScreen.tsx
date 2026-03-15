import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');

export default function PostPurchaseWelcomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('AuthSelection', { postPurchase: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isDarkTheme(theme.name) ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background }]} />
      ) : (
        <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
      )}
      <StatusBar barStyle={isDarkTheme(theme.name) ? 'light-content' : 'dark-content'} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <Image source={insightLogo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        {/* Welcome Text */}
        <Text style={[styles.title, isDarkTheme(theme.name) && { color: '#ffffff' }]}>Welcome to Insight</Text>
        <Text style={styles.subtitle}>You're all set with Pro</Text>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, isDarkTheme(theme.name) && { backgroundColor: 'rgba(168, 85, 247, 0.25)' }]}>
              <Ionicons name="sparkles" size={20} color="#a855f7" />
            </View>
            <Text style={[styles.featureText, isDarkTheme(theme.name) && { color: '#ffffff' }]}>AI-powered journal analysis</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, isDarkTheme(theme.name) && { backgroundColor: 'rgba(168, 85, 247, 0.25)' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#a855f7" />
            </View>
            <Text style={[styles.featureText, isDarkTheme(theme.name) && { color: '#ffffff' }]}>Private & encrypted entries</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, isDarkTheme(theme.name) && { backgroundColor: 'rgba(168, 85, 247, 0.25)' }]}>
              <Ionicons name="trending-up" size={20} color="#a855f7" />
            </View>
            <Text style={[styles.featureText, isDarkTheme(theme.name) && { color: '#ffffff' }]}>Track your growth over time</Text>
          </View>
        </View>

        {/* Info text */}
        <Text style={[styles.infoText, isDarkTheme(theme.name) && { color: 'rgba(255, 255, 255, 0.45)' }]}>
          Create an account to save your entries and access them across devices.
        </Text>
      </Animated.View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#a855f7', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7f2',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 160,
    height: 160,
    marginBottom: 40,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#a855f7',
    textAlign: 'center',
    marginBottom: 48,
  },
  features: {
    width: '100%',
    gap: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },
  infoText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.45)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
