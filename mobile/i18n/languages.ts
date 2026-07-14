import { AppLanguage, LanguageOption } from './types';

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', flag: '🇺🇸', nativeLabel: 'English', englishLabel: 'English' },
  { code: 'zh', flag: '🇨🇳', nativeLabel: '中文', englishLabel: 'Chinese' },
  { code: 'hi', flag: '🇮🇳', nativeLabel: 'हिन्दी', englishLabel: 'Hindi' },
  { code: 'es', flag: '🇪🇸', nativeLabel: 'Español', englishLabel: 'Spanish' },
  { code: 'fr', flag: '🇫🇷', nativeLabel: 'Français', englishLabel: 'French' },
  { code: 'de', flag: '🇩🇪', nativeLabel: 'Deutsch', englishLabel: 'German' },
  { code: 'ru', flag: '🇷🇺', nativeLabel: 'Русский', englishLabel: 'Russian' },
  { code: 'pt', flag: '🇧🇷', nativeLabel: 'Português', englishLabel: 'Portuguese' },
  { code: 'it', flag: '🇮🇹', nativeLabel: 'Italiano', englishLabel: 'Italian' },
  { code: 'ro', flag: '🇷🇴', nativeLabel: 'Română', englishLabel: 'Romanian' },
  { code: 'az', flag: '🇦🇿', nativeLabel: 'Azərbaycanca', englishLabel: 'Azerbaijani' },
  { code: 'nl', flag: '🇳🇱', nativeLabel: 'Nederlands', englishLabel: 'Dutch' },
];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export const LANGUAGE_LOCALES: Record<AppLanguage, string> = {
  en: 'en-US',
  es: 'es-ES',
  zh: 'zh-CN',
  hi: 'hi-IN',
  fr: 'fr-FR',
  de: 'de-DE',
  ru: 'ru-RU',
  pt: 'pt-BR',
  it: 'it-IT',
  ro: 'ro-RO',
  az: 'az-AZ',
  nl: 'nl-NL',
};

export const AI_LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese',
  hi: 'Hindi',
  fr: 'French',
  de: 'German',
  ru: 'Russian',
  pt: 'Portuguese',
  it: 'Italian',
  ro: 'Romanian',
  az: 'Azerbaijani',
  nl: 'Dutch',
};

export function getLanguageOption(code: AppLanguage): LanguageOption {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
