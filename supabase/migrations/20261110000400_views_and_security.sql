/*
  # Read views, leads, and Row Level Security

  property_cards    flat, list-page shape (what /properties and the home page read)
  property_details  property_cards + gallery / amenity labels / nearby / floor plans / configurations

  Views expose BOTH the new vocabulary (category, possession, price_per_sqft, ...) and the
  display fields the UI components already render (property_type, status, price, area_sqft,
  builder, image_url, ...), so UI code never needs to join anything.

  Security model
    - public (anon + authenticated): read-only, published rows only
    - writes: service role only (server API routes). The old policies that let anyone
      INSERT / UPDATE / DELETE listings from the browser are gone.
*/

CREATE OR REPLACE VIEW property_cards WITH (security_invoker = true) AS
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
  p.bathrooms,
  p.possession,
  CASE p.possession
    WHEN 'ready-to-move'      THEN 'Ready to Move'
    WHEN 'under-construction' THEN 'Under Construction'
    WHEN 'ready-to-build'     THEN 'Ready to Build'
  END                                   AS status,
  p.furnishing,
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

CREATE OR REPLACE VIEW property_details WITH (security_invoker = true) AS
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

/* ------------------------------- Leads --------------------------------- */

CREATE TABLE IF NOT EXISTS leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        lead_kind NOT NULL,
  name        text NOT NULL,
  phone       text,
  email       text,
  message     text,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_url  text,
  status      text NOT NULL DEFAULT 'new',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_kind_created ON leads (kind, created_at DESC);

/* --------------------------------- RLS --------------------------------- */

ALTER TABLE cities                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE corridors               ENABLE ROW LEVEL SECURITY;
ALTER TABLE localities              ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_subtypes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities               ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties              ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_floor_plans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_nearby         ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                   ENABLE ROW LEVEL SECURITY;   -- no policies: service role only

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['cities','corridors','localities','property_subtypes','amenities'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "public_read" ON %I', t);
    EXECUTE format('CREATE POLICY "public_read" ON %I FOR SELECT TO anon, authenticated USING (true)', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "public_read" ON builders;
CREATE POLICY "public_read" ON builders FOR SELECT TO anon, authenticated USING (is_active);

DROP POLICY IF EXISTS "public_read" ON properties;
CREATE POLICY "public_read" ON properties FOR SELECT TO anon, authenticated
  USING (publish_status = 'published');

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['property_images','property_amenities','property_configurations',
                           'property_floor_plans','property_nearby'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "public_read" ON %I', t);
    EXECUTE format($f$CREATE POLICY "public_read" ON %I FOR SELECT TO anon, authenticated
      USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = %I.property_id AND p.publish_status = 'published'))$f$, t, t);
  END LOOP;
END $$;

/* ------------------------------- Grants -------------------------------- */

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON
      cities, corridors, localities, builders, property_subtypes, amenities,
      properties, property_images, property_amenities, property_configurations,
      property_floor_plans, property_nearby, property_cards, property_details, leads
    FROM anon, authenticated;
    GRANT SELECT ON
      cities, corridors, localities, builders, property_subtypes, amenities,
      properties, property_images, property_amenities, property_configurations,
      property_floor_plans, property_nearby, property_cards, property_details
    TO anon, authenticated;
  END IF;
END $$;
