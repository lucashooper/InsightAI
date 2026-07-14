import { AppLanguage } from './types';
import { DEFAULT_LANGUAGE, LANGUAGE_LOCALES } from './languages';

let currentLanguage: AppLanguage = DEFAULT_LANGUAGE;

export function setCurrentLanguage(language: AppLanguage) {
  currentLanguage = language;
}

export function getCurrentLanguage(): AppLanguage {
  return currentLanguage;
}

export function getCurrentLocale(): string {
  return LANGUAGE_LOCALES[currentLanguage];
}
