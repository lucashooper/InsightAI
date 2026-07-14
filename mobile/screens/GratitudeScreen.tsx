import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export default function GratitudeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const gratitudePrompts = [
    t('auxiliary.gratitude.promptSmile'),
    t('auxiliary.gratitude.promptPerson'),
    t('auxiliary.gratitude.promptJoy'),
  ];
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [responses, setResponses] = useState(['', '', '']);
  const [saving, setSaving] = useState(false);

  const handleResponseChange = (text: string) => {
    const newResponses = [...responses];
    newResponses[currentPrompt] = text;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentPrompt < 2) {
      setCurrentPrompt(currentPrompt + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPrompt > 0) {
      setCurrentPrompt(currentPrompt - 1);
    }
  };

  const handleComplete = async () => {
    const allResponses = responses.filter(r => r.trim().length > 0);
    
    if (allResponses.length === 0) {
      Alert.alert(t('auxiliary.gratitude.noResponses'), t('auxiliary.gratitude.noResponsesMessage'));
      return;
    }

    setSaving(true);
    try {
      // Format with better typography and structure
      const gratitudeEntry = `🙏 ${t('auxiliary.gratitude.title')}\n\n${gratitudePrompts.map((prompt, i) => {
        if (!responses[i].trim()) return '';
        return `✨ ${t('auxiliary.gratitude.insight')}: ${prompt}\n\n${responses[i].trim()}\n\n---\n`;
      }).filter(Boolean).join('\n')}`;

      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: user?.id,
          title: t('auxiliary.gratitude.title'),
          content: gratitudeEntry.trim(),
          mood: '🙏',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert(t('auxiliary.common.saved'), t('auxiliary.gratitude.savedMessage'), [
        { text: t('auxiliary.common.ok'), onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('[Gratitude] Error saving gratitude:', error);
      console.error('[Gratitude] Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error?.message || error?.code || t('auxiliary.common.unknownError');
      Alert.alert(t('auxiliary.common.error'), t('auxiliary.gratitude.saveFailed', { error: errorMessage }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.colors.backgroundGradient as any}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.7)' : '#1a1a1a'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}>{t('auxiliary.gratitude.title')}</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('GratitudeHistory')} 
          style={styles.historyButton}
        >
          <Ionicons name="time-outline" size={24} color={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.9)' : '#1a1a1a'} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentPrompt && styles.progressDotActive,
                  index < currentPrompt && styles.progressDotComplete,
                ]}
              />
            ))}
          </View>

          {/* Prompt */}
          <View style={styles.promptContainer}>
            <Text style={[styles.promptNumber, { color: isDarkTheme(theme.name) ? 'rgba(139, 92, 246, 0.8)' : '#8b5cf6' }]}>{t('auxiliary.gratitude.progress', { current: currentPrompt + 1, total: 3 })}</Text>
            <Text style={[styles.promptText, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}>{gratitudePrompts[currentPrompt]}</Text>
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}
              value={responses[currentPrompt]}
              onChangeText={handleResponseChange}
              placeholder={t('auxiliary.gratitude.placeholder')}
              placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
              multiline
              textAlignVertical="top"
              autoFocus={false}
            />
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentPrompt > 0 && (
              <TouchableOpacity onPress={handlePrevious} style={styles.navButton}>
                <Text style={styles.navButtonText}>{t('auxiliary.common.previous')}</Text>
              </TouchableOpacity>
            )}
            
            {currentPrompt < 2 ? (
              <TouchableOpacity 
                onPress={handleNext} 
                style={[styles.navButton, styles.navButtonPrimary]}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.navButtonGradient}
                >
                  <Text style={styles.navButtonTextPrimary}>{t('auxiliary.common.next')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={handleComplete} 
                style={[styles.navButton, styles.navButtonPrimary]}
                disabled={saving}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.navButtonGradient}
                >
                  <Text style={styles.navButtonTextPrimary}>
                    {saving ? t('auxiliary.common.saving') : t('auxiliary.common.complete')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  historyButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 48,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    width: 24,
  },
  progressDotComplete: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  promptContainer: {
    marginBottom: 32,
  },
  promptNumber: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 38,
  },
  inputContainer: {
    marginBottom: 40,
  },
  input: {
    fontSize: 17,
    lineHeight: 26,
    minHeight: 200,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPrimary: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  navButtonGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
