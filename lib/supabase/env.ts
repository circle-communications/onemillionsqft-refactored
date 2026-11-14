/**
 * Environment access in one place, with errors that say what to do.
 * NEXT_PUBLIC_* values are inlined at build time, so they must be referenced literally.
 */

export class MissingEnvError extends Error {
  constructor(name: string) {
    super(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in ` +
        `(Supabase dashboard → Project Settings → API).`,
    );
    this.name = 'MissingEnvError';
  }
}

export function publicSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) throw new MissingEnvError('NEXT_PUBLIC_SUPABASE_URL');
  if (!anonKey) throw new MissingEnvError('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return { url, anonKey };
}

export const isSupabaseConfigured = (): boolean =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
