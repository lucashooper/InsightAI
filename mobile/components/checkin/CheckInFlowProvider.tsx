import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { CheckInDraft, CheckInStep, EMPTY_CHECK_IN, scoreToStop } from './types';

type CheckInFlowContextType = {
  step: CheckInStep;
  draft: CheckInDraft;
  setMoodScore: (score: number) => void;
  toggleFeeling: (feeling: string) => void;
  addCustomFeeling: (feeling: string) => void;
  toggleContextTag: (group: 'withWho' | 'whereAt' | 'doing', tag: string, multi?: boolean) => void;
  goToStep: (step: CheckInStep) => void;
  goBack: () => void;
  reset: () => void;
};

const STEP_ORDER: CheckInStep[] = ['mood', 'feelings', 'context', 'journal'];

const CheckInFlowContext = createContext<CheckInFlowContextType | undefined>(undefined);

export function CheckInFlowProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<CheckInStep>('mood');
  const [draft, setDraft] = useState<CheckInDraft>(EMPTY_CHECK_IN);

  const setMoodScore = useCallback((score: number) => {
    const stop = scoreToStop(score);
    setDraft((prev) => ({
      ...prev,
      moodScore: stop.score,
      moodLabel: stop.label,
      moodTier: stop.tier,
    }));
  }, []);

  const toggleFeeling = useCallback((feeling: string) => {
    setDraft((prev) => {
      const exists = prev.feelings.includes(feeling);
      return {
        ...prev,
        feelings: exists
          ? prev.feelings.filter((f) => f !== feeling)
          : [...prev.feelings, feeling],
      };
    });
  }, []);

  const addCustomFeeling = useCallback((feeling: string) => {
    const trimmed = feeling.trim();
    if (!trimmed) return;
    setDraft((prev) => {
      if (prev.feelings.includes(trimmed)) return prev;
      return { ...prev, feelings: [...prev.feelings, trimmed] };
    });
  }, []);

  const toggleContextTag = useCallback(
    (group: 'withWho' | 'whereAt' | 'doing', tag: string, multi = true) => {
      setDraft((prev) => {
        const current = prev[group];
        const exists = current.includes(tag);
        let next: string[];
        if (exists) {
          next = current.filter((t) => t !== tag);
        } else if (multi) {
          next = [...current, tag];
        } else {
          next = [tag];
        }
        return { ...prev, [group]: next };
      });
    },
    [],
  );

  const goToStep = useCallback((next: CheckInStep) => setStep(next), []);

  const goBack = useCallback(() => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  }, [step]);

  const reset = useCallback(() => {
    setStep('mood');
    setDraft(EMPTY_CHECK_IN);
  }, []);

  const value = useMemo(
    () => ({
      step,
      draft,
      setMoodScore,
      toggleFeeling,
      addCustomFeeling,
      toggleContextTag,
      goToStep,
      goBack,
      reset,
    }),
    [step, draft, setMoodScore, toggleFeeling, addCustomFeeling, toggleContextTag, goToStep, goBack, reset],
  );

  return <CheckInFlowContext.Provider value={value}>{children}</CheckInFlowContext.Provider>;
}

export function useCheckInFlow() {
  const ctx = useContext(CheckInFlowContext);
  if (!ctx) throw new Error('useCheckInFlow must be used within CheckInFlowProvider');
  return ctx;
}
