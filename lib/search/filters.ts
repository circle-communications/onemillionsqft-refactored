/**
 * Search filters: the ONE definition of what a property search is.
 *
 *   URL query string  ⇄  SearchFilters  →  Supabase query (lib/search/query.ts)
 *
 * - `parseSearchParams` accepts the canonical vocabulary AND every legacy / ad-hoc vocabulary
 *   that earlier versions of the header, footer and home page emitted
 *   (propertyType=Apartment, type=houses, bhk=1rk, budget=40l-80l, filter=gated, status=...,
 *   maxBudget=..., search=...). Old bookmarks and shared links keep working.
 * - `serializeFilters` always emits the canonical form, with a stable parameter order, so the
 *   same search always has the same URL.
 * - Both sides run `sanitizeFilters`, so filters that make no sense for the chosen categories
 *   (e.g. bedrooms for plots) are dropped instead of silently returning zero results.
 */

import {
  AMENITIES,
  APPROVALS,
  APPROVAL_KEYS,
  BHK_MAX_EXACT,
  BUDGET_BANDS,
  CATEGORIES,
  CATEGORY_BY_SLUG,
  CATEGORY_SLUGS,
  CRORE,
  DEFAULT_SORT,
  FACING,
  FURNISHING,
  MAX_PAGE,
  POSSESSION,
  isAmenitySlug,
  isCategorySlug,
  isFacingSlug,
  isFurnishingSlug,
  isPossessionSlug,
  isSortKey,
  isSubtypeSlug,
  SUBTYPES,
  type ApprovalKey,
  type CategorySlug,
  type FacingSlug,
  type FurnishingSlug,
  type PossessionSlug,
  type SortKey,
  type SubtypeSlug,
} from '@/lib/constants/property';

/* ───────────────────────────── Types ───────────────────────────── */

export interface SearchFilters {
  /** Free-text: project, builder, locality … */
  q: string;
  category: CategorySlug[];
  subtype: SubtypeSlug[];
  city: string | null;
  locality: string[];
  corridor: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minArea: number | null;
  maxArea: number | null;
  /** 1–4 exact, 5 = "5 or more" */
  bhk: number[];
  /** minimum bathrooms */
  bathrooms: number | null;
  possession: PossessionSlug[];
  furnishing: FurnishingSlug[];
  facing: FacingSlug[];
  parking: boolean;
  amenities: string[];
  rera: boolean;
  cmda: boolean;
  dtcp: boolean;
  gated: boolean;
  corner: boolean;
  sort: SortKey;
  page: number;
}

export type RawParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | { get(name: string): string | null; forEach(cb: (value: string, key: string) => void): void };

export const emptyFilters = (): SearchFilters => ({
  q: '',
  category: [],
  subtype: [],
  city: null,
  locality: [],
  corridor: null,
  minPrice: null,
  maxPrice: null,
  minArea: null,
  maxArea: null,
  bhk: [],
  bathrooms: null,
  possession: [],
  furnishing: [],
  facing: [],
  parking: false,
  amenities: [],
  rera: false,
  cmda: false,
  dtcp: false,
  gated: false,
  corner: false,
  sort: DEFAULT_SORT,
  page: 1,
});

/** Keys that earlier versions of the app used. Presence of any of these triggers a redirect to the canonical URL. */
export const LEGACY_KEYS = [
  'propertyType',
  'type',
  'listingType',
  'search',
  'sortBy',
  'bedrooms',
  'minBudget',
  'maxBudget',
  'budget',
  'filter',
  'sub',
  'status',
] as const;

/** Every query-string key that is part of the filter vocabulary (canonical + legacy). */
export const FILTER_KEYS: ReadonlySet<string> = new Set([
  'q', 'category', 'subtype', 'city', 'locality', 'corridor', 'minPrice', 'maxPrice', 'minArea',
  'maxArea', 'bhk', 'bathrooms', 'possession', 'furnishing', 'facing', 'parking', 'amenities',
  'rera', 'cmda', 'dtcp', 'gated', 'corner', 'sort', 'page', ...LEGACY_KEYS,
]);

/* ───────────────────────────── Parsing helpers ───────────────────────────── */

const MAX_LIST = 20;
const MAX_Q = 100;
const MAX_MONEY = 100_000_000_000;
const MAX_AREA = 10_000_000;

function toMap(input: RawParams): Map<string, string> {
  const m = new Map<string, string>();
  const push = (k: string, v: string) => m.set(k, m.has(k) ? `${m.get(k)},${v}` : v);
  if (typeof (input as URLSearchParams).forEach === 'function' && typeof (input as URLSearchParams).get === 'function') {
    (input as URLSearchParams).forEach((v, k) => push(k, v));
  } else {
    for (const [k, v] of Object.entries(input as Record<string, string | string[] | undefined>)) {
      if (v === undefined) continue;
      push(k, Array.isArray(v) ? v.join(',') : v);
    }
  }
  return m;
}

const list = (v: string | undefined): string[] =>
  v ? v.split(',').map((s) => s.trim()).filter(Boolean).slice(0, MAX_LIST) : [];

/** "Flat / Apartment" → "flat-apartment", "Ready to Occupy" → "ready-to-occupy", "1.5cr" stays "1.5cr" */
export const slugKey = (v: string): string =>
  v.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');

const uniq = <T,>(arr: T[]): T[] => Array.from(new Set(arr));

const int = (v: string | undefined, min: number, max: number): number | null => {
  if (v === undefined || v.trim() === '') return null;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < min) return null;
  return Math.min(n, max);
};

const bool = (v: string | undefined): boolean => v === 'true' || v === '1';

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,59}$/;
const asSlug = (v: string): string | null => {
  const s = slugKey(v);
  return SLUG_RE.test(s) ? s : null;
};

/* ── Legacy vocabularies ── */

const CATEGORY_ALIASES: Record<string, CategorySlug> = {
  apartment: 'flat-apartment',
  apartments: 'flat-apartment',
  flat: 'flat-apartment',
  flats: 'flat-apartment',
  'flats-apartments': 'flat-apartment',
  'flat-apartments': 'flat-apartment',
  'apartments-flats': 'flat-apartment',
  'builder-floor': 'flat-apartment',
  'builder-floors': 'flat-apartment',
  penthouse: 'flat-apartment',
  villa: 'independent-villa',
  villas: 'independent-villa',
  'independent-villas': 'independent-villa',
  house: 'independent-villa',
  houses: 'independent-villa',
  'independent-house': 'independent-villa',
  'independent-houses': 'independent-villa',
  plot: 'residential-plot',
  plots: 'residential-plot',
  'residential-plots': 'residential-plot',
  'plots-land': 'residential-plot',
  land: 'residential-plot',
  commercial: 'commercial-space',
  'commercial-spaces': 'commercial-space',
};

const toCategory = (v: string): CategorySlug | null => {
  const k = slugKey(v);
  if (isCategorySlug(k)) return k;
  return CATEGORY_ALIASES[k] ?? null;
};

const POSSESSION_ALIASES: Record<string, PossessionSlug> = {
  ready: 'ready-to-move',
  'ready-to-occupy': 'ready-to-move',
  'ready-to-move-in': 'ready-to-move',
  'move-in-ready': 'ready-to-move',
};

const toPossession = (v: string): PossessionSlug | null => {
  const k = slugKey(v);
  if (isPossessionSlug(k)) return k;
  return POSSESSION_ALIASES[k] ?? null;
};

/* ───────────────────────────── parse ───────────────────────────── */

export function parseSearchParams(input: RawParams): SearchFilters {
  const p = toMap(input);
  const f = emptyFilters();

  f.q = (p.get('q') ?? p.get('search') ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_Q);

  f.category = uniq(
    [...list(p.get('category')), ...list(p.get('propertyType')), ...list(p.get('type'))]
      .map(toCategory)
      .filter((c): c is CategorySlug => c !== null),
  );

  const subtypes: SubtypeSlug[] = [];
  for (const raw of [...list(p.get('subtype')), ...list(p.get('sub'))]) {
    const k = slugKey(raw);
    if (isSubtypeSlug(k)) subtypes.push(k);
  }

  // BHK: canonical `bhk=2,3`; legacy `bedrooms=3`, `bhk=1rk`
  const bhk: number[] = [];
  for (const raw of [...list(p.get('bhk')), ...list(p.get('bedrooms'))]) {
    if (slugKey(raw) === '1rk') {
      subtypes.push('studio');
      continue;
    }
    const n = int(raw, 1, 50);
    if (n !== null) bhk.push(Math.min(n, BHK_MAX_EXACT + 1));
  }
  f.bhk = uniq(bhk).sort((a, b) => a - b);
  f.subtype = uniq(subtypes);

  f.city = p.has('city') ? asSlug(p.get('city')!) : null;
  f.locality = uniq(list(p.get('locality')).map(asSlug).filter((s): s is string => s !== null)).sort();
  f.corridor = p.has('corridor') ? asSlug(p.get('corridor')!) : null;

  f.minPrice = int(p.get('minPrice') ?? p.get('minBudget'), 0, MAX_MONEY);
  f.maxPrice = int(p.get('maxPrice') ?? p.get('maxBudget'), 0, MAX_MONEY);
  const band = BUDGET_BANDS.find((b) => b.slug === slugKey(p.get('budget') ?? ''));
  if (band) {
    if (f.minPrice === null) f.minPrice = band.min;
    if (f.maxPrice === null) f.maxPrice = band.max;
  }

  f.minArea = int(p.get('minArea'), 0, MAX_AREA);
  f.maxArea = int(p.get('maxArea'), 0, MAX_AREA);
  f.bathrooms = int(p.get('bathrooms'), 1, 10);

  const possession = [...list(p.get('possession')), ...list(p.get('status'))]
    .map(toPossession)
    .filter((x): x is PossessionSlug => x !== null);

  f.furnishing = uniq(list(p.get('furnishing')).map(slugKey).filter(isFurnishingSlug));
  f.facing = uniq(list(p.get('facing')).map(slugKey).filter(isFacingSlug));
  f.parking = bool(p.get('parking')) || ['available', 'covered', 'open', 'yes'].includes(slugKey(p.get('parking') ?? ''));
  f.amenities = uniq(list(p.get('amenities')).map(slugKey).filter(isAmenitySlug));

  const flags: Record<ApprovalKey, boolean> = {
    rera: bool(p.get('rera')),
    cmda: bool(p.get('cmda')),
    dtcp: bool(p.get('dtcp')),
    gated: bool(p.get('gated')),
    corner: bool(p.get('corner')),
  };

  // Legacy `filter=` quick-links from the old mega menu
  for (const raw of list(p.get('filter'))) {
    switch (slugKey(raw)) {
      case 'ready-to-move':
        possession.push('ready-to-move');
        break;
      case 'under-construction':
        possession.push('under-construction');
        break;
      case 'gated':
        flags.gated = true;
        break;
      case 'cmda-approved':
        flags.cmda = true;
        break;
      case 'dtcp-approved':
        flags.dtcp = true;
        break;
      case 'corner':
        flags.corner = true;
        break;
      case 'luxury':
        if (f.minPrice === null) f.minPrice = 1.5 * CRORE;
        break;
      default:
        break; // no-brokerage / resale / new-projects … have no data behind them: ignored
    }
  }
  f.possession = uniq(possession);
  Object.assign(f, flags);

  const sortRaw = p.get('sort') ?? p.get('sortBy') ?? '';
  f.sort = isSortKey(sortRaw) ? sortRaw : DEFAULT_SORT;
  f.page = int(p.get('page'), 1, MAX_PAGE) ?? 1;

  return sanitizeFilters(f);
}

/**
 * Which filter groups make sense for the current category selection.
 * No category selected = every category is in play, so a group shows when ANY category supports it.
 * The filter panel renders from this and `sanitizeFilters` enforces it, so the UI can never offer
 * a filter that the URL layer would silently drop.
 */
export function applicableGroups(f: Pick<SearchFilters, 'category'>) {
  const categories: CategorySlug[] = f.category.length ? [...f.category] : [...CATEGORY_SLUGS];
  const defs = categories.map((c) => CATEGORY_BY_SLUG[c]);
  const any = (pick: (d: (typeof CATEGORIES)[number]) => boolean) => defs.some(pick);
  return {
    categories,
    bedrooms: any((d) => d.hasBedrooms),
    bathrooms: any((d) => d.hasBathrooms),
    furnishing: any((d) => d.hasFurnishing),
    parking: any((d) => d.hasParking),
    floors: any((d) => d.hasFloors),
    possession: POSSESSION.filter((p) => p.categories.some((c) => categories.includes(c))),
    approvals: APPROVALS.filter((a) => a.categories.some((c) => categories.includes(c))),
    subtypes: SUBTYPES.filter((s) => categories.includes(s.category)),
  };
}

/* ───────────────────────────── sanitize ───────────────────────────── */

/**
 * Normalises a filter set:
 *  - min > max ranges are swapped
 *  - filters that cannot apply to any of the selected categories are dropped
 *  - lists are put in canonical order
 */
export function sanitizeFilters(input: SearchFilters): SearchFilters {
  const f: SearchFilters = { ...input };

  const order = <T extends string>(values: readonly T[], canonical: readonly { slug: T }[]) =>
    canonical.map((c) => c.slug).filter((s) => values.includes(s));

  f.category = CATEGORY_SLUGS.filter((c) => f.category.includes(c));

  if (f.minPrice !== null && f.maxPrice !== null && f.minPrice > f.maxPrice) {
    [f.minPrice, f.maxPrice] = [f.maxPrice, f.minPrice];
  }
  if (f.minArea !== null && f.maxArea !== null && f.minArea > f.maxArea) {
    [f.minArea, f.maxArea] = [f.maxArea, f.minArea];
  }

  const g = applicableGroups(f);
  const active = g.categories;

  f.subtype = SUBTYPES.filter((s) => f.subtype.includes(s.slug) && active.includes(s.category)).map((s) => s.slug);
  if (!g.bedrooms) f.bhk = [];
  else f.bhk = uniq(f.bhk).sort((a, b) => a - b);
  if (!g.bathrooms) f.bathrooms = null;
  if (!g.furnishing) f.furnishing = [];
  else f.furnishing = order(f.furnishing, FURNISHING);
  if (!g.parking) f.parking = false;

  f.possession = POSSESSION.filter(
    (p) => f.possession.includes(p.slug) && p.categories.some((c) => active.includes(c)),
  ).map((p) => p.slug);
  f.facing = order(f.facing, FACING);
  f.amenities = AMENITIES.filter((a) => f.amenities.includes(a.slug)).map((a) => a.slug);

  for (const a of APPROVALS) {
    if (!a.categories.some((c) => active.includes(c))) f[a.key] = false;
  }

  f.locality = uniq(f.locality).sort();
  if (f.sort !== DEFAULT_SORT && !isSortKey(f.sort)) f.sort = DEFAULT_SORT;
  f.page = Math.min(Math.max(1, Math.trunc(f.page) || 1), MAX_PAGE);
  return f;
}

/* ───────────────────────────── serialize ───────────────────────────── */

export function serializeFilters(input: SearchFilters, opts: { page?: boolean } = {}): URLSearchParams {
  const f = sanitizeFilters(input);
  const sp = new URLSearchParams();
  const set = (k: string, v: string | number | null | undefined) => {
    if (v !== null && v !== undefined && v !== '') sp.set(k, String(v));
  };
  const setList = (k: string, v: readonly (string | number)[]) => {
    if (v.length) sp.set(k, v.join(','));
  };

  set('q', f.q);
  setList('category', f.category);
  setList('subtype', f.subtype);
  set('city', f.city);
  setList('locality', f.locality);
  set('corridor', f.corridor);
  set('minPrice', f.minPrice);
  set('maxPrice', f.maxPrice);
  set('minArea', f.minArea);
  set('maxArea', f.maxArea);
  setList('bhk', f.bhk);
  set('bathrooms', f.bathrooms);
  setList('possession', f.possession);
  setList('furnishing', f.furnishing);
  setList('facing', f.facing);
  if (f.parking) sp.set('parking', '1');
  setList('amenities', f.amenities);
  for (const k of APPROVAL_KEYS) if (f[k]) sp.set(k, '1');
  if (f.sort !== DEFAULT_SORT) sp.set('sort', f.sort);
  if ((opts.page ?? true) && f.page > 1) sp.set('page', String(f.page));
  return sp;
}

/** Build a canonical `/properties?...` URL from a partial filter set. */
export function searchHref(partial: Partial<SearchFilters> = {}, base = '/properties'): string {
  const qs = serializeFilters({ ...emptyFilters(), ...partial }).toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Returns the canonical query string when the incoming one is not already canonical, otherwise null.
 *
 * "Not canonical" covers legacy keys (propertyType=Villa), legacy values (city=Chennai), reordered
 * or duplicated params, out-of-range pages, and filters that do not apply to the chosen categories.
 * Unrelated params (utm_*, gclid, ...) are preserved verbatim. Canonicalising a canonical query
 * returns null, so redirecting on a non-null result can never loop.
 */
export function canonicalQuery(input: RawParams): string | null {
  const raw = toMap(input);
  const canonical = serializeFilters(parseSearchParams(input));

  const incoming = new URLSearchParams();
  raw.forEach((value, key) => {
    if (FILTER_KEYS.has(key)) incoming.append(key, value);
  });
  if (incoming.toString() === canonical.toString()) return null;

  raw.forEach((value, key) => {
    if (!FILTER_KEYS.has(key)) canonical.append(key, value);
  });
  return canonical.toString();
}

/* ───────────────────────────── helpers for UI ───────────────────────────── */

/** Number of independent filter groups that are active (search text and sort excluded). */
export function countActiveFilters(f: SearchFilters): number {
  let n = 0;
  if (f.category.length) n++;
  if (f.subtype.length) n++;
  if (f.city) n++;
  if (f.locality.length) n++;
  if (f.corridor) n++;
  if (f.minPrice !== null || f.maxPrice !== null) n++;
  if (f.minArea !== null || f.maxArea !== null) n++;
  if (f.bhk.length) n++;
  if (f.bathrooms !== null) n++;
  if (f.possession.length) n++;
  if (f.furnishing.length) n++;
  if (f.facing.length) n++;
  if (f.parking) n++;
  if (f.amenities.length) n++;
  for (const k of APPROVAL_KEYS) if (f[k]) n++;
  return n;
}

export const hasAnyFilter = (f: SearchFilters): boolean => countActiveFilters(f) > 0 || f.q !== '';
