import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { MissingEnvError } from './env';

let adminClient: SupabaseClient | null = null;

/**
 * Service-role client. Bypasses row-level security - use ONLY in route handlers for writes the
 * public must not perform directly (leads). The key is never exposed to the browser because it
 * has no NEXT_PUBLIC_ prefix and this module imports `server-only`.
 */
export function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new MissingEnvError('NEXT_PUBLIC_SUPABASE_URL');
    if (!key) throw new MissingEnvError('SUPABASE_SERVICE_ROLE_KEY');
    adminClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return adminClient;
}
