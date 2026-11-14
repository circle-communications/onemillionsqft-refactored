/*
  # Migrate rows from `properties_legacy` into the normalized schema

  - Idempotent: rows whose id or slug already exist in `properties` are skipped.
  - Tolerant: reads legacy columns through to_jsonb(row), so it works whichever generation of
    the legacy table is deployed (area_sqft OR min/max_area_sqft, description OR
    project_description, builder OR builder_name, optional jsonb columns, ...).
  - Buy-only: legacy rows with listing_type = 'Rent' are NOT migrated (they stay in
    properties_legacy). Drop that table once you've verified the migration:
        DROP TABLE properties_legacy;
*/

DO $$
DECLARE
  l            record;
  j            jsonb;
  v_type       text;
  v_cat        property_category;
  v_sub        text;
  v_poss_src   text;
  v_poss       possession_status;
  v_furn_src   text;
  v_furn       furnishing_status;
  v_face_src   text;
  v_face       facing_direction;
  v_city_name  text;
  v_city       uuid;
  v_loc_name   text;
  v_loc        uuid;
  v_builder_nm text;
  v_builder    uuid;
  v_price      numeric;
  v_amin       integer;
  v_amax       integer;
  v_homes      boolean;
  v_label      text;
  v_item       jsonb;
  v_ord        integer;
  n_migrated   integer := 0;
  n_rent       integer := 0;
  n_skipped    integer := 0;
BEGIN
  IF to_regclass('public.properties_legacy') IS NULL THEN
    RETURN;
  END IF;

  FOR l IN SELECT * FROM properties_legacy ORDER BY created_at NULLS LAST LOOP
    j := to_jsonb(l);

    IF lower(coalesce(j->>'listing_type', 'buy')) = 'rent' THEN
      n_rent := n_rent + 1;
      CONTINUE;
    END IF;

    IF EXISTS (SELECT 1 FROM properties p WHERE p.id = (j->>'id')::uuid OR p.slug = j->>'slug') THEN
      n_skipped := n_skipped + 1;
      CONTINUE;
    END IF;

    v_price := nullif(j->>'price', '')::numeric;
    IF v_price IS NULL OR v_price <= 0 THEN
      RAISE NOTICE 'legacy row % skipped: missing price', j->>'slug';
      n_skipped := n_skipped + 1;
      CONTINUE;
    END IF;

    /* ---- category / subtype ---- */
    v_type := lower(coalesce(j->>'property_type', ''));
    v_cat := CASE
      WHEN v_type ~ 'plot|land'                                       THEN 'residential-plot'
      WHEN v_type ~ 'commercial|office|shop|retail|warehouse|showroom|cowork'
                                                                      THEN 'commercial-space'
      WHEN v_type ~ 'villa|house' AND v_type !~ 'penthouse'           THEN 'independent-villa'
      ELSE 'flat-apartment'
    END;
    v_sub := CASE v_cat
      WHEN 'residential-plot' THEN 'plot'
      WHEN 'flat-apartment'   THEN 'apartment'
      WHEN 'independent-villa' THEN CASE WHEN v_type ~ 'row' THEN 'row-house'
                                         WHEN v_type ~ 'duplex' THEN 'duplex-villa'
                                         ELSE 'villa' END
      WHEN 'commercial-space' THEN CASE WHEN v_type ~ 'cowork' THEN 'coworking'
                                        WHEN v_type ~ 'warehouse' THEN 'warehouse'
                                        WHEN v_type ~ 'shop|retail|showroom' THEN 'retail'
                                        WHEN v_type ~ 'office' THEN 'office'
                                        ELSE NULL END
    END;
    v_homes := v_cat IN ('flat-apartment', 'independent-villa');

    /* ---- possession / furnishing / facing ---- */
    v_poss_src := lower(coalesce(j->>'possession', j->>'status', ''));
    v_poss := CASE
      WHEN v_poss_src ~ 'under'                          THEN 'under-construction'
      WHEN v_poss_src ~ 'build|construct' AND v_cat = 'residential-plot' THEN 'ready-to-build'
      ELSE 'ready-to-move'
    END;

    v_furn_src := lower(coalesce(j->>'furnishing', ''));
    v_furn := CASE
      WHEN v_furn_src = ''           THEN NULL
      WHEN v_furn_src ~ 'unfurn'     THEN 'unfurnished'
      WHEN v_furn_src ~ 'semi'       THEN 'semi-furnished'
      WHEN v_furn_src ~ 'full'       THEN 'fully-furnished'
      ELSE NULL
    END;
    IF NOT v_homes THEN v_furn := NULL; END IF;

    v_face_src := regexp_replace(lower(coalesce(j->>'facing', '')), '[\s_]+', '-', 'g');
    v_face := CASE WHEN v_face_src = ANY (enum_range(NULL::facing_direction)::text[])
                   THEN v_face_src::facing_direction END;

    /* ---- areas ---- */
    v_amin := greatest(coalesce(nullif(j->>'min_area_sqft', '')::integer,
                                nullif(j->>'area_sqft', '')::integer, 1), 1);
    v_amax := greatest(coalesce(nullif(j->>'max_area_sqft', '')::integer, v_amin), v_amin);

    /* ---- reference rows ---- */
    v_city_name := coalesce(nullif(trim(j->>'city'), ''), 'Chennai');
    INSERT INTO cities (slug, name) VALUES (slugify(v_city_name), v_city_name)
      ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
      RETURNING id INTO v_city;

    v_loc_name := coalesce(nullif(trim(j->>'locality'), ''), 'Other');
    INSERT INTO localities (city_id, slug, name) VALUES (v_city, slugify(v_loc_name), v_loc_name)
      ON CONFLICT (city_id, slug) DO UPDATE SET slug = EXCLUDED.slug
      RETURNING id INTO v_loc;

    v_builder_nm := nullif(trim(coalesce(j->>'builder_name', j->>'builder', '')), '');
    v_builder := NULL;
    IF v_builder_nm IS NOT NULL THEN
      INSERT INTO builders (slug, name, logo_url, description)
      VALUES (slugify(v_builder_nm), v_builder_nm,
              nullif(j->>'builder_logo', ''), nullif(j->>'builder_description', ''))
      ON CONFLICT (slug) DO UPDATE
        SET logo_url    = coalesce(builders.logo_url, EXCLUDED.logo_url),
            description = coalesce(builders.description, EXCLUDED.description)
      RETURNING id INTO v_builder;
    END IF;

    /* ---- the property ---- */
    INSERT INTO properties (
      id, slug, title, description, category, subtype, city_id, locality_id, builder_id,
      price_min, area_min_sqft, area_max_sqft, bedrooms, bathrooms,
      possession, furnishing, facing, parking_slots, floor_number, total_floors, age_years,
      rera_id, cmda_approved, dtcp_approved, gated_community,
      cover_image_url, featured, exclusive, publish_status, created_at
    ) VALUES (
      (j->>'id')::uuid, j->>'slug', j->>'title',
      coalesce(j->>'project_description', j->>'description'),
      v_cat, v_sub, v_city, v_loc, v_builder,
      v_price, v_amin, v_amax,
      CASE WHEN v_homes THEN nullif(j->>'bedrooms', '')::smallint END,
      CASE WHEN v_homes THEN nullif(j->>'bathrooms', '')::smallint END,
      v_poss, v_furn, v_face,
      CASE WHEN j->>'parking' ~ '^\d+$' THEN (j->>'parking')::smallint ELSE 0 END,
      nullif(j->>'floor_number', '')::smallint,
      nullif(j->>'total_floors', '')::smallint,
      CASE WHEN j->>'age_years' ~ '^\d+$' THEN (j->>'age_years')::smallint ELSE 0 END,
      nullif(j->>'rera_id', ''),
      coalesce((j->>'cmda_approved')::boolean, false),
      coalesce((j->>'dtcp_approved')::boolean, false),
      coalesce((j->>'gated_community')::boolean, false),
      coalesce(nullif(j->>'image_url', ''), '/images/placeholder-property.svg'),
      coalesce((j->>'featured')::boolean, false),
      coalesce((j->>'exclusive')::boolean, false),
      'published',
      coalesce((j->>'created_at')::timestamptz, now())
    );

    /* ---- gallery ---- */
    IF jsonb_typeof(j->'gallery') = 'array' THEN
      INSERT INTO property_images (property_id, url, sort_order)
      SELECT (j->>'id')::uuid, g.url, g.ord::integer
      FROM jsonb_array_elements_text(j->'gallery') WITH ORDINALITY AS g(url, ord)
      WHERE g.url <> '';
    END IF;

    /* ---- amenities (unknown labels become new amenity rows, nothing is lost) ---- */
    IF jsonb_typeof(j->'amenities') = 'array' THEN
      FOR v_label IN SELECT jsonb_array_elements_text(j->'amenities') LOOP
        CONTINUE WHEN trim(v_label) = '';
        INSERT INTO amenities (slug, label, sort_order)
          VALUES (slugify(v_label), trim(v_label), 100)
          ON CONFLICT (slug) DO NOTHING;
        INSERT INTO property_amenities (property_id, amenity_slug)
          VALUES ((j->>'id')::uuid, slugify(v_label))
          ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;

    /* ---- nearby / floor plans / configurations (optional jsonb columns) ---- */
    IF jsonb_typeof(j->'nearby') = 'array' THEN
      v_ord := 0;
      FOR v_item IN SELECT * FROM jsonb_array_elements(j->'nearby') LOOP
        v_ord := v_ord + 1;
        IF jsonb_typeof(v_item) = 'string' THEN
          INSERT INTO property_nearby (property_id, name, sort_order)
            VALUES ((j->>'id')::uuid, v_item #>> '{}', v_ord);
        ELSIF v_item ? 'name' THEN
          INSERT INTO property_nearby (property_id, name, distance, type, sort_order)
            VALUES ((j->>'id')::uuid, v_item->>'name', v_item->>'distance', v_item->>'type', v_ord);
        END IF;
      END LOOP;
    END IF;

    IF jsonb_typeof(j->'floor_plans') = 'array' THEN
      v_ord := 0;
      FOR v_item IN SELECT * FROM jsonb_array_elements(j->'floor_plans') LOOP
        v_ord := v_ord + 1;
        CONTINUE WHEN nullif(v_item->>'bhk', '') IS NULL;
        INSERT INTO property_floor_plans (property_id, bhk, title, image_url, area_sqft, description, sort_order)
        VALUES ((j->>'id')::uuid, (v_item->>'bhk')::smallint, v_item->>'title', v_item->>'image_url',
                nullif(v_item->>'area_sqft', '')::integer, v_item->>'description', v_ord);
      END LOOP;
    END IF;

    IF jsonb_typeof(j->'configurations') = 'array' THEN
      v_ord := 0;
      FOR v_item IN SELECT * FROM jsonb_array_elements(j->'configurations') LOOP
        v_ord := v_ord + 1;
        CONTINUE WHEN nullif(v_item->>'bhk', '') IS NULL;
        INSERT INTO property_configurations (property_id, bhk, area_sqft, price, status, sort_order)
        VALUES ((j->>'id')::uuid, (v_item->>'bhk')::smallint,
                nullif(v_item->>'area_sqft', '')::integer, nullif(v_item->>'price', '')::numeric,
                v_item->>'status', v_ord);
      END LOOP;
    END IF;

    n_migrated := n_migrated + 1;
  END LOOP;

  RAISE NOTICE 'legacy migration: % migrated, % rent rows left in properties_legacy, % skipped',
    n_migrated, n_rent, n_skipped;
END $$;
