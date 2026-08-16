import { useEffect, useRef, useState } from 'react';

/** One-shot typewriter placeholder — runs once when active becomes true. */
export function useAnimatedPlaceholder(fullText: string, active: boolean) {
  const [display, setDisplay] = useState('');
  const playedRef = useRef(false);

  useEffect(() => {
    if (!active || playedRef.current || !fullText) {
      if (!active) setDisplay('');
      return;
    }
    playedRef.current = true;
    let index = 0;
    setDisplay('');

    const id = setInterval(() => {
      index = Math.min(fullText.length, index + 1);
      setDisplay(fullText.slice(0, index));
      if (index >= fullText.length) clearInterval(id);
    }, 35);

    return () => clearInterval(id);
  }, [active, fullText]);

  return display;
}
