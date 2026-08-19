import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

/** Hide modal content until the presenting transition finishes (avoids orb/header flash). */
export function useScreenTransitionReady(fallbackMs = 420) {
  const navigation = useNavigation<any>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    const markReady = () => {
      if (done) return;
      done = true;
      setReady(true);
    };

    const unsub = navigation.addListener('transitionEnd', (event: { data?: { closing?: boolean } }) => {
      if (!event.data?.closing) markReady();
    });

    const fallback = setTimeout(markReady, fallbackMs);

    return () => {
      unsub();
      clearTimeout(fallback);
    };
  }, [navigation, fallbackMs]);

  return ready;
}
