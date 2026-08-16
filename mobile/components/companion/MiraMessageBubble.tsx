import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { buildMiraMarkdownStyles } from './miraMarkdownStyles';

type Props = {
  content: string;
  isDark?: boolean;
  isRoast?: boolean;
  roastTextColor?: string;
};

/** Static full-canvas Mira message — same markdown styling as the typewriter. */
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
    () => buildMiraMarkdownStyles(baseColor, isDark),
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
    paddingHorizontal: 4,
  },
});
