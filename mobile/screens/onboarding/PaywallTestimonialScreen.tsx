import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrePaywallLayout from '../../components/onboarding/PrePaywallLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTablet, sf } from '../../utils/responsive';

export default function PaywallTestimonialScreen({ navigation }: any) {
  const { t } = useLanguage();

  return (
    <PrePaywallLayout
      step={2}
      ctaLabel={t('onboarding.prePaywall.testimonial.cta')}
      onContinue={() => navigation.navigate('Paywall')}
      onBack={() => navigation.goBack()}
    >
      <Text style={styles.title}>{t('onboarding.prePaywall.testimonial.title')}</Text>

      <View style={styles.card}>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons key={star} name="star" size={18} color="#fbbf24" />
          ))}
        </View>
        <Text style={styles.quote}>“{t('onboarding.prePaywall.testimonial.quote')}”</Text>
        <Text style={styles.author}>{t('onboarding.prePaywall.testimonial.author')}</Text>
      </View>
    </PrePaywallLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: sf(26),
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: sf(34),
    marginBottom: isTablet ? 32 : 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: isTablet ? 28 : 22,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
  },
  quote: {
    fontSize: sf(16),
    color: 'rgba(255,255,255,0.92)',
    lineHeight: sf(25),
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 14,
  },
  author: {
    fontSize: sf(14),
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textAlign: 'center',
  },
});
