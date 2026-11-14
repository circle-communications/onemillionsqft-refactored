/*
  # Search read-model refinements

  1. Views are re-created (they hold no data, so this is safe) with two fixes:
       - `listing_type` ('Buy') is exposed so existing UI components keep working while the
         catalogue is buy-only. The column is derived, there is no listing_type in the schema.
       - `furnishing` is the human label ("Semi-Furnished") that UI components print;
         `furnishing_slug` is the filterable enum value ("semi-furnished").
  2. Extra composite indexes for the shapes the search page really issues
     (all-category search by city + price, sort by newest within a category).
  3. `properties.bhk_options` - every BHK a project offers (headline bedrooms + its configurations),
     maintained by triggers, GIN indexed. The BHK filter matches on this, so a project selling
     2 BHK and 3 BHK units is found by either filter.
  4. `property_filter_facets()` - one cheap round trip that returns how many published
     listings exist per category / city / locality, used by the filter panel to hide dead ends.
*/


/* ------------------------- BHK options (denormalised) ------------------------- */

ALTER TABLE properties ADD COLUMN IF NOT EXISTS bhk_options smallint[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION compute_bhk_options(p_property uuid, p_bedrooms smallint)
RETURNS smallint[]
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(array_agg(DISTINCT b ORDER BY b), '{}')::smallint[]
  FROM (
    SELECT p_bedrooms AS b WHERE p_bedrooms IS NOT NULL AND p_bedrooms > 0
    UNION
    SELECT k.bhk FROM property_configurations k WHERE k.property_id = p_property AND k.bhk > 0
  ) t
$$;

-- fold into the existing BEFORE trigger function: search_text + updated_at + bhk_options
CREATE OR REPLACE FUNCTION properties_before_write() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_city text; v_locality text; v_builder text; v_subtype text;
BEGIN
  SELECT name INTO v_city     FROM cities            WHERE id   = NEW.city_id;
  SELECT name INTO v_locality FROM localities        WHERE id   = NEW.locality_id;
  SELECT name INTO v_builder  FROM builders          WHERE id   = NEW.builder_id;
  SELECT label INTO v_subtype FROM property_subtypes WHERE slug = NEW.subtype;

  NEW.search_text := lower(concat_ws(' ',
    NEW.title, v_locality, v_city, v_builder, v_subtype, replace(NEW.category::text, '-', ' ')));
  NEW.bhk_options := compute_bhk_options(NEW.id, NEW.bedrooms);
  NEW.updated_at  := now();
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION sync_property_bhk_options() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE pid uuid := COALESCE(NEW.property_id, OLD.property_id);
BEGIN
  UPDATE properties p SET bhk_options = compute_bhk_options(p.id, p.bedrooms) WHERE p.id = pid;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_property_configurations_bhk ON property_configurations;
CREATE TRIGGER trg_property_configurations_bhk
  AFTER INSERT OR UPDATE OR DELETE ON property_configurations
  FOR EACH ROW EXECUTE FUNCTION sync_property_bhk_options();

-- backfill (fires the BEFORE trigger, which recomputes bhk_options)
UPDATE properties SET title = title;

CREATE INDEX IF NOT EXISTS idx_properties_bhk_options ON properties USING gin (bhk_options);

DROP VIEW IF EXISTS property_details;
DROP VIEW IF EXISTS property_cards;

CREATE VIEW property_cards WITH (security_invoker = true) AS
SELECT
  p.id,
  p.slug,
  p.title,
  p.description,
  p.category,
  CASE p.category
    WHEN 'flat-apartment'    THEN 'Flat / Apartment'
    WHEN 'independent-villa' THEN 'Independent Villa'
    WHEN 'residential-plot'  THEN 'Residential Plot'
    WHEN 'commercial-space'  THEN 'Commercial Space'
  END                                   AS property_type,
  p.subtype,
  'Buy'::text                           AS listing_type,
  c.slug                                AS city_slug,
  c.name                                AS city,
  l.slug                                AS locality_slug,
  l.name                                AS locality,
  cor.slug                              AS corridor,
  b.slug                                AS builder_slug,
  b.name                                AS builder,
  b.logo_url                            AS builder_logo,
  p.price_min                           AS price,
  p.price_max,
  p.price_per_sqft,
  p.area_min_sqft                       AS area_sqft,
  p.area_min_sqft,
  p.area_max_sqft,
  p.bedrooms,
  p.bhk_options,
  p.bathrooms,
  p.possession,
  CASE p.possession
    WHEN 'ready-to-move'      THEN 'Ready to Move'
    WHEN 'under-construction' THEN 'Under Construction'
    WHEN 'ready-to-build'     THEN 'Ready to Build'
  END                                   AS status,
  CASE p.furnishing
    WHEN 'unfurnished'     THEN 'Unfurnished'
    WHEN 'semi-furnished'  THEN 'Semi-Furnished'
    WHEN 'fully-furnished' THEN 'Fully Furnished'
  END                                   AS furnishing,
  p.furnishing                          AS furnishing_slug,
  p.facing,
  p.parking_slots                       AS parking,
  p.floor_number,
  p.total_floors,
  p.age_years,
  p.rera_id,
  (p.rera_id IS NOT NULL AND p.rera_id <> '') AS rera_registered,
  p.cmda_approved,
  p.dtcp_approved,
  p.gated_community,
  p.is_corner,
  p.cover_image_url                     AS image_url,
  p.featured,
  p.exclusive,
  p.amenity_slugs,
  p.search_text,
  p.created_at
FROM properties p
JOIN cities c      ON c.id = p.city_id
JOIN localities l  ON l.id = p.locality_id
LEFT JOIN corridors cor ON cor.id = l.corridor_id
LEFT JOIN builders b    ON b.id = p.builder_id
WHERE p.publish_status = 'published';

CREATE VIEW property_details WITH (security_invoker = true) AS
SELECT
  pc.*,
  COALESCE((
    SELECT array_agg(i.url ORDER BY i.sort_order, i.id)
    FROM property_images i WHERE i.property_id = pc.id
  ), '{}')::text[]                                        AS gallery,
  COALESCE((
    SELECT array_agg(a.label ORDER BY a.sort_order, a.slug)
    FROM property_amenities pa JOIN amenities a ON a.slug = pa.amenity_slug
    WHERE pa.property_id = pc.id
  ), '{}')::text[]                                        AS amenities,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object('name', n.name, 'distance', n.distance, 'type', n.type)
                     ORDER BY n.sort_order, n.id)
    FROM property_nearby n WHERE n.property_id = pc.id
  ), '[]'::jsonb)                                         AS nearby,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object('bhk', f.bhk, 'title', f.title, 'image_url', f.image_url,
                                        'area_sqft', f.area_sqft, 'description', f.description)
                     ORDER BY f.sort_order, f.id)
    FROM property_floor_plans f WHERE f.property_id = pc.id
  ), '[]'::jsonb)                                         AS floor_plans,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object('bhk', k.bhk, 'area_sqft', k.area_sqft,
                                        'price', k.price, 'status', k.status)
                     ORDER BY k.sort_order, k.bhk, k.id)
    FROM property_configurations k WHERE k.property_id = pc.id
  ), '[]'::jsonb)                                         AS configurations
FROM property_cards pc;

/* ------------------------------- Indexes ------------------------------- */

-- all-category search inside a city, ordered by price
CREATE INDEX IF NOT EXISTS idx_properties_city_price
  ON properties (city_id, price_min) WHERE publish_status = 'published';
-- "newest first" inside one category (the default sort of every category landing page)
CREATE INDEX IF NOT EXISTS idx_properties_category_created
  ON properties (category, created_at DESC) WHERE publish_status = 'published';
-- area range filter
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties (area_min_sqft, area_max_sqft);
-- bedroom filtering now goes through the bhk_options GIN index
DROP INDEX IF EXISTS idx_properties_bedrooms;

/* ------------------------------- Facets -------------------------------- */

CREATE OR REPLACE FUNCTION property_filter_facets()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER AS $$
  SELECT jsonb_build_object(
    'total',      (SELECT count(*) FROM property_cards),
    'categories', COALESCE((SELECT jsonb_object_agg(category, n)
                            FROM (SELECT category, count(*) AS n FROM property_cards GROUP BY category) t), '{}'::jsonb),
    'cities',     COALESCE((SELECT jsonb_object_agg(city_slug, n)
                            FROM (SELECT city_slug, count(*) AS n FROM property_cards GROUP BY city_slug) t), '{}'::jsonb),
    'localities', COALESCE((SELECT jsonb_object_agg(city_slug || '/' || locality_slug, n)
                            FROM (SELECT city_slug, locality_slug, count(*) AS n
                                  FROM property_cards GROUP BY city_slug, locality_slug) t), '{}'::jsonb),
    'builders',   (SELECT count(DISTINCT builder_slug) FROM property_cards WHERE builder_slug IS NOT NULL)
  )
$$;

/* ------------------------------- Grants -------------------------------- */

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT SELECT ON property_cards, property_details TO anon, authenticated;
    REVOKE ALL ON FUNCTION property_filter_facets() FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION property_filter_facets() TO anon, authenticated;
  END IF;
END $$;
