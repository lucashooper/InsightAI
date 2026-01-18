import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function CreateEntryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);

  const moods = ['😊', '😔', '😰', '😡', '😌', '🤔', '😴', '🎉'];

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something in your entry');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: user?.id,
          title: title.trim() || 'Untitled Entry',
          content: content.trim(),
          // Desktop uses mood_score; for now we rely on AI analysis to infer mood,
          // so we don't send the emoji to a non-existent 'mood' column.
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Success', 'Entry saved!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Entry</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mood Selector */}
        <Text style={styles.label}>How are you feeling?</Text>
        <View style={styles.moodGrid}>
          {moods.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.moodOption,
                mood === emoji && styles.moodOptionActive,
              ]}
              onPress={() => setMood(emoji)}
            >
              <Text style={styles.moodEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title Input */}
        <Text style={styles.label}>Title (optional)</Text>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Give your entry a title..."
          placeholderTextColor="#666"
        />

        {/* Content Input */}
        <Text style={styles.label}>What's on your mind?</Text>
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={setContent}
          placeholder="Write your thoughts here..."
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  saveButton: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginTop: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
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
    backgroundColor: '#8b5cf620',
    borderColor: '#8b5cf6',
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 28,
  },
  titleInput: {
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  contentInput: {
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    minHeight: 300,
  },
});
