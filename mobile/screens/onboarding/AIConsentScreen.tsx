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

interface AIConsentScreenProps {
  onConsent: (granted: boolean) => void;
  onSkip?: () => void;
}

export default function AIConsentScreen({ onConsent, onSkip }: AIConsentScreenProps) {
  const { theme } = useTheme();
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
          Enable AI Analysis?
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
          Get personalized insights from your journal entries using AI technology
        </Text>

        {/* What we send section */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.infoTitle, { color: theme.colors.primaryText }]}>
              What data is sent
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.colors.secondaryText }]}>
            When you tap "Analyze" on a journal entry, we send the text content to our AI service for analysis.
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                Your journal entry text
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                No personal identifiers (name, email, etc.)
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                Only when you tap the "Analyze" button
              </Text>
            </View>
          </View>
        </View>

        {/* Who receives it section */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="business-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.infoTitle, { color: theme.colors.primaryText }]}>
              Who receives your data
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.colors.secondaryText }]}>
            We use <Text style={{ fontWeight: '600' }}>Groq</Text> (an AI infrastructure company) running the <Text style={{ fontWeight: '600' }}>Llama 3</Text> language model to analyze your journal entries.
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.secondaryText, marginTop: 8 }]}>
            Groq processes your data according to their privacy policy and does not use your data to train AI models.
          </Text>
        </View>

        {/* How it's protected section */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.infoTitle, { color: theme.colors.primaryText }]}>
              How your data is protected
            </Text>
          </View>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                All data is encrypted in transit (HTTPS/TLS)
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                Your entries are stored securely in your private database
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                You can revoke consent anytime in Settings
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                AI features are optional — you can journal without them
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy notice */}
        <Text style={[styles.privacyNotice, { color: theme.colors.tertiaryText }]}>
          By accepting, you consent to sending your journal entry text to Groq for AI analysis when you tap "Analyze". 
          See our Privacy Policy for complete details.
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
              Decline
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
            <Text style={styles.acceptButtonText}>Accept & Continue</Text>
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
