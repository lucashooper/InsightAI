import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import PrePaywallLayout from '../../components/onboarding/PrePaywallLayout';
import CachedImage from '../../components/shared/CachedImage';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTablet, sf } from '../../utils/responsive';
import { FAB_MENU_BACKGROUNDS } from '../../constants/fabMenuAssets';
import { ONBOARDING_TEXT } from '../../constants/onboardingTheme';

const BENEFIT_KEYS = ['emotions', 'habit', 'steps', 'mira'] as const;
const BENEFIT_ICONS: Record<(typeof BENEFIT_KEYS)[number], keyof typeof Ionicons.glyphMap> = {
  emotions: 'bulb-outline',
  habit: 'calendar-outline',
  steps: 'trending-up-outline',
  mira: 'chatbubble-ellipses-outline',
};

const BENEFIT_BACKGROUNDS: Record<(typeof BENEFIT_KEYS)[number], number> = {
  emotions: FAB_MENU_BACKGROUNDS.aiChat,
  habit: FAB_MENU_BACKGROUNDS.journal,
  steps: FAB_MENU_BACKGROUNDS.checkIn,
  mira: FAB_MENU_BACKGROUNDS.playbook,
};

function BenefitGlassRow({
  icon,
  text,
  background,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  background: number;
}) {
  return (
    <View style={styles.rowOuter}>
      <View style={styles.rowBg}>
        <CachedImage
          source={background}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          recyclingKey={`paywall-benefit-${icon}`}
        />
        <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(13,11,24,0.55)', 'rgba(13,11,24,0.82)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.rowContent}>
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.rowText}>{text}</Text>
        </View>
      </View>
    </View>
  );
}

export default function PaywallBenefitsScreen({ navigation }: any) {
  const { t } = useLanguage();

  return (
    <PrePaywallLayout
      step={1}
      ctaLabel={t('onboarding.prePaywall.testimonial.cta')}
      onContinue={() => navigation.navigate('Paywall')}
      onBack={() => navigation.goBack()}
    >
      <Text style={styles.eyebrow}>{t('onboarding.prePaywall.benefits.eyebrow')}</Text>
      <Text style={styles.title}>{t('onboarding.prePaywall.benefits.title')}</Text>

      <View style={styles.list}>
        {BENEFIT_KEYS.map((key) => (
          <BenefitGlassRow
            key={key}
            icon={BENEFIT_ICONS[key]}
            background={BENEFIT_BACKGROUNDS[key]}
            text={t(`onboarding.prePaywall.benefits.items.${key}`)}
          />
        ))}
      </View>
    </PrePaywallLayout>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: sf(13),
    fontWeight: '600',
    color: ONBOARDING_TEXT.secondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  title: {
    fontSize: sf(28),
    fontWeight: '700',
    color: ONBOARDING_TEXT.primary,
    textAlign: 'center',
    letterSpacing: -1.28,
    lineHeight: sf(36),
    marginBottom: isTablet ? 36 : 28,
  },
  list: {
    gap: 14,
  },
  rowOuter: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  rowBg: {
    minHeight: 88,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(123, 94, 167, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(123, 94, 167, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    fontSize: sf(16),
    color: 'rgba(255,255,255,0.94)',
    lineHeight: sf(24),
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
