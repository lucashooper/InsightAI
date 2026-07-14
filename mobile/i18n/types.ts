export type AppLanguage =
  | 'en'
  | 'es'
  | 'zh'
  | 'hi'
  | 'fr'
  | 'de'
  | 'ru'
  | 'pt'
  | 'it'
  | 'ro'
  | 'az'
  | 'nl';

export type LanguageOption = {
  code: AppLanguage;
  flag: string;
  nativeLabel: string;
  englishLabel: string;
};

export type TranslationTree = {
  [key: string]: string | TranslationTree;
};
