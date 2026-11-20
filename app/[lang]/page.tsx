import { readContent } from '@/lib/content';
import { SITE_URL, isLang } from '@/lib/site';
import type { Content, Lang } from '@/lib/types';
import Portfolio from '@/components/Portfolio';

// Pages are generated once and re-generated when content is saved (see /api/content).

/** schema.org Person data so search engines understand who the site is about. */
function personJsonLd(c: Content, lang: Lang) {
  const p = c.profile;
  const pick = (b?: { ar: string; en: string }) => (b ? b[lang] || b.en : undefined);
  const education = c.sections.find((s) => s.id === 'education')?.items[0];
  const awards = c.sections.find((s) => s.id === 'awards')?.items ?? [];
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: pick(p.name),
    jobTitle: pick(p.role),
    description: pick(p.tagline),
    url: `${SITE_URL}/${lang}`,
    email: p.email ? `mailto:${p.email}` : undefined,
    address: pick(p.location) ? { '@type': 'PostalAddress', addressCountry: pick(p.location) } : undefined,
    sameAs: [p.github, p.linkedin].filter(Boolean),
    alumniOf: education ? { '@type': 'CollegeOrUniversity', name: pick(education.subtitle) } : undefined,
    award: awards.map((a) => [pick(a.title), pick(a.subtitle)].filter(Boolean).join(' — ')),
  };
}

export default async function Page({ params }: { params: { lang: string } }) {
  const lang: Lang = isLang(params.lang) ? params.lang : 'en';
  const content = await readContent();
  // Escape "<" so content can never close the script tag.
  const ld = JSON.stringify(personJsonLd(content, lang)).replace(/</g, '\\u003c');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <Portfolio initial={content} />
    </>
  );
}
