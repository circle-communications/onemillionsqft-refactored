/**
 * Human-readable descriptions of a search: page heading / <title>, and the removable "active
 * filter" chips. Pure functions over SearchFilters, so they are unit-testable and shared by the
 * server page, the metadata generator and the client toolbar.
 */

import {
  AMENITIES,
  APPROVALS,
  BHK_MAX_EXACT,
  CATEGORY_BY_SLUG,
  FACING,
  FURNISHING,
  POSSESSION_LABEL,
  SUBTYPES,
} from '@/lib/constants/property';
import { formatAreaRange, formatBudgetRange } from '@/lib/format';
import { searchHref, type SearchFilters } from '@/lib/search/filters';

export interface LocationNames {
  cities: readonly { slug: string; name: string }[];
  corridors: readonly { slug: string; name: string; city: string }[];
  localities: readonly { slug: string; name: string; city: string }[];
}

const cityName = (n: LocationNames, slug: string) => n.cities.find((c) => c.slug === slug)?.name ?? slug;
const localityName = (n: LocationNames, f: SearchFilters, slug: string) =>
  (n.localities.find((l) => l.slug === slug && (!f.city || l.city === f.city)) ?? n.localities.find((l) => l.slug === slug))
    ?.name ?? slug;

export const bhkLabel = (n: number): string => (n > BHK_MAX_EXACT ? `${BHK_MAX_EXACT + 1}+ BHK` : `${n} BHK`);

const joinNatural = (items: string[]): string =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} & ${items[items.length - 1]}`;

/** "2 BHK Flats & Apartments for sale in Velachery, Chennai" */
export function listingHeading(f: SearchFilters, names: LocationNames): string {
  const noun =
    f.category.length === 1
      ? CATEGORY_BY_SLUG[f.category[0]].label
      : f.category.length > 1
        ? joinNatural(f.category.map((c) => CATEGORY_BY_SLUG[c].label))
        : 'Properties';
  const bhk = f.bhk.length ? `${joinNatural(f.bhk.map(bhkLabel))} ` : '';

  const where: string[] = [];
  if (f.locality.length) where.push(joinNatural(f.locality.map((l) => localityName(names, f, l))));
  else if (f.corridor) where.push(names.corridors.find((c) => c.slug === f.corridor)?.name ?? f.corridor);
  if (f.city) where.push(cityName(names, f.city));

  return `${bhk}${noun} for sale${where.length ? ` in ${where.join(', ')}` : ''}`;
}

export interface FilterChip {
  id: string;
  label: string;
  /** Applying this patch to the current filters removes exactly this chip. */
  patch: Partial<SearchFilters>;
}

export const chipHref = (f: SearchFilters, chip: FilterChip): string => searchHref({ ...f, ...chip.patch, page: 1 });

export function activeFilterChips(f: SearchFilters, names: LocationNames): FilterChip[] {
  const chips: FilterChip[] = [];
  const add = (id: string, label: string, patch: Partial<SearchFilters>) => chips.push({ id, label, patch });

  if (f.q) add('q', `“${f.q}”`, { q: '' });
  for (const c of f.category) add(`category:${c}`, CATEGORY_BY_SLUG[c].label, { category: f.category.filter((x) => x !== c) });
  for (const s of f.subtype) {
    add(`subtype:${s}`, SUBTYPES.find((x) => x.slug === s)?.label ?? s, { subtype: f.subtype.filter((x) => x !== s) });
  }
  if (f.city) add('city', cityName(names, f.city), { city: null, corridor: null, locality: [] });
  if (f.corridor) {
    add('corridor', names.corridors.find((c) => c.slug === f.corridor)?.name ?? f.corridor, { corridor: null });
  }
  for (const l of f.locality) add(`locality:${l}`, localityName(names, f, l), { locality: f.locality.filter((x) => x !== l) });
  if (f.minPrice !== null || f.maxPrice !== null) {
    add('price', formatBudgetRange(f.minPrice, f.maxPrice), { minPrice: null, maxPrice: null });
  }
  if (f.minArea !== null || f.maxArea !== null) {
    add('area', formatAreaRange(f.minArea, f.maxArea), { minArea: null, maxArea: null });
  }
  for (const n of f.bhk) add(`bhk:${n}`, bhkLabel(n), { bhk: f.bhk.filter((x) => x !== n) });
  if (f.bathrooms !== null) add('bathrooms', `${f.bathrooms}+ Bathrooms`, { bathrooms: null });
  for (const p of f.possession) add(`possession:${p}`, POSSESSION_LABEL[p], { possession: f.possession.filter((x) => x !== p) });
  for (const x of f.furnishing) {
    add(`furnishing:${x}`, FURNISHING.find((o) => o.slug === x)?.label ?? x, { furnishing: f.furnishing.filter((y) => y !== x) });
  }
  for (const x of f.facing) {
    add(`facing:${x}`, `${FACING.find((o) => o.slug === x)?.label ?? x} facing`, { facing: f.facing.filter((y) => y !== x) });
  }
  if (f.parking) add('parking', 'Parking', { parking: false });
  for (const a of f.amenities) {
    add(`amenity:${a}`, AMENITIES.find((o) => o.slug === a)?.label ?? a, { amenities: f.amenities.filter((x) => x !== a) });
  }
  for (const a of APPROVALS) if (f[a.key]) add(`approval:${a.key}`, a.label, { [a.key]: false });

  return chips;
}
