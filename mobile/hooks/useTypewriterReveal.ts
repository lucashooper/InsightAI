import { useCallback, useEffect, useRef, useState } from 'react';

const TICK_MS = 10;
const CHARS_PER_TICK = 3;

export function useTypewriterReveal() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [displayText, setDisplayText] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearReveal = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveId(null);
    setDisplayText('');
  }, []);

  useEffect(() => () => clearReveal(), [clearReveal]);

  const startReveal = useCallback(
    (messageId: string, fullText: string, onComplete?: () => void) => {
      clearReveal();
      setActiveId(messageId);
      setDisplayText('');
      let index = 0;

      intervalRef.current = setInterval(() => {
        index = Math.min(fullText.length, index + CHARS_PER_TICK);
        setDisplayText(fullText.slice(0, index));
        if (index >= fullText.length) {
          clearReveal();
          onComplete?.();
        }
      }, TICK_MS);
    },
    [clearReveal],
  );

  const isRevealing = activeId !== null;

  return { activeId, displayText, isRevealing, startReveal, clearReveal };
}
