import type { Bi, Content, Entry, Section } from './types';

export const uid = () => Math.random().toString(36).slice(2, 10);
export const emptyBi = (): Bi => ({ ar: '', en: '' });

export const newEntry = (): Entry => ({
  id: uid(),
  title: emptyBi(),
  subtitle: emptyBi(),
  period: emptyBi(),
  description: emptyBi(),
  points: [],
  tags: [],
  links: [],
});

export const newSection = (): Section => ({
  id: uid(),
  type: 'cards',
  title: { ar: 'قسم جديد', en: 'New section' },
  visible: true,
  body: emptyBi(),
  items: [],
});

export const isContent = (v: unknown): v is Content => {
  const c = v as Content;
  return !!c && typeof c === 'object' && !!c.profile && Array.isArray(c.sections);
};
