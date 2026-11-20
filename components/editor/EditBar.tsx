'use client';

import { useApp } from '../Providers';
import { Download, LogOut, Plus, Save, Upload, User } from '../Icons';

export default function EditBar({
  dirty,
  saving,
  onAdd,
  onProfile,
  onSave,
  onExport,
  onImport,
  onExit,
}: {
  dirty: boolean;
  saving: boolean;
  onAdd: () => void;
  onProfile: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onExit: () => void;
}) {
  const { t } = useApp();
  return (
    <div className="edit-bar" role="toolbar" aria-label={t('edit_mode')}>
      <span className="edit-bar-label">{t('edit_mode')}</span>
      <button type="button" className="tool-btn" onClick={onAdd}>
        <Plus size={16} /> {t('add_section')}
      </button>
      <button type="button" className="tool-btn" onClick={onProfile}>
        <User size={16} /> {t('edit_profile')}
      </button>
      <button type="button" className={`tool-btn save${dirty ? ' dirty' : ''}`} onClick={onSave} disabled={saving || !dirty}>
        <Save size={16} /> {saving ? t('saving') : t('save')}
      </button>
      <button type="button" className="tool-btn icon-only" onClick={onExport} aria-label={t('export')} title={t('export')}>
        <Download size={16} />
      </button>
      <button type="button" className="tool-btn icon-only" onClick={onImport} aria-label={t('import')} title={t('import')}>
        <Upload size={16} />
      </button>
      <button type="button" className="tool-btn icon-only" onClick={onExit} aria-label={t('exit')} title={t('exit')}>
        <LogOut size={16} />
      </button>
    </div>
  );
}
