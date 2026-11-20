'use client';

import type { Profile } from '@/lib/types';
import { useApp } from './Providers';
import { ArrowUpRight, Github, Linkedin, Mail } from './Icons';

/** Closing call-to-action so visitors who reach the end know how to get in touch. */
export default function Contact({ profile }: { profile: Profile }) {
  const { t } = useApp();
  if (!profile.email && !profile.github && !profile.linkedin) return null;

  return (
    <section id="contact" className="contact">
      <div className="contact-inner">
        <span className="sec-num">{t('contact_label')}</span>
        <h2 className="contact-title">{t('contact_title')}</h2>
        <p className="contact-text">{t('contact_text')}</p>
        <div className="hero-actions">
          {profile.email && (
            <a className="btn-solid" href={`mailto:${profile.email}`}>
              <Mail size={18} />
              {t('contact_cta')}
            </a>
          )}
          {profile.linkedin && (
            <a className="btn-ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
              <Linkedin size={18} />
              LinkedIn
              <ArrowUpRight size={14} className="contact-arrow" />
            </a>
          )}
          {profile.github && (
            <a className="btn-ghost" href={profile.github} target="_blank" rel="noreferrer">
              <Github size={18} />
              GitHub
              <ArrowUpRight size={14} className="contact-arrow" />
            </a>
          )}
        </div>
        {profile.email && (
          <p className="contact-email">
            <bdi>{profile.email}</bdi>
          </p>
        )}
      </div>
    </section>
  );
}
