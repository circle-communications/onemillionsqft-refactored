import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { publicSupabaseEnv } from './env';

let browserClient: SupabaseClient | null = null;

/**
 * Anon-key client for Client Components. Created lazily (never at import time) so that a missing
 * env var surfaces as a catchable error in the component that needs data, not as a crash of
 * every page that merely imports this module. Read-only by design: row-level security only
 * exposes published listings to the anon role.
 */
export function getBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const { url, anonKey } = publicSupabaseEnv();
    browserClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return browserClient;
}
