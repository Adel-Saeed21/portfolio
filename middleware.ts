import { NextResponse, type NextRequest } from 'next/server';

/**
 * Every page lives under /en or /ar. Anything else is redirected:
 * first to the language the visitor chose before (cookie), otherwise to
 * their browser language (Arabic if they prefer it, English for everyone else).
 * So /admin becomes /en/admin or /ar/admin.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split('/')[1];
  // /en/…, /ar/… (including /en/admin and /ar/admin) are real pages.
  if (first === 'en' || first === 'ar') return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${pickLang(req)}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

function pickLang(req: NextRequest): 'en' | 'ar' {
  const saved = req.cookies.get('lang')?.value;
  if (saved === 'en' || saved === 'ar') return saved;
  return /^ar\b/i.test((req.headers.get('accept-language') ?? '').trim()) ? 'ar' : 'en';
}

export const config = {
  // Skip API routes, Next internals and any file with an extension (CV, icons, sitemap.xml, robots.txt…)
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
