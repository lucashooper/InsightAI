export type PatternRawItem = {
  text: string;
  entryId: string;
  originLabel: string;
  date: string;
};

export type PatternGroup = {
  texts: string[];
  entryIds: string[];
  originLabels: string[];
  dates: string[];
  keywords: string[];
  primaryTopic: PrimaryTopic;
};

export type PatternDisplayItem = {
  id: string;
  summary: string;
  description: string | null;
  date: string;
  entryId: string;
  entryIds: string[];
  originLabel: string;
  count: number;
  rawCount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  sectionHint?: string;
};

type PrimaryTopic =
  | 'sleep'
  | 'anxiety'
  | 'social'
  | 'productivity'
  | 'exercise'
  | 'mindfulness'
  | 'confidence'
  | 'general';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'between',
  'through', 'during', 'before', 'after', 'and', 'but', 'or', 'not',
  'no', 'so', 'if', 'then', 'than', 'too', 'very', 'just', 'also',
  'more', 'most', 'some', 'any', 'all', 'each', 'every', 'this', 'that',
  'these', 'those', 'it', 'its', 'you', 'your', 'yours', 'i', 'my',
  'me', 'we', 'our', 'they', 'their', 'them', 'he', 'she', 'his', 'her',
  'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why',
  'up', 'out', 'off', 'over', 'under', 'again', 'further', 'once',
  'here', 'there', 'both', 'few', 'own', 'same', 'other', 'such',
  'only', 'still', 'get', 'got', 'make', 'made', 'take', 'try',
  'need', 'want', 'like', 'know', 'think', 'feel', 'keep', 'let',
  'begin', 'seem', 'help', 'show', 'tend', 'able', 'way', 'well',
  'even', 'new', 'now', 'one', 'two', 'really', 'often', 'much',
  'self', 'doubt', 'developing', 'establish', 'being', 'may', 'explore',
]);

const PRIMARY_TOPIC_TERMS: Record<PrimaryTopic, string[]> = {
  sleep: ['sleep', 'bedtime', 'wake', 'waking', 'insomnia', 'tired', 'fatigue', 'nap', 'rest', 'night', 'asleep'],
  anxiety: ['anxiety', 'anxious', 'worry', 'worried', 'stress', 'stressed', 'nervous', 'panic', 'derealisation', 'derealization', 'overwhelm'],
  social: ['social', 'friends', 'friend', 'relationship', 'relationships', 'lonely', 'isolation', 'family', 'people'],
  productivity: ['productivity', 'productive', 'focus', 'distraction', 'procrastination', 'morning', 'task', 'tasks', 'batch', 'work', 'deadline'],
  exercise: ['exercise', 'workout', 'movement', 'physical', 'health', 'walk', 'run', 'gym'],
  mindfulness: ['mindfulness', 'meditation', 'breathing', 'calm', 'grounding', 'present'],
  confidence: ['confidence', 'self-esteem', 'self-doubt', 'doubt', 'belief', 'capable'],
  general: [],
};

const ACTION_WORDS = [
  'try', 'consider', 'practice', 'establish', 'set', 'create', 'build',
  'develop', 'focus', 'start', 'work', 'take', 'make', 'explore', 'reflect',
  'maintain', 'improve', 'reduce', 'avoid', 'limit', 'schedule', 'wind',
];

const SHARED_PHRASES = [
  'sleep schedule',
  'sleep routine',
  'bedtime routine',
  'wake up',
  'consistent sleep',
  'self doubt',
  'social life',
];

export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

export function getPrimaryTopic(text: string): PrimaryTopic {
  const lower = text.toLowerCase();
  let bestTopic: PrimaryTopic = 'general';
  let bestScore = 0;

  (Object.keys(PRIMARY_TOPIC_TERMS) as PrimaryTopic[]).forEach((topic) => {
    if (topic === 'general') return;
    const score = PRIMARY_TOPIC_TERMS[topic].reduce(
      (sum, term) => sum + (lower.includes(term) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  });

  return bestTopic;
}

function topicsCompatible(a: PrimaryTopic, b: PrimaryTopic): boolean {
  if (a === b) return true;
  if (a === 'general' || b === 'general') return true;
  return false;
}

function keywordSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let shared = 0;
  setA.forEach((word) => {
    if (setB.has(word)) shared += 1;
  });
  const union = new Set([...a, ...b]).size;
  return union > 0 ? shared / union : 0;
}

function phraseOverlap(a: string, b: string): number {
  const aWords = new Set(extractKeywords(a));
  const bWords = new Set(extractKeywords(b));
  let shared = 0;
  aWords.forEach((word) => {
    if (bWords.has(word)) shared += 1;
  });
  const minSize = Math.min(aWords.size, bWords.size);
  return minSize > 0 ? shared / minSize : 0;
}

export function textSimilarity(a: string, b: string): number {
  const keywordsA = extractKeywords(a);
  const keywordsB = extractKeywords(b);
  const jaccard = keywordSimilarity(keywordsA, keywordsB);
  const overlap = phraseOverlap(a, b);

  const topicA = getPrimaryTopic(a);
  const topicB = getPrimaryTopic(b);
  const topicBoost = topicsCompatible(topicA, topicB) && topicA !== 'general' ? 0.2 : 0;

  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  const phraseBoost = SHARED_PHRASES.some(
    (phrase) => aLower.includes(phrase) && bLower.includes(phrase),
  )
    ? 0.55
    : 0;

  const topicPenalty =
    topicA !== 'general' && topicB !== 'general' && topicA !== topicB ? -0.35 : 0;

  return Math.max(0, Math.max(jaccard, overlap * 0.85, phraseBoost, topicBoost) + topicPenalty);
}

function isShortTitle(text: string): boolean {
  return text.length < 70 && !text.includes('. ');
}

function mergeTwoGroups(a: PatternGroup, b: PatternGroup): PatternGroup {
  const mergedTexts = [...a.texts, ...b.texts];
  const topicCounts = new Map<PrimaryTopic, number>();
  mergedTexts.forEach((text) => {
    const topic = getPrimaryTopic(text);
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
  });
  let dominantTopic: PrimaryTopic = a.primaryTopic;
  let maxCount = 0;
  topicCounts.forEach((count, topic) => {
    if (count > maxCount && topic !== 'general') {
      maxCount = count;
      dominantTopic = topic;
    }
  });

  return {
    texts: mergedTexts,
    entryIds: [...new Set([...a.entryIds, ...b.entryIds])],
    originLabels: [...new Set([...a.originLabels, ...b.originLabels])],
    dates: [...a.dates, ...b.dates],
    keywords: [...new Set([...a.keywords, ...b.keywords])],
    primaryTopic: dominantTopic,
  };
}

function mergeSimilarGroups(groups: PatternGroup[], threshold = 0.28): PatternGroup[] {
  let merged = [...groups];
  let changed = true;

  while (changed) {
    changed = false;
    for (let i = 0; i < merged.length; i += 1) {
      for (let j = i + 1; j < merged.length; j += 1) {
        if (!topicsCompatible(merged[i].primaryTopic, merged[j].primaryTopic)) {
          continue;
        }

        const keywordSim = keywordSimilarity(merged[i].keywords, merged[j].keywords);
        const textSims = merged[i].texts.flatMap((t1) =>
          merged[j].texts.map((t2) => textSimilarity(t1, t2)),
        );
        const maxTextSim = textSims.length > 0 ? Math.max(...textSims) : 0;
        const sim = Math.max(keywordSim, maxTextSim);

        if (sim >= threshold) {
          merged[i] = mergeTwoGroups(merged[i], merged[j]);
          merged.splice(j, 1);
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }

  return merged;
}

function textsMatchingTopic(texts: string[], topic: PrimaryTopic): string[] {
  if (topic === 'general') return texts;
  return texts.filter((text) => {
    const textTopic = getPrimaryTopic(text);
    return textTopic === topic || textTopic === 'general';
  });
}

function hasRoutineLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return ['schedule', 'routine', 'consistent', 'consistency', 'habit', 'bedtime', 'wake'].some(
    (term) => lower.includes(term),
  );
}

function canonicalSummary(texts: string[], dominantTopic: PrimaryTopic): string | null {
  const topicTexts = textsMatchingTopic(texts, dominantTopic);
  const topicRatio = topicTexts.length / texts.length;
  if (topicRatio < 0.5) return null;

  const joined = topicTexts.join(' ').toLowerCase();

  if (dominantTopic === 'sleep') {
    if (hasRoutineLanguage(joined)) {
      return 'Consistent sleep schedule & routine';
    }
    return 'Improve sleep habits';
  }

  if (dominantTopic === 'anxiety') {
    return 'Manage anxiety & stress';
  }

  if (dominantTopic === 'social') {
    return 'Social connection & balance';
  }

  if (dominantTopic === 'productivity') {
    return 'Focus & productivity';
  }

  if (dominantTopic === 'exercise') {
    return 'Movement & physical health';
  }

  if (dominantTopic === 'mindfulness') {
    return 'Mindfulness & calm';
  }

  if (dominantTopic === 'confidence') {
    return 'Self-confidence & belief';
  }

  return null;
}

function pickBestTitle(texts: string[], dominantTopic: PrimaryTopic): string {
  const onTopic = textsMatchingTopic(texts, dominantTopic);
  const pool = onTopic.length > 0 ? onTopic : texts;

  const shortOnes = pool.filter(isShortTitle);
  if (shortOnes.length > 0) {
    return shortOnes.sort((a, b) => b.length - a.length)[0];
  }

  const longest = [...pool].sort((a, b) => b.length - a.length)[0];
  const firstSentence = longest.split(/\.\s/)[0];
  return firstSentence.length > 90 ? `${firstSentence.substring(0, 87)}...` : firstSentence;
}

function isRelatedToSummary(text: string, summary: string, dominantTopic: PrimaryTopic): boolean {
  if (text === summary) return false;
  if (text.length < 25) return false;

  const textTopic = getPrimaryTopic(text);
  const summaryTopic = getPrimaryTopic(summary);

  const effectiveSummaryTopic = summaryTopic !== 'general' ? summaryTopic : dominantTopic;

  if (
    effectiveSummaryTopic !== 'general' &&
    textTopic !== 'general' &&
    textTopic !== effectiveSummaryTopic
  ) {
    return false;
  }

  const sim = textSimilarity(text, summary);
  if (sim >= 0.12) return true;

  if (effectiveSummaryTopic !== 'general' && textTopic === effectiveSummaryTopic) {
    return true;
  }

  const summaryLower = summary.toLowerCase();
  const textLower = text.toLowerCase();
  const sharedPhrase = SHARED_PHRASES.some(
    (phrase) => summaryLower.includes(phrase) && textLower.includes(phrase),
  );
  return sharedPhrase;
}

function pickBestDescription(
  texts: string[],
  summary: string,
  dominantTopic: PrimaryTopic,
): string | null {
  const related = texts
    .filter((text) => isRelatedToSummary(text, summary, dominantTopic))
    .sort((a, b) => {
      const aScore = ACTION_WORDS.filter((word) => a.toLowerCase().includes(word)).length;
      const bScore = ACTION_WORDS.filter((word) => b.toLowerCase().includes(word)).length;
      const aSim = textSimilarity(a, summary);
      const bSim = textSimilarity(b, summary);
      return bScore - aScore || bSim - aSim || b.length - a.length;
    });

  if (related.length === 0) return null;

  const best = related[0];
  return best.length > 140 ? `${best.substring(0, 137)}...` : best;
}

function getPriority(count: number, rawCount: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (rawCount >= 5 || count >= 4) return 'HIGH';
  if (rawCount >= 3 || count >= 2) return 'MEDIUM';
  return 'LOW';
}

export function groupPatternItems(
  items: PatternRawItem[],
  personalizeText: (text: string) => string,
  threshold = 0.22,
): PatternGroup[] {
  const groups: PatternGroup[] = [];

  items.forEach((item) => {
    const normalizedText = personalizeText(item.text);
    const keywords = extractKeywords(normalizedText);
    const primaryTopic = getPrimaryTopic(normalizedText);
    let bestGroupIdx = -1;
    let bestSim = 0;

    for (let i = 0; i < groups.length; i += 1) {
      const group = groups[i];

      if (!topicsCompatible(primaryTopic, group.primaryTopic)) {
        continue;
      }

      const keywordSim = keywordSimilarity(keywords, group.keywords);
      const textSims = group.texts.map((text) => textSimilarity(normalizedText, text));
      const maxTextSim = textSims.length > 0 ? Math.max(...textSims) : 0;
      const sim = Math.max(keywordSim, maxTextSim);

      if (sim > bestSim && sim >= threshold) {
        bestSim = sim;
        bestGroupIdx = i;
      }
    }

    if (bestGroupIdx >= 0) {
      const group = groups[bestGroupIdx];
      group.texts.push(normalizedText);
      if (!group.entryIds.includes(item.entryId)) group.entryIds.push(item.entryId);
      if (item.originLabel && !group.originLabels.includes(item.originLabel)) {
        group.originLabels.push(item.originLabel);
      }
      group.dates.push(item.date);
      keywords.forEach((keyword) => {
        if (!group.keywords.includes(keyword)) group.keywords.push(keyword);
      });
      const topicCounts = new Map<PrimaryTopic, number>();
      group.texts.forEach((text) => {
        const topic = getPrimaryTopic(text);
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
      let dominant: PrimaryTopic = group.primaryTopic;
      let max = 0;
      topicCounts.forEach((count, topic) => {
        if (count > max && topic !== 'general') {
          max = count;
          dominant = topic;
        }
      });
      group.primaryTopic = dominant;
    } else {
      groups.push({
        texts: [normalizedText],
        entryIds: [item.entryId],
        originLabels: item.originLabel ? [item.originLabel] : [],
        dates: [item.date],
        keywords,
        primaryTopic,
      });
    }
  });

  return mergeSimilarGroups(groups);
}

function hintForTopic(topic: PrimaryTopic, kind: 'pattern' | 'strength'): string {
  const patternHints: Record<PrimaryTopic, string> = {
    sleep: 'Recurring sleep & routine themes from your journal',
    anxiety: 'Stress and anxiety patterns worth addressing',
    social: 'Social connection themes showing up in your entries',
    productivity: 'Focus and productivity patterns to work on',
    exercise: 'Physical health and movement themes',
    mindfulness: 'Mindfulness and calm-building opportunities',
    confidence: 'Self-belief and confidence patterns to explore',
    general: 'Top priorities based on your recent entries',
  };
  const strengthHints: Record<PrimaryTopic, string> = {
    sleep: 'Sleep and rest habits that are working for you',
    anxiety: 'Coping strategies helping you manage stress',
    social: 'Social habits and connections supporting you',
    productivity: 'Focus habits that are paying off',
    exercise: 'Movement and health wins to keep building on',
    mindfulness: 'Calm and mindfulness practices that help',
    confidence: 'Strengths and wins boosting your confidence',
    general: 'Strategies that are helping you thrive',
  };
  return kind === 'pattern' ? patternHints[topic] : strengthHints[topic];
}

export function groupsToDisplayItems(
  groups: PatternGroup[],
  idPrefix: string,
  limit = 15,
): PatternDisplayItem[] {
  return groups
    .map((group, index) => {
      const onTopicTexts = textsMatchingTopic(group.texts, group.primaryTopic);
      const useCanonical = onTopicTexts.length >= 2;
      const canonical = useCanonical
        ? canonicalSummary(group.texts, group.primaryTopic)
        : null;
      const summary = canonical || pickBestTitle(group.texts, group.primaryTopic);
      const description =
        group.texts.length > 1 ? pickBestDescription(group.texts, summary, group.primaryTopic) : null;
      const count = group.entryIds.length;
      const rawCount = onTopicTexts.length > 0 ? onTopicTexts.length : group.texts.length;

      return {
        id: `${idPrefix}_${index}`,
        summary,
        description: description && description !== summary ? description : null,
        date: group.dates[0],
        entryId: group.entryIds[0],
        entryIds: group.entryIds,
        originLabel:
          group.originLabels.length > 1
            ? `${group.originLabels.length} related entries`
            : group.originLabels[0] || '',
        count,
        rawCount,
        priority: getPriority(count, rawCount),
        sectionHint: hintForTopic(group.primaryTopic, idPrefix === 'pattern' ? 'pattern' : 'strength'),
      };
    })
    .sort((a, b) => b.rawCount - a.rawCount || b.count - a.count)
    .slice(0, limit);
}

export function sectionSubtitleForItems(
  items: PatternDisplayItem[],
  fallback: string,
): string {
  if (!items.length) return fallback;
  return items[0].sectionHint || fallback;
}
