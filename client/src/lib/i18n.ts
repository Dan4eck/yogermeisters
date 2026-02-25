export type Language = 'en' | 'ru';

export const DEFAULT_LANGUAGE: Language = 'en';

export const languageToggleLabel: Record<Language, string> = {
  en: 'RU',
  ru: 'EN',
};

export { siteCopy } from './site-copy';
export { localizeRetreat } from './retreat-localization';
