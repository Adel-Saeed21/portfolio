import { ImageResponse } from 'next/og';
import { readContent } from '@/lib/content';
import { LANGS } from '@/lib/site';

// The preview shown when the site is shared on LinkedIn, WhatsApp, X, Slack…
// Text is English in both languages: the built-in font has no Arabic glyphs.
export const alt = 'Portfolio preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Rendered once per language at build time (needed for the static export).
export const dynamic = 'force-static';
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function OpengraphImage() {
  const { profile } = await readContent();
  const name = profile.name.en;
  const role = profile.role.en;
  const highlight = profile.highlight?.en;
  const stack = 'Flutter · Next.js · Laravel';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#0a0a0a',
          color: '#ffffff',
          backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, color: '#a3a3a3' }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: '#ffffff' }} />
          {role}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{name}</div>
          <div style={{ fontSize: 34, color: '#d4d4d4' }}>{stack}</div>
        </div>
        {highlight ? (
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', padding: '12px 26px', border: '2px solid #ffffff', borderRadius: 999, fontSize: 26 }}>{highlight}</div>
          </div>
        ) : (
          <div style={{ display: 'flex' }} />
        )}
      </div>
    ),
    size,
  );
}
