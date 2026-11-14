/*
  # DEVELOPMENT SEED - sample listings so the search page has something to show.

  Run on a local / staging database only:
      supabase db reset        (applies migrations, then this file)
  or  psql "$DATABASE_URL" -f supabase/seed.sql

  Never run against production: it inserts fictional projects. Idempotent (ON CONFLICT DO NOTHING).
*/

INSERT INTO builders (slug, name, description, established_year) VALUES
  ('malles-constructions', 'Malles Constructions', 'Chennai based developer focused on premium residential projects.', 1998),
  ('harmony-builders',     'Harmony Builders',     'Boutique developer of villas and gated layouts on ECR and OMR.',     2005),
  ('skyline-developers',   'Skyline Developers',   'Mid-segment apartments and commercial towers across Bengaluru.',      2010)
ON CONFLICT (slug) DO NOTHING;

CREATE OR REPLACE FUNCTION pg_temp.seed_property(
  p_slug text, p_title text, p_category property_category, p_subtype text,
  p_city text, p_locality text, p_builder text,
  p_price bigint, p_price_max bigint, p_area_min int, p_area_max int,
  p_bedrooms int, p_bathrooms int, p_possession possession_status, p_furnishing furnishing_status,
  p_facing facing_direction, p_parking int, p_floor int, p_total_floors int, p_age int,
  p_rera text, p_cmda boolean, p_dtcp boolean, p_gated boolean, p_corner boolean,
  p_featured boolean, p_exclusive boolean, p_amenities text[], p_description text
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_city uuid; v_loc uuid; v_builder uuid; v_id uuid; v_a text;
BEGIN
  SELECT id INTO v_city FROM cities WHERE slug = p_city;
  SELECT id INTO v_loc  FROM localities WHERE city_id = v_city AND slug = slugify(p_locality);
  SELECT id INTO v_builder FROM builders WHERE slug = p_builder;
  IF v_loc IS NULL THEN RAISE EXCEPTION 'unknown locality % in %', p_locality, p_city; END IF;

  INSERT INTO properties (
    slug, title, description, category, subtype, city_id, locality_id, builder_id,
    price_min, price_max, area_min_sqft, area_max_sqft, bedrooms, bathrooms,
    possession, furnishing, facing, parking_slots, floor_number, total_floors, age_years,
    rera_id, cmda_approved, dtcp_approved, gated_community, is_corner,
    cover_image_url, featured, exclusive
  ) VALUES (
    p_slug, p_title, p_description, p_category, p_subtype, v_city, v_loc, v_builder,
    p_price, p_price_max, p_area_min, p_area_max, p_bedrooms, p_bathrooms,
    p_possession, p_furnishing, p_facing, p_parking, p_floor, p_total_floors, p_age,
    p_rera, p_cmda, p_dtcp, p_gated, p_corner,
    '/images/placeholder-property.svg', p_featured, p_exclusive
  ) ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL THEN
    FOREACH v_a IN ARRAY p_amenities LOOP
      INSERT INTO property_amenities (property_id, amenity_slug) VALUES (v_id, v_a) ON CONFLICT DO NOTHING;
    END LOOP;
    INSERT INTO property_images (property_id, url, sort_order) VALUES
      (v_id, '/images/placeholder-property.svg', 1),
      (v_id, '/images/placeholder-property.svg', 2);
    IF p_bedrooms IS NOT NULL THEN
      INSERT INTO property_configurations (property_id, bhk, area_sqft, price, status, sort_order)
      VALUES (v_id, p_bedrooms, p_area_min, p_price, NULL, 1);
    END IF;
  END IF;
END $$;

/* args: slug, title, category, subtype, city, locality, builder, price, price_max, area_min, area_max,
         beds, baths, possession, furnishing, facing, parking, floor, total_floors, age,
         rera, cmda, dtcp, gated, corner, featured, exclusive, amenities, description */

-- Flats & apartments
SELECT pg_temp.seed_property('malles-harmony-velachery','Malles Harmony','flat-apartment','apartment','chennai','Velachery','malles-constructions',
  8500000,9800000,1050,1250,2,2,'ready-to-move','semi-furnished','east',1,6,12,1,'TN/29/Building/0101/2024',true,false,true,false,true,false,
  ARRAY['gym','lift','security','power-backup','clubhouse','cctv'],'Well-connected 2 BHK homes minutes from Velachery MRTS.');
SELECT pg_temp.seed_property('skyline-oasis-omr','Skyline Oasis','flat-apartment','apartment','chennai','Sholinganallur','skyline-developers',
  6200000,8800000,780,1180,2,2,'under-construction','unfurnished','north-east',1,NULL,18,0,'TN/29/Building/0202/2025',true,false,true,false,true,true,
  ARRAY['gym','swimming-pool','lift','security','park-garden','children-play-area'],'IT corridor living with a 40,000 sq.ft. podium garden.');
SELECT pg_temp.seed_property('harmony-heights-porur','Harmony Heights','flat-apartment','apartment','chennai','Porur','harmony-builders',
  12500000,15500000,1450,1780,3,3,'ready-to-move','fully-furnished','south',2,9,14,2,'TN/29/Building/0303/2023',true,false,true,false,false,false,
  ARRAY['gym','swimming-pool','lift','security','power-backup','clubhouse','cctv','park-garden'],'Spacious 3 BHK residences with two covered parking slots.');
SELECT pg_temp.seed_property('compact-studio-perungudi','Studio Nest','flat-apartment','studio','chennai','Perungudi','skyline-developers',
  3400000,3900000,420,520,1,1,'under-construction','fully-furnished','west',0,NULL,10,0,'TN/29/Building/0404/2025',true,false,false,false,false,false,
  ARRAY['lift','security','cctv'],'Smartly planned studios for first-time buyers.');
SELECT pg_temp.seed_property('whitefield-grand-residences','Grand Residences Whitefield','flat-apartment','apartment','bengaluru','Whitefield','skyline-developers',
  18500000,24500000,1650,2250,3,3,'under-construction','semi-furnished','north',2,NULL,22,0,'PRM/KA/RERA/1251/309/PR/0505',false,false,true,false,true,true,
  ARRAY['gym','swimming-pool','lift','security','power-backup','clubhouse','park-garden','cctv','children-play-area'],'Luxury 3 and 4 BHK towers beside the Whitefield metro.');
SELECT pg_temp.seed_property('electronic-city-greens','Greens Electronic City','flat-apartment','apartment','bengaluru','Electronic City','harmony-builders',
  5400000,7200000,820,1150,2,2,'ready-to-move','unfurnished','east',1,4,9,3,'PRM/KA/RERA/1251/309/PR/0606',false,false,true,false,false,false,
  ARRAY['gym','lift','security','park-garden'],'Ready-to-move 2 BHKs close to Infosys campus.');

-- Independent villas
SELECT pg_temp.seed_property('ecr-sea-breeze-villas','Sea Breeze Villas','independent-villa','villa','chennai','ECR','harmony-builders',
  32500000,41000000,2800,3600,4,4,'ready-to-move','fully-furnished','east',3,NULL,2,1,'TN/29/Building/0707/2024',false,true,true,false,true,true,
  ARRAY['swimming-pool','security','power-backup','park-garden','clubhouse','cctv'],'Gated beachside villas with private pools.');
SELECT pg_temp.seed_property('navalur-row-houses','Navalur Row Homes','independent-villa','row-house','chennai','Navalur','malles-constructions',
  9800000,11500000,1500,1800,3,3,'under-construction','unfurnished','north',1,NULL,2,0,'TN/29/Building/0808/2025',false,true,true,false,false,false,
  ARRAY['security','park-garden','children-play-area','cctv'],'Row houses in a gated community on OMR.');
SELECT pg_temp.seed_property('guduvanchery-duplex-villas','Guduvanchery Duplex Villas','independent-villa','duplex-villa','chennai','Guduvanchery','harmony-builders',
  7600000,8900000,1650,1900,3,3,'ready-to-move','semi-furnished','south-east',2,NULL,2,2,'TN/29/Building/0909/2023',false,true,false,false,false,false,
  ARRAY['security','power-backup','park-garden'],'Duplex villas a short drive from Guduvanchery railway station.');
SELECT pg_temp.seed_property('sarjapur-premium-villas','Sarjapur Premium Villas','independent-villa','villa','bengaluru','Sarjapur Road','skyline-developers',
  45000000,62000000,3200,4200,4,5,'ready-to-move','fully-furnished','north-east',3,NULL,3,1,'PRM/KA/RERA/1251/309/PR/1010',false,false,true,false,true,false,
  ARRAY['swimming-pool','gym','security','clubhouse','park-garden','power-backup','cctv'],'Luxury villas in a 30-acre gated enclave.');

-- Residential plots
SELECT pg_temp.seed_property('kelambakkam-green-layout','Green Valley Plots','residential-plot','plot','chennai','Kelambakkam','malles-constructions',
  2800000,4200000,1200,1800,NULL,NULL,'ready-to-build',NULL,'east',0,NULL,NULL,0,'TN/29/Layout/1111/2024',false,true,true,true,true,false,
  ARRAY['security','park-garden','cctv','power-backup'],'DTCP approved gated layout with 30 ft roads.');
SELECT pg_temp.seed_property('potheri-cmda-plots','Potheri CMDA Plots','residential-plot','plot','chennai','Potheri','harmony-builders',
  3600000,5200000,1500,2200,NULL,NULL,'ready-to-build',NULL,'north',0,NULL,NULL,0,NULL,true,true,false,false,false,false,
  ARRAY['security','park-garden'],'CMDA and DTCP approved plots near SRM University.');
SELECT pg_temp.seed_property('tambaram-corner-plot','Tambaram Corner Plot','residential-plot','plot','chennai','Tambaram','malles-constructions',
  9500000,NULL,2400,2400,NULL,NULL,'ready-to-move',NULL,'north-east',0,NULL,NULL,0,NULL,true,false,false,true,false,true,
  ARRAY['security'],'East-facing corner plot in a well developed neighbourhood.');
SELECT pg_temp.seed_property('hebbal-premium-plots','Hebbal Lakeside Plots','residential-plot','plot','bengaluru','Hebbal','skyline-developers',
  21000000,32000000,2400,3600,NULL,NULL,'ready-to-build',NULL,'east',0,NULL,NULL,0,'PRM/KA/RERA/1251/309/PR/1212',false,false,true,false,true,false,
  ARRAY['security','park-garden','cctv'],'BDA approved plots with lake views.');

-- Commercial spaces
SELECT pg_temp.seed_property('omr-tech-park-offices','OMR Tech Park Offices','commercial-space','office','chennai','Thoraipakkam','skyline-developers',
  14500000,38000000,1200,3200,NULL,NULL,'ready-to-move',NULL,'east',6,NULL,12,2,'TN/29/Building/1313/2022',true,false,false,false,true,false,
  ARRAY['lift','security','power-backup','cctv'],'Grade-A office floors with Metro connectivity.');
SELECT pg_temp.seed_property('t-nagar-retail-showrooms','T Nagar Retail Showrooms','commercial-space','retail','chennai','T Nagar','malles-constructions',
  27500000,52000000,800,1900,NULL,NULL,'under-construction',NULL,'south',2,NULL,6,0,'TN/29/Building/1414/2025',true,false,false,false,false,false,
  ARRAY['lift','security','cctv','power-backup'],'High-street showrooms in Chennai''s busiest shopping district.');
SELECT pg_temp.seed_property('whitefield-coworking-hub','Whitefield Co-working Hub','commercial-space','coworking','bengaluru','Whitefield','skyline-developers',
  16500000,28000000,1500,2800,NULL,NULL,'ready-to-move',NULL,'north',4,NULL,8,1,'PRM/KA/RERA/1251/309/PR/1515',false,false,false,false,false,false,
  ARRAY['lift','security','power-backup','cctv'],'Plug-and-play co-working floors in the ITPL belt.');
SELECT pg_temp.seed_property('vandalur-warehouse','Vandalur Logistics Warehouse','commercial-space','warehouse','chennai','Vandalur','harmony-builders',
  48000000,NULL,12000,12000,NULL,NULL,'ready-to-move',NULL,'west',10,NULL,1,4,NULL,false,true,false,false,false,false,
  ARRAY['security','power-backup','cctv'],'Dock-height warehouse next to the Outer Ring Road.');

-- extra unit configurations so the BHK filter has multi-BHK projects to find
DO $$
DECLARE v uuid;
BEGIN
  SELECT id INTO v FROM properties WHERE slug = 'skyline-oasis-omr';
  IF v IS NOT NULL AND NOT EXISTS (SELECT 1 FROM property_configurations WHERE property_id = v AND bhk = 3) THEN
    INSERT INTO property_configurations (property_id, bhk, area_sqft, price, sort_order) VALUES (v, 3, 1180, 8800000, 2);
  END IF;
  SELECT id INTO v FROM properties WHERE slug = 'whitefield-grand-residences';
  IF v IS NOT NULL AND NOT EXISTS (SELECT 1 FROM property_configurations WHERE property_id = v AND bhk = 4) THEN
    INSERT INTO property_configurations (property_id, bhk, area_sqft, price, sort_order) VALUES (v, 4, 2250, 24500000, 2);
  END IF;
END $$;
