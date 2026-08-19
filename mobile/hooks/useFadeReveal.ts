import { useCallback, useRef, useState } from 'react';

/** Tracks which assistant message is playing the streaming reveal. */
export function useFadeReveal() {
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const pendingCompleteRef = useRef<(() => void) | null>(null);

  const clearReveal = useCallback(() => {
    setRevealingId(null);
    pendingCompleteRef.current = null;
  }, []);

  const startReveal = useCallback(
    (messageId: string, _fullText: string, onComplete?: () => void) => {
      pendingCompleteRef.current = onComplete ?? null;
      setRevealingId(messageId);
    },
    [],
  );

  const finishReveal = useCallback(() => {
    const done = pendingCompleteRef.current;
    pendingCompleteRef.current = null;
    setRevealingId(null);
    done?.();
  }, []);

  return { revealingId, startReveal, finishReveal, clearReveal, isRevealing: revealingId !== null };
};
