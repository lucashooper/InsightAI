import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function CreateEntryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [mood, setMood] = useState('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);

  const moods = ['😊', '😔', '😰', '😡', '😌', '🤔', '😴', '🎉'];

  // Auto-save functionality
  useEffect(() => {
    if (!content.trim() || !hasUnsavedChanges.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (2 seconds after user stops typing)
    saveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content]);

  const handleAutoSave = async () => {
    if (!content.trim()) return;

    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: user?.id,
          title: 'Journal Entry',
          content: content.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (!error) {
        hasUnsavedChanges.current = false;
        navigation.goBack();
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    hasUnsavedChanges.current = true;
  };

  return (
    <View style={styles.container}>
      {/* Minimal Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setShowMoodPicker(!showMoodPicker)} 
          style={styles.headerButton}
        >
          <Ionicons name="happy-outline" size={24} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
      </View>

      {/* Mood Picker Overlay */}
      {showMoodPicker && (
        <View style={styles.moodPickerOverlay}>
          <View style={styles.moodGrid}>
            {moods.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.moodOption,
                  mood === emoji && styles.moodOptionActive,
                ]}
                onPress={() => {
                  setMood(emoji);
                  setShowMoodPicker(false);
                }}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Full-Screen Writing Canvas */}
      <KeyboardAvoidingView
        style={styles.writingArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={handleContentChange}
          placeholder="Write here..."
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          multiline
          autoFocus
          textAlignVertical="top"
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodPickerOverlay: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15, 15, 15, 0.98)',
    borderRadius: 16,
    padding: 20,
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodOptionActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 28,
  },
  writingArea: {
    flex: 1,
  },
  contentInput: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
  },
});
