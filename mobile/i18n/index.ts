import { AppLanguage, TranslationTree } from './types';
import en from './translations/en';
import es from './translations/es';
import { AI_LANGUAGE_NAMES, LANGUAGES } from './languages';
import { mergeTranslationTrees } from './merge';
import { coreTranslations } from './features/core';
import { auxiliaryTranslations } from './features/auxiliary';
import { componentTranslations } from './features/components';
import { promptTranslations } from './features/prompts';
import { emotionTranslations } from './features/emotions';
import { baseFeatureTranslations } from './features/base';
import { onboardingTranslations } from './features/onboarding';

const baseTranslations: Partial<Record<AppLanguage, TranslationTree>> = { en, es };

const TRANSLATIONS = Object.fromEntries(
  LANGUAGES.map(({ code }) => [
    code,
    mergeTranslationTrees(
      baseTranslations[code],
      baseFeatureTranslations[code],
      onboardingTranslations[code],
      coreTranslations[code],
      auxiliaryTranslations[code],
      componentTranslations[code],
      promptTranslations[code],
      emotionTranslations[code],
    ),
  ]),
) as Record<AppLanguage, TranslationTree>;

function getNested(tree: TranslationTree, path: string): string | undefined {
  const parts = path.split('.');
  let cur: string | TranslationTree = tree;
  for (const part of parts) {
    if (typeof cur !== 'object' || cur == null || !(part in cur)) return undefined;
    cur = cur[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function translate(
  language: AppLanguage,
  key: string,
  params?: Record<string, string | number>,
): string {
  const primary = TRANSLATIONS[language];
  const fallback = TRANSLATIONS.en!;
  let value = (primary && getNested(primary, key)) ?? getNested(fallback, key) ?? key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    });
  }
  return value;
}

export function getAiLanguageInstruction(language: AppLanguage): string {
  if (language === 'en') return '';
  const name = AI_LANGUAGE_NAMES[language] ?? 'English';
  return `\n10. **LANGUAGE**: Write all narrative, summaries, suggestions, explanations, protocol copy, and other user-facing prose in ${name}. Keep JSON keys and machine-readable categorical values in canonical English (including mood_analysis.primary_emotion, mood_trend, emotional_impact, category, thought pattern type/frequency, difficulty, insight card type/short_label, and sentiment) so analytics remain stable.`;
}

export function getChatLanguageInstruction(language: AppLanguage): string {
  if (language === 'en') return '';
  const name = AI_LANGUAGE_NAMES[language] ?? 'English';
  return `Always respond in ${name}.`;
}

export { en, es };
