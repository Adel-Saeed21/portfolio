import { NextResponse } from 'next/server';
import { checkPassword } from '@/lib/content';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/auth';
import { clearFailures, clientIp, isBlocked, recordFailure } from '@/lib/rateLimit';

/** Log in: check the password and set the admin session cookie. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (isBlocked(ip)) {
    return NextResponse.json({ ok: false, error: 'too_many_attempts' }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  const token = createSessionToken();
  if (!token || !checkPassword((body.password ?? '').trim())) {
    recordFailure(ip);
    return NextResponse.json({ ok: false, error: 'wrong_password' }, { status: 401 });
  }
  clearFailures(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}

/** Log out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
