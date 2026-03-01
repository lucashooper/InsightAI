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
  Image,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { mobileAiService } from '../services/mobileAiService';
import { sf } from '../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import Purchases from 'react-native-purchases';

const CHAT_HISTORY_KEY = 'AI_CHAT_HISTORY';
const AI_PERSONALITY_KEY = 'AI_PERSONALITY';
const FREE_USER_DAILY_LIMIT = 50;

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

type Personality = 'balanced' | 'cheerful' | 'direct' | 'playful' | 'gentle';

const PERSONALITIES: { key: Personality; label: string; emoji: string; desc: string }[] = [
  { key: 'balanced', label: 'Balanced', emoji: '⚖️', desc: 'Warm and thoughtful' },
  { key: 'cheerful', label: 'Cheerful', emoji: '☀️', desc: 'Upbeat and encouraging' },
  { key: 'direct', label: 'Direct', emoji: '🎯', desc: 'Concise and to the point' },
  { key: 'playful', label: 'Playful', emoji: '✨', desc: 'Light-hearted and fun' },
  { key: 'gentle', label: 'Gentle', emoji: '🌿', desc: 'Extra soft and nurturing' },
];

export default function AIChatScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [showPersonality, setShowPersonality] = useState(false);
  const [personality, setPersonality] = useState<Personality>('balanced');
  const [isTemporary, setIsTemporary] = useState(false);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [isProUser, setIsProUser] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const typingRef = useRef<{ timer: NodeJS.Timeout | null; cancelled: boolean }>({ timer: null, cancelled: false });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const load = async () => {
      const cached = await AsyncStorage.getItem('CACHED_PROFILE_PICTURE');
      if (cached) setProfilePicture(cached);
      const savedPersonality = await AsyncStorage.getItem(AI_PERSONALITY_KEY);
      if (savedPersonality) setPersonality(savedPersonality as Personality);
    };
    load();
  }, []);

  useEffect(() => { loadSuggestions(); }, []);

  useEffect(() => {
    if (user) {
      checkAndUpdateUsage();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (typingRef.current.timer) clearInterval(typingRef.current.timer);
    };
  }, []);

  // Auto-save chat when messages change
  useEffect(() => {
    if (messages.length > 0 && !isTemporary) {
      saveChatToHistory();
    }
  }, [messages.filter(m => !m.isTyping).length]);

  const loadSuggestions = async () => {
    try {
      const s = await mobileAiService.getChatSuggestions();
      setSuggestions(s);
    } catch {
      setSuggestions([
        'How have I been feeling lately?',
        'What patterns do you notice?',
        'What should I focus on this week?',
        'Help me reflect on my entries',
      ]);
    }
  };

  const loadChatHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
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
      const raw = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      let chats: SavedChat[] = raw ? JSON.parse(raw) : [];

      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg ? firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '') : 'New chat';
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
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chats));
    } catch (e) {
      console.error('[AIChat] Error saving chat', e);
    }
  };

  const loadChat = (chat: SavedChat) => {
    if (typingRef.current.timer) {
      clearInterval(typingRef.current.timer);
      typingRef.current.cancelled = true;
    }
    setMessages(chat.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
    setCurrentChatId(chat.id);
    setShowSuggestions(false);
    setShowHistory(false);
    setIsTemporary(false);
  };

  const deleteChat = async (chatId: string) => {
    try {
      const raw = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (raw) {
        let chats: SavedChat[] = JSON.parse(raw);
        chats = chats.filter(c => c.id !== chatId);
        await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chats));
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
    if (typingRef.current.timer) {
      clearInterval(typingRef.current.timer);
      typingRef.current.cancelled = true;
    }
    setMessages([]);
    setCurrentChatId(null);
    setShowSuggestions(true);
    setIsTemporary(false);
    setShowHistory(false);
    loadSuggestions();
  };

  const startTypingEffect = (messageId: string, fullContent: string) => {
    let idx = 0;
    if (typingRef.current.timer) clearInterval(typingRef.current.timer);
    typingRef.current.cancelled = false;

    typingRef.current.timer = setInterval(() => {
      if (typingRef.current.cancelled) {
        if (typingRef.current.timer) clearInterval(typingRef.current.timer);
        typingRef.current.timer = null;
        return;
      }

      // Variable speed: faster for spaces/punctuation, slower for new words
      const char = fullContent[idx];
      const step = (char === ' ' || char === ',' || char === '.') ? 2 : 1;
      idx = Math.min(idx + step, fullContent.length);

      const displayed = fullContent.substring(0, idx);
      const done = idx >= fullContent.length;

      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, displayedContent: displayed, isTyping: !done }
          : m
      ));

      if (idx % 20 === 0 || done) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 10);
      }

      if (done) {
        if (typingRef.current.timer) clearInterval(typingRef.current.timer);
        typingRef.current.timer = null;
      }
    }, 30);
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
      const isPro = !!customerInfo.entitlements.active['InsightAI Pro'] || Object.keys(customerInfo.entitlements.active).length > 0;
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
          'Daily Limit Reached',
          `You've reached your daily limit of ${FREE_USER_DAILY_LIMIT} messages. Upgrade to Insight Pro for unlimited AI conversations!`,
          [
            { text: 'Maybe Later', style: 'cancel' },
            { text: 'Upgrade to Pro', onPress: () => navigation.navigate('Paywall') }
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

    // CHECK RATE LIMIT BEFORE SENDING
    const canSend = await checkAndUpdateUsage();
    if (!canSend) return;

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
      startTypingEffect(assistantMessage.id, response);
    } catch (error: any) {
      console.error('[AIChatScreen] ❌ Error sending message:', error);
      console.error('[AIChatScreen] Error details:', JSON.stringify(error, null, 2));
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I'm having trouble connecting right now. ${error?.message || 'Please try again in a moment.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, personality]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const displayText = isUser ? item.content : (item.displayedContent ?? item.content);

    return (
      <View style={[
        styles.messageBubbleContainer,
        isUser ? styles.userBubbleContainer : styles.assistantBubbleContainer,
      ]}>
        {!isUser && (
          <View style={styles.avatarWrap}>
            <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.avatarGradient}>
              <Ionicons name="sparkles" size={12} color="#fff" />
            </LinearGradient>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.assistantMessageText,
          ]}>
            {displayText}
          </Text>
        </View>
        {isUser && (
          <View style={styles.userAvatarWrap}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.userAvatarImage} />
            ) : (
              <View style={styles.userAvatarFallback}>
                <Ionicons name="person-circle-outline" size={32} color="rgba(255, 255, 255, 0.6)" />
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {/* Premium orb */}
      <View style={styles.orbContainer}>
        <LinearGradient
          colors={['#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9']}
          style={styles.orb}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
        >
          <Ionicons name="sparkles" size={26} color="#fff" />
        </LinearGradient>
      </View>

      <Text style={styles.emptySubtitle}>
        I know your journal inside out.{'\n'}Ask me anything about your patterns, emotions, or growth.
      </Text>

      {/* Suggestion chips */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => sendMessage(suggestion)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.12)', 'rgba(139, 92, 246, 0.06)']}
                style={styles.suggestionChipInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
                <Ionicons name="arrow-forward" size={14} color="rgba(167,139,250,0.7)" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Always use dark theme for Insight chat screen regardless of app theme

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#0a0a0a', '#0d0515', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerCenter} onPress={() => setShowPersonality(true)} activeOpacity={0.7}>
          <View style={styles.headerDot} />
          <Text style={[styles.headerTitle, { color: '#fff' }]}>Insight</Text>
          <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            loadChatHistory();
            setShowHistory(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubbles-outline" size={22} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
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
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.emptyMessagesList,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
        />


        {/* Input bar */}
        <View style={[
          styles.inputContainer,
          { paddingBottom: Math.max(insets.bottom, 12) },
          { backgroundColor: 'rgba(10,10,10,0.95)' },
        ]}>
          {/* Usage indicator for free users */}
          {!isProUser && (
            <View style={styles.usageIndicator}>
              <Text style={styles.usageText}>
                {dailyMessageCount}/{FREE_USER_DAILY_LIMIT} messages today
              </Text>
            </View>
          )}
          {/* Temporary toggle */}
          {messages.length === 0 && (
            <TouchableOpacity
              style={styles.tempToggle}
              onPress={() => setIsTemporary(!isTemporary)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isTemporary ? 'eye-off-outline' : 'save-outline'}
                size={14}
                color={isTemporary ? '#ef4444' : 'rgba(255,255,255,0.35)'}
              />
              <Text style={[styles.tempToggleText, isTemporary && { color: '#ef4444' }]}>
                {isTemporary ? 'Temporary chat' : 'Chat will be saved'}
              </Text>
            </TouchableOpacity>
          )}
          <View style={[
            styles.inputWrapper,
            { backgroundColor: '#1a1a2e', borderColor: '#2a2a3e' },
          ]}>
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={() => {
                // TODO: Implement voice recording functionality
                Alert.alert('Voice Mode', 'Voice recording feature coming soon!');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="mic-outline" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={[styles.textInput, { color: '#fff' }]}
              placeholder="Ask me anything..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              returnKeyType="default"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={inputText.trim() && !isLoading ? ['#8b5cf6', '#6d28d9'] : ['#333', '#333']}
                style={styles.sendButtonGradient}
              >
                <Ionicons name="arrow-up" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Chat History Modal */}
      <Modal visible={showHistory} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
          <View style={[styles.modalContent, { backgroundColor: '#111' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chats</Text>
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
                <Text style={styles.noChatText}>No saved chats yet</Text>
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
                      Alert.alert('Delete Chat', 'Are you sure?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteChat(chat.id) },
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

      {/* Personality Modal */}
      <Modal visible={showPersonality} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.personalityOverlay}
          activeOpacity={1}
          onPress={() => setShowPersonality(false)}
        >
          <View style={[styles.personalitySheet, { backgroundColor: '#1a1a1a' }]}>
            <Text style={[styles.personalityTitle, { color: '#fff' }]}>AI Personality</Text>
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
                  setShowPersonality(false);
                }}
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
    </Animated.View>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(139,92,246,0.1)',
  },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  headerTitle: { fontSize: sf(17), fontWeight: '700', letterSpacing: 0.2 },
  chatContainer: { flex: 1 },
  messagesList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  emptyMessagesList: { flexGrow: 1, justifyContent: 'center' },

  // Empty state
  emptyState: { alignItems: 'center', paddingHorizontal: 24 },
  orbContainer: {
    width: 64, height: 64, justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  orb: {
    width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 14,
  },
  emptySubtitle: {
    fontSize: sf(15), color: 'rgba(255,255,255,0.55)', textAlign: 'center',
    lineHeight: sf(22), marginBottom: 28, maxWidth: 300, fontWeight: '400',
  },
  suggestionsContainer: { width: '100%', gap: 10 },
  suggestionChip: {
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.18)',
  },
  suggestionChipInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
  },
  suggestionText: {
    fontSize: sf(14.5), color: 'rgba(255,255,255,0.8)', fontWeight: '500',
  },

  // Messages
  messageBubbleContainer: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userBubbleContainer: { justifyContent: 'flex-end' },
  assistantBubbleContainer: { justifyContent: 'flex-start' },
  avatarWrap: { marginRight: 8, marginBottom: 2 },
  avatarGradient: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  userAvatarWrap: { marginLeft: 8, marginBottom: 2 },
  userAvatarImage: { width: 32, height: 32, borderRadius: 16 },
  userAvatarFallback: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center',
  },
  userAvatarInitial: { fontSize: 12, fontWeight: '700', color: '#a78bfa' },
  messageBubble: { maxWidth: '75%', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
  userBubble: { backgroundColor: '#8b5cf6', borderBottomRightRadius: 6, marginLeft: 'auto' },
  assistantBubble: { backgroundColor: 'rgba(255,255,255,0.07)', borderBottomLeftRadius: 6 },
  messageText: { fontSize: sf(15.5), lineHeight: sf(22), fontWeight: '400', letterSpacing: 0.2 },
  userMessageText: { color: '#fff', fontWeight: '500' },
  assistantMessageText: { color: 'rgba(255,255,255,0.95)', fontWeight: '400' },

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
    paddingHorizontal: 16, paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(139,92,246,0.1)',
  },
  usageIndicator: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingBottom: 6,
  },
  usageText: { fontSize: 11, color: 'rgba(139,92,246,0.6)', fontWeight: '600' },
  tempToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingBottom: 8,
  },
  tempToggleText: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'flex-end', borderRadius: 24, borderWidth: 1,
    paddingLeft: 16, paddingRight: 6, paddingVertical: 6, minHeight: 48,
  },
  voiceButton: { marginRight: 8, marginBottom: 2, padding: 4 },
  textInput: {
    flex: 1, fontSize: sf(16), maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  sendButton: { marginLeft: 8, marginBottom: 2 },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonGradient: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  // History modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: 60, paddingTop: 20 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  modalTitle: { fontSize: sf(22), fontWeight: '700' },
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
