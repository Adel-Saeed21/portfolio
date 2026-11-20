export type Lang = 'ar' | 'en';
export type Theme = 'light' | 'dark';

/** A bilingual string */
export type Bi = { ar: string; en: string };

export type LinkItem = { label: Bi; url: string };

/** One entry inside a section (a job, a project, a skill group, a certificate…) */
export type Entry = {
  id: string;
  title: Bi;
  subtitle?: Bi;
  period?: Bi;
  description?: Bi;
  points?: Bi[];
  tags?: string[];
  links?: LinkItem[];
  /** Screenshot or cover image URL (cards only), e.g. /projects/nomad.png */
  image?: string;
};

export type SectionType = 'text' | 'timeline' | 'cards' | 'chips' | 'list';

export type Section = {
  id: string;
  type: SectionType;
  title: Bi;
  visible: boolean;
  body?: Bi;
  items: Entry[];
};

export type Profile = {
  name: Bi;
  role: Bi;
  tagline: Bi;
  /** Short standout achievement shown as a badge in the hero */
  highlight?: Bi;
  location: Bi;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  cv: string;
};

export type Content = { profile: Profile; sections: Section[] };

export const SECTION_TYPES: SectionType[] = ['text', 'timeline', 'cards', 'chips', 'list'];

/** Which entry fields each section type uses */
export const TYPE_FIELDS: Record<
  SectionType,
  Partial<Record<'subtitle' | 'period' | 'description' | 'points' | 'tags' | 'links' | 'image', true>>
> = {
  text: {},
  timeline: { subtitle: true, period: true, description: true, points: true, links: true },
  cards: { subtitle: true, description: true, points: true, tags: true, links: true, image: true },
  chips: { tags: true },
  list: { subtitle: true, links: true },
};
