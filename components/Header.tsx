'use client';

import { useEffect, useState } from 'react';
import type { Section } from '@/lib/types';
import { useApp } from './Providers';
import { Moon, Sun } from './Icons';

/** Tracks which section is currently in the reading area of the viewport. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');

  useEffect(() => {
    const els = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // First section (in page order) inside the band wins
        setActive(els.find((el) => visible.has(el.id))?.id ?? null);
      },
      // A band from 30% to 45% down the viewport
      { rootMargin: '-30% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);

  return active;
}

export default function Header({ name, sections }: { name: string; sections: Section[] }) {
  const { t, tr, lang, theme, toggleLang, toggleTheme } = useApp();
  const initial = name.trim().charAt(0) || '·';
  const links = [...sections.map((s) => ({ id: s.id, label: tr(s.title) })), { id: 'contact', label: t('contact_nav') }];
  const active = useActiveSection(links.map((l) => l.id));

  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#top" className="brand">
          <span className="brand-mark" aria-hidden="true">
            {initial}
          </span>
          <span className="brand-name">{name}</span>
        </a>
        <nav className="main-nav" aria-label={lang === 'ar' ? 'أقسام الصفحة' : 'Page sections'}>
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={active === l.id ? 'active' : undefined} aria-current={active === l.id ? 'location' : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="header-controls">
          <button type="button" className="icon-btn lang-btn" onClick={toggleLang} aria-label={t('toggle_lang')} title={t('toggle_lang')}>
            <span lang={lang === 'ar' ? 'en' : 'ar'}>{lang === 'ar' ? 'EN' : 'ع'}</span>
          </button>
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={t('toggle_theme')} title={t('toggle_theme')}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
}
