'use client';

import { useEffect, useState } from 'react';
import type { Bi, LinkItem } from '@/lib/types';
import { emptyBi } from '@/lib/utils';
import { useApp } from '../Providers';
import { Plus, Trash } from '../Icons';

function Txt({
  multiline,
  value,
  onChange,
  dir,
  lang,
  placeholder,
  ariaLabel,
}: {
  multiline?: boolean;
  value: string;
  onChange: (v: string) => void;
  dir: 'rtl' | 'ltr';
  lang?: string;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return multiline ? (
    <textarea dir={dir} lang={lang} rows={4} value={value} placeholder={placeholder} aria-label={ariaLabel} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <input dir={dir} lang={lang} value={value} placeholder={placeholder} aria-label={ariaLabel} onChange={(e) => onChange(e.target.value)} />
  );
}

/** Two inputs: Arabic + English */
export function BiInputs({ value, onChange, multiline, label }: { value?: Bi; onChange: (v: Bi) => void; multiline?: boolean; label: string }) {
  const v = value ?? emptyBi();
  return (
    <div className="bi-row">
      <div className="bi-cell">
        <span className="lang-tag" lang="ar">ع</span>
        <Txt multiline={multiline} dir="rtl" lang="ar" value={v.ar} ariaLabel={`${label} (العربية)`} onChange={(ar) => onChange({ ...v, ar })} />
      </div>
      <div className="bi-cell">
        <span className="lang-tag" lang="en">EN</span>
        <Txt multiline={multiline} dir="ltr" lang="en" value={v.en} ariaLabel={`${label} (English)`} onChange={(en) => onChange({ ...v, en })} />
      </div>
    </div>
  );
}

export function BiField({ label, value, onChange, multiline }: { label: string; value?: Bi; onChange: (v: Bi) => void; multiline?: boolean }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <BiInputs label={label} value={value} onChange={onChange} multiline={multiline} />
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input dir="ltr" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

export function BiListField({ label, items, onChange, addLabel }: { label: string; items?: Bi[]; onChange: (v: Bi[]) => void; addLabel: string }) {
  const { t } = useApp();
  const list = items ?? [];
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      {list.map((b, i) => (
        <div key={i} className="repeat-row">
          <BiInputs label={`${label} ${i + 1}`} value={b} onChange={(nb) => onChange(list.map((x, k) => (k === i ? nb : x)))} />
          <button type="button" className="tool-btn icon-only danger" aria-label={t('remove')} title={t('remove')} onClick={() => onChange(list.filter((_, k) => k !== i))}>
            <Trash size={15} />
          </button>
        </div>
      ))}
      <button type="button" className="tool-btn add-btn" onClick={() => onChange([...list, emptyBi()])}>
        <Plus size={15} /> {addLabel}
      </button>
    </div>
  );
}

export function TagsField({ label, hint, tags, onChange }: { label: string; hint: string; tags?: string[]; onChange: (v: string[]) => void }) {
  const joined = (tags ?? []).join(', ');
  const [text, setText] = useState(joined);
  useEffect(() => setText(joined), [joined]);
  const commit = () =>
    onChange(
      text
        .split(/[,،]/)
        .map((s) => s.trim())
        .filter(Boolean),
    );
  return (
    <label className="field">
      <span className="field-label">
        {label} <small>— {hint}</small>
      </span>
      <input dir="ltr" value={text} onChange={(e) => setText(e.target.value)} onBlur={commit} />
    </label>
  );
}

export function LinksField({ links, onChange }: { links?: LinkItem[]; onChange: (v: LinkItem[]) => void }) {
  const { t } = useApp();
  const list = links ?? [];
  const set = (i: number, patch: Partial<LinkItem>) => onChange(list.map((l, k) => (k === i ? { ...l, ...patch } : l)));
  return (
    <div className="field">
      <span className="field-label">{t('links')}</span>
      {list.map((l, i) => (
        <div key={i} className="repeat-row link-row">
          <div className="link-fields">
            <BiInputs label={t('link_label')} value={l.label} onChange={(label) => set(i, { label })} />
            <input dir="ltr" type="url" placeholder="https://" aria-label={t('url')} value={l.url} onChange={(e) => set(i, { url: e.target.value })} />
          </div>
          <button type="button" className="tool-btn icon-only danger" aria-label={t('remove')} title={t('remove')} onClick={() => onChange(list.filter((_, k) => k !== i))}>
            <Trash size={15} />
          </button>
        </div>
      ))}
      <button type="button" className="tool-btn add-btn" onClick={() => onChange([...list, { label: emptyBi(), url: '' }])}>
        <Plus size={15} /> {t('add_link')}
      </button>
    </div>
  );
}
