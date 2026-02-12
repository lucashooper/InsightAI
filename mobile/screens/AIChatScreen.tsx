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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { mobileAiService } from '../services/mobileAiService';
import { isTablet, sf, ss, si } from '../utils/responsive';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatScreen({ navigation }: any) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const orbPulse = useRef(new Animated.Value(1)).current;
  const orbGlow = useRef(new Animated.Value(0.3)).current;

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Orb breathing animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(orbPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(orbGlow, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(orbGlow, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    glow.start();
    return () => { pulse.stop(); glow.stop(); };
  }, []);

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, []);

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

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text || inputText).trim();
    if (!messageText || isLoading) return;

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

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await mobileAiService.chat(allMessages);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[
        styles.messageBubbleContainer,
        isUser ? styles.userBubbleContainer : styles.assistantBubbleContainer,
      ]}>
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <LinearGradient
              colors={['#8b5cf6', '#6d28d9']}
              style={styles.assistantAvatarGradient}
            >
              <Ionicons name="sparkles" size={14} color="#fff" />
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
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {/* Animated Orb */}
      <Animated.View style={[
        styles.orbContainer,
        { transform: [{ scale: orbPulse }] },
      ]}>
        <Animated.View style={[styles.orbGlow, { opacity: orbGlow }]} />
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6']}
          style={styles.orb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="sparkles" size={32} color="rgba(255,255,255,0.9)" />
        </LinearGradient>
      </Animated.View>

      <Text style={styles.emptyTitle}>Hey, I'm Insight</Text>
      <Text style={styles.emptySubtitle}>
        I know your journal inside out. Ask me anything about your patterns, emotions, or growth.
      </Text>

      {/* Suggestion chips */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => sendMessage(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const isDark = theme.name !== 'light';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={isDark ? ['#0a0a0a', '#0d0515', '#0a0a0a'] : ['#f8f7ff', '#f0ebff', '#f8f7ff']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-down" size={28} color={isDark ? '#fff' : '#1a1a1a'} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerDot} />
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>Insight</Text>
        </View>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => {
            setMessages([]);
            setShowSuggestions(true);
            loadSuggestions();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={24} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'} />
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

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.typingIndicator}>
            <View style={styles.assistantAvatar}>
              <LinearGradient
                colors={['#8b5cf6', '#6d28d9']}
                style={styles.assistantAvatarGradient}
              >
                <Ionicons name="sparkles" size={14} color="#fff" />
              </LinearGradient>
            </View>
            <View style={styles.typingDots}>
              <TypingDots />
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={[
          styles.inputContainer,
          { paddingBottom: Math.max(insets.bottom, 12) },
          { backgroundColor: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(248,247,255,0.95)' },
        ]}>
          <View style={[
            styles.inputWrapper,
            { backgroundColor: isDark ? '#1a1a2e' : '#f0ebff', borderColor: isDark ? '#2a2a3e' : '#e0d8ff' },
          ]}>
            <TextInput
              ref={inputRef}
              style={[styles.textInput, { color: isDark ? '#fff' : '#1a1a1a' }]}
              placeholder="Ask me anything..."
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              returnKeyType="default"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
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
    </Animated.View>
  );
}

// Typing dots animation component
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
        <Animated.View
          key={i}
          style={[styles.dot, { opacity: dot }]}
        />
      ))}
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(139, 92, 246, 0.15)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  headerTitle: {
    fontSize: sf(17),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  newChatButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyMessagesList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  orbContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  orbGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8b5cf6',
  },
  orb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  emptyTitle: {
    fontSize: sf(24),
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: sf(15),
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: sf(22),
    marginBottom: 32,
    maxWidth: 300,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  suggestionText: {
    fontSize: sf(14),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  // Message bubbles
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userBubbleContainer: {
    justifyContent: 'flex-end',
  },
  assistantBubbleContainer: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    marginRight: 8,
    marginBottom: 2,
  },
  assistantAvatarGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#8b5cf6',
    borderBottomRightRadius: 6,
    marginLeft: 'auto',
  },
  assistantBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: sf(15),
    lineHeight: sf(22),
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: 'rgba(255,255,255,0.9)',
  },
  // Typing indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingDots: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b5cf6',
  },
  // Input
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(139, 92, 246, 0.15)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: sf(16),
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  sendButton: {
    marginLeft: 8,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
