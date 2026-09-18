import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ANALYSIS_MESSAGES,
  ANALYSIS_REVIEWS,
  AUTHORITY_CARDS,
  LIKERT_OPTIONS,
  QUESTION_STEP_COUNT,
  QUIZ_STEPS,
  TESTFLIGHT_URL,
  buildQuizProfile,
  firstNameFromEmail,
  type QuizOption,
} from '../../../constants/quizData';
import { waitlistService } from '../../../services/waitlistService';
import { LikertIcon } from './LikertIcon';
import GrowthChart from './GrowthChart';
import CloudMascotMark from '../CloudMascotMark';

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 20 : -20 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -20 : 20 }),
};

const QuizFlow: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [analysisTick, setAnalysisTick] = useState(0);
  const [reviewTick, setReviewTick] = useState(0);
  const advancing = useRef(false);

  const step = QUIZ_STEPS[index];
  const profile = useMemo(() => buildQuizProfile(answers), [answers]);

  const questionNumber = useMemo(() => {
    let n = 0;
    for (let i = 0; i <= index; i += 1) {
      const kind = QUIZ_STEPS[i].kind;
      if (kind === 'choice' || kind === 'likert' || kind === 'interstitial') n += 1;
    }
    return Math.min(n, QUESTION_STEP_COUNT);
  }, [index]);

  const progress = useMemo(() => {
    if (step.kind === 'analysis') return ANALYSIS_MESSAGES[analysisTick]?.progress ?? 18;
    if (step.kind === 'email' || step.kind === 'results' || step.kind === 'graph' || step.kind === 'plan') return 100;
    return Math.round((questionNumber / QUESTION_STEP_COUNT) * 100);
  }, [step.kind, questionNumber, analysisTick]);

  const goTo = useCallback((next: number, dir: number) => {
    advancing.current = false;
    setDirection(dir);
    setSelected(null);
    setIndex(Math.max(0, Math.min(QUIZ_STEPS.length - 1, next)));
  }, []);

  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const goBack = useCallback(() => {
    if (index === 0) {
      window.location.href = '/';
      return;
    }
    goTo(index - 1, -1);
  }, [goTo, index]);

  useEffect(() => {
    if (step.kind !== 'analysis') return;
    setAnalysisTick(0);
    setReviewTick(0);
    const msg = window.setInterval(() => {
      setAnalysisTick((t) => Math.min(ANALYSIS_MESSAGES.length - 1, t + 1));
    }, 1400);
    const rev = window.setInterval(() => {
      setReviewTick((t) => (t + 1) % ANALYSIS_REVIEWS.length);
    }, 2200);
    const done = window.setTimeout(() => goNext(), 5600);
    return () => {
      window.clearInterval(msg);
      window.clearInterval(rev);
      window.clearTimeout(done);
    };
  }, [step.kind, goNext]);

  const commitAnswer = (value: string) => {
    if (advancing.current) return;
    advancing.current = true;
    setSelected(value);
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
    window.setTimeout(() => goNext(), 220);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    const result = await waitlistService.submitQuizLead({
      email: trimmed,
      goal: answers.q1 ?? 'clarity',
      frequency: answers.q2 ?? answers.q3 ?? 'sometimes',
      minutes: answers.q7 ?? '5',
      profileLabel: profile.label,
      profileSummary: `${profile.matchLevel} · ${profile.mainChallenge} · ${profile.summary}`,
      answers,
      matchLevel: profile.matchLevel,
    });
    setSubmitting(false);
    if (!result.success) {
      console.error('Quiz waitlist save failed:', result.error);
    }
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'quiz_complete', { event_category: 'conversion' });
    }
    goNext();
  };

  const firstName = firstNameFromEmail(email);
  const showPlanChrome = step.kind === 'plan';
  const counterLabel =
    step.kind === 'analysis' || step.kind === 'email' || step.kind === 'results' || step.kind === 'graph' || step.kind === 'plan'
      ? `${QUESTION_STEP_COUNT}/${QUESTION_STEP_COUNT}`
      : `${questionNumber}/${QUESTION_STEP_COUNT}`;

  return (
    <div className="quiz-shell">
      <header className={`quiz-chrome ${showPlanChrome ? 'quiz-chrome--plan' : ''}`}>
        {showPlanChrome ? (
          <>
            <a href="/" className="quiz-brand">Insight</a>
            <CountdownLabel />
            <a className="quiz-chrome-cta" href={TESTFLIGHT_URL} target="_blank" rel="noopener noreferrer">
              Get my plan
            </a>
          </>
        ) : (
          <>
            <button type="button" className="quiz-back" onClick={goBack} aria-label="Back">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <a href="/" className="quiz-brand">Insight</a>
            <span className="quiz-count">{counterLabel}</span>
          </>
        )}
      </header>

      {!showPlanChrome && (
        <div className="quiz-track" aria-hidden="true">
          <div className="quiz-track-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      <main className={`quiz-stage quiz-stage--${step.kind}`}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            className="quiz-panel"
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {step.kind === 'choice' && (
              <ChoiceStep
                title={step.title}
                subtitle={step.subtitle}
                options={step.options ?? []}
                selected={selected ?? answers[step.id]}
                onSelect={commitAnswer}
              />
            )}

            {step.kind === 'likert' && (
              <LikertStep
                title={step.title}
                statement={step.statement ?? ''}
                selected={selected ?? answers[step.id]}
                onSelect={commitAnswer}
              />
            )}

            {step.kind === 'interstitial' && step.variant === 'authority' && (
              <AuthorityStep title={step.title} subtitle={step.subtitle} onContinue={goNext} />
            )}

            {step.kind === 'interstitial' && step.variant === 'social' && (
              <SocialStep title={step.title} subtitle={step.subtitle} onContinue={goNext} />
            )}

            {step.kind === 'analysis' && (
              <AnalysisStep tick={analysisTick} reviewTick={reviewTick} />
            )}

            {step.kind === 'email' && (
              <EmailStep
                title={step.title}
                subtitle={step.subtitle}
                email={email}
                error={error}
                submitting={submitting}
                onChange={setEmail}
                onSubmit={handleEmailSubmit}
              />
            )}

            {step.kind === 'results' && <ResultsStep profile={profile} onContinue={goNext} />}

            {step.kind === 'graph' && (
              <GraphStep firstName={firstName} onContinue={goNext} />
            )}

            {step.kind === 'plan' && <PlanStep firstName={firstName} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

function ChoiceStep({
  title,
  subtitle,
  options,
  selected,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  options: QuizOption[];
  selected?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="quiz-choice">
      <h1 className="quiz-heading">{title}</h1>
      {subtitle && <p className="quiz-lede">{subtitle}</p>}
      <div className="quiz-options" role="listbox" aria-label={title}>
        {options.map((opt) => (
          <motion.button
            key={opt.value}
            type="button"
            role="option"
            aria-selected={selected === opt.value}
            className={`quiz-option ${selected === opt.value ? 'quiz-option--selected' : ''}`}
            onClick={() => onSelect(opt.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="quiz-option-icon" aria-hidden="true">{opt.icon}</span>
            <span className="quiz-option-label">{opt.label}</span>
            {opt.description && <span className="quiz-option-desc">{opt.description}</span>}
            <span className="quiz-option-radio" aria-hidden="true" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function LikertStep({
  title,
  statement,
  selected,
  onSelect,
}: {
  title: string;
  statement: string;
  selected?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="quiz-likert">
      <div className="quiz-likert-copy">
        <h1 className="quiz-heading quiz-heading--quote">“{statement}”</h1>
        <p className="quiz-lede">{title}</p>
      </div>
      <div className="quiz-likert-scale" role="radiogroup" aria-label={statement}>
        {LIKERT_OPTIONS.map((opt) => (
          <motion.button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected === opt.value}
            aria-label={opt.label}
            className={`quiz-likert-node ${selected === opt.value ? 'quiz-likert-node--selected' : ''}`}
            onClick={() => onSelect(opt.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
          >
            <LikertIcon name={opt.icon ?? 'unsure'} />
          </motion.button>
        ))}
      </div>
      <div className="quiz-likert-labels">
        <span>Strongly disagree</span>
        <span>Strongly agree</span>
      </div>
    </div>
  );
}

function AuthorityStep({
  title,
  subtitle,
  onContinue,
}: {
  title: string;
  subtitle?: string;
  onContinue: () => void;
}) {
  return (
    <div className="quiz-interstitial">
      <div className="quiz-stack" aria-hidden="true">
        {AUTHORITY_CARDS.map((card) => (
          <article key={card.title} className="quiz-stack-card">
            <span>{card.kicker}</span>
            <strong>{card.title}</strong>
          </article>
        ))}
      </div>
      <h1 className="quiz-heading quiz-heading--center">{title}</h1>
      {subtitle && <p className="quiz-lede quiz-lede--center">{subtitle}</p>}
      <motion.button type="button" className="quiz-continue" onClick={onContinue} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
        Continue
      </motion.button>
    </div>
  );
}

function SocialStep({
  title,
  subtitle,
  onContinue,
}: {
  title: string;
  subtitle?: string;
  onContinue: () => void;
}) {
  const review = ANALYSIS_REVIEWS[0];
  return (
    <div className="quiz-interstitial">
      <article className="quiz-review">
        <div className="quiz-stars" aria-label="5 stars">★★★★★</div>
        <h2>{review.title}</h2>
        <p>{review.body}</p>
        <span>{review.name}</span>
      </article>
      <h1 className="quiz-heading quiz-heading--center">{title}</h1>
      {subtitle && <p className="quiz-lede quiz-lede--center">{subtitle}</p>}
      <motion.button type="button" className="quiz-continue" onClick={onContinue} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
        Continue
      </motion.button>
    </div>
  );
}

function AnalysisStep({ tick, reviewTick }: { tick: number; reviewTick: number }) {
  const msg = ANALYSIS_MESSAGES[tick];
  const review = ANALYSIS_REVIEWS[reviewTick];
  return (
    <div className="quiz-analysis">
      <h1 className="quiz-heading quiz-heading--center">
        Creating your
        <em> 28-day reflection plan</em>
      </h1>
      <div className="quiz-analysis-bar">
        <span>{msg.label.replace('…', '')}</span>
        <strong>{msg.progress}%</strong>
      </div>
      <div className="quiz-analysis-meter" aria-hidden="true">
        <div style={{ width: `${msg.progress}%` }} />
      </div>
      <article className="quiz-review">
        <div className="quiz-stars" aria-label={`${review.stars} stars`}>
          {'★'.repeat(review.stars)}
        </div>
        <h2>{review.title}</h2>
        <p>{review.body}</p>
        <span>{review.name}</span>
      </article>
    </div>
  );
}

function EmailStep({
  title,
  subtitle,
  email,
  error,
  submitting,
  onChange,
  onSubmit,
}: {
  title: string;
  subtitle?: string;
  email: string;
  error: string;
  submitting: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form className="quiz-email" onSubmit={onSubmit}>
      <h1 className="quiz-heading quiz-heading--center">{title}</h1>
      {subtitle && <p className="quiz-lede quiz-lede--center">{subtitle}</p>}
      <input
        type="email"
        className="quiz-email-input"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="email"
        required
        aria-label="Email address"
        style={{ backgroundColor: '#ffffff', color: '#1c2430' }}
      />
      {error && <p className="quiz-error" role="alert">{error}</p>}
      <p className="quiz-privacy">
        We respect your privacy. Your data is processed according to our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>
      <motion.button type="submit" className="quiz-continue" disabled={submitting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
        {submitting ? 'Saving…' : 'Continue'}
      </motion.button>
    </form>
  );
}

function ResultsStep({
  profile,
  onContinue,
}: {
  profile: ReturnType<typeof buildQuizProfile>;
  onContinue: () => void;
}) {
  const gaugeLeft = { Low: 8, Normal: 34, Medium: 62, High: 88 }[profile.matchLevel];

  return (
    <div className="quiz-results">
      <article className="quiz-profile-card">
        <div className="quiz-profile-hero">
          <span className="quiz-match-pill">
            Pattern match <b>{profile.matchLevel}</b>
          </span>
          <h1>Summary of your Profile</h1>
          <div className="quiz-gauge" aria-label={`Match level ${profile.matchLevel}`}>
            <div className="quiz-gauge-track">
              <span className="quiz-gauge-marker" style={{ left: `${gaugeLeft}%` }}>
                Your level
              </span>
            </div>
            <div className="quiz-gauge-labels">
              <span>Low</span>
              <span>Normal</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>
        <p className="quiz-profile-insight">{profile.summary} {profile.insight}</p>
        <div className="quiz-tags">
          <div>
            <span>Main challenge</span>
            <strong>{profile.mainChallenge}</strong>
          </div>
          <div>
            <span>Self-perception</span>
            <strong>{profile.selfPerception}</strong>
          </div>
        </div>
      </article>
      <motion.button type="button" className="quiz-continue" onClick={onContinue} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
        Continue
      </motion.button>
    </div>
  );
}

function GraphStep({ firstName, onContinue }: { firstName: string; onContinue: () => void }) {
  const who = firstName || 'Your';
  return (
    <div className="quiz-graph">
      <p className="quiz-lede quiz-lede--center">Your execution capacity level</p>
      <GrowthChart />
      <h1 className="quiz-heading quiz-heading--center">
        {firstName ? `${who}, your personal` : 'Your personal'}
        <em> 28-Day Anti-Self-Sabotage Challenge</em> is ready!
      </h1>
      <p className="quiz-chart-note">Based on people who keep a short daily reflection habit. The curve is an illustration — results vary.</p>
      <motion.button type="button" className="quiz-continue" onClick={onContinue} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
        Continue
      </motion.button>
    </div>
  );
}

function PlanStep({ firstName }: { firstName: string }) {
  return (
    <div className="quiz-plan">
      <div className="quiz-compare">
        <article className="quiz-compare-card quiz-compare-card--now">
          <div className="quiz-compare-face" aria-hidden="true">
            <CloudMascotMark size={108} tint="#A9B7C8" mouth="neutral" />
          </div>
          <h2>Now</h2>
          <dl>
            <div><dt>Potential realization</dt><dd>Blocked</dd></div>
            <div>
              <dt>Idea execution</dt>
              <dd>Paralyzed</dd>
              <span className="quiz-meter quiz-meter--low" />
            </div>
            <div>
              <dt>Self-esteem level</dt>
              <dd>Low</dd>
              <span className="quiz-meter quiz-meter--low" />
            </div>
          </dl>
        </article>
        <article className="quiz-compare-card quiz-compare-card--goal">
          <div className="quiz-compare-face quiz-compare-face--glow" aria-hidden="true">
            <CloudMascotMark size={108} tint="#7EE0BE" />
          </div>
          <h2>Your Goal</h2>
          <dl>
            <div><dt>Potential realization</dt><dd>Unlocked</dd></div>
            <div>
              <dt>Idea execution</dt>
              <dd>Consistent</dd>
              <span className="quiz-meter quiz-meter--high" />
            </div>
            <div>
              <dt>Self-esteem level</dt>
              <dd>High</dd>
              <span className="quiz-meter quiz-meter--high" />
            </div>
          </dl>
        </article>
      </div>
      <h1 className="quiz-heading quiz-heading--center">
        {firstName ? `${firstName}, your` : 'Your'} 28-Day Anti-Self-Sabotage Challenge <em>is ready!</em>
      </h1>
      <motion.a className="quiz-continue" href={TESTFLIGHT_URL} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
        Join TestFlight Beta
      </motion.a>
      <p className="quiz-soon">Get early access · App Store launching soon</p>
    </div>
  );
}

function CountdownLabel() {
  const [seconds, setSeconds] = React.useState(10 * 60);
  React.useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <p className="quiz-reserve">
      Discount is reserved for: <strong>{mm}:{ss}</strong>
    </p>
  );
}

export default QuizFlow;
