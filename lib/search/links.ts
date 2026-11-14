/**
 * Typed builders for every "go to a search" link in the app (header, footer, home page, cards).
 *
 * Nothing outside this file (and `searchHref`) should hand-write `/properties?...` strings:
 * links built here are canonical by construction, so they cannot drift from what the filter
 * panel and the database understand.
 */

import {
  BUDGET_BANDS,
  CRORE,
  SUBTYPES,
  type BudgetBandSlug,
  type CategorySlug,
  type PossessionSlug,
  type SubtypeSlug,
} from '@/lib/constants/property';
import { searchHref, type SearchFilters } from '@/lib/search/filters';

type Extra = Partial<SearchFilters>;

export const allPropertiesHref = () => searchHref();

export const categoryHref = (category: CategorySlug, extra: Extra = {}) =>
  searchHref({ category: [category], ...extra });

export const subtypeHref = (subtype: SubtypeSlug, extra: Extra = {}) => {
  const def = SUBTYPES.find((s) => s.slug === subtype);
  return searchHref({ category: def ? [def.category] : [], subtype: [subtype], ...extra });
};

export const cityHref = (city: string, extra: Extra = {}) => searchHref({ city, ...extra });

export const corridorHref = (city: string, corridor: string, extra: Extra = {}) =>
  searchHref({ city, corridor, ...extra });

export const localityHref = (city: string, locality: string, extra: Extra = {}) =>
  searchHref({ city, locality: [locality], ...extra });

export const possessionHref = (possession: PossessionSlug, extra: Extra = {}) =>
  searchHref({ possession: [possession], ...extra });

/** `bhk` 4 means exactly 4 BHK, 5 means "5 or more"; pass [4, 5] for "4+ BHK". */
export const bhkHref = (bhk: number[], extra: Extra = {}) => searchHref({ bhk, ...extra });

export const budgetBand = (slug: BudgetBandSlug) => {
  const band = BUDGET_BANDS.find((b) => b.slug === slug);
  if (!band) throw new Error(`Unknown budget band: ${slug}`);
  return band;
};

export const budgetHref = (slug: BudgetBandSlug, extra: Extra = {}) => {
  const { min, max } = budgetBand(slug);
  return searchHref({ minPrice: min, maxPrice: max, ...extra });
};

/** "Luxury" is defined once: ₹1.5 Cr and above. */
export const LUXURY_MIN_PRICE = 1.5 * CRORE;
export const luxuryHref = (extra: Extra = {}) => searchHref({ minPrice: LUXURY_MIN_PRICE, ...extra });

export const textSearchHref = (q: string, extra: Extra = {}) => searchHref({ q, ...extra });
