import { NextResponse } from 'next/server';
import { getSuggestions } from '@/lib/properties/repository';
import { MAX_QUERY, MIN_QUERY, normalizeQuery } from '@/lib/search/suggest';
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * GET /api/suggest?q=vel  →  { suggestions: Suggestion[] }
 *
 * Read-only and cheap: three small indexed queries, cached per query string by Next's data cache
 * (see LISTING_REVALIDATE_SECONDS) and by CDNs through the Cache-Control header. Failures return an
 * empty list, because autocomplete is a convenience, never a blocker for typing a search.
 */
export async function GET(req: Request) {
  const q = normalizeQuery(new URL(req.url).searchParams.get('q') ?? '');
  const headers = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' };

  if (q.length < MIN_QUERY || q.length > MAX_QUERY) return NextResponse.json({ suggestions: [] }, { headers });

  try {
    const suggestions = await getSuggestions(createServerClient(), q);
    return NextResponse.json({ suggestions }, { headers });
  } catch (err) {
    console.error('[suggest] failed', err);
    return NextResponse.json({ suggestions: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}
