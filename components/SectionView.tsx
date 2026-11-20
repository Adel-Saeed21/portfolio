'use client';

import { useState } from 'react';
import type { Entry, LinkItem, Section } from '@/lib/types';
import { useApp } from './Providers';
import Modal from './editor/Modal';
import { ArrowUpRight, Down, Eye, EyeOff, Github, Pencil, Play, Trash, Up } from './Icons';

export type SectionControls = {
  onEdit: () => void;
  onUp: () => void;
  onDown: () => void;
  onToggle: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
};

const realLinks = (links?: LinkItem[]) => (links ?? []).filter((l) => l.url.trim());

const isGithub = (url: string) => /github\.com/i.test(url);

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Lets the visitor pick which of a project's links to open. */
function LinkChooser({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const { t, tr } = useApp();
  return (
    <Modal title={tr(entry.title)} onClose={onClose} narrow>
      <p className="hint chooser-hint">{t('choose_link')}</p>
      <ul className="link-choices">
        {realLinks(entry.links).map((l, i) => (
          <li key={i}>
            <a className="choice" href={l.url} target="_blank" rel="noreferrer" onClick={onClose}>
              <span className="choice-icon">{isGithub(l.url) ? <Github size={20} /> : <Play size={20} />}</span>
              <span className="choice-text">
                <strong>{tr(l.label) || host(l.url)}</strong>
                <small>
                  <bdi>{host(l.url)}</bdi>
                </small>
              </span>
              <ArrowUpRight size={16} className="choice-arrow" />
            </a>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function Links({ links }: { links?: LinkItem[] }) {
  const { tr } = useApp();
  const real = realLinks(links);
  if (!real.length) return null;
  return (
    <div className="links">
      {real.map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noreferrer" className="link">
          {tr(l.label) || l.url}
          <ArrowUpRight size={14} />
        </a>
      ))}
    </div>
  );
}

function Points({ entry }: { entry: Entry }) {
  const { tr } = useApp();
  const pts = (entry.points ?? []).map(tr).filter(Boolean);
  if (!pts.length) return null;
  return (
    <ul className="points">
      {pts.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  );
}

function Tags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;
  return (
    <ul className="tags">
      {tags.map((tag) => (
        <li key={tag}>
          <bdi>{tag}</bdi>
        </li>
      ))}
    </ul>
  );
}

function Body({ section }: { section: Section }) {
  const { t, tr } = useApp();
  const [chooser, setChooser] = useState<Entry | null>(null);

  const openEntry = (e: Entry) => {
    const links = realLinks(e.links);
    if (links.length === 1) window.open(links[0].url, '_blank', 'noopener,noreferrer');
    else if (links.length > 1) setChooser(e);
  };

  switch (section.type) {
    case 'text':
      return (
        <div className="prose-panel">
          {tr(section.body)
            .split('\n')
            .filter((p) => p.trim())
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      );

    case 'timeline':
      return (
        <ol className="timeline">
          {section.items.map((e) => (
            <li key={e.id}>
              <span className="period">{tr(e.period)}</span>
              <article className="tl-entry">
                <header className="tl-head">
                  <h3>{tr(e.title)}</h3>
                  {tr(e.subtitle) && <p className="subtitle">{tr(e.subtitle)}</p>}
                </header>
                {tr(e.description) && <p>{tr(e.description)}</p>}
                <Points entry={e} />
                <Links links={e.links} />
              </article>
            </li>
          ))}
        </ol>
      );

    case 'cards':
      return (
        <div className="cards">
          {section.items.map((e, i) => {
            const clickable = realLinks(e.links).length > 0;
            return (
              <article key={e.id} className={`card${clickable ? ' is-clickable' : ''}`}>
                {clickable && (
                  <button type="button" className="card-hit" onClick={() => openEntry(e)} aria-label={`${t('open_project')}: ${tr(e.title)}`} />
                )}
                {e.image && (
                  <div className="card-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={e.image} alt={tr(e.title)} loading="lazy" decoding="async" />
                  </div>
                )}
                <div className="card-top">
                  <span className="card-index">{String(i + 1).padStart(2, '0')}</span>
                  {clickable && (
                    <span className="card-cta" aria-hidden="true">
                      {t('open_project')}
                      <ArrowUpRight size={14} />
                    </span>
                  )}
                </div>
                <h3>{tr(e.title)}</h3>
                {tr(e.subtitle) && <p className="subtitle">{tr(e.subtitle)}</p>}
                {tr(e.description) && <p className="desc">{tr(e.description)}</p>}
                <Points entry={e} />
                <Tags tags={e.tags} />
                <Links links={e.links} />
              </article>
            );
          })}
          {chooser && <LinkChooser entry={chooser} onClose={() => setChooser(null)} />}
        </div>
      );

    case 'chips':
      return (
        <dl className="skill-table">
          {section.items.map((e) => (
            <div key={e.id} className="skill-row">
              <dt>{tr(e.title)}</dt>
              <dd>
                <Tags tags={e.tags} />
              </dd>
            </div>
          ))}
        </dl>
      );

    case 'list':
      return (
        <ul className="orn-list">
          {section.items.map((e) => (
            <li key={e.id}>
              <div className="orn-text">
                <strong>{tr(e.title)}</strong>
                {tr(e.subtitle) && <span className="subtitle">{tr(e.subtitle)}</span>}
              </div>
              <Links links={e.links} />
            </li>
          ))}
        </ul>
      );
  }
}

export default function SectionView({
  section,
  index,
  editMode,
  controls,
}: {
  section: Section;
  index: number;
  editMode: boolean;
  controls: SectionControls;
}) {
  const { t, tr } = useApp();
  const empty = section.type === 'text' ? !tr(section.body) : section.items.length === 0;

  return (
    <section id={section.id} className={`page-section${!section.visible ? ' is-hidden' : ''}${editMode ? ' is-editable' : ''}`}>
      {editMode && (
        <div className="sec-tools" role="toolbar" aria-label={tr(section.title)}>
          {!section.visible && <span className="hidden-badge">{t('hidden')}</span>}
          <button type="button" className="tool-btn" onClick={controls.onEdit}>
            <Pencil size={16} /> {t('edit')}
          </button>
          <button type="button" className="tool-btn icon-only" onClick={controls.onUp} disabled={controls.isFirst} aria-label={t('move_up')} title={t('move_up')}>
            <Up size={16} />
          </button>
          <button type="button" className="tool-btn icon-only" onClick={controls.onDown} disabled={controls.isLast} aria-label={t('move_down')} title={t('move_down')}>
            <Down size={16} />
          </button>
          <button type="button" className="tool-btn icon-only" onClick={controls.onToggle} aria-label={section.visible ? t('hide') : t('show')} title={section.visible ? t('hide') : t('show')}>
            {section.visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button type="button" className="tool-btn icon-only danger" onClick={controls.onDelete} aria-label={t('delete')} title={t('delete')}>
            <Trash size={16} />
          </button>
        </div>
      )}

      <div className="sec-head">
        <span className="sec-num">{String(index + 1).padStart(2, '0')}</span>
        <h2>{tr(section.title)}</h2>
      </div>

      <div className="sec-body">{empty ? editMode ? <p className="empty-note">{t('empty_items')}</p> : null : <Body section={section} />}</div>
    </section>
  );
}
