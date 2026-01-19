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
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const GRATITUDE_PROMPTS = [
  'What made you smile today?',
  'Who are you grateful for right now?',
  'What small moment brought you joy?',
];

export default function GratitudeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { user } = useAuth();
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
      Alert.alert('No responses', 'Please write at least one gratitude response.');
      return;
    }

    setSaving(true);
    try {
      const gratitudeEntry = `Gratitude Practice\n\n${GRATITUDE_PROMPTS.map((prompt, i) => 
        responses[i].trim() ? `${prompt}\n${responses[i]}\n` : ''
      ).join('\n')}`;

      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: user?.id,
          title: 'Gratitude Practice',
          content: gratitudeEntry.trim(),
          mood: '🙏',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Saved', 'Your gratitude practice has been saved to your journal.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving gratitude:', error);
      Alert.alert('Error', 'Failed to save your gratitude practice.');
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
          <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gratitude Practice</Text>
        <View style={{ width: 44 }} />
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
            <Text style={styles.promptNumber}>{currentPrompt + 1} of 3</Text>
            <Text style={styles.promptText}>{GRATITUDE_PROMPTS[currentPrompt]}</Text>
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={responses[currentPrompt]}
              onChangeText={handleResponseChange}
              placeholder="Write your thoughts..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              multiline
              textAlignVertical="top"
              autoFocus={false}
            />
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentPrompt > 0 && (
              <TouchableOpacity onPress={handlePrevious} style={styles.navButton}>
                <Text style={styles.navButtonText}>Previous</Text>
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
                  <Text style={styles.navButtonTextPrimary}>Next</Text>
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
                    {saving ? 'Saving...' : 'Complete'}
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
    color: 'rgba(255, 255, 255, 0.95)',
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
    color: 'rgba(139, 92, 246, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 38,
  },
  inputContainer: {
    marginBottom: 40,
  },
  input: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
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
