import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { buildMiraMarkdownStyles } from './miraMarkdownStyles';

type Props = {
  text: string;
  isStreaming?: boolean;
  /** One-shot replies: keep fade briefly then call onComplete (ms). Omit when parent drives isStreaming. */
  holdStreamingMs?: number;
  onComplete?: () => void;
  onProgress?: () => void;
  isDark?: boolean;
  isRoast?: boolean;
  roastTextColor?: string;
};

const FADE_HEIGHT = 56;

/**
 * Agent response — full text renders immediately; soft bottom fade while streaming.
 * No character/word delay loops.
 */
export default function MiraStreamingText({
  text,
  isStreaming = false,
  holdStreamingMs,
  onComplete,
  onProgress,
  isDark = true,
  isRoast = false,
  roastTextColor,
}: Props) {
  const maskOpacity = useRef(new Animated.Value(isStreaming ? 1 : 0)).current;
  const onCompleteRef = useRef(onComplete);
  const onProgressRef = useRef(onProgress);

  onCompleteRef.current = onComplete;
  onProgressRef.current = onProgress;

  const baseColor = isRoast
    ? roastTextColor || '#FFFFFF'
    : isDark
      ? 'rgba(255,255,255,0.94)'
      : '#1a1a1a';

  const markdownStyles = useMemo(
    () => buildMiraMarkdownStyles(baseColor, isDark),
    [baseColor, isDark],
  );

  const fadeColors = useMemo(
    () =>
      isDark
        ? (['rgba(19,16,34,0)', 'rgba(19,16,34,0.55)', 'rgba(19,16,34,0.95)'] as const)
        : (['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0.95)'] as const),
    [isDark],
  );

  useEffect(() => {
    Animated.timing(maskOpacity, {
      toValue: isStreaming ? 1 : 0,
      duration: isStreaming ? 120 : 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !isStreaming) {
        onCompleteRef.current?.();
      }
    });
  }, [isStreaming, maskOpacity]);

  useEffect(() => {
    if (!text) return;
    onProgressRef.current?.();
  }, [text]);

  useEffect(() => {
    if (!isStreaming || !text || holdStreamingMs == null) return;
    const timer = setTimeout(() => onCompleteRef.current?.(), holdStreamingMs);
    return () => clearTimeout(timer);
  }, [isStreaming, text, holdStreamingMs]);

  if (!text) return null;

  return (
    <View style={styles.wrap}>
      <Markdown style={markdownStyles}>{text}</Markdown>
      <Animated.View
        pointerEvents="none"
        style={[styles.fadeOverlay, { opacity: maskOpacity }]}
      >
        <LinearGradient
          colors={[...fadeColors]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  fadeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FADE_HEIGHT,
  },
});
