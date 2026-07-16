import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/** Apple Notes-style bottom inset — generous space below content, no auto-scroll hijacking. */
const WRITING_INSET = 220;
const FAB_INSET = 80;

export function useEditorKeyboardPadding() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollPaddingBottom = WRITING_INSET + FAB_INSET + (keyboardHeight > 0 ? keyboardHeight : 0);

  return { keyboardHeight, scrollPaddingBottom };
}
