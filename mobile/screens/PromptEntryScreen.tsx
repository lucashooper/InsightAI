import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { usePreloadedData } from '../contexts/PreloadContext';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { EncryptionService } from '../services/encryptionService';
import { shouldEncryptJournalForUser } from '../utils/journalEncryption';
import { sf } from '../utils/responsive';
import { useLanguage } from '../contexts/LanguageContext';
import { formatJournalPromptContent } from '../constants/branding';
import AppBackdrop from '../components/ui/AppBackdrop';
import GlassCard from '../components/ui/GlassCard';
import { PREMIUM } from '../constants/premiumUI';
import PromptSavedOverlay from '../components/prompt/PromptSavedOverlay';
import { markPromptCompletedToday } from '../utils/promptCompletion';
import { useSpeechToText } from '../hooks/useSpeechToText';

export default function PromptEntryScreen({ navigation, route }: any) {
  const { promptText } = route?.params || {};
  const { user } = useAuth();
  const { refreshNotes } = usePreloadedData();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const isDark = isDarkTheme(theme.name);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedOverlay, setShowSavedOverlay] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const { isRecording, toggleRecording } = useSpeechToText({
    locale: 'en-US',
    onTranscript: setContent,
    getBaseText: () => content,
    t,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSave = async () => {
    if (!content.trim()) return;
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const useEncryption = await shouldEncryptJournalForUser(user.id);
      const encryptionKey = useEncryption
        ? await EncryptionService.getKey(user.id)
        : null;
      const fullContent = formatJournalPromptContent(promptText, content.trim());
      const contentToSave = encryptionKey
        ? await EncryptionService.encrypt(fullContent, encryptionKey)
        : fullContent;

      const firstLine = content.trim().split('\n')[0];
      const autoTitle = firstLine.length > 50
        ? firstLine.substring(0, 47) + '...'
        : firstLine;

      const now = new Date().toISOString();
      const baseRow = {
        user_id: user.id,
        title: autoTitle || t('auxiliary.promptEntry.defaultTitle'),
        content: contentToSave,
        is_encrypted: !!encryptionKey,
        created_at: now,
        updated_at: now,
      };

      const isMissingColumnError = (err: { message?: string; details?: string; code?: string } | null) => {
        const blob = `${err?.message ?? ''} ${err?.details ?? ''}`.toLowerCase();
        return (
          err?.code === 'PGRST204'
          || blob.includes('entry_type')
          || blob.includes('prompt_text')
          || blob.includes('could not find')
          || blob.includes('column')
        );
      };

      let { error } = await supabase
        .from('notes')
        .insert({ ...baseRow, entry_type: 'prompt', prompt_text: promptText ?? null })
        .select()
        .single();

      if (error && isMissingColumnError(error)) {
        ({ error } = await supabase.from('notes').insert(baseRow).select().single());
      }

      if (error) throw error;

      await refreshNotes(user.id, { force: true });
      await markPromptCompletedToday();
      setShowSavedOverlay(true);
    } catch (error: any) {
      console.error('Error saving prompt entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const footerBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 20 : 12);

  return (
    <View style={styles.container}>
      <AppBackdrop />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton} activeOpacity={0.8}>
            <Ionicons name="close" size={26} color={isDark ? '#ffffff' : '#1a1a1a'} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: footerBottom + 96 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <GlassCard style={styles.badgeCard} noPad contentStyle={styles.promptBadgeInner}>
              <Ionicons name="sparkles" size={16} color={isDark ? '#c4b5fd' : '#7c3aed'} />
              <Text style={[styles.promptBadgeText, { color: theme.colors.primaryText }]}>
                {t('auxiliary.promptEntry.todayPrompt')}
              </Text>
            </GlassCard>

            <GlassCard style={styles.promptCard} noPad contentStyle={styles.promptCardInner}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={28}
                color={isDark ? 'rgba(167,139,250,0.45)' : 'rgba(124,58,237,0.35)'}
                style={styles.quoteIcon}
              />
              <Text style={[styles.promptText, { color: theme.colors.primaryText }]}>{promptText}</Text>
            </GlassCard>

            <Text style={[styles.writingLabel, { color: theme.colors.secondaryText }]}>
              {t('auxiliary.promptEntry.yourReflection')}
            </Text>

            <GlassCard style={styles.writingCard} noPad contentStyle={styles.writingCardInner}>
              <TextInput
                style={[styles.textInput, { color: theme.colors.primaryText }]}
                placeholder={t('auxiliary.promptEntry.placeholder')}
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)'}
                multiline
                value={content}
                onChangeText={setContent}
                autoFocus
                textAlignVertical="top"
              />
            </GlassCard>

            {content.length > 0 && (
              <Text style={[styles.characterCount, { color: theme.colors.tertiaryText }]}>
                {t(content.length === 1 ? 'auxiliary.promptEntry.character' : 'auxiliary.promptEntry.characters', { count: content.length })}
              </Text>
            )}
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: footerBottom }]}>
          <TouchableOpacity
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            onPress={toggleRecording}
            activeOpacity={0.85}
          >
            <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={22} color={isRecording ? '#ef4444' : '#c4b5fd'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, !content.trim() && styles.saveButtonDisabled, styles.saveButtonFlex]}
            onPress={handleSave}
            disabled={!content.trim() || isSaving}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={content.trim() ? ['#8b5cf6', '#7c3aed'] : ['#6b7280', '#4b5563']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isSaving ? (
                <Text style={styles.saveButtonText}>{t('auxiliary.common.saving')}</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#ffffff" />
                  <Text style={styles.saveButtonText}>{t('auxiliary.promptEntry.saveReflection')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <PromptSavedOverlay
        visible={showSavedOverlay}
        title={t('auxiliary.promptEntry.completedTitle')}
        message={t('auxiliary.promptEntry.completedMessage')}
        buttonLabel={t('auxiliary.promptEntry.continue')}
        onContinue={() => {
          setShowSavedOverlay(false);
          navigation.goBack();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: PREMIUM.layout.screenPadH,
    paddingBottom: 8,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  scrollContent: {
    paddingHorizontal: PREMIUM.layout.screenPadH,
    paddingTop: 8,
  },
  contentContainer: {
    gap: 16,
  },
  badgeCard: {
    alignSelf: 'flex-start',
  },
  promptBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  promptBadgeText: {
    fontSize: sf(13),
    fontWeight: '600',
  },
  promptCard: {
    marginTop: 4,
  },
  promptCardInner: {
    padding: 22,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  promptText: {
    fontSize: sf(20),
    fontWeight: '600',
    lineHeight: sf(28),
    letterSpacing: -0.3,
    paddingRight: 36,
  },
  writingLabel: {
    fontSize: sf(15),
    fontWeight: '600',
    letterSpacing: -0.2,
    marginTop: 4,
    marginLeft: 4,
  },
  writingCard: {
    minHeight: 220,
  },
  writingCardInner: {
    padding: 4,
    minHeight: 220,
  },
  textInput: {
    fontSize: sf(16),
    lineHeight: sf(24),
    minHeight: 200,
    padding: 16,
  },
  characterCount: {
    fontSize: sf(13),
    textAlign: 'right',
    marginRight: 4,
  },
  footer: {
    paddingHorizontal: PREMIUM.layout.screenPadH,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voiceButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  voiceButtonActive: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.35)',
  },
  saveButtonFlex: {
    flex: 1,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 8,
  },
  saveButtonText: {
    fontSize: sf(17),
    fontWeight: '700',
    letterSpacing: -0.3,
    color: '#ffffff',
  },
});
