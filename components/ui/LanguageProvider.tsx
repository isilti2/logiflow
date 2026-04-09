'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Lang, type TranslationKey } from '@/lib/i18n';
import { locales, type Locale } from '@/i18n/routing';

interface LangContextValue {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key as string,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>('en');

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
    const saved = match?.[1] as Locale | undefined;
    if (saved && (locales as readonly string[]).includes(saved)) {
      setLangState(saved);
    }
  }, []);

  function setLang(l: Locale) {
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setLangState(l);
    window.location.reload();
  }

  function t(key: TranslationKey): string {
    // Fall back to 'en' or 'tr' for legacy translations if 'de' isn't available
    const legacyLang: Lang = lang === 'de' ? 'en' : (lang as Lang);
    return (translations[legacyLang]?.[key] ?? key) as string;
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LangContext);
}
