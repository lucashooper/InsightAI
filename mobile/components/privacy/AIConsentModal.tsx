import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { updateAIConsent } from '../../services/aiConsentService';
import { sf } from '../../utils/responsive';

type Props = {
  visible: boolean;
  onClose: (granted: boolean) => void;
};

export default function AIConsentModal({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const dark = isDarkTheme(theme.name);

  const handleChoice = async (granted: boolean) => {
    setSaving(true);
    try {
      await updateAIConsent(granted);
      onClose(granted);
    } catch {
      onClose(granted);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onClose(false)}>
      <Pressable style={styles.backdrop} onPress={() => !saving && onClose(false)}>
        <BlurView intensity={dark ? 40 : 60} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      </Pressable>

      <View style={styles.centered} pointerEvents="box-none">
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="shield-checkmark" size={32} color={theme.colors.primary} />
          </View>

          <Text style={[styles.title, { color: theme.colors.primaryText }]}>
            {t('privacy.aiConsentModal.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
            {t('privacy.aiConsentModal.subtitle')}
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                {t('privacy.aiConsentModal.encrypted')}
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Ionicons name="toggle-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.bulletText, { color: theme.colors.secondaryText }]}>
                {t('privacy.aiConsentModal.optional')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => handleChoice(true)}
            disabled={saving}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.primaryGradient}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>{t('privacy.aiConsentModal.agree')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: theme.colors.border }]}
            onPress={() => handleChoice(false)}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryText, { color: theme.colors.secondaryText }]}>
              {t('privacy.aiConsentModal.optOut')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: sf(22),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: sf(15),
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  bulletList: {
    gap: 14,
    marginBottom: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: sf(14),
    lineHeight: 20,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  primaryGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: sf(16),
    fontWeight: '600',
  },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: sf(15),
    fontWeight: '600',
  },
});
