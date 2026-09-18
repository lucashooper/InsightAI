export type QuizKind = 'choice' | 'likert' | 'interstitial' | 'analysis' | 'email' | 'results' | 'graph' | 'plan';

export interface QuizOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  score?: number;
}

export interface QuizStep {
  id: string;
  kind: QuizKind;
  title: string;
  subtitle?: string;
  options?: QuizOption[];
  statement?: string;
  variant?: 'authority' | 'social';
}

export const LIKERT_OPTIONS: QuizOption[] = [
  { value: '1', label: 'Strongly disagree', icon: 'down2', score: 0 },
  { value: '2', label: 'Disagree', icon: 'down', score: 1 },
  { value: '3', label: 'Not sure', icon: 'unsure', score: 2 },
  { value: '4', label: 'Agree', icon: 'up', score: 3 },
  { value: '5', label: 'Strongly agree', icon: 'up2', score: 4 },
];

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'q1',
    kind: 'choice',
    title: "What's holding you back most right now?",
    subtitle: 'Pick the pattern that feels closest.',
    options: [
      { value: 'overthinking', label: 'Overthinking loops', icon: '🌀', score: 3 },
      { value: 'anxiety', label: 'Anxiety and tension', icon: '🌊', score: 3 },
      { value: 'focus', label: 'Focus and follow-through', icon: '🎯', score: 3 },
      { value: 'fatigue', label: 'Mental fatigue', icon: '🌙', score: 3 },
    ],
  },
  {
    id: 'q2',
    kind: 'choice',
    title: 'How often do you struggle to focus or stay productive?',
    options: [
      { value: 'often', label: 'Often', icon: '⭐', score: 4 },
      { value: 'sometimes', label: 'Sometimes', icon: '❓', score: 2 },
      { value: 'rarely', label: 'Rarely', icon: '✨', score: 1 },
    ],
  },
  {
    id: 'q3',
    kind: 'choice',
    title: 'How often do loop thoughts or mental clutter take over?',
    options: [
      { value: 'daily', label: 'Almost every day', icon: '🔁', score: 4 },
      { value: 'often', label: 'A few times a week', icon: '💭', score: 3 },
      { value: 'sometimes', label: 'Now and then', icon: '🍃', score: 2 },
      { value: 'rarely', label: 'Rarely', icon: '🌤️', score: 1 },
    ],
  },
  {
    id: 'q4',
    kind: 'choice',
    title: 'When do you feel most mentally drained?',
    options: [
      { value: 'mornings', label: 'Before the day even starts', icon: '🌅', score: 3 },
      { value: 'work', label: 'In the middle of work or study', icon: '💻', score: 3 },
      { value: 'evenings', label: 'At night, when I try to switch off', icon: '🌜', score: 3 },
      { value: 'always', label: 'It never really lets up', icon: '⚡', score: 4 },
    ],
  },
  {
    id: 'q5',
    kind: 'choice',
    title: 'What usually happens when your thoughts start to spiral?',
    options: [
      { value: 'replay', label: 'I replay conversations', icon: '🗣️', score: 3 },
      { value: 'freeze', label: 'I freeze and avoid starting', icon: '🧊', score: 4 },
      { value: 'scroll', label: 'I distract myself until it fades', icon: '📱', score: 2 },
      { value: 'push', label: 'I push through and feel worse later', icon: '🏃', score: 3 },
    ],
  },
  {
    id: 'q6',
    kind: 'choice',
    title: 'How do you currently process what’s on your mind?',
    options: [
      { value: 'head', label: 'I keep it all in my head', icon: '🧠', score: 4 },
      { value: 'notes', label: 'Scattered notes, no system', icon: '📝', score: 2 },
      { value: 'talk', label: 'I talk it out with someone', icon: '💬', score: 1 },
      { value: 'journal', label: 'I already journal, inconsistently', icon: '📓', score: 2 },
    ],
  },
  {
    id: 'q7',
    kind: 'choice',
    title: 'How many minutes a day can you dedicate to a mental reset?',
    options: [
      { value: '3', label: '3 minutes', icon: '⏱️', score: 1 },
      { value: '5', label: '5 minutes', icon: '🕔', score: 2 },
      { value: '10', label: '10 minutes', icon: '🔟', score: 2 },
      { value: '15', label: '15+ minutes', icon: '🌿', score: 3 },
    ],
  },
  {
    id: 'q8',
    kind: 'likert',
    title: 'Do you agree with the following statement?',
    statement: 'Sometimes my brain feels like it’s running in ten directions at once',
  },
  {
    id: 'q9',
    kind: 'likert',
    title: 'Do you agree with the following statement?',
    statement: 'I replay conversations long after they’re over',
  },
  {
    id: 'q10',
    kind: 'likert',
    title: 'Do you agree with the following statement?',
    statement: 'I know what I should do, but starting feels heavier than it should',
  },
  {
    id: 'q11',
    kind: 'likert',
    title: 'Do you agree with the following statement?',
    statement: 'My mood shifts and I can’t always name why',
  },
  {
    id: 'q12',
    kind: 'likert',
    title: 'Do you agree with the following statement?',
    statement: 'I keep insights in my head instead of writing them down',
  },
  {
    id: 'q13',
    kind: 'likert',
    title: 'Do you agree with the following statement?',
    statement: 'I feel mentally tired even after a full night’s sleep',
  },
  {
    id: 'q14',
    kind: 'likert',
    title: 'Do you agree with the following statement?',
    statement: 'I put others’ needs first until I have nothing left',
  },
  {
    id: 'q15',
    kind: 'likert',
    title: 'Do you agree with the following statement?',
    statement: 'I want a daily reset, but I never stick with it',
  },
  {
    id: 'authority',
    kind: 'interstitial',
    variant: 'authority',
    title: 'Insight was designed around evidence-based psychological practices',
    subtitle: 'Your journey draws on decades of research in reflection, CBT journaling, and mindfulness.',
  },
  {
    id: 'q17',
    kind: 'choice',
    title: 'What’s the biggest blocker to staying consistent?',
    options: [
      { value: 'time', label: 'I never have enough time', icon: '⌛', score: 2 },
      { value: 'forget', label: 'I forget until the day is over', icon: '🔔', score: 2 },
      { value: 'blank', label: 'I sit down and go blank', icon: '😶', score: 3 },
      { value: 'unsure', label: 'I’m not sure it will help', icon: '❔', score: 3 },
    ],
  },
  {
    id: 'q18',
    kind: 'choice',
    title: 'If you had more mental clarity, what would you protect first?',
    options: [
      { value: 'work', label: 'Focus at work', icon: '📌', score: 2 },
      { value: 'sleep', label: 'Calmer evenings and sleep', icon: '🛌', score: 2 },
      { value: 'relationships', label: 'How I show up for people', icon: '💛', score: 2 },
      { value: 'self', label: 'A kinder inner voice', icon: '🪞', score: 3 },
    ],
  },
  {
    id: 'social',
    kind: 'interstitial',
    variant: 'social',
    title: 'People who start with Insight notice the shift in days, not months',
    subtitle: 'A few minutes of honest reflection is enough to see your patterns clearly.',
  },
  {
    id: 'analysis',
    kind: 'analysis',
    title: 'Creating your 28-day reflection plan',
  },
  {
    id: 'email',
    kind: 'email',
    title: 'Enter your email to see your personal Profile Summary',
    subtitle: 'We’ll save your results and send you a way to start in the app.',
  },
  {
    id: 'results',
    kind: 'results',
    title: 'Summary of your Profile',
  },
  {
    id: 'graph',
    kind: 'graph',
    title: 'Your execution capacity level',
  },
  {
    id: 'plan',
    kind: 'plan',
    title: 'Your 28-Day Anti-Self-Sabotage Challenge is ready!',
  },
];

export const QUESTION_STEP_COUNT = QUIZ_STEPS.filter(
  (s) => s.kind === 'choice' || s.kind === 'likert' || s.kind === 'interstitial',
).length;

export const ANALYSIS_MESSAGES = [
  { label: 'Analyzing cognitive baseline…', progress: 18 },
  { label: 'Mapping thought-loop patterns…', progress: 42 },
  { label: 'Matching your reflection style…', progress: 68 },
  { label: 'Generating 28-day plan…', progress: 92 },
];

export const ANALYSIS_REVIEWS = [
  {
    stars: 5,
    name: 'Maya',
    title: 'Finally something that stuck',
    body: 'Five minutes at night and I actually see why my mood drops. It feels like a private coach, not a chore.',
  },
  {
    stars: 5,
    name: 'Jordan',
    title: 'A welcoming environment',
    body: 'Soft enough that I opened up, structured enough that I kept going. The voice notes changed everything.',
  },
  {
    stars: 5,
    name: 'Priya',
    title: 'Patterns I couldn’t name',
    body: 'Insight showed me I wasn’t “lazy” — I was looping. Once I saw it, I could work with it.',
  },
];

export const AUTHORITY_CARDS = [
  { kicker: 'METHOD', title: 'CBT journaling' },
  { kicker: 'PRACTICE', title: 'Mindfulness research' },
  { kicker: 'HABIT', title: 'Reflective writing' },
];

export type MatchLevel = 'Low' | 'Normal' | 'Medium' | 'High';

export interface QuizProfile {
  label: string;
  matchLevel: MatchLevel;
  matchPercent: number;
  summary: string;
  insight: string;
  mainChallenge: string;
  selfPerception: string;
  highlights: string[];
}

const GOAL_LABELS: Record<string, string> = {
  overthinking: 'Thought Pattern Breaker',
  anxiety: 'Emotional Grounding Profile',
  focus: 'Focus Rebuild Profile',
  fatigue: 'Energy Restoration Profile',
};

const CHALLENGE_LABELS: Record<string, string> = {
  overthinking: 'Thought looping',
  anxiety: 'Anxious load',
  focus: 'Executive follow-through',
  fatigue: 'Mental depletion',
  replay: 'Rumination',
  freeze: 'Start-up friction',
  scroll: 'Avoidant distraction',
  push: 'Overdrive coping',
};

const PERCEPTION_LABELS: Record<string, string> = {
  head: 'Insights stay internal',
  notes: 'Scattered self-tracking',
  talk: 'Needs a private channel',
  journal: 'Inconsistent reflection',
  self: 'Harsh inner narrator',
  blank: 'Blank-page freeze',
};

function likertScore(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n - 1 : 2;
}

export function buildQuizProfile(answers: Record<string, string>): QuizProfile {
  const goal = answers.q1 ?? 'clarity';
  let raw = 0;
  let max = 0;

  for (const step of QUIZ_STEPS) {
    const value = answers[step.id];
    if (step.kind === 'choice' && step.options) {
      max += 4;
      const opt = step.options.find((o) => o.value === value);
      raw += opt?.score ?? 0;
    } else if (step.kind === 'likert') {
      max += 4;
      raw += likertScore(value);
    }
  }

  const ratio = max > 0 ? raw / max : 0.5;
  const matchPercent = Math.round(38 + ratio * 58);
  const matchLevel: MatchLevel =
    ratio >= 0.72 ? 'High' : ratio >= 0.55 ? 'Medium' : ratio >= 0.38 ? 'Normal' : 'Low';

  const spiral = answers.q5 ?? '';
  const process = answers.q6 ?? '';
  const protect = answers.q18 ?? '';

  const label = GOAL_LABELS[goal] ?? 'Cognitive Clarity Profile';
  const mainChallenge = CHALLENGE_LABELS[spiral] ?? CHALLENGE_LABELS[goal] ?? 'Mental clutter';
  const selfPerception = PERCEPTION_LABELS[protect] ?? PERCEPTION_LABELS[process] ?? 'Needs a daily reset';

  const summaries: Record<MatchLevel, string> = {
    High:
      'Patterns like yours often run in the background for years. Your mind holds more at once than it can quietly set down — which registers as strain even when you look “fine.”',
    Medium:
      'You already notice the loops. What’s missing is a reliable place to put them, so they don’t keep stealing focus from the next hour.',
    Normal:
      'Your baseline is workable, but the clutter still steals small windows of the day. A short, consistent reset will compound quickly.',
    Low:
      'You’re closer to clarity than you think. A light daily practice will keep the quieter days from sliding back into noise.',
  };

  const minutes = answers.q7 ?? '5';

  return {
    label,
    matchLevel,
    matchPercent,
    summary: summaries[matchLevel],
    insight:
      'A private reflection system — voice or text — gives this kind of mind somewhere to land. Capture the loop, name the trigger, then close the day.',
    mainChallenge,
    selfPerception,
    highlights: [
      `Primary focus: ${label.replace(' Profile', '').replace(' Breaker', '')}`,
      `Daily window: ${minutes} minutes`,
      `Recommended: voice + text journaling with AI pattern analysis`,
    ],
  };
}

export const APP_STORE_URL =
  'https://apps.apple.com/us/app/insight-understand-yourself/id6755717396';

export const TESTFLIGHT_URL = 'https://testflight.apple.com/join/6DmaDpNf';

export function firstNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const token = local.split(/[._-]/)[0] ?? '';
  if (!token) return '';
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}
