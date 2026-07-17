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

export function getMiraScreenshotMode(): MiraScreenshotMode {
  const flag = (process.env.EXPO_PUBLIC_MIRA_SCREENSHOT || '').trim().toLowerCase();
  if (flag === '1' || flag === 'true' || flag === 'messages') return 'messages';
  if (flag === 'blank' || flag === 'empty') return 'blank';
  return 'off';
}

/** @deprecated Use getMiraScreenshotMode() */
export function isMiraScreenshotMode(): boolean {
  return getMiraScreenshotMode() !== 'off';
}
