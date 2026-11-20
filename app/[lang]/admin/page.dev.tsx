import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { readContent } from '@/lib/content';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import Portfolio from '@/components/Portfolio';
import AdminLogin from '@/components/editor/AdminLogin';

// Depends on the login cookie, so it is rendered on every request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const loggedIn = verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!loggedIn) return <AdminLogin />;
  return <Portfolio initial={await readContent()} admin />;
}
