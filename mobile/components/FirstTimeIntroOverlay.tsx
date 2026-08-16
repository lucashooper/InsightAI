import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import CachedImage from './shared/CachedImage';
import { INSIGHT_LOGO } from '../constants/appAssets';
import { useLanguage } from '../contexts/LanguageContext';
import { PREMIUM, TYPE } from '../constants/premiumUI';

const { width } = Dimensions.get('window');

interface FirstTimeIntroOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const FEATURES = [
  { icon: 'create-outline' as const, titleKey: 'journalTitle', descKey: 'journalDescription' },
  { icon: 'analytics-outline' as const, titleKey: 'progressTitle', descKey: 'progressDescription' },
  { icon: 'heart-outline' as const, titleKey: 'habitsTitle', descKey: 'habitsDescription' },
];

export default function FirstTimeIntroOverlay({ visible, onClose }: FirstTimeIntroOverlayProps) {
  const { t } = useLanguage();
  const confettiRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        confettiRef.current?.start();
      }, 300);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

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

        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: width / 2, y: -10 }}
          fadeOut
          autoStart={false}
          colors={['#8b5cf6', '#a855f7', '#c084fc', '#e9d5ff', '#fbbf24']}
        />

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <CachedImage
              source={INSIGHT_LOGO}
              style={styles.logoImage}
              contentFit="contain"
              recyclingKey="first-time-intro-logo"
            />
            <Text style={styles.title}>{t('components.intro.title')}</Text>
            <Text style={styles.subtitle}>{t('components.intro.subtitle')}</Text>
          </View>

          <View style={styles.featuresContainer}>
            {FEATURES.map((f) => (
              <View key={f.titleKey} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon} size={22} color="#FFFFFF" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{t(`components.intro.${f.titleKey}`)}</Text>
                  <Text style={styles.featureDescription}>
                    {t(`components.intro.${f.descKey}`)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>{t('components.intro.getStarted')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
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
    paddingHorizontal: PREMIUM.layout.screenPadH,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(18, 18, 22, 0.92)',
    borderRadius: PREMIUM.radius.xl,
    padding: PREMIUM.space[4],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PREMIUM.glass.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: PREMIUM.space[4],
  },
  logoImage: {
    width: 96,
    height: 96,
    marginBottom: PREMIUM.space[1],
  },
  title: {
    ...TYPE.heading,
    color: PREMIUM.text.primary,
    marginBottom: PREMIUM.space[1],
    textAlign: 'center',
  },
  subtitle: {
    ...TYPE.body,
    color: PREMIUM.text.tertiary,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: PREMIUM.space[2],
    marginBottom: PREMIUM.space[4],
    alignSelf: 'stretch',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PREMIUM.space[2],
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PREMIUM.glass.fillElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PREMIUM.glass.border,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...TYPE.cardTitle,
    color: PREMIUM.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    ...TYPE.caption,
    color: PREMIUM.text.muted,
  },
  getStartedButton: {
    borderRadius: PREMIUM.radius.button,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  buttonInner: {
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
