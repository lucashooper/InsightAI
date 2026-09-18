import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import PrePaywallLayout from '../../components/onboarding/PrePaywallLayout';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getFirstName, getGoalFocusKey } from '../../utils/paywallPersonalization';
import { sf } from '../../utils/responsive';
import { safeGoBack } from '../../utils/navigationSafety';

const TESTFLIGHT_URL = 'https://testflight.apple.com/join/6DmaDpNf';

const PLAN_NODES = [
  { color: '#FF8A65', label: 'Plan Focus', value: 'Find Inner Clarity' },
  { color: '#AB7BFF', label: 'Coaching Style', value: 'Deeper Reflection' },
  { color: '#F4C15D', label: 'Growth Area', value: 'Realign Your Path' },
  { color: '#F48FB1', label: 'Future Feeling', value: 'Feel Steady and Clear' },
];

const FEATURES = [
  { emoji: '✨', color: '#F3E8FF', title: 'Personalised Wellbeing Plan', copy: '5 minutes a day to rewire your mindset' },
  { emoji: '🔮', color: '#EDE7FF', title: 'AI Insights', copy: 'Uncover surprising patterns about you' },
  { emoji: '📊', color: '#E7F3FF', title: 'Mood Dashboard', copy: 'Keep track of your progress' },
  { emoji: '🎙️', color: '#E8F8F2', title: 'Longer Conversations', copy: 'Talk it through until it lands' },
];

export default function PaywallPersonalizedScreen({ navigation }: any) {
  const { userName, onboardingAnswers } = useOnboarding();
  const { t } = useLanguage();
  const firstName = getFirstName(userName);
  const goalKey = getGoalFocusKey(onboardingAnswers);

  const title = firstName
    ? `${firstName}, your plan is ready`
    : t('onboarding.prePaywall.personalized.titleGeneric');

  return (
    <PrePaywallLayout
      step={0}
      ctaLabel="Get Started"
      onContinue={() => navigation.navigate('PaywallBenefits')}
      onBack={() => safeGoBack(navigation)}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {t(`onboarding.prePaywall.personalized.focus.${goalKey}`)}
      </Text>

      <View style={styles.planCard}>
        {PLAN_NODES.map((node, i) => (
          <View key={node.label} style={styles.nodeRow}>
            <View style={styles.nodeRail}>
              <View style={[styles.nodeDot, { backgroundColor: node.color }]} />
              {i < PLAN_NODES.length - 1 ? <View style={styles.nodeLine} /> : null}
            </View>
            <View style={styles.nodeCopy}>
              <Text style={styles.nodeLabel}>{node.label}</Text>
              <Text style={styles.nodeValue}>{node.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.features}>
        {FEATURES.map((item) => (
          <View key={item.title} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: item.color }]}>
              <Text style={styles.featureEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureHint}>{item.copy}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.beta} onPress={() => Linking.openURL(TESTFLIGHT_URL)}>
        Join TestFlight Beta
      </Text>
      <Text style={styles.soon}>App launching soon on the App Store</Text>
    </PrePaywallLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: sf(26),
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: sf(34),
    marginBottom: 8,
  },
  subtitle: {
    fontSize: sf(16),
    color: '#3d3d5c',
    textAlign: 'center',
    lineHeight: sf(24),
    paddingHorizontal: 8,
    marginBottom: 22,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: 'rgba(80, 90, 140, 0.16)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 3,
  },
  features: {
    marginTop: 18,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  featureHint: {
    fontSize: 12,
    color: '#8A8798',
    marginTop: 1,
  },
  nodeRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  nodeRail: {
    width: 28,
    alignItems: 'center',
  },
  nodeDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginTop: 2,
  },
  nodeLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E6E4F0',
    marginVertical: 4,
  },
  nodeCopy: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 12,
  },
  nodeLabel: {
    fontSize: 12,
    color: '#8A8798',
  },
  nodeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 2,
  },
  beta: {
    marginTop: 18,
    textAlign: 'center',
    color: '#7B5EA7',
    fontSize: 14,
    fontWeight: '700',
  },
  soon: {
    marginTop: 4,
    textAlign: 'center',
    color: '#8A8798',
    fontSize: 12,
    fontWeight: '500',
  },
});
