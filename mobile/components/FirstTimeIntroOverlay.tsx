import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const insightLogo = require('../public/Insight-Logo-nobg.webp');

interface FirstTimeIntroOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export default function FirstTimeIntroOverlay({ visible, onClose }: FirstTimeIntroOverlayProps) {
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(10, 10, 10, 0.95)', 'rgba(26, 10, 46, 0.95)', 'rgba(10, 10, 10, 0.95)']}
          style={styles.gradient}
        />

        <View style={styles.content}>
          {/* Welcome Header */}
          <View style={styles.header}>
            <Image 
              source={insightLogo}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome to Insight!</Text>
            <Text style={styles.subtitle}>
              Here's a quick overview of your new space for reflection and growth
            </Text>
          </View>

          {/* Feature Cards */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Ionicons name="create-outline" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Journal Your Thoughts</Text>
                <Text style={styles.featureDescription}>
                  Tap the + button to create entries and track your emotions
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="analytics-outline" size={24} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Track Your Progress</Text>
                <Text style={styles.featureDescription}>
                  View insights and patterns in your emotional journey
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="heart-outline" size={24} color="#3b82f6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Build Healthy Habits</Text>
                <Text style={styles.featureDescription}>
                  Access meditation, gratitude, and wellness tools
                </Text>
              </View>
            </View>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    width: width - 48,
    maxWidth: 400,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 20,
  },
  getStartedButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
