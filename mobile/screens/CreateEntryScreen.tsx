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
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { mobileAiService } from '../services/mobileAiService';
import { EncryptionService } from '../services/encryptionService';
// Conditionally import speech recognition (crashes in Expo Go where native module isn't available)
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = (_event: string, _handler: any) => {};
try {
  const speechModule = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
} catch (e) {
  console.log('[CreateEntry] Speech recognition not available (Expo Go)');
}

export default function CreateEntryScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { initialContent, voiceMode, prefillPrompt } = route?.params || {};
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(initialContent || '');
  const [promptText] = useState<string | null>(prefillPrompt || null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [attachedPhotos, setAttachedPhotos] = useState<Array<{ uri: string; width: number; height: number }>>([]);
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [personality, setPersonality] = useState<string>('balanced');
  const [mood, setMood] = useState('');
  const waveAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(0.3))).current;
  const waveAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const contentBeforeRecording = useRef('');
  const [aiResponse, setAiResponse] = useState<{ reflection: string; questions: string[] } | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);
  const savedEntryIdRef = useRef<string | null>(null);
  const savingInProgress = useRef(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const quickActionsAnim = useRef(new Animated.Value(0)).current;
  const controlsBottomAnim = useRef(new Animated.Value(20)).current;
  const scrollViewRef = useRef<any>(null);

  const moods = ['😊', '😔', '😰', '😡', '😌', '🤔', '😴', '🎉'];
  const moodLabels: Record<string, string> = {
    '😊': 'Happy',
    '😔': 'Sad',
    '😰': 'Anxious',
    '😡': 'Angry',
    '😌': 'Calm',
    '🤔': 'Thoughtful',
    '😴': 'Tired',
    '🎉': 'Excited',
  };

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
    if (savingInProgress.current) return; // Prevent concurrent saves
    savingInProgress.current = true;

    try {
      // Get encryption key from secure storage
      const encryptionKey = await EncryptionService.getKey();
      
      // If there's a prompt, prepend it as context for AI analysis
      let fullContent = content.trim();
      if (promptText && fullContent) {
        fullContent = `[Insight Prompt: ${promptText}]\n\n${fullContent}`;
      }
      let contentToSave = fullContent;
      let isEncrypted = false;
      
      if (encryptionKey) {
        try {
          contentToSave = await EncryptionService.encrypt(fullContent, encryptionKey);
          isEncrypted = true;
          console.log('[CreateEntry] Content encrypted before save');
          console.log('[CreateEntry] Encrypted content preview:', contentToSave.substring(0, 40) + '...');
        } catch (encryptError) {
          console.error('[CreateEntry] Encryption failed, saving unencrypted:', encryptError);
        }
      } else {
        console.warn('[CreateEntry] No encryption key found, saving unencrypted');
      }

      // If we already saved this entry, update it instead of inserting a new one
      if (savedEntryIdRef.current) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: title.trim() || content.trim().split('\n')[0].substring(0, 50) || 'Journal Entry',
            content: contentToSave,
            is_encrypted: isEncrypted,
            updated_at: new Date().toISOString(),
          })
          .eq('id', savedEntryIdRef.current);

        if (!error) {
          hasUnsavedChanges.current = false;
          console.log('[CreateEntry] Entry updated successfully (id:', savedEntryIdRef.current, ')');
        }
      } else {
        const { data, error } = await supabase
          .from('notes')
          .insert({
            user_id: user?.id,
            title: title.trim() || 'Journal Entry',
            content: contentToSave,
            is_encrypted: isEncrypted,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && data) {
          savedEntryIdRef.current = data.id;
          hasUnsavedChanges.current = false;
          console.log('[CreateEntry] Entry saved successfully (id:', data.id, ', encrypted:', isEncrypted, ')');
        }
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      savingInProgress.current = false;
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

    // Cancel any pending auto-save to prevent race conditions
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Wait for any in-progress auto-save to finish
    while (savingInProgress.current) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    savingInProgress.current = true;
    
    try {
      const entryTitle = content.trim().split('\n')[0].substring(0, 50) || 'Journal Entry';

      // If auto-save already created the entry, update it and reuse
      if (savedEntryIdRef.current) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: entryTitle,
            content: promptText ? `[Insight Prompt: ${promptText}]\n\n${content.trim()}` : content.trim(),
            is_encrypted: false, // Analyze always saves unencrypted for AI processing
            mood: mood || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', savedEntryIdRef.current);

        if (!error) {
          console.log('[CreateEntry] Updated existing entry, navigating to analyze');
          // Fetch the full entry to pass to EntryDetail
          const { data: updatedEntry } = await supabase
            .from('notes')
            .select('*')
            .eq('id', savedEntryIdRef.current)
            .single();

          if (updatedEntry) {
            navigation.navigate('EntryDetail', { entry: updatedEntry, shouldAnalyze: true });
          }
        } else {
          console.error('[CreateEntry] Error updating entry:', error);
        }
      } else {
        // No existing entry, insert a new one
        const { data, error } = await supabase
          .from('notes')
          .insert({
            user_id: user?.id,
            title: entryTitle,
            content: promptText ? `[Insight Prompt: ${promptText}]\n\n${content.trim()}` : content.trim(),
            mood: mood || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && data) {
          savedEntryIdRef.current = data.id;
          console.log('[CreateEntry] Entry saved successfully, navigating to analyze');
          navigation.navigate('EntryDetail', { entry: data, shouldAnalyze: true });
        } else {
          console.error('[CreateEntry] Error saving entry:', error);
        }
      }
    } catch (error) {
      console.error('[CreateEntry] Exception saving entry:', error);
    } finally {
      savingInProgress.current = false;
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

  const handleGoDeeper = async () => {
    if (!content.trim() || isLoadingAi) return;
    
    setIsLoadingAi(true);
    setDisplayedText('');
    
    try {
      const response = await mobileAiService.generateFollowUpQuestions(content);
      setAiResponse(response);
      setIsTyping(true);
      
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Typewriter effect
      const fullText = response.reflection + '\n\n' + response.questions.join('\n\n');
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.substring(0, currentIndex + 1));
          currentIndex++;
          
          // Scroll as text appears
          if (currentIndex % 20 === 0) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          pulseAnim.stopAnimation();
          pulseAnim.setValue(1);
        }
      }, 25); // 25ms per character for natural typing speed
      
    } catch (error) {
      console.error('[CreateEntry] Go Deeper error:', error);
      setIsTyping(false);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Pulse wave bars once when speech is detected (reactive, not constant)
  const pulseWave = () => {
    const animations = waveAnims.map((anim, i) =>
      Animated.sequence([
        Animated.delay(i * 40),
        Animated.timing(anim, { toValue: 0.6 + Math.random() * 0.4, duration: 150, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 250, useNativeDriver: true }),
      ])
    );
    Animated.parallel(animations).start();
  };

  const stopWaveAnimation = () => {
    waveAnims.forEach(a => a.setValue(0.3));
  };

  // Speech recognition event handlers
  useSpeechRecognitionEvent('result', (event: any) => {
    const transcript = event.results[0]?.transcript || '';
    const isFinal = event.isFinal ?? event.results[0]?.isFinal ?? true;
    if (transcript) {
      // Pulse waveform when speech detected
      pulseWave();
      if (isFinal) {
        // Commit final text: update the base content and clear interim
        const base = contentBeforeRecording.current;
        const newContent = base ? base + ' ' + transcript : transcript;
        contentBeforeRecording.current = newContent;
        setContent(newContent);
        setInterimText('');
        hasUnsavedChanges.current = true;
      } else {
        // Show interim text live in the content area
        const base = contentBeforeRecording.current;
        setContent(base ? base + ' ' + transcript : transcript);
        setInterimText(transcript);
      }
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
    setInterimText('');
    stopWaveAnimation();
  });

  useSpeechRecognitionEvent('error', (event: any) => {
    console.warn('[CreateEntry] Speech recognition error:', event.error);
    setIsRecording(false);
    setInterimText('');
    stopWaveAnimation();
    if (event.error === 'not-allowed') {
      Alert.alert('Microphone Access', 'Please allow microphone access in Settings to use voice recording.');
    }
  });

  // Auto-start voice mode if navigated with voiceMode param
  useEffect(() => {
    if (voiceMode) {
      setTimeout(() => toggleVoiceRecording(), 500);
    }
  }, [voiceMode]);

  const toggleVoiceRecording = async () => {
    if (!ExpoSpeechRecognitionModule) {
      Alert.alert('Voice Recording', 'Voice recording requires a development build and is not available in Expo Go.');
      return;
    }

    if (isRecording) {
      ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
      setInterimText('');
      stopWaveAnimation();
      return;
    }

    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Microphone Access', 'Please allow microphone access in Settings to use voice recording.');
        return;
      }

      // Save current content as base before recording starts
      contentBeforeRecording.current = content;

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
        addsPunctuation: true,
      });
      setIsRecording(true);
    } catch (error: any) {
      console.error('[CreateEntry] Speech recognition start error:', error);
      Alert.alert('Voice Recording', 'Voice recording is not available on this device. Please use a development build or TestFlight.');
    }
  };

  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: showMoodPicker ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showMoodPicker]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.spring(controlsBottomAnim, {
          toValue: e.endCoordinates.height + 10,
          useNativeDriver: false,
          tension: 100,
          friction: 10,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.spring(controlsBottomAnim, {
          toValue: 20,
          useNativeDriver: false,
          tension: 100,
          friction: 10,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleAddPhotos = async () => {
    setShowQuickActions(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Photos Access', 'Please allow photo library access in Settings to add photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        const newPhotos = result.assets.map(a => ({ uri: a.uri, width: a.width || 300, height: a.height || 300 }));
        setAttachedPhotos(prev => [...prev, ...newPhotos]);
        hasUnsavedChanges.current = true;
      }
    } catch (error) {
      console.error('[CreateEntry] Photo picker error:', error);
      Alert.alert('Error', 'Failed to open photo library.');
    }
  };

  const AI_PERSONALITY_KEY = 'AI_PERSONALITY';
  const PERSONALITIES = [
    { key: 'balanced', label: 'Balanced', emoji: '⚖️', desc: 'Warm and thoughtful' },
    { key: 'cheerful', label: 'Cheerful', emoji: '☀️', desc: 'Upbeat and encouraging' },
    { key: 'direct', label: 'Direct', emoji: '🎯', desc: 'Concise and to the point' },
    { key: 'playful', label: 'Playful', emoji: '✨', desc: 'Light-hearted and fun' },
    { key: 'gentle', label: 'Gentle', emoji: '🌿', desc: 'Extra soft and nurturing' },
  ];

  useEffect(() => {
    const loadPersonality = async () => {
      const saved = await AsyncStorage.getItem(AI_PERSONALITY_KEY);
      if (saved) setPersonality(saved);
    };
    loadPersonality();
  }, []);

  const handleCustomizeAI = () => {
    setShowQuickActions(false);
    setShowPersonalityModal(true);
  };

  const WRITING_PROMPTS = [
    'What made you smile today?',
    'What\'s been on your mind lately?',
    'Describe a moment you felt proud of recently.',
    'What would you tell your future self right now?',
    'What\'s something you\'re grateful for today?',
    'If you could change one thing about today, what would it be?',
    'What\'s a challenge you\'re currently facing?',
    'Describe how your body feels right now.',
  ];

  const [inlinePrompt, setInlinePrompt] = useState<string | null>(null);

  const handleNewDirection = () => {
    setShowQuickActions(false);
    const prompt = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
    setInlinePrompt(prompt);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.7)' : '#1a1a1a'} />
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
              <Ionicons name="happy-outline" size={24} color={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.7)' : theme.colors.primaryText} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleAnalyze}
            disabled={content.trim().length < 5}
            activeOpacity={0.8}
            style={[
              { borderRadius: 12, overflow: 'hidden', minWidth: 80, alignItems: 'center', shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
              content.trim().length < 5 && { opacity: 0.4 }
            ]}
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 80, alignItems: 'center' }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>Analyze</Text>
            </LinearGradient>
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

      {/* Voice Recording Indicator */}
      {isRecording && (
        <View style={[styles.recordingBanner, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)' }]}>
          <View style={styles.waveformContainer}>
            {waveAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    transform: [{ scaleY: anim }],
                    backgroundColor: '#8b5cf6',
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.recordingTextContainer}>
            <Text style={[styles.recordingLabel, { color: '#8b5cf6' }]}>Listening...</Text>
            {interimText ? (
              <Text style={[styles.interimText, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]} numberOfLines={1}>
                {interimText}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={toggleVoiceRecording} style={styles.stopRecordingBtn} activeOpacity={0.7}>
            <Ionicons name="stop-circle" size={28} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Full-Screen Writing Canvas */}
      <KeyboardAvoidingView
        style={styles.writingArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={[styles.titleInput, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}
            placeholder="Title (optional)"
            placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
            value={title}
            onChangeText={setTitle}
            multiline={false}
            returnKeyType="next"
          />

          {/* Branded Prompt Display */}
          {promptText && (
            <View style={styles.promptBanner}>
              <View style={styles.promptIconWrap}>
                <Image source={require('../public/Insight-Logo-nobg.webp')} style={styles.promptLogo} resizeMode="contain" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promptLabel}>Insight prompt</Text>
                <Text style={[styles.promptQuestion, { color: isDarkTheme(theme.name) ? 'rgba(200, 180, 255, 0.9)' : '#4a3a6b' }]}>{promptText}</Text>
              </View>
            </View>
          )}

          <TextInput
            style={[styles.contentInput, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}
            value={content}
            onChangeText={handleContentChange}
            placeholder={promptText ? "Your thoughts..." : "Write here..."}
            placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
            multiline
            textAlignVertical="top"
            autoFocus={false}
          />

          {/* Attached Photo Thumbnails */}
          {attachedPhotos.length > 0 && (
            <View style={styles.photoGrid}>
              {attachedPhotos.map((photo, index) => (
                <View key={index} style={styles.photoThumbWrap}>
                  <Image source={{ uri: photo.uri }} style={styles.photoThumb} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.photoRemoveBtn}
                    onPress={() => setAttachedPhotos(prev => prev.filter((_, i) => i !== index))}
                  >
                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          {/* Inline Prompt from New Direction */}
          {inlinePrompt && (
            <View style={styles.promptBanner}>
              <View style={styles.promptIconWrap}>
                <Image source={require('../public/Insight-Logo-nobg.webp')} style={styles.promptLogo} resizeMode="contain" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promptLabel}>New direction</Text>
                <Text style={[styles.promptQuestion, { color: isDarkTheme(theme.name) ? 'rgba(200, 180, 255, 0.9)' : '#4a3a6b' }]}>{inlinePrompt}</Text>
              </View>
              <TouchableOpacity onPress={() => setInlinePrompt(null)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="rgba(139,92,246,0.5)" />
              </TouchableOpacity>
            </View>
          )}

          {/* AI Response - Conversational style with typewriter effect */}
          {aiResponse && displayedText && (
            <View style={styles.aiResponseContainer}>
              <View style={styles.aiResponseRow}>
                <Animated.View style={[styles.aiIconContainer, { transform: [{ scale: isTyping ? pulseAnim : 1 }] }]}>
                  <Ionicons name="book-outline" size={20} color="#8b5cf6" />
                </Animated.View>
                <Text style={[styles.aiResponseText, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.75)' : '#6B6B6B' }]}>
                  {displayedText}
                  {isTyping && <Text style={styles.cursor}>|</Text>}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom-Left Quick Actions Button */}
      <Animated.View style={[styles.quickActionsButton, { bottom: controlsBottomAnim }]} pointerEvents="box-none">
        <TouchableOpacity 
          onPress={toggleQuickActions}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isDarkTheme(theme.name) ? ['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.2)'] : ['#8b5cf6', '#7c3aed']}
            style={styles.fabGradient}
          >
            <Ionicons 
              name={showQuickActions ? "close" : "add"} 
              size={24} 
              color="#ffffff" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

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
              <TouchableOpacity 
                style={styles.quickActionItem}
                onPress={() => {
                  setShowQuickActions(false);
                  toggleVoiceRecording();
                }}
              >
                <Ionicons name={isRecording ? 'mic-off' : 'mic'} size={20} color={isRecording ? '#ef4444' : 'rgba(255, 255, 255, 0.8)'} />
                <Text style={styles.quickActionText}>{isRecording ? 'Stop recording' : 'Voice mode'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem} onPress={handleAddPhotos}>
                <Ionicons name="image" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.quickActionText}>Add photos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem} onPress={handleCustomizeAI}>
                <Ionicons name="color-palette" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.quickActionText}>Customize AI</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionItem} onPress={handleNewDirection}>
                <Ionicons name="compass" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.quickActionText}>New direction</Text>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      )}

      {/* Bottom-Right Go Deeper Button */}
      <Animated.View style={[styles.sparkleButton, { bottom: controlsBottomAnim }]} pointerEvents="box-none">
        <TouchableOpacity 
          onPress={handleGoDeeper}
          activeOpacity={0.8}
          disabled={isLoadingAi || !content.trim()}
        >
          <LinearGradient
            colors={isLoadingAi ? ['#6b46c1', '#553c9a'] : ['#8b5cf6', '#7c3aed']}
            style={styles.sparkleFabGradient}
          >
            {isLoadingAi ? (
              <Ionicons name="hourglass" size={24} color="#ffffff" />
            ) : (
              <Ionicons name="sparkles" size={24} color="#ffffff" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* AI Personality Modal */}
      <Modal visible={showPersonalityModal} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.personalityOverlay}
          activeOpacity={1}
          onPress={() => setShowPersonalityModal(false)}
        >
          <View style={[styles.personalitySheet, { backgroundColor: isDarkTheme(theme.name) ? '#1a1a1a' : '#fff' }]}>
            <Text style={[styles.personalityTitle, { color: isDarkTheme(theme.name) ? '#fff' : '#1a1a1a' }]}>AI Personality</Text>
            {PERSONALITIES.map(p => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.personalityOption,
                  personality === p.key && { backgroundColor: 'rgba(139,92,246,0.15)', borderColor: '#8b5cf6' },
                ]}
                onPress={async () => {
                  setPersonality(p.key);
                  await AsyncStorage.setItem(AI_PERSONALITY_KEY, p.key);
                  setShowPersonalityModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.personalityLabel, { color: isDarkTheme(theme.name) ? '#fff' : '#1a1a1a' }]}>{p.label}</Text>
                  <Text style={[styles.personalityDesc, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>{p.desc}</Text>
                </View>
                {personality === p.key && <Ionicons name="checkmark-circle" size={22} color="#8b5cf6" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      </View>
    </TouchableWithoutFeedback>
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
  moodCheckInOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  moodCheckInContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  moodCheckInTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  moodCheckInSubtitle: {
    fontSize: 15,
    marginBottom: 32,
    textAlign: 'center',
  },
  moodLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  breathingPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  breathingPromptText: {
    fontSize: 15,
    fontWeight: '600',
  },
  continueButton: {
    width: '100%',
    marginTop: 8,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  breathingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  breathingContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  breathingTitle: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  breathingInstructions: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  breathingSteps: {
    width: '100%',
    marginBottom: 32,
  },
  breathingStep: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
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
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  contentInput: {
    flex: 1,
    fontSize: 17,
    lineHeight: 26,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 100,
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
  },
  aiResponseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  aiIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  aiResponseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  cursor: {
    color: '#8b5cf6',
    fontWeight: '600',
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
    gap: 8,
    minHeight: 200,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
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
  // Voice recording indicator
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 24,
  },
  waveBar: {
    width: 3,
    height: 24,
    borderRadius: 2,
  },
  recordingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  recordingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  interimText: {
    fontSize: 13,
    marginTop: 2,
  },
  stopRecordingBtn: {
    padding: 4,
  },
  aiResponseContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  // Branded prompt display
  promptBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 4,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    gap: 12,
  },
  promptIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  promptLogo: {
    width: 20,
    height: 20,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8b5cf6',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  promptQuestion: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  // Photo thumbnails
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  photoThumbWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 11,
  },
  // Personality modal
  personalityOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  personalitySheet: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
  },
  personalityTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  personalityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  personalityLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  personalityDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
