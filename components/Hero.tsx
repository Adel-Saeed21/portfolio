'use client';

import type { Profile } from '@/lib/types';
import { useApp } from './Providers';
import { ArrowUpRight, Download, Github, Linkedin, Mail, Pencil, Phone, Pin, Trophy } from './Icons';

export default function Hero({ profile, editMode, onEdit }: { profile: Profile; editMode: boolean; onEdit: () => void }) {
  const { t, tr } = useApp();
  const name = tr(profile.name);
  const location = tr(profile.location);

  return (
    <section className="hero" id="top">
      <div className={`hero-inner${editMode ? ' is-editable' : ''}`}>
        {editMode && (
          <button type="button" className="tool-btn hero-edit" onClick={onEdit}>
            <Pencil size={16} /> {t('edit_profile')}
          </button>
        )}

        <div className="hero-badges">
          <p className="eyebrow">
            <span className="status-dot" aria-hidden="true" />
            <span>{tr(profile.role)}</span>
            {location && (
              <>
                <span className="eyebrow-sep" aria-hidden="true">/</span>
                <span className="eyebrow-loc">
                  <Pin size={14} />
                  {location}
                </span>
              </>
            )}
          </p>
          {tr(profile.highlight) && (
            <p className="eyebrow highlight-badge">
              <Trophy size={15} />
              <span>{tr(profile.highlight)}</span>
            </p>
          )}
        </div>

        <h1 className="hero-name">{name}</h1>

        {tr(profile.tagline) && <p className="hero-tagline">{tr(profile.tagline)}</p>}

        <div className="hero-actions">
          {profile.cv && (
            <a className="btn-solid" href={profile.cv} download>
              <Download size={18} />
              {t('download_cv')}
            </a>
          )}
          {profile.email && (
            <a className="btn-ghost" href={`mailto:${profile.email}`}>
              <Mail size={18} />
              <bdi>{profile.email}</bdi>
            </a>
          )}
        </div>

        <ul className="hero-contacts">
          {profile.phone && (
            <li>
              <a className="contact-link" href={`tel:${profile.phone.replace(/\s/g, '')}`}>
                <Phone size={16} />
                <bdi>{profile.phone}</bdi>
              </a>
            </li>
          )}
          {profile.github && (
            <li>
              <a className="contact-link" href={profile.github} target="_blank" rel="noreferrer">
                <Github size={16} />
                GitHub
                <ArrowUpRight size={14} className="contact-arrow" />
              </a>
            </li>
          )}
          {profile.linkedin && (
            <li>
              <a className="contact-link" href={profile.linkedin} target="_blank" rel="noreferrer">
                <Linkedin size={16} />
                LinkedIn
                <ArrowUpRight size={14} className="contact-arrow" />
              </a>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
