import type { Lang } from './types';

export const LANGS: Lang[] = ['en', 'ar'];
export const DEFAULT_LANG: Lang = 'en';

export const isLang = (v: unknown): v is Lang => v === 'en' || v === 'ar';

/** Public URL of the site, used for canonical links, sitemap and social previews. */
// Set NEXT_PUBLIC_SITE_URL in your host's environment variables. On Cloudflare Pages the
// build falls back to CF_PAGES_URL (the URL of that particular deployment).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.CF_PAGES_URL || 'http://localhost:3000').replace(/\/$/, '');
