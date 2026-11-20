import type { Metadata } from 'next';
import { Inter, IBM_Plex_Sans_Arabic, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { readContent } from '@/lib/content';
import { LANGS, SITE_URL, isLang } from '@/lib/site';
import type { Lang } from '@/lib/types';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-plex-ar', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains', display: 'swap' });

type Params = { params: { lang: string } };

export const dynamicParams = false;
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const lang: Lang = isLang(params.lang) ? params.lang : 'en';
  const { profile } = await readContent();
  const name = profile.name[lang] || profile.name.en;
  const role = profile.role[lang] || profile.role.en;
  const title = `${name} — ${role}`;
  const description = profile.tagline[lang] || profile.tagline.en;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: `/${lang}`,
      languages: { en: '/en', ar: '/ar', 'x-default': '/en' },
    },
    openGraph: {
      type: 'profile',
      title,
      description,
      url: `/${lang}`,
      siteName: name,
      locale: lang === 'ar' ? 'ar_EG' : 'en_US',
      alternateLocale: lang === 'ar' ? 'en_US' : 'ar_EG',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// Runs before paint: applies the saved theme so there is no flash, and decides whether to
// play the intro (once per session, public pages only, not for reduced-motion users).
const boot = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.setAttribute('data-theme',t);var i=false;try{i=!sessionStorage.getItem('intro-seen')&&!/\\/admin\\/?$/.test(location.pathname)&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}d.setAttribute(i?'data-intro':'data-preload','')}catch(e){}})();`;

export default function RootLayout({ children, params }: { children: React.ReactNode } & Params) {
  const lang: Lang = isLang(params.lang) ? params.lang : 'en';
  return (
    <html
      lang={lang}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${plexArabic.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <Providers initialLang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
