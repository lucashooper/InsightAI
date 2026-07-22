import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrePaywallLayout from '../../components/onboarding/PrePaywallLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTablet, sf } from '../../utils/responsive';

const BENEFIT_KEYS = ['emotions', 'habit', 'steps', 'mira'] as const;
const BENEFIT_ICONS: Record<(typeof BENEFIT_KEYS)[number], keyof typeof Ionicons.glyphMap> = {
  emotions: 'bulb-outline',
  habit: 'calendar-outline',
  steps: 'trending-up-outline',
  mira: 'chatbubble-ellipses-outline',
};
const BENEFIT_COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#f472b6'];

export default function PaywallBenefitsScreen({ navigation }: any) {
  const { t } = useLanguage();

  return (
    <PrePaywallLayout
      step={1}
      onContinue={() => navigation.navigate('PaywallTestimonial')}
      onBack={() => navigation.goBack()}
    >
      <Text style={styles.eyebrow}>{t('onboarding.prePaywall.benefits.eyebrow')}</Text>
      <Text style={styles.title}>{t('onboarding.prePaywall.benefits.title')}</Text>

      <View style={styles.list}>
        {BENEFIT_KEYS.map((key, index) => (
          <View key={key} style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: `${BENEFIT_COLORS[index]}22` }]}>
              <Ionicons name={BENEFIT_ICONS[key]} size={22} color={BENEFIT_COLORS[index]} />
            </View>
            <Text style={styles.rowText}>{t(`onboarding.prePaywall.benefits.items.${key}`)}</Text>
          </View>
        ))}
      </View>
    </PrePaywallLayout>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: sf(13),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  title: {
    fontSize: sf(28),
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: sf(36),
    marginBottom: isTablet ? 36 : 28,
  },
  list: {
    gap: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    fontSize: sf(16),
    color: 'rgba(255,255,255,0.9)',
    lineHeight: sf(24),
    fontWeight: '500',
    paddingTop: 8,
  },
});
