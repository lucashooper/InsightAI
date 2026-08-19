import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ScrollView,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { mobileAiService } from '../services/mobileAiService';
import { EncryptionService } from '../services/encryptionService';
import { shouldEncryptJournalForUser } from '../utils/journalEncryption';
import { setCachedEntry, entryVersion } from '../utils/decryptCache';
import { CheckInDraft } from '../components/checkin/types';
import { saveCheckIn } from '../services/checkInService';
import StandardContainer from '../components/shared/StandardContainer';
import MoodIcon from '../components/checkin/MoodIcon';
import { useLanguage } from '../contexts/LanguageContext';
import GoDeeperThread from '../components/editor/GoDeeperThread';
import InsightCompanionMark from '../components/companion/InsightCompanionMark';
import { formatJournalPromptContent } from '../constants/branding';
import { useEditorKeyboardPadding } from '../hooks/useEditorKeyboardPadding';
import { useFollowBottomScroll } from '../hooks/useFollowBottomScroll';
import { useFadeReveal } from '../hooks/useFadeReveal';
import { useAnimatedPlaceholder } from '../hooks/useAnimatedPlaceholder';
import EntryQuickActionsMenu from '../components/editor/EntryQuickActionsMenu';
import PremiumDialog from '../components/shared/PremiumDialog';
import { getTodayPrompt } from '../data/dailyPrompts';
import { resolveProAccess } from '../utils/entitlements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  loadGoDeeperConversation,
  saveGoDeeperConversation,
  migrateDraftToEntry,
  createGoDeeperMessage,
  type GoDeeperMessage,
} from '../services/goDeeperConversationService';
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
  const { t, locale } = useLanguage();
  const { initialContent, voiceMode, prefillPrompt, checkInDraft } = route?.params || {};
  const checkInSavedRef = useRef(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(initialContent || '');
  const [promptText] = useState<string | null>(prefillPrompt || null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showScanSoon, setShowScanSoon] = useState(false);
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
  const [goDeeperMessages, setGoDeeperMessages] = useState<GoDeeperMessage[]>([]);
  const [goDeeperReply, setGoDeeperReply] = useState('');
  const [isGoDeeperLoading, setIsGoDeeperLoading] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentDraftRef = useRef(content);
  const titleDraftRef = useRef(title);
  contentDraftRef.current = content;
  titleDraftRef.current = title;
  const hasUnsavedChanges = useRef(false);
  const savedEntryIdRef = useRef<string | null>(null);
  const savingInProgress = useRef(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const controlsRestingBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 48 : 20) + 12;
  const [controlsBottom, setControlsBottom] = useState(controlsRestingBottom);
  const controlsBottomAnim = useRef(new Animated.Value(controlsRestingBottom)).current;
  const scrollViewRef = useRef<any>(null);
  const goDeeperAnchorY = useRef(0);
  const {
    onScroll: onFollowBottomScroll,
    onScrollBeginDrag: onFollowBottomScrollBeginDrag,
    onContentSizeChange: onFollowBottomContentSizeChange,
    onAnchorLayout: onGoDeeperAnchorLayout,
    scrollToEndIfFollowing,
    revealThread,
  } = useFollowBottomScroll(scrollViewRef, { anchorYRef: goDeeperAnchorY });
  const contentInputRef = useRef<TextInput>(null);
  const { scrollPaddingBottom } = useEditorKeyboardPadding();
  const { revealingId: revealingMessageId, startReveal, finishReveal } = useFadeReveal();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);
  const animatedPlaceholder = useAnimatedPlaceholder(
    promptText ? t('editor.yourThoughts') : t('editor.writeHere'),
    !content.trim() && !contentFocused && !promptText,
  );

  const persistGoDeeper = async (messages: GoDeeperMessage[]) => {
    if (!user?.id) return;
    await saveGoDeeperConversation(user.id, messages, savedEntryIdRef.current);
  };

  useEffect(() => {
    if (!user?.id) return;
    loadGoDeeperConversation(user.id, savedEntryIdRef.current).then(setGoDeeperMessages);
  }, [user?.id]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!title.trim()) {
        contentInputRef.current?.focus();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const moods = ['😊', '😔', '😰', '😡', '😌', '🤔', '😴', '🎉'];
  const AUTO_SAVE_MS = 1500;

  const handleAutoSaveRef = useRef<() => Promise<void>>(async () => {});

  const scheduleAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (hasUnsavedChanges.current && contentDraftRef.current.trim()) {
        void handleAutoSaveRef.current();
      }
    }, AUTO_SAVE_MS);
  }, []);

  // Force save when navigating away (beforeRemove)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // Cancel any pending debounce timer
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      // Force immediate save if there are unsaved changes
      if (hasUnsavedChanges.current && contentDraftRef.current.trim()) {
        void handleAutoSaveRef.current();
      }
    });
    return unsubscribe;
  }, [navigation]);

  const persistLinkedCheckIn = async (journalNoteId: string, journalTitle: string) => {
    if (!checkInDraft || checkInSavedRef.current || !user?.id) return;

    try {
      const saved = await saveCheckIn(user.id, checkInDraft as CheckInDraft, {
        journalTitle,
        journalBody: contentDraftRef.current.trim(),
        journalNoteId,
      });
      if (saved) checkInSavedRef.current = true;
    } catch (error: any) {
      console.warn(
        '[CreateEntry] Linked check-in save skipped:',
        error?.message || JSON.stringify(error),
      );
    }
  };

  const handleAutoSave = async () => {
    const draftContent = contentDraftRef.current;
    const draftTitle = titleDraftRef.current;
    if (!draftContent.trim()) return;
    if (savingInProgress.current) return; // Prevent concurrent saves
    savingInProgress.current = true;

    try {
      const useEncryption = user?.id ? await shouldEncryptJournalForUser(user.id) : false;
      const encryptionKey = useEncryption && user?.id
        ? await EncryptionService.getKey(user.id)
        : null;
      
      // If there's a prompt, prepend it as context for AI analysis
      let fullContent = draftContent.trim();
      if (promptText && fullContent) {
        fullContent = formatJournalPromptContent(promptText, fullContent);
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

      const savedAt = new Date().toISOString();
      const savedTitle = draftTitle.trim() || draftContent.trim().split('\n')[0].substring(0, 50) || t('editor.journalEntry');
      const cachePlaintext = async (noteId: string) => {
        if (!user?.id) return;
        setCachedEntry(
          user.id,
          noteId,
          entryVersion({
            updated_at: savedAt,
            created_at: savedAt,
            is_encrypted: isEncrypted,
            content: contentToSave,
            title: savedTitle,
          }),
          savedTitle,
          fullContent,
        );
      };

      // If we already saved this entry, update it instead of inserting a new one
      if (savedEntryIdRef.current) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: savedTitle,
            content: contentToSave,
            is_encrypted: isEncrypted,
            updated_at: savedAt,
          })
          .eq('id', savedEntryIdRef.current);

        if (!error) {
          hasUnsavedChanges.current = false;
          await cachePlaintext(savedEntryIdRef.current);
          console.log('[CreateEntry] Entry updated successfully (id:', savedEntryIdRef.current, ')');
          await persistLinkedCheckIn(savedEntryIdRef.current, savedTitle);
        }
      } else {
        const { data, error } = await supabase
          .from('notes')
          .insert({
            user_id: user?.id,
            title: savedTitle,
            content: contentToSave,
            is_encrypted: isEncrypted,
            created_at: savedAt,
            updated_at: savedAt,
          })
          .select()
          .single();

        if (!error && data) {
          savedEntryIdRef.current = data.id;
          hasUnsavedChanges.current = false;
          await cachePlaintext(data.id);
          console.log('[CreateEntry] Entry saved successfully (id:', data.id, ', encrypted:', isEncrypted, ')');
          await persistLinkedCheckIn(data.id, savedTitle);
          await migrateDraftToEntry(user!.id, data.id);
          const loaded = await loadGoDeeperConversation(user!.id, data.id);
          if (loaded.length > 0) setGoDeeperMessages(loaded);
        }
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      savingInProgress.current = false;
    }
  };
  handleAutoSaveRef.current = handleAutoSave;

  const handleContentChange = (text: string) => {
    setContent(text);
    hasUnsavedChanges.current = true;
    scheduleAutoSave();
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    hasUnsavedChanges.current = true;
    scheduleAutoSave();
  };

  const handleMoodSelect = (selectedMood: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    if (isAnalyzing) return;
    console.log('[CreateEntry] Analyze button pressed');
    console.log('[CreateEntry] Content length:', content.trim().length);
    if (content.trim().length < 5) {
      Alert.alert(t('editor.analyze'), t('editor.needMoreText'));
      return;
    }

    if (!(await ensureProAccess())) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsAnalyzing(true);

    // Cancel any pending auto-save to prevent race conditions
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Wait for any in-progress auto-save to finish (max 5s)
    let waited = 0;
    while (savingInProgress.current && waited < 5000) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waited += 100;
    }
    savingInProgress.current = true;
    
    try {
      const entryTitle = title.trim() || content.trim().split('\n')[0].substring(0, 50) || t('editor.journalEntry');
      const plainContent = promptText
        ? formatJournalPromptContent(promptText, content.trim())
        : content.trim();
      const savedAt = new Date().toISOString();

      const navigateToAnalyze = (entryForDetail: Record<string, unknown>) => {
        console.log('[CreateEntry] Navigating to analyze for entry:', entryForDetail.id);
        navigation.replace('EntryDetail', { entry: entryForDetail, shouldAnalyze: true });
      };

      // If auto-save already created the entry, update it and reuse
      if (savedEntryIdRef.current) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: entryTitle,
            content: plainContent,
            is_encrypted: false, // Plaintext required for AI analysis
            mood: mood || null,
            updated_at: savedAt,
          })
          .eq('id', savedEntryIdRef.current);

        if (error) {
          console.error('[CreateEntry] Error updating entry:', error);
          Alert.alert(t('entry.analysisFailed'), error.message || t('common.error'));
          return;
        }

        await persistLinkedCheckIn(savedEntryIdRef.current, entryTitle);

        const { data: updatedEntry, error: fetchError } = await supabase
          .from('notes')
          .select('*')
          .eq('id', savedEntryIdRef.current)
          .single();

        if (fetchError) {
          console.warn('[CreateEntry] Fetch after update failed, using local entry:', fetchError.message);
        }

        navigateToAnalyze(
          updatedEntry ?? {
            id: savedEntryIdRef.current,
            user_id: user?.id,
            title: entryTitle,
            content: plainContent,
            mood: mood || null,
            is_encrypted: false,
            created_at: savedAt,
            updated_at: savedAt,
          },
        );
      } else {
        // No existing entry, insert a new one
        const { data, error } = await supabase
          .from('notes')
          .insert({
            user_id: user?.id,
            title: entryTitle,
            content: plainContent,
            is_encrypted: false,
            mood: mood || null,
            created_at: savedAt,
            updated_at: savedAt,
          })
          .select()
          .single();

        if (error || !data) {
          console.error('[CreateEntry] Error saving entry:', error);
          Alert.alert(t('entry.analysisFailed'), error?.message || t('common.error'));
          return;
        }

        savedEntryIdRef.current = data.id;
        await persistLinkedCheckIn(data.id, entryTitle);
        navigateToAnalyze(data);
      }
    } catch (error: any) {
      console.error('[CreateEntry] Exception saving entry:', error?.message || JSON.stringify(error));
      Alert.alert(t('entry.analysisFailed'), error?.message || t('common.error'));
    } finally {
      savingInProgress.current = false;
      setIsAnalyzing(false);
    }
  };

  const closeQuickActions = () => {
    setShowQuickActions(false);
  };

  const toggleQuickActions = () => {
    if (showQuickActions) {
      closeQuickActions();
      return;
    }
    Keyboard.dismiss();
    setShowQuickActions(true);
  };

  const handleScanDocument = () => {
    setShowScanSoon(true);
  };

  const handleSelectGuidedPrompt = () => {
    const daily = getTodayPrompt();
    const promptText = daily.prompt + (daily.followUp ? `\n\n${daily.followUp}` : '');
    navigation.navigate('PromptEntry', { promptText });
  };

  const quickActionItems = [
    {
      id: 'voice',
      emoji: '🎙️',
      label: t('editor.voiceMode'),
      onPress: () => toggleVoiceRecording(),
    },
    {
      id: 'scan',
      emoji: '📷',
      label: t('home.scan'),
      onPress: () => handleScanDocument(),
    },
    {
      id: 'prompt',
      emoji: '💡',
      label: t('home.todaysPrompt'),
      onPress: () => handleSelectGuidedPrompt(),
    },
  ];

  const ensureProAccess = async (): Promise<boolean> => {
    if (!user?.id) return false;
    const hasPro = await resolveProAccess(user.id, user.email);
    if (!hasPro) {
      Alert.alert(
        t('editor.proRequiredTitle'),
        t('editor.proRequiredMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('companion.upgradePro'), onPress: () => navigation.navigate('Paywall') },
        ],
      );
      return false;
    }
    return true;
  };

  const handleGoDeeper = async () => {
    if (!content.trim() || isGoDeeperLoading) return;
    if (!(await ensureProAccess())) return;

    setIsGoDeeperLoading(true);
    try {
      const response = await mobileAiService.generateFollowUpQuestions(content);
      const text = mobileAiService.formatGoDeeperReflection(response.reflection, response.questions);
      const msg = createGoDeeperMessage('assistant', text);
      setGoDeeperMessages((prev) => [...prev, msg]);
      setTimeout(() => revealThread(true), 80);
      startReveal(msg.id, text, () => {
        setGoDeeperMessages((prev) => {
          persistGoDeeper(prev);
          return prev;
        });
        scrollToEndIfFollowing(true);
      });
    } catch (error: any) {
      console.error('[CreateEntry] Go Deeper error:', error);
      const message = error?.message || t('entry.analysisError');
      if (message.includes('Subscription') || message.includes('subscription')) {
        Alert.alert(
          t('editor.proRequiredTitle'),
          t('editor.proRequiredMessage'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('companion.upgradePro'), onPress: () => navigation.navigate('Paywall') },
          ],
        );
      } else {
        Alert.alert(t('entry.analysisFailed'), message);
      }
    } finally {
      setIsGoDeeperLoading(false);
    }
  };

  const handleGoDeeperReply = async () => {
    const reply = goDeeperReply.trim();
    if (!reply || isGoDeeperLoading || !content.trim()) return;

    setGoDeeperReply('');
    const userMsg = createGoDeeperMessage('user', reply);
    const withUser = [...goDeeperMessages, userMsg];
    setGoDeeperMessages(withUser);
    setIsGoDeeperLoading(true);

    try {
      const assistantText = await mobileAiService.continueGoDeeperChat(content, withUser);
      const assistantMsg = createGoDeeperMessage('assistant', assistantText);
      const full = [...withUser, assistantMsg];
      setGoDeeperMessages(full);
      setTimeout(() => revealThread(true), 80);
      startReveal(assistantMsg.id, assistantText, () => {
        persistGoDeeper(full);
        scrollToEndIfFollowing(true);
      });
    } catch (error) {
      console.error('[CreateEntry] Go Deeper reply error:', error);
    } finally {
      setIsGoDeeperLoading(false);
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
      Alert.alert(t('editor.microphoneTitle'), t('editor.microphoneMessage'));
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
      Alert.alert(t('editor.voiceTitle'), t('editor.voiceExpo'));
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
        Alert.alert(t('editor.microphoneTitle'), t('editor.microphoneMessage'));
        return;
      }

      // Save current content as base before recording starts
      contentBeforeRecording.current = content;

      ExpoSpeechRecognitionModule.start({
        lang: locale,
        interimResults: true,
        continuous: true,
        addsPunctuation: true,
      });
      setIsRecording(true);
    } catch (error: any) {
      console.error('[CreateEntry] Speech recognition start error:', error);
      Alert.alert(t('editor.voiceTitle'), t('editor.voiceUnavailable'));
    }
  };

  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: showMoodPicker ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showMoodPicker]);

  useEffect(() => {
    controlsBottomAnim.setValue(controlsRestingBottom);
    setControlsBottom(controlsRestingBottom);
  }, [controlsRestingBottom, controlsBottomAnim]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const nextBottom = e.endCoordinates.height + controlsRestingBottom;
        setControlsBottom(nextBottom);
        Animated.spring(controlsBottomAnim, {
          toValue: nextBottom,
          useNativeDriver: false,
          tension: 100,
          friction: 10,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setControlsBottom(controlsRestingBottom);
        Animated.spring(controlsBottomAnim, {
          toValue: controlsRestingBottom,
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
  }, [controlsRestingBottom, controlsBottomAnim]);

  const handleAddPhotos = async () => {
    setShowQuickActions(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('editor.photosTitle'), t('editor.photosMessage'));
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
      Alert.alert(t('common.error'), t('editor.photoOpenFailed'));
    }
  };

  const AI_PERSONALITY_KEY = 'AI_PERSONALITY';
  const PERSONALITIES = [
    { key: 'balanced', label: t('editor.personalities.balanced'), emoji: '⚖️', desc: t('editor.personalities.balancedDesc') },
    { key: 'cheerful', label: t('editor.personalities.cheerful'), emoji: '☀️', desc: t('editor.personalities.cheerfulDesc') },
    { key: 'direct', label: t('editor.personalities.direct'), emoji: '🎯', desc: t('editor.personalities.directDesc') },
    { key: 'playful', label: t('editor.personalities.playful'), emoji: '✨', desc: t('editor.personalities.playfulDesc') },
    { key: 'gentle', label: t('editor.personalities.gentle'), emoji: '🌿', desc: t('editor.personalities.gentleDesc') },
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
    t('editor.prompts.smile'), t('editor.prompts.mind'), t('editor.prompts.proud'),
    t('editor.prompts.future'), t('editor.prompts.grateful'), t('editor.prompts.change'),
    t('editor.prompts.challenge'), t('editor.prompts.body'),
  ];

  const [inlinePrompt, setInlinePrompt] = useState<string | null>(null);

  const handleNewDirection = () => {
    setShowQuickActions(false);
    const prompt = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
    setInlinePrompt(prompt);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.mainContent}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.7)' : '#1a1a1a'} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={toggleVoiceRecording}
            style={styles.headerButton}
            activeOpacity={0.7}
            accessibilityLabel={t('home.speak')}
          >
            <Ionicons
              name={isRecording ? 'mic' : 'mic-outline'}
              size={24}
              color={isRecording ? '#8b5cf6' : (isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.7)' : theme.colors.primaryText)}
            />
          </TouchableOpacity>
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
            disabled={content.trim().length < 5 || isAnalyzing}
            activeOpacity={0.8}
            style={[
              { borderRadius: 12, overflow: 'hidden', minWidth: 80, alignItems: 'center', shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
              (content.trim().length < 5 || isAnalyzing) && { opacity: 0.4 }
            ]}
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 80, alignItems: 'center' }}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>{t('editor.analyze')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {checkInDraft && (
        <View style={styles.checkInChipWrap}>
          <StandardContainer variant="nested" style={styles.checkInChip}>
            <View style={styles.checkInChipRow}>
              <View style={styles.checkInSymbol}>
                <Ionicons name="pulse" size={16} color="#8b5cf6" />
              </View>
              <MoodIcon tier={checkInDraft.moodTier} size={28} />
              <Text style={[styles.checkInChipText, { color: theme.colors.primaryText }]}>
                {t('editor.checkInFeeling', {
                  mood: t(`checkIn.${checkInDraft.moodTier}`),
                  feelings: checkInDraft.feelings.length > 0 ? `, ${checkInDraft.feelings.slice(0, 2).join(', ')}` : '',
                })}
              </Text>
            </View>
          </StandardContainer>
        </View>
      )}

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
                <Text style={styles.moodPickerTitle}>{t('editor.howFeeling')}</Text>
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
            <Text style={[styles.recordingLabel, { color: '#8b5cf6' }]}>{t('editor.listening')}</Text>
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: scrollPaddingBottom }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={onFollowBottomScroll}
          onContentSizeChange={onFollowBottomContentSizeChange}
          onScrollBeginDrag={() => {
            onFollowBottomScrollBeginDrag();
            closeQuickActions();
          }}
        >
          <TextInput
            style={[styles.titleInput, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}
            placeholder={t('editor.titleOptional')}
            placeholderTextColor={isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
            value={title}
            onChangeText={handleTitleChange}
            multiline
            scrollEnabled={false}
            blurOnSubmit
            returnKeyType="done"
          />

          {/* Branded Prompt Display */}
          {promptText && (
            <View style={styles.promptBanner}>
              <View style={styles.promptIconWrap}>
                <InsightCompanionMark size={22} isDark={isDarkTheme(theme.name)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promptLabel}>{t('editor.insightPrompt')}</Text>
                <Text style={[styles.promptQuestion, { color: isDarkTheme(theme.name) ? 'rgba(200, 180, 255, 0.9)' : '#4a3a6b' }]}>{promptText}</Text>
              </View>
            </View>
          )}

          <View style={styles.contentInputWrap}>
            {!content.trim() && !contentFocused && animatedPlaceholder ? (
              <Text
                pointerEvents="none"
                style={[
                  styles.contentInput,
                  styles.placeholderOverlay,
                  { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.42)' : 'rgba(0, 0, 0, 0.42)' },
                ]}
              >
                {animatedPlaceholder}
              </Text>
            ) : null}
            <TextInput
              ref={contentInputRef}
              style={[styles.contentInput, { color: isDarkTheme(theme.name) ? 'rgba(255, 255, 255, 0.95)' : '#1a1a1a' }]}
              value={content}
              onChangeText={handleContentChange}
              placeholder=""
              onFocus={() => { closeQuickActions(); setContentFocused(true); }}
              onBlur={() => setContentFocused(false)}
              multiline
              textAlignVertical="top"
              autoFocus={false}
            />
          </View>

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
                <InsightCompanionMark size={22} isDark={isDarkTheme(theme.name)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promptLabel}>{t('editor.newDirection')}</Text>
                <Text style={[styles.promptQuestion, { color: isDarkTheme(theme.name) ? 'rgba(200, 180, 255, 0.9)' : '#4a3a6b' }]}>{inlinePrompt}</Text>
              </View>
              <TouchableOpacity onPress={() => setInlinePrompt(null)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="rgba(139,92,246,0.5)" />
              </TouchableOpacity>
            </View>
          )}

          <View onLayout={onGoDeeperAnchorLayout} collapsable={false}>
            <GoDeeperThread
              messages={goDeeperMessages}
              replyText={goDeeperReply}
              onReplyChange={setGoDeeperReply}
              onSendReply={handleGoDeeperReply}
              isLoading={isGoDeeperLoading}
              isDark={isDarkTheme(theme.name)}
              replyPlaceholder={t('editor.goDeeperReply')}
              revealingMessageId={revealingMessageId}
              onRevealComplete={finishReveal}
              onTypewriterProgress={() => scrollToEndIfFollowing(true)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </View>

      {/* Bottom-Left Quick Actions Button */}
      <Animated.View style={[styles.quickActionsButton, { bottom: controlsBottomAnim }]}>
        <TouchableOpacity 
          onPress={toggleQuickActions}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.openQuickActions')}
        >
          <View style={styles.fabOuter}>
            <LinearGradient
              colors={isDarkTheme(theme.name) ? ['#7c3aed', '#6366f1'] : ['#8b5cf6', '#7c3aed']}
              style={styles.fabGradient}
            >
              <Ionicons 
                name={showQuickActions ? "close" : "add"} 
                size={24} 
                color="#ffffff" 
              />
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <EntryQuickActionsMenu
        visible={showQuickActions}
        bottomOffset={controlsBottom}
        isDark={isDarkTheme(theme.name)}
        onClose={closeQuickActions}
        actions={quickActionItems}
      />

      <PremiumDialog
        visible={showScanSoon}
        title={t('home.comingSoon')}
        message={t('home.scanSoon')}
        icon="scan-outline"
        onDismiss={() => setShowScanSoon(false)}
        actions={[{ label: t('common.ok'), variant: 'primary', onPress: () => setShowScanSoon(false) }]}
      />

      {/* Bottom-Right Go Deeper Button */}
      <Animated.View style={[styles.sparkleButton, { bottom: controlsBottomAnim }]} pointerEvents="box-none">
        <TouchableOpacity 
          onPress={handleGoDeeper}
          activeOpacity={0.8}
          disabled={isGoDeeperLoading || !content.trim()}
        >
          <LinearGradient
            colors={isGoDeeperLoading ? ['#6b46c1', '#553c9a'] : ['#8b5cf6', '#7c3aed']}
            style={styles.sparkleFabGradient}
          >
            {isGoDeeperLoading ? (
              <Ionicons name="hourglass" size={28} color="#ffffff" />
            ) : (
              <Ionicons name="sparkles" size={28} color="#ffffff" />
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
            <Text style={[styles.personalityTitle, { color: isDarkTheme(theme.name) ? '#fff' : '#1a1a1a' }]}>{t('editor.aiPersonality')}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
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
    paddingTop: 30,
    paddingBottom: 12,
    lineHeight: 32,
  },
  contentInput: {
    flex: 1,
    fontSize: 17,
    lineHeight: 26,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 100,
  },
  contentInputWrap: {
    flex: 1,
    position: 'relative',
  },
  placeholderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
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
    zIndex: 200,
    elevation: 24,
  },
  fabOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...(Platform.OS === 'android'
      ? {}
      : {
          shadowColor: '#8b5cf6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }),
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    zIndex: 10,
  },
  sparkleFabGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
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
  checkInChipWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  checkInChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  checkInChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkInSymbol: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139,92,246,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
