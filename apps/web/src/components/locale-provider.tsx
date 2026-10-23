'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { createTranslator, getDictionary, type Locale, type Translator } from '@goldlens/i18n';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dict: ReturnType<typeof getDictionary>;
  t: Translator;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    dict: getDictionary(locale),
    t: createTranslator(locale),
    setLocale: (next: Locale) => {
      document.cookie = `gl_locale=${next};path=/;max-age=31536000;samesite=lax`;
      setLocaleState(next);
      window.location.reload();
    }
  }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useI18n must be used inside LocaleProvider');
  return context;
}
