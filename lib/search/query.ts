/**
 * SearchFilters → PostgREST query against the `property_cards` view.
 *
 * Pure with respect to I/O: `applyFilters` only chains filter calls onto a builder it is given, so
 * it works with the browser client, the server client, and the recording builder used by tests.
 *
 * Semantics worth knowing:
 *  - Price and area are RANGE-OVERLAP filters. A project priced ₹85 L – ₹1.2 Cr matches a
 *    ₹1 Cr – ₹2 Cr search, because it has units in that range (cards show the "starting from" value).
 *  - BHK matches any BHK the project offers (`bhk_options`), not just the headline bedroom count.
 *    5 means "5 or more".
 *  - Multi-value filters of the same group are OR (2 BHK or 3 BHK); different groups are AND.
 *    Amenities are the exception: every selected amenity must be present.
 *  - Free text: every word must appear somewhere in the project / builder / locality / city text.
 */

import {
  APPROVALS,
  BHK_MAX_EXACT,
  type SortKey,
} from '@/lib/constants/property';
import type { SearchFilters } from '@/lib/search/filters';

/** Largest bedroom count the schema allows (properties.bedrooms CHECK 0..20). */
const BHK_CEILING = 20;

/**
 * The subset of the PostgREST filter builder this module needs. Every method returns the builder,
 * so calls chain. (supabase-js generics are too deep to be worth threading through here.)
 */
export interface FilterBuilder {
  eq(column: string, value: unknown): this;
  in(column: string, values: readonly unknown[]): this;
  gt(column: string, value: unknown): this;
  gte(column: string, value: unknown): this;
  lte(column: string, value: unknown): this;
  ilike(column: string, pattern: string): this;
  contains(column: string, value: readonly unknown[]): this;
  overlaps(column: string, value: readonly unknown[]): this;
  or(filters: string): this;
}

export interface OrderBuilder {
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): this;
}

/** Escape LIKE wildcards so user text is matched literally. */
export const escapeLike = (s: string): string => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/** Characters that would break out of a PostgREST `or=(...)` expression. */
const orSafe = (n: number): string => String(Math.trunc(n));

/** `bhk` filter values → the bedroom counts they stand for (5 = 5..20). */
export function bhkValues(bhk: readonly number[]): number[] {
  const out = new Set<number>();
  for (const n of bhk) {
    if (n > BHK_MAX_EXACT) for (let i = BHK_MAX_EXACT + 1; i <= BHK_CEILING; i++) out.add(i);
    else out.add(n);
  }
  return [...out].sort((a, b) => a - b);
}

export const searchTokens = (q: string): string[] =>
  q.split(/\s+/).map((t) => t.trim()).filter(Boolean).slice(0, 6);

export function applyFilters<Q extends FilterBuilder>(query: Q, f: SearchFilters): Q {
  let q: Q = query;

  if (f.category.length) q = q.in('category', f.category);
  if (f.subtype.length) q = q.in('subtype', f.subtype);

  if (f.city) q = q.eq('city_slug', f.city);
  if (f.corridor) q = q.eq('corridor', f.corridor);
  if (f.locality.length) q = q.in('locality_slug', f.locality);

  // price: listing starts at or below the max, and tops out at or above the min
  if (f.maxPrice !== null) q = q.lte('price', f.maxPrice);
  if (f.minPrice !== null) {
    const min = orSafe(f.minPrice);
    q = q.or(`price_max.gte.${min},and(price_max.is.null,price.gte.${min})`);
  }

  // area: ranges overlap
  if (f.maxArea !== null) q = q.lte('area_min_sqft', f.maxArea);
  if (f.minArea !== null) q = q.gte('area_max_sqft', f.minArea);

  if (f.bhk.length) q = q.overlaps('bhk_options', bhkValues(f.bhk));
  if (f.bathrooms !== null) q = q.gte('bathrooms', f.bathrooms);

  if (f.possession.length) q = q.in('possession', f.possession);
  if (f.furnishing.length) q = q.in('furnishing_slug', f.furnishing);
  if (f.facing.length) q = q.in('facing', f.facing);
  if (f.parking) q = q.gt('parking', 0);
  if (f.amenities.length) q = q.contains('amenity_slugs', f.amenities);

  for (const a of APPROVALS) {
    if (f[a.key]) q = q.eq(a.column, true);
  }

  for (const token of searchTokens(f.q)) {
    q = q.ilike('search_text', `%${escapeLike(token.toLowerCase())}%`);
  }

  return q;
}

/** Sort → ordered column list. `id` is always the final tie-break so pagination is stable. */
export const SORT_COLUMNS: Record<SortKey, readonly { column: string; ascending: boolean }[]> = {
  newest: [{ column: 'created_at', ascending: false }],
  price_asc: [{ column: 'price', ascending: true }],
  price_desc: [{ column: 'price', ascending: false }],
  area_desc: [{ column: 'area_min_sqft', ascending: false }],
  area_asc: [{ column: 'area_min_sqft', ascending: true }],
  ppsqft_asc: [{ column: 'price_per_sqft', ascending: true }],
};

export function applySort<Q extends OrderBuilder>(query: Q, sort: SortKey): Q {
  let q: Q = query;
  for (const { column, ascending } of SORT_COLUMNS[sort]) {
    q = q.order(column, { ascending, nullsFirst: false });
  }
  return q.order('id', { ascending: true });
}
