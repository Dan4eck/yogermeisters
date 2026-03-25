import { useEffect, useState } from 'react';

import { DEFAULT_LANGUAGE, type Language } from '@/lib/i18n';

export function useLanguage(): [Language, (language: Language) => void] {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('language') : null;

    if (stored === 'ru' || stored === 'en') {
      return stored;
    }

    return DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('language', language);
  }, [language]);

  return [language, setLanguage];
}

