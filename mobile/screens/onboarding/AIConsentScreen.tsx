import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface AIConsentScreenProps {
  onConsent: (granted: boolean) => void;
  onSkip?: () => void;
}

export default function AIConsentScreen({ onConsent, onSkip }: AIConsentScreenProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);

  const handleAccept = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('user_profiles')
          .update({ ai_consent_granted: true, ai_consent_date: new Date().toISOString() })
          .eq('user_id', session.user.id);
      }
      onConsent(true);
    } catch (error) {
      console.error('Error saving AI consent:', error);
      onConsent(true); // Still allow them to proceed
    } finally {
      setSaving(false);
    }
  };

  const handleDecline = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('user_profiles')
          .update({ ai_consent_granted: false, ai_consent_date: new Date().toISOString() })
          .eq('user_id', session.user.id);
      }
      onConsent(false);
    } catch (error) {
      console.error('Error saving AI consent:', error);
      onConsent(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.backgroundGradient as any}
        style={styles.backgroundGradient}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.primaryText }]}>
          {t('onboarding.aiConsent.title')}
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
          {t('onboarding.aiConsent.subtitle')}
        </Text>

        {/* What we send section */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.infoTitle, { color: theme.colors.primaryText }]}>
              {t('onboarding.aiConsent.dataTitle')}
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.colors.secondaryText }]}>
            {t('onboarding.aiConsent.dataBody')}
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                {t('onboarding.aiConsent.entryText')}
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                {t('onboarding.aiConsent.noIdentifiers')}
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                {t('onboarding.aiConsent.analyzeOnly')}
              </Text>
            </View>
          </View>
        </View>

        {/* Who receives it section */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="business-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.infoTitle, { color: theme.colors.primaryText }]}>
              {t('onboarding.aiConsent.recipientTitle')}
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.colors.secondaryText }]}>
            {t('onboarding.aiConsent.recipientIntro')}
            <Text style={{ fontWeight: '600' }}>{t('onboarding.aiConsent.providerName')}</Text>
            {t('onboarding.aiConsent.recipientCompany')}
            <Text style={{ fontWeight: '600' }}>{t('onboarding.aiConsent.modelName')}</Text>
            {t('onboarding.aiConsent.recipientModelTail')}
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.secondaryText, marginTop: 8 }]}>
            {t('onboarding.aiConsent.recipientPrivacy')}
          </Text>
        </View>

        {/* How it's protected section */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.infoTitle, { color: theme.colors.primaryText }]}>
              {t('onboarding.aiConsent.protectionTitle')}
            </Text>
          </View>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                {t('onboarding.aiConsent.encrypted')}
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                {t('onboarding.aiConsent.secureStorage')}
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                {t('onboarding.aiConsent.revoke')}
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                {t('onboarding.aiConsent.optional')}
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy notice */}
        <Text style={[styles.privacyNotice, { color: theme.colors.tertiaryText }]}>
          {t('onboarding.aiConsent.notice')}
        </Text>
      </ScrollView>

      {/* Action buttons */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.declineButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={handleDecline}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.secondaryText} />
          ) : (
            <Text style={[styles.declineButtonText, { color: theme.colors.secondaryText }]}>
              {t('onboarding.aiConsent.decline')}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAccept}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.acceptButtonText}>{t('onboarding.aiConsent.accept')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bulletList: {
    marginTop: 12,
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    fontSize: 20,
    lineHeight: 22,
    marginTop: -2,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  privacyNotice: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  declineButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
