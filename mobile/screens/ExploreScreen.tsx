import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, isDarkTheme } from '../contexts/ThemeContext';
import { isTablet, sf } from '../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const noiseTexture = require('../public/noisy-image.webp');

// ── Article Data ──────────────────────────────────────────────
// Curated psychology articles based on real research
const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'sparkles' },
  { id: 'anxiety', label: 'Anxiety', icon: 'cloud' },
  { id: 'thinking', label: 'Thinking', icon: 'bulb' },
  { id: 'habits', label: 'Habits', icon: 'repeat' },
  { id: 'relationships', label: 'Relationships', icon: 'heart' },
  { id: 'sleep', label: 'Sleep', icon: 'moon' },
  { id: 'resilience', label: 'Resilience', icon: 'shield-checkmark' },
];

interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  emoji: string;
  gradient: string[];
  content: string[];
  source: string;
  isTrending?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Stuck in your head? The anti-overthinking toolkit',
    subtitle: 'Break free from rumination spirals',
    category: 'thinking',
    readTime: '5 mins',
    emoji: '🧠',
    gradient: ['#3949ab', '#7b5cff', '#f1c27d'],
    source: 'Based on research by Nolen-Hoeksema (2000)',
    content: [
      'Overthinking — or rumination — is one of the most common mental health challenges. Research shows that rumination amplifies negative emotions and makes problems feel bigger than they are.',
      '## Why We Overthink',
      'Your brain is wired to solve problems. But when faced with emotional challenges, it treats feelings like puzzles — running the same thoughts on repeat, hoping to "figure it out." This creates a loop that feels productive but actually keeps you stuck.',
      '## The 5-Minute Rule',
      'When you notice yourself spiraling, set a 5-minute timer. Allow yourself to think about the problem fully. When the timer ends, physically move — stand up, stretch, or walk. This activates your prefrontal cortex and interrupts the limbic loop.',
      '## Cognitive Defusion',
      'Instead of thinking "I\'m going to fail," try: "I notice I\'m having the thought that I\'m going to fail." This tiny shift creates distance between you and your thoughts, reducing their emotional power by up to 40% (Hayes et al., 2006).',
      '## Write It Down',
      'Journaling for just 15 minutes about your worries can reduce intrusive thoughts by 50%. Writing externalizes the thought, signaling to your brain that it\'s been "processed."',
      '## The Bottom Line',
      'You can\'t stop thoughts from appearing, but you can change your relationship with them. The goal isn\'t to think less — it\'s to think differently.',
    ],
  },
  {
    id: '2',
    title: 'The comfort zone trap: Why unknown feels scary',
    subtitle: 'Understanding your brain\'s safety system',
    category: 'anxiety',
    readTime: '5 mins',
    emoji: '🫧',
    gradient: ['#2f4f9f', '#8b5cf6', '#f0c987'],
    source: 'Based on research by Yerkes & Dodson (1908)',
    content: [
      'Your comfort zone isn\'t really about comfort — it\'s about familiarity. Even if your current situation makes you unhappy, your brain prefers it over the unknown because it can predict what happens next.',
      '## The Familiarity Bias',
      'Neuroscience shows that your amygdala fires threat signals not when something is dangerous, but when something is unpredictable. This is why job interviews, first dates, and new cities feel terrifying — your brain literally can\'t simulate what will happen.',
      '## The Growth Zone Model',
      'Beyond your comfort zone is the "stretch zone" — where growth happens. Beyond that is the "panic zone" — where you shut down. The key is staying in the stretch zone: uncomfortable but not overwhelmed.',
      '## Micro-Courage',
      'You don\'t need to make massive leaps. Research shows that small, consistent steps outside your comfort zone build neural pathways for courage. Try one small uncomfortable thing each day — a conversation, a new route, a different order at a café.',
      '## Reframing Fear as Excitement',
      'Studies by Alison Wood Brooks (Harvard, 2014) found that saying "I\'m excited" instead of "I\'m nervous" improved performance in public speaking, math, and singing. The physiological response is nearly identical — it\'s the label that changes the experience.',
    ],
  },
  {
    id: '3',
    title: 'Some days, you\'re just tired — and that\'s okay',
    subtitle: 'The science of rest and recovery',
    category: 'resilience',
    readTime: '4 mins',
    emoji: '🌙',
    gradient: ['#4251a8', '#7367f0', '#f3d18f'],
    source: 'Based on research by Saundra Dalton-Smith, MD',
    content: [
      'There\'s a difference between being lazy and being depleted. In a culture that glorifies productivity, we often mistake exhaustion for moral failure.',
      '## The 7 Types of Rest',
      'Dr. Saundra Dalton-Smith identifies seven types of rest we need: physical, mental, emotional, social, sensory, creative, and spiritual. Sleep only covers physical rest. You can sleep 8 hours and still wake up mentally exhausted.',
      '## Rest Debt',
      'Like sleep debt, rest debt accumulates. If you\'ve been pushing through for weeks without genuine downtime, a single weekend won\'t fix it. Recovery takes time — and permission.',
      '## Active vs. Passive Rest',
      'Scrolling your phone isn\'t rest — it\'s stimulation. True rest means low sensory input. Try: sitting quietly with tea, gentle stretching, staring out a window, or listening to ambient sounds.',
      '## Permission to Be Unproductive',
      'Your worth isn\'t measured in output. The most productive people in the world — athletes, musicians, scientists — build rest into their routines deliberately. Recovery is part of the work.',
    ],
  },
  {
    id: '4',
    title: 'Why your brain loves negative thoughts',
    subtitle: 'The negativity bias explained',
    category: 'thinking',
    readTime: '4 mins',
    emoji: '⚡',
    gradient: ['#4d3f96', '#7e5bef', '#f2bf7a'],
    source: 'Based on research by Baumeister et al. (2001)',
    content: [
      'Bad experiences stick like Velcro. Good ones slide off like Teflon. This isn\'t a character flaw — it\'s evolution.',
      '## The Negativity Bias',
      'Your brain gives roughly 5x more weight to negative experiences than positive ones. A single criticism can outweigh ten compliments. This kept our ancestors alive — remembering danger was more important than remembering pleasant berries.',
      '## The Three-to-One Ratio',
      'Psychologist Barbara Fredrickson found that we need at least three positive experiences to counterbalance one negative one. For relationships, John Gottman found the ratio is 5:1 — five positive interactions for every negative one.',
      '## Savoring Practice',
      'To counteract the negativity bias, practice "savoring" — deliberately lingering on positive moments. When something good happens, pause for 15-30 seconds and really absorb it. This helps encode the experience in long-term memory.',
      '## Gratitude Rewires the Brain',
      'Studies show that consistent gratitude practice (writing 3 things you\'re grateful for daily) physically changes brain structure after just 8 weeks, increasing activity in the medial prefrontal cortex — the area associated with learning and decision-making.',
    ],
  },
  {
    id: '5',
    title: 'The 2-minute rule that changes everything',
    subtitle: 'Building habits that actually stick',
    category: 'habits',
    readTime: '3 mins',
    emoji: '🎯',
    gradient: ['#2f5f96', '#6f60d9', '#efc782'],
    source: 'Based on research by James Clear (Atomic Habits)',
    content: [
      'Most people fail at building habits because they start too big. The secret? Make it so easy you can\'t say no.',
      '## The 2-Minute Rule',
      'When building a new habit, scale it down to something that takes 2 minutes or less. "Read before bed" becomes "read one page." "Exercise daily" becomes "put on your shoes." The point is to master showing up before optimizing.',
      '## Identity-Based Habits',
      'Instead of "I want to run a marathon," try "I\'m the kind of person who doesn\'t miss workouts." When your habits become part of your identity, motivation becomes automatic.',
      '## Habit Stacking',
      'Attach new habits to existing ones. "After I pour my morning coffee, I will write in my journal for 2 minutes." The existing habit becomes the trigger for the new one.',
      '## The Plateau of Latent Potential',
      'Habits often feel useless for weeks before results appear. This is normal. Think of ice melting — nothing visible happens from 25°F to 31°F, but at 32°F, everything changes. Your work isn\'t wasted; it\'s being stored.',
    ],
  },
  {
    id: '6',
    title: 'Why you can\'t sleep when you\'re stressed',
    subtitle: 'Breaking the anxiety-insomnia cycle',
    category: 'sleep',
    readTime: '5 mins',
    emoji: '😴',
    gradient: ['#3c468f', '#7754db', '#efd09a'],
    source: 'Based on research by Walker (2017), "Why We Sleep"',
    content: [
      'The cruel irony of stress and sleep: you need sleep to manage stress, but stress prevents sleep. Here\'s how to break the cycle.',
      '## The Hyperarousal Problem',
      'When you\'re stressed, your sympathetic nervous system stays activated. Cortisol levels remain elevated, body temperature stays high, and your brain stays in "scanning" mode — looking for threats even when you\'re safe in bed.',
      '## The 20-Minute Rule',
      'If you can\'t fall asleep within 20 minutes, get up. Go to another room and do something calming (reading, stretching) until you feel sleepy. This prevents your brain from associating your bed with frustration.',
      '## Cognitive Shuffle',
      'Developed by cognitive scientist Luc Beaudoin: think of a random word, then picture unrelated objects for each letter. "GARDEN" → giraffe, airplane, rainbow, drum, elephant, notebook. This occupies your verbal mind without emotional activation.',
      '## Temperature Regulation',
      'Your core body temperature needs to drop 1-2°F to initiate sleep. A warm shower 90 minutes before bed actually helps — it draws blood to the surface, accelerating core cooling afterward.',
      '## Wind-Down Ritual',
      'Create a 30-minute wind-down: dim lights, no screens, same routine every night. Your brain is a pattern machine — give it the pattern for "sleep is coming."',
    ],
  },
  {
    id: '7',
    title: '6 signs your relationship will last',
    subtitle: 'What science says about lasting love',
    category: 'relationships',
    readTime: '6 mins',
    emoji: '🦋',
    gradient: ['#3450a5', '#8b5cf6', '#f1bf77'],
    isTrending: true,
    source: 'Based on research by John Gottman, PhD',
    content: [
      'Dr. John Gottman can predict divorce with 94% accuracy by observing couples for just 15 minutes. Here are the signs your relationship is built to last.',
      '## 1. You Turn Toward Each Other',
      'When your partner makes a "bid" for attention — a comment, a sigh, a question — you respond with interest rather than ignoring it. Couples who divorce respond to bids only 33% of the time. Happy couples: 87%.',
      '## 2. You Repair After Conflict',
      'All couples fight. The difference is repair — the ability to de-escalate, apologize, or use humor to reconnect. It\'s not about avoiding conflict; it\'s about recovering from it.',
      '## 3. You Share Fondness and Admiration',
      'Couples who regularly express what they appreciate about each other build a buffer against negativity. The ratio matters: 5 positive interactions for every 1 negative.',
      '## 4. You Accept Influence',
      'Partners who consider each other\'s opinions and adjust their behavior accordingly show mutual respect. Research shows this is especially predictive of relationship success.',
      '## 5. You Have Shared Meaning',
      'Happy couples create shared rituals, goals, and narratives. "We\'re the kind of couple who..." creates a shared identity that strengthens the bond.',
      '## 6. You Know Each Other\'s Inner World',
      'Can you name your partner\'s biggest current worry? Their best friend? Their dream vacation? Emotional knowledge is the foundation of intimacy.',
    ],
  },
  {
    id: '8',
    title: 'Anxiety isn\'t the enemy — avoidance is',
    subtitle: 'How to work with anxiety, not against it',
    category: 'anxiety',
    readTime: '5 mins',
    emoji: '🌊',
    gradient: ['#2e5b92', '#7060d8', '#f1cb86'],
    source: 'Based on ACT therapy by Steven Hayes, PhD',
    content: [
      'Most anxiety management advice tells you to reduce anxiety. But research shows the more you fight anxiety, the stronger it gets. The alternative? Learn to carry it.',
      '## The Avoidance Trap',
      'Every time you avoid something because of anxiety, you teach your brain that the threat was real. Avoidance provides instant relief but long-term amplification. The comfort zone shrinks.',
      '## Anxiety as Information',
      'Anxiety isn\'t always a problem to solve — sometimes it\'s information. "I\'m anxious about this presentation" might mean "I care about doing well." Reframing anxiety as caring changes your relationship with it.',
      '## The RAIN Technique',
      'Recognize: "I\'m feeling anxious." Allow: "It\'s okay to feel this." Investigate: "Where do I feel this in my body?" Non-identify: "This feeling is not who I am."',
      '## Exposure in Doses',
      'Gradual exposure to anxiety-provoking situations — starting small and building up — is the gold standard treatment for anxiety disorders. Each successful exposure teaches your brain: "I can handle this."',
      '## The Willingness Stance',
      'Instead of "How do I get rid of anxiety?" try "Am I willing to feel anxious in order to live the life I want?" This shift from elimination to acceptance is at the heart of modern anxiety treatment.',
    ],
  },
];

// ── Article Detail Component ──────────────────────────────────
function ArticleDetail({ article, onClose, dark }: { article: Article; onClose: () => void; dark: boolean }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.articleDetailContainer, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.articleDetailHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onClose} style={styles.articleBackButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.articleDetailHeaderTitle, { color: theme.colors.primaryText }]}>Article</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.articleDetailScroll}
        contentContainerStyle={styles.articleDetailContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={article.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.articleDetailHero}
        >
          <Image source={noiseTexture} style={styles.heroNoise} resizeMode="cover" />
          <View style={styles.articleDetailBadge}>
            <Text style={styles.articleDetailBadgeText}>{article.category}</Text>
          </View>
          <Text style={styles.articleDetailHeroTitle}>{article.title}</Text>
        </LinearGradient>

        <View style={styles.articleDetailMeta}>
          <Text style={[styles.articleDetailReadTime, { color: theme.colors.secondaryText }]}>
            Article
          </Text>
          <Text style={[styles.articleMetaDivider, { color: theme.colors.secondaryText }]}>•</Text>
          <Text style={[styles.articleDetailReadTime, { color: theme.colors.secondaryText }]}>
            {article.readTime} read
          </Text>
        </View>
        <View style={styles.articleDetailSourceWrap}>
          <Text style={[styles.articleDetailSource, { color: theme.colors.secondaryText }]}>
            {article.source}
          </Text>
        </View>

        {/* Content */}
        {article.content.map((paragraph, index) => {
          if (paragraph.startsWith('## ')) {
            return (
              <Text key={index} style={[styles.articleSectionTitle, { color: theme.colors.primaryText }]}>
                {paragraph.replace('## ', '')}
              </Text>
            );
          }
          return (
            <Text key={index} style={[styles.articleParagraph, { color: theme.colors.secondaryText }]}>
              {paragraph}
            </Text>
          );
        })}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

// ── Main Explore Screen ───────────────────────────────────────
export default function ExploreScreen({ navigation }: any) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = selectedCategory === 'all'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === selectedCategory);

  const trendingArticle = ARTICLES.find(a => a.isTrending) || ARTICLES[0];

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onClose={() => setSelectedArticle(null)} dark={dark} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primaryText} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>Explore</Text>
        </View>

        {/* Trending Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedArticle(trendingArticle);
          }}
        >
          <LinearGradient
            colors={trendingArticle.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.trendingCard}
          >
          <Image source={noiseTexture} style={styles.heroNoise} resizeMode="cover" />
            <View style={styles.trendingBadge}>
              <Ionicons name="flash" size={12} color="#f59e0b" />
              <Text style={styles.trendingBadgeText}>TRENDING</Text>
            </View>
          <Text style={styles.trendingEmoji}>{trendingArticle.emoji}</Text>
          <View style={styles.trendingTextWrap}>
            <Text style={styles.trendingTitle}>{trendingArticle.title}</Text>
            <Text style={styles.trendingSubtitle}>{trendingArticle.subtitle}</Text>
            <TouchableOpacity
              style={styles.trendingButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedArticle(trendingArticle);
              }}
            >
              <Text style={styles.trendingButtonText}>Explore now</Text>
            </TouchableOpacity>
          </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isActive
                      ? '#8b5cf6'
                      : dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(cat.id);
                }}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={isActive ? '#fff' : theme.colors.secondaryText}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: isActive ? '#fff' : theme.colors.secondaryText },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section: Based on your journey */}
        <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
          Based on your journey
        </Text>

        {/* Article Cards */}
        {filteredArticles.filter(a => a.id !== trendingArticle.id).map(article => (
          <TouchableOpacity
            key={article.id}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedArticle(article);
            }}
            style={[
              styles.articleCard,
              {
                backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              },
            ]}
          >
            <View style={styles.articleCardContent}>
              <View style={styles.articleCardTopRow}>
                <View style={[styles.articleCategoryPill, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                  <Text style={[styles.articleCategoryPillText, { color: theme.colors.secondaryText }]}>
                    {article.category}
                  </Text>
                </View>
              </View>
              <Text style={[styles.articleCardTitle, { color: theme.colors.primaryText }]} numberOfLines={2}>
                {article.title}
              </Text>
              <Text style={[styles.articleCardSubtitle, { color: theme.colors.secondaryText }]} numberOfLines={1}>
                {article.subtitle}
              </Text>
              <View style={styles.articleCardMeta}>
                <Text style={[styles.articleCardType, { color: theme.colors.secondaryText }]}>
                  Article
                </Text>
                <Text style={[styles.articleCardDot, { color: theme.colors.secondaryText }]}>•</Text>
                <Text style={[styles.articleCardTime, { color: theme.colors.secondaryText }]}>
                  {article.readTime}
                </Text>
              </View>
            </View>
            <View style={[styles.articleCardEmoji, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)' }]}>
              <Text style={styles.articleCardEmojiText}>{article.emoji}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isTablet ? 48 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: sf(28),
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // Trending
  trendingCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    minHeight: 200,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroNoise: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.03,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 18, 48, 0.26)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  trendingBadgeText: {
    color: '#ffd166',
    fontSize: sf(11),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  trendingTextWrap: {
    width: '78%',
  },
  trendingEmoji: {
    position: 'absolute',
    right: 22,
    top: 52,
    fontSize: 34,
  },
  trendingTitle: {
    fontSize: sf(24),
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    lineHeight: sf(30),
    letterSpacing: -0.35,
  },
  trendingSubtitle: {
    fontSize: sf(14),
    color: 'rgba(255,255,255,0.88)',
    marginBottom: 16,
    lineHeight: sf(19),
  },
  trendingButton: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  trendingButtonText: {
    color: '#fff',
    fontSize: sf(14),
    fontWeight: '600',
  },

  // Categories
  categoryScroll: {
    marginBottom: 24,
  },
  categoryContent: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipText: {
    fontSize: sf(13),
    fontWeight: '600',
  },

  // Section
  sectionTitle: {
    fontSize: sf(18),
    fontWeight: '700',
    marginBottom: 16,
  },

  // Article Cards
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
  },
  articleCardContent: {
    flex: 1,
    marginRight: 14,
  },
  articleCardTopRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  articleCategoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  articleCategoryPillText: {
    fontSize: sf(11),
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  articleCardTitle: {
    fontSize: sf(16),
    fontWeight: '700',
    lineHeight: sf(21),
    marginBottom: 6,
  },
  articleCardSubtitle: {
    fontSize: sf(13),
    lineHeight: sf(18),
    marginBottom: 10,
  },
  articleCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  articleCardType: {
    fontSize: sf(12),
  },
  articleCardDot: {
    fontSize: sf(12),
  },
  articleCardTime: {
    fontSize: sf(12),
  },
  articleCardEmoji: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  articleCardEmojiText: {
    fontSize: 24,
  },

  // Article Detail
  articleDetailContainer: {
    flex: 1,
  },
  articleDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  articleBackButton: {
    padding: 4,
  },
  articleDetailHeaderTitle: {
    fontSize: sf(17),
    fontWeight: '600',
  },
  articleDetailScroll: {
    flex: 1,
  },
  articleDetailContent: {
    paddingHorizontal: isTablet ? 48 : 24,
  },
  articleDetailHero: {
    minHeight: 180,
    borderRadius: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: 22,
    marginBottom: 24,
    overflow: 'hidden',
  },
  articleDetailBadge: {
    marginBottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  articleDetailBadgeText: {
    color: '#fff',
    fontSize: sf(11),
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 0.4,
  },
  articleDetailHeroTitle: {
    fontSize: sf(24),
    fontWeight: '700',
    lineHeight: sf(30),
    color: '#fff',
    letterSpacing: -0.35,
  },
  articleDetailMeta: {
    marginBottom: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  articleDetailReadTime: {
    fontSize: sf(13),
    fontWeight: '600',
  },
  articleMetaDivider: {
    fontSize: sf(13),
  },
  articleDetailSourceWrap: {
    marginBottom: 28,
  },
  articleDetailSource: {
    fontSize: sf(12),
    fontStyle: 'italic',
  },
  articleSectionTitle: {
    fontSize: sf(19),
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 10,
  },
  articleParagraph: {
    fontSize: sf(16),
    lineHeight: sf(24),
    marginBottom: 16,
  },
});
