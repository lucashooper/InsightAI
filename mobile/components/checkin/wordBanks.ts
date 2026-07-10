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

export const MOOD_TINTS: Record<MoodTier, { bg: [string, string, string]; accent: string; chip: string }> = {
  terrible: {
    bg: ['#0f0a14', '#1a1020', '#120818'],
    accent: '#F87171',
    chip: 'rgba(248, 113, 113, 0.22)',
  },
  struggling: {
    bg: ['#0f0c14', '#181028', '#120e1c'],
    accent: '#FB923C',
    chip: 'rgba(251, 146, 60, 0.20)',
  },
  neutral: {
    bg: ['#0c0c12', '#14121c', '#101018'],
    accent: '#A78BFA',
    chip: 'rgba(167, 139, 250, 0.18)',
  },
  good: {
    bg: ['#0c1018', '#121828', '#0e1420'],
    accent: '#60A5FA',
    chip: 'rgba(96, 165, 250, 0.20)',
  },
  amazing: {
    bg: ['#100c18', '#1a1230', '#140e24'],
    accent: '#C084FC',
    chip: 'rgba(192, 132, 252, 0.24)',
  },
};
