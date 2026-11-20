import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Admin session = signed cookie "<expiry>.<signature>".
 * The signing key is derived from ADMIN_PASSWORD, so changing the password
 * logs every existing session out.
 */
export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 8 * 60 * 60; // seconds

function signingKey(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (pw) return `portfolio-admin:${pw}`;
  // No password configured: only allow sessions in local development.
  return process.env.NODE_ENV === 'development' ? 'portfolio-admin:dev-only' : null;
}

function sign(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload).digest('base64url');
}

export function createSessionToken(): string | null {
  const key = signingKey();
  if (!key) return null;
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE);
  return `${exp}.${sign(exp, key)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  const key = signingKey();
  if (!key || !token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(exp, key));
  return a.length === b.length && timingSafeEqual(a, b);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE,
};
