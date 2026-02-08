import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const insightLogo = require('../public/Insight-Logo-nobg.webp');

interface PremiumUpsellOverlayProps {
  visible: boolean;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export default function PremiumUpsellOverlay({ visible, onUpgrade, onDismiss }: PremiumUpsellOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpgrade();
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(10, 10, 10, 0.97)', 'rgba(26, 10, 46, 0.97)', 'rgba(10, 10, 10, 0.97)']}
          style={styles.gradient}
        />

        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Logo and Header */}
            <View style={styles.header}>
              <Image 
                source={insightLogo}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.title}>Unlock AI-Powered Insights</Text>
              <Text style={styles.subtitle}>
                Get daily AI analysis and personalized growth recommendations to track your emotional journey
              </Text>
            </View>

            {/* Premium Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                  <Ionicons name="sparkles" size={28} color="#a855f7" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Daily AI Analyses</Text>
                  <Text style={styles.featureDescription}>
                    Analyze up to 2 journal entries per day with deep AI insights
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(251, 191, 36, 0.2)' }]}>
                  <Ionicons name="analytics" size={28} color="#fbbf24" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Deep Pattern Detection</Text>
                  <Text style={styles.featureDescription}>
                    Discover hidden emotional patterns and recurring themes in your thoughts
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <Ionicons name="trending-up" size={28} color="#10b981" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Personalized Growth Plans</Text>
                  <Text style={styles.featureDescription}>
                    Receive tailored recommendations to help you grow and improve
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                  <Ionicons name="calendar" size={28} color="#ec4899" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Weekly Progress Summaries</Text>
                  <Text style={styles.featureDescription}>
                    Get comprehensive weekly insights tracking your emotional journey
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Ionicons name="bulb" size={28} color="#3b82f6" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Trigger Analysis</Text>
                  <Text style={styles.featureDescription}>
                    Identify what triggers your emotions and learn how to manage them
                  </Text>
                </View>
              </View>
            </View>

            {/* CTA Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgrade}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#a855f7', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.upgradeGradient}
                >
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.dismissButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
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
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: height * 0.85,
    backgroundColor: 'rgba(8, 8, 12, 0.98)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    overflow: 'hidden',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 12,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  featureDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 12,
  },
  upgradeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  dismissButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
