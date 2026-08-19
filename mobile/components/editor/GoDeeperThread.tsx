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
import MiraStreamingText from '../companion/MiraStreamingText';
import MiraMessageBubble from '../companion/MiraMessageBubble';
import { MIRA_COMPANION_NAME } from '../../constants/mira';
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
  revealingMessageId?: string | null;
  onRevealComplete?: () => void;
  onStreamProgress?: () => void;
  /** @deprecated Use onStreamProgress */
  onTypewriterProgress?: () => void;
};

function GoDeeperThread({
  messages,
  replyText,
  onReplyChange,
  onSendReply,
  isLoading,
  isDark,
  replyPlaceholder,
  revealingMessageId = null,
  onRevealComplete,
  onStreamProgress,
  onTypewriterProgress,
}: Props) {
  const scrollOnProgress = onStreamProgress ?? onTypewriterProgress;
  if (messages.length === 0 && !isLoading && !revealingMessageId) return null;

  const userTextColor = isDark ? 'rgba(255,255,255,0.92)' : '#1a1a1a';
  const replyBg = isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)';
  const replyBorder = isDark ? 'rgba(139,92,246,0.28)' : 'rgba(139,92,246,0.2)';

  return (
    <View style={styles.thread}>
      {messages.map((msg) => {
        if (!msg.content) return null;

        if (msg.role === 'assistant') {
          const isRevealing = revealingMessageId === msg.id;

          return (
            <View key={msg.id} style={styles.assistantBlock}>
              <View style={styles.assistantHeader}>
                <InsightCompanionMark size={32} isDark={isDark} />
                <Text style={[styles.threadLabel, { color: isDark ? 'rgba(167,139,250,0.9)' : '#7c3aed' }]}>
                  {MIRA_COMPANION_NAME}
                </Text>
              </View>
              <View style={styles.assistantBody}>
                {isRevealing ? (
                  <MiraStreamingText
                    text={msg.content}
                    isStreaming
                    holdStreamingMs={380}
                    isDark={isDark}
                    onComplete={onRevealComplete}
                    onProgress={scrollOnProgress}
                  />
                ) : (
                  <MiraMessageBubble content={msg.content} isDark={isDark} />
                )}
              </View>
            </View>
          );
        }

        return (
          <View key={msg.id} style={styles.userRow}>
            <View style={[styles.userBubble, { backgroundColor: isDark ? 'rgba(139,92,246,0.22)' : 'rgba(139,92,246,0.12)' }]}>
              <Text style={[styles.messageText, { color: userTextColor }]}>{msg.content}</Text>
            </View>
          </View>
        );
      })}

      {isLoading && !revealingMessageId && (
        <View style={styles.loadingRow}>
          <InsightCompanionMark size={22} isDark={isDark} />
          <ActivityIndicator size="small" color="#8b5cf6" style={{ marginLeft: 10 }} />
        </View>
      )}

      {(messages.length > 0 || revealingMessageId) && (
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

export default React.memo(GoDeeperThread);

const styles = StyleSheet.create({
  thread: {
    marginTop: 24,
    gap: 16,
    paddingHorizontal: 8,
  },
  assistantBody: {
    paddingHorizontal: 12,
    paddingVertical: 2,
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
    fontSize: sf(15),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  assistantText: {
    fontSize: sf(15),
    lineHeight: sf(23),
    fontStyle: 'italic',
    paddingHorizontal: 4,
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
    marginHorizontal: 4,
    minHeight: 48,
    maxWidth: '100%',
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
