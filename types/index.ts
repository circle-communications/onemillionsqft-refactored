import type {
  CategorySlug,
  FacingSlug,
  FurnishingSlug,
  PossessionSlug,
  SubtypeSlug,
} from '@/lib/constants/property';

export interface NearbyLocation {
  name: string;
  distance?: string; // e.g. "1.2 km"
  type?: string; // school | hospital | metro | mall | park | market | restaurant | railway
}

export interface FloorPlan {
  bhk: number;
  title?: string;
  image_url?: string;
  area_sqft?: number;
  description?: string;
}

export interface Configuration {
  bhk: number;
  area_sqft?: number;
  price?: number | null; // null / undefined → "Price on request"
  status?: string;
}

/**
 * A listing as the UI sees it: one row of the `property_cards` view (list pages) or the
 * `property_details` view (detail pages, which also fill gallery / amenities / nearby / floor plans /
 * configurations). Built by `toProperty` in lib/properties/mappers.ts - nothing else constructs one.
 *
 * Buy-only catalogue: `listing_type` is always 'Buy'.
 */
export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;

  /** Canonical vocabulary (URL / enum slugs) */
  category: CategorySlug;
  subtype: SubtypeSlug | null;
  possession: PossessionSlug;
  /** Display label of `category` ("Flat / Apartment") */
  property_type: string;
  /** Display label of `possession` ("Ready to Move") */
  status: string;
  listing_type: 'Buy';

  city: string;
  city_slug: string;
  locality: string;
  locality_slug: string;
  corridor: string | null;

  builder: string | null;
  builder_slug: string | null;
  builder_logo: string | null;

  /** Starting price (₹). `price_max` is set when the project spans a range. */
  price: number;
  price_max: number | null;
  price_per_sqft: number | null;
  /** Smallest unit area; kept as `area_sqft` for the components that print a single value */
  area_sqft: number;
  area_min_sqft: number;
  area_max_sqft: number;

  bedrooms: number | null;
  /** Every BHK the project offers */
  bhk_options: number[];
  bathrooms: number | null;
  /** Display label ("Semi-Furnished"); '' when not applicable */
  furnishing: string;
  furnishing_slug: FurnishingSlug | null;
  facing: FacingSlug | string | null;
  parking: number;
  floor_number: number | null;
  total_floors: number | null;
  age_years: number;

  rera_id: string | null;
  rera_registered: boolean;
  cmda_approved: boolean;
  dtcp_approved: boolean;
  gated_community: boolean;
  is_corner: boolean;

  image_url: string;
  featured: boolean;
  exclusive: boolean;
  created_at: string;
  amenity_slugs: string[];

  /* Detail-page only (null on list pages) */
  gallery: string[] | null;
  amenities: string[] | null;
  nearby?: NearbyLocation[] | string[] | null;
  floor_plans?: FloorPlan[] | null;
  configurations?: Configuration[] | null;
}
