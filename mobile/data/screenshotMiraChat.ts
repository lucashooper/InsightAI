import { AppLanguage } from '../i18n/types';

export type ScreenshotChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

/**
 * App Store / marketing screenshot modes for Talk to Mira.
 *
 * In .env:
 *   EXPO_PUBLIC_MIRA_SCREENSHOT=messages  — preloads demo Q&A (default when set to 1)
 *   EXPO_PUBLIC_MIRA_SCREENSHOT=blank     — empty chat thread (header + message area + input)
 *
 * Restart Expo after changing. Remove the flag when done.
 */
export const SCREENSHOT_MIRA_CHAT: Record<AppLanguage, ScreenshotChatMessage[]> = {
  en: [
    {
      id: 'screenshot-user-1',
      role: 'user',
      content: 'What is my biggest weakness?',
    },
    {
      id: 'screenshot-assistant-1',
      role: 'assistant',
      content:
        "You've struggled with consistency in your sleep schedule and morning routine.",
    },
  ],
  es: [
    {
      id: 'screenshot-user-1',
      role: 'user',
      content: '¿Cuál es mi mayor debilidad?',
    },
    {
      id: 'screenshot-assistant-1',
      role: 'assistant',
      content:
        'Te cuesta ser constante con tu horario de sueño y tu rutina matutina — y eso está frenando todo lo demás en silencio.',
    },
  ],
  fr: [
    {
      id: 'screenshot-user-1',
      role: 'user',
      content: 'Quelle est ma plus grande faiblesse ?',
    },
    {
      id: 'screenshot-assistant-1',
      role: 'assistant',
      content:
        'Tu as du mal à rester régulier avec ton sommeil et ta routine du matin — et ça freine discrètement tout le reste.',
    },
  ],
  de: [
    {
      id: 'screenshot-user-1',
      role: 'user',
      content: 'Was ist meine größte Schwäche?',
    },
    {
      id: 'screenshot-assistant-1',
      role: 'assistant',
      content:
        'Dir fällt es schwer, bei Schlafenszeit und Morgenroutine konstant zu bleiben — und das bremst leise alles andere aus.',
    },
  ],
};

export type MiraScreenshotMode = 'off' | 'messages' | 'blank';

/**
 * HARD OFF for normal builds.
 * Expo caches EXPO_PUBLIC_* aggressively — env alone is unreliable.
 * Flip this to 'messages' | 'blank' only when capturing App Store screenshots,
 * then set back to 'off'.
 */
const MIRA_SCREENSHOT_MODE: MiraScreenshotMode = 'off';

export function getMiraScreenshotMode(): MiraScreenshotMode {
  // In-code flag wins — never trust a stale Metro-inlined env value for this
  if (MIRA_SCREENSHOT_MODE !== 'off') return MIRA_SCREENSHOT_MODE;

  const flag = (process.env.EXPO_PUBLIC_MIRA_SCREENSHOT || '').trim().toLowerCase();
  if (!flag || flag === '0' || flag === 'false' || flag === 'off' || flag === 'no') {
    return 'off';
  }
  // Even if env says messages/blank, ignore unless the in-code constant is enabled
  // (prevents the exact bug where blank was stuck after .env change)
  console.warn(
    '[Mira] EXPO_PUBLIC_MIRA_SCREENSHOT is set to',
    flag,
    'but MIRA_SCREENSHOT_MODE is off — ignoring env. Flip the constant in screenshotMiraChat.ts for screenshots.',
  );
  return 'off';
}

/** @deprecated Use getMiraScreenshotMode() */
export function isMiraScreenshotMode(): boolean {
  return getMiraScreenshotMode() !== 'off';
}
