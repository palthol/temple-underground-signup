import React, { createContext, useContext, useMemo, useState } from 'react';
import en from './locales/en.json';
import es from './locales/es.json';

export type Locale = 'en' | 'es';
type Catalog = Record<string, unknown>;

const catalogs: Record<Locale, Catalog> = { en, es };

type I18nCtx = {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (l: Locale) => void;
};

const I18nContext = createContext<I18nCtx | null>(null);

const getMessage = (catalog: Catalog, key: string): string | undefined => {
  const direct = (catalog as Record<string, unknown>)[key];
  if (typeof direct === 'string') return direct;

  const segments = key.split('.');
  let current: unknown = catalog;

  for (const segment of segments) {
    if (
      current &&
      typeof current === 'object' &&
      segment in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en');
  const t = useMemo(() => {
    const catalog = catalogs[locale] ?? catalogs.en;
    return (key: string) => getMessage(catalog, key) ?? key;
  }, [locale]);

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
