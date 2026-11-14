/**
 * Static location reference used by navigation links and URL validation.
 * The authoritative data lives in the `cities`, `corridors` and `localities` tables
 * (supabase/migrations/20261110000200_reference_data.sql); the filter panel loads the live
 * list from the database, this file only drives static links (header, footer, home).
 */

export const CITIES = [
  { slug: 'chennai', name: 'Chennai' },
  { slug: 'bengaluru', name: 'Bengaluru' },
] as const;
export type CitySlug = (typeof CITIES)[number]['slug'];
export const isCitySlug = (v: unknown): v is CitySlug =>
  typeof v === 'string' && CITIES.some((c) => c.slug === v);

export const slugify = (input: string): string =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const CORRIDORS = [
  { slug: 'omr', city: 'chennai', name: 'OMR (IT Corridor)', blurb: 'Old Mahabalipuram Road' },
  { slug: 'gst-road', city: 'chennai', name: 'GST Road', blurb: 'South Chennai growth corridor' },
  { slug: 'ecr', city: 'chennai', name: 'ECR', blurb: 'East Coast Road' },
] as const;
export type CorridorSlug = (typeof CORRIDORS)[number]['slug'];
export const isCorridorSlug = (v: unknown): v is CorridorSlug =>
  typeof v === 'string' && CORRIDORS.some((c) => c.slug === v);

export interface LocalityDef {
  name: string;
  slug: string;
  city: CitySlug;
  corridor: CorridorSlug | null;
  popular: boolean;
}

const loc = (
  city: CitySlug,
  name: string,
  corridor: CorridorSlug | null = null,
  popular = false,
): LocalityDef => ({ name, slug: slugify(name), city, corridor, popular });

export const LOCALITIES: readonly LocalityDef[] = [
  loc('chennai', 'Adyar', null, true),
  loc('chennai', 'Anna Nagar', null, true),
  loc('chennai', 'Sholinganallur', 'omr', true),
  loc('chennai', 'Porur', null, true),
  loc('chennai', 'Thiruvanmiyur', null, true),
  loc('chennai', 'Velachery', null, true),
  loc('chennai', 'Medavakkam', null, true),
  loc('chennai', 'Nanmangalam', null, true),
  loc('chennai', 'T Nagar', null, true),
  loc('chennai', 'Egmore', null, true),
  loc('chennai', 'Periyamet', null, true),
  loc('chennai', 'Poongavanapuram', null, true),
  loc('chennai', 'Pallikaranai'),
  loc('chennai', 'Perumbakkam'),
  loc('chennai', 'Perungudi', 'omr'),
  loc('chennai', 'Thoraipakkam', 'omr'),
  loc('chennai', 'Navalur', 'omr'),
  loc('chennai', 'Siruseri', 'omr'),
  loc('chennai', 'Kelambakkam', 'omr'),
  loc('chennai', 'Tambaram', 'gst-road'),
  loc('chennai', 'Guduvanchery', 'gst-road'),
  loc('chennai', 'Urapakkam', 'gst-road'),
  loc('chennai', 'Vandalur', 'gst-road'),
  loc('chennai', 'Potheri', 'gst-road'),
  loc('chennai', 'ECR', 'ecr'),
  loc('bengaluru', 'Whitefield', null, true),
  loc('bengaluru', 'Sarjapur Road', null, true),
  loc('bengaluru', 'Electronic City', null, true),
  loc('bengaluru', 'Hebbal', null, true),
  loc('bengaluru', 'Kanakapura Road', null, true),
  loc('bengaluru', 'Yelahanka', null, true),
];

export const localitiesOf = (city: CitySlug) => LOCALITIES.filter((l) => l.city === city);
export const localitiesOfCorridor = (corridor: CorridorSlug) =>
  LOCALITIES.filter((l) => l.corridor === corridor);
