import { MoodTier } from './types';

export const FEELINGS_BY_TIER: Record<MoodTier, string[]> = {
  terrible: [
    'Overwhelmed', 'Hopeless', 'Empty', 'Numb', 'Panicked', 'Exhausted',
    'Lonely', 'Angry', 'Guilty', 'Ashamed', 'Restless', 'Disconnected',
    'Stuck', 'Drained', 'Fragile', 'Lost', 'Tense', 'Sad', 'Anxious', 'Frustrated',
    'Vulnerable', 'Unmotivated', 'Irritable', 'Defeated',
  ],
  struggling: [
    'Stressed', 'Anxious', 'Worried', 'Tired', 'Low', 'Uncertain',
    'Irritable', 'Overwhelmed', 'Distracted', 'Unmotivated', 'Lonely',
    'Tense', 'Restless', 'Drained', 'Self-critical', 'Nervous', 'Flat',
    'Impatient', 'Sensitive', 'Discouraged', 'Foggy', 'On edge',
    'Burnt out', 'Unsettled', 'Insecure',
  ],
  neutral: [
    'Calm', 'Steady', 'Okay', 'Present', 'Thoughtful', 'Quiet',
    'Balanced', 'Mellow', 'Reserved', 'Observant', 'Patient', 'Indifferent',
    'Reflective', 'Composed', 'Even', 'Unsure', 'Neutral', 'Settled',
    'Mild', 'Accepting', 'Grounded', 'Distant', 'Routine', 'Fine',
  ],
  good: [
    'Calm', 'Content', 'Grateful', 'Hopeful', 'Motivated', 'Relaxed',
    'Confident', 'Pleasant', 'Focused', 'Optimistic', 'Connected',
    'Energised', 'Proud', 'Light', 'Warm', 'Satisfied', 'Capable',
    'Inspired', 'Balanced', 'Cheerful', 'Present', 'Supported', 'Clear',
    'Steady',
  ],
  amazing: [
    'Joyful', 'Excited', 'Grateful', 'Fulfilled', 'Confident', 'Inspired',
    'Energised', 'Connected', 'Proud', 'Blissful', 'Motivated', 'Alive',
    'Loved', 'Peaceful', 'Radiant', 'Thrilled', 'Accomplished', 'Free',
    'Playful', 'Optimistic', 'Powerful', 'Content', 'Happy', 'Valued',
    'Elated',
  ],
};

export const CONTEXT_WHO = ['Alone', 'Partner', 'Family', 'Friends', 'Coworkers', 'Pets', 'Strangers'];
export const CONTEXT_WHERE = ['Home', 'Work', 'Outdoors', 'Gym', 'Transit', 'Café', 'School', 'Bed'];
export const CONTEXT_DOING = [
  'Resting', 'Working', 'Exercising', 'Socialising', 'Eating', 'Commuting',
  'Creating', 'Learning', 'Scrolling', 'Chores', 'Reflecting',
];

export const MOOD_TINTS: Record<MoodTier, {
  bg: [string, string, string];
  lightBg: [string, string, string];
  accent: string;
  chip: string;
}> = {
  terrible: {
    bg: ['#0c1018', '#121828', '#0e1420'],
    lightBg: ['#f8fbff', '#eaf3ff', '#faf6ff'],
    accent: '#60A5FA',
    chip: 'rgba(96, 165, 250, 0.22)',
  },
  struggling: {
    bg: ['#0c0e18', '#101628', '#0e1220'],
    lightBg: ['#f5f8ff', '#e8efff', '#faf8ff'],
    accent: '#818CF8',
    chip: 'rgba(129, 140, 248, 0.22)',
  },
  neutral: {
    bg: ['#0c0c12', '#14121c', '#101018'],
    lightBg: ['#fcfaff', '#f4edff', '#fff8fb'],
    accent: '#A78BFA',
    chip: 'rgba(167, 139, 250, 0.18)',
  },
  good: {
    bg: ['#141008', '#1c1608', '#181208'],
    lightBg: ['#fffdf5', '#fff8e1', '#fffef8'],
    accent: '#FBBF24',
    chip: 'rgba(251, 191, 36, 0.24)',
  },
  amazing: {
    bg: ['#181208', '#221a08', '#1c1608'],
    lightBg: ['#fffef0', '#fef9c3', '#fffef8'],
    accent: '#FACC15',
    chip: 'rgba(250, 204, 21, 0.28)',
  },
};
