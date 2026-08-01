import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import InsightCompanionMark from '../../components/companion/InsightCompanionMark';
import PremiumRevealCard from '../../components/companion/PremiumRevealCard';
import {
  buildOnboardingReveal,
  computePersonality,
  hasPersonalitySignal,
} from '../../utils/onboardingPersonality';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { ONBOARDING_SURFACE, ONBOARDING_BG } from '../../constants/onboardingTheme';
import { MIRA_COMPANION_NAME } from '../../constants/mira';
import { sf } from '../../utils/responsive';

type ReplyPill = { id: string; label: string };

type ChatItem =
  | { id: string; kind: 'mira'; text: string }
  | { id: string; kind: 'typing' }
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'reveal' }
  | { id: string; kind: 'replies'; pills: ReplyPill[]; hint?: string };

type Phase =
  | 'intro'
  | 'await_pattern'
  | 'pattern'
  | 'await_help'
  | 'close'
  | 'await_continue'
  | 'done';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function Bubble({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 320, delay, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, delay]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function TypingDots() {
  const a = useRef(new Animated.Value(0.3)).current;
  const b = useRef(new Animated.Value(0.3)).current;
  const c = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 280, useNativeDriver: true }),
        ]),
      );
    const l1 = loop(a, 0);
    const l2 = loop(b, 120);
    const l3 = loop(c, 240);
    l1.start();
    l2.start();
    l3.start();
    return () => {
      l1.stop();
      l2.stop();
      l3.stop();
    };
  }, [a, b, c]);

  return (
    <View style={styles.typingRow}>
      {[a, b, c].map((v, i) => (
        <Animated.View key={i} style={[styles.typingDot, { opacity: v }]} />
      ))}
    </View>
  );
}

export default function MiraOnboardingChatScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { userName, onboardingAnswers: ctxAnswers } = useOnboarding();
  const answers = route?.params?.answers || ctxAnswers || {};
  const skipPersonality =
    route?.params?.skipPersonality === true || !hasPersonalitySignal(answers);
  const profile = useMemo(() => computePersonality(answers, t), [answers, t]);
  const reveal = useMemo(() => buildOnboardingReveal(profile, answers), [profile, answers]);
  const firstName = (userName || answers.name || '').trim().split(/\s+/)[0] || 'there';

  const [items, setItems] = useState<ChatItem[]>([]);
  const [phase, setPhase] = useState<Phase>('intro');
  const [showBottomContinue, setShowBottomContinue] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const seqRef = useRef(0);

  const pushMira = useCallback(async (text: string) => {
    const typingId = `typing-${Date.now()}`;
    setItems((prev) => [...prev, { id: typingId, kind: 'typing' }]);
    await sleep(650 + Math.min(text.length * 16, 850));
    setItems((prev) => prev.filter((x) => x.id !== typingId));
    setItems((prev) => [...prev, { id: `mira-${Date.now()}`, kind: 'mira', text }]);
    Haptics.selectionAsync();
    await sleep(260);
  }, []);

  const showReplies = useCallback((pills: ReplyPill[], hint = 'Tap to choose a reply') => {
    setItems((prev) => [
      ...prev.filter((x) => x.kind !== 'replies'),
      { id: `replies-${Date.now()}`, kind: 'replies', pills, hint },
    ]);
  }, []);

  const clearReplies = useCallback(() => {
    setItems((prev) => prev.filter((x) => x.kind !== 'replies'));
  }, []);

  const finishToContinue = useCallback(async () => {
    await pushMira("I've already started preparing your personalized reflection system.");
    await sleep(280);
    await pushMira('Ready to continue?');
    setPhase('await_continue');
    setShowBottomContinue(true);
  }, [pushMira]);

  const runGenericIntro = useCallback(async () => {
    const seq = ++seqRef.current;
    await sleep(480);
    if (seq !== seqRef.current) return;

    await pushMira(`hey ${firstName}`);
    if (seq !== seqRef.current) return;
    await sleep(280);
    await pushMira('most people carry thoughts they never fully unpack.');
    if (seq !== seqRef.current) return;
    await sleep(240);
    await pushMira('they loop. they fade. then they come back.');
    if (seq !== seqRef.current) return;
    await sleep(240);
    await pushMira('Insight is built around a simple idea:');
    if (seq !== seqRef.current) return;
    await sleep(240);
    await pushMira('structured reflection turns mental noise into clarity.');
    if (seq !== seqRef.current) return;
    await sleep(280);
    await pushMira(
      "I'm Mira — your daily sounding board. Write or speak freely, and I'll help you notice patterns over time.",
    );
    if (seq !== seqRef.current) return;
    setPhase('await_help');
    showReplies([
      { id: 'how_insight', label: 'How does Insight help?' },
      { id: 'how_help', label: 'How does Mira help?' },
      { id: 'tell_more', label: 'Tell me more' },
    ]);
  }, [firstName, pushMira, showReplies]);

  const runPersonalizedIntro = useCallback(async () => {
    const seq = ++seqRef.current;
    await sleep(480);
    if (seq !== seqRef.current) return;

    await pushMira(`hey ${firstName}`);
    if (seq !== seqRef.current) return;
    await sleep(300);
    await pushMira('does this sound familiar to you?');
    if (seq !== seqRef.current) return;
    await sleep(260);
    await pushMira('you carry a thought all day');
    if (seq !== seqRef.current) return;
    await sleep(220);
    await pushMira('it loops when you try to sleep');
    if (seq !== seqRef.current) return;
    await sleep(220);
    await pushMira("you tell yourself you'll deal with it tomorrow");
    if (seq !== seqRef.current) return;
    await sleep(220);
    await pushMira('then it shows up again');
    if (seq !== seqRef.current) return;
    await sleep(340);
    await pushMira(
      `I've analyzed your baseline responses — and one pattern stood out around ${profile.primaryPattern.toLowerCase()}.`,
    );
    if (seq !== seqRef.current) return;
    setPhase('await_pattern');
    showReplies([
      { id: 'show_pattern', label: 'Show my pattern' },
      { id: 'what_stands_out', label: 'What stands out?' },
      { id: 'whats_baseline', label: "What's my baseline?" },
    ]);
  }, [firstName, profile.primaryPattern, pushMira, showReplies]);

  useEffect(() => {
    if (skipPersonality) {
      runGenericIntro();
    } else {
      runPersonalizedIntro();
    }
  }, [skipPersonality, runGenericIntro, runPersonalizedIntro]);

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [items, showBottomContinue]);

  const onPill = async (pillId: string, label: string) => {
    if (phase === 'done') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearReplies();
    setItems((prev) => [...prev, { id: `user-${Date.now()}`, kind: 'user', text: label }]);

    if (pillId === 'show_pattern' || pillId === 'what_stands_out' || pillId === 'whats_baseline') {
      setPhase('pattern');
      await sleep(480);
      const typingId = `typing-${Date.now()}`;
      setItems((prev) => [...prev, { id: typingId, kind: 'typing' }]);
      await sleep(1000);
      setItems((prev) => prev.filter((x) => x.id !== typingId));
      setItems((prev) => [...prev, { id: `reveal-${Date.now()}`, kind: 'reveal' }]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await sleep(520);
      await pushMira(
        'Recognizing this is most of the work. Insight is built to catch this pattern as it shows up — not weeks later.',
      );
      await sleep(280);
      setPhase('await_help');
      showReplies([
        { id: 'how_help', label: 'How does Mira help?' },
        { id: 'how_insight', label: 'How does Insight help?' },
        { id: 'show_strength', label: 'What is my greatest strength?' },
        { id: 'build_on', label: 'How does Insight build on this?' },
      ]);
      return;
    }

    if (pillId === 'show_strength' || pillId === 'build_on') {
      setPhase('close');
      if (reveal.strength) {
        await pushMira(
          `Alongside the pattern, I also see a strength signal around ${reveal.strength.toLowerCase()}.`,
        );
        await sleep(280);
      }
      await pushMira(
        'Insight does not only surface blind spots — it tracks what is going well so you can build on it.',
      );
      await sleep(280);
      await finishToContinue();
      return;
    }

    if (pillId === 'how_help' || pillId === 'how_insight' || pillId === 'tell_more' || pillId === 'why_matters') {
      setPhase('close');
      if (pillId === 'how_insight') {
        await pushMira(
          'Insight turns free-form thoughts into structured clarity — patterns, blind spots, and growth you can actually track.',
        );
        await sleep(280);
      }
      if (pillId === 'why_matters') {
        await pushMira(
          'Unseen patterns quietly shape mood, sleep, and relationships. Naming yours gives you leverage.',
        );
        await sleep(280);
      }
      await pushMira(
        "Every day, you can write or speak freely to me. I'll detect your patterns, surface blind spots, and track what's changing.",
      );
      await sleep(280);
      await finishToContinue();
      return;
    }
  };

  const onBottomContinue = () => {
    if (phase === 'done') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('done');
    setShowBottomContinue(false);
    navigation.navigate('PrivacyOnboarding', { answers });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <OnboardingAmbientBackground />

      <View style={styles.header}>
        <InsightCompanionMark size={36} isDark />
        <View style={styles.headerText}>
          <Text style={styles.headerName}>{MIRA_COMPANION_NAME}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: showBottomContinue
              ? Math.max(insets.bottom, 16) + 88
              : Math.max(insets.bottom, 20) + 12,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => {
          if (item.kind === 'typing') {
            return (
              <Bubble key={item.id}>
                <View style={styles.miraBubble}>
                  <TypingDots />
                </View>
              </Bubble>
            );
          }
          if (item.kind === 'mira') {
            return (
              <Bubble key={item.id}>
                <View style={styles.miraBubble}>
                  <Text style={styles.miraText}>{item.text}</Text>
                </View>
              </Bubble>
            );
          }
          if (item.kind === 'user') {
            return (
              <Bubble key={item.id}>
                <LinearGradient
                  colors={['#9206FE', '#9F64CC', '#6C00BF']}
                  locations={[0, 0.5, 1]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.userBubble}
                >
                  <Text style={styles.userText}>{item.text}</Text>
                </LinearGradient>
              </Bubble>
            );
          }
          if (item.kind === 'reveal') {
            return (
              <Bubble key={item.id}>
                <PremiumRevealCard
                  reveal={{
                    headline: reveal.headline,
                    answer: reveal.answer,
                    confidence: reveal.confidence,
                    evidence: reveal.evidence,
                    fromLabel: reveal.fromLabel,
                    strength: reveal.strength,
                  }}
                />
              </Bubble>
            );
          }
          if (item.kind === 'replies') {
            return (
              <Bubble key={item.id}>
                <View style={styles.repliesBlock}>
                  {item.hint ? <Text style={styles.repliesHint}>{item.hint}</Text> : null}
                  {item.pills.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      activeOpacity={0.85}
                      onPress={() => onPill(p.id, p.label)}
                    >
                      <LinearGradient
                        colors={['#9206FE', '#9F64CC', '#6C00BF']}
                        locations={[0, 0.5, 1]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.replyPill}
                      >
                        <Text style={styles.replyPillText}>{p.label}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </Bubble>
            );
          }
          return null;
        })}
      </ScrollView>

      {showBottomContinue ? (
        <View style={[styles.bottomCtaWrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity style={styles.bottomCta} activeOpacity={0.9} onPress={onBottomContinue}>
            <Text style={styles.bottomCtaText}>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ONBOARDING_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerText: { flex: 1 },
  headerName: {
    color: '#fff',
    fontSize: sf(17),
    fontWeight: '700',
    letterSpacing: -0.68,
  },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  onlineText: {
    color: 'rgba(52, 211, 153, 0.9)',
    fontSize: sf(12),
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  miraBubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    backgroundColor: ONBOARDING_SURFACE.fill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ONBOARDING_SURFACE.border,
    borderRadius: 22,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  miraText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: sf(16),
    lineHeight: sf(23),
    letterSpacing: -0.2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    borderRadius: 22,
    borderBottomRightRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: sf(15),
    fontWeight: '600',
  },
  typingRow: { flexDirection: 'row', gap: 5, paddingVertical: 4, paddingHorizontal: 4 },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  repliesBlock: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 4,
  },
  repliesHint: {
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.38)',
    fontSize: sf(12),
    marginBottom: 4,
  },
  replyPill: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '88%',
  },
  replyPillText: {
    color: '#FFFFFF',
    fontSize: sf(15),
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  bottomCtaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  bottomCta: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomCtaText: {
    color: '#FFFFFF',
    fontSize: sf(17),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
