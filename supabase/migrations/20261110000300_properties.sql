/*
  # Properties (normalized)

  properties               core listing row (one row per project / unit group)
  property_images          gallery (ordered)
  property_amenities       many-to-many with `amenities`
  property_configurations  BHK / size / price variants
  property_floor_plans     floor plans per BHK
  property_nearby          nearby landmarks

  Search-critical derived columns are maintained by triggers:
    properties.search_text    lower-cased "title locality city builder subtype category", trigram indexed
    properties.amenity_slugs  denormalised from property_amenities, GIN indexed

  The application never reads these tables directly; it reads the views defined in
  20261110000400_views_and_security.sql.
*/

-- Composite key so a property can never point at a locality of a different city.
DO $$ BEGIN
  ALTER TABLE localities ADD CONSTRAINT localities_id_city_key UNIQUE (id, city_id);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS properties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  description     text,

  category        property_category NOT NULL,
  subtype         text REFERENCES property_subtypes(slug),

  city_id         uuid NOT NULL REFERENCES cities(id),
  locality_id     uuid NOT NULL,
  builder_id      uuid REFERENCES builders(id) ON DELETE SET NULL,

  price_min       numeric(14,0) NOT NULL CHECK (price_min > 0),
  price_max       numeric(14,0),
  area_min_sqft   integer NOT NULL CHECK (area_min_sqft > 0),
  area_max_sqft   integer NOT NULL,
  price_per_sqft  numeric GENERATED ALWAYS AS (round(price_min / NULLIF(area_min_sqft, 0))) STORED,

  bedrooms        smallint CHECK (bedrooms BETWEEN 0 AND 20),
  bathrooms       smallint CHECK (bathrooms BETWEEN 0 AND 20),
  possession      possession_status NOT NULL DEFAULT 'ready-to-move',
  furnishing      furnishing_status,
  facing          facing_direction,
  parking_slots   smallint NOT NULL DEFAULT 0 CHECK (parking_slots >= 0),
  floor_number    smallint,
  total_floors    smallint,
  age_years       smallint NOT NULL DEFAULT 0 CHECK (age_years >= 0),

  rera_id         text,
  cmda_approved   boolean NOT NULL DEFAULT false,
  dtcp_approved   boolean NOT NULL DEFAULT false,
  gated_community boolean NOT NULL DEFAULT false,
  is_corner       boolean NOT NULL DEFAULT false,

  cover_image_url text NOT NULL,
  featured        boolean NOT NULL DEFAULT false,
  exclusive       boolean NOT NULL DEFAULT false,
  publish_status  publish_status NOT NULL DEFAULT 'published',

  amenity_slugs   text[] NOT NULL DEFAULT '{}',
  search_text     text NOT NULL DEFAULT '',

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT properties_locality_in_city
    FOREIGN KEY (locality_id, city_id) REFERENCES localities (id, city_id),
  CONSTRAINT properties_area_range  CHECK (area_max_sqft >= area_min_sqft),
  CONSTRAINT properties_price_range CHECK (price_max IS NULL OR price_max >= price_min),
  CONSTRAINT properties_ready_to_build_only_plots
    CHECK (possession <> 'ready-to-build' OR category = 'residential-plot'),
  CONSTRAINT properties_rooms_only_for_homes
    CHECK (category IN ('flat-apartment', 'independent-villa') OR (bedrooms IS NULL AND bathrooms IS NULL))
);

CREATE TABLE IF NOT EXISTS property_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt         text,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS property_amenities (
  property_id  uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_slug text NOT NULL REFERENCES amenities(slug) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_slug)
);

CREATE TABLE IF NOT EXISTS property_configurations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  bhk         smallint NOT NULL,
  area_sqft   integer,
  price       numeric(14,0),            -- NULL => "Price on request"
  status      text,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS property_floor_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  bhk         smallint NOT NULL,
  title       text,
  image_url   text,
  area_sqft   integer,
  description text,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS property_nearby (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name        text NOT NULL,
  distance    text,
  type        text,
  sort_order  integer NOT NULL DEFAULT 0
);

/* ------------------------------- Indexes ------------------------------- */

-- Listing page: published rows only, filtered by category / city / price
CREATE INDEX IF NOT EXISTS idx_properties_listing
  ON properties (category, city_id, price_min) WHERE publish_status = 'published';
CREATE INDEX IF NOT EXISTS idx_properties_locality   ON properties (locality_id);
CREATE INDEX IF NOT EXISTS idx_properties_builder    ON properties (builder_id);
CREATE INDEX IF NOT EXISTS idx_properties_possession ON properties (possession);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms   ON properties (bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_subtype    ON properties (subtype);
CREATE INDEX IF NOT EXISTS idx_properties_created    ON properties (created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_properties_featured   ON properties (created_at DESC) WHERE featured;
CREATE INDEX IF NOT EXISTS idx_properties_exclusive  ON properties (created_at DESC) WHERE exclusive;
CREATE INDEX IF NOT EXISTS idx_properties_ppsf       ON properties (price_per_sqft);
CREATE INDEX IF NOT EXISTS idx_properties_amenities  ON properties USING gin (amenity_slugs);
CREATE INDEX IF NOT EXISTS idx_properties_search_trgm ON properties USING gin (search_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_property_images_property  ON property_images (property_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_property_amenities_slug   ON property_amenities (amenity_slug);
CREATE INDEX IF NOT EXISTS idx_property_configs_property ON property_configurations (property_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_property_floorplans_prop  ON property_floor_plans (property_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_property_nearby_property  ON property_nearby (property_id, sort_order);

/* ------------------------------- Triggers ------------------------------ */

CREATE OR REPLACE FUNCTION properties_before_write() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_city text; v_locality text; v_builder text; v_subtype text;
BEGIN
  SELECT name INTO v_city     FROM cities           WHERE id   = NEW.city_id;
  SELECT name INTO v_locality FROM localities       WHERE id   = NEW.locality_id;
  SELECT name INTO v_builder  FROM builders         WHERE id   = NEW.builder_id;
  SELECT label INTO v_subtype FROM property_subtypes WHERE slug = NEW.subtype;

  NEW.search_text := lower(concat_ws(' ',
    NEW.title, v_locality, v_city, v_builder, v_subtype, replace(NEW.category::text, '-', ' ')));
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_properties_before_write ON properties;
CREATE TRIGGER trg_properties_before_write
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION properties_before_write();

-- Keep subtype consistent with category
CREATE OR REPLACE FUNCTION properties_check_subtype() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.subtype IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM property_subtypes WHERE slug = NEW.subtype AND category = NEW.category
  ) THEN
    RAISE EXCEPTION 'subtype % does not belong to category %', NEW.subtype, NEW.category;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_properties_check_subtype ON properties;
CREATE TRIGGER trg_properties_check_subtype
  BEFORE INSERT OR UPDATE OF subtype, category ON properties
  FOR EACH ROW EXECUTE FUNCTION properties_check_subtype();

-- Denormalise amenities into properties.amenity_slugs
CREATE OR REPLACE FUNCTION sync_property_amenity_slugs() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE pid uuid := COALESCE(NEW.property_id, OLD.property_id);
BEGIN
  UPDATE properties SET amenity_slugs = COALESCE((
    SELECT array_agg(pa.amenity_slug ORDER BY a.sort_order, a.slug)
    FROM property_amenities pa JOIN amenities a ON a.slug = pa.amenity_slug
    WHERE pa.property_id = pid
  ), '{}')
  WHERE id = pid;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_property_amenities_sync ON property_amenities;
CREATE TRIGGER trg_property_amenities_sync
  AFTER INSERT OR UPDATE OR DELETE ON property_amenities
  FOR EACH ROW EXECUTE FUNCTION sync_property_amenity_slugs();

-- Renaming a city / locality / builder refreshes dependent search_text
CREATE OR REPLACE FUNCTION refresh_property_search_text() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    IF TG_TABLE_NAME = 'cities' THEN
      UPDATE properties SET title = title WHERE city_id = NEW.id;
    ELSIF TG_TABLE_NAME = 'localities' THEN
      UPDATE properties SET title = title WHERE locality_id = NEW.id;
    ELSIF TG_TABLE_NAME = 'builders' THEN
      UPDATE properties SET title = title WHERE builder_id = NEW.id;
    END IF;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_cities_search ON cities;
CREATE TRIGGER trg_cities_search AFTER UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION refresh_property_search_text();
DROP TRIGGER IF EXISTS trg_localities_search ON localities;
CREATE TRIGGER trg_localities_search AFTER UPDATE ON localities FOR EACH ROW EXECUTE FUNCTION refresh_property_search_text();
DROP TRIGGER IF EXISTS trg_builders_search ON builders;
CREATE TRIGGER trg_builders_search AFTER UPDATE ON builders FOR EACH ROW EXECUTE FUNCTION refresh_property_search_text();
