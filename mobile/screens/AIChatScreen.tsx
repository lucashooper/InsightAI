import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  Animated,
  Keyboard,
  Easing,
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
import { BlurView } from 'expo-blur';
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
import { AiPersonality, CHAT_PERSONALITIES } from '../utils/aiPersonalities';
import { sf, isTablet, screenPadding } from '../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { getCachedChatSuggestions, setCachedChatSuggestions } from '../utils/chatSuggestionsCache';
import InsightCompanionMark from '../components/companion/InsightCompanionMark';
import OrbView from '../components/companion/OrbView';
import MiraVoicePicker from '../components/companion/MiraVoicePicker';
import MiraVoiceOverlay from '../components/companion/MiraVoiceOverlay';
import MiraDiscoveryEmpty from '../components/companion/MiraDiscoveryEmpty';
import { useSpeechToText } from '../hooks/useSpeechToText';
import MiraRevealCard from '../components/companion/MiraRevealCard';
import MiraMessageBubble from '../components/companion/MiraMessageBubble';
import MiraStreamingText from '../components/companion/MiraStreamingText';
import MiraAnalysisStatus from '../components/companion/MiraAnalysisStatus';
import AmbientBackground from '../components/shared/AmbientBackground';
import AppBackdrop from '../components/ui/AppBackdrop';
import GlassSurface from '../components/shared/GlassSurface';
import PremiumDialog, { type PremiumDialogAction } from '../components/shared/PremiumDialog';
import { useFollowBottomScroll } from '../hooks/useFollowBottomScroll';
import { PREMIUM } from '../constants/premiumUI';
import { MiraRevealPayload } from '../constants/miraReveal';
import { isDiscoveryQuery, formatRevealShareText, normalizePersistedReveal } from '../utils/miraReveal';
import { resolveProAccess } from '../utils/entitlements';
import * as Haptics from 'expo-haptics';
import { ROAST_GRADIENT, ROAST_PALETTE, useRoastTransition } from '../utils/companionTheme';
import { getMiraScreenshotMode, SCREENSHOT_MIRA_CHAT } from '../data/screenshotMiraChat';

function buildScreenshotMessages(language: AppLanguage): ChatMessage[] {
  const seed = SCREENSHOT_MIRA_CHAT[language] ?? SCREENSHOT_MIRA_CHAT.en;
  const now = Date.now();
  return seed.map((m, i) => ({
    ...m,
    timestamp: new Date(now - (seed.length - i) * 60_000),
  }));
}

function hydrateMessages(rawMessages: any[]): ChatMessage[] {
  return (rawMessages || []).map((m) => ({
    id: String(m.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: typeof m.content === 'string' ? m.content : '',
    timestamp: new Date(m.timestamp || Date.now()),
    reveal: normalizePersistedReveal(m.reveal),
    displayedContent: undefined,
    isTyping: false,
  }));
}

/** Soft fade-in once Mira's reply is ready — no growing typewriter bubble */
function AssistantFadeIn({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

/** Placeholder types in once per chat visit — not on every send. */
function TypewriterPlaceholder({
  text,
  visible,
  color,
  animate,
  onAnimated,
}: {
  text: string;
  visible: boolean;
  color: string;
  animate: boolean;
  onAnimated?: () => void;
}) {
  const [shown, setShown] = useState(animate ? '' : text);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      Animated.timing(fade, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start();
      return;
    }

    fade.setValue(1);
    if (!animate) {
      setShown(text);
      return;
    }

    setShown('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        onAnimated?.();
      }
    }, 32);

    return () => clearInterval(id);
  }, [visible, text, fade, animate]);

  if (!visible && shown.length === 0) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.typewriterWrap, { opacity: fade }]}>
      <Text style={[styles.typewriterText, { color }]} numberOfLines={1}>
        {shown}
      </Text>
    </Animated.View>
  );
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
const FREE_USER_DAILY_LIMIT = 50;

/** Fixed layout slots — prevents jolt when roast badge toggles. */
const HEADER_BODY_HEIGHT = 40;
const EMPTY_ORB_SLOT = 140;
const EMPTY_SUBTITLE_HEIGHT = 56;
const ROAST_BADGE_SLOT = 42;

/** Fixed input footer slots — prevents jolt when temp row toggles. */
const INPUT_CARD_MIN_HEIGHT = 88;
const INPUT_CONTAINER_PADDING_TOP = 10;
const INPUT_FOOTER_MIN_HEIGHT =
  INPUT_CONTAINER_PADDING_TOP + INPUT_CARD_MIN_HEIGHT;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  displayedContent?: string;
  isTyping?: boolean;
  timestamp: Date;
  /** Structured discovery reveal (gotcha card) */
  reveal?: MiraRevealPayload;
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
  const [placeholderHasAnimated, setPlaceholderHasAnimated] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setPlaceholderHasAnimated(false);
      return () => {};
    }, []),
  );
  const screenshotMode = getMiraScreenshotMode();
  const isScreenshotBlank = screenshotMode === 'blank';
  const isScreenshotMessages = screenshotMode === 'messages';
  const isScreenshotActive = screenshotMode !== 'off';

  useEffect(() => {
    console.log('[AIChat] screenshotMode=', screenshotMode, 'isScreenshotActive=', isScreenshotActive);
  }, [screenshotMode, isScreenshotActive]);
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const personalities: { key: Personality; label: string; desc: string }[] = CHAT_PERSONALITIES.map((key) => ({
    key,
    label: t(`editor.personalities.${key}`),
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
  const [personality, setPersonality] = useState<Personality>('default');
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedRevealIds, setExpandedRevealIds] = useState<Record<string, boolean>>({});
  const [inputFocused, setInputFocused] = useState(false);
  const handleVoiceTranscript = useCallback((text: string) => {
    setInputText(text);
  }, []);
  const { isRecording: isSpeechRecording, toggleRecording: toggleSpeechRecording } = useSpeechToText({
    locale: language === 'it' ? 'it-IT' : language === 'nl' ? 'nl-NL' : 'en-US',
    onTranscript: handleVoiceTranscript,
    getBaseText: () => inputText,
    t,
  });
  const footerInset = useRef(new Animated.Value(Math.max(insets.bottom, 12))).current;
  const [premiumDialog, setPremiumDialog] = useState<{
    title: string;
    message?: string;
    actions: PremiumDialogAction[];
    onConfirm?: () => void;
  } | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const {
    onScroll: onFollowBottomScroll,
    onScrollBeginDrag: onFollowBottomScrollBeginDrag,
    onContentSizeChange: onFollowBottomContentSizeChange,
    scrollToEndIfFollowing,
  } = useFollowBottomScroll(flatListRef as React.RefObject<any>);
  const currentChatIdRef = useRef<string | null>(null);
  const persistChainRef = useRef<Promise<void>>(Promise.resolve());
  const persistGenRef = useRef(0);
  const isTemporaryRef = useRef(isTemporary);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const inputRef = useRef<TextInput>(null);
  const typingIntervalRef = useRef<number | null>(null);
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
    isTemporaryRef.current = isTemporary;
  }, [isTemporary]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const restingInset = Math.max(insets.bottom, 12);
    footerInset.setValue(restingInset);
  }, [footerInset, insets.bottom]);

  useEffect(() => {
    const restingInset = Math.max(insets.bottom, 12);
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => {
      const duration = Platform.OS === 'ios' ? (e.duration || 250) : 200;
      Animated.timing(footerInset, {
        toValue: e.endCoordinates.height,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
      setTimeout(() => scrollToEndIfFollowing(true), 80);
    });
    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      const duration = Platform.OS === 'ios' ? ((e as { duration?: number }).duration || 250) : 200;
      Animated.timing(footerInset, {
        toValue: restingInset,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [footerInset, insets.bottom, scrollToEndIfFollowing]);

  useEffect(() => {
    if (!user?.id) {
      setIsProUser(false);
      return;
    }
    resolveProAccess(user.id, user.email).then(setIsProUser).catch(() => setIsProUser(false));
  }, [user?.id]);

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
    currentChatIdRef.current = null;
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
        } else if (savedPersonality === 'hype' || savedPersonality === 'roast') {
          setPersonality('default');
          await AsyncStorage.setItem(AI_PERSONALITY_KEY, 'default');
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

  const cancelVoiceProgress = useCallback(() => {
    if (typingIntervalRef.current != null) {
      cancelAnimationFrame(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }, []);

  const interruptVoice = useCallback(() => {
    cancelVoiceProgress();
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
  }, [cancelVoiceProgress]);

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
    currentChatIdRef.current = null;
    setShowSuggestions(true);
    setIsAnalyzing(false);
  }, [user?.id, isScreenshotActive, isScreenshotMessages, language]);

  // Ensure discovery landing is visible whenever the thread is empty
  useEffect(() => {
    if (isScreenshotActive) return;
    if (messages.length === 0 && !isAnalyzing) {
      setShowSuggestions(true);
    }
  }, [messages.length, isAnalyzing, isScreenshotActive]);

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
                setMessages(hydrateMessages(currentChat.messages as any[]));
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

      return () => {
        const msgs = messagesRef.current;
        if (isScreenshotActive || isTemporaryRef.current || msgs.length === 0) return;
        console.log('[AIChat] blur persist', { count: msgs.length, chatId: currentChatIdRef.current });
        // Fire-and-forget — chain keeps order
        void (async () => {
          try {
            const key = getChatHistoryKey();
            const persistable = msgs.filter((m) => !m.isTyping);
            if (persistable.length === 0) return;
            let chatId = currentChatIdRef.current;
            if (!chatId) {
              chatId = `chat-${Date.now()}`;
              currentChatIdRef.current = chatId;
            }
            const raw = await AsyncStorage.getItem(key);
            let chats: SavedChat[] = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(chats)) chats = [];
            const firstUserMsg = persistable.find((m) => m.role === 'user');
            const title = firstUserMsg
              ? firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '…' : '')
              : 'Chat';
            const existing = chats.findIndex((c) => c.id === chatId);
            const chatData: SavedChat = {
              id: chatId!,
              title,
              messages: persistable.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp:
                  m.timestamp instanceof Date
                    ? m.timestamp.toISOString()
                    : (m.timestamp as any),
                ...(m.reveal ? { reveal: m.reveal } : {}),
              })) as ChatMessage[],
              createdAt: existing >= 0 ? chats[existing].createdAt : new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            if (existing >= 0) chats[existing] = chatData;
            else chats.unshift(chatData);
            if (chats.length > 30) chats = chats.slice(0, 30);
            await AsyncStorage.setItem(key, JSON.stringify(chats));
            console.log('[AIChat] ✅ blur saved', chatId, chatData.messages.length);
          } catch (e) {
            console.error('[AIChat] ❌ blur save failed', e);
          }
        })();
      };
    }, [currentChatId, user, isScreenshotActive, getChatHistoryKey])
  );

  const clearTypingEffect = useCallback(() => {
    cancelVoiceProgress();
    speechSyncRef.current = null;
    stopMiraVoice();
  }, [cancelVoiceProgress]);

  useEffect(() => {
    return () => {
      clearTypingEffect();
    };
  }, [clearTypingEffect]);

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

  const shareMessage = useCallback(async (content: string, reveal?: MiraRevealPayload) => {
    try {
      const prefix = t('companion.sharePrefix');
      const message = reveal
        ? formatRevealShareText(reveal, prefix)
        : `${prefix} "${content}"`;
      await Share.share({ message });
    } catch (e) {
      console.warn('[AIChat] Share failed', e);
    }
  }, [t]);


  const loadChatHistory = async () => {
    const key = getChatHistoryKey();
    console.log('[AIChat] loadChatHistory key=', key);
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const chats: SavedChat[] = JSON.parse(raw);
        const sorted = chats
          .filter((c) => Array.isArray(c.messages) && c.messages.length > 0)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        console.log('[AIChat] loadChatHistory found', sorted.length, 'chats');
        setSavedChats(sorted);
      } else {
        console.log('[AIChat] loadChatHistory empty — no key');
        setSavedChats([]);
      }
    } catch (e) {
      console.error('[AIChat] Error loading history', e);
      setSavedChats([]);
    }
  };

  const persistChat = useCallback(async (
    msgs: ChatMessage[],
    opts?: { force?: boolean; reason?: string },
  ) => {
    const reason = opts?.reason || 'unspecified';
    const key = getChatHistoryKey();
    console.log('[AIChat] persistChat start', {
      reason,
      force: !!opts?.force,
      msgCount: msgs.length,
      isTemporary: isTemporaryRef.current,
      isScreenshotActive,
      chatId: currentChatIdRef.current,
      key,
      userId: user?.id || 'anonymous',
    });

    if (isScreenshotActive || msgs.length === 0) {
      console.log('[AIChat] persistChat abort — screenshot or empty');
      return;
    }
    if (!opts?.force && isTemporaryRef.current) {
      console.log('[AIChat] persistChat abort — temporary chat');
      return;
    }

    // Keep typing bubbles out of storage, but keep their final content if present
    const persistable = msgs
      .filter((m) => !m.isTyping)
      .map((m) => ({
        ...m,
        displayedContent: undefined,
        isTyping: undefined,
      }));
    if (persistable.length === 0) {
      console.log('[AIChat] persistChat abort — only typing bubbles');
      return;
    }

    let chatId = currentChatIdRef.current;
    if (!chatId) {
      chatId = `chat-${Date.now()}`;
      currentChatIdRef.current = chatId;
      setCurrentChatId(chatId);
      console.log('[AIChat] persistChat minted chatId', chatId);
    }
    const boundId = chatId;

    const run = async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        // Only abort if the user switched to a *different* thread
        if (currentChatIdRef.current && currentChatIdRef.current !== boundId) {
          console.log('[AIChat] persistChat abort — thread switched', {
            boundId,
            current: currentChatIdRef.current,
          });
          return;
        }

        let chats: SavedChat[] = [];
        if (raw) {
          try {
            chats = JSON.parse(raw);
            if (!Array.isArray(chats)) chats = [];
          } catch (parseErr) {
            console.error('[AIChat] persistChat corrupt history, resetting', parseErr);
            chats = [];
          }
        }

        const firstUserMsg = persistable.find((m) => m.role === 'user');
        const title = firstUserMsg
          ? firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '…' : '')
          : t('companion.newChat');

        const existing = chats.findIndex((c) => c.id === boundId);
        const serializableMessages = persistable.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp:
            m.timestamp instanceof Date
              ? m.timestamp.toISOString()
              : (m.timestamp as any),
          ...(m.reveal ? { reveal: m.reveal } : {}),
        })) as ChatMessage[];

        const chatData: SavedChat = {
          id: boundId,
          title,
          messages: serializableMessages,
          createdAt: existing >= 0 ? chats[existing].createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (chatData.messages.length === 0) {
          console.log('[AIChat] persistChat abort — serialized empty');
          return;
        }

        if (existing >= 0) {
          chats[existing] = chatData;
        } else {
          chats.unshift(chatData);
        }

        if (chats.length > 30) chats = chats.slice(0, 30);

        const payload = JSON.stringify(chats);
        await AsyncStorage.setItem(key, payload);

        // Verify write
        const verify = await AsyncStorage.getItem(key);
        const verifyCount = verify ? (JSON.parse(verify) as SavedChat[]).length : 0;
        console.log('[AIChat] ✅ Saved chat', {
          boundId,
          msgs: chatData.messages.length,
          totalChats: verifyCount,
          bytes: payload.length,
          reason,
        });

        setSavedChats(
          [...chats].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        );
      } catch (e) {
        console.error('[AIChat] ❌ Error saving chat', { reason, boundId, error: e });
      }
    };

    persistChainRef.current = persistChainRef.current.then(run, run);
    await persistChainRef.current;
  }, [getChatHistoryKey, isScreenshotActive, t, user?.id]);

  // Auto-save when messages settle (skip while typing animation runs)
  useEffect(() => {
    if (isScreenshotActive) return;
    if (messages.length === 0 || isTemporary) {
      console.log('[AIChat] auto-save skipped', {
        empty: messages.length === 0,
        isTemporary,
        isScreenshotActive,
      });
      return;
    }
    if (messages.some((m) => m.isTyping)) {
      console.log('[AIChat] auto-save wait — typing in progress');
      return;
    }
    console.log('[AIChat] auto-save trigger', { count: messages.length, chatId: currentChatIdRef.current });
    void persistChat(messages, { force: true, reason: 'auto-save' });
  }, [messages, isTemporary, isScreenshotActive, persistChat]);

  const saveChatToHistory = async () => {
    await persistChat(messages, { force: true, reason: 'manual' });
  };

  const loadChat = (chat: SavedChat) => {
    clearTypingEffect();
    persistGenRef.current += 1;
    setMessages(hydrateMessages(chat.messages as any[]));
    setCurrentChatId(chat.id);
    currentChatIdRef.current = chat.id;
    setShowSuggestions(false);
    setShowHistory(false);
    setIsTemporary(false);
    setIsAnalyzing(false);
    setExpandedRevealIds({});
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearTypingEffect();
    persistGenRef.current += 1;
    setMessages([]);
    setCurrentChatId(null);
    currentChatIdRef.current = null;
    setShowSuggestions(true);
    setIsTemporary(false);
    setShowHistory(false);
    setIsAnalyzing(false);
    setExpandedRevealIds({});
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

      const SYNC_WAIT_MS = 15000;
      let lastReportedIndex = 0;

      const tickVoiceProgress = () => {
        const sync = speechSyncRef.current;
        let progress: number;

        if (!sync) {
          if (Date.now() - typingStartRef.current > SYNC_WAIT_MS) {
            syncTimedOutRef.current = true;
            console.warn('[AIChatScreen] Speech sync timeout — showing text without audio sync');
          } else {
            typingIntervalRef.current = requestAnimationFrame(tickVoiceProgress);
            return;
          }
        }

        if (sync && !syncTimedOutRef.current) {
          progress = sync.getProgress();
        } else {
          progress = Math.min(1, (Date.now() - typingStartRef.current) / typingDurationRef.current);
        }

        const charIndex = Math.min(fullContent.length, Math.max(1, Math.floor(progress * fullContent.length)));

        if (progress >= 1 || charIndex >= fullContent.length) {
          typingIntervalRef.current = null;
          speechSyncRef.current = null;
          setMessages(prev => {
            const next = prev.map(m =>
              m.id === messageId ? { ...m, displayedContent: fullContent, isTyping: false } : m
            );
            void persistChat(next, { force: true, reason: 'typing-complete-voice' });
            return next;
          });
          flatListRef.current?.scrollToEnd({ animated: true });
          return;
        }

        if (charIndex > lastReportedIndex) {
          lastReportedIndex = charIndex;
          const currentText = fullContent.slice(0, charIndex);
          setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, displayedContent: currentText } : m
          ));
          flatListRef.current?.scrollToEnd({ animated: true });
        }

        typingIntervalRef.current = requestAnimationFrame(tickVoiceProgress);
      };

      typingIntervalRef.current = requestAnimationFrame(tickVoiceProgress);
    }
  };

  const handleStreamComplete = useCallback((messageId: string) => {
    setMessages((prev) => {
      const next = prev.map((m) =>
        m.id === messageId ? { ...m, isTyping: false } : m,
      );
      void persistChat(next, { force: true, reason: 'stream-complete' });
      return next;
    });
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 40);
  }, [persistChat]);

  const scrollOnStreamProgress = useCallback(() => {
    scrollToEndIfFollowing(true);
  }, [scrollToEndIfFollowing]);

  // Rate limiting check function
  const checkAndUpdateUsage = async (): Promise<boolean> => {
    try {
      console.log('[AIChatScreen] 🔍 Checking rate limit...');
      if (!user) {
        console.log('[AIChatScreen] ❌ No user found');
        return false;
      }

      const isPro = await resolveProAccess(user.id, user.email);
      setIsProUser(isPro);
      console.log('[AIChatScreen] Is Pro:', isPro);
      
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
    if (!messageText || isLoading || isAnalyzing) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isProUser) {
      try {
        const isPro = await resolveProAccess(user!.id, user!.email);
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

    const canSend = await checkAndUpdateUsage();
    if (!canSend) return;

    clearTypingEffect();

    setInputText('');
    setShowSuggestions(false);
    setIsTemporary(false);
    Keyboard.dismiss();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => {
      const next = [...prev, userMessage];
      void persistChat(next, { force: true, reason: 'user-send' });
      return next;
    });
    const useReveal = isDiscoveryQuery(messageText);
    setIsLoading(true);
    if (useReveal) setIsAnalyzing(true);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const minAnalysisMs = useReveal ? 2200 : 0;
    const analysisStartedAt = Date.now();
    const analysisGuard = setTimeout(() => {
      setIsAnalyzing(false);
      setIsLoading(false);
    }, 45000);

    try {
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      if (useReveal) {
        const { reveal, fallbackText } = await mobileAiService.chatReveal(allMessages, { personality });
        const elapsed = Date.now() - analysisStartedAt;
        if (elapsed < minAnalysisMs) {
          await new Promise((r) => setTimeout(r, minAnalysisMs - elapsed));
        }

        if (reveal) {
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: reveal.explanation,
            displayedContent: reveal.explanation,
            isTyping: false,
            timestamp: new Date(),
            reveal,
          };

          setIsAnalyzing(false);
          setMessages((prev) => {
            const next = [...prev, assistantMessage];
            void persistChat(next, { force: true, reason: 'reveal-reply' });
            return next;
          });
        } else {
          const plainText =
            fallbackText?.trim() ||
            t('companion.insufficientReveal');
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: plainText,
            displayedContent: plainText,
            isTyping: false,
            timestamp: new Date(),
          };

          setIsAnalyzing(false);
          setMessages((prev) => {
            const next = [...prev, assistantMessage];
            void persistChat(next, { force: true, reason: 'reveal-fallback-text' });
            return next;
          });
        }

        setIsLoading(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
      } else {
        const response = await mobileAiService.chat(allMessages, { personality });

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          isTyping: true,
          timestamp: new Date(),
        };

        setMessages(prev => {
          const next = [...prev, assistantMessage];
          void persistChat(next, { force: true, reason: 'assistant-start' });
          return next;
        });
        setIsLoading(false);
        if (isVoiceEnabled) {
          startSyncedTypingEffect(assistantMessage.id, response);
        }
      }
    } catch (error: any) {
      console.error('[AIChatScreen] ❌ Error sending message');
      console.error('[AIChatScreen]   message:', error?.message);
      console.error('[AIChatScreen]   name:', error?.name);
      console.error('[AIChatScreen]   stack:', error?.stack);
      if (error?.cause) console.error('[AIChatScreen]   cause:', error.cause);
      setIsAnalyzing(false);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: t('companion.connectionError', { detail: error?.message || t('companion.tryAgain') }),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    } finally {
      clearTimeout(analysisGuard);
    }
  }, [inputText, isLoading, isAnalyzing, messages, personality, isVoiceEnabled, isProUser, t, navigation, persistChat]);

  const revealLabels = React.useMemo(() => ({
    confidence: t('companion.revealConfidence'),
    evidence: t('companion.revealEvidence'),
    recommendation: t('companion.revealRecommendation'),
    exploreWhy: t('companion.revealExploreWhy'),
    askFollowUp: t('companion.revealAskFollowUp'),
    share: t('companion.revealShare'),
    fromJournals: t('companion.revealFromJournals'),
  }), [t]);

  // Stable renderItem — must NOT be a nested component (that remounts on every keystroke)
  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    if (isUser) {
      return (
        <View style={[styles.messageBubbleContainer, styles.userBubbleContainer]}>
          <LinearGradient
            colors={isRoast ? ROAST_PALETTE.sendGradient : ['#7c6aef', '#6d5ce7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.messageBubble, styles.userBubble]}
          >
            <Text style={[styles.messageText, styles.userMessageText]}>{item.content}</Text>
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
              <Ionicons name="person-circle-outline" size={isTablet ? 42 : 42} color={theme.colors.secondaryText} />
            )}
          </View>
        </View>
      );
    }

    const explanationOpen = !!expandedRevealIds[item.id];

    if (item.reveal) {
      const avatarSize = isTablet ? 57 : 47;
      return (
        <View style={[styles.messageBubbleContainer, styles.assistantBubbleContainer, styles.revealRow]}>
          <View style={styles.avatarWrap}>
            <InsightCompanionMark size={36} personality={personality} isDark={isDark || isRoast} roast={isRoast} inline />
          </View>
          <View style={styles.revealColumn}>
            <MiraRevealCard
                reveal={item.reveal}
                isDark={isDark}
                isRoast={isRoast}
                explanationExpanded={explanationOpen}
                sharePrefix={t('companion.sharePrefix')}
                labels={revealLabels}
                onExploreWhy={() => {
                  setExpandedRevealIds((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }));
                  setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
                }}
                onAskFollowUp={() => {
                  inputRef.current?.focus();
                }}
              />
              {explanationOpen ? (
                <View style={styles.revealExplanationCanvas}>
                  <MiraMessageBubble
                    content={item.reveal.explanation}
                    isDark={isDark && !isRoast}
                    isRoast={isRoast}
                    roastTextColor={ROAST_PALETTE.textPrimary}
                  />
                </View>
            ) : null}
          </View>
        </View>
      );
    }

    // Streaming response — full text with bottom fade while generating
    if (item.isTyping && !isVoiceEnabled) {
      return (
        <View style={styles.assistantCanvasRow}>
          <View style={styles.avatarWrap}>
            <InsightCompanionMark size={36} personality={personality} isDark={isDark || isRoast} roast={isRoast} inline />
          </View>
          <View style={styles.assistantCanvasContent}>
            <MiraStreamingText
              text={item.content}
              isStreaming
              holdStreamingMs={380}
              isDark={isDark}
              isRoast={isRoast}
              roastTextColor={ROAST_PALETTE.textPrimary}
              onComplete={() => handleStreamComplete(item.id)}
              onProgress={scrollOnStreamProgress}
            />
          </View>
        </View>
      );
    }

    // Voice sync — partial text on canvas while audio plays
    if (item.isTyping && isVoiceEnabled) {
      return (
        <View style={styles.assistantCanvasRow}>
          <View style={styles.avatarWrap}>
            <InsightCompanionMark size={36} personality={personality} isDark={isDark || isRoast} roast={isRoast} inline />
          </View>
          <View style={styles.assistantCanvasContent}>
            {item.displayedContent && item.displayedContent !== '…' ? (
              <MiraStreamingText
                text={item.displayedContent}
                isStreaming={item.displayedContent.length < item.content.length}
                isDark={isDark}
                isRoast={isRoast}
                roastTextColor={ROAST_PALETTE.textPrimary}
                onComplete={() => handleStreamComplete(item.id)}
                onProgress={scrollOnStreamProgress}
              />
            ) : (
              <View style={styles.voiceWaitingDot} />
            )}
          </View>
        </View>
      );
    }

    // Completed — full-canvas open text (Purpose / ChatGPT style)
    return (
      <AssistantFadeIn>
        <View style={styles.assistantCanvasRow}>
          <View style={styles.avatarWrap}>
            <InsightCompanionMark size={36} personality={personality} isDark={isDark || isRoast} roast={isRoast} inline />
          </View>
          <View style={styles.assistantCanvasContent}>
            <Pressable
              onPress={() => setActiveMessageId((prev) => (prev === item.id ? null : item.id))}
              style={({ pressed }) => [pressed && { opacity: 0.92 }]}
            >
              <MiraMessageBubble
                content={item.content}
                isDark={isDark}
                isRoast={isRoast}
                roastTextColor={ROAST_PALETTE.textPrimary}
              />
            </Pressable>
            {activeMessageId === item.id && (
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
      </AssistantFadeIn>
    );
  }, [
    isRoast,
    isDark,
    personality,
    theme.colors.secondaryText,
    theme.colors.primaryText,
    profilePicture,
    profilePictureError,
    expandedRevealIds,
    activeMessageId,
    revealLabels,
    t,
    shareMessage,
    isVoiceEnabled,
    handleStreamComplete,
    scrollOnStreamProgress,
  ]);

  const renderEmptyState = () => (
    <MiraDiscoveryEmpty
      isDark={isDark}
      isRoast={isRoast}
      personality={personality}
      hidden={inputFocused}
      title={t('companion.discoveryTitle')}
      subtitle={isRoast ? '' : t('companion.discoveryChoosePrompt')}
      roastPrompts={isRoast ? [
        t('companion.suggestionDoingWrong'),
        t('companion.suggestionRoastWeek'),
        t('companion.suggestionCallOut'),
        t('companion.suggestionAvoiding'),
      ] : undefined}
      onSelectPrompt={(prompt) => sendMessage(prompt)}
    />
  );

  const analysisLines = [
    t('companion.analyzingJournal'),
    t('companion.analyzingPatterns'),
    t('companion.analyzingEvidence'),
  ];


  const showDiscoveryAmbient = isDark && !isRoast && messages.length === 0 && !isAnalyzing;

  return (
    <View style={[styles.container, { backgroundColor: isRoast ? ROAST_GRADIENT[0] : '#131022' }]}>
      {!isRoast ? <AppBackdrop /> : null}
      {showDiscoveryAmbient ? <AmbientBackground intensity="rich" /> : null}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: normalOpacity }]}>
        <LinearGradient
          colors={isRoast ? normalGradient : ['transparent', 'transparent', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: roastOpacity }]}>
        <LinearGradient colors={[...ROAST_GRADIENT]} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingTop: insets.top + PREMIUM.layout.headerTop,
          minHeight: insets.top + PREMIUM.layout.headerTop + HEADER_BODY_HEIGHT,
          borderBottomColor: isRoast ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
        },
      ]}>
        <View style={styles.headerSide}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => requestAnimationFrame(() => navigation.goBack())} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={26} color={isRoast ? ROAST_PALETTE.textPrimary : (isDark ? '#fff' : theme.colors.primaryText)} />
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

      {/* Messages — single footer inset tracks keyboard (no KeyboardAvoidingView double-offset) */}
      <View style={styles.chatContainer}>
        {messages.length === 0 && !isAnalyzing && !inputFocused ? (
          <View style={styles.emptyDiscoveryLayer} pointerEvents="box-none">
            {renderEmptyState()}
          </View>
        ) : null}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          extraData={{ expandedRevealIds, activeMessageId, isAnalyzing }}
          contentContainerStyle={[
            styles.messagesList,
            messages.length > 0 ? styles.messagesListCompact : null,
          ]}
          removeClippedSubviews={Platform.OS === 'android'}
          windowSize={9}
          maxToRenderPerBatch={6}
          initialNumToRender={8}
          ListFooterComponent={
            isAnalyzing ? (
              <MiraAnalysisStatus
                isDark={isDark}
                isRoast={isRoast}
                personality={personality}
                lines={analysisLines}
              />
            ) : null
          }
          showsVerticalScrollIndicator={false}
          onScroll={onFollowBottomScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            onFollowBottomScrollBeginDrag();
            setActiveMessageId(null);
          }}
          onContentSizeChange={onFollowBottomContentSizeChange}
        />


        {/* Input bar — spacer preserves layout when voice overlay is active */}
        {isAudioPlaying && isVoiceEnabled ? (
          <View style={{ minHeight: INPUT_FOOTER_MIN_HEIGHT + Math.max(insets.bottom, 12) }} />
        ) : (
        <Animated.View style={[
          styles.inputContainer,
          {
            paddingBottom: footerInset,
            minHeight: INPUT_FOOTER_MIN_HEIGHT + Math.max(insets.bottom, 12),
          },
        ]}>
          <View style={[
            styles.inputCard,
            isRoast
              ? { backgroundColor: ROAST_PALETTE.inputBg, borderColor: ROAST_PALETTE.inputBorder }
              : isDark
                ? {
                    backgroundColor: 'rgba(18, 16, 42, 0.92)',
                    borderColor: 'rgba(139, 92, 246, 0.22)',
                    borderWidth: StyleSheet.hairlineWidth,
                  }
                : {
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    borderColor: 'rgba(122, 86, 160, 0.14)',
                  },
          ]}>
            <View style={styles.inputFieldWrap}>
              <TypewriterPlaceholder
                text={t('companion.inputPlaceholder')}
                visible={!inputText && !inputFocused}
                color={isRoast ? 'rgba(255,255,255,0.35)' : (isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.35)')}
                animate={!placeholderHasAnimated}
                onAnimated={() => setPlaceholderHasAnimated(true)}
              />
              <TextInput
                ref={inputRef}
                style={[styles.textInput, { color: isRoast ? ROAST_PALETTE.textPrimary : (isDark ? '#fff' : theme.colors.primaryText) }]}
                placeholder=""
                value={inputText}
                onChangeText={setInputText}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                multiline
                maxLength={2000}
                returnKeyType="default"
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.inputToolbar}>
              <TouchableOpacity
                style={styles.toolbarBtn}
                onPress={toggleSpeechRecording}
                onLongPress={toggleVoiceMode}
                delayLongPress={400}
                activeOpacity={0.7}
                accessibilityLabel={t('home.speak')}
              >
                <Ionicons
                  name={isSpeechRecording ? 'mic' : isVoiceEnabled ? 'mic' : 'mic-outline'}
                  size={20}
                  color={isSpeechRecording || isVoiceEnabled ? (isRoast ? ROAST_PALETTE.accent : '#a78bfa') : (isRoast ? ROAST_PALETTE.icon : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'))}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isLoading || isAnalyzing) && styles.sendButtonDisabled]}
                onPress={() => sendMessage()}
                disabled={!inputText.trim() || isLoading || isAnalyzing}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.sendButtonInner,
                  inputText.trim() && !isLoading && !isAnalyzing
                    ? { backgroundColor: isRoast ? ROAST_PALETTE.accent : '#8b5cf6' }
                    : { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                ]}>
                  <Ionicons
                    name="arrow-up"
                    size={18}
                    color={inputText.trim() && !isLoading && !isAnalyzing ? '#fff' : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)')}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        )}
      </View>

      {/* Chat History Modal */}
      <Modal visible={showHistory} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
          <View style={styles.modalContent}>
            <AmbientBackground intensity="subtle" />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(9,9,11,0.55)' }]} />
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
                <View style={styles.historyEmpty}>
                  <Ionicons name="chatbubbles-outline" size={40} color="rgba(139,92,246,0.6)" />
                  <Text style={styles.historyEmptyTitle}>{t('companion.noSavedChats')}</Text>
                  <Text style={styles.historyEmptySubtitle}>{t('companion.noSavedChatsSubtitle')}</Text>
                </View>
              ) : (
                savedChats.map(chat => (
                  <TouchableOpacity
                    key={chat.id}
                    onPress={() => loadChat(chat)}
                    onLongPress={() => {
                      setPremiumDialog({
                        title: t('companion.deleteChat'),
                        message: t('companion.areYouSure'),
                        actions: [
                          { label: t('common.cancel'), variant: 'secondary' },
                          {
                            label: t('common.delete'),
                            variant: 'destructive',
                            onPress: () => deleteChat(chat.id),
                          },
                        ],
                      });
                    }}
                    activeOpacity={0.7}
                    style={{ marginBottom: 10 }}
                  >
                    <View
                      style={[
                        styles.chatHistoryItem,
                        currentChatId === chat.id && styles.chatHistoryItemActive,
                      ]}
                    >
                      <LinearGradient
                        colors={['rgba(139,92,246,0.14)', 'rgba(99,102,241,0.06)']}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={[styles.chatHistoryInner, { flex: 1 }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.chatHistoryTitle} numberOfLines={1}>
                            {chat.title}
                          </Text>
                          <Text style={styles.chatHistoryDate}>
                            {new Date(chat.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {chat.messages.length} messages
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
                      </View>
                    </View>
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

      <PremiumDialog
        visible={!!premiumDialog}
        title={premiumDialog?.title ?? ''}
        message={premiumDialog?.message}
        icon="chatbubble-ellipses"
        actions={premiumDialog?.actions ?? [{ label: t('common.ok'), variant: 'primary' }]}
        onDismiss={() => setPremiumDialog(null)}
      />

      {/* Personality Modal — light glass bottom sheet */}
      <Modal visible={showPersonality} animationType="slide" transparent>
        <View style={styles.personalityOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowPersonality(false)}
          />
          <View style={styles.personalitySheetWrap}>
            <BlurView intensity={72} tint="light" style={styles.personalitySheet}>
              <Text style={styles.personalityTitle}>{t('companion.personalityTitle')}</Text>
              {personalities.map((p) => {
                const selected = personality === p.key;
                return (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => handleSelectPersonality(p.key)}
                    activeOpacity={0.75}
                    style={[
                      styles.personalityOption,
                      selected && styles.personalityOptionSelected,
                    ]}
                  >
                    <View style={styles.personalityOrbIcon}>
                      <OrbView size={48} personality={p.key} />
                    </View>
                    <View style={styles.personalityOptionText}>
                      <Text style={styles.personalityLabel}>{p.label}</Text>
                      <Text style={styles.personalityDesc}>{p.desc}</Text>
                    </View>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={22} color="#7B5EA7" />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </BlurView>
          </View>
        </View>
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
    paddingHorizontal: PREMIUM.layout.screenPadH,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
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
  assistantCanvasRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
    width: '100%',
  },
  assistantCanvasContent: {
    flex: 1,
    paddingRight: 4,
  },
  revealExplanationCanvas: {
    marginTop: 8,
    width: '100%',
  },
  voiceWaitingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b5cf6',
    opacity: 0.5,
    marginTop: 8,
  },
  revealRow: { alignItems: 'flex-start', flexDirection: 'row' },
  revealColumn: { flex: 1, maxWidth: isTablet ? '88%' : '88%' },
  revealExplanationBubble: { maxWidth: '100%', marginTop: 4 },
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
  messagesList: {
    paddingHorizontal: isTablet ? screenPadding : 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messagesListCompact: {
    flexGrow: 0,
  },
  emptyDiscoveryLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    paddingTop: 8,
    zIndex: 1,
  },
  emptyMessagesList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 12,
  },

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
  avatarWrap: { marginRight: 10, marginTop: 4, width: isTablet ? 57 : 47, height: isTablet ? 57 : 47, overflow: 'visible' },
  avatarGradient: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  userAvatarWrap: { marginLeft: 8, marginBottom: 2 },
  userAvatarFrame: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(139, 92, 246, 0.4)',
    overflow: 'hidden' as any,
  },
  userAvatarImage: { width: '100%' as any, height: '100%' as any, borderRadius: 15 },
  userAvatarImageDirect: { width: isTablet ? 42 : 42, height: isTablet ? 42 : 42, borderRadius: 21 },
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
  inputCard: {
    borderRadius: PREMIUM.radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PREMIUM.glass.border,
    backgroundColor: PREMIUM.glass.fill,
    minHeight: INPUT_CARD_MIN_HEIGHT,
    overflow: 'hidden',
  },
  inputFieldWrap: {
    position: 'relative',
  },
  typewriterWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 14,
    zIndex: 1,
  },
  typewriterText: {
    fontSize: sf(16),
    lineHeight: sf(22),
    letterSpacing: -0.2,
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
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 60,
    paddingTop: 20,
    overflow: 'hidden',
    backgroundColor: PREMIUM.bg,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  modalTitle: { fontSize: sf(22), fontWeight: '700', color: '#ffffff' },
  chatList: { paddingHorizontal: 20 },
  chatHistoryItem: {
    borderRadius: PREMIUM.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.28)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  chatHistoryItemActive: {
    borderColor: 'rgba(139,92,246,0.45)',
  },
  historyEmpty: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  historyEmptyTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: sf(17),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  historyEmptySubtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: sf(14),
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 260,
  },
  noChatText: { color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 40, fontSize: sf(15) },
  chatHistoryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  chatHistoryTitle: {
    fontSize: sf(17),
    fontWeight: '600',
    letterSpacing: -0.3,
    marginBottom: 6,
    color: '#fff',
  },
  chatHistoryDate: {
    fontSize: sf(13),
    color: 'rgba(255,255,255,0.38)',
  },

  // Personality modal
  personalityOverlay: {
    flex: 1,
    backgroundColor: 'rgba(180, 160, 220, 0.2)',
    justifyContent: 'flex-end',
  },
  personalitySheetWrap: {
    width: '100%',
  },
  personalitySheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderBottomWidth: 0,
    shadowColor: 'rgba(120, 80, 200, 0.12)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 24,
  },
  personalityTitle: {
    fontSize: sf(22),
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  personalityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(200, 180, 255, 0.3)',
    shadowColor: 'rgba(120, 80, 200, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  personalityOptionSelected: {
    borderColor: '#7B5EA7',
    backgroundColor: 'rgba(123, 94, 167, 0.1)',
  },
  personalityOrbIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  personalityOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  personalityLabel: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#1a1a2e',
  },
  personalityDesc: {
    fontSize: sf(13),
    color: '#6b6b8a',
    marginTop: 2,
    fontWeight: '400',
  },
});
