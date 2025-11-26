import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SunoGradient from '../../components/onboarding/SunoGradient';
import PlanCard from '../../components/onboarding/PlanCard';

export default function PaywallScreen({ navigation }: any) {

  const handleStartJourney = () => {
    // TODO: Implement purchase logic
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SunoGradient />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Join InsightAI</Text>
          <Text style={styles.subtitle}>
            Unlock clarity, growth, and daily insights.
          </Text>
        </View>

        {/* Pricing Card - single monthly plan matching Stripe (£5/month) */}
        <View style={styles.plansContainer}>
          <PlanCard
            title="Pro Monthly"
            price="£5.00"
            period="month"
            selected={true}
            popular={true}
            onPress={() => {}}
          />
        </View>

        {/* Free vs Pro Comparison */}
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonColumn}>
            <Text style={styles.comparisonTitle}>Free</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#6b7280" />
              <Text style={styles.featureText}>Daily journal</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#6b7280" />
              <Text style={styles.featureText}>Limited AI analysis</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="close-circle" size={18} color="#4b5563" />
              <Text style={[styles.featureText, styles.featureDisabled]}>No weekly insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="close-circle" size={18} color="#4b5563" />
              <Text style={[styles.featureText, styles.featureDisabled]}>No pattern tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="close-circle" size={18} color="#4b5563" />
              <Text style={[styles.featureText, styles.featureDisabled]}>No deep summaries</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="close-circle" size={18} color="#4b5563" />
              <Text style={[styles.featureText, styles.featureDisabled]}>No trigger detection</Text>
            </View>
          </View>

          <View style={styles.comparisonColumn}>
            <Text style={[styles.comparisonTitle, styles.proTitle]}>Pro</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Unlimited insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Weekly summaries</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Deep pattern detection</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Trigger analysis</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Personalized guidance</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Streak protection</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureTextPro}>Private processing</Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.9}
          onPress={handleStartJourney}
        >
          <LinearGradient
            colors={['#a855f7', '#8b5cf6', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Start your journey</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.footerLink}>Restore Purchases</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.footerLink}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.footerLink}>Privacy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#a1a1aa',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 32,
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  comparisonColumn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  proTitle: {
    color: '#10b981',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#9ca3af',
    flex: 1,
  },
  featureDisabled: {
    color: '#6b7280',
    opacity: 0.6,
  },
  featureTextPro: {
    fontSize: 13,
    color: '#e5e7eb',
    flex: 1,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 999,
    marginBottom: 24,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  ctaText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 20,
  },
  footerLink: {
    fontSize: 13,
    color: '#71717a',
    fontWeight: '500',
  },
  footerDivider: {
    fontSize: 13,
    color: '#52525b',
  },
});
