'use client';

import { useState } from 'react';
import { useApp } from '../Providers';
import { Moon, Sun } from '../Icons';

/** Full-page password screen shown at /admin until the visitor logs in. */
export default function AdminLogin() {
  const { t, lang, theme, toggleLang, toggleTheme } = useApp();
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<null | 'wrong_password' | 'too_many_attempts' | 'login_failed'>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) {
        // The session cookie is set; reload so the server renders the editor.
        window.location.reload();
        return;
      }
      setError(r.status === 429 ? 'too_many_attempts' : 'wrong_password');
    } catch {
      setError('login_failed');
    }
    setBusy(false);
  };

  return (
    <main className="admin-login">
      <div className="admin-login-tools">
        <button type="button" className="icon-btn lang-btn" onClick={toggleLang} aria-label={t('toggle_lang')} title={t('toggle_lang')}>
          <span lang={lang === 'ar' ? 'en' : 'ar'}>{lang === 'ar' ? 'EN' : 'ع'}</span>
        </button>
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={t('toggle_theme')} title={t('toggle_theme')}>
          <span key={theme} className="theme-icon">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </span>
        </button>
      </div>

      <form className="admin-card" onSubmit={submit}>
        <span className="brand-mark admin-mark" aria-hidden="true">
          A
        </span>
        <h1>{t('login_title')}</h1>
        <p className="admin-sub">{t('login_text')}</p>

        <label className="field">
          <span className="field-label">{t('password')}</span>
          <div className="pw-row">
            <input
              dir="ltr"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              aria-invalid={!!error}
            />
            <button type="button" className="tool-btn pw-toggle" onClick={() => setShow((s) => !s)}>
              {show ? t('hide') : t('show')}
            </button>
          </div>
        </label>

        {error && (
          <p className="form-error" role="alert">
            {t(error)}
          </p>
        )}

        <button type="submit" className="btn primary admin-submit" disabled={busy || !pw.trim()}>
          {busy ? t('signing_in') : t('enter')}
        </button>
        <a className="admin-back" href={`/${lang}`}>
          ← {t('back_to_site')}
        </a>
      </form>
    </main>
  );
}
