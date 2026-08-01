/**
 * Onboarding personality scoring — shared by PersonalityResult (legacy) and Mira chat.
 */

export interface PersonalityProfile {
  primaryPattern: string;
  primaryKey: string;
  description: string;
  dimensions: {
    label: string;
    score: number;
  }[];
}

export function computePersonality(
  answers: Record<string, string>,
  t: (key: string, params?: Record<string, string | number>) => string,
): PersonalityProfile {
  const dims = {
    perfectionism: 0.3,
    anxiety: 0.3,
    selfCompassion: 0.5,
    boundaries: 0.5,
    selfEsteem: 0.5,
  };

  const goal = answers.goal || '';
  if (goal === 'stress') { dims.anxiety += 0.3; dims.selfCompassion -= 0.1; }
  if (goal === 'mood') { dims.selfEsteem -= 0.1; dims.anxiety += 0.15; }
  if (goal === 'habits') { dims.perfectionism += 0.2; dims.boundaries += 0.1; }
  if (goal === 'clarity') { dims.selfCompassion += 0.1; }

  const wellbeing = parseInt(answers.wellbeing || '7', 10);
  if (wellbeing <= 4) {
    dims.anxiety += 0.25;
    dims.selfEsteem -= 0.2;
    dims.selfCompassion -= 0.15;
  } else if (wellbeing <= 6) {
    dims.anxiety += 0.1;
    dims.selfEsteem -= 0.05;
  } else if (wellbeing >= 8) {
    dims.selfCompassion += 0.15;
    dims.selfEsteem += 0.15;
    dims.boundaries += 0.1;
  }

  const freq = answers.frequency || '';
  if (freq === 'daily') { dims.perfectionism += 0.1; dims.selfCompassion += 0.1; }
  if (freq === 'as_needed') { dims.boundaries -= 0.1; }

  const exp = answers.journalingExperience || '';
  if (exp === 'new') { dims.selfCompassion -= 0.05; }
  if (exp === '2+y') { dims.selfCompassion += 0.15; dims.selfEsteem += 0.1; }

  const stressR = answers.stressResponse || '';
  if (stressR === 'ruminate') { dims.anxiety += 0.18; }
  if (stressR === 'self_blame') { dims.selfEsteem -= 0.12; dims.selfCompassion -= 0.12; }
  if (stressR === 'fixate') { dims.perfectionism += 0.2; dims.anxiety += 0.08; }
  if (stressR === 'step_back') { dims.boundaries += 0.12; dims.selfCompassion += 0.1; dims.anxiety -= 0.05; }

  const talk = answers.selfTalk || '';
  if (talk === 'critical') { dims.selfCompassion -= 0.18; dims.selfEsteem -= 0.1; }
  if (talk === 'mixed') { dims.anxiety += 0.04; }
  if (talk === 'supportive') { dims.selfCompassion += 0.12; dims.selfEsteem += 0.1; dims.anxiety -= 0.06; }

  const coping = answers.copingStyle || '';
  if (coping === 'social') { dims.boundaries += 0.08; dims.anxiety -= 0.04; }
  if (coping === 'physical') { dims.selfEsteem += 0.08; }
  if (coping === 'expressive') { dims.selfCompassion += 0.1; }
  if (coping === 'solitude') { dims.boundaries -= 0.06; }

  const changeResp = answers.changeResponse || '';
  if (changeResp === 'resistant') { dims.anxiety += 0.12; dims.boundaries += 0.06; }
  if (changeResp === 'anxious_persevere') { dims.anxiety += 0.15; dims.perfectionism += 0.08; }
  if (changeResp === 'embrace') { dims.anxiety -= 0.1; dims.selfEsteem += 0.12; }
  if (changeResp === 'support_seeking') { dims.boundaries -= 0.08; }

  const motivation = answers.motivationDriver || '';
  if (motivation === 'fear_based') { dims.anxiety += 0.2; dims.perfectionism += 0.12; }
  if (motivation === 'external') { dims.selfEsteem -= 0.08; }
  if (motivation === 'values_driven') { dims.selfCompassion += 0.12; dims.boundaries += 0.1; }
  if (motivation === 'passion') { dims.selfEsteem += 0.1; dims.anxiety -= 0.08; }

  const relationship = answers.relationshipPatterns || '';
  if (relationship === 'anxious_attachment') { dims.anxiety += 0.15; dims.boundaries -= 0.1; }
  if (relationship === 'avoidant') { dims.boundaries += 0.12; dims.selfCompassion -= 0.08; }
  if (relationship === 'fearful_avoidant') { dims.anxiety += 0.12; dims.boundaries += 0.08; }
  if (relationship === 'secure') { dims.selfEsteem += 0.1; dims.anxiety -= 0.08; }

  const conflict = answers.conflictStyle || '';
  if (conflict === 'avoid') { dims.anxiety += 0.12; dims.boundaries -= 0.1; }
  if (conflict === 'accommodate') { dims.boundaries -= 0.15; dims.selfEsteem -= 0.08; }
  if (conflict === 'compete') { dims.boundaries += 0.08; dims.perfectionism += 0.1; }
  if (conflict === 'collaborate') { dims.selfCompassion += 0.1; dims.anxiety -= 0.06; }

  const rest = answers.restStyle || '';
  if (rest === 'guilt_rest') { dims.perfectionism += 0.15; dims.selfCompassion -= 0.12; }
  if (rest === 'solitude_rest') { dims.boundaries += 0.06; }
  if (rest === 'social_rest') { dims.boundaries -= 0.04; }
  if (rest === 'active_rest') { dims.selfEsteem += 0.06; }

  const identity = answers.identitySource || '';
  if (identity === 'achievement') { dims.perfectionism += 0.12; dims.selfEsteem -= 0.08; }
  if (identity === 'relationships') { dims.boundaries -= 0.08; }
  if (identity === 'values') { dims.selfCompassion += 0.1; dims.boundaries += 0.08; }
  if (identity === 'expression') { dims.selfEsteem += 0.08; }

  const failure = answers.failureResponse || '';
  if (failure === 'shame') { dims.selfEsteem -= 0.15; dims.selfCompassion -= 0.12; }
  if (failure === 'defensive') { dims.anxiety += 0.1; dims.boundaries += 0.06; }
  if (failure === 'analytical') { dims.perfectionism += 0.08; }
  if (failure === 'growth') { dims.selfEsteem += 0.12; dims.selfCompassion += 0.1; }

  const awareness = answers.emotionalAwareness || '';
  if (awareness === 'low_awareness') { dims.anxiety += 0.08; }
  if (awareness === 'moderate_awareness') { dims.selfCompassion += 0.04; }
  if (awareness === 'high_awareness') { dims.selfCompassion += 0.1; dims.selfEsteem += 0.06; }
  if (awareness === 'very_high_awareness') { dims.selfCompassion += 0.12; dims.anxiety -= 0.06; }

  const decision = answers.decisionMaking || '';
  if (decision === 'overthink') { dims.anxiety += 0.18; dims.perfectionism += 0.12; }
  if (decision === 'intuitive') { dims.boundaries += 0.06; }
  if (decision === 'external_validation') { dims.selfEsteem -= 0.1; dims.boundaries -= 0.08; }
  if (decision === 'systematic') { dims.perfectionism += 0.08; }

  const clamp = (v: number) => Math.min(0.95, Math.max(0.1, v));
  dims.perfectionism = clamp(dims.perfectionism);
  dims.anxiety = clamp(dims.anxiety);
  dims.selfCompassion = clamp(1 - dims.selfCompassion);
  dims.boundaries = clamp(1 - dims.boundaries);
  dims.selfEsteem = clamp(1 - dims.selfEsteem);

  const scores = [
    { key: 'perfectionism', label: t('onboarding.personality.perfectionism'), score: dims.perfectionism },
    { key: 'anxiety', label: t('onboarding.personality.anxiety'), score: dims.anxiety },
    { key: 'selfCompassion', label: t('onboarding.personality.selfCompassion'), score: dims.selfCompassion },
    { key: 'boundaries', label: t('onboarding.personality.boundaries'), score: dims.boundaries },
    { key: 'selfEsteem', label: t('onboarding.personality.selfEsteem'), score: dims.selfEsteem },
  ];

  const primary = scores.reduce((a, b) => (a.score > b.score ? a : b));

  const DESCRIPTIONS: Record<string, string> = {
    perfectionism: t('onboarding.personality.descriptions.perfectionism'),
    anxiety: t('onboarding.personality.descriptions.anxiety'),
    selfCompassion: t('onboarding.personality.descriptions.selfCompassion'),
    boundaries: t('onboarding.personality.descriptions.boundaries'),
    selfEsteem: t('onboarding.personality.descriptions.selfEsteem'),
  };

  return {
    primaryPattern: primary.label,
    primaryKey: primary.key,
    description: DESCRIPTIONS[primary.key] || DESCRIPTIONS.anxiety,
    dimensions: scores.map((s) => ({ label: s.label, score: s.score })),
  };
}

/** True when the user answered enough quiz signal to personalize a pattern card. */
export function hasPersonalitySignal(answers: Record<string, string>): boolean {
  const keys = [
    'stressResponse',
    'selfTalk',
    'copingStyle',
    'changeResponse',
    'motivationDriver',
    'relationshipPatterns',
    'conflictStyle',
    'restStyle',
    'identitySource',
    'failureResponse',
    'emotionalAwareness',
    'decisionMaking',
  ];
  return keys.some((k) => !!answers[k]);
}

/** Reveal-style card payload for Mira onboarding (quiz-grounded, not journal). */
export function buildOnboardingReveal(
  profile: PersonalityProfile,
  answers: Record<string, string>,
): {
  headline: string;
  answer: string;
  confidence: number;
  evidence: string[];
  fromLabel: string;
  strength?: string;
} {
  const goal = answers.goal || '';
  const stress = answers.stressResponse || '';
  const talk = answers.selfTalk || '';
  const wellbeing = parseInt(answers.wellbeing || '7', 10);

  const evidence: string[] = [];
  if (goal) evidence.push(`Your main goal right now centers on ${goal.replace(/_/g, ' ')}`);
  if (stress === 'ruminate' || stress === 'fixate') {
    evidence.push('Under pressure, you tend to loop or over-control rather than reset');
  } else if (stress) {
    evidence.push('Your stress response shape showed up clearly in how you cope');
  }
  if (talk === 'critical') {
    evidence.push('Your inner voice often leans harsh — that compounds the pattern');
  } else if (talk) {
    evidence.push('How you talk to yourself reinforces this emotional pattern');
  }
  if (wellbeing <= 6) {
    evidence.push(`You rated daily wellbeing at ${wellbeing}/10 — a signal this pattern is active`);
  }
  if (evidence.length < 3) {
    evidence.push('This stood out across your baseline responses as the highest-intensity theme');
  }

  // Strength = lowest "problem" dimension inverted label
  const strengthDim = [...profile.dimensions].sort((a, b) => a.score - b.score)[0];
  const strengthMap: Record<string, string> = {
    Perfectionism: 'Self-acceptance',
    Anxiety: 'Calm under pressure',
    'Lack of self-compassion': 'Self-kindness',
    'Lack of boundaries': 'Healthy boundaries',
    'Low self-esteem': 'Self-worth',
  };

  return {
    headline: 'Core Pattern Detected',
    answer: profile.primaryPattern,
    confidence: Math.min(92, Math.max(68, Math.round(58 + profile.dimensions[0].score * 35))),
    evidence: evidence.slice(0, 3),
    fromLabel: 'From your answers',
    strength: strengthMap[strengthDim?.label] || strengthDim?.label || 'Resilience',
  };
}
