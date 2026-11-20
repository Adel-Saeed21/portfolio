'use client';

import { useState } from 'react';
import type { Profile } from '@/lib/types';
import { useApp } from '../Providers';
import Modal from './Modal';
import { BiField, TextField } from './Fields';

export default function ProfileEditor({ initial, onSave, onClose }: { initial: Profile; onSave: (p: Profile) => void; onClose: () => void }) {
  const { t } = useApp();
  const [p, setP] = useState<Profile>(() => ({ ...initial }));
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((prev) => ({ ...prev, [k]: v }));

  return (
    <Modal
      title={t('edit_profile')}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="button" className="btn primary" onClick={() => onSave(p)}>
            {t('apply')}
          </button>
        </>
      }
    >
      <BiField label={t('name')} value={p.name} onChange={(v) => set('name', v)} />
      <BiField label={t('role')} value={p.role} onChange={(v) => set('role', v)} />
      <BiField label={t('tagline')} value={p.tagline} onChange={(v) => set('tagline', v)} multiline />
      <BiField label={t('highlight')} value={p.highlight} onChange={(v) => set('highlight', v)} />
      <BiField label={t('location')} value={p.location} onChange={(v) => set('location', v)} />
      <div className="grid-2">
        <TextField label={t('email')} type="email" value={p.email} onChange={(v) => set('email', v)} />
        <TextField label={t('phone')} type="tel" value={p.phone} onChange={(v) => set('phone', v)} />
        <TextField label={t('github')} type="url" value={p.github} onChange={(v) => set('github', v)} />
        <TextField label={t('linkedin')} type="url" value={p.linkedin} onChange={(v) => set('linkedin', v)} />
        <TextField label={t('cv')} value={p.cv} onChange={(v) => set('cv', v)} />
      </div>
    </Modal>
  );
}
