import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  Modal,
  ScrollView,
  Alert,
  LayoutAnimation,
  UIManager,
  Image,
  InteractionManager,
  Share,
  Pressable,
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { mobileAiService, getRoastChatSuggestions } from '../services/mobileAiService';
import {
  stopMiraVoice,
  isElevenLabsAvailable,
  loadMiraVoiceSelection,
  saveMiraVoiceSelection,
  startMiraSpeechSync,
  estimateSpeechDurationMs,
  subscribeMiraSpeaking,
  MIRA_VOICE_KEY,
  type MiraSpeechSyncHandle,
  type MiraVoiceSelection,
} from '../services/miraVoiceService';
import { AiPersonality, CHAT_PERSONALITIES, PERSONALITY_EMOJI } from '../utils/aiPersonalities';
import { sf } from '../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { getCachedChatSuggestions, setCachedChatSuggestions } from '../utils/chatSuggestionsCache';
import InsightCompanionMark from '../components/companion/InsightCompanionMark';
import MiraVoicePicker from '../components/companion/MiraVoicePicker';
import MiraVoiceOverlay from '../components/companion/MiraVoiceOverlay';
import Purchases from 'react-native-purchases';
import { ROAST_GRADIENT, ROAST_PALETTE, useRoastTransition } from '../utils/companionTheme';
import { getMiraScreenshotMode, SCREENSHOT_MIRA_CHAT } from '../data/screenshotMiraChat';
import { AppLanguage } from '../i18n/types';

function buildScreenshotMessages(language: AppLanguage): ChatMessage[] {
  const seed = SCREENSHOT_MIRA_CHAT[language] ?? SCREENSHOT_MIRA_CHAT.en;
  const now = Date.now();
  return seed.map((m, i) => ({
    ...m,
    timestamp: new Date(now - (seed.length - i) * 60_000),
  }));
}

function PulsingRoastDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.35, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.45, duration: 900, useNativeDriver: true }),
      ]),
    );
    scaleLoop.start();
    glowLoop.start();
    return () => {
      scaleLoop.stop();
      glowLoop.stop();
    };
  }, [pulse, glow]);

  return (
    <Animated.View
      style={[
        styles.headerDotPulse,
        {
          opacity: glow,
          transform: [{ scale: pulse }],
        },
      ]}
    />
  );
}

const CHAT_HISTORY_KEY_PREFIX = 'AI_CHAT_HISTORY_';
const AI_PERSONALITY_KEY = 'AI_PERSONALITY';
const AI_VOICE_READOUT_KEY = 'MIRA_VOICE_READOUT';
const ROAST_MODE_ACK_KEY = 'ROAST_MODE_ACK';
const FREE_USER_DAILY_LIMIT = 50;

/** Fixed layout slots — prevents jolt when roast badge toggles. */
const HEADER_BODY_HEIGHT = 40;
const EMPTY_ORB_SLOT = 90;
const EMPTY_SUBTITLE_HEIGHT = 56;
const ROAST_BADGE_SLOT = 42;

/** Fixed input footer slots — prevents jolt when temp row toggles. */
const INPUT_TEMP_SLOT = 28;
const INPUT_CARD_MIN_HEIGHT = 88;
const INPUT_CONTAINER_PADDING_TOP = 10;
const INPUT_FOOTER_MIN_HEIGHT =
  INPUT_CONTAINER_PADDING_TOP + INPUT_TEMP_SLOT + INPUT_CARD_MIN_HEIGHT;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  displayedContent?: string;
  isTyping?: boolean;
  timestamp: Date;
}

interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isTemporary?: boolean;
}

type Personality = AiPersonality;

export default function AIChatScreen({ navigation }: any) {
  const screenshotMode = getMiraScreenshotMode();
  const isScreenshotBlank = screenshotMode === 'blank';
  const isScreenshotMessages = screenshotMode === 'messages';
  const isScreenshotActive = screenshotMode !== 'off';
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const personalities: { key: Personality; label: string; emoji: string; desc: string }[] = CHAT_PERSONALITIES.map((key) => ({
    key,
    label: t(`editor.personalities.${key}`),
    emoji: PERSONALITY_EMOJI[key],
    desc: t(`editor.personalities.${key}Desc`),
  }));
  const isDark = theme.name === 'dark' || theme.name === 'midnight' || theme.name === 'forest';
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(() =>
    user?.id ? getCachedChatSuggestions(user.id) : [],
  );
  const [showSuggestions, setShowSuggestions] = useState(() => !isScreenshotActive);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureError, setProfilePictureError] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [showPersonality, setShowPersonality] = useState(false);
  const [personality, setPersonality] = useState<Personality>('balanced');
  const isRoast = personality === 'roast';
  const { normalOpacity, roastOpacity } = useRoastTransition(isRoast);
  const normalGradient = (theme.colors.backgroundGradient as [string, string, ...string[]]) || ['#f5f0ff', '#fce8f0', '#fff5f0'];
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [isTemporary, setIsTemporary] = useState(isScreenshotActive);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [isProUser, setIsProUser] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechSyncRef = useRef<MiraSpeechSyncHandle | null>(null);
  const typingStartRef = useRef(0);
  const typingDurationRef = useRef(0);
  const syncTimedOutRef = useRef(false);
  const initRef = useRef(0);
  const getChatHistoryKey = useCallback(
    () => `${CHAT_HISTORY_KEY_PREFIX}${user?.id || 'anonymous'}`,
    [user?.id],
  );

  useEffect(() => {
    if (!isScreenshotActive) return;
    if (isScreenshotMessages) {
      setMessages(buildScreenshotMessages(language));
    } else {
      setMessages([]);
    }
    setShowSuggestions(false);
    setIsTemporary(true);
    setCurrentChatId(null);
  }, [isScreenshotActive, isScreenshotMessages, language]);

  useEffect(() => {
    if (!user?.id) return;
    const gen = ++initRef.current;

    // Show cached suggestions immediately
    setSuggestions(getCachedChatSuggestions(user.id));

    InteractionManager.runAfterInteractions(() => {
      if (gen !== initRef.current) return;

      const loadCached = async () => {
        const [cached, savedPersonality, historyRaw, voiceReadout] = await Promise.all([
          AsyncStorage.getItem(`CACHED_PROFILE_PICTURE_${user.id}`),
          AsyncStorage.getItem(AI_PERSONALITY_KEY),
          AsyncStorage.getItem(getChatHistoryKey()),
          AsyncStorage.getItem(AI_VOICE_READOUT_KEY),
        ]);
        if (gen !== initRef.current) return;
        if (cached) setProfilePicture(cached);
        if (savedPersonality && CHAT_PERSONALITIES.includes(savedPersonality as Personality)) {
          setPersonality(savedPersonality as Personality);
        }

        if (voiceReadout === 'true') {
          setIsVoiceEnabled(true);
        }
        if (historyRaw) {
          const chats: SavedChat[] = JSON.parse(historyRaw);
          setSavedChats(chats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        }
      };

      loadCached();
      loadSuggestions();
    });

    return () => {
      initRef.current++;
    };
  }, [user?.id, getChatHistoryKey]);

  useEffect(() => {
    return subscribeMiraSpeaking(setIsAudioPlaying);
  }, []);

  const interruptVoice = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    speechSyncRef.current = null;
    syncTimedOutRef.current = true;
    stopMiraVoice();
    setMessages((prev) =>
      prev.map((m) =>
        m.isTyping
          ? { ...m, displayedContent: m.content, isTyping: false }
          : m,
      ),
    );
  }, []);

  // When user changes (account switch), reset chat state
  useEffect(() => {
    if (!user?.id) return;
    if (isScreenshotActive) {
      if (isScreenshotMessages) {
        setMessages(buildScreenshotMessages(language));
      } else {
        setMessages([]);
      }
      setShowSuggestions(false);
      setIsTemporary(true);
      setCurrentChatId(null);
      return;
    }
    setMessages([]);
    setCurrentChatId(null);
    setShowSuggestions(true);
  }, [user?.id, isScreenshotActive, isScreenshotMessages, language]);

  // Reload current chat when screen comes into focus - only if messages are empty
  useFocusEffect(
    React.useCallback(() => {
      const reloadCurrentChat = async () => {
        if (isScreenshotActive) return;
        if (currentChatId && user && messages.length === 0) {
          try {
            const raw = await AsyncStorage.getItem(getChatHistoryKey());
            if (raw) {
              const chats: SavedChat[] = JSON.parse(raw);
              const currentChat = chats.find(c => c.id === currentChatId);
              if (currentChat && currentChat.messages.length > 0) {
                setMessages(currentChat.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
              }
            }
          } catch (e) {
            console.error('[AIChat] Error reloading chat on focus', e);
          }
        }
      };
      reloadCurrentChat();
      if (user?.id) {
        AsyncStorage.getItem(`CACHED_PROFILE_PICTURE_${user.id}`).then((p) => {
          if (p) {
            setProfilePicture(p);
            setProfilePictureError(false);
          }
        });
      }
    }, [currentChatId, user])
  );

  const clearTypingEffect = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    speechSyncRef.current = null;
    stopMiraVoice();
  }, []);

  useEffect(() => {
    return () => {
      clearTypingEffect();
    };
  }, [clearTypingEffect]);

  // Auto-save chat when messages change (only when typing is complete)
  useEffect(() => {
    if (isScreenshotActive) return;
    if (messages.length > 0 && !isTemporary) {
      saveChatToHistory();
    }
  }, [messages.filter(m => !m.isTyping).length]);

  const loadSuggestions = async () => {
    if (personality === 'roast') {
      setSuggestions(getRoastChatSuggestions());
      return;
    }
    try {
      const s = await mobileAiService.getChatSuggestions();
      setSuggestions(s);
      if (user?.id) setCachedChatSuggestions(user.id, s);
    } catch {
      const fallback = getCachedChatSuggestions(user?.id || '');
      setSuggestions(fallback);
    }
  };

  useEffect(() => {
    if (showSuggestions && messages.length === 0) {
      loadSuggestions();
    }
  }, [personality]);

  const applyPersonality = async (key: Personality) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPersonality(key);
    await AsyncStorage.setItem(AI_PERSONALITY_KEY, key);
    setShowPersonality(false);
    if (key === 'roast' && isElevenLabsAvailable()) {
      const savedVoice = await loadMiraVoiceSelection();
      if (!savedVoice) {
        await saveMiraVoiceSelection({
          source: 'elevenlabs',
          id: 'IRHApOXLvnW57QJPQH2P',
          label: 'Tough Male',
        });
      }
    }
    if (showSuggestions && messages.length === 0) {
      loadSuggestions();
    }
  };

  const handleSelectPersonality = async (key: Personality) => {
    if (key === 'roast') {
      const acked = await AsyncStorage.getItem(ROAST_MODE_ACK_KEY);
      if (!acked) {
        Alert.alert(
          t('companion.roastModeTitle'),
          t('companion.roastModeWarning'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('companion.enableRoast'),
              style: 'destructive',
              onPress: async () => {
                await AsyncStorage.setItem(ROAST_MODE_ACK_KEY, 'true');
                await applyPersonality('roast');
              },
            },
          ],
        );
        return;
      }
    }
    await applyPersonality(key);
  };

  const enableVoiceMode = async () => {
    setIsVoiceEnabled(true);
    await AsyncStorage.setItem(AI_VOICE_READOUT_KEY, 'true');
  };

  const toggleVoiceMode = async () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    await AsyncStorage.setItem(AI_VOICE_READOUT_KEY, next ? 'true' : 'false');
    if (!next) {
      interruptVoice();
    }
  };

  const handleVoiceSelected = async (selection: MiraVoiceSelection) => {
    await enableVoiceMode();
    console.log('[AIChatScreen] Voice mode enabled for', selection.label);
  };

  const shareMessage = async (content: string) => {
    try {
      await Share.share({ message: `${t('companion.sharePrefix')} "${content}"` });
    } catch (e) {
      console.warn('[AIChat] Share failed', e);
    }
  };


  const loadChatHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem(getChatHistoryKey());
      if (raw) {
        const chats: SavedChat[] = JSON.parse(raw);
        setSavedChats(chats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      }
    } catch (e) {
      console.error('[AIChat] Error loading history', e);
    }
  };

  const saveChatToHistory = async () => {
    if (isTemporary || messages.length === 0) return;
    try {
      const raw = await AsyncStorage.getItem(getChatHistoryKey());
      let chats: SavedChat[] = raw ? JSON.parse(raw) : [];

      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg ? firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '…' : '') : t('companion.newChat');
      const chatId = currentChatId || `chat-${Date.now()}`;

      if (!currentChatId) setCurrentChatId(chatId);

      const existing = chats.findIndex(c => c.id === chatId);
      const chatData: SavedChat = {
        id: chatId,
        title,
        messages: messages.map(m => ({ ...m, displayedContent: undefined, isTyping: undefined })),
        createdAt: existing >= 0 ? chats[existing].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existing >= 0) {
        chats[existing] = chatData;
      } else {
        chats.unshift(chatData);
      }

      // Keep max 30 chats
      if (chats.length > 30) chats = chats.slice(0, 30);
      await AsyncStorage.setItem(getChatHistoryKey(), JSON.stringify(chats));
    } catch (e) {
      console.error('[AIChat] Error saving chat', e);
    }
  };

  const loadChat = (chat: SavedChat) => {
    clearTypingEffect();
    setMessages(chat.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
    setCurrentChatId(chat.id);
    setShowSuggestions(false);
    setShowHistory(false);
    setIsTemporary(false);
  };

  const deleteChat = async (chatId: string) => {
    try {
      const raw = await AsyncStorage.getItem(getChatHistoryKey());
      if (raw) {
        let chats: SavedChat[] = JSON.parse(raw);
        chats = chats.filter(c => c.id !== chatId);
        await AsyncStorage.setItem(getChatHistoryKey(), JSON.stringify(chats));
        setSavedChats(chats);
        if (currentChatId === chatId) {
          startNewChat();
        }
      }
    } catch (e) {
      console.error('[AIChat] Error deleting chat', e);
    }
  };

  const startNewChat = () => {
    clearTypingEffect();
    setMessages([]);
    setCurrentChatId(null);
    setShowSuggestions(false);
    setIsTemporary(false);
    setShowHistory(false);
  };

  const startSyncedTypingEffect = (messageId: string, fullContent: string) => {
    clearTypingEffect();
    syncTimedOutRef.current = false;

    console.log('[AIChatScreen] Starting typed reveal', {
      isVoiceEnabled,
      charCount: fullContent.length,
    });

    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, displayedContent: isVoiceEnabled ? '…' : '', isTyping: true } : m
    ));

    if (isVoiceEnabled) {
      startMiraSpeechSync(fullContent, personality)
        .then((result) => {
          speechSyncRef.current = result.handle;
          if (result.error) {
            console.warn('[AIChatScreen] Voice error:', result.error);
            Alert.alert(
              result.paymentRequired
                ? t('companion.voicePaidRequiredTitle')
                : t('companion.voiceErrorTitle'),
              result.error,
            );
          }
          if (result.handle) {
            setMessages(prev => prev.map(m =>
              m.id === messageId && m.isTyping && m.displayedContent === '…'
                ? { ...m, displayedContent: '' }
                : m
            ));
          }
        })
        .catch((error) => {
          console.error('[AIChatScreen] Speech sync failed:', error);
          syncTimedOutRef.current = true;
        });

      typingDurationRef.current = estimateSpeechDurationMs(fullContent);
      typingStartRef.current = Date.now();

      const TICK_MS = 45;
      const SYNC_WAIT_MS = 15000;

      typingIntervalRef.current = setInterval(() => {
        const sync = speechSyncRef.current;
        let progress: number;

        if (!sync) {
          if (Date.now() - typingStartRef.current > SYNC_WAIT_MS) {
            syncTimedOutRef.current = true;
            console.warn('[AIChatScreen] Speech sync timeout — showing text without audio sync');
          } else {
            return;
          }
        }

        if (sync && !syncTimedOutRef.current) {
          progress = sync.getProgress();
        } else {
          progress = Math.min(1, (Date.now() - typingStartRef.current) / typingDurationRef.current);
        }

        const charIndex = Math.min(fullContent.length, Math.max(1, Math.floor(progress * fullContent.length)));
        const currentText = fullContent.slice(0, charIndex);

        if (progress >= 1 || charIndex >= fullContent.length) {
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
          speechSyncRef.current = null;
          setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, displayedContent: fullContent, isTyping: false } : m
          ));
        } else {
          setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, displayedContent: currentText } : m
          ));
        }

        flatListRef.current?.scrollToEnd({ animated: true });
      }, TICK_MS);
      return;
    }

    const FAST_TICK_MS = 8;
    const CHARS_PER_TICK = 4;
    let charIndex = 0;

    typingIntervalRef.current = setInterval(() => {
      charIndex = Math.min(fullContent.length, charIndex + CHARS_PER_TICK);
      const currentText = fullContent.slice(0, charIndex);

      if (charIndex >= fullContent.length) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, displayedContent: fullContent, isTyping: false } : m
        ));
      } else {
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, displayedContent: currentText } : m
        ));
      }

      flatListRef.current?.scrollToEnd({ animated: true });
    }, FAST_TICK_MS);
  };

  // Rate limiting check function
  const checkAndUpdateUsage = async (): Promise<boolean> => {
    try {
      console.log('[AIChatScreen] 🔍 Checking rate limit...');
      if (!user) {
        console.log('[AIChatScreen] ❌ No user found');
        return false;
      }
      
      // Check if user is Pro
      console.log('[AIChatScreen] Checking Pro status...');
      const customerInfo = await Purchases.getCustomerInfo();
      let isPro = !!customerInfo.entitlements.active['InsightAI Pro'] || Object.keys(customerInfo.entitlements.active).length > 0;
      
      // CRITICAL: Verify subscription belongs to THIS user, not another account on same device
      if (isPro) {
        const originalOwner = customerInfo.originalAppUserId;
        const isOwnSubscription = originalOwner === user.id || originalOwner?.startsWith('$RCAnonymousID:');
        if (!isOwnSubscription) {
          console.log('[AIChatScreen] ⚠️ Subscription belongs to different user:', originalOwner, 'current:', user.id);
          isPro = false;
        }
      }
      
      setIsProUser(isPro);
      console.log('[AIChatScreen] Is Pro:', isPro);
      
      // Pro users have unlimited messages
      if (isPro) {
        console.log('[AIChatScreen] ✅ Pro user - unlimited messages');
        return true;
      }
      
      // Get today's usage
      const today = new Date().toISOString().split('T')[0];
      console.log('[AIChatScreen] Checking usage for date:', today);
      const { data: usage, error } = await supabase
        .from('ai_chat_usage')
        .select('message_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('[AIChatScreen] ❌ Error checking usage:', error);
        // Allow message to go through on error to avoid blocking users
        return true;
      }
      
      const currentCount = usage?.message_count || 0;
      setDailyMessageCount(currentCount);
      console.log('[AIChatScreen] Current usage:', currentCount, '/', FREE_USER_DAILY_LIMIT);
      
      // Check if limit reached
      if (currentCount >= FREE_USER_DAILY_LIMIT) {
        console.log('[AIChatScreen] ❌ Daily limit reached');
        Alert.alert(
          t('companion.dailyLimitTitle'),
          t('companion.dailyLimitMessage', { limit: FREE_USER_DAILY_LIMIT }),
          [
            { text: t('companion.maybeLater'), style: 'cancel' },
            { text: t('companion.upgradePro'), onPress: () => navigation.navigate('Paywall') }
          ]
        );
        return false;
      }
      
      // Increment usage
      console.log('[AIChatScreen] Incrementing usage count...');
      if (usage) {
        const { error: updateError } = await supabase
          .from('ai_chat_usage')
          .update({ message_count: currentCount + 1, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('date', today);
        if (updateError) console.error('[AIChatScreen] Update error:', updateError);
      } else {
        const { error: insertError } = await supabase
          .from('ai_chat_usage')
          .insert({ user_id: user.id, date: today, message_count: 1 });
        if (insertError) console.error('[AIChatScreen] Insert error:', insertError);
      }
      
      setDailyMessageCount(currentCount + 1);
      console.log('[AIChatScreen] ✅ Rate limit check passed');
      return true;
      
    } catch (error) {
      console.error('[AIChatScreen] ❌ Exception in checkAndUpdateUsage:', error);
      // Allow message to go through on error to avoid blocking users
      return true;
    }
  };

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text || inputText).trim();
    if (!messageText || isLoading) return;

    // PREMIUM GATE: Only Pro users can use AI chat
    if (!isProUser) {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const isPro = !!customerInfo.entitlements.active['InsightAI Pro'] || Object.keys(customerInfo.entitlements.active).length > 0;
        if (!isPro) {
          Alert.alert(
            t('companion.proFeature'),
            t('companion.proFeatureMessage'),
            [
              { text: t('companion.maybeLater'), style: 'cancel' },
              { text: t('companion.upgradePro'), onPress: () => navigation.navigate('Paywall') }
            ]
          );
          return;
        }
        setIsProUser(true);
      } catch (e) {
        console.error('[AIChatScreen] Error checking pro status:', e);
      }
    }

    // CHECK RATE LIMIT BEFORE SENDING
    const canSend = await checkAndUpdateUsage();
    if (!canSend) return;

    clearTypingEffect();

    setInputText('');
    setShowSuggestions(false);
    Keyboard.dismiss();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      console.log('[AIChatScreen] 📤 Sending message to AI...');
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      console.log('[AIChatScreen] Message count:', allMessages.length);
      const response = await mobileAiService.chat(allMessages, { personality });
      console.log('[AIChatScreen] ✅ Received AI response, length:', response?.length);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        displayedContent: '',
        isTyping: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      startSyncedTypingEffect(assistantMessage.id, response);
    } catch (error: any) {
      console.error('[AIChatScreen] ❌ Error sending message:', error);
      console.error('[AIChatScreen] Error details:', JSON.stringify(error, null, 2));
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: t('companion.connectionError', { detail: error?.message || t('companion.tryAgain') }),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, personality, isVoiceEnabled]);

  const MessageBubble = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const displayText = isUser
      ? item.content
      : item.isTyping
        ? (item.displayedContent ?? '')
        : item.content;

    if (isUser) {
      return (
        <View style={[styles.messageBubbleContainer, styles.userBubbleContainer]}>
          <LinearGradient
            colors={isRoast ? ROAST_PALETTE.sendGradient : ['#9f7aea', '#8b5cf6', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.messageBubble, styles.userBubble]}
          >
            <Text style={[styles.messageText, styles.userMessageText]}>{displayText}</Text>
          </LinearGradient>
          <View style={styles.userAvatarWrap}>
            {profilePicture && !profilePictureError ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.userAvatarImageDirect}
                resizeMode="cover"
                onError={() => setProfilePictureError(true)}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={32} color={theme.colors.secondaryText} />
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageBubbleContainer, styles.assistantBubbleContainer]}>
        <View style={styles.avatarWrap}>
          <InsightCompanionMark size={26} isDark={isDark || isRoast} roast={isRoast} />
        </View>
        <View style={styles.assistantBubbleColumn}>
          <Pressable
            onPress={() => setActiveMessageId((prev) => (prev === item.id ? null : item.id))}
            style={({ pressed }) => [pressed && { opacity: 0.92 }]}
          >
            {isRoast ? (
              <View style={[
                styles.messageBubble,
                styles.assistantBubble,
                {
                  backgroundColor: ROAST_PALETTE.bubbleAssistant,
                  borderWidth: 1,
                  borderColor: ROAST_PALETTE.bubbleAssistantBorder,
                },
              ]}>
                <Text style={[styles.messageText, styles.assistantMessageText, { color: ROAST_PALETTE.textPrimary, fontWeight: '600' }]}>
                  {displayText}
                </Text>
              </View>
            ) : (
              <LinearGradient
                colors={isDark
                  ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.06)', 'rgba(139,92,246,0.05)']
                  : ['rgba(255,255,255,0.95)', 'rgba(248,242,255,0.88)', 'rgba(255,241,247,0.82)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.messageBubble,
                  styles.assistantBubble,
                  {
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(196,181,253,0.14)' : 'rgba(139,92,246,0.12)',
                  },
                ]}
              >
                <Text style={[
                  styles.messageText,
                  styles.assistantMessageText,
                  { color: isDark ? 'rgba(255,255,255,0.94)' : theme.colors.primaryText },
                ]}>
                  {displayText}
                </Text>
              </LinearGradient>
            )}
          </Pressable>
          {!item.isTyping && activeMessageId === item.id && (
            <View style={styles.messageActions}>
              <TouchableOpacity
                style={styles.messageActionBtn}
                onPress={() => shareMessage(item.content)}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={15} color={isRoast ? ROAST_PALETTE.icon : 'rgba(196,181,253,0.9)'} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => <MessageBubble item={item} />;

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.orbContainer}>
        <View style={styles.orb}>
          <InsightCompanionMark size={68} isDark={isDark || isRoast} roast={isRoast} />
        </View>
      </View>

      <View style={styles.emptySubtitleSlot}>
        <Text style={[
          styles.emptySubtitle,
          { color: isRoast ? ROAST_PALETTE.textSecondary : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)') },
          isRoast && { fontWeight: '500' },
        ]}>
          {t('companion.emptySubtitle')}
        </Text>
      </View>

      <View style={styles.roastBadgeSlot}>
        {isRoast ? (
          <View style={styles.roastBadge}>
            <Text style={styles.roastBadgeText}>💀 {t('editor.personalities.roast')} Mode</Text>
          </View>
        ) : null}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, isRoast && styles.suggestionsContainerRoast]}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestionChip,
                isRoast
                  ? { borderColor: ROAST_PALETTE.chipBorder, backgroundColor: ROAST_PALETTE.chipBg, shadowOpacity: 0 }
                  : {
                      shadowOpacity: isDark ? 0.22 : 0.14,
                      borderColor: isDark ? 'rgba(196,181,253,0.2)' : 'rgba(139,92,246,0.18)',
                    },
              ]}
              onPress={() => sendMessage(suggestion)}
              activeOpacity={0.8}
            >
              {isRoast ? (
                <View style={styles.suggestionChipInnerRoast}>
                  <Text style={[styles.suggestionText, { color: ROAST_PALETTE.textPrimary, fontWeight: '600' }]} numberOfLines={2}>
                    {suggestion}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={ROAST_PALETTE.accent} style={{ marginLeft: 12, flexShrink: 0 }} />
                </View>
              ) : (
                <LinearGradient
                  colors={isDark
                    ? ['rgba(139,92,246,0.2)', 'rgba(72,48,116,0.16)', 'rgba(18,16,28,0.3)']
                    : ['rgba(255,255,255,0.88)', 'rgba(244,235,255,0.82)', 'rgba(255,241,247,0.72)']}
                  style={styles.suggestionChipInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.suggestionHighlight, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)' }]} />
                  <Text style={[styles.suggestionText, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }]} numberOfLines={2}>{suggestion}</Text>
                  <Ionicons name="arrow-forward" size={14} color="rgba(167,139,250,0.7)" style={{ marginLeft: 12, flexShrink: 0 }} />
                </LinearGradient>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isRoast ? ROAST_GRADIENT[0] : theme.colors.background }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: normalOpacity }]}>
        <LinearGradient colors={normalGradient} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: roastOpacity }]}>
        <LinearGradient colors={[...ROAST_GRADIENT]} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingTop: insets.top + 8,
          minHeight: insets.top + 8 + HEADER_BODY_HEIGHT,
          borderBottomColor: isRoast ? 'rgba(239,68,68,0.2)' : 'rgba(139,92,246,0.1)',
        },
      ]}>
        <View style={styles.headerSide}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => requestAnimationFrame(() => navigation.goBack())} activeOpacity={0.7}>
            <Ionicons name="chevron-down" size={28} color={isRoast ? ROAST_PALETTE.textPrimary : (isDark ? '#fff' : theme.colors.primaryText)} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            {isRoast ? <PulsingRoastDot /> : <View style={styles.headerDot} />}
            <Text style={[styles.headerTitle, { color: isRoast ? ROAST_PALETTE.textPrimary : (isDark ? '#fff' : theme.colors.primaryText) }]}>
              {t('companion.headerTitle')}{isRoast ? ' 💀' : ''}
            </Text>
          </View>
        </View>
        <View style={[styles.headerSide, styles.headerSideRight]}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setShowPersonality(true)}
            onLongPress={() => setShowVoicePicker(true)}
            delayLongPress={400}
            activeOpacity={0.7}
            accessibilityLabel={t('companion.personalityTitle')}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={isRoast ? ROAST_PALETTE.icon : (isDark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.45)')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              loadChatHistory();
              setShowHistory(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubbles-outline" size={22} color={isRoast ? ROAST_PALETTE.icon : (isDark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.45)')} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          extraData={messages}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && showSuggestions && styles.emptyMessagesList,
          ]}
          ListEmptyComponent={showSuggestions ? renderEmptyState : null}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setActiveMessageId(null)}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
        />


        {/* Input bar — spacer preserves layout when voice overlay is active */}
        {isAudioPlaying && isVoiceEnabled ? (
          <View style={{ minHeight: INPUT_FOOTER_MIN_HEIGHT + Math.max(insets.bottom, 12) }} />
        ) : (
        <View style={[
          styles.inputContainer,
          { paddingBottom: Math.max(insets.bottom, 12), minHeight: (messages.length === 0 ? INPUT_FOOTER_MIN_HEIGHT : INPUT_CONTAINER_PADDING_TOP + INPUT_CARD_MIN_HEIGHT) + Math.max(insets.bottom, 12) },
        ]}>
          {messages.length === 0 && showSuggestions && (
            <View style={styles.tempSlot}>
              <TouchableOpacity
                style={styles.tempToggle}
                onPress={() => setIsTemporary(!isTemporary)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isTemporary ? 'eye-off-outline' : 'save-outline'}
                  size={13}
                  color={isTemporary ? '#ef4444' : (isDark ? 'rgba(255,255,255,0.35)' : theme.colors.tertiaryText)}
                />
                <Text style={[
                  styles.tempToggleText,
                  { color: isDark ? 'rgba(255,255,255,0.35)' : theme.colors.tertiaryText },
                  isTemporary && { color: '#ef4444' },
                ]}>
                  {isTemporary ? t('companion.temporaryChat') : t('companion.chatSaved')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={[
            styles.inputCard,
            isRoast
              ? { backgroundColor: ROAST_PALETTE.inputBg, borderColor: ROAST_PALETTE.inputBorder }
              : {
                  backgroundColor: isDark ? '#1c1c22' : '#f3f3f4',
                  borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                },
          ]}>
            <TextInput
              ref={inputRef}
              style={[styles.textInput, { color: isRoast ? ROAST_PALETTE.textPrimary : (isDark ? '#fff' : theme.colors.primaryText) }]}
              placeholder={t('companion.inputPlaceholder')}
              placeholderTextColor={isRoast ? 'rgba(255,255,255,0.35)' : (isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.35)')}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              returnKeyType="default"
              blurOnSubmit={false}
            />
            <View style={styles.inputToolbar}>
              <TouchableOpacity
                style={styles.toolbarBtn}
                onPress={toggleVoiceMode}
                onLongPress={() => setShowVoicePicker(true)}
                activeOpacity={0.7}
                accessibilityLabel={t('companion.voiceReadout')}
              >
                <Ionicons
                  name={isVoiceEnabled ? 'mic' : 'mic-outline'}
                  size={20}
                  color={isVoiceEnabled ? (isRoast ? ROAST_PALETTE.accent : '#a78bfa') : (isRoast ? ROAST_PALETTE.icon : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'))}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                onPress={() => sendMessage()}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.sendButtonInner,
                  inputText.trim() && !isLoading
                    ? { backgroundColor: isRoast ? ROAST_PALETTE.accent : '#8b5cf6' }
                    : { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                ]}>
                  <Ionicons
                    name="arrow-up"
                    size={18}
                    color={inputText.trim() && !isLoading ? '#fff' : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)')}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        )}
      </KeyboardAvoidingView>

      {/* Chat History Modal */}
      <Modal visible={showHistory} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
          <View style={[styles.modalContent, { backgroundColor: '#111' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('companion.chats')}</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={startNewChat} activeOpacity={0.7}>
                  <Ionicons name="add-circle" size={28} color="#8b5cf6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowHistory(false)} activeOpacity={0.7}>
                  <Ionicons name="close" size={28} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
              {savedChats.length === 0 ? (
                <Text style={styles.noChatText}>{t('companion.noSavedChats')}</Text>
              ) : (
                savedChats.map(chat => (
                  <TouchableOpacity
                    key={chat.id}
                    style={[
                      styles.chatHistoryItem,
                      { backgroundColor: 'rgba(255,255,255,0.05)' },
                      currentChatId === chat.id && { borderColor: '#8b5cf6', borderWidth: 1 },
                    ]}
                    onPress={() => loadChat(chat)}
                    onLongPress={() => {
                      Alert.alert(t('companion.deleteChat'), t('companion.areYouSure'), [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('common.delete'), style: 'destructive', onPress: () => deleteChat(chat.id) },
                      ]);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.chatHistoryTitle, { color: '#fff' }]} numberOfLines={1}>
                        {chat.title}
                      </Text>
                      <Text style={styles.chatHistoryDate}>
                        {new Date(chat.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {chat.messages.length} messages
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <MiraVoicePicker
        visible={showVoicePicker}
        onClose={() => setShowVoicePicker(false)}
        onSelected={handleVoiceSelected}
      />

      {/* Personality Modal */}
      <Modal visible={showPersonality} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.personalityOverlay}
          activeOpacity={1}
          onPress={() => setShowPersonality(false)}
        >
          <View style={[styles.personalitySheet, { backgroundColor: '#1a1a1a' }]}>
            <Text style={[styles.personalityTitle, { color: '#fff' }]}>{t('companion.personalityTitle')}</Text>
            {personalities.map(p => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.personalityOption,
                  personality === p.key && { backgroundColor: 'rgba(139,92,246,0.15)', borderColor: '#8b5cf6' },
                  p.key === 'roast' && { borderColor: 'rgba(239,68,68,0.35)' },
                ]}
                onPress={() => handleSelectPersonality(p.key)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.personalityLabel, { color: '#fff' }]}>{p.label}</Text>
                  <Text style={styles.personalityDesc}>{p.desc}</Text>
                </View>
                {personality === p.key && <Ionicons name="checkmark-circle" size={22} color="#8b5cf6" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <MiraVoiceOverlay
        visible={isAudioPlaying && isVoiceEnabled}
        isRoast={isRoast}
        isDark={isDark}
        normalGradient={normalGradient}
        speakingLabel={isRoast ? `${t('companion.headerTitle')} 💀` : t('companion.voiceSpeaking')}
        muteLabel={t('companion.voiceMute')}
        onMute={interruptVoice}
      />
    </View>
  );
}

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      );
    animate(dot1, 0).start();
    animate(dot2, 200).start();
    animate(dot3, 400).start();
  }, []);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(139,92,246,0.1)',
  },
  headerSide: { width: 80, flexDirection: 'row', alignItems: 'center' },
  headerSideRight: { justifyContent: 'flex-end' },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  headerDotPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ROAST_PALETTE.dot,
    shadowColor: ROAST_PALETTE.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: { fontSize: sf(17), fontWeight: '600', letterSpacing: 0.2 },
  assistantBubbleColumn: { flex: 1, maxWidth: '82%' },
  messageActions: { flexDirection: 'row', gap: 4, marginTop: 6, marginLeft: 2 },
  messageActionBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196,181,253,0.18)',
  },
  roastBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  roastBadgeSlot: {
    height: ROAST_BADGE_SLOT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  roastBadgeText: { color: '#fca5a5', fontSize: sf(12), fontWeight: '600' },
  chatContainer: { flex: 1 },
  messagesList: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  emptyMessagesList: { flexGrow: 1, justifyContent: 'center' },

  // Empty state
  emptyState: { alignItems: 'center', paddingHorizontal: 24, width: '100%' },
  orbContainer: {
    width: EMPTY_ORB_SLOT,
    height: EMPTY_ORB_SLOT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  orb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySubtitleSlot: {
    minHeight: EMPTY_SUBTITLE_HEIGHT,
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
  },
  emptySubtitle: {
    fontSize: sf(15),
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: sf(22),
    maxWidth: 300,
    fontWeight: '400',
    alignSelf: 'center',
  },
  suggestionsContainer: { width: '100%', gap: 10, minHeight: 132 },
  suggestionsContainerRoast: { marginTop: 4 },
  suggestionChip: {
    borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.18)',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 7 },
    shadowRadius: 16, elevation: 4,
  },
  suggestionChipInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
    borderRadius: 17, overflow: 'hidden',
  },
  suggestionChipInnerRoast: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
    borderRadius: 17,
  },
  suggestionHighlight: {
    position: 'absolute', top: 0, left: 18, right: 18, height: StyleSheet.hairlineWidth,
  },
  suggestionText: {
    fontSize: sf(14.5), color: 'rgba(255,255,255,0.8)', fontWeight: '500', flex: 1,
  },

  // Messages
  messageBubbleContainer: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start', paddingHorizontal: 2 },
  userBubbleContainer: { justifyContent: 'flex-end', alignItems: 'flex-end' },
  assistantBubbleContainer: { justifyContent: 'flex-start', alignItems: 'flex-start' },
  avatarWrap: { marginRight: 8, marginTop: 4, width: 26, height: 26, borderRadius: 13, overflow: 'hidden' },
  avatarGradient: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  userAvatarWrap: { marginLeft: 8, marginBottom: 2 },
  userAvatarFrame: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(139, 92, 246, 0.4)',
    overflow: 'hidden' as any,
  },
  userAvatarImage: { width: '100%' as any, height: '100%' as any, borderRadius: 15 },
  userAvatarImageDirect: { width: 32, height: 32, borderRadius: 16 },
  userAvatarFallback: {
    width: '100%' as any, height: '100%' as any, borderRadius: 15,
    backgroundColor: 'rgba(139, 92, 246, 0.25)', justifyContent: 'center', alignItems: 'center',
  },
  userAvatarInitial: { fontSize: 12, fontWeight: '700', color: '#a78bfa' },
  messageBubble: { maxWidth: '75%', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
  userBubble: { borderBottomRightRadius: 6, marginLeft: 'auto', overflow: 'hidden' },
  assistantBubble: { borderBottomLeftRadius: 6 },
  messageText: { fontSize: sf(15.5), lineHeight: sf(22), fontWeight: '400', letterSpacing: 0.2 },
  userMessageText: { color: '#fff', fontWeight: '500' },
  assistantMessageText: { fontWeight: '400' },

  // Typing
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  typingDotsContainer: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  dotsRow: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8b5cf6' },

  // Input
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: INPUT_CONTAINER_PADDING_TOP,
    borderTopWidth: 0,
  },
  tempSlot: {
    height: INPUT_TEMP_SLOT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  tempToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6,
  },
  tempToggleText: { fontSize: 11, letterSpacing: 0.2 },
  inputCard: {
    borderRadius: 22,
    borderWidth: 1,
    minHeight: INPUT_CARD_MIN_HEIGHT,
    overflow: 'hidden',
  },
  textInput: {
    fontSize: sf(16),
    lineHeight: sf(22),
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 2,
  },
  toolbarBtn: { padding: 6 },
  sendButton: {},
  sendButtonDisabled: { opacity: 0.85 },
  sendButtonInner: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // History modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: 60, paddingTop: 20 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  modalTitle: { fontSize: sf(22), fontWeight: '700', color: '#ffffff' },
  chatList: { paddingHorizontal: 20 },
  noChatText: { color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 40, fontSize: sf(15) },
  chatHistoryItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: 'transparent',
  },
  chatHistoryTitle: { fontSize: sf(15), fontWeight: '600', marginBottom: 4 },
  chatHistoryDate: { fontSize: sf(12), color: 'rgba(255,255,255,0.35)' },

  // Personality modal
  personalityOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  personalitySheet: {
    width: '100%', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 20,
  },
  personalityTitle: { fontSize: sf(18), fontWeight: '700', marginBottom: 16 },
  personalityOption: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, marginBottom: 6, borderWidth: 1, borderColor: 'transparent',
  },
  personalityLabel: { fontSize: sf(15), fontWeight: '600' },
  personalityDesc: { fontSize: sf(12), color: 'rgba(255,255,255,0.4)', marginTop: 2 },
});
