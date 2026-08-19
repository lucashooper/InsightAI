import { useEffect } from 'react';
import { useOrbPoolControl } from '../companion/OrbOverlayProvider';
import { ONBOARDING_ORB_WARMUP_IDS } from '../../hooks/useOrbPoolWarmup';

/** Mounts onboarding orb WebViews only while the user is in the onboarding flow. */
export default function OnboardingOrbWarmup() {
  const { requestWarmup, releaseWarmup } = useOrbPoolControl();

  useEffect(() => {
    requestWarmup(ONBOARDING_ORB_WARMUP_IDS);
    return () => releaseWarmup(ONBOARDING_ORB_WARMUP_IDS);
  }, [requestWarmup, releaseWarmup]);

  return null;
}
