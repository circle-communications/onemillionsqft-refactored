/*
  # Reference (lookup) tables

  cities, corridors, localities, builders, property_subtypes, amenities.
  Slugs are the values used in URLs (?city=chennai&locality=velachery&corridor=omr).
  Keep in sync with lib/constants/ (property.ts, locations.ts) (verified by `npm run test`).
*/

CREATE TABLE IF NOT EXISTS cities (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text NOT NULL UNIQUE,
  name       text NOT NULL,
  state      text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS corridors (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id    uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  slug       text NOT NULL,
  name       text NOT NULL,
  UNIQUE (city_id, slug)
);

CREATE TABLE IF NOT EXISTS localities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id     uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  corridor_id uuid REFERENCES corridors(id) ON DELETE SET NULL,
  slug        text NOT NULL,
  name        text NOT NULL,
  is_popular  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_localities_city ON localities(city_id);
CREATE INDEX IF NOT EXISTS idx_localities_corridor ON localities(corridor_id);

CREATE TABLE IF NOT EXISTS builders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text NOT NULL UNIQUE,
  name             text NOT NULL,
  logo_url         text,
  description      text,
  established_year smallint,
  website          text,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_subtypes (
  slug       text PRIMARY KEY,
  category   property_category NOT NULL,
  label      text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS amenities (
  slug       text PRIMARY KEY,
  label      text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

DROP TRIGGER IF EXISTS trg_cities_updated ON cities;
CREATE TRIGGER trg_cities_updated BEFORE UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_localities_updated ON localities;
CREATE TRIGGER trg_localities_updated BEFORE UPDATE ON localities FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_builders_updated ON builders;
CREATE TRIGGER trg_builders_updated BEFORE UPDATE ON builders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

/* ---------------------------- Seed reference data ---------------------------- */

INSERT INTO cities (slug, name, state, sort_order) VALUES
  ('chennai',   'Chennai',   'Tamil Nadu', 1),
  ('bengaluru', 'Bengaluru', 'Karnataka',  2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO corridors (city_id, slug, name)
SELECT c.id, v.slug, v.name FROM cities c
JOIN (VALUES
  ('chennai', 'omr',      'OMR (IT Corridor)'),
  ('chennai', 'gst-road', 'GST Road'),
  ('chennai', 'ecr',      'ECR')
) AS v(city, slug, name) ON v.city = c.slug
ON CONFLICT (city_id, slug) DO NOTHING;

INSERT INTO localities (city_id, corridor_id, slug, name, is_popular)
SELECT c.id, cor.id, slugify(v.name), v.name, v.popular
FROM (VALUES
  ('chennai',   NULL,       'Adyar',            true),
  ('chennai',   NULL,       'Anna Nagar',       true),
  ('chennai',   'omr',      'Sholinganallur',   true),
  ('chennai',   NULL,       'Porur',            true),
  ('chennai',   NULL,       'Thiruvanmiyur',    true),
  ('chennai',   NULL,       'Velachery',        true),
  ('chennai',   NULL,       'Medavakkam',       true),
  ('chennai',   NULL,       'Nanmangalam',      true),
  ('chennai',   NULL,       'T Nagar',          true),
  ('chennai',   NULL,       'Egmore',           true),
  ('chennai',   NULL,       'Periyamet',        true),
  ('chennai',   NULL,       'Poongavanapuram',  true),
  ('chennai',   NULL,       'Pallikaranai',     false),
  ('chennai',   NULL,       'Perumbakkam',      false),
  ('chennai',   'omr',      'Perungudi',        false),
  ('chennai',   'omr',      'Thoraipakkam',     false),
  ('chennai',   'omr',      'Navalur',          false),
  ('chennai',   'omr',      'Siruseri',         false),
  ('chennai',   'omr',      'Kelambakkam',      false),
  ('chennai',   'gst-road', 'Tambaram',         false),
  ('chennai',   'gst-road', 'Guduvanchery',     false),
  ('chennai',   'gst-road', 'Urapakkam',        false),
  ('chennai',   'gst-road', 'Vandalur',         false),
  ('chennai',   'gst-road', 'Potheri',          false),
  ('chennai',   'ecr',      'ECR',              false),
  ('bengaluru', NULL,       'Whitefield',       true),
  ('bengaluru', NULL,       'Sarjapur Road',    true),
  ('bengaluru', NULL,       'Electronic City',  true),
  ('bengaluru', NULL,       'Hebbal',           true),
  ('bengaluru', NULL,       'Kanakapura Road',  true),
  ('bengaluru', NULL,       'Yelahanka',        true)
) AS v(city, corridor, name, popular)
JOIN cities c ON c.slug = v.city
LEFT JOIN corridors cor ON cor.city_id = c.id AND cor.slug = v.corridor
ON CONFLICT (city_id, slug) DO NOTHING;

INSERT INTO property_subtypes (slug, category, label, sort_order) VALUES
  ('apartment',      'flat-apartment',    'Apartment',          1),
  ('studio',         'flat-apartment',    'Studio / 1 RK',      2),
  ('villa',          'independent-villa', 'Independent Villa',  1),
  ('row-house',      'independent-villa', 'Row House',          2),
  ('duplex-villa',   'independent-villa', 'Duplex Villa',       3),
  ('plot',           'residential-plot',  'Residential Plot',   1),
  ('office',         'commercial-space',  'Office Space',       1),
  ('retail',         'commercial-space',  'Shop / Showroom',    2),
  ('warehouse',      'commercial-space',  'Warehouse',          3),
  ('coworking',      'commercial-space',  'Co-working Space',   4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO amenities (slug, label, sort_order) VALUES
  ('gym',                 'Gym',                 1),
  ('swimming-pool',       'Swimming Pool',       2),
  ('security',            'Security',            3),
  ('power-backup',        'Power Backup',        4),
  ('lift',                'Lift',                5),
  ('clubhouse',           'Clubhouse',           6),
  ('park-garden',         'Park / Garden',       7),
  ('cctv',                'CCTV',                8),
  ('children-play-area',  'Children Play Area',  9)
ON CONFLICT (slug) DO NOTHING;
