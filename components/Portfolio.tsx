'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Content, Profile, Section } from '@/lib/types';
import { isContent, newSection } from '@/lib/utils';
import { useApp } from './Providers';
import Header from './Header';
import Hero from './Hero';
import SectionView from './SectionView';
import Footer from './Footer';
import Contact from './Contact';
import Intro from './Intro';
import EditBar from './editor/EditBar';
import ProfileEditor from './editor/ProfileEditor';
import SectionEditor from './editor/SectionEditor';

type Editing = { kind: 'section'; section: Section; isNew: boolean } | { kind: 'profile' } | null;

/** `admin` is true only on /admin after logging in (checked on the server). */
export default function Portfolio({ initial, admin = false }: { initial: Content; admin?: boolean }) {
  const { t, tr, lang } = useApp();
  const [content, setContent] = useState<Content>(initial);
  const editMode = admin;
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Editing>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const leaving = useRef(false);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      if (leaving.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const mutate = useCallback((fn: (c: Content) => Content) => {
    setContent(fn);
    setDirty(true);
  }, []);

  const setSections = (fn: (s: Section[]) => Section[]) => mutate((c) => ({ ...c, sections: fn(c.sections) }));

  const move = (id: string, d: -1 | 1) =>
    setSections((s) => {
      const i = s.findIndex((x) => x.id === id);
      const j = i + d;
      if (i < 0 || j < 0 || j >= s.length) return s;
      const n = [...s];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const upsertSection = (sec: Section) =>
    setSections((s) => (s.some((x) => x.id === sec.id) ? s.map((x) => (x.id === sec.id ? sec : x)) : [...s, sec]));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (r.status === 401) {
        setToast(t('session_expired'));
        return;
      }
      if (!r.ok) throw new Error(String(r.status));
      setDirty(false);
      setToast(t('saved'));
    } catch {
      setToast(t('save_failed'));
    } finally {
      setSaving(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'content.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isContent(parsed)) throw new Error('invalid');
      setContent(parsed);
      setDirty(true);
      setToast(t('imported'));
    } catch {
      setToast(t('import_failed'));
    }
  };

  /** Log out and go back to the public site. */
  const exitEdit = async () => {
    if (dirty && !confirm(t('unsaved_exit'))) return;
    leaving.current = true;
    await fetch('/api/auth', { method: 'DELETE' }).catch(() => {});
    window.location.assign(`/${lang}`);
  };

  const shown = content.sections.filter((s) => editMode || s.visible);
  const navSections = content.sections.filter((s) => s.visible);
  const name = tr(content.profile.name);

  return (
    <>
      {!admin && <Intro name={name} role={tr(content.profile.role)} />}
      <a href="#main" className="skip-link">
        {t('skip')}
      </a>
      <Header name={name} sections={navSections} />

      <main id="main" className={editMode ? 'with-edit-bar' : undefined}>
        <Hero profile={content.profile} editMode={editMode} onEdit={() => setEditing({ kind: 'profile' })} />

        {shown.map((sec, idx) => (
          <SectionView
            key={sec.id}
            section={sec}
            index={idx}
            editMode={editMode}
            controls={{
              onEdit: () => setEditing({ kind: 'section', section: sec, isNew: false }),
              onUp: () => move(sec.id, -1),
              onDown: () => move(sec.id, 1),
              onToggle: () => setSections((s) => s.map((x) => (x.id === sec.id ? { ...x, visible: !x.visible } : x))),
              onDelete: () => confirm(t('confirm_delete')) && setSections((s) => s.filter((x) => x.id !== sec.id)),
              isFirst: idx === 0,
              isLast: idx === shown.length - 1,
            }}
          />
        ))}

        <Contact profile={content.profile} />
      </main>

      <Footer name={name} />

      {editMode && (
        <EditBar
          dirty={dirty}
          saving={saving}
          onAdd={() => setEditing({ kind: 'section', section: newSection(), isNew: true })}
          onProfile={() => setEditing({ kind: 'profile' })}
          onSave={save}
          onExport={exportJson}
          onImport={() => fileRef.current?.click()}
          onExit={exitEdit}
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importJson(f);
          e.target.value = '';
        }}
      />

      {editing?.kind === 'section' && (
        <SectionEditor
          initial={editing.section}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={(sec) => {
            upsertSection(sec);
            setEditing(null);
          }}
        />
      )}

      {editing?.kind === 'profile' && (
        <ProfileEditor
          initial={content.profile}
          onClose={() => setEditing(null)}
          onSave={(p: Profile) => {
            mutate((c) => ({ ...c, profile: p }));
            setEditing(null);
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
