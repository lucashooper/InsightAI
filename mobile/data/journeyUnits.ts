import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The Journey curriculum — step-based units, each with three short lessons.
 * Art is generated per unit (see assets/generated); colours drive the card
 * gradient, the lesson backdrop and the mascot tint while that unit is in view.
 */

export type JourneyLesson = {
  id: string;
  title: string;
  /** Short psychoeducation, 2–3 paragraphs. */
  body: string[];
  /** Closing reflection prompt. */
  reflection: string;
  sources?: string[];
};

export type JourneyUnit = {
  id: string;
  title: string;
  subtitle: string;
  /** Card gradient, top-left → bottom-right. */
  colors: readonly [string, string];
  /** Deep ink for the unit — used on light surfaces. */
  ink: string;
  /** Mascot tint while this unit is in view. */
  mascotTint: string;
  /** Generated illustration (right-aligned in the card). */
  art?: number;
  lessons: JourneyLesson[];
};

export const JOURNEY_UNITS: JourneyUnit[] = [
  {
    id: 'thoughts',
    title: 'Thoughts',
    subtitle: 'How your mind works',
    colors: ['#F2717C', '#FFB1B5'],
    ink: '#B33A46',
    mascotTint: '#FFB7C6',
    art: require('../assets/generated/journey-thoughts.png'),
    lessons: [
      {
        id: 'negativity-bias',
        title: 'Why your mind prefers the negative',
        body: [
          'Your brain is a survival organ before it is a happiness organ. For most of human history, missing a threat cost far more than missing a reward, so attention learned to lean toward what could go wrong.',
          'That lean is called the negativity bias. It is why one critical comment can outweigh ten kind ones, and why a quiet evening can fill with worries you did not invite.',
          'Noticing the bias does not switch it off — but it does let you hold negative thoughts a little more lightly, as weather rather than fact.',
        ],
        reflection: 'When did a small negative moment take up more space today than it deserved?',
        sources: ['National Library of Medicine', 'Concordia University', 'The Harvard Gazette'],
      },
      {
        id: 'thoughts-not-facts',
        title: 'Thoughts are events, not facts',
        body: [
          'A thought arrives, and it feels like a report from reality. But thoughts are generated — by mood, memory, fatigue and habit — far more than they are observed.',
          'Cognitive science calls the gap between a thought and what is actually true "cognitive distance". The wider that gap, the less a passing thought can push you around.',
          'A simple move: add the words "I am having the thought that…" before the sentence in your head. Notice how the same words weigh less.',
        ],
        reflection: 'Which recurring thought would you like to hold at a little more distance?',
      },
      {
        id: 'attention',
        title: 'Where attention goes, mood follows',
        body: [
          'Attention is the one part of your mind you can steer directly. What you dwell on becomes the texture of your day.',
          'That is not positive thinking — it is deliberate noticing. The task is not to deny what is hard, but to make sure the good gets counted too.',
          'Journaling works partly because it forces attention to slow down and land on specifics.',
        ],
        reflection: 'What is one ordinary thing from today that deserved more of your attention?',
      },
    ],
  },
  {
    id: 'emotions',
    title: 'Emotions',
    subtitle: 'Your emotions are talking. Learn to listen.',
    colors: ['#4FAF7A', '#A8E0B8'],
    ink: '#24774E',
    mascotTint: '#A9EAD1',
    art: require('../assets/generated/journey-emotions.png'),
    lessons: [
      {
        id: 'signals',
        title: 'Emotions are signals, not verdicts',
        body: [
          'Every emotion carries information. Anxiety points at something that matters and feels uncertain. Anger marks a boundary crossed. Sadness tells you something was valued.',
          'The trouble starts when we treat the signal as a sentence — as if feeling anxious means we are in danger, or feeling low means life is bad.',
          'Reading emotions as messages, rather than judgements, keeps you in the driver\'s seat.',
        ],
        reflection: 'What might your strongest feeling today have been trying to tell you?',
      },
      {
        id: 'name-it',
        title: 'Name it to tame it',
        body: [
          'Putting a precise word to a feeling — "disappointed", not just "bad" — measurably lowers its intensity. Brain imaging shows the emotional centres quieten when the language centres engage.',
          'Precision matters. "Stressed" could be overwhelmed, rushed, resentful or scared. Each one asks for something different.',
          'The check-in and feelings step in Insight are built around this one idea.',
        ],
        reflection: 'Pick a feeling from today and find a more precise word for it.',
      },
      {
        id: 'waves',
        title: 'Feelings move in waves',
        body: [
          'Left alone, most emotions peak and fade within minutes. What keeps them alive is the story we wrap around them — replaying, predicting, judging ourselves for feeling it.',
          'Riding the wave means letting the feeling be in the body without feeding it more thought. Breathe, notice where it sits, let it crest.',
          'You do not need to fix an emotion to survive it.',
        ],
        reflection: 'Where in your body do you tend to notice a difficult feeling first?',
      },
    ],
  },
  {
    id: 'self-compassion',
    title: 'Self-Compassion',
    subtitle: 'Talk to yourself like someone you love',
    colors: ['#A98BE8', '#F3C6F0'],
    ink: '#6B48B8',
    mascotTint: '#D9C4FF',
    art: require('../assets/generated/journey-self-compassion.png'),
    lessons: [
      {
        id: 'inner-critic',
        title: 'Meet the inner critic',
        body: [
          'Most of us carry a voice that is far harsher than anything we would say to a friend. It sounds like discipline — but research is clear that self-criticism predicts less motivation, not more.',
          'The critic is usually trying to protect you: from failure, from judgement, from being caught off guard.',
          'You do not have to silence it. Just stop taking dictation from it.',
        ],
        reflection: 'What did your inner critic say today that you would never say to a friend?',
      },
      {
        id: 'common-humanity',
        title: 'You are not the exception',
        body: [
          'Suffering feels isolating — as if everyone else has it figured out. Self-compassion research calls the antidote "common humanity": remembering that struggle is part of being a person, not evidence you are doing it wrong.',
          'The moment you think "of course this is hard, anyone would find this hard", the shame loosens.',
        ],
        reflection: 'What are you going through that many other people are also quietly going through?',
      },
      {
        id: 'kind-voice',
        title: 'Practising a kinder voice',
        body: [
          'Self-compassion is a skill, not a personality trait. It gets stronger with rehearsal.',
          'One practice: when you notice you are struggling, place a hand on your chest and say, in your own words, "This is hard. I am here. What do I need right now?"',
          'It can feel awkward at first. That awkwardness is just unfamiliarity.',
        ],
        reflection: 'What is one kind sentence you could offer yourself tonight?',
      },
    ],
  },
  {
    id: 'habits',
    title: 'Habits',
    subtitle: 'Small steps, real change',
    colors: ['#4C9BE8', '#B6DCFF'],
    ink: '#2A63A8',
    mascotTint: '#A6D3FF',
    art: require('../assets/generated/journey-habits.png'),
    lessons: [
      {
        id: 'tiny',
        title: 'Start smaller than feels reasonable',
        body: [
          'Motivation is unreliable; it fades exactly when habits are forming. The fix is to make the first step so small that motivation is not required.',
          'Two minutes of journaling. One deep breath before opening your phone. Habits scale up once they exist — they rarely survive starting big.',
        ],
        reflection: 'What is the two-minute version of a habit you want?',
      },
      {
        id: 'cues',
        title: 'Anchor to what already happens',
        body: [
          'Habits are triggered by cues, not by intentions. The most reliable cues are things you already do every day: making coffee, brushing your teeth, sitting down at your desk.',
          'Write the recipe: "After I ______, I will ______." Specific beats ambitious.',
        ],
        reflection: 'Which daily moment could carry a new habit for you?',
      },
      {
        id: 'missing',
        title: 'Never miss twice',
        body: [
          'Missing a day does not break a habit. Missing two starts to. The rule is not perfection — it is a fast return.',
          'Streaks in Insight are a nudge, not a verdict. Come back gently.',
        ],
        reflection: 'How do you usually talk to yourself after missing a day?',
      },
    ],
  },
];

// ─── Progress ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'journey.progress.v1';

/** unitId → set of completed lesson ids. */
export type JourneyProgress = Record<string, string[]>;

export async function loadJourneyProgress(): Promise<JourneyProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JourneyProgress) : {};
  } catch {
    return {};
  }
}

export async function markLessonComplete(unitId: string, lessonId: string): Promise<JourneyProgress> {
  const current = await loadJourneyProgress();
  const done = new Set(current[unitId] ?? []);
  done.add(lessonId);
  const next = { ...current, [unitId]: Array.from(done) };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best-effort
  }
  return next;
}

export function unitCompletedCount(unit: JourneyUnit, progress: JourneyProgress): number {
  const done = new Set(progress[unit.id] ?? []);
  return unit.lessons.filter((l) => done.has(l.id)).length;
}

export function isUnitComplete(unit: JourneyUnit, progress: JourneyProgress): boolean {
  return unitCompletedCount(unit, progress) >= unit.lessons.length;
}

/** A unit unlocks once the one before it is complete. */
export function isUnitUnlocked(index: number, progress: JourneyProgress): boolean {
  if (index === 0) return true;
  return isUnitComplete(JOURNEY_UNITS[index - 1], progress);
}

/** Index of the first lesson not yet completed (or the last one). */
export function nextLessonIndex(unit: JourneyUnit, progress: JourneyProgress): number {
  const done = new Set(progress[unit.id] ?? []);
  const idx = unit.lessons.findIndex((l) => !done.has(l.id));
  return idx === -1 ? unit.lessons.length - 1 : idx;
}
