import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InsightCompanionMark from '../companion/InsightCompanionMark';
import type { GoDeeperMessage } from '../../services/goDeeperConversationService';
import { sf } from '../../utils/responsive';

type Props = {
  messages: GoDeeperMessage[];
  replyText: string;
  onReplyChange: (text: string) => void;
  onSendReply: () => void;
  isLoading: boolean;
  isDark: boolean;
  replyPlaceholder: string;
  typingMessageId?: string | null;
  typingDisplayText?: string;
};

export default function GoDeeperThread({
  messages,
  replyText,
  onReplyChange,
  onSendReply,
  isLoading,
  isDark,
  replyPlaceholder,
  typingMessageId = null,
  typingDisplayText = '',
}: Props) {
  if (messages.length === 0 && !isLoading && !typingMessageId) return null;

  const assistantTextColor = isDark ? 'rgba(255,255,255,0.78)' : '#5a5a5a';
  const userTextColor = isDark ? 'rgba(255,255,255,0.92)' : '#1a1a1a';
  const replyBg = isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)';
  const replyBorder = isDark ? 'rgba(139,92,246,0.28)' : 'rgba(139,92,246,0.2)';

  const getDisplayContent = (msg: GoDeeperMessage) => {
    if (typingMessageId === msg.id) {
      return typingDisplayText || '';
    }
    return msg.content;
  };

  const showTypingCursor = (msg: GoDeeperMessage) =>
    typingMessageId === msg.id && typingDisplayText.length < msg.content.length;

  return (
    <View style={styles.thread}>
      {messages.map((msg) => {
        const text = getDisplayContent(msg);
        if (!text && typingMessageId !== msg.id) return null;

        if (msg.role === 'assistant') {
          return (
            <View key={msg.id} style={styles.assistantBlock}>
              <View style={styles.assistantHeader}>
                <InsightCompanionMark size={24} isDark={isDark} />
                <Text style={[styles.threadLabel, { color: isDark ? 'rgba(167,139,250,0.9)' : '#7c3aed' }]}>
                  Mira
                </Text>
              </View>
              <Text
                style={[
                  styles.assistantText,
                  { color: assistantTextColor },
                ]}
              >
                {text}
                {showTypingCursor(msg) ? <Text style={styles.cursor}>|</Text> : null}
              </Text>
            </View>
          );
        }

        return (
          <View key={msg.id} style={styles.userRow}>
            <View style={[styles.userBubble, { backgroundColor: isDark ? 'rgba(139,92,246,0.22)' : 'rgba(139,92,246,0.12)' }]}>
              <Text style={[styles.messageText, { color: userTextColor }]}>{text}</Text>
            </View>
          </View>
        );
      })}

      {isLoading && !typingMessageId && (
        <View style={styles.loadingRow}>
          <InsightCompanionMark size={22} isDark={isDark} />
          <ActivityIndicator size="small" color="#8b5cf6" style={{ marginLeft: 10 }} />
        </View>
      )}

      {(messages.length > 0 || typingMessageId) && (
        <View style={[styles.replyBox, { backgroundColor: replyBg, borderColor: replyBorder }]}>
          <TextInput
            style={[styles.replyInput, { color: userTextColor }]}
            value={replyText}
            onChangeText={onReplyChange}
            placeholder={replyPlaceholder}
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'}
            multiline
            maxLength={2000}
            returnKeyType="default"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
            onPress={onSendReply}
            disabled={!replyText.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  thread: {
    marginTop: 24,
    gap: 16,
  },
  assistantBlock: {
    gap: 8,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threadLabel: {
    fontSize: sf(13),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  assistantText: {
    fontSize: sf(15),
    lineHeight: sf(23),
    fontStyle: 'italic',
    paddingLeft: 2,
  },
  cursor: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  userRow: {
    alignItems: 'flex-end',
  },
  userBubble: {
    maxWidth: '88%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: sf(15),
    lineHeight: sf(22),
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 2,
  },
  replyBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 18,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    marginTop: 4,
    minHeight: 48,
  },
  replyInput: {
    flex: 1,
    fontSize: sf(15),
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
