/**
 * Every read the app makes against the listing catalogue goes through this module.
 * Components never write `.from('properties')` themselves.
 *
 * All functions take the Supabase client as a parameter, so the same code serves Server
 * Components (createServerClient) and Client Components (getBrowserClient).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { PAGE_SIZE, type CategorySlug } from '@/lib/constants/property';
import { CITIES, CORRIDORS, LOCALITIES } from '@/lib/constants/locations';
import { applyFilters, applySort, escapeLike } from '@/lib/search/query';
import { MIN_QUERY, buildSuggestions, normalizeQuery, type Suggestion } from '@/lib/search/suggest';
import type { SearchFilters } from '@/lib/search/filters';
import { toProperty, type PropertyRow } from '@/lib/properties/mappers';
import type { BuilderRow } from '@/lib/builders/showcase';
import type { Property } from '@/types';

const CARDS = 'property_cards';
const DETAILS = 'property_details';

export class RepositoryError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
    this.name = 'RepositoryError';
  }
}

/** PostgREST: requested range starts past the last row. */
const PGRST_RANGE_NOT_SATISFIABLE = 'PGRST103';

/* ───────────────────────────── Search ───────────────────────────── */

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function searchProperties(
  client: SupabaseClient,
  filters: SearchFilters,
  pageSize: number = PAGE_SIZE,
): Promise<SearchResult> {
  const from = (filters.page - 1) * pageSize;
  const to = from + pageSize - 1;

  const base = client.from(CARDS).select('*', { count: 'exact' });
  const query = applySort(applyFilters(base as never, filters) as never, filters.sort) as unknown as {
    range(from: number, to: number): PromiseLike<{
      data: PropertyRow[] | null;
      count: number | null;
      error: { message: string; code?: string } | null;
    }>;
  };

  const { data, count, error } = await query.range(from, to);

  if (error) {
    if (error.code === PGRST_RANGE_NOT_SATISFIABLE) {
      // Page beyond the end: report the real total so the caller can redirect to the last page.
      const total = await countProperties(client, filters);
      return { properties: [], total, page: filters.page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
    }
    throw new RepositoryError(error.message, error.code);
  }

  const total = count ?? data?.length ?? 0;
  return {
    properties: (data ?? []).map(toProperty),
    total,
    page: filters.page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function countProperties(client: SupabaseClient, filters: SearchFilters): Promise<number> {
  const base = client.from(CARDS).select('id', { count: 'exact', head: true });
  const { count, error } = (await (applyFilters(base as never, filters) as never)) as {
    count: number | null;
    error: { message: string; code?: string } | null;
  };
  if (error) throw new RepositoryError(error.message, error.code);
  return count ?? 0;
}

/* ───────────────────────────── Single listing ───────────────────────────── */

export async function getPropertyBySlug(client: SupabaseClient, slug: string): Promise<Property | null> {
  const { data, error } = await client.from(DETAILS).select('*').eq('slug', slug).maybeSingle();
  if (error) throw new RepositoryError(error.message, error.code);
  return data ? toProperty(data as PropertyRow) : null;
}

/** Same category + city first, then same category anywhere; never the listing itself. */
export async function getSimilarProperties(
  client: SupabaseClient,
  property: Pick<Property, 'id' | 'category' | 'city_slug'>,
  limit = 3,
): Promise<Property[]> {
  const { data, error } = await client
    .from(CARDS)
    .select('*')
    .eq('category', property.category)
    .neq('id', property.id)
    .order('created_at', { ascending: false })
    .limit(limit * 4);
  if (error) throw new RepositoryError(error.message, error.code);
  const rows = ((data ?? []) as PropertyRow[]).map(toProperty);
  rows.sort((a, b) => Number(b.city_slug === property.city_slug) - Number(a.city_slug === property.city_slug));
  return rows.slice(0, limit);
}

/* ───────────────────────────── Home page collections ───────────────────────────── */

async function cardsWhere(
  client: SupabaseClient,
  build: (q: any) => any,
  limit?: number,
): Promise<Property[]> {
  let q = build(client.from(CARDS).select('*')).order('created_at', { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw new RepositoryError(error.message, error.code);
  return ((data ?? []) as PropertyRow[]).map(toProperty);
}

export const getFeaturedProperties = (client: SupabaseClient, limit?: number) =>
  cardsWhere(client, (q) => q.eq('featured', true), limit);

export const getExclusiveProperties = (client: SupabaseClient, limit?: number) =>
  cardsWhere(client, (q) => q.eq('exclusive', true), limit);

/** Most recently added listings across every category ("Newly added" rail). */
export const getLatestProperties = (client: SupabaseClient, limit = 9) => cardsWhere(client, (q) => q, limit);

export const getLatestInCity = (client: SupabaseClient, citySlug: string, limit = 6) =>
  cardsWhere(client, (q) => q.eq('city_slug', citySlug), limit);

export const getLatestInCategory = (client: SupabaseClient, category: CategorySlug, limit = 6) =>
  cardsWhere(client, (q) => q.eq('category', category), limit);

/** Builders that opted into the home page carousel (logo + tagline set), as plain rows. */
export async function getShowcaseBuilderRows(client: SupabaseClient): Promise<BuilderRow[]> {
  const { data, error } = await client
    .from('builders')
    .select('slug,name,logo_url,tagline,badges,sort_order')
    .eq('is_active', true)
    .not('logo_url', 'is', null)
    .not('tagline', 'is', null);
  if (error) throw new RepositoryError(error.message, error.code);
  return (data ?? []) as BuilderRow[];
}

/** Listings that have a builder, newest first: the projects shown inside each carousel card. */
export const getBuilderListings = (client: SupabaseClient, limit = 200) =>
  cardsWhere(client, (q) => q.not('builder_slug', 'is', null), limit);

/* ───────────────────────────── Autocomplete ───────────────────────────── */

/** Ranked suggestions for the search boxes: property types, localities, projects and builders. */
export async function getSuggestions(client: SupabaseClient, rawQuery: string): Promise<Suggestion[]> {
  const q = normalizeQuery(rawQuery);
  if (q.length < MIN_QUERY) return [];
  const pattern = `%${escapeLike(q)}%`;

  const [projects, localities, builders] = await Promise.all([
    client
      .from(CARDS)
      .select('slug,title,category,featured,exclusive,locality,city')
      .ilike('title', pattern)
      .order('created_at', { ascending: false })
      .limit(8),
    client.from(CARDS).select('locality,locality_slug,city,city_slug').ilike('locality', pattern).limit(300),
    client.from(CARDS).select('builder,builder_slug').ilike('builder', pattern).limit(300),
  ]);
  const failed = projects.error ?? localities.error ?? builders.error;
  if (failed) throw new RepositoryError(failed.message, failed.code);

  return buildSuggestions(q, {
    projects: (projects.data ?? []) as never,
    localities: (localities.data ?? []) as never,
    builders: (builders.data ?? []) as never,
  });
}

/* ───────────────────────────── Popular searches ───────────────────────────── */

export interface PopularSearch {
  category: CategorySlug;
  citySlug: string;
  localitySlug: string;
  locality: string;
  count: number;
}

/** Most-listed (category, locality) pairs first; ties broken alphabetically so the order is stable. */
export function rankPopularSearches(
  rows: readonly { category: string; city_slug: string; locality_slug: string; locality: string }[],
  limit: number,
): PopularSearch[] {
  const byKey = new Map<string, PopularSearch>();
  for (const r of rows) {
    if (!r.category || !r.locality_slug) continue;
    const key = `${r.category}|${r.city_slug}|${r.locality_slug}`;
    const hit = byKey.get(key);
    if (hit) hit.count++;
    else
      byKey.set(key, {
        category: r.category as CategorySlug,
        citySlug: r.city_slug,
        localitySlug: r.locality_slug,
        locality: r.locality,
        count: 1,
      });
  }
  return [...byKey.values()]
    .sort((a, b) => b.count - a.count || a.locality.localeCompare(b.locality) || a.category.localeCompare(b.category))
    .slice(0, limit);
}

/** Footer "Popular searches": derived from live listings, so it can never link to an empty search. */
export async function getPopularSearches(client: SupabaseClient, limit = 11): Promise<PopularSearch[]> {
  const { data, error } = await client
    .from(CARDS)
    .select('category,city_slug,locality_slug,locality')
    .limit(2000);
  if (error) throw new RepositoryError(error.message, error.code);
  return rankPopularSearches((data ?? []) as Parameters<typeof rankPopularSearches>[0], limit);
}

/* ───────────────────────────── Facets & filter options ───────────────────────────── */

export interface Facets {
  total: number;
  builders: number;
  categories: Partial<Record<CategorySlug, number>>;
  cities: Record<string, number>;
  /** keyed "city-slug/locality-slug" */
  localities: Record<string, number>;
}

export const EMPTY_FACETS: Facets = { total: 0, builders: 0, categories: {}, cities: {}, localities: {} };

/** One RPC (`property_filter_facets`). Never throws: counts are decoration, not critical path. */
export async function getFacets(client: SupabaseClient): Promise<Facets> {
  try {
    const { data, error } = await client.rpc('property_filter_facets');
    if (error || !data) return EMPTY_FACETS;
    return { ...EMPTY_FACETS, ...(data as Partial<Facets>) };
  } catch {
    return EMPTY_FACETS;
  }
}

export interface CityOption {
  slug: string;
  name: string;
}
export interface CorridorOption {
  slug: string;
  name: string;
  city: string;
}
export interface LocalityOption {
  slug: string;
  name: string;
  city: string;
  corridor: string | null;
  popular: boolean;
}

export interface FilterOptions {
  cities: CityOption[];
  corridors: CorridorOption[];
  localities: LocalityOption[];
  facets: Facets;
}

/** Compile-time reference data; used when the database is unreachable and as the SQL seed's mirror. */
export const STATIC_FILTER_OPTIONS: Omit<FilterOptions, 'facets'> = {
  cities: CITIES.map((c) => ({ slug: c.slug, name: c.name })),
  corridors: CORRIDORS.map((c) => ({ slug: c.slug, name: c.name, city: c.city })),
  localities: LOCALITIES.map((l) => ({
    slug: l.slug,
    name: l.name,
    city: l.city,
    corridor: l.corridor,
    popular: l.popular,
  })),
};

/**
 * Cities, corridors and localities for the filter panel. The database is authoritative (new
 * localities appear when a listing introduces them); constants are the fallback so the panel
 * always renders, even if the lookup fails.
 */
export async function getFilterOptions(client: SupabaseClient): Promise<FilterOptions> {
  const facets = await getFacets(client);
  try {
    const [cities, corridors, localities] = await Promise.all([
      client.from('cities').select('slug,name').eq('is_active', true).order('sort_order'),
      client.from('corridors').select('slug,name,cities(slug)').order('name'),
      client.from('localities').select('slug,name,is_popular,cities(slug),corridors(slug)').order('name'),
    ]);
    if (cities.error || corridors.error || localities.error || !cities.data?.length) {
      return { ...STATIC_FILTER_OPTIONS, facets };
    }
    const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));
    return {
      cities: cities.data.map((c) => ({ slug: String(c.slug), name: String(c.name) })),
      corridors: (corridors.data ?? []).map((c: Record<string, unknown>) => ({
        slug: String(c.slug),
        name: String(c.name),
        city: String(one(c.cities as { slug: string } | { slug: string }[])?.slug ?? ''),
      })),
      localities: (localities.data ?? []).map((l: Record<string, unknown>) => ({
        slug: String(l.slug),
        name: String(l.name),
        city: String(one(l.cities as { slug: string } | { slug: string }[])?.slug ?? ''),
        corridor: one(l.corridors as { slug: string } | { slug: string }[])?.slug ?? null,
        popular: Boolean(l.is_popular),
      })),
      facets,
    };
  } catch {
    return { ...STATIC_FILTER_OPTIONS, facets };
  }
}
