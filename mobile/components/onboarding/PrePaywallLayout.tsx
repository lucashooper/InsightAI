import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AuroraOrb from '../shared/AuroraOrb';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';
import { useLanguage } from '../../contexts/LanguageContext';

type Props = {
  step: 0 | 1 | 2;
  onContinue: () => void;
  children: React.ReactNode;
  ctaLabel?: string;
  showBack?: boolean;
  onBack?: () => void;
};

export default function PrePaywallLayout({
  step,
  onContinue,
  children,
  ctaLabel,
  showBack = true,
  onBack,
}: Props) {
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [step, fadeAnim, slideAnim]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onContinue();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0c0c14', '#08080d', '#050508']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.orbWrap} pointerEvents="none">
        <AuroraOrb size={isTablet ? 340 : 300} isDark animate />
      </View>

      <StatusBar barStyle="light-content" />

      {showBack && onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <View style={styles.backArrowCircle}>
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </View>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {children}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.progressRow}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[styles.progressDot, step === index && styles.progressDotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={handleContinue} activeOpacity={0.9}>
          <Text style={styles.ctaText}>{ctaLabel ?? t('common.continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08080d',
  },
  orbWrap: {
    position: 'absolute',
    top: isTablet ? 40 : 20,
    alignSelf: 'center',
    opacity: 0.85,
  },
  backButton: {
    position: 'absolute',
    top: isTablet ? 60 : 50,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isTablet ? 64 : 28,
    paddingTop: isTablet ? 120 : 100,
    paddingBottom: 24,
    justifyContent: 'center',
    ...(iPadContentStyle as object),
  },
  footer: {
    paddingHorizontal: isTablet ? 64 : 28,
    paddingBottom: isTablet ? 56 : 44,
    gap: 16,
    ...(iPadContentStyle as object),
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  progressDotActive: {
    width: 22,
    backgroundColor: '#a855f7',
  },
  ctaButton: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    fontSize: sf(17),
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: 0.2,
  },
});
