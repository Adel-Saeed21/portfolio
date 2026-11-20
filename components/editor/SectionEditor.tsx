'use client';

import { useState } from 'react';
import { SECTION_TYPES, TYPE_FIELDS, type Entry, type Section, type SectionType } from '@/lib/types';
import type { UIKey } from '@/lib/i18n';
import { newEntry } from '@/lib/utils';
import { useApp } from '../Providers';
import { Down, Plus, Trash, Up } from '../Icons';
import Modal from './Modal';
import { BiField, BiListField, LinksField, TagsField, TextField } from './Fields';

export default function SectionEditor({
  initial,
  isNew,
  onSave,
  onClose,
}: {
  initial: Section;
  isNew: boolean;
  onSave: (s: Section) => void;
  onClose: () => void;
}) {
  const { t, tr } = useApp();
  const [s, setS] = useState<Section>(() => JSON.parse(JSON.stringify(initial)) as Section);
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const f = TYPE_FIELDS[s.type];

  const toggle = (id: string) =>
    setOpen((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const setItem = (i: number, patch: Partial<Entry>) => setS((p) => ({ ...p, items: p.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) }));

  const moveItem = (i: number, d: -1 | 1) =>
    setS((p) => {
      const j = i + d;
      if (j < 0 || j >= p.items.length) return p;
      const items = [...p.items];
      [items[i], items[j]] = [items[j], items[i]];
      return { ...p, items };
    });

  const removeItem = (i: number) => {
    if (!confirm(t('confirm_delete_item'))) return;
    setS((p) => ({ ...p, items: p.items.filter((_, k) => k !== i) }));
  };

  const addItem = () => {
    const e = newEntry();
    setS((p) => ({ ...p, items: [...p.items, e] }));
    setOpen((p) => new Set(p).add(e.id));
  };

  return (
    <Modal
      title={isNew ? t('add_section') : t('edit_section')}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="button" className="btn primary" onClick={() => onSave(s)}>
            {isNew ? t('add_section') : t('apply')}
          </button>
        </>
      }
    >
      <BiField label={t('section_title')} value={s.title} onChange={(title) => setS({ ...s, title })} />

      <fieldset className="field type-picker">
        <legend className="field-label">{t('section_type')}</legend>
        <div className="type-options">
          {SECTION_TYPES.map((ty) => (
            <label key={ty} className={`type-option${s.type === ty ? ' active' : ''}`}>
              <input type="radio" name="section-type" value={ty} checked={s.type === ty} onChange={() => setS({ ...s, type: ty as SectionType })} />
              {t(`type_${ty}` as UIKey)}
            </label>
          ))}
        </div>
        <p className="hint">{t(`type_${s.type}_hint` as UIKey)}</p>
      </fieldset>

      {s.type === 'text' ? (
        <BiField label={t('body')} multiline value={s.body} onChange={(body) => setS({ ...s, body })} />
      ) : (
        <div className="field">
          <span className="field-label">{t('items')}</span>
          {s.items.length === 0 && <p className="hint">{t('empty_items')}</p>}
          {s.items.map((it, i) => {
            const isOpen = open.has(it.id);
            return (
              <div key={it.id} className={`item-box${isOpen ? ' open' : ''}`}>
                <div className="item-head">
                  <button type="button" className="item-toggle" aria-expanded={isOpen} onClick={() => toggle(it.id)}>
                    <span className="caret" aria-hidden="true">
                      ▸
                    </span>
                    {tr(it.title) || t('untitled')}
                  </button>
                  <div className="item-actions">
                    <button type="button" className="tool-btn icon-only" disabled={i === 0} onClick={() => moveItem(i, -1)} aria-label={t('move_up')} title={t('move_up')}>
                      <Up size={15} />
                    </button>
                    <button type="button" className="tool-btn icon-only" disabled={i === s.items.length - 1} onClick={() => moveItem(i, 1)} aria-label={t('move_down')} title={t('move_down')}>
                      <Down size={15} />
                    </button>
                    <button type="button" className="tool-btn icon-only danger" onClick={() => removeItem(i)} aria-label={t('delete')} title={t('delete')}>
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div className="item-body">
                    <BiField label={s.type === 'chips' ? t('group_label') : t('item_title')} value={it.title} onChange={(title) => setItem(i, { title })} />
                    {f.subtitle && <BiField label={t('item_subtitle')} value={it.subtitle} onChange={(subtitle) => setItem(i, { subtitle })} />}
                    {f.period && <BiField label={t('item_period')} value={it.period} onChange={(period) => setItem(i, { period })} />}
                    {f.description && <BiField label={t('item_description')} multiline value={it.description} onChange={(description) => setItem(i, { description })} />}
                    {f.points && <BiListField label={t('points')} addLabel={t('add_point')} items={it.points} onChange={(points) => setItem(i, { points })} />}
                    {f.tags && <TagsField label={t('tags')} hint={t('tags_hint')} tags={it.tags} onChange={(tags) => setItem(i, { tags })} />}
                    {f.links && <LinksField links={it.links} onChange={(links) => setItem(i, { links })} />}
                    {f.image && <TextField label={t('item_image')} hint={t('item_image_hint')} value={it.image ?? ''} onChange={(image) => setItem(i, { image })} />}
                  </div>
                )}
              </div>
            );
          })}
          <button type="button" className="tool-btn add-btn" onClick={addItem}>
            <Plus size={15} /> {t('add_item')}
          </button>
        </div>
      )}
    </Modal>
  );
}
