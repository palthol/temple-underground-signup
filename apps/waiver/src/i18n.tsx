import React, { createContext, useContext, useMemo, useState } from 'react';
import en from './locales/en.json';
import es from './locales/es.json';

type Locale = 'en' | 'es';
type Catalog = Record<string, string>;

const catalogs: Record<Locale, Catalog> = { en, es } as const;

type I18nCtx = {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (l: Locale) => void;
};

const I18nContext = createContext<I18nCtx | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en');
  const t = useMemo(() => (key: string) => catalogs[locale][key] ?? key, [locale]);

  // Update document language
  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};

