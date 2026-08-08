import React, { useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, Animated, View, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';

type Props = {
  text: string;
  onComplete?: () => void;
  onProgress?: () => void;
  charIntervalMs?: number;
  isDark?: boolean;
  isRoast?: boolean;
  roastTextColor?: string;
};

const CHAR_INTERVAL_MS = 20;
const FADE_DURATION_MS = 80;
const CHUNK_MIN = 2;
const CHUNK_MAX = 3;

function findTailSplitIndex(str: string, maxTail: number): number {
  if (str.length <= maxTail) return 0;
  const minSplit = str.length - maxTail;
  let split = str.lastIndexOf(' ', str.length - 1);
  if (split < minSplit) split = minSplit;
  return Math.max(0, split);
}

/**
 * Native character-by-character typewriter with per-chunk fade-in.
 * File: mobile/components/companion/MiraTypewriterText.tsx
 *
 * Stable prefix → Markdown (formatted). Latest word/chunk → plain Text
 * with opacity 0→1 over ~80ms so markdown tokens are never torn apart.
 */
export default function MiraTypewriterText({
  text,
  onComplete,
  onProgress,
  charIntervalMs = CHAR_INTERVAL_MS,
  isDark = true,
  isRoast = false,
  roastTextColor,
}: Props) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tailOpacity = useRef(new Animated.Value(1)).current;
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onProgressRef = useRef(onProgress);

  onCompleteRef.current = onComplete;
  onProgressRef.current = onProgress;

  useEffect(() => {
    indexRef.current = 0;
    completedRef.current = false;
    setDisplayedLength(0);
    tailOpacity.setValue(1);

    if (!text) {
      onCompleteRef.current?.();
      return;
    }

    const tick = () => {
      if (indexRef.current >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (!completedRef.current) {
          completedRef.current = true;
          setDisplayedLength(text.length);
          onCompleteRef.current?.();
        }
        return;
      }

      const chunk = CHUNK_MIN + Math.floor(Math.random() * (CHUNK_MAX - CHUNK_MIN + 1));
      indexRef.current = Math.min(indexRef.current + chunk, text.length);
      setDisplayedLength(indexRef.current);

      tailOpacity.setValue(0);
      Animated.timing(tailOpacity, {
        toValue: 1,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start();

      if (indexRef.current % 24 === 0) {
        onProgressRef.current?.();
      }
    };

    intervalRef.current = setInterval(tick, charIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [text, charIntervalMs, tailOpacity]);

  const displayed = text.slice(0, displayedLength);
  const splitAt = findTailSplitIndex(displayed, 4);
  const stableText = displayed.slice(0, splitAt);
  const tailText = displayed.slice(splitAt);

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

  const tailStyle = useMemo(
    () => ({
      fontSize: 16,
      lineHeight: 26,
      letterSpacing: 0.1,
      color: baseColor,
    }),
    [baseColor],
  );

  if (!displayed) return <View style={styles.placeholder} />;

  return (
    <View style={styles.wrap}>
      {stableText.length > 0 ? (
        <Markdown style={markdownStyles}>{stableText}</Markdown>
      ) : null}
      {tailText.length > 0 ? (
        <Animated.Text style={[tailStyle, { opacity: tailOpacity }]}>
          {tailText}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  placeholder: {
    minHeight: 4,
  },
});
