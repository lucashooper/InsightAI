import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutAnimation, Platform, StyleSheet, Text, UIManager, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { buildMiraMarkdownStyles } from './miraMarkdownStyles';
import { sanitizePartialMarkdown } from '../../utils/sanitizePartialMarkdown';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  text: string;
  onComplete?: () => void;
  onProgress?: () => void;
  charIntervalMs?: number;
  isDark?: boolean;
  isRoast?: boolean;
  roastTextColor?: string;
  plain?: boolean;
};

const WORD_INTERVAL_MS = 48;
const BODY_FONT = 16;
const BODY_LINE = 24;

/** Split into word tokens — spaces stay attached to the preceding word. */
function tokenizeWords(input: string): string[] {
  if (!input) return [];
  const tokens: string[] = [];
  const re = /\S+\s*/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    tokens.push(match[0]);
  }
  return tokens;
}

function BlinkingCaret({ color, visible }: { color: string; visible: boolean }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.12,
          duration: 520,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, visible]);

  if (!visible) return null;

  return (
    <Animated.Text style={[styles.caret, { color, opacity }]} accessibilityElementsHidden>
      |
    </Animated.Text>
  );
}

function StreamingText({
  content,
  color,
  showCaret,
}: {
  content: string;
  color: string;
  showCaret: boolean;
}) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <Text style={[styles.streamText, { color, lineHeight: BODY_LINE, fontSize: BODY_FONT }]}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={index} style={styles.streamBold}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
      <BlinkingCaret color={color} visible={showCaret} />
    </Text>
  );
}

export default function MiraTypewriterText({
  text,
  onComplete,
  onProgress,
  charIntervalMs = WORD_INTERVAL_MS,
  isDark = true,
  isRoast = false,
  roastTextColor,
}: Props) {
  const [revealedWordCount, setRevealedWordCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const wordsRef = useRef<string[]>([]);
  const revealedCountRef = useRef(0);
  const lastAdvanceRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onProgressRef = useRef(onProgress);
  const prevHeightRef = useRef(0);
  const lockedHeightRef = useRef<number | null>(null);

  onCompleteRef.current = onComplete;
  onProgressRef.current = onProgress;

  const words = useMemo(() => tokenizeWords(text || ''), [text]);

  useEffect(() => {
    wordsRef.current = words;
    revealedCountRef.current = 0;
    completedRef.current = false;
    lastAdvanceRef.current = 0;
    lockedHeightRef.current = null;
    setRevealedWordCount(0);
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      onCompleteRef.current?.();
      return;
    }

    const tick = (timestamp: number) => {
      if (!lastAdvanceRef.current) lastAdvanceRef.current = timestamp;

      while (
        revealedCountRef.current < wordsRef.current.length
        && timestamp - lastAdvanceRef.current >= charIntervalMs
      ) {
        revealedCountRef.current += 1;
        lastAdvanceRef.current += charIntervalMs;
        if (revealedCountRef.current % 4 === 0) {
          onProgressRef.current?.();
        }
      }

      setRevealedWordCount(revealedCountRef.current);

      if (revealedCountRef.current < wordsRef.current.length) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!completedRef.current) {
        completedRef.current = true;
        setIsComplete(true);
        onProgressRef.current?.();
        onCompleteRef.current?.();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [text, words, charIntervalMs]);

  const displayed = useMemo(
    () => words.slice(0, revealedWordCount).join(''),
    [words, revealedWordCount],
  );

  const sanitizedDisplay = useMemo(
    () => sanitizePartialMarkdown(displayed),
    [displayed],
  );

  const baseColor = isRoast
    ? roastTextColor || '#FFFFFF'
    : isDark
      ? 'rgba(255,255,255,0.94)'
      : '#1a1a1a';

  const markdownStyles = useMemo(
    () => buildMiraMarkdownStyles(baseColor, isDark),
    [baseColor, isDark],
  );

  const ghostStyles = useMemo(
    () => ({
      ...markdownStyles,
      body: { ...markdownStyles.body, opacity: 0, lineHeight: BODY_LINE, fontSize: BODY_FONT },
      paragraph: { ...markdownStyles.paragraph, opacity: 0, lineHeight: BODY_LINE, fontSize: BODY_FONT },
    }),
    [markdownStyles],
  );

  const onGhostLayout = (event: { nativeEvent: { layout: { height: number } } }) => {
    const h = event.nativeEvent.layout.height;
    if (lockedHeightRef.current == null) {
      lockedHeightRef.current = h;
    }
    if (Math.abs(h - prevHeightRef.current) > 2) {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(200, LayoutAnimation.Types.spring, LayoutAnimation.Properties.opacity),
      );
      prevHeightRef.current = h;
    }
  };

  if (!text) return null;

  const minHeight = lockedHeightRef.current ?? undefined;

  return (
    <View style={[styles.wrap, minHeight ? { minHeight } : null]} pointerEvents="none">
      <View
        style={styles.ghost}
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        onLayout={onGhostLayout}
      >
        <Markdown style={ghostStyles}>{text}</Markdown>
      </View>

      <View style={styles.visibleLayer} pointerEvents="none">
        {isComplete ? (
          <Markdown style={markdownStyles}>{text}</Markdown>
        ) : (
          <StreamingText content={sanitizedDisplay} color={baseColor} showCaret />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    position: 'relative',
  },
  ghost: {
    width: '100%',
  },
  visibleLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  streamText: {
    fontWeight: '400',
  },
  streamBold: {
    fontWeight: '700',
    fontSize: BODY_FONT,
    lineHeight: BODY_LINE,
  },
  caret: {
    fontSize: BODY_FONT,
    lineHeight: BODY_LINE,
    fontWeight: '300',
  },
});
