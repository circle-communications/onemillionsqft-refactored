import type { Property } from '@/types';

/** Raw row from `property_cards` / `property_details`. PostgREST types are loose, so this is too. */
export type PropertyRow = Record<string, unknown>;

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const str = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);
const arr = <T = unknown>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/**
 * View row → Property. Normalises what PostgREST gives us (numeric columns may arrive as
 * strings, nullable text as null) into the shape every component can rely on.
 */
export function toProperty(row: PropertyRow): Property {
  const price = num(row.price) ?? 0;
  const areaMin = num(row.area_min_sqft) ?? num(row.area_sqft) ?? 0;

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title ?? ''),
    description: str(row.description) ?? '',

    category: row.category as Property['category'],
    property_type: String(row.property_type ?? ''),
    subtype: (str(row.subtype) as Property['subtype']) ?? null,
    listing_type: 'Buy',

    city: String(row.city ?? ''),
    city_slug: String(row.city_slug ?? ''),
    locality: String(row.locality ?? ''),
    locality_slug: String(row.locality_slug ?? ''),
    corridor: str(row.corridor),

    builder: str(row.builder),
    builder_slug: str(row.builder_slug),
    builder_logo: str(row.builder_logo),

    price,
    price_max: num(row.price_max),
    price_per_sqft: num(row.price_per_sqft),
    area_sqft: areaMin,
    area_min_sqft: areaMin,
    area_max_sqft: num(row.area_max_sqft) ?? areaMin,

    bedrooms: num(row.bedrooms),
    bhk_options: arr<unknown>(row.bhk_options).map(Number).filter(Number.isFinite),
    bathrooms: num(row.bathrooms),
    possession: row.possession as Property['possession'],
    status: String(row.status ?? ''),
    furnishing: str(row.furnishing) ?? '',
    furnishing_slug: str(row.furnishing_slug) as Property['furnishing_slug'],
    facing: str(row.facing),
    parking: num(row.parking) ?? 0,
    floor_number: num(row.floor_number),
    total_floors: num(row.total_floors),
    age_years: num(row.age_years) ?? 0,

    rera_id: str(row.rera_id),
    rera_registered: Boolean(row.rera_registered),
    cmda_approved: Boolean(row.cmda_approved),
    dtcp_approved: Boolean(row.dtcp_approved),
    gated_community: Boolean(row.gated_community),
    is_corner: Boolean(row.is_corner),

    image_url: str(row.image_url) ?? '/images/placeholder-property.svg',
    featured: Boolean(row.featured),
    exclusive: Boolean(row.exclusive),
    created_at: String(row.created_at ?? ''),
    amenity_slugs: arr<string>(row.amenity_slugs),

    gallery: 'gallery' in row ? arr<string>(row.gallery) : null,
    amenities: 'amenities' in row ? arr<string>(row.amenities) : null,
    nearby: 'nearby' in row ? (arr(row.nearby) as Property['nearby']) : null,
    floor_plans: 'floor_plans' in row ? (arr(row.floor_plans) as Property['floor_plans']) : null,
    configurations: 'configurations' in row ? (arr(row.configurations) as Property['configurations']) : null,
  };
}
