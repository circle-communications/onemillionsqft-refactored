/**
 * Search autocomplete: turns raw database matches into the ranked, grouped suggestion list.
 * Pure (no I/O) so it can be unit-tested; lib/properties/repository.ts does the querying.
 *
 * Four kinds of suggestion, in display order:
 *   category  → "Independent Villas"          → /properties?category=...
 *   locality  → "Velachery · Chennai (12)"    → /properties?city=...&locality=...
 *   project   → "KKR Sapphire"                → the listing's detail page
 *   builder   → "Malles Constructions (4)"    → /properties?q=Malles+Constructions
 */

import { CATEGORIES, type CategorySlug } from '@/lib/constants/property';
import { getPropertyPath } from '@/lib/routes';
import { categoryHref, localityHref, textSearchHref } from '@/lib/search/links';

export type SuggestionType = 'category' | 'locality' | 'project' | 'builder';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  label: string;
  sublabel?: string;
  href: string;
}

export const MIN_QUERY = 2;
export const MAX_QUERY = 60;

export const normalizeQuery = (q: string): string => q.replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY);

export interface ProjectRow {
  slug: string;
  title: string;
  category: CategorySlug;
  featured: boolean;
  exclusive: boolean;
  locality: string;
  city: string;
}
export interface LocalityRow {
  locality: string;
  locality_slug: string;
  city: string;
  city_slug: string;
}
export interface BuilderRow {
  builder: string;
  builder_slug: string;
}

export interface SuggestRows {
  projects: readonly ProjectRow[];
  localities: readonly LocalityRow[];
  builders: readonly BuilderRow[];
}

const LIMITS = { category: 2, locality: 4, project: 5, builder: 3 } as const;

const lc = (s: string) => s.toLowerCase();
/** 0 = the name starts with the query, 1 = a word in it does, 2 = it merely contains it. */
const rank = (name: string, q: string): number => {
  const n = lc(name);
  if (n.startsWith(q)) return 0;
  return n.split(/[\s/&-]+/).some((w) => w.startsWith(q)) ? 1 : 2;
};

function countBy<T>(rows: readonly T[], key: (r: T) => string): Map<string, { row: T; n: number }> {
  const m = new Map<string, { row: T; n: number }>();
  for (const r of rows) {
    const k = key(r);
    if (!k) continue;
    const hit = m.get(k);
    if (hit) hit.n++;
    else m.set(k, { row: r, n: 1 });
  }
  return m;
}

export function buildSuggestions(rawQuery: string, rows: SuggestRows): Suggestion[] {
  const q = lc(normalizeQuery(rawQuery));
  if (q.length < MIN_QUERY) return [];

  const out: Suggestion[] = [];

  // property types: any word of the label / short name / singular starts with the query
  CATEGORIES.filter((c) =>
    [c.label, c.short, c.singular].some((name) => lc(name).split(/[\s/&-]+/).some((w) => w.startsWith(q))),
  )
    .slice(0, LIMITS.category)
    .forEach((c) =>
      out.push({ id: `category:${c.slug}`, type: 'category', label: c.label, sublabel: 'Property type', href: categoryHref(c.slug) }),
    );

  [...countBy(rows.localities, (r) => `${r.city_slug}/${r.locality_slug}`).values()]
    .sort((a, b) => rank(a.row.locality, q) - rank(b.row.locality, q) || b.n - a.n || a.row.locality.localeCompare(b.row.locality))
    .slice(0, LIMITS.locality)
    .forEach(({ row, n }) =>
      out.push({
        id: `locality:${row.city_slug}/${row.locality_slug}`,
        type: 'locality',
        label: row.locality,
        sublabel: `${row.city} · ${n} ${n === 1 ? 'property' : 'properties'}`,
        href: localityHref(row.city_slug, row.locality_slug),
      }),
    );

  [...rows.projects]
    .sort((a, b) => rank(a.title, q) - rank(b.title, q) || a.title.localeCompare(b.title))
    .slice(0, LIMITS.project)
    .forEach((p) =>
      out.push({
        id: `project:${p.slug}`,
        type: 'project',
        label: p.title,
        sublabel: `${p.locality}, ${p.city}`,
        href: getPropertyPath(p),
      }),
    );

  [...countBy(rows.builders, (r) => r.builder_slug).values()]
    .sort((a, b) => rank(a.row.builder, q) - rank(b.row.builder, q) || b.n - a.n || a.row.builder.localeCompare(b.row.builder))
    .slice(0, LIMITS.builder)
    .forEach(({ row, n }) =>
      out.push({
        id: `builder:${row.builder_slug}`,
        type: 'builder',
        label: row.builder,
        sublabel: `Builder · ${n} ${n === 1 ? 'project' : 'projects'}`,
        href: textSearchHref(row.builder),
      }),
    );

  return out;
}
