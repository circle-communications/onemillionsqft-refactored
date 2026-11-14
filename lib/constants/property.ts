/**
 * Single source of truth for every property-related vocabulary in the app.
 *
 * Header, footer, home page, filter panel, URL parsing, Supabase queries and the SQL enums
 * ALL use the slugs defined here. If you add a value, add it to the matching SQL enum /
 * lookup table too (supabase/migrations) — `npm run test` verifies they agree.
 *
 * Scope: BUY listings only — flats & apartments, independent villas, residential plots,
 * commercial spaces.
 */

/* ───────────────────────────── Categories ───────────────────────────── */

export const CATEGORY_SLUGS = [
  'flat-apartment',
  'independent-villa',
  'residential-plot',
  'commercial-space',
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface CategoryDef {
  slug: CategorySlug;
  /** Plural marketing label (nav, chips, footer) */
  label: string;
  /** Singular label shown on cards / detail pages (matches DB view `property_type`) */
  singular: string;
  /** Short plural noun for generated link text: "Flats in Adyar" */
  short: string;
  description: string;
  /** Which filter groups make sense for this category */
  hasBedrooms: boolean;
  hasBathrooms: boolean;
  hasFurnishing: boolean;
  hasParking: boolean;
  hasFloors: boolean;
}

export const CATEGORIES: readonly CategoryDef[] = [
  {
    slug: 'flat-apartment',
    label: 'Flats & Apartments',
    singular: 'Flat / Apartment',
    short: 'Flats',
    description: 'New launches and ready-to-move homes',
    hasBedrooms: true,
    hasBathrooms: true,
    hasFurnishing: true,
    hasParking: true,
    hasFloors: true,
  },
  {
    slug: 'independent-villa',
    label: 'Independent Villas',
    singular: 'Independent Villa',
    short: 'Villas',
    description: 'Premium standalone living',
    hasBedrooms: true,
    hasBathrooms: true,
    hasFurnishing: true,
    hasParking: true,
    hasFloors: false,
  },
  {
    slug: 'residential-plot',
    label: 'Residential Plots',
    singular: 'Residential Plot',
    short: 'Plots',
    description: 'Approved layouts, ready to build',
    hasBedrooms: false,
    hasBathrooms: false,
    hasFurnishing: false,
    hasParking: false,
    hasFloors: false,
  },
  {
    slug: 'commercial-space',
    label: 'Commercial Spaces',
    singular: 'Commercial Space',
    short: 'Commercial Spaces',
    description: 'Offices, retail and warehouses',
    hasBedrooms: false,
    hasBathrooms: false,
    hasFurnishing: false,
    hasParking: true,
    hasFloors: true,
  },
] as const;

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c])) as Record<
  CategorySlug,
  CategoryDef
>;

export const isCategorySlug = (v: unknown): v is CategorySlug =>
  typeof v === 'string' && (CATEGORY_SLUGS as readonly string[]).includes(v);

/* ───────────────────────────── Sub-types ───────────────────────────── */

export const SUBTYPES = [
  { slug: 'apartment', category: 'flat-apartment', label: 'Apartment' },
  { slug: 'studio', category: 'flat-apartment', label: 'Studio / 1 RK' },
  { slug: 'villa', category: 'independent-villa', label: 'Independent Villa' },
  { slug: 'row-house', category: 'independent-villa', label: 'Row House' },
  { slug: 'duplex-villa', category: 'independent-villa', label: 'Duplex Villa' },
  { slug: 'plot', category: 'residential-plot', label: 'Residential Plot' },
  { slug: 'office', category: 'commercial-space', label: 'Office Space' },
  { slug: 'retail', category: 'commercial-space', label: 'Shop / Showroom' },
  { slug: 'warehouse', category: 'commercial-space', label: 'Warehouse' },
  { slug: 'coworking', category: 'commercial-space', label: 'Co-working Space' },
] as const satisfies readonly { slug: string; category: CategorySlug; label: string }[];
export type SubtypeSlug = (typeof SUBTYPES)[number]['slug'];

export const isSubtypeSlug = (v: unknown): v is SubtypeSlug =>
  typeof v === 'string' && SUBTYPES.some((s) => s.slug === v);

/* ───────────────────────────── Possession ───────────────────────────── */

export const POSSESSION = [
  { slug: 'ready-to-move', label: 'Ready to Move', categories: ['flat-apartment', 'independent-villa', 'residential-plot', 'commercial-space'] },
  { slug: 'under-construction', label: 'Under Construction', categories: ['flat-apartment', 'independent-villa', 'residential-plot', 'commercial-space'] },
  { slug: 'ready-to-build', label: 'Ready to Build', categories: ['residential-plot'] },
] as const satisfies readonly { slug: string; label: string; categories: readonly CategorySlug[] }[];
export type PossessionSlug = (typeof POSSESSION)[number]['slug'];
export const POSSESSION_LABEL = Object.fromEntries(POSSESSION.map((p) => [p.slug, p.label])) as Record<
  PossessionSlug,
  string
>;
export const isPossessionSlug = (v: unknown): v is PossessionSlug =>
  typeof v === 'string' && POSSESSION.some((p) => p.slug === v);

/* ───────────────────── Furnishing / facing / BHK / baths ───────────────────── */

export const FURNISHING = [
  { slug: 'unfurnished', label: 'Unfurnished' },
  { slug: 'semi-furnished', label: 'Semi-Furnished' },
  { slug: 'fully-furnished', label: 'Fully Furnished' },
] as const;
export type FurnishingSlug = (typeof FURNISHING)[number]['slug'];
export const isFurnishingSlug = (v: unknown): v is FurnishingSlug =>
  typeof v === 'string' && FURNISHING.some((f) => f.slug === v);

export const FACING = [
  { slug: 'north', label: 'North' },
  { slug: 'south', label: 'South' },
  { slug: 'east', label: 'East' },
  { slug: 'west', label: 'West' },
  { slug: 'north-east', label: 'North-East' },
  { slug: 'north-west', label: 'North-West' },
  { slug: 'south-east', label: 'South-East' },
  { slug: 'south-west', label: 'South-West' },
] as const;
export type FacingSlug = (typeof FACING)[number]['slug'];
export const isFacingSlug = (v: unknown): v is FacingSlug =>
  typeof v === 'string' && FACING.some((f) => f.slug === v);

/** Bedroom filter chips. 5 means "5 or more"; 1–4 are exact. */
export const BHK_OPTIONS = [
  { value: 1, label: '1 BHK' },
  { value: 2, label: '2 BHK' },
  { value: 3, label: '3 BHK' },
  { value: 4, label: '4 BHK' },
  { value: 5, label: '5+ BHK' },
] as const;
export const BHK_MAX_EXACT = 4;

/** Minimum bathrooms ("N+") */
export const BATHROOM_OPTIONS = [1, 2, 3, 4] as const;

/* ───────────────────────────── Amenities ───────────────────────────── */

export const AMENITIES = [
  { slug: 'gym', label: 'Gym' },
  { slug: 'swimming-pool', label: 'Swimming Pool' },
  { slug: 'security', label: 'Security' },
  { slug: 'power-backup', label: 'Power Backup' },
  { slug: 'lift', label: 'Lift' },
  { slug: 'clubhouse', label: 'Clubhouse' },
  { slug: 'park-garden', label: 'Park / Garden' },
  { slug: 'cctv', label: 'CCTV' },
  { slug: 'children-play-area', label: 'Children Play Area' },
] as const;
export type AmenitySlug = (typeof AMENITIES)[number]['slug'];
export const isAmenitySlug = (v: unknown): v is AmenitySlug =>
  typeof v === 'string' && AMENITIES.some((a) => a.slug === v);

/* ───────────────────────────── Approvals ───────────────────────────── */

export const APPROVAL_KEYS = ['rera', 'cmda', 'dtcp', 'gated', 'corner'] as const;
export type ApprovalKey = (typeof APPROVAL_KEYS)[number];

export const APPROVALS: readonly {
  key: ApprovalKey;
  label: string;
  /** DB (property_cards) column the filter hits */
  column: string;
  categories: readonly CategorySlug[];
}[] = [
  { key: 'rera', label: 'RERA registered', column: 'rera_registered', categories: CATEGORY_SLUGS },
  { key: 'cmda', label: 'CMDA approved', column: 'cmda_approved', categories: CATEGORY_SLUGS },
  { key: 'dtcp', label: 'DTCP approved', column: 'dtcp_approved', categories: ['residential-plot'] },
  { key: 'gated', label: 'Gated community', column: 'gated_community', categories: ['independent-villa', 'residential-plot', 'flat-apartment'] },
  { key: 'corner', label: 'Corner plot', column: 'is_corner', categories: ['residential-plot'] },
];

/* ───────────────────────────── Budget / area ───────────────────────────── */

export const LAKH = 100_000;
export const CRORE = 10_000_000;

/** Quick budget bands (header "Budget" menu, home page). Bands share boundaries with PRICE_STEPS. */
export const BUDGET_BANDS = [
  { slug: 'under-40l', label: 'Under ₹40 Lakh', sub: 'Starter homes & plots', min: null, max: 40 * LAKH },
  { slug: '40l-80l', label: '₹40 Lakh – ₹80 Lakh', sub: 'Mid-segment properties', min: 40 * LAKH, max: 80 * LAKH },
  { slug: '80l-1.5cr', label: '₹80 Lakh – ₹1.5 Cr', sub: 'Premium homes', min: 80 * LAKH, max: 1.5 * CRORE },
  { slug: 'above-1.5cr', label: 'Above ₹1.5 Cr', sub: 'Luxury & high-value', min: 1.5 * CRORE, max: null },
] as const satisfies readonly {
  slug: string;
  label: string;
  sub: string;
  min: number | null;
  max: number | null;
}[];
export type BudgetBandSlug = (typeof BUDGET_BANDS)[number]['slug'];

/** Values offered in the Min/Max price dropdowns. Includes every budget band boundary. */
export const PRICE_STEPS = [
  5 * LAKH,
  10 * LAKH,
  25 * LAKH,
  40 * LAKH,
  50 * LAKH,
  75 * LAKH,
  80 * LAKH,
  1 * CRORE,
  1.5 * CRORE,
  2 * CRORE,
  3 * CRORE,
  5 * CRORE,
  10 * CRORE,
  20 * CRORE,
] as const;

export const AREA_STEPS = [
  100, 200, 300, 400, 500, 700, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000, 10000,
] as const;

/* ───────────────────────────── Sorting / paging ───────────────────────────── */

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'area_desc', label: 'Area: Large to Small' },
  { value: 'area_asc', label: 'Area: Small to Large' },
  { value: 'ppsqft_asc', label: 'Price / sq.ft: Low to High' },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]['value'];
export const DEFAULT_SORT: SortKey = 'newest';
export const isSortKey = (v: unknown): v is SortKey =>
  typeof v === 'string' && SORT_OPTIONS.some((s) => s.value === v);

export const PAGE_SIZE = 10;
export const MAX_PAGE = 500;
