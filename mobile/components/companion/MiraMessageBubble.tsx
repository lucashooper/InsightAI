import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

type Props = {
  content: string;
  isDark?: boolean;
  isRoast?: boolean;
  roastTextColor?: string;
};

/**
 * Static full-canvas Mira message (history / completed replies).
 * Animated streaming uses MiraTypewriterText instead.
 */
export default function MiraMessageBubble({
  content,
  isDark = true,
  isRoast = false,
  roastTextColor,
}: Props) {
  const baseColor = isRoast
    ? roastTextColor || '#FFFFFF'
    : isDark
      ? 'rgba(255,255,255,0.94)'
      : '#1a1a1a';

  const markdownStyles = useMemo(
    () =>
      StyleSheet.create({
        body: { color: baseColor },
        paragraph: {
          fontSize: 16,
          fontWeight: '400',
          color: baseColor,
          marginTop: 0,
          marginBottom: 16,
          lineHeight: 26,
          letterSpacing: 0.1,
        },
        strong: {
          fontWeight: '700',
          fontSize: 16.5,
          color: baseColor,
        },
        em: {
          fontStyle: 'italic',
          color: baseColor,
        },
        heading3: {
          fontSize: 17,
          fontWeight: '700',
          color: baseColor,
          marginTop: 10,
          marginBottom: 10,
          lineHeight: 24,
        },
        bullet_list: {
          marginTop: 4,
          marginBottom: 12,
        },
        bullet_list_icon: {
          color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.55)',
          marginRight: 10,
          fontSize: 17,
          lineHeight: 26,
        },
        ordered_list_icon: {
          color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.55)',
          marginRight: 10,
          fontSize: 16,
          lineHeight: 26,
        },
        list_item: {
          marginTop: 10,
          marginBottom: 2,
          flexDirection: 'row',
          alignItems: 'flex-start',
        },
        bullet_list_content: {
          flex: 1,
          fontSize: 16,
          lineHeight: 26,
        },
        blockquote: {
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          borderLeftWidth: 3,
          borderLeftColor: isDark ? 'rgba(168,85,247,0.5)' : 'rgba(139,92,246,0.4)',
          paddingLeft: 12,
          paddingVertical: 8,
          marginVertical: 8,
        },
        code_inline: {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
          fontFamily: 'Courier',
          fontSize: 15,
        },
      }),
    [baseColor, isDark],
  );

  return (
    <View style={styles.wrap}>
      <Markdown style={markdownStyles}>{content}</Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
});
