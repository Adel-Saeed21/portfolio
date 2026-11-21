'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { ui, type UIKey } from '@/lib/i18n';
import type { Bi, Lang, Theme } from '@/lib/types';

type AppCtx = {
  lang: Lang;
  theme: Theme;
  toggleLang: () => void;
  /** Pass the click event to start the reveal from the button that was pressed. */
  toggleTheme: (e?: React.MouseEvent<HTMLElement>) => void;
  /** UI string */
  t: (key: UIKey) => string;
  /** Pick the current language from a bilingual value, falling back to the other */
  tr: (value?: Bi) => string;
};

const Ctx = createContext<AppCtx | null>(null);

/** View Transitions API (Chrome/Edge 111+, Safari 18+, Firefox 144+); typed loosely for older TS libs. */
type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    const apply = () => {
      el.lang = next;
      el.dir = next === 'ar' ? 'rtl' : 'ltr';
      // Remember the choice (read by middleware) and move to /en or /ar without a reload,
      // so unsaved edits survive a language switch.
      document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
      const { pathname, search, hash } = window.location;
      const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, '');
      window.history.replaceState(null, '', `/${next}${rest}${search}${hash}`);
      // Render the new language synchronously so the transition captures it.
      flushSync(() => setLang(next));
    };

    if (prefersReducedMotion()) return apply();

    const doc = document as ViewTransitionDoc;
    if (doc.startViewTransition) {
      // The new language wipes in along its reading direction (see globals.css).
      el.setAttribute('data-lang-switch', next === 'ar' ? 'to-rtl' : 'to-ltr');
      doc.startViewTransition(apply).finished.finally(() => el.removeAttribute('data-lang-switch'));
      return;
    }

    // Fallback for browsers without View Transitions: a quick soft fade.
    apply();
    document.body.animate(
      [
        { opacity: 0.35, filter: 'blur(4px)' },
        { opacity: 1, filter: 'blur(0)' },
      ],
      { duration: 380, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
    );
  }, [lang]);

  const toggleTheme = useCallback(
    (e?: React.MouseEvent<HTMLElement>) => {
      const next: Theme = theme === 'dark' ? 'light' : 'dark';
      const el = document.documentElement;
      const apply = () => {
        el.setAttribute('data-theme', next);
        persist('theme', next);
        flushSync(() => setTheme(next));
      };

      const doc = document as ViewTransitionDoc;
      if (!doc.startViewTransition || prefersReducedMotion()) return apply();

      // Circle grows from the centre of the button that was pressed (or the
      // top corner if called without a click) until it covers the screen.
      const rect = e?.currentTarget.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
      const y = rect ? rect.top + rect.height / 2 : 40;
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      el.setAttribute('data-theme-switch', '');
      const vt = doc.startViewTransition(apply);
      vt.ready
        .then(() => {
          el.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
            {
              duration: 650,
              easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        })
        .catch(() => {});
      vt.finished.finally(() => el.removeAttribute('data-theme-switch'));
    },
    [theme],
  );

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
