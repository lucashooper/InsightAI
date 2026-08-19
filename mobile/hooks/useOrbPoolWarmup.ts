import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useOrbPoolControl } from '../components/companion/OrbOverlayProvider';

/** Pool entries used on onboarding orb screens (InsightIntro, QuizIntro, Mira chat). */
export const ONBOARDING_ORB_WARMUP_IDS = [
  '220-default',
  '110-default',
  '40-balanced',
] as const;

/** Pool entries worth preloading when AI Chat is open. */
export const AI_CHAT_ORB_WARMUP_IDS = ['130-default', '36-default'] as const;

/** Keep specific pool WebViews mounted while this screen is focused. */
export function useOrbPoolWarmup(poolIds: readonly string[]) {
  const { requestWarmup, releaseWarmup } = useOrbPoolControl();

  useFocusEffect(
    useCallback(() => {
      requestWarmup(poolIds);
      return () => releaseWarmup(poolIds);
    }, [poolIds, requestWarmup, releaseWarmup]),
  );
}
