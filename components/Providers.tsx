'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ui, type UIKey } from '@/lib/i18n';
import type { Bi, Lang, Theme } from '@/lib/types';

type AppCtx = {
  lang: Lang;
  theme: Theme;
  toggleLang: () => void;
  toggleTheme: () => void;
  /** UI string */
  t: (key: UIKey) => string;
  /** Pick the current language from a bilingual value, falling back to the other */
  tr: (value?: Bi) => string;
};

const Ctx = createContext<AppCtx | null>(null);

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

export function Providers({ children, initialLang }: { children: React.ReactNode; initialLang: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [theme, setTheme] = useState<Theme>('light');

  // Pick up the theme the boot script applied, then reveal the page.
  useEffect(() => {
    const el = document.documentElement;
    setTheme(el.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    requestAnimationFrame(() => el.removeAttribute('data-preload'));
  }, []);

  const toggleLang = useCallback(() => {
    const next: Lang = lang === 'ar' ? 'en' : 'ar';
    const el = document.documentElement;
    el.lang = next;
    el.dir = next === 'ar' ? 'rtl' : 'ltr';
    // Remember the choice (read by middleware) and move to /en or /ar without a reload,
    // so unsaved edits survive a language switch.
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    const { pathname, search, hash } = window.location;
    const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, '');
    window.history.replaceState(null, '', `/${next}${rest}${search}${hash}`);
    setLang(next);
  }, [lang]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    persist('theme', next);
    setTheme(next);
  }, [theme]);

  const value = useMemo<AppCtx>(
    () => ({
      lang,
      theme,
      toggleLang,
      toggleTheme,
      t: (key) => ui[lang][key],
      tr: (v) => {
        if (!v) return '';
        const other: Lang = lang === 'ar' ? 'en' : 'ar';
        return v[lang]?.trim() ? v[lang] : v[other] ?? '';
      },
    }),
    [lang, theme, toggleLang, toggleTheme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp must be used inside <Providers>');
  return c;
}
