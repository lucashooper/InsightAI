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
  Keyboard,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { EncryptionService } from '../services/encryptionService';
import { sf, ss } from '../utils/responsive';

export default function PromptEntryScreen({ navigation, route }: any) {
  const { promptText } = route?.params || {};
  const { user } = useAuth();
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
  }, []);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const encryptionKey = await EncryptionService.getKey();
      
      // Prepend prompt as metadata for AI analysis
      const fullContent = `[Insight Prompt: ${promptText}]\n\n${content.trim()}`;
      const contentToSave = encryptionKey 
        ? await EncryptionService.encrypt(fullContent, encryptionKey)
        : fullContent;

      // Auto-generate title from first line or use prompt
      const firstLine = content.trim().split('\n')[0];
      const autoTitle = firstLine.length > 50 
        ? firstLine.substring(0, 47) + '...' 
        : firstLine;

      const { data, error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: user?.id,
          title: autoTitle || 'Prompt Response',
          content: contentToSave,
          is_encrypted: !!encryptionKey,
          entry_type: 'prompt', // Mark as prompt entry
          prompt_text: promptText, // Store the prompt separately
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate back to home
      navigation.navigate('Home', { refresh: true });
    } catch (error: any) {
      console.error('Error saving prompt entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Gradient Background - Theme Aware */}
      <LinearGradient
        colors={theme.colors.backgroundGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a'} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
          {/* Prompt Badge */}
          <View style={styles.promptBadge}>
            <Ionicons name="sparkles" size={16} color={isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a'} />
            <Text style={[styles.promptBadgeText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>Today's Prompt</Text>
          </View>

          {/* Prompt Question */}
          <View style={styles.promptCard}>
            <Ionicons name="chatbubble-ellipses" size={32} color={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.6)'} style={styles.quoteIcon} />
            <Text style={[styles.promptText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}>{promptText}</Text>
          </View>

          {/* Writing Area */}
          <View style={styles.writingContainer}>
            <Text style={[styles.writingLabel, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)' }]}>Your Reflection</Text>
            <TextInput
              style={[styles.textInput, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a1a' }]}
              placeholder="Start writing your thoughts..."
              placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
              multiline
              value={content}
              onChangeText={setContent}
              autoFocus
              textAlignVertical="top"
            />
          </View>

          {/* Character Count */}
          {content.length > 0 && (
            <Text style={[styles.characterCount, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }]}>
              {content.length} character{content.length !== 1 ? 's' : ''}
            </Text>
          )}
        </Animated.View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, !content.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!content.trim() || isSaving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={content.trim() ? ['#ffffff', '#f3f4f6'] : ['#666666', '#555555']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isSaving ? (
              <Text style={[styles.saveButtonText, { color: '#8b5cf6' }]}>Saving...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#8b5cf6" />
                <Text style={[styles.saveButtonText, { color: '#8b5cf6' }]}>Save Reflection</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  contentContainer: {
    gap: 24,
  },
  promptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  promptBadgeText: {
    color: '#ffffff',
    fontSize: sf(13),
    fontWeight: '600',
  },
  promptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.3,
  },
  promptText: {
    color: '#ffffff',
    fontSize: sf(20),
    fontWeight: '600',
    lineHeight: sf(28),
    letterSpacing: -0.3,
  },
  writingContainer: {
    gap: 12,
  },
  writingLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: sf(15),
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    color: '#ffffff',
    fontSize: sf(16),
    lineHeight: sf(24),
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  characterCount: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: sf(13),
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  saveButtonText: {
    fontSize: sf(17),
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
