import { AppLanguage } from './types';
import { LANGUAGES } from './languages';

const LOCALE_CODES = new Set(LANGUAGES.map((l) => l.code));

export function withContentLocale(source: string, locale: AppLanguage): string {
  return `${source}_${locale}`;
}

export function parseContentLocale(source?: string | null): AppLanguage | null {
  if (!source) return null;
  const suffix = source.split('_').pop();
  if (!suffix || !LOCALE_CODES.has(suffix as AppLanguage)) return null;
  return suffix as AppLanguage;
}

/** Prefer items tagged for the active locale; fall back to legacy untagged content. */
export function filterByContentLocale<T extends { source?: string | null }>(
  items: T[],
  locale: AppLanguage,
): T[] {
  const localeMatched = items.filter((item) => parseContentLocale(item.source) === locale);
  return localeMatched.length > 0 ? localeMatched : items;
}
