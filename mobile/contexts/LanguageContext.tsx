import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLanguage } from '../i18n/types';
import { DEFAULT_LANGUAGE, getLanguageOption, LANGUAGES, LANGUAGE_LOCALES } from '../i18n/languages';
import { translate, getAiLanguageInstruction, getChatLanguageInstruction } from '../i18n';
import { setCurrentLanguage } from '../i18n/languageRef';
import { supabase } from '../lib/supabase';
import { clearDashboardCache } from '../utils/dashboardCache';

const LANGUAGE_STORAGE_KEY = 'APP_LANGUAGE';

type LanguageContextType = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  languageOption: ReturnType<typeof getLanguageOption>;
  locale: string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  aiLanguageInstruction: string;
  chatLanguageInstruction: string;
  ready: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadPersistedLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        let resolved = stored;

        // A signed-in user's profile metadata is a cross-device fallback. Local
        // storage remains the fastest source and supports pre-auth onboarding.
        if (!resolved) {
          const { data } = await supabase.auth.getSession();
          resolved = data.session?.user?.user_metadata?.language ?? null;
        }

        if (resolved && LANGUAGES.some((option) => option.code === resolved)) {
          setLanguageState(resolved as AppLanguage);
          setCurrentLanguage(resolved as AppLanguage);
        }
      } catch (error) {
        console.warn('[Language] Failed to load persisted language:', error);
      } finally {
        setReady(true);
      }
    };

    loadPersistedLanguage();
  }, []);

  const setLanguage = useCallback(async (next: AppLanguage) => {
    setLanguageState(next);
    setCurrentLanguage(next);
    clearDashboardCache();
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);

    // Monthly stories are generated prose, so an old-language cached story
    // must never survive a locale switch.
    AsyncStorage.getAllKeys()
      .then((keys) => keys.filter((key) => key.startsWith('monthly_story_')))
      .then((keys) => (keys.length ? AsyncStorage.multiRemove(keys) : undefined))
      .catch((error) => console.warn('[Language] Failed to clear localized caches:', error));

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session?.user) {
          return supabase.auth.updateUser({ data: { language: next } });
        }
      })
      .catch((error) => console.warn('[Language] Failed to sync language metadata:', error));
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language],
  );

  const formatDate = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      new Date(date).toLocaleDateString(LANGUAGE_LOCALES[language], options),
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languageOption: getLanguageOption(language),
      locale: LANGUAGE_LOCALES[language],
      formatDate,
      aiLanguageInstruction: getAiLanguageInstruction(language),
      chatLanguageInstruction: getChatLanguageInstruction(language),
      ready,
    }),
    [language, setLanguage, t, formatDate, ready],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
