import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { publicSupabaseEnv } from './env';

/**
 * Seconds a listing query result may be served from Next's data cache (production only).
 * In `next dev` the cache is switched off: it is stored on disk in .next/, survives restarts, and
 * would keep serving old (e.g. empty) results after you change the database.
 */
export const LISTING_REVALIDATE_SECONDS = process.env.NODE_ENV === 'production' ? 60 : false;

/**
 * Anon-key client for Server Components / route handlers.
 *
 * Every request goes through Next's data cache for LISTING_REVALIDATE_SECONDS, keyed by the full
 * PostgREST URL (which encodes every filter), so a popular search is computed once a minute
 * instead of once per visitor.
 */
export function createServerClient(revalidate: number | false = LISTING_REVALIDATE_SECONDS): SupabaseClient {
  const { url, anonKey } = publicSupabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, revalidate === false ? { ...init, cache: 'no-store' } : { ...init, next: { revalidate } }),
    },
  });
}
