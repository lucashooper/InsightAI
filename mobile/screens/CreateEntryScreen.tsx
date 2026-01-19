import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

export default function CreateEntryScreen({ navigation }: any) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [mood, setMood] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const quickActionsAnim = useRef(new Animated.Value(0)).current;

  const moods = ['😊', '😔', '😰', '😡', '😌', '🤔', '😴', '🎉'];
  
  const aiPrompts = [
    'What prompted you to start writing just now?',
    'How does this make you feel?',
    'What would you like to explore further?',
    'What patterns do you notice?',
  ];

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
        // Don't navigate away - let user stay on screen
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const handleContentChange = (text: string) => {
    console.log('[CreateEntry] Content changed, length:', text.trim().length);
    setContent(text);
    console.log('[CreateEntry] Can analyze:', text.trim().length >= 5);
    hasUnsavedChanges.current = true;
  };

  const handleMoodSelect = (selectedMood: string) => {
    setMood(selectedMood);
    setShowMoodPicker(false);
    
    // Subtle scale animation for feedback
    Animated.sequence([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAnalyze = async () => {
    console.log('[CreateEntry] Analyze button pressed');
    console.log('[CreateEntry] Content length:', content.trim().length);
    if (content.trim().length < 5) {
      console.log('[CreateEntry] Content too short, aborting');
      return;
    }
    
    // Save entry first, then navigate to analyze
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user?.id,
          title: content.trim().split('\n')[0].substring(0, 50) || 'Journal Entry',
          content: content.trim(),
          mood: mood || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        console.log('[CreateEntry] Entry saved successfully, navigating to analyze');
        navigation.navigate('EntryDetail', { entry: data, shouldAnalyze: true });
      } else {
        console.error('[CreateEntry] Error saving entry:', error);
      }
    } catch (error) {
      console.error('[CreateEntry] Exception saving entry:', error);
    }
  };

  const toggleQuickActions = () => {
    const toValue = showQuickActions ? 0 : 1;
    setShowQuickActions(!showQuickActions);
    Animated.spring(quickActionsAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const insertAiPrompt = () => {
    const randomPrompt = aiPrompts[Math.floor(Math.random() * aiPrompts.length)];
    setAiPrompt(randomPrompt);
  };

  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: showMoodPicker ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showMoodPicker]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => setShowMoodPicker(!showMoodPicker)} 
            style={styles.headerButton}
          >
            {mood ? (
              <Text style={styles.selectedMoodEmoji}>{mood}</Text>
            ) : (
              <Ionicons name="happy-outline" size={24} color="rgba(255, 255, 255, 0.7)" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleAnalyze}
            style={[
              styles.analyzeButton,
              content.trim().length < 5 && styles.analyzeButtonDisabled
            ]}
            disabled={content.trim().length < 5}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.analyzeText,
              content.trim().length < 5 && styles.analyzeTextDisabled
            ]}>
              Analyze
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Glassmorphic Mood Picker Overlay */}
      {showMoodPicker && (
        <>
          <Pressable 
            style={styles.overlayBackdrop} 
            onPress={() => setShowMoodPicker(false)}
          />
          <Animated.View style={[styles.moodPickerOverlay, { opacity: overlayOpacity }]}>
            <BlurView intensity={80} style={styles.blurContainer}>
              <LinearGradient
                colors={['rgba(20, 20, 30, 0.95)', 'rgba(10, 10, 20, 0.98)']}
                style={styles.glassmorphicContainer}
              >
                <Text style={styles.moodPickerTitle}>How are you feeling?</Text>
                <View style={styles.moodGrid}>
                  {moods.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.moodOption,
                        mood === emoji && styles.moodOptionActive,
                      ]}
                      onPress={() => handleMoodSelect(emoji)}
                    >
                      <Text style={styles.moodEmoji}>{emoji}</Text>
                      {mood === emoji && (
                        <View style={styles.checkmarkContainer}>
                          <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </>
      )}

      {/* Full-Screen Writing Canvas */}
      <KeyboardAvoidingView
        style={styles.writingArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {aiPrompt ? (
          <View style={styles.aiPromptContainer}>
            <Ionicons name="sparkles" size={16} color="#a78bfa" style={styles.aiPromptIcon} />
            <Text style={styles.aiPromptText}>{aiPrompt}</Text>
          </View>
        ) : null}
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={handleContentChange}
          placeholder="Write here..."
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          multiline
          textAlignVertical="top"
          autoFocus={false}
        />
      </KeyboardAvoidingView>

      {/* Bottom-Left Quick Actions Button */}
      <TouchableOpacity 
        style={styles.quickActionsButton}
        onPress={toggleQuickActions}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.2)']}
          style={styles.fabGradient}
        >
          <Ionicons 
            name={showQuickActions ? "close" : "add"} 
            size={24} 
            color="rgba(255, 255, 255, 0.9)" 
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Actions Overlay */}
      {showQuickActions && (
        <Animated.View 
          style={[
            styles.quickActionsOverlay,
            {
              opacity: quickActionsAnim,
              transform: [{
                translateY: quickActionsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          <BlurView intensity={80} style={styles.quickActionsBlur}>
            <LinearGradient
              colors={['rgba(20, 20, 30, 0.95)', 'rgba(10, 10, 20, 0.98)']}
              style={styles.quickActionsContainer}
            >
              <TouchableOpacity style={styles.quickActionItem}>
                <Ionicons name="mic" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.quickActionText}>Voice mode</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <Ionicons name="image" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.quickActionText}>Add photos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <Ionicons name="scan" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.quickActionText}>Scan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <Ionicons name="settings" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.quickActionText}>Customize AI</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem}>
                <Ionicons name="compass" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.quickActionText}>New direction</Text>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      )}

      {/* Bottom-Right Sparkle AI Button */}
      <TouchableOpacity 
        style={styles.sparkleButton}
        onPress={insertAiPrompt}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          style={styles.sparkleFabGradient}
        >
          <Ionicons name="sparkles" size={24} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    zIndex: 101,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMoodEmoji: {
    fontSize: 24,
  },
  analyzeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  analyzeButtonDisabled: {
    opacity: 0.3,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  analyzeText: {
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeTextDisabled: {
    color: 'rgba(139, 92, 246, 0.3)',
  },
  overlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
  },
  moodPickerOverlay: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    zIndex: 100,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassmorphicContainer: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  moodPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  moodOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  moodOptionActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 28,
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  writingArea: {
    flex: 1,
  },
  aiPromptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 8,
  },
  aiPromptIcon: {
    marginTop: 2,
  },
  aiPromptText: {
    flex: 1,
    color: '#a78bfa',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  contentInput: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
  },
  quickActionsButton: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    zIndex: 10,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionsOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    zIndex: 9,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionsBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionsContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    gap: 4,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 8,
  },
  quickActionText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 15,
    fontWeight: '500',
  },
  sparkleButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    zIndex: 10,
  },
  sparkleFabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
