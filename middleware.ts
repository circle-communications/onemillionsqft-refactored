import { NextResponse, type NextRequest } from 'next/server';
import { canonicalQuery } from '@/lib/search/filters';

/**
 * Sends legacy / non-canonical search URLs to their canonical form with a real HTTP 308, before any
 * rendering happens (a `redirect()` inside a streamed page can only emit a meta-refresh, which
 * search engines and link checkers do not treat as a redirect).
 *
 *   /properties?propertyType=Villa&city=Chennai  →  /properties?category=independent-villa&city=chennai
 */
export function middleware(req: NextRequest) {
  const qs = canonicalQuery(req.nextUrl.searchParams);
  if (qs === null) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.search = qs ? `?${qs}` : '';
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: ['/properties'] };
