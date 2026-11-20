/**
 * Small in-memory limiter for failed password attempts.
 * Per server instance only — enough to stop casual brute forcing on a single
 * server; on serverless hosts use a shared store (e.g. Upstash/Supabase) instead.
 */
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

const failures = new Map<string, { count: number; resetAt: number }>();

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : req.headers.get('x-real-ip'))?.trim() || 'unknown';
}

export function isBlocked(ip: string): boolean {
  const f = failures.get(ip);
  if (!f) return false;
  if (Date.now() > f.resetAt) {
    failures.delete(ip);
    return false;
  }
  return f.count >= MAX_FAILURES;
}

export function recordFailure(ip: string): void {
  const now = Date.now();
  const f = failures.get(ip);
  if (!f || now > f.resetAt) failures.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  else f.count += 1;
}

export function clearFailures(ip: string): void {
  failures.delete(ip);
}
