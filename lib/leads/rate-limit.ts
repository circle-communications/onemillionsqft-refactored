/**
 * Tiny fixed-window limiter, keyed by client IP.
 *
 * In-memory: it protects each server instance from a single noisy client, which is the realistic
 * threat for a contact form. If you run many instances and need a global limit, swap `hit` for
 * Redis/Upstash - the call site will not change.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;

const hits = new Map<string, { count: number; resetAt: number }>();

export function hit(key: string, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  entry.count += 1;
  return {
    allowed: entry.count <= MAX_HITS,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown';
}
